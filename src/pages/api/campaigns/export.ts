import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@/lib/supabase/server';
const supabase = createClient();
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import { getErrorMessage } from '@/utils/errorUtils';
import { z } from 'zod';

const ExportSchema = z.object({
  campaign_id: z.string().uuid(),
  format: z.enum(['json', 'csv', 'pdf', 'xlsx', 'platform_specific']),
  platform: z.enum(['youtube', 'instagram', 'tiktok', 'facebook', 'linkedin', 'twitter']).optional(),
  include_assets: z.boolean().default(true),
  include_videos: z.boolean().default(true),
});

async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;
  const user = (req as any).user;

  if (method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    return handleExport(req, res, user);
  } catch (error: any) {
    const message = getErrorMessage(error);
    console.error('Campaign Export API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? message : undefined
    });
  }
}

async function handleExport(req: NextApiRequest, res: NextApiResponse, user: any): Promise<void> {
  const validationResult = ExportSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: validationResult.error.issues
    });
  }

  const { campaign_id, format, platform, include_assets, include_videos } = validationResult.data;

  // Verify user has access to the campaign
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select(`
      *,
      clients(id, name),
      briefs(id, title, description),
      user_clients!inner(user_id)
    `)
    .eq('id', campaign_id)
    .eq('user_clients.user_id', user.id)
    .single();

  if (campaignError || !campaign) {
    return res.status(404).json({ error: 'Campaign not found or access denied' });
  }

  // Gather all campaign data
  const campaignData = await gatherCampaignData(campaign_id, include_assets, include_videos);

  // Generate export based on format
  const exportResult = await generateExport(campaignData, format, platform);

  return res.json({
    message: 'Export generated successfully',
    data: exportResult,
  });
}

async function gatherCampaignData(campaignId: string, includeAssets: boolean, includeVideos: boolean): Promise<any> {
  const data: any = {
    campaign: {},
    strategy: { motivations: [], copy_assets: [] },
    matrix: { combinations: [] },
    assets: [],
    videos: [],
  };

  // Get campaign details
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, clients(id, name), briefs(id, title, description)')
    .eq('id', campaignId)
    .single();

  data.campaign = campaign;

  // Get motivations
  if (campaign?.motivation_ids) {
    const { data: motivations } = await supabase
      .from('motivations')
      .select('*')
      .in('id', campaign.motivation_ids);
    
    if (data?.strategy) {
      data.strategy.motivations = motivations || [];
    }
  }

  // Get copy assets
  if (campaign?.copy_asset_ids) {
    const { data: copyAssets } = await supabase
      .from('copy_assets')
      .select('*')
      .in('id', campaign.copy_asset_ids);
    
    if (data?.strategy) {
      data.strategy.copy_assets = copyAssets || [];
    }
  }

  // Get matrix combinations
  if (campaign?.matrix_data) {
    if (data?.matrix) {
      data.matrix.combinations = campaign.matrix_data;
    }
  }

  // Get assets if requested
  if (includeAssets) {
    const { data: assets } = await supabase
      .from('assets')
      .select('*')
      .eq('client_id', campaign.client_id);
    
    data.assets = assets || [];
  }

  // Get generated videos if requested
  if (includeVideos) {
    const { data: videos } = await supabase
      .from('video_generations')
      .select('*')
      .eq('campaign_id', campaignId);
    
    data.videos = videos || [];
  }

  return data;
}

async function generateExport(data: any, format: string, platform?: string): Promise<any> {
  switch (format) {
    case 'json':
      return {
        format: 'json',
        content: JSON.stringify(data, null, 2),
        filename: `campaign-${data?.campaign?.name}-${Date.now()}.json`,
        mime_type: 'application/json',
      };

    case 'csv':
      return {
        format: 'csv',
        content: convertToCSV(data),
        filename: `campaign-${data?.campaign?.name}-${Date.now()}.csv`,
        mime_type: 'text/csv',
      };

    case 'platform_specific':
      return generatePlatformSpecificExport(data, platform);

    case 'pdf':
      return {
        format: 'pdf',
        content: null,
        filename: `campaign-${data?.campaign?.name}-${Date.now()}.pdf`,
        mime_type: 'application/pdf',
        error: 'PDF export not yet implemented',
      };

    case 'xlsx':
      return {
        format: 'xlsx',
        content: null,
        filename: `campaign-${data?.campaign?.name}-${Date.now()}.xlsx`,
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        error: 'Excel export not yet implemented',
      };

    default:
      throw new Error('Unsupported export format');
  }
}

