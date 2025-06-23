/**
 * 🧪 Status API Endpoint Tests
 * Tests for /api/status endpoint functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '../status';

describe('/api/status', () => {
  it('should return status OK with timestamp', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'});

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String)});
    
    // Verify timestamp is a valid ISO string
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it('should work with POST method (method agnostic)', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST'});

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.status).toBe('ok');
  });

  it('should return fresh timestamp on each call', async () => {
    const { req: req1, res: res1 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'});

    const { req: req2, res: res2 } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'});

    await handler(req1, res1);
    await new Promise(resolve => setTimeout(resolve, 1)); // Wait 1ms
    await handler(req2, res2);

    const data1 = JSON.parse(res1._getData());
    const data2 = JSON.parse(res2._getData());

    expect(data1.timestamp).not.toBe(data2.timestamp);
  });
});