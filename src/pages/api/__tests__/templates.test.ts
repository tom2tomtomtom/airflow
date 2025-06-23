/**
 * 🧪 Templates API Tests
 * Tests for /api/templates endpoint functionality
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';

// Simple templates handler mock
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Mock templates data
  const templates = [
    {
      id: 'template-1',
      name: 'Marketing Video Template',
      description: 'Professional marketing video template',
      category: 'marketing',
      duration: 30,
      thumbnail: 'https://example.com/thumb1.jpg',
      created_at: new Date().toISOString()
    },
    {
      id: 'template-2',
      name: 'Product Demo Template', 
      description: 'Template for product demonstrations',
      category: 'product',
      duration: 60,
      thumbnail: 'https://example.com/thumb2.jpg',
      created_at: new Date().toISOString()
    }
  ];

  // Filter by category if provided
  const category = req.query.category as string;
  const filteredTemplates = category 
    ? templates.filter(t => t.category === category)
    : templates;

  return res.status(200).json({
    success: true,
    data: filteredTemplates,
    meta: {
      total: filteredTemplates.length,
      categories: ['marketing', 'product', 'social'],
      timestamp: new Date().toISOString()
    }
  });
};

describe('/api/templates', () => {
  it('should return templates list successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      success: true,
      data: expect.any(Array),
      meta: expect.objectContaining({
        total: expect.any(Number),
        categories: expect.any(Array),
        timestamp: expect.any(String),
      }),
    });
    
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data[0]).toHaveProperty('id');
    expect(data.data[0]).toHaveProperty('name');
    expect(data.data[0]).toHaveProperty('category');
  });

  it('should filter templates by category', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { category: 'marketing' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
    expect(data.data[0].category).toBe('marketing');
  });

  it('should return empty list for non-existent category', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      query: { category: 'non-existent' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const data = JSON.parse(res._getData());
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(0);
  });

  it('should reject non-GET methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method Not Allowed'
    });
  });

  it('should include template metadata', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    const data = JSON.parse(res._getData());
    const template = data.data[0];
    
    expect(template).toHaveProperty('duration');
    expect(template).toHaveProperty('thumbnail');
    expect(template).toHaveProperty('created_at');
    expect(typeof template.duration).toBe('number');
    expect(typeof template.thumbnail).toBe('string');
  });
});