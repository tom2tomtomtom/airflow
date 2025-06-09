import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import { withAuth } from '@/middleware/withAuth';
import { withSecurityHeaders } from '@/middleware/withSecurityHeaders';

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'voice';
  url: string; // This will be mapped from file_url
  thumbnailUrl?: string;
  description?: string;
  tags: string[];
  dateCreated: string;
  clientId: string;
  userId: string;
  favorite?: boolean;
  metadata?: Record<string, any>;
  size?: number;
  mimeType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

type ResponseData = {
  success: boolean;
  message?: string;
  assets?: Asset[];
  asset?: Asset;
  total?: number;
  page?: number;
  limit?: number;
};

// Map database row to Asset interface (fixing schema mismatch)
function mapDatabaseRowToAsset(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    url: row.file_url, // Map file_url to url for frontend
    thumbnailUrl: row.thumbnail_url,
    description: row.description,
    tags: Array.isArray(row.tags) ? row.tags : [],
    dateCreated: row.created_at,
    clientId: row.client_id,
    userId: row.created_by,
    favorite: row.is_favorite || false,
    metadata: row.metadata || {},
    size: row.file_size,
    mimeType: row.mime_type,
    duration: row.duration,
    width: row.dimensions?.width,
    height: row.dimensions?.height,
  };
}

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  try {
    const user = (req as any).user;
    const userId = user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    switch (req.method) {
      case 'GET':
        return await getAssets(req, res, userId);
      case 'POST':
        return await createAsset(req, res, userId);
      case 'PUT':
        return await updateAsset(req, res, userId);
      case 'DELETE':
        return await deleteAsset(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Assets API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// GET - Fetch assets with proper schema mapping
async function getAssets(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
): Promise<void> {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      type = '',
      clientId = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build query with proper field selection
    let query = supabase
      .from('assets')
      .select(`
        id,
        name,
        type,
        file_url,
        thumbnail_url,
        description,
        tags,
        client_id,
        created_by,
        metadata,
        file_size,
        mime_type,
        duration,
        dimensions,
        created_at,
        updated_at
      `, { count: 'exact' });

    // Filter by client if provided
    if (clientId) {
      query = query.eq('client_id', clientId);
    } else {
      // Get all assets from clients the user has access to
      const { data: userClients } = await supabase
        .from('user_clients')
        .select('client_id')
        .eq('user_id', userId);

      if (userClients && userClients.length > 0) {
        const clientIds = userClients.map(uc => uc.client_id);
        query = query.in('client_id', clientIds);
      } else {
        // User has no clients, return empty result
        return res.status(200).json({
          success: true,
          assets: [],
          total: 0,
          page: pageNum,
          limit: limitNum
        });
      }
    }

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Apply sorting
    const ascending = sortOrder === 'asc';
    query = query.order(sortBy as string, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error fetching assets:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch assets'
      });
    }

    // Map database rows to Asset interface
    const assets = (data || []).map(mapDatabaseRowToAsset);

    return res.status(200).json({
      success: true,
      assets,
      total: count || 0,
      page: pageNum,
      limit: limitNum
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Get assets error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch assets'
    });
  }
}

// POST - Create a new asset with proper field mapping
async function createAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
): Promise<void> {
  try {
    const { 
      name, type, url, thumbnailUrl, description, tags, clientId,
      metadata, size, mimeType, duration, width, height 
    } = req.body;

    // Validate required fields
    if (!name || !type || !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, type, and URL are required' 
      });
    }

    // Validate asset type
    if (!['image', 'video', 'text', 'voice'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be one of: image, video, text, voice' 
      });
    }

    // Prepare data for database (map to correct field names)
    const assetData = {
      name,
      type,
      file_url: url, // Map url to file_url for database
      thumbnail_url: thumbnailUrl,
      description,
      tags: Array.isArray(tags) ? tags : [],
      client_id: clientId,
      created_by: userId,
      metadata: metadata || {},
      file_size: size,
      mime_type: mimeType,
      duration,
      dimensions: width && height ? { width, height } : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('assets')
      .insert(assetData)
      .select(`
        id,
        name,
        type,
        file_url,
        thumbnail_url,
        description,
        tags,
        client_id,
        created_by,
        metadata,
        file_size,
        mime_type,
        duration,
        dimensions,
        created_at
      `)
      .single();

    if (error) {
      console.error('Database error creating asset:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create asset'
      });
    }

    // Map database row to Asset interface
    const asset = mapDatabaseRowToAsset(data);

    return res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      asset
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Create asset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create asset'
    });
  }
}

// PUT - Update an asset
async function updateAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
): Promise<void> {
  try {
    const { id } = req.query;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    // Map frontend fields to database fields
    const dbUpdates: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.name) dbUpdates.name = updates.name;
    if (updates.type) dbUpdates.type = updates.type;
    if (updates.url) dbUpdates.file_url = updates.url; // Map url to file_url
    if (updates.thumbnailUrl) dbUpdates.thumbnail_url = updates.thumbnailUrl;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.tags) dbUpdates.tags = Array.isArray(updates.tags) ? updates.tags : [];
    if (updates.metadata) dbUpdates.metadata = updates.metadata;

    const { data, error } = await supabase
      .from('assets')
      .update(dbUpdates)
      .eq('id', id)
      .eq('created_by', userId) // Ensure user owns the asset
      .select(`
        id,
        name,
        type,
        file_url,
        thumbnail_url,
        description,
        tags,
        client_id,
        created_by,
        metadata,
        file_size,
        mime_type,
        duration,
        dimensions,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error('Database error updating asset:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update asset'
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found or access denied'
      });
    }

    // Map database row to Asset interface
    const asset = mapDatabaseRowToAsset(data);

    return res.status(200).json({
      success: true,
      message: 'Asset updated successfully',
      asset
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Update asset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update asset'
    });
  }
}

// DELETE - Delete an asset
async function deleteAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
): Promise<void> {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Asset ID is required'
      });
    }

    // Get the asset to check ownership
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('id, file_url, created_by, metadata')
      .eq('id', id)
      .eq('created_by', userId)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found or access denied'
      });
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (deleteError) {
      console.error('Database error deleting asset:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete asset'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Delete asset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete asset'
    });
  }
}

export default withSecurityHeaders(withAuth(handler));
