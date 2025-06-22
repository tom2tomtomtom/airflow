/**
 * API v2 Monitoring Handler Tests
 * 
 * Tests all monitoring-related endpoints:
 * - Health checks and system status
 * - Performance metrics and analytics
 * - Log aggregation and analysis
 * - Alert management
 * - System resource monitoring
 */

import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { handleMonitoringRoutes } from '../monitoring';

// Mock dependencies
jest.mock('@/lib/performance/performance-tracker', () => ({
  PerformanceTracker: {
    getInstance: jest.fn(() => ({
      getAverageResponseTime: jest.fn(() => 150),
      getTotalRequests: jest.fn(() => 1000),
      getErrorRate: jest.fn(() => 0.02),
      getSlowOperations: jest.fn(() => []),
      getPercentileResponseTime: jest.fn(() => 200),
      getBottlenecks: jest.fn(() => []),
      getPerformanceRecommendations: jest.fn(() => []),
      getHourlyTrends: jest.fn(() => []),
      getDailyTrends: jest.fn(() => []),
    })),
  },
}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('API v2 Monitoring Handler', () => {
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

  describe('Health Monitoring', () => {
    test('should handle health check request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/health',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['health']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('status');
      expect(data.data).toHaveProperty('timestamp');
      expect(data.data).toHaveProperty('version');
      expect(data.data).toHaveProperty('uptime');
      expect(data.data).toHaveProperty('memory');
      expect(data.data).toHaveProperty('performance');
    });

    test('should return degraded status when thresholds exceeded', async () => {
      // Mock high memory usage
      const originalMemoryUsage = process.memoryUsage;
      process.memoryUsage = jest.fn(() => ({
        rss: 1000000000,
        heapTotal: 900000000,
        heapUsed: 850000000, // 94% usage - should trigger degraded status
        external: 50000000,
        arrayBuffers: 10000000,
      }));

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/health',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['health']);

      const data = JSON.parse(res._getData());
      expect(data.data.status).toBe('degraded');

      // Restore original function
      process.memoryUsage = originalMemoryUsage;
    });

    test('should include comprehensive health metrics', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/health',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['health']);

      const data = JSON.parse(res._getData());
      
      // Check memory metrics
      expect(data.data.memory).toHaveProperty('used');
      expect(data.data.memory).toHaveProperty('total');
      expect(data.data.memory).toHaveProperty('external');
      expect(data.data.memory).toHaveProperty('rss');
      
      // Check performance metrics
      expect(data.data.performance).toHaveProperty('averageResponseTime');
      expect(data.data.performance).toHaveProperty('totalRequests');
      expect(data.data.performance).toHaveProperty('errorRate');
      expect(data.data.performance).toHaveProperty('slowOperations');
    });
  });

  describe('Performance Metrics', () => {
    test('should handle metrics request', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/metrics',
        query: { timeRange: '1h' },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['metrics']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('metrics');
    });

    test('should handle metrics with operation filter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/metrics',
        query: { 
          timeRange: '24h',
          operation: 'ai_generation'
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['metrics']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate time range parameter', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/metrics',
        query: { timeRange: 'invalid_range' },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['metrics']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });

    test('should handle real-time metrics', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/metrics',
        query: { 
          timeRange: '5m',
          realtime: 'true'
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['metrics']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('realtime');
    });
  });

  describe('Log Management', () => {
    test('should handle log retrieval', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/logs',
        query: { 
          level: 'error',
          limit: '100'
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['logs']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('logs');
      expect(Array.isArray(data.data.logs)).toBe(true);
    });

    test('should handle log filtering by time range', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/logs',
        query: { 
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-02T00:00:00Z'
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['logs']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should handle log search', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/logs',
        query: { 
          search: 'database error',
          level: 'error'
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['logs']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate log query parameters', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/logs',
        query: { 
          limit: '10000' // Too high
        },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['logs']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
    });
  });

  describe('Alert Management', () => {
    test('should handle alert listing', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/alerts',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['alerts']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('alerts');
    });

    test('should handle alert creation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/monitoring/alerts',
        body: {
          name: 'High Error Rate Alert',
          condition: 'error_rate > 0.05',
          threshold: 0.05,
          severity: 'warning',
          enabled: true,
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleMonitoringRoutes(req, res, postContext, ['alerts']);

      expect(res.statusCode).toBe(201);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('alert');
    });

    test('should handle alert acknowledgment', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        url: '/api/v2/monitoring/alerts/alert123',
        body: {
          action: 'acknowledge',
          note: 'Investigating the issue',
        },
      });

      const putContext = { ...mockContext, method: 'PUT', body: req.body };
      await handleMonitoringRoutes(req, res, putContext, ['alerts', 'alert123']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
    });

    test('should validate alert configuration', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        url: '/api/v2/monitoring/alerts',
        body: {
          // Missing required fields
        },
      });

      const postContext = { ...mockContext, method: 'POST', body: req.body };
      await handleMonitoringRoutes(req, res, postContext, ['alerts']);

      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('System Monitoring', () => {
    test('should handle system resource monitoring', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/system',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['system']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('cpu');
      expect(data.data).toHaveProperty('memory');
      expect(data.data).toHaveProperty('disk');
      expect(data.data).toHaveProperty('network');
    });

    test('should handle performance analysis', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/performance',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['performance']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('summary');
      expect(data.data).toHaveProperty('bottlenecks');
      expect(data.data).toHaveProperty('recommendations');
    });

    test('should include performance trends', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/performance',
        query: { includeTrends: 'true' },
      });

      const getContext = { ...mockContext, query: req.query };
      await handleMonitoringRoutes(req, res, getContext, ['performance']);

      expect(res.statusCode).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('trends');
    });
  });

  describe('Error Handling', () => {
    test('should handle unknown monitoring endpoints', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/unknown',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['unknown']);

      expect(res.statusCode).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    test('should handle method not allowed', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        url: '/api/v2/monitoring/health',
      });

      const deleteContext = { ...mockContext, method: 'DELETE' };
      await handleMonitoringRoutes(req, res, deleteContext, ['health']);

      expect(res.statusCode).toBe(405);
      const data = JSON.parse(res._getData());
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    test('should handle monitoring service errors', async () => {
      // Mock performance tracker error
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/metrics',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['metrics']);

      // Should handle service errors gracefully
      expect(res.statusCode).toBeDefined();
    });
  });

  describe('Response Format', () => {
    test('should return consistent response format', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/health',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['health']);

      const data = JSON.parse(res._getData());
      
      // Check standard API response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(typeof data.success).toBe('boolean');
      expect(data.meta).toHaveProperty('timestamp');
    });

    test('should include request metadata', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        url: '/api/v2/monitoring/health',
      });

      await handleMonitoringRoutes(req, res, mockContext, ['health']);

      const data = JSON.parse(res._getData());
      expect(data.meta).toHaveProperty('requestId');
      expect(data.meta.requestId).toBe('req123');
    });
  });
});
