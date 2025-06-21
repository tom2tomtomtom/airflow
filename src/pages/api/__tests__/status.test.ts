/**
 * Status API Endpoint Test Suite
 * Tests the /api/status endpoint for basic application status
 */

import { createMocks } from 'node-mocks-http';
import handler from '../status';

describe('/api/status', () => {
  test('should return status ok for any request method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String)
    });
    
    // Verify timestamp is a valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  test('should work with POST requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.status).toBe('ok');
  });

  test('should work with PUT requests', async () => {
    const { req, res } = createMocks({
      method: 'PUT',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.status).toBe('ok');
  });

  test('should return current timestamp', async () => {
    const beforeRequest = new Date();
    
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);
    
    const afterRequest = new Date();
    const data = JSON.parse(res._getData());
    const responseTime = new Date(data.timestamp);

    // Timestamp should be between before and after request
    expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
    expect(responseTime.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
  });

  test('should always return the same structure', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    
    // Should only have these two properties
    expect(Object.keys(data)).toEqual(['status', 'timestamp']);
    expect(typeof data.status).toBe('string');
    expect(typeof data.timestamp).toBe('string');
  });
});
