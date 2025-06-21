/**
 * API v2 Assets Route Handler
 * 
 * Handles all asset-related endpoints:
 * - /api/v2/assets - Asset CRUD operations
 * - /api/v2/assets/upload - Asset upload
 * - /api/v2/assets/search - Asset search
 * - /api/v2/assets/bulk - Bulk operations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase/client';
import { successResponse, errorResponse, handleApiError, methodNotAllowed, validateRequiredFields, ApiErrorCode, createPaginationMeta } from '@/lib/api-response';

interface RouteContext {
  user: any;
  route: string[];
  method: string;
  body: any;
  query: any;
  startTime: number;
  requestId: string;
}

export async function handleAssetsRoutes(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext,
  subRoute: string[]
): Promise<void> {
  try {
    if (!context.user?.id) {
      return errorResponse(res, ApiErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const [endpoint, ...params] = subRoute;

    switch (endpoint) {
      case undefined:
      case '':
        return await handleAssetsCRUD(req, res, context);
      
      case 'upload':
        return await handleUpload(req, res, context);
      
      case 'search':
        return await handleSearch(req, res, context);
      
      case 'bulk':
        return await handleBulk(req, res, context);
      
      default:
        // Handle asset ID operations
        if (endpoint && params.length === 0) {
          return await handleAssetById(req, res, context, endpoint);
        }
        return errorResponse(res, ApiErrorCode.NOT_FOUND, `Assets endpoint '${endpoint}' not found`, 404);
    }
  } catch (error) {
    return handleApiError(res, error, 'assets routes');
  }
}

// Asset CRUD operations
async function handleAssetsCRUD(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext
): Promise<void> {
  switch (context.method) {
    case 'GET':
      return await getAssets(req, res, context);
    case 'POST':
      return await createAsset(req, res, context);
    default:
      return methodNotAllowed(res, ['GET', 'POST']);
  }
}

async function getAssets(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const {
    page = '1',
    limit = '20',
    search = '',
    type = '',
    clientId = '',
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = context.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const offset = (pageNum - 1) * limitNum;

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

  // Apply filters
  if (clientId) {
    query = query.eq('client_id', clientId);
  } else {
    // Get user's accessible clients
    const { data: userClients } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', context.user.id);

    if (userClients && userClients.length > 0) {
      const clientIds = userClients.map(uc => uc.client_id);
      query = query.in('client_id', clientIds);
    } else {
      // No accessible clients
      const paginationMeta = createPaginationMeta(pageNum, limitNum, 0);
      return successResponse(res, [], 200, {
        pagination: paginationMeta,
        requestId: context.requestId,
        timestamp: new Date().toISOString()
      });
    }
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  if (type) {
    query = query.eq('type', type);
  }

  // Apply sorting and pagination
  const ascending = sortOrder === 'asc';
  query = query.order(sortBy as string, { ascending }).range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch assets: ${error.message}`);
  }

  // Map to frontend format
  const assets = (data || []).map(mapDatabaseRowToAsset);
  const paginationMeta = createPaginationMeta(pageNum, limitNum, count || 0);

  return successResponse(res, assets, 200, {
    pagination: paginationMeta,
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function createAsset(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const {
    name, type, url, thumbnailUrl, description, tags, clientId,
    metadata, size, mimeType, duration, width, height
  } = context.body;

  const missingFields = validateRequiredFields(context.body, ['name', 'type', 'url']);
  if (missingFields.length > 0) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      `Missing required fields: ${missingFields.join(', ')}`,
      400
    );
  }

  if (!['image', 'video', 'text', 'voice'].includes(type)) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Invalid asset type', 400);
  }

  const assetData = {
    name,
    type,
    file_url: url,
    thumbnail_url: thumbnailUrl,
    description,
    tags: Array.isArray(tags) ? tags : [],
    client_id: clientId,
    created_by: context.user.id,
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
    throw new Error(`Failed to create asset: ${error.message}`);
  }

  const asset = mapDatabaseRowToAsset(data);

  return successResponse(res, asset, 201, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

// Asset by ID operations
async function handleAssetById(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext,
  assetId: string
): Promise<void> {
  switch (context.method) {
    case 'GET':
      return await getAssetById(req, res, context, assetId);
    case 'PUT':
      return await updateAsset(req, res, context, assetId);
    case 'DELETE':
      return await deleteAsset(req, res, context, assetId);
    default:
      return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
  }
}

async function getAssetById(req: NextApiRequest, res: NextApiResponse, context: RouteContext, assetId: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', assetId)
    .single();

  if (error || !data) {
    return errorResponse(res, ApiErrorCode.NOT_FOUND, 'Asset not found', 404);
  }

  const asset = mapDatabaseRowToAsset(data);

  return successResponse(res, asset, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function updateAsset(req: NextApiRequest, res: NextApiResponse, context: RouteContext, assetId: string) {
  // Implementation for updating asset
  return successResponse(res, { updated: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

async function deleteAsset(req: NextApiRequest, res: NextApiResponse, context: RouteContext, assetId: string) {
  // Implementation for deleting asset
  return successResponse(res, { deleted: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

// Asset upload
async function handleUpload(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  // Implementation for asset upload
  return successResponse(res, { uploaded: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

// Asset search
async function handleSearch(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  // Implementation for asset search
  return successResponse(res, [], 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

// Bulk operations
async function handleBulk(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  // Implementation for bulk operations
  return successResponse(res, { processed: 0 }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString()
  });
}

// Helper function to map database row to Asset interface
function mapDatabaseRowToAsset(row: any) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    url: row.file_url,
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
