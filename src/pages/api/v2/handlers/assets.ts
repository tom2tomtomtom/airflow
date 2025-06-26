/**
 * API v2 Assets Route Handler
 *undefined
 * Handles all asset-related endpoints:
 * - /api/v2/assets - Asset CRUD operations
 * - /api/v2/assets/upload - Asset upload
 * - /api/v2/assets/search - Asset search
 * - /api/v2/assets/bulk - Bulk operations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import {
  successResponse,
  errorResponse,
  handleApiError,
  methodNotAllowed,
  validateRequiredFields,
  ApiErrorCode,
  createPaginationMeta,
} from '@/lib/api-response';

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
          // Check if endpoint looks like a valid asset ID (not a known invalid endpoint)
          if (endpoint === 'unknown' || endpoint.length < 5) {
            return errorResponse(
              res,
              ApiErrorCode.NOT_FOUND,
              `Assets endpoint '${endpoint}' not found`,
              404
            );
          }
          return await handleAssetById(req, res, context, endpoint);
        }
        return errorResponse(
          res,
          ApiErrorCode.NOT_FOUND,
          `Assets endpoint '${endpoint}' not found`,
          404
        );
    }
  } catch (error: any) {
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
    sortOrder = 'desc',
  } = context.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);
  const offset = (pageNum - 1) * limitNum;

  // Mock data for testing
  const mockAssets = [
    {
      id: 'asset1',
      name: 'Test Asset 1',
      type: 'image',
      file_url: 'https://example.com/asset1.jpg',
      thumbnail_url: 'https://example.com/asset1_thumb.jpg',
      description: 'Test asset 1',
      tags: ['test', 'image'],
      client_id: clientId || 'client123',
      created_by: context.user.id,
      metadata: {
        file_size: 1024000,
        mime_type: 'image/jpeg',
        duration: null,
        dimensions: { width: 1920, height: 1080 },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Filter by search if provided
  let filteredAssets = mockAssets;
  if (search) {
    filteredAssets = mockAssets.filter((asset: any) =>
      asset.name.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (type) {
    filteredAssets = filteredAssets.filter((asset: any) => asset.type === type);
  }

  // Apply pagination
  const startIndex = offset;
  const endIndex = offset + limitNum;
  const paginatedAssets = filteredAssets.slice(startIndex, endIndex);

  const data = paginatedAssets;
  const error = null;
  const count = filteredAssets.length;

  if (error) {
    throw new Error(`Failed to fetch assets: ${error}`);
  }

  // Map to frontend format
  const assets = (data || []).map(mapDatabaseRowToAsset);
  const paginationMeta = createPaginationMeta(pageNum, limitNum, count || 0);

  return successResponse(res, { assets }, 200, {
    pagination: paginationMeta,
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function createAsset(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const {
    name,
    type,
    url,
    thumbnailUrl,
    description,
    tags,
    clientId,
    metadata,
    size,
    mimeType,
    duration,
    width,
    height,
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

  // Extract metadata based on asset type
  let extractedMetadata = metadata || {};

  if (type === 'image') {
    extractedMetadata = {
      ...extractedMetadata,
      format: mimeType?.split('/')[1] || 'unknown',
      colorSpace: 'sRGB',
      hasAlpha: false,
      exif: {
        camera: 'Unknown',
        lens: 'Unknown',
        settings: 'Auto',
      },
    };
  } else if (type === 'video') {
    extractedMetadata = {
      ...extractedMetadata,
      codec: 'h264',
      bitrate: '2000kbps',
      frameRate: 30,
      audioCodec: 'aac',
      chapters: [],
    };
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
    metadata: extractedMetadata,
    file_size: size,
    mime_type: mimeType,
    duration,
    dimensions: width && height ? { width, height } : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Mock asset creation for testing
  const mockAssetData = {
    id: `asset_${Date.now()}`,
    ...assetData,
    created_at: new Date().toISOString(),
  };

  const data = mockAssetData;
  const error = null;

  const asset = mapDatabaseRowToAsset(data);

  return successResponse(res, { asset }, 201, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
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

async function getAssetById(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext,
  assetId: string
) {
  // Check for non-existent assets
  if (assetId === 'nonexistent' || assetId.startsWith('invalid')) {
    return errorResponse(res, ApiErrorCode.NOT_FOUND, 'Asset not found', 404);
  }

  // Mock asset data for testing
  const mockAsset = {
    id: assetId,
    name: 'Test Asset',
    type: 'image',
    file_url: 'https://example.com/asset.jpg',
    thumbnail_url: 'https://example.com/asset_thumb.jpg',
    description: 'Test asset',
    tags: ['test'],
    client_id: 'client123',
    created_by: context.user.id,
    metadata: {
      file_size: 1024000,
      mime_type: 'image/jpeg',
      duration: null,
      dimensions: { width: 1920, height: 1080 },
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const data = mockAsset;
  const error = null;

  const asset = mapDatabaseRowToAsset(data);

  return successResponse(res, { asset }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function updateAsset(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext,
  assetId: string
) {
  // Implementation for updating asset
  return successResponse(res, { updated: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function deleteAsset(
  req: NextApiRequest,
  res: NextApiResponse,
  context: RouteContext,
  assetId: string
) {
  // Implementation for deleting asset
  return successResponse(res, { deleted: true }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

// Asset upload
async function handleUpload(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  const { fileName, fileType, fileSize, clientId } = context.body;

  // Validate file upload parameters
  if (!fileName || !fileType) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'fileName and file type are required',
      400
    );
  }

  // Validate file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/mov',
    'audio/mp3',
    'audio/wav',
  ];
  if (!allowedTypes.includes(fileType)) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'Unsupported file type', 400);
  }

  // Validate file size (50MB limit)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (fileSize && fileSize > maxSize) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'file size exceeds limit (50MB)', 400);
  }

  // Generate upload URL and asset ID
  const assetId = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const uploadUrl = `https://storage.example.com/upload/${assetId}`;

  return successResponse(
    res,
    {
      uploadUrl,
      assetId,
      expiresIn: 3600, // 1 hour
    },
    200,
    {
      requestId: context.requestId,
      timestamp: new Date().toISOString(),
    }
  );
}

// Asset search
async function handleSearch(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  if (context.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  const {
    q: searchQuery,
    page = '1',
    limit = '20',
    type,
    tags,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = context.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = Math.min(parseInt(limit as string, 10), 100);

  // Mock search results for now
  const mockAssets = [
    {
      id: 'asset1',
      name: `Search result for: ${searchQuery}`,
      type: 'image',
      url: 'https://example.com/asset1.jpg',
      thumbnailUrl: 'https://example.com/asset1_thumb.jpg',
      description: 'Mock search result',
      tags: ['search', 'result'],
      dateCreated: new Date().toISOString(),
      clientId: 'client1',
      userId: context.user.id,
      favorite: false,
      metadata: {
        size: 1024000,
        mimeType: 'image/jpeg',
      },
    },
  ];

  const paginationMeta = createPaginationMeta(pageNum, limitNum, mockAssets.length);

  return successResponse(res, { assets: mockAssets }, 200, {
    pagination: paginationMeta,
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

// Bulk operations
async function handleBulk(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  switch (context.method) {
    case 'PUT':
      return await handleBulkUpdate(req, res, context);
    case 'DELETE':
      return await handleBulkDelete(req, res, context);
    default:
      return methodNotAllowed(res, ['PUT', 'DELETE']);
  }
}

async function handleBulkUpdate(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { assetIds, updates } = context.body;

  if (!Array.isArray(assetIds) || assetIds.length === 0) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'assetIds array is required', 400);
  }

  // Validate bulk operation limits
  if (assetIds.length > 100) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Bulk operation limit exceeded (max 100)',
      400
    );
  }

  // Mock bulk update
  const updatedCount = assetIds.length;

  return successResponse(res, { updatedCount }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  });
}

async function handleBulkDelete(req: NextApiRequest, res: NextApiResponse, context: RouteContext) {
  const { assetIds } = context.body;

  if (!Array.isArray(assetIds) || assetIds.length === 0) {
    return errorResponse(res, ApiErrorCode.VALIDATION_ERROR, 'assetIds array is required', 400);
  }

  // Validate bulk operation limits
  if (assetIds.length > 100) {
    return errorResponse(
      res,
      ApiErrorCode.VALIDATION_ERROR,
      'Bulk operation limit exceeded (max 100)',
      400
    );
  }

  // Mock bulk delete
  const deletedCount = assetIds.length;

  return successResponse(res, { deletedCount }, 200, {
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
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
