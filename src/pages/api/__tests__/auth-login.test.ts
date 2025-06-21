/**
 * Auth Login API Test Suite
 * Tests the /api/auth/login endpoint for authentication functionality
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';

// Set environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2NzI2MCwiZXhwIjoxOTYxNjQzMjYwfQ.test-signature';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(({ email, password }) => {
        if (email === 'test@example.com' && password === 'password123') {
          return Promise.resolve({
            data: {
              user: {
                id: 'test-user-id',
                email: 'test@example.com',
                user_metadata: { name: 'Test User' }
              },
              session: {
                access_token: 'test-access-token',
                refresh_token: 'test-refresh-token'
              }
            },
            error: null
          });
        }
        return Promise.resolve({
          data: { user: null, session: null },
          error: { message: 'Invalid credentials' }
        });
      }),
      signOut: jest.fn(() => Promise.resolve({ error: null }))
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-user-id',
              first_name: 'Test',
              last_name: 'User',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-user-id',
              first_name: 'Test',
              last_name: 'User',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      }))
    }))
  }
}));

// Mock rate limiting middleware
jest.mock('@/lib/rate-limiter', () => ({
  withAPIRateLimit: (handler: any) => handler,
  withAuthRateLimit: (handler: any) => handler
}));

import handler from '../auth/login';

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    test('should authenticate user with valid credentials', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.user.email).toBe('test@example.com');
    });

    test('should reject invalid credentials', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid credentials');
    });

    test('should return 400 for missing email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          password: 'password123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email and password are required');
    });

    test('should return 400 for missing password', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email and password are required');
    });
  });

  describe('Method validation', () => {
    test('should return 405 for GET requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Method not allowed');
    });

    test('should return 405 for PUT requests', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Method not allowed');
    });
  });

  describe('Error handling', () => {
    test('should handle malformed JSON gracefully', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: 'invalid-json'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  describe('Input validation edge cases', () => {
    test('should handle empty email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: '',
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email and password are required');
    });

    test('should handle empty password', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: ''
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error).toContain('Email and password are required');
    });

    test('should handle whitespace-only email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: '   ',
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle whitespace-only password', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: '   '
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle invalid email format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'invalid-email',
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle very long email', async () => {
      const longEmail = 'a'.repeat(1000) + '@example.com';
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: longEmail,
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle very long password', async () => {
      const longPassword = 'a'.repeat(10000);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: longPassword
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle special characters in email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test+special@example.com',
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      // Should accept valid email with special characters
      expect(res._getStatusCode()).toBe(401); // Unauthorized (not 400 validation error)
    });

    test('should handle special characters in password', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'P@ssw0rd!#$%'
        }
      });

      await handler(req, res);

      // Should accept password with special characters
      expect(res._getStatusCode()).toBe(401); // Unauthorized (not 400 validation error)
    });

    test('should handle null values', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: null,
          password: null
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle undefined values', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: undefined,
          password: undefined
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle extra fields in request body', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'validpassword123',
          extraField: 'should be ignored',
          maliciousScript: '<script>alert("xss")</script>'
        }
      });

      await handler(req, res);

      // Should process normally and ignore extra fields
      expect(res._getStatusCode()).toBe(401); // Unauthorized (not 400 validation error)
    });
  });

  describe('Security edge cases', () => {
    test('should handle SQL injection attempts in email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: "'; DROP TABLE users; --",
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle XSS attempts in email', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: '<script>alert("xss")</script>@example.com',
          password: 'validpassword123'
        }
      });

      await handler(req, res);

      // API returns 401 for invalid credentials (expected behavior)
      expect([400, 401]).toContain(res._getStatusCode());
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });

    test('should handle unicode characters', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          email: 'tëst@éxample.com',
          password: 'pässwörd123'
        }
      });

      await handler(req, res);

      // Should handle unicode gracefully
      expect([400, 401]).toContain(res._getStatusCode());
    });
  });
});
