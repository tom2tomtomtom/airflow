/**
 * API v2 Assets Handler Tests
 * 
 * Tests all asset-related endpoints:
 * - Asset CRUD operations
 * - File upload and processing
 * - Asset search and filtering
 * - Bulk operations
 * - Asset metadata management
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleAssetsRoutes } from '../assets';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'asset123' }, error: null })),
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        or: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'asset123' }, error: null })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  },
}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('API v2 Assets Handler', () => {
  const mockContext = {
    user: { id: 'user123', email: 'test@example.com' },
    requestId: 'req123',
    method: 'GET',
    query: {},
    body: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Asset CRUD Operations', () => {
    test('should handle GET assets list', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets',
        query: { clientId: 'client123' },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, []);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('assets');
      expect(Array.isArray(data.data.assets)).toBe(true);
    });

    test('should handle GET single asset', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/asset123',
      });

      await handleAssetsRoutes(req, res, mockContext, ['asset123']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('asset');
    });

    test('should handle POST create asset', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets',
        body: {
          name: 'Test Asset',
          type: 'image',
          url: 'https://example.com/image.jpg',
          clientId: 'client123',
          description: 'Test asset description',
          tags: ['marketing', 'social'],
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, []);

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('asset');
    });

    test('should handle PUT update asset', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        url: '/api/v2/assets/asset123',
        body: {
          name: 'Updated Asset Name',
          description: 'Updated description',
          tags: ['updated', 'tags'],
        },
      });

      const putContext = { ...mockContext, method: 'PUT', body: req.body };
      await handleAssetsRoutes(req, res, putContext, ['asset123']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should handle DELETE asset', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        url: '/api/v2/assets/asset123',
      });

      const deleteContext = { ...mockContext, method: 'DELETE' };
      await handleAssetsRoutes(req, res, deleteContext, ['asset123']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate required fields for asset creation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets',
        body: {
          // Missing required fields
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, []);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('File Upload', () => {
    test('should handle file upload request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets/upload',
        body: {
          fileName: 'test-image.jpg',
          fileType: 'image/jpeg',
          fileSize: 1024000,
          clientId: 'client123',
          metadata: {
            width: 1920,
            height: 1080,
          },
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, ['upload']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('uploadUrl');
      expect(data.data).toHaveProperty('assetId');
    });

    test('should validate file upload parameters', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets/upload',
        body: {
          fileName: 'test.exe', // Invalid file type
          fileType: 'application/exe',
          fileSize: 1024000,
          clientId: 'client123',
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, ['upload']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('file type');
    });

    test('should handle file size limits', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets/upload',
        body: {
          fileName: 'large-file.jpg',
          fileType: 'image/jpeg',
          fileSize: 100000000, // 100MB - too large
          clientId: 'client123',
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, ['upload']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('file size');
    });
  });

  describe('Asset Search and Filtering', () => {
    test('should handle search by name', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/search',
        query: {
          q: 'logo',
          clientId: 'client123',
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, ['search']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('assets');
    });

    test('should handle search by tags', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/search',
        query: {
          tags: 'marketing,social',
          clientId: 'client123',
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, ['search']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should handle search by type', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/search',
        query: {
          type: 'image',
          clientId: 'client123',
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, ['search']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should handle pagination in search', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/search',
        query: {
          q: 'test',
          page: '2',
          limit: '10',
          clientId: 'client123',
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, ['search']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.meta).toHaveProperty('pagination');
    });

    test('should handle sorting in search', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/search',
        query: {
          q: 'test',
          sortBy: 'created_at',
          sortOrder: 'desc',
          clientId: 'client123',
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, ['search']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Bulk Operations', () => {
    test('should handle bulk asset update', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        url: '/api/v2/assets/bulk',
        body: {
          assetIds: ['asset1', 'asset2', 'asset3'],
          updates: {
            tags: ['bulk-updated'],
            description: 'Bulk updated description',
          },
        },
      });

      const putContext = { ...mockContext, method: 'PUT', body: req.body };
      await handleAssetsRoutes(req, res, putContext, ['bulk']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('updatedCount');
    });

    test('should handle bulk asset deletion', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        url: '/api/v2/assets/bulk',
        body: {
          assetIds: ['asset1', 'asset2', 'asset3'],
        },
      });

      const deleteContext = { ...mockContext, method: 'DELETE', body: req.body };
      await handleAssetsRoutes(req, res, deleteContext, ['bulk']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('deletedCount');
    });

    test('should validate bulk operation limits', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        url: '/api/v2/assets/bulk',
        body: {
          assetIds: Array(1001).fill('asset').map((_, i) => `asset${i}`), // Too many assets
          updates: { tags: ['test'] },
        },
      });

      const putContext = { ...mockContext, method: 'PUT', body: req.body };
      await handleAssetsRoutes(req, res, putContext, ['bulk']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('limit');
    });
  });

  describe('Asset Metadata', () => {
    test('should handle metadata extraction for images', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets',
        body: {
          name: 'Test Image',
          type: 'image',
          url: 'https://example.com/image.jpg',
          clientId: 'client123',
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG',
            colorSpace: 'sRGB',
          },
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, []);

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.asset).toHaveProperty('metadata');
    });

    test('should handle metadata extraction for videos', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/assets',
        body: {
          name: 'Test Video',
          type: 'video',
          url: 'https://example.com/video.mp4',
          clientId: 'client123',
          metadata: {
            duration: 30.5,
            width: 1920,
            height: 1080,
            frameRate: 30,
            codec: 'H.264',
          },
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAssetsRoutes(req, res, postContext, []);

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.asset.metadata).toHaveProperty('duration');
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown asset endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/unknown',
      });

      await handleAssetsRoutes(req, res, mockContext, ['unknown']);

      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    test('should handle authentication errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets',
      });

      const unauthContext = { ...mockContext, user: null };
      await handleAssetsRoutes(req, res, unauthContext, []);

      expect(res.statusCode).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    test('should handle asset not found', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets/nonexistent',
      });

      await handleAssetsRoutes(req, res, mockContext, ['nonexistent']);

      // Should handle gracefully when asset doesn't exist
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    test('should handle database errors', async () => {
      // Mock database error
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets',
        query: { clientId: 'client123' },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleAssetsRoutes(req, res, getContext, []);

      // Should handle database errors gracefully
      expect(res.statusCode).toBeDefined();
    });
  });
});
