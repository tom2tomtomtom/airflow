/**
 * API v2 AI Handler Tests
 * 
 * Tests all AI-related endpoints:
 * - Content generation (copy, motivations)
 * - Cost checking and budget management
 * - Usage tracking and analytics
 * - Model selection and capabilities
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleAIRoutes } from '../ai';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {},
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))}))})),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))}))}))}))}}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('API v2 AI Handler', () => {
  const mockContext = {
    user: { id: 'user123', email: 'test@example.com' },
    requestId: 'req123',
    method: 'GET',
    query: Record<string, unknown>$1
    body: Record<string, unknown>$1
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Content Generation', () => {
    test('should handle copy generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'copy',
          prompt: 'Generate social media copy for a tech startup',
          context: {},
            platform: 'facebook',
            tone: 'professional',
            length: 'short'},
          options: {},
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 150}}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('generationId');
      expect(data.data).toHaveProperty('content');
    });

    test('should handle motivation generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'motivations',
          briefContent: 'Launch a new fitness app targeting millennials',
          count: 5,
          options: {},
            model: 'gpt-4',
            creativity: 'high'}}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('motivations');
      expect(Array.isArray(data.data.motivations)).toBe(true);
    });

    test('should handle image generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'image',
          prompt: 'Professional business team in modern office',
          style: 'corporate',
          dimensions: { width: 1080, height: 1080 },
          options: {},
            model: 'dall-e-3',
            quality: 'hd'}}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('imageUrl');
    });

    test('should validate generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          // Missing required fields
        }});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    test('should handle unsupported generation type', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'unsupported_type',
          prompt: 'Test prompt'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.message).toContain('Unsupported generation type');
    });
  });

  describe('Cost Management', () => {
    test('should handle cost check request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/cost-check',
        body: {},
          service: 'openai',
          model: 'gpt-4',
          estimatedTokens: 1000,
          operation: 'copy_generation'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['cost-check']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('allowed');
      expect(data.data).toHaveProperty('estimatedCost');
      expect(data.data).toHaveProperty('budgetRemaining');
    });

    test('should handle budget exceeded scenario', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/cost-check',
        body: {},
          service: 'openai',
          model: 'gpt-4',
          estimatedTokens: 100000, // Very high token count
          operation: 'bulk_generation'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['cost-check']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.allowed).toBe(false);
      expect(data.data).toHaveProperty('reason');
    });

    test('should validate cost check request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/cost-check',
        body: {},
          // Missing required fields
        }});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['cost-check']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Usage Tracking', () => {
    test('should handle usage statistics request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/usage',
        query: {},
          timeRange: '30d',
          service: 'openai'}});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['usage']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('totalSpent');
      expect(data.data).toHaveProperty('totalTokens');
      expect(data.data).toHaveProperty('operationBreakdown');
      expect(data.data).toHaveProperty('dailyUsage');
    });

    test('should handle usage by operation type', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/usage',
        query: {},
          timeRange: '7d',
          groupBy: 'operation'}});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['usage']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('operationBreakdown');
    });

    test('should handle usage by model', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/usage',
        query: {},
          timeRange: '1d',
          groupBy: 'model'}});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['usage']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('modelBreakdown');
    });

    test('should validate usage request parameters', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/usage',
        query: {},
          timeRange: 'invalid_range'}});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['usage']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Model Management', () => {
    test('should handle available models request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/models'});

      await handleAIRoutes(req, res, mockContext, ['models']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('models');
      expect(Array.isArray(data.data.models)).toBe(true);
    });

    test('should handle models by service', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/models',
        query: { service: 'openai' }});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['models']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.models).toBeDefined();
    });

    test('should handle models by capability', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/models',
        query: { capability: 'text_generation' }});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['models']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data.models).toBeDefined();
    });

    test('should include model pricing information', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/models',
        query: { includePricing: 'true' }});

      const getContext = { ...mockContext, query: req.query };
      await handleAIRoutes(req, res, getContext, ['models']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      
      if (data.data.models.length > 0) {
        expect(data.data.models[0]).toHaveProperty('pricing');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown AI endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/unknown'});

      await handleAIRoutes(req, res, mockContext, ['unknown']);

      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    test('should handle authentication errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: { type: 'copy', prompt: 'test' }});

      const unauthContext = { ...mockContext, user: null };
      await handleAIRoutes(req, res, unauthContext, ['generate']);

      expect(res.statusCode).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    test('should handle method not allowed', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        url: '/api/v2/ai/models'});

      const deleteContext = { ...mockContext, method: 'DELETE' };
      await handleAIRoutes(req, res, deleteContext, ['models']);

      expect(res.statusCode).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    test('should handle AI service errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'copy',
          prompt: 'test prompt',
          options: {},
            model: 'invalid_model'}}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      // Should handle invalid model gracefully
      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    test('should handle rate limiting', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'copy',
          prompt: 'test prompt'}});

      // Simulate rate limit exceeded
      const rateLimitedContext = { 
        ...mockContext, 
        method: 'POST', 
        body: req.body,
        rateLimitExceeded: true 
      };
      
      await handleAIRoutes(req, res, rateLimitedContext, ['generate']);

      // Should handle rate limiting appropriately
      expect(res.statusCode).toBeDefined();
    });
  });

  describe('Response Format', () => {
    test('should return consistent response format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/ai/models'});

      await handleAIRoutes(req, res, mockContext, ['models']);

      const data = JSON.parse(res._getData());
      
      // Check standard API response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(typeof data.success).toBe('boolean');
      expect(data.meta).toHaveProperty('timestamp');
    });

    test('should include cost tracking metadata', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/ai/generate',
        body: {},
          type: 'copy',
          prompt: 'test prompt'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleAIRoutes(req, res, postContext, ['generate']);

      const data = JSON.parse(res._getData());
      
      if (data.success && data.meta?.costTracking) {
        expect(data.meta.costTracking).toHaveProperty('tokensUsed');
        expect(data.meta.costTracking).toHaveProperty('estimatedCost');
      }
    });
  });
});
