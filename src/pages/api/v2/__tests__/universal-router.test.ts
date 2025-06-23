/**
 * API v2 Universal Router Tests
 * 
 * Tests the central router for all API v2 endpoints including:
 * - Middleware pipeline (auth, rate limiting, validation, cost tracking)
 * - Route handling and error responses
 * - CORS and security headers
 * - Health check endpoint
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import handler from '../[...route]';

// Mock dependencies
jest.mock('@/middleware/withAuth', () => ({
  withAuth: (fn: any) => fn,
}));

jest.mock('@/lib/rate-limiter', () => ({
  withAPIRateLimit: (fn: any) => fn,
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('API v2 Universal Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('CORS and Headers', () => {
    test('should set CORS headers for all requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
      expect(res.getHeader('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE, OPTIONS');
      expect(res.getHeader('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });

    test('should set API version headers', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.getHeader('X-API-Version')).toBe('2.0.0');
      expect(res.getHeader('X-Powered-By')).toBe('AIRWAVE API v2');
    });

    test('should handle OPTIONS preflight requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'OPTIONS',
        url: '/api/v2/health',
        query: { route: ['health'] },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.getHeader('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('Route Handling', () => {
    test('should route to health endpoint', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('healthy');
      expect(data.data.version).toBe('2.0.0');
    });

    test('should route to workflow endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/state',
        query: { route: ['workflow', 'state'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      // Should not return 404 for valid workflow routes
      expect(res.statusCode).not.toBe(404);
    });

    test('should route to AI endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/models',
        query: { route: ['ai', 'models'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      // Should not return 404 for valid AI routes
      expect(res.statusCode).not.toBe(404);
    });

    test('should route to assets endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/assets',
        query: { route: ['assets'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      // Should not return 404 for valid assets routes
      expect(res.statusCode).not.toBe(404);
    });

    test('should route to monitoring endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/health',
        query: { route: ['monitoring', 'health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      // Should not return 404 for valid monitoring routes
      expect(res.statusCode).not.toBe(404);
    });

    test('should return 404 for unknown routes', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/unknown',
        query: { route: ['unknown'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toContain("API v2 route 'unknown' not found");
    });
  });

  describe('Health Check Endpoint', () => {
    test('should return comprehensive health information', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('timestamp');
      expect(data.data).toHaveProperty('version');
      expect(data.data).toHaveProperty('uptime');
      expect(data.data).toHaveProperty('memory');
      expect(data.data).toHaveProperty('performance');
      expect(data.data).toHaveProperty('ai');
      
      // Check memory structure
      expect(data.data.memory).toHaveProperty('heapUsed');
      expect(data.data.memory).toHaveProperty('heapTotal');
      expect(data.data.memory).toHaveProperty('external');
      expect(data.data.memory).toHaveProperty('rss');
      
      // Check performance structure
      expect(data.data.performance).toHaveProperty('averageResponseTime');
      expect(data.data.performance).toHaveProperty('totalRequests');
      expect(data.data.performance).toHaveProperty('errorRate');
      
      // Check AI structure
      expect(data.data.ai).toHaveProperty('budgetStatus');
      expect(data.data.ai).toHaveProperty('totalSpent');
    });

    test('should include request metadata', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      expect(data.meta).toHaveProperty('requestId');
      expect(data.meta).toHaveProperty('timestamp');
      expect(typeof data.meta.requestId).toBe('string');
      expect(typeof data.meta.timestamp).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle missing route parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/',
        query: Record<string, unknown>$1
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INVALID_REQUEST');
    });

    test('should handle authentication errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/state',
        query: { route: ['workflow', 'state'] },
        // No authentication headers
      });

      await handler(req, res);

      // Should handle missing authentication gracefully
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    test('should handle malformed requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/state',
        query: { route: ['workflow', 'state'] },
        body: 'invalid json',
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
          'content-type': 'application/json',
        },
      });

      await handler(req, res);

      // Should handle malformed JSON gracefully
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Request Context', () => {
    test('should create proper request context', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      // Context should be properly created and used
      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.meta.requestId).toBeDefined();
    });

    test('should handle query parameters', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health?debug=true&format=json',
        query: { 
          route: ['health'],
          debug: 'true',
          format: 'json'
        },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      // Query parameters should be accessible in handlers
    });

    test('should handle different HTTP methods', async () => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      
      for (const method of methods) {
        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method,
          url: '/api/v2/health',
          query: { route: ['health'] },
          headers: {
            'x-user-id': 'user123',
            'x-user-email': 'test@example.com',
          },
        });

        await handler(req, res);

        // Should handle all HTTP methods appropriately
        expect(res.statusCode).toBeDefined();
      }
    });
  });

  describe('Response Format', () => {
    test('should return consistent response format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/health',
        query: { route: ['health'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      
      // Check standard API response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(typeof data.success).toBe('boolean');
      expect(data.meta).toHaveProperty('timestamp');
    });

    test('should return error response format for failures', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/unknown',
        query: { route: ['unknown'] },
        headers: {
          'x-user-id': 'user123',
          'x-user-email': 'test@example.com',
        },
      });

      await handler(req, res);

      const data = JSON.parse(res._getData());
      
      // Check error response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('error');
      expect(data).toHaveProperty('meta');
      expect(data.success).toBe(false);
      expect(data.error).toHaveProperty('code');
      expect(data.error).toHaveProperty('message');
    });
  });
});
