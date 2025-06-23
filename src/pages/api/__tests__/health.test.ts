/**
 * 🧪 Health Check API Tests
 * Tests for /api/health endpoint functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../health';

// Mock external dependencies
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
    })),
    storage: {
      listBuckets: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }
  }))
}));

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    ping: jest.fn(() => Promise.resolve('PONG'))
  }))
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn(() => Promise.resolve({}))
  })),
  HeadBucketCommand: jest.fn()
}));

// Mock fetch for external API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as jest.Mock;

describe('/api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';
  });

  it('should return health status with basic structure', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      status: expect.stringMatching(/healthy|degraded|unhealthy/),
      timestamp: expect.any(String),
      version: expect.any(String),
      uptime: expect.any(Number),
      environment: expect.any(String),
      deployment: expect.objectContaining({
        platform: expect.any(String),
        region: expect.any(String),
      }),
      checks: expect.objectContaining({
        database: expect.any(Object),
        redis: expect.any(Object),
        storage: expect.any(Object),
        creatomate: expect.any(Object),
        email: expect.any(Object),
        ai_services: expect.any(Object),
      }),
      performance: expect.objectContaining({
        memory_usage: expect.any(Number),
        response_time: expect.any(Number),
      }),
    });
  });

  it('should reject non-GET methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(res._getData()).toBe('Method Not Allowed');
  });

  it('should set cache headers', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.getHeader('Cache-Control')).toBe('public, max-age=10');
  });

  it('should include performance metrics', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    expect(data.performance.memory_usage).toBeGreaterThan(0);
    expect(data.performance.response_time).toBeGreaterThanOrEqual(0);
  });
});