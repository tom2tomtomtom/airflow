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
    // Get all clients the user has access to
    const { data: userClients, error: userError } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', user.id);

    if (userError) {
      console.error('Error fetching user clients:', userError);
      throw userError;
    }

    if (!userClients || userClients.length === 0) {
      return res.json({
        success: true,
        clients: [],
        pagination: {
          total: 0,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          hasMore: false
        }
      });
    }

    const clientIds = userClients.map(uc => uc.client_id);

    // Build query for clients
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
      .in('id', clientIds);

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
      industry: client.industry,
      description: client.description,
      website: client.website,
      logo: client.logo,
      primaryColor: client.primary_color || client.primaryColor,
      secondaryColor: client.secondary_color || client.secondaryColor,
      socialMedia: client.social_media || {},
      contacts: client.contacts || [],
      brandGuidelines: client.brand_guidelines || {},
      tenantId: client.tenant_id,
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
      contacts,
      brandGuidelines
    } = req.body;

    // Basic validation
    if (!name || !industry) {
      return res.status(400).json({
        success: false,
        message: 'Name and industry are required'
      });
    }

    // Create client in Supabase
    const { data: client, error } = await supabase
      .from('clients')
      .insert({
        name,
        industry,
        description: description || null,
        website: website || null,
        logo: logo || null,
        primary_color: primaryColor || '#1976d2',
        secondary_color: secondaryColor || '#dc004e',
        social_media: socialMedia || {},
        contacts: contacts || [],
        brand_guidelines: brandGuidelines || {},
        tenant_id: 'tenant-1', // Default tenant
        is_active: true,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
      throw error;
    }

    // Grant user access to the new client
    const { error: accessError } = await supabase
      .from('user_clients')
      .insert({
        user_id: user.id,
        client_id: client.id,
        role: 'admin',
        granted_by: user.id,
      });

    if (accessError) {
      console.error('Error granting client access:', accessError);
      // Don't fail the whole operation, just log the error
    }

    // Transform response
    const transformedClient: Client = {
      id: client.id,
      name: client.name,
      industry: client.industry,
      description: client.description,
      website: client.website,
      logo: client.logo,
      primaryColor: client.primary_color,
      secondaryColor: client.secondary_color,
      socialMedia: client.social_media || {},
      contacts: client.contacts || [],
      brandGuidelines: client.brand_guidelines || {},
      tenantId: client.tenant_id,
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