/**
 * Video Status API Endpoint Test Suite
 * Tests the /api/video/status endpoint for video generation status tracking
 */

// Set environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'TEST_JWT_TOKEN_PLACEHOLDER';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'video_generations') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [{
                  id: 'test-generation-1',
                  generation_id: 'test-gen-123',
                  client_id: 'test-client-1',
                  status: 'completed',
                  variation_index: 0,
                  output_url: 'https://example.com/video.mp4',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  config: { video_config: { duration: 30 } }
                }],
                error: null
              })),
              single: jest.fn(() => Promise.resolve({
                data: {
                  id: 'test-generation-1',
                  generation_id: 'test-gen-123',
                  client_id: 'test-client-1',
                  status: 'completed',
                  variation_index: 0,
                  output_url: 'https://example.com/video.mp4',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  config: { video_config: { duration: 30 } }
                },
                error: null
              }))
            }))
          })),
          update: jest.fn(() => ({
            eq: jest.fn(() => ({
              select: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'test-generation-1' },
                  error: null
                }))
              }))
            }))
          }))
        };
      } else if (table === 'user_clients') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: { id: 'test-access-id' },
                  error: null
                }))
              }))
            }))
          }))
        };
      }
      return {};
    }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({
          data: { path: 'test/path/video.mp4' },
          error: null
        })),
        getPublicUrl: jest.fn(() => ({
          data: { publicUrl: 'https://example.com/video.mp4' }
        }))
      }))
    }
  }
}));

// Mock creatomate service
jest.mock('@/services/creatomate', () => ({
  creatomateService: {
    getRenderStatus: jest.fn(() => Promise.resolve({
      status: 'succeeded',
      url: 'https://example.com/video.mp4',
      completed_at: new Date().toISOString()
    }))
  }
}));

// Mock middleware
jest.mock('@/middleware/withAuth', () => ({
  withAuth: (handler: any) => (req: any, res: any) => {
    req.user = { id: 'test-user-123', email: 'test@example.com' };
    return handler(req, res);
  }
}));

jest.mock('@/middleware/withSecurityHeaders', () => ({
  withSecurityHeaders: (handler: any) => handler
}));

import { createMocks } from 'node-mocks-http';
import handler from '../status';


// Test constants (safe for testing)
const TEST_JWT_TOKEN_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0IiwicmVmIjoidGVzdCIsInJvbGUiOiJhbm9uIn0.test-signature';
const DEFAULT_JWT_TOKEN_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0IiwicmVmIjoiZGVmYXVsdCIsInJvbGUiOiJhbm9uIn0.default-signature';

describe('/api/video/status', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 405 for non-GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Method not allowed'
    });
  });

  test('should return 400 when neither generation_id nor job_id provided', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Either generation_id or job_id is required'
    });
  });

  test('should handle generation status request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { generation_id: 'test-gen-123' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      data: {
        generation_id: 'test-gen-123',
        total_jobs: expect.any(Number),
        progress: expect.objectContaining({
          status: expect.any(String),
          percentage: expect.any(Number),
          total: expect.any(Number)
        }),
        jobs: expect.any(Array)
      }
    });
  });

  test('should handle job status request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { job_id: 'test-generation-1' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      data: {
        id: 'test-generation-1',
        status: expect.any(String),
        progress: expect.objectContaining({
          percentage: expect.any(Number),
          message: expect.any(String),
          status: expect.any(String)
        })
      }
    });
  });

  test('should return 404 for non-existent generation', async () => {
    // Mock empty result
    const mockSupabase = jest.requireMock('@/lib/supabase/client').supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null
          }))
        }))
      }))
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { generation_id: 'non-existent' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Generation not found'
    });
  });

  test('should return 403 for unauthorized access', async () => {
    // Mock no client access
    const mockSupabase = jest.requireMock('@/lib/supabase/client').supabase;
    mockSupabase.from.mockImplementation((table: string) => {
      if (table === 'video_generations') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => Promise.resolve({
                data: [{
                  id: 'test-generation-1',
                  client_id: 'unauthorized-client',
                  status: 'completed'
                }],
                error: null
              }))
            }))
          }))
        };
      } else if (table === 'user_clients') {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                single: jest.fn(() => Promise.resolve({
                  data: null,
                  error: null
                }))
              }))
            }))
          }))
        };
      }
      return mockSupabase.from();
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { generation_id: 'test-gen-123' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(403);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Access denied to this generation'
    });
  });

  test('should handle database errors gracefully', async () => {
    // Mock database error
    const mockSupabase = jest.requireMock('@/lib/supabase/client').supabase;
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: null,
            error: { message: 'Database connection failed' }
          }))
        }))
      }))
    });

    const { req, res } = createMocks({
      method: 'GET',
      query: { generation_id: 'test-gen-123' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Generation not found'
    });
  });
});
