/**
 * API v2 Handlers Test Suite
 * Tests the core API v2 route handlers for workflow, AI, assets, and monitoring
 */

// Set environment variables before importing
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'TEST_JWT_TOKEN_PLACEHOLDER';

// Mock Supabase client before importing handlers
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({
              data: {
                id: 'test-workflow-id',
                user_id: 'test-user-123',
                current_step: 0,
                brief_data: {},
                motivations: [],
                copy_variations: [],
                selected_assets: [],
                selected_template: null,
                processing: false,
                last_error: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              },
              error: null
            }))
          }))
        })),
        range: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({
            data: [],
            error: null,
            count: 0
          }))
        }))
      })),
      upsert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({
            data: {
              id: 'test-workflow-id',
              user_id: 'test-user-123',
              current_step: 0,
              brief_data: {},
              motivations: [],
              copy_variations: [],
              selected_assets: [],
              selected_template: null,
              processing: false,
              last_error: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
            error: null
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }
}));

import { NextApiRequest, NextApiResponse } from 'next';
import { handleWorkflowRoutes } from '../handlers/workflow';
import { handleAIRoutes } from '../handlers/ai';
import { handleAssetsRoutes } from '../handlers/assets';
import { handleMonitoringRoutes } from '../handlers/monitoring';
import { RouteContext } from '../handlers/types';


// Test constants (safe for testing)
const TEST_JWT_TOKEN_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0IiwicmVmIjoidGVzdCIsInJvbGUiOiJhbm9uIn0.test-signature';
const DEFAULT_JWT_TOKEN_PLACEHOLDER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ0ZXN0IiwicmVmIjoiZGVmYXVsdCIsInJvbGUiOiJhbm9uIn0.default-signature';

// Mock the response object
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  } as unknown as NextApiResponse;
  return res;
};

// Mock the request object
const createMockRequest = (method: string = 'GET', body: any = {}) => {
  return {
    method,
    body,
    query: {},
    headers: {},
  } as NextApiRequest;
};

// Mock route context
const createMockContext = (userId: string = 'test-user-123', method: string = 'GET'): RouteContext => ({
  user: {
    id: userId,
    email: 'test@example.com',
    role: 'user',
  },
  route: [],
  method,
  body: {},
  query: {},
  requestId: 'test-request-123',
  startTime: Date.now(),
});

describe('API v2 Handlers', () => {
  describe('Workflow Routes', () => {
    test('should handle workflow state endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');
      context.query = { workflowId: 'test-workflow-id' };

      await handleWorkflowRoutes(req, res, context, ['state']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });

    test('should handle workflow brief endpoint', async () => {
      const briefData = {
        title: 'Test Campaign',
        industry: 'Technology',
        product: 'AI Platform',
        objective: 'Increase brand awareness',
        targetAudience: 'Tech professionals',
        valueProposition: 'Revolutionary AI technology',
        budget: '$50,000',
        timeline: '3 months',
        platforms: ['LinkedIn', 'Twitter'],
        keyMessages: ['Innovation', 'Leadership']
      };

      const req = createMockRequest('POST', briefData);
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'POST');

      await handleWorkflowRoutes(req, res, context, ['brief']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });

    test('should handle invalid workflow endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleWorkflowRoutes(req, res, context, ['invalid-endpoint']);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: expect.stringContaining('not found'),
          }),
        })
      );
    });

    test('should require authentication', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = { ...createMockContext('test-user-123', 'GET'), user: null };

      await handleWorkflowRoutes(req, res, context, ['state']);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: expect.stringContaining('Authentication required'),
          }),
        })
      );
    });
  });

  describe('AI Routes', () => {
    test('should handle cost-check endpoint', async () => {
      const req = createMockRequest('POST', {
        service: 'openai',
        model: 'gpt-4',
        estimatedTokens: 1000,
      });
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'POST');
      context.body = {
        service: 'openai',
        model: 'gpt-4',
        estimatedTokens: 1000,
      };

      await handleAIRoutes(req, res, context, ['cost-check']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            allowed: expect.any(Boolean),
            budgetRemaining: expect.any(Number),
          }),
        })
      );
    });

    test('should handle usage endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleAIRoutes(req, res, context, ['usage']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });

    test('should handle models endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleAIRoutes(req, res, context, ['models']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });

    test('should require authentication for AI routes', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = { ...createMockContext('test-user-123', 'GET'), user: null };

      await handleAIRoutes(req, res, context, ['usage']);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: expect.stringContaining('Authentication required'),
          }),
        })
      );
    });
  });

  describe('Assets Routes', () => {
    test('should handle assets list endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleAssetsRoutes(req, res, context, []);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array),
        })
      );
    });

    test('should handle asset upload endpoint', async () => {
      const req = createMockRequest('POST', {
        name: 'test-image.jpg',
        type: 'image',
        size: 1024000,
      });
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'POST');
      context.body = {
        name: 'test-image.jpg',
        type: 'image',
        size: 1024000,
      };

      await handleAssetsRoutes(req, res, context, ['upload']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('Monitoring Routes', () => {
    test('should handle health endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleMonitoringRoutes(req, res, context, ['health']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            status: expect.any(String),
            timestamp: expect.any(String),
          }),
        })
      );
    });

    test('should handle metrics endpoint', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleMonitoringRoutes(req, res, context, ['metrics']);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed requests gracefully', async () => {
      const req = createMockRequest('POST', 'invalid-json');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'POST');
      context.body = 'invalid-json';

      await handleWorkflowRoutes(req, res, context, ['brief']);

      // Should not crash and should return appropriate error
      expect(res.status).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle missing route parameters', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      const context = createMockContext('test-user-123', 'GET');

      await handleWorkflowRoutes(req, res, context, []);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });
  });
});
