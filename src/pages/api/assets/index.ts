import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase, getUserFromToken, userHasClientAccess } from '@/lib/supabase';
import { isDemo } from '@/lib/env';

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

// Mock data for demo mode
const mockAssets: Asset[] = [
  {
    id: 'asset_1',
    name: 'Product Image 1',
    type: 'image',
    url: 'https://via.placeholder.com/800x600',
    thumbnailUrl: 'https://via.placeholder.com/200x150',
    description: 'Main product image for the summer collection',
    tags: ['product', 'summer', 'featured'],
    dateCreated: '2023-05-01',
    clientId: 'demo-client-1',
    userId: 'demo-user',
    favorite: true,
  },
  {
    id: 'asset_2',
    name: 'Product Video',
    type: 'video',
    url: 'https://example.com/videos/product-demo.mp4',
    thumbnailUrl: 'https://via.placeholder.com/200x150',
    description: 'Product demonstration video',
    tags: ['product', 'demo', 'video'],
    dateCreated: '2023-04-28',
    clientId: 'demo-client-1',
    userId: 'demo-user',
    favorite: false,
  },
  {
    id: 'asset_3',
    name: 'Marketing Copy',
    type: 'text',
    url: 'https://example.com/text/marketing-copy.txt',
    description: 'Marketing copy for summer campaign',
    tags: ['copy', 'marketing', 'summer'],
    dateCreated: '2023-04-25',
    clientId: 'demo-client-1',
    userId: 'demo-user',
    favorite: false,
  },
  {
    id: 'asset_4',
    name: 'Brand Voiceover',
    type: 'voice',
    url: 'https://example.com/audio/brand-voiceover.mp3',
    description: 'Official brand voiceover for commercials',
    tags: ['voice', 'brand', 'commercial'],
    dateCreated: '2023-04-20',
    clientId: 'demo-client-1',
    userId: 'demo-user',
    favorite: true,
  },
  {
    id: 'asset_5',
    name: 'Logo Image',
    type: 'image',
    url: 'https://via.placeholder.com/500x500',
    thumbnailUrl: 'https://via.placeholder.com/100x100',
    description: 'Company logo in high resolution',
    tags: ['logo', 'brand', 'identity'],
    dateCreated: '2023-04-15',
    clientId: 'demo-client-2',
    userId: 'demo-user',
    favorite: true,
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check for demo mode
  const authHeader = req.headers.authorization;
  const isDemoMode = isDemo || !authHeader || authHeader.includes('demo-token') || authHeader.includes('mock_token');

  if (isDemoMode) {
    // Handle demo mode
    const { clientId } = req.query;
    
    if (req.method === 'GET') {
      let assets = mockAssets;
      if (clientId) {
        assets = assets.filter(asset => asset.clientId === clientId);
      }
      return res.status(200).json({
        success: true,
        assets,
      });
    } else if (req.method === 'POST') {
      const { name, type, url, thumbnailUrl, description, tags, clientId } = req.body;
      
      if (!name || !type || !url || !clientId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Name, type, URL, and client ID are required' 
        });
      }
      
      const newAsset: Asset = {
        id: 'asset_' + Math.random().toString(36).substring(2, 9),
        name,
        type,
        url,
        thumbnailUrl,
        description,
        tags: tags || [],
        dateCreated: new Date().toISOString().split('T')[0],
        clientId,
        userId: 'demo-user',
        favorite: false,
      };
      
      return res.status(201).json({
        success: true,
        asset: newAsset,
      });
    }
  }

  // Real Supabase mode
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
) {
  try {
    // Build query
    let query = supabase
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false });
    
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
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

// POST - Create a new asset
async function createAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
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
    console.error('Error creating asset:', error);
    throw error;
  }
}

// PUT - Update an asset
async function updateAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
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
    console.error('Error updating asset:', error);
    throw error;
  }
}

// DELETE - Delete an asset
async function deleteAsset(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  userId: string
) {
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
    console.error('Error deleting asset:', error);
    throw error;
  }
}
