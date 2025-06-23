/**
 * 🧪 Errors API Tests
 * Tests for /api/errors endpoint functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

// Simple error handler mock
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Mock error data
  const errors = [
    {
      id: '1',
      message: 'Sample error 1',
      timestamp: new Date().toISOString(),
      level: 'error' }
    {
      id: '2', 
      message: 'Sample error 2',
      timestamp: new Date().toISOString(),
      level: 'warning'
    }
  ];

  return res.status(200).json({
    success: true,
    data: errors,
    meta: {},
  count: errors.length,
      timestamp: new Date().toISOString()
    }
  });
};

describe('/api/errors', () => {
  it('should return errors list successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'});

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      success: true,
      data: expect.any(Array),
      meta: expect.objectContaining({
        count: expect.any(Number),
        timestamp: expect.any(String)})});
    
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toHaveProperty('id');
    expect(data.data[0]).toHaveProperty('message');
  });

  it('should reject non-GET methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST'});

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method Not Allowed'
    });
  });

  it('should handle other HTTP methods correctly', async () => {
    const methods = ['PUT', 'DELETE', 'PATCH'];
    
    for (const method of methods) {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method});

      await handler(req, res);
      expect(res._getStatusCode()).toBe(405);
    }
  });
});