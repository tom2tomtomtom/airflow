import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getUserFromToken, userHasClientAccess } from '@/lib/supabase';

export interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'text' | 'voice';
  url: string;
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
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authentication required
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  try {
    // Get user from token
    const user = await getUserFromToken(token);
    const { clientId } = req.query;

    switch (req.method) {
      case 'GET':
        return await getAssets(req, res, user.id, clientId as string | undefined);
      case 'POST':
        return await createAsset(req, res, user.id);
      case 'PUT':
        return await updateAsset(req, res, user.id);
      case 'DELETE':
        return await deleteAsset(req, res, user.id);
      default:
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('API error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

// GET - Retrieve assets for a user, optionally filtered by client
async function getAssets(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string,
  clientId?: string
): Promise<void> {
  try {
    // Extract query parameters for search and filtering
    const {
      search,
      type,
      tags,
      dateFrom,
      dateTo,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 50,
      offset = 0
    } = req.query;

    // Build query
    let query = supabase
      .from('assets')
      .select('*');
    
    // Filter by client if provided
    if (clientId) {
      // Check user has access to this client
      const hasAccess = await userHasClientAccess(userId, clientId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this client'
        });
      }
      query = query.eq('client_id', clientId);
    } else {
      // Get all assets from clients the user has access to
      const { data: userClients } = await supabase
        .from('user_clients')
        .select('client_id')
        .eq('user_id', userId);
      
      const clientIds = userClients?.map(uc => uc.client_id) || [];
      if (clientIds.length > 0) {
        query = query.in('client_id', clientIds);
      } else {
        // User has no client access
        return res.status(200).json({
          success: true,
          assets: [],
        });
      }
    }

    // Apply search filter
    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply type filter
    if (type && typeof type === 'string') {
      query = query.eq('type', type);
    }

    // Apply tags filter
    if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }

    // Apply date range filters
    if (dateFrom && typeof dateFrom === 'string') {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo && typeof dateTo === 'string') {
      query = query.lte('created_at', dateTo);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'name', 'type', 'file_size'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy as string : 'created_at';
    const ascending = sortOrder === 'asc';
    query = query.order(sortField, { ascending });

    // Apply pagination
    const limitNum = Math.min(Number(limit) || 50, 100); // Max 100 items
    const offsetNum = Number(offset) || 0;
    query = query.range(offsetNum, offsetNum + limitNum - 1);
    
    const { data: assets, error } = await query;
    
    if (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
    
    // Transform assets to match expected format
    const transformedAssets = assets?.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type as 'image' | 'video' | 'text' | 'voice',
      url: asset.url,
      thumbnailUrl: asset.thumbnail_url || undefined,
      description: asset.description || undefined,
      tags: asset.tags || [],
      dateCreated: asset.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      clientId: asset.client_id,
      userId: asset.created_by || userId,
      favorite: asset.metadata?.favorite || false,
      metadata: asset.metadata,
      size: asset.size_bytes || undefined,
      mimeType: asset.mime_type || undefined,
      duration: asset.duration_seconds || undefined,
      width: asset.width || undefined,
      height: asset.height || undefined,
    })) || [];
    
    return res.status(200).json({
      success: true,
      assets: transformedAssets,
      pagination: {
        limit: limitNum,
        offset: offsetNum,
        total: assets?.length || 0,
        hasMore: (assets?.length || 0) === limitNum
      },
      filters: {
        search: search || null,
        type: type || null,
        tags: tags || null,
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        sortBy: sortField,
        sortOrder: ascending ? 'asc' : 'desc'
      }
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error fetching assets:', error);
    throw error;
  }
}

// POST - Create a new asset
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

    // Basic validation
    if (!name || !type || !url || !clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, type, URL, and client ID are required' 
      });
    }

    // Validate asset type
    if (!['image', 'video', 'text', 'voice'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be one of: image, video, text, voice' 
      });
    }

    // Check user has access to the client
    const hasAccess = await userHasClientAccess(userId, clientId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this client'
      });
    }

    // Create new asset
    const { data: newAsset, error } = await supabase
      .from('assets')
      .insert({
        name,
        type,
        url,
        thumbnail_url: thumbnailUrl || null,
        description: description || null,
        tags: tags || [],
        client_id: clientId,
        created_by: userId,
        metadata: { ...metadata, favorite: false },
        size_bytes: size || null,
        mime_type: mimeType || null,
        duration_seconds: duration || null,
        width: width || null,
        height: height || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating asset:', error);
      throw error;
    }

    // Transform response
    const transformedAsset: Asset = {
      id: newAsset.id,
      name: newAsset.name,
      type: newAsset.type,
      url: newAsset.url,
      thumbnailUrl: newAsset.thumbnail_url || undefined,
      description: newAsset.description || undefined,
      tags: newAsset.tags || [],
      dateCreated: newAsset.created_at.split('T')[0],
      clientId: newAsset.client_id,
      userId: newAsset.created_by,
      favorite: false,
      metadata: newAsset.metadata,
      size: newAsset.size_bytes || undefined,
      mimeType: newAsset.mime_type || undefined,
      duration: newAsset.duration_seconds || undefined,
      width: newAsset.width || undefined,
      height: newAsset.height || undefined,
    };

    return res.status(201).json({
      success: true,
      asset: transformedAsset,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error creating asset:', error);
    throw error;
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

    // Get the asset to check access
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('client_id')
      .eq('id', id)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check user has access to the client
    const hasAccess = await userHasClientAccess(userId, asset.client_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this asset'
      });
    }

    // Update the asset
    const { data: updatedAsset, error: updateError } = await supabase
      .from('assets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating asset:', updateError);
      throw updateError;
    }

    // Transform response
    const transformedAsset: Asset = {
      id: updatedAsset.id,
      name: updatedAsset.name,
      type: updatedAsset.type,
      url: updatedAsset.url,
      thumbnailUrl: updatedAsset.thumbnail_url || undefined,
      description: updatedAsset.description || undefined,
      tags: updatedAsset.tags || [],
      dateCreated: updatedAsset.created_at.split('T')[0],
      clientId: updatedAsset.client_id,
      userId: updatedAsset.created_by,
      favorite: updatedAsset.metadata?.favorite || false,
      metadata: updatedAsset.metadata,
      size: updatedAsset.size_bytes || undefined,
      mimeType: updatedAsset.mime_type || undefined,
      duration: updatedAsset.duration_seconds || undefined,
      width: updatedAsset.width || undefined,
      height: updatedAsset.height || undefined,
    };

    return res.status(200).json({
      success: true,
      asset: transformedAsset,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error updating asset:', error);
    throw error;
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

    // Get the asset to check access
    const { data: asset, error: fetchError } = await supabase
      .from('assets')
      .select('client_id')
      .eq('id', id)
      .single();

    if (fetchError || !asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Check user has access to the client
    const hasAccess = await userHasClientAccess(userId, asset.client_id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this asset'
      });
    }

    // Delete the asset
    const { error: deleteError } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting asset:', deleteError);
      throw deleteError;
    }

    return res.status(200).json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error deleting asset:', error);
    throw error;
  }
}