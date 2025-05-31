import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getUserFromToken, userHasClientAccess } from '@/lib/supabase';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';
import type { Client } from '@/types/models';

type ResponseData = {
  success: boolean;
  message?: string;
  clients?: Client[];
  client?: Client;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>): Promise<void> {
  const { method } = req;
  const user = (req as any).user;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, user);
      case 'POST':
        return handlePost(req, res, user);
      default:
        return res.status(405).json({ 
          success: false, 
          message: 'Method not allowed' 
        });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Clients API error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error',
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse<ResponseData>, user: any): Promise<void> {
  const { 
    search,
    industry,
    limit = 50, 
    offset = 0,
    sort_by = 'name',
    sort_order = 'asc',
    include_stats = false,
  } = req.query;

  try {
    // Get all clients the user created (based on schema using created_by)
    let query = supabase
      .from('clients')
      .select(`
        *,
        ${include_stats === 'true' ? `
          campaigns(count),
          assets(count),
          matrices(count)
        ` : ''}
      `)
      .eq('created_by', user.id);

    // Apply search filter
    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,industry.ilike.%${search}%`);
    }

    // Apply industry filter
    if (industry && typeof industry === 'string') {
      query = query.eq('industry', industry);
    }

    // Apply sorting
    const validSortFields = ['name', 'industry', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sort_by as string) ? sort_by as string : 'name';
    const ascending = sort_order === 'asc';
    query = query.order(sortField, { ascending });

    // Apply pagination
    const limitNum = Math.min(Number(limit) || 50, 100);
    const offsetNum = Number(offset) || 0;
    query = query.range(offsetNum, offsetNum + limitNum - 1);

    const { data: clients, error } = await query;

    if (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }

    // Transform clients to match expected format
    const transformedClients = clients?.map(client => ({
      id: client.id,
      name: client.name,
      slug: client.slug,
      industry: client.industry,
      description: client.description,
      website: client.website,
      logo: client.logo_url,
      primaryColor: client.primary_color,
      secondaryColor: client.secondary_color,
      socialMedia: client.social_media || {},
      brandGuidelines: client.brand_guidelines || {},
      isActive: client.is_active !== false,
      dateCreated: client.created_at,
      lastModified: client.updated_at,
      // Include stats if requested
      ...(include_stats === 'true' && {
        stats: {
          campaignCount: Array.isArray(client.campaigns) ? client.campaigns.length : 0,
          assetCount: Array.isArray(client.assets) ? client.assets.length : 0,
          matrixCount: Array.isArray(client.matrices) ? client.matrices.length : 0,
        }
      })
    })) || [];

    return res.json({
      success: true,
      clients: transformedClients,
      pagination: {
        total: clients?.length || 0,
        limit: limitNum,
        offset: offsetNum,
        hasMore: (clients?.length || 0) === limitNum
      }
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error in handleGet:', error);
    throw error;
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ResponseData>, user: any): Promise<void> {
  try {
    const {
      name,
      industry,
      description,
      website,
      logo,
      primaryColor,
      secondaryColor,
      socialMedia,
      brandGuidelines
    } = req.body;

    // Basic validation
    if (!name || !industry) {
      return res.status(400).json({
        success: false,
        message: 'Name and industry are required'
      });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Create client in Supabase
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        slug,
        industry,
        description: description || null,
        website: website || null,
        logo_url: logo || null,
        primary_color: primaryColor || '#1976d2',
        secondary_color: secondaryColor || '#dc004e',
        social_media: socialMedia || {},
        brand_guidelines: brandGuidelines || {
          voiceTone: '',
          targetAudience: '',
          keyMessages: []
        },
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    // Access is automatically granted through created_by relationship

    // Transform response
    const transformedClient: Client = {
      id: client.id,
      name: client.name,
      slug: client.slug,
      industry: client.industry,
      description: client.description,
      website: client.website,
      logo: client.logo_url,
      primaryColor: client.primary_color,
      secondaryColor: client.secondary_color,
      socialMedia: client.social_media || {},
      brandGuidelines: client.brand_guidelines || {},
      isActive: client.is_active,
      dateCreated: client.created_at,
      lastModified: client.updated_at,
    };

    return res.status(201).json({
      success: true,
      client: transformedClient,
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error in handlePost:', error);
    throw error;
  }
}

export default withAuth(withSecurityHeaders(handler));