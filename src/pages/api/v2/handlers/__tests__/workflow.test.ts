/**
 * API v2 Workflow Handler Tests
 * 
 * Tests all workflow-related endpoints:
 * - State management
 * - Asset selection and generation
 * - Brief upload and parsing
 * - Motivation and copy generation
 * - Template selection and matrix building
 * - Final rendering
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleWorkflowRoutes } from '../workflow';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {},
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))}))})),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: { id: 'test-id' }, error: null }))}))})),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))}))}))}}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('API v2 Workflow Handler', () => {
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

  describe('Workflow State Management', () => {
    test('should handle GET workflow state', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/state',
        query: { workflowId: 'workflow123' }});

      await handleWorkflowRoutes(req, res, mockContext, ['state']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should handle POST workflow state update', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/state',
        body: {},
          workflowId: 'workflow123',
          currentStep: 'brief_upload',
          data: { briefContent: 'Test brief content' }}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['state']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate required fields for state update', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/state',
        body: {},
          // Missing required fields
        }});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['state']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Asset Management', () => {
    test('should handle GET workflow assets', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/assets',
        query: { clientId: 'client123' }});

      const getContext = { ...mockContext, query: req.query };
      await handleWorkflowRoutes(req, res, getContext, ['assets']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('assets');
    });

    test('should handle POST asset selection', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/assets',
        body: {},
          workflowId: 'workflow123',
          selectedAssets: ['asset1', 'asset2']}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['assets']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should handle asset generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/generate-assets',
        body: {},
          workflowId: 'workflow123',
          prompt: 'Generate a professional business image',
          style: 'corporate',
          count: 3}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['generate-assets']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('generationId');
    });
  });

  describe('Brief Processing', () => {
    test('should handle brief upload', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/brief',
        body: {},
          workflowId: 'workflow123',
          briefContent: 'This is a test brief for a new campaign...',
          briefType: 'text'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['brief']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('briefId');
    });

    test('should handle brief file upload', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/brief',
        body: {},
          workflowId: 'workflow123',
          briefUrl: 'https://example.com/brief.pdf',
          briefType: 'pdf'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['brief']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate brief content', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/brief',
        body: {},
          workflowId: 'workflow123',
          // Missing brief content
        }});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['brief']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Motivation Generation', () => {
    test('should handle motivation generation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/motivations',
        body: {},
          workflowId: 'workflow123',
          briefId: 'brief123',
          count: 5}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['motivations']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('motivations');
    });

    test('should handle motivation selection', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        url: '/api/v2/workflow/motivations',
        body: {},
          workflowId: 'workflow123',
          selectedMotivations: ['motivation1', 'motivation2']}});

      const putContext = { ...mockContext, method: 'PUT', body: req.body };
      await handleWorkflowRoutes(req, res, putContext, ['motivations']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate motivation generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/motivations',
        body: {},
          workflowId: 'workflow123',
          // Missing briefId
        }});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['motivations']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  describe('Copy Generation', () => {
    test('should handle copy generation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/copy',
        body: {},
          workflowId: 'workflow123',
          motivationIds: ['motivation1', 'motivation2'],
          copyType: 'social_media',
          platform: 'facebook'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['copy']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('copyVariations');
    });

    test('should handle copy selection', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        url: '/api/v2/workflow/copy',
        body: {},
          workflowId: 'workflow123',
          selectedCopy: ['copy1', 'copy2']}});

      const putContext = { ...mockContext, method: 'PUT', body: req.body };
      await handleWorkflowRoutes(req, res, putContext, ['copy']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Template Selection', () => {
    test('should handle template listing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/templates',
        query: { platform: 'facebook', format: 'video' }});

      const getContext = { ...mockContext, query: req.query };
      await handleWorkflowRoutes(req, res, getContext, ['templates']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('templates');
    });

    test('should handle template selection', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/templates',
        body: {},
          workflowId: 'workflow123',
          templateId: 'template123'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['templates']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });
  });

  describe('Matrix Building', () => {
    test('should handle matrix generation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/matrix',
        body: {},
          workflowId: 'workflow123',
          selectedAssets: ['asset1', 'asset2'],
          selectedCopy: ['copy1', 'copy2'],
          templateId: 'template123'}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['matrix']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('matrix');
    });

    test('should validate matrix generation request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/matrix',
        body: {},
          workflowId: 'workflow123',
          // Missing required fields
        }});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['matrix']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  describe('Final Rendering', () => {
    test('should handle render request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/workflow/render',
        body: {},
          workflowId: 'workflow123',
          matrixId: 'matrix123',
          renderOptions: {},
            quality: 'high',
            format: 'mp4'}}});

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleWorkflowRoutes(req, res, postContext, ['render']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('renderId');
    });

    test('should handle render status check', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/render',
        query: { renderId: 'render123' }});

      const getContext = { ...mockContext, query: req.query };
      await handleWorkflowRoutes(req, res, getContext, ['render']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status');
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown workflow endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/unknown'});

      await handleWorkflowRoutes(req, res, mockContext, ['unknown']);

      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    test('should handle method not allowed', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        url: '/api/v2/workflow/state'});

      const deleteContext = { ...mockContext, method: 'DELETE' };
      await handleWorkflowRoutes(req, res, deleteContext, ['state']);

      expect(res.statusCode).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    test('should handle authentication errors', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/workflow/state'});

      const unauthContext = { ...mockContext, user: null };
      await handleWorkflowRoutes(req, res, unauthContext, ['state']);

      expect(res.statusCode).toBe(401);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });
  });
});
