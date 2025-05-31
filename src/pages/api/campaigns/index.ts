import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import { z } from 'zod';

const CampaignCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  objective: z.string().min(1, 'Objective is required'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().min(0).optional(),
  targeting: z.any().default({}),
  platforms: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  client_id: z.string().uuid('Invalid client ID'),
  brief_id: z.string().uuid().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  campaign_type: z.enum(['awareness', 'consideration', 'conversion', 'retention', 'mixed']).default('awareness'),
  kpis: z.array(z.string()).default([]),
  creative_requirements: z.any().default({}),
});

const CampaignUpdateSchema = CampaignCreateSchema.partial().omit(['client_id']);

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const user = (req as any).user;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, user);
      case 'POST':
        return handlePost(req, res, user);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Campaigns API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  const { 
    client_id, 
    status,
    priority,
    campaign_type,
    platform,
    limit = 50, 
    offset = 0,
    search,
    sort_by = 'created_at',
    sort_order = 'desc',
    include_stats = false,
  } = req.query;

  let query = supabase
    .from('campaigns')
    .select(`
      *,
      clients(name, slug, primary_color),
      briefs(id, name),
      profiles!campaigns_created_by_fkey(full_name),
      matrices(count),
      executions(count)
    `)
    .order(sort_by as string, { ascending: sort_order === 'asc' });

  // Filter by client access for the user
  if (client_id) {
    query = query.eq('client_id', client_id);
  } else {
    // Get campaigns for all clients user has access to
    const { data: userClients } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id);
    
    if (userClients && userClients.length > 0) {
      const clientIds = userClients.map(uc => uc.client_id);
      query = query.in('client_id', clientIds);
    } else {
      // User has no client access
      return res.json({ data: [], count: 0 });
    }
  }

  // Additional filters
  if (status) {
    query = query.eq('status', status);
  }

  if (priority) {
    query = query.eq('priority', priority);
  }

  if (campaign_type) {
    query = query.eq('campaign_type', campaign_type);
  }

  if (platform) {
    query = query.contains('platforms', [platform]);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,objective.ilike.%${search}%`);
  }

  // Pagination
  query = query.range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching campaigns:', error);
    return res.status(500).json({ error: 'Failed to fetch campaigns' });
  }

  // Include campaign statistics if requested
  let enrichedData = data || [];
  if (include_stats === 'true') {
    enrichedData = await Promise.all((data || []).map(async (campaign) => {
      const stats = await getCampaignStats(campaign.id);
      return {
        ...campaign,
        stats,
      };
    }));
  }

  // Calculate portfolio statistics
  const portfolioStats = calculatePortfolioStats(data || []);

  return res.json({ 
    data: enrichedData,
    count,
    portfolio_stats: portfolioStats,
    pagination: {
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      total: count || 0
    }
  });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  const validationResult = CampaignCreateSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validationResult.error.issues
    });
  }

  const campaignData = validationResult.data;

  // Verify user has access to the client
  const { data: clientAccess } = await supabase
    .from('user_clients')
    .select('id')
    .eq('user_id', user.id)
    .eq('client_id', campaignData.client_id)
    .single();

  if (!clientAccess) {
    return res.status(403).json({ error: 'Access denied to this client' });
  }

  // If brief_id is provided, verify it belongs to the same client
  if (campaignData.brief_id) {
    const { data: brief } = await supabase
      .from('briefs')
      .select('client_id')
      .eq('id', campaignData.brief_id)
      .single();

    if (!brief || brief.client_id !== campaignData.client_id) {
      return res.status(400).json({ error: 'Brief does not belong to the specified client' });
    }
  }

  // Auto-generate campaign slug
  const slug = generateCampaignSlug(campaignData.name);

  // Create the campaign
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      ...campaignData,
      slug,
      status: 'draft',
      created_by: user.id,
      approval_status: 'pending',
    })
    .select(`
      *,
      clients(name, slug, primary_color),
      briefs(id, name),
      profiles!campaigns_created_by_fkey(full_name)
    `)
    .single();

  if (error) {
    console.error('Error creating campaign:', error);
    return res.status(500).json({ error: 'Failed to create campaign' });
  }

  // Initialize campaign analytics record
  await initializeCampaignAnalytics(campaign.id);

  return res.status(201).json({ data: campaign });
}

// Helper functions
async function getCampaignStats(campaignId: string): Promise<any> {
  try {
    // Get matrices count
    const { count: matricesCount } = await supabase
      .from('matrices')
      .select('id', { count: 'exact' })
      .eq('campaign_id', campaignId);

    // Get executions count and status breakdown
    const { data: executions } = await supabase
      .from('executions')
      .select('status')
      .eq('campaign_id', campaignId);

    const executionStats = executions?.reduce((acc, exec) => {
      acc[exec.status] = (acc[exec.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get campaign analytics summary
    const { data: analytics } = await supabase
      .from('campaign_analytics')
      .select('impressions, clicks, conversions, spend')
      .eq('campaign_id', campaignId);

    const analyticsTotal = analytics?.reduce((acc, record) => {
      acc.impressions += record.impressions || 0;
      acc.clicks += record.clicks || 0;
      acc.conversions += record.conversions || 0;
      acc.spend += parseFloat(record.spend) || 0;
      return acc;
    }, { impressions: 0, clicks: 0, conversions: 0, spend: 0 }) || {};

    return {
      matrices_count: matricesCount || 0,
      executions_count: executions?.length || 0,
      execution_status: executionStats,
      performance: {
        ...analyticsTotal,
        ctr: analyticsTotal.impressions > 0 ? (analyticsTotal.clicks / analyticsTotal.impressions) * 100 : 0,
        conversion_rate: analyticsTotal.clicks > 0 ? (analyticsTotal.conversions / analyticsTotal.clicks) * 100 : 0,
      }
    };
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error getting campaign stats:', error);
    return {
      matrices_count: 0,
      executions_count: 0,
      execution_status: {},
      performance: { impressions: 0, clicks: 0, conversions: 0, spend: 0, ctr: 0, conversion_rate: 0 }
    };
  }
}

function calculatePortfolioStats(campaigns: any[]): any {
  const statusCount = campaigns.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorityCount = campaigns.reduce((acc, campaign) => {
    acc[campaign.priority] = (acc[campaign.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeCount = campaigns.reduce((acc, campaign) => {
    acc[campaign.campaign_type] = (acc[campaign.campaign_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalBudget = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.spent || 0), 0);

  return {
    total_campaigns: campaigns.length,
    status_distribution: statusCount,
    priority_distribution: priorityCount,
    type_distribution: typeCount,
    budget_summary: {
      total_budget: totalBudget,
      total_spent: totalSpent,
      remaining_budget: totalBudget - totalSpent,
      utilization_rate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    }
  };
}

function generateCampaignSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 50);
}

async function initializeCampaignAnalytics(campaignId: string): Promise<void> {
  try {
    // Create initial analytics record for tracking
    await supabase
      .from('campaign_analytics')
      .insert({
        campaign_id: campaignId,
        platform: 'consolidated',
        date: new Date().toISOString().split('T')[0],
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        raw_data: {
          initialized: true,
          created_at: new Date().toISOString(),
        }
      });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error initializing campaign analytics:', error);
    // Don't throw error, as this is not critical for campaign creation
  }
}

export default withAuth(withSecurityHeaders(handler));