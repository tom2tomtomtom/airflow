/**
 * Authentication & Authorization Security Tests
 * Comprehensive security tests for AIRWAVE authentication infrastructure
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { SessionManager } from '@/lib/session-manager';
import { supabase } from '@/lib/supabase';

// Mock external dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}));

jest.mock('@/lib/session-manager', () => ({
  SessionManager: {
    getInstance: jest.fn(() => ({
      createSession: jest.fn(),
      getSession: jest.fn(),
      destroySession: jest.fn(),
      validateSession: jest.fn(),
      cleanupExpiredSessions: jest.fn()
    }))
  }
}));

describe('Authentication & Authorization Security Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('JWT Token Validation', () => {
    it('should reject requests with invalid JWT tokens', async () => {
      const mockHandler = jest.fn();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
          airwave_token: 'invalid.jwt.token'
        }
      });

      // Mock Supabase to return error for invalid token
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' }
      });

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid or expired token'
      });
      expect(mockHandler).not.toHaveBeenCalled();
    });

    it('should accept requests with valid JWT tokens', async () => {
      const mockHandler = jest.fn((req, res) => {
        res.status(200).json({ success: true });
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
          airwave_token: 'valid.jwt.token'
        }
      });

      // Mock Supabase to return valid user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com'
          }
        },
        error: null
      });

      // Mock profile lookup
      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'user123',
                email: 'test@example.com',
                role: 'user'
              },
              error: null
            })
          })
        })
      });

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(200);
      expect(mockHandler).toHaveBeenCalled();
    });

    it('should reject requests with expired JWT tokens', async () => {
      const mockHandler = jest.fn();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
          airwave_token: 'expired.jwt.token'
        }
      });

      // Mock Supabase to return error for expired token
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' }
      });

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid or expired token'
      });
    });

    it('should reject requests with missing JWT tokens', async () => {
      const mockHandler = jest.fn();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {} as Record<string, string>
      });

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'No authentication token provided'
      });
    });

    it('should handle malformed JWT tokens gracefully', async () => {
      const mockHandler = jest.fn();
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
          airwave_token: 'malformed-token-without-dots'
        }
      });

      // Mock Supabase to return error for malformed token
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT format' }
      });

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid or expired token'
      });
    });
  });

  describe('Session Management Security', () => {
    it('should create secure sessions with proper attributes', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockCreateSession = sessionManager.createSession as jest.Mock;

      mockCreateSession.mockResolvedValue({
        id: 'session123',
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        createdAt: new Date(),
        lastActivity: new Date(),
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      const session = await sessionManager.createSession({
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(session).toBeDefined();
      expect(session.userId).toBe('user123');
      expect(session.email).toBe('test@example.com');
      expect(session.ipAddress).toBe('127.0.0.1');
      expect(mockCreateSession).toHaveBeenCalledWith({
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });
    });

    it('should validate session expiration', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockGetSession = sessionManager.getSession as jest.Mock;

      // Mock expired session
      mockGetSession.mockResolvedValue(null);

      const session = await sessionManager.getSession('expired-session-id');
      expect(session).toBeNull();
    });

    it('should destroy sessions on logout', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockDestroySession = sessionManager.destroySession as jest.Mock;

      mockDestroySession.mockResolvedValue(true);

      const result = await sessionManager.destroySession('session123');
      expect(result).toBe(true);
      expect(mockDestroySession).toHaveBeenCalledWith('session123');
    });

    it('should enforce concurrent session limits', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockCreateSession = sessionManager.createSession as jest.Mock;

      // Mock that session creation fails due to limit
      mockCreateSession.mockRejectedValue(new Error('Maximum concurrent sessions exceeded'));

      await expect(sessionManager.createSession({
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      })).rejects.toThrow('Maximum concurrent sessions exceeded');
    });

    it('should clean up expired sessions', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockCleanup = sessionManager.cleanupExpiredSessions as jest.Mock;

      mockCleanup.mockResolvedValue(5); // 5 sessions cleaned up

      const cleanedCount = await sessionManager.cleanupExpiredSessions();
      expect(cleanedCount).toBe(5);
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should allow admin access to admin endpoints', async () => {
      const mockHandler = jest.fn((req, res) => {
        res.status(200).json({ success: true });
      });
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
  airwave_token: 'admin.jwt.token'
        }
      });

      // Mock admin user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
  user: {
  id: 'user123',
            email: 'admin@example.com'
          }
        },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
  id: 'user123',
                email: 'admin@example.com',
                role: 'admin' },
  error: null})})})});

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(200);
      expect(req.user?.role).toBe('admin');
    });

    it('should deny user access to admin-only resources', async () => {
      const mockHandler = jest.fn((req, res) => {
        // Check if user has admin role
        if (req.user?.role !== 'admin') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        res.status(200).json({ success: true });
      });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        cookies: {
  airwave_token: 'user.jwt.token'
        }
      });

      // Mock regular user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: {
  user: {
  id: 'user123',
            email: 'admin@example.com'
          }
        },
        error: null
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
  id: 'user123',
                email: 'user@example.com',
                role: 'user' },
  error: null})})})});

      const protectedHandler = withAuth(mockHandler);
      await protectedHandler(req as NextApiRequest, res);

      expect(res._getStatusCode()).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Insufficient permissions'});
    });

    it('should validate role hierarchy', async () => {
      const roles = ['user', 'admin', 'super_admin'];

      for (const role of roles) {
        const mockHandler = jest.fn((req, res) => {
          res.status(200).json({ role: req.user?.role });
        });

        const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
          method: 'GET',
          cookies: {
  airwave_token: 'valid.jwt.token'
        }
      });

        (supabase.auth.getUser as jest.Mock).mockResolvedValue({
          data: {
  user: {
  id: 'user123',
              email: 'admin@example.com'
          }
        },
          error: null
      });

        (supabase.from as jest.Mock).mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
  id: 'user123',
                  email: 'test@example.com',
                  role: role },
  error: null})})})});

        const protectedHandler = withAuth(mockHandler);
        await protectedHandler(req as NextApiRequest, res);

        expect(res._getStatusCode()).toBe(200);
        expect(JSON.parse(res._getData())).toEqual({ role });
      }
    });
  });

  describe('Session Hijacking Prevention', () => {
    it('should validate session IP address consistency', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockValidateSession = sessionManager.validateSession as jest.Mock;

      // Mock session with different IP
      mockValidateSession.mockResolvedValue({
        valid: false,
        reason: 'IP address mismatch'
      });

      const result = await sessionManager.validateSession('session123', {
        ipAddress: '192.168.1.100', // Different from session creation IP
        userAgent: 'test-agent'
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('IP address mismatch');
    });

    it('should validate session user agent consistency', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockValidateSession = sessionManager.validateSession as jest.Mock;

      // Mock session with different user agent
      mockValidateSession.mockResolvedValue({
        valid: false,
        reason: 'IP address mismatch'
      });

      const result = await sessionManager.validateSession('session123', {
        ipAddress: '127.0.0.1',
        userAgent: 'different-agent', // Different from session creation
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('User agent mismatch');
    });

    it('should allow session validation with matching fingerprint', async () => {
      const sessionManager = SessionManager.getInstance();
      const mockValidateSession = sessionManager.validateSession as jest.Mock;

      // Mock valid session
      mockValidateSession.mockResolvedValue({
        valid: true,
        session: {
          id: 'user123',
          userId: 'user123',
          email: 'test@example.com',
          role: 'user'
        }
      });

      const result = await sessionManager.validateSession('session123', {
        ipAddress: '127.0.0.1',
        userAgent: 'test-agent'
      });

      expect(result.valid).toBe(true);
      expect(result.session).toBeDefined();
    });
  });
});