function convertToCSV(data: any): string {
  const rows = [
    ['Type', 'Name', 'Description', 'Details'],
    ['Campaign', data?.campaign?.name, data?.campaign?.description || '', `Client: ${data?.campaign?.clients?.name}`],
    ['', '', '', ''],
    ['Motivations', '', '', ''],
  ];

  data?.strategy?.motivations.forEach((motivation: any) => {
    rows.push([
      'Motivation',
      motivation.title || '',
      motivation.description || '',
      `Score: ${motivation.relevance_score || 0}, Category: ${motivation.category || 'N/A'}`,
    ]);
  });

  rows.push(['', '', '', '']);
  rows.push(['Copy Assets', '', '', '']);

  data?.strategy?.copy_assets.forEach((copy: any) => {
    rows.push([
      'Copy',
      copy.platform || '',
      copy.headline || '',
      `Body: ${copy.body || ''}, CTA: ${copy.cta || ''}, Tone: ${copy.tone || ''}`,
    ]);
  });

  rows.push(['', '', '', '']);
  rows.push(['Matrix Combinations', '', '', '']);

  data?.matrix?.combinations.forEach((combo: any, index: number) => {
    rows.push([
      'Combination',
      combo.name || `Combination ${index + 1}`,
      '',
      JSON.stringify(combo.fields || {}),
    ]);
  });

  rows.push(['', '', '', '']);
  rows.push(['Generated Videos', '', '', '']);

  data?.videos?.forEach((video: any) => {
    rows.push([
      'Video',
      video.id || '',
      video.status || '',
      `Platform: ${video.config?.video_config?.platform || 'N/A'}, Duration: ${video.config?.video_config?.duration || 0}s`,
    ]);
  });

  return rows.map((row: any) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

function generatePlatformSpecificExport(data: any, platform?: string): any {
  if (!platform) {
    return {
      format: 'platform_specific',
      error: 'Platform not specified',
    };
  }

  const platformExports: Record<string, any> = {
    youtube: {
      title: data?.campaign?.name,
      description: data?.campaign?.description,
      tags: data?.strategy?.motivations.map((m: any) => m.category).filter(Boolean),
      thumbnails: data?.assets?.filter((a: any) => a.type === 'image').slice(0, 3),
      videos: data?.videos?.filter((v: any) => v.config?.video_config?.platform === 'youtube'),
    },
    instagram: {
      posts: data?.strategy?.copy_assets.filter((c: any) => c.platform === 'instagram'),
      stories: data?.videos?.filter((v: any) => v.config?.video_config?.aspect_ratio === '9:16'),
      hashtags: generateHashtags(data?.strategy?.motivations),
    },
    tiktok: {
      videos: data?.videos?.filter((v: any) => v.config?.video_config?.platform === 'tiktok'),
      captions: data?.strategy?.copy_assets.filter((c: any) => c.platform === 'tiktok'),
      effects: [],
    },
    facebook: {
      posts: data?.strategy?.copy_assets.filter((c: any) => c.platform === 'facebook'),
      ads: data?.matrix?.combinations,
      targeting: extractTargetingData(data?.strategy?.motivations),
    },
    linkedin: {
      posts: data?.strategy?.copy_assets.filter((c: any) => c.platform === 'linkedin'),
      articles: [],
      company_updates: data?.matrix?.combinations,
    },
    twitter: {
      tweets: data?.strategy?.copy_assets.filter((c: any) => c.platform === 'twitter'),
      threads: [],
      hashtags: generateHashtags(data?.strategy?.motivations),
    },
  };

  return {
    format: 'platform_specific',
    platform,
    content: JSON.stringify(platformExports[platform] || {}, null, 2),
    filename: `${platform}-export-${data?.campaign?.name}-${Date.now()}.json`,
    mime_type: 'application/json',
  };
}

function generateHashtags(motivations: any[]): string[] {
  const hashtags = new Set<string>();
  
  motivations.forEach((motivation: any) => {
    if (motivation.category) {
      hashtags.add(`#${motivation.category.toLowerCase().replace(/\s+/g, '')}`);
    }
    if (motivation.title) {
      const words = motivation.title.split(' ').filter((word: string) => word.length > 3);
      words.slice(0, 2).forEach((word: string) => {
        hashtags.add(`#${word.toLowerCase()}`);
      });
    }
  });

  return Array.from(hashtags).slice(0, 10);
}

function extractTargetingData(motivations: any[]): any {
  return {
    demographics: motivations.map((m: any) => m.category).filter(Boolean),
    interests: motivations.map((m: any) => m.title).filter(Boolean),
    behaviors: [],
  };
}

export default withAuth(withSecurityHeaders(handler));