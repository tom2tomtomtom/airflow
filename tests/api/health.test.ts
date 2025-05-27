import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/health';

describe('/api/health', () => {
  it('should return healthy status', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    
    const json = JSON.parse(res._getData());
    expect(json.status).toBe('healthy');
    expect(json.timestamp).toBeDefined();
    expect(json.checks).toBeDefined();
    expect(json.checks.database).toBeDefined();
    expect(json.checks.redis).toBeDefined();
    expect(json.checks.storage).toBeDefined();
  });

  it('should return 503 if critical service is down', async () => {
    // Mock a database failure
    jest.mock('@supabase/supabase-js', () => ({
      createClient: () => ({
        from: () => ({
          select: () => ({
            limit: () => ({
              single: () => Promise.reject(new Error('Database connection failed')),
            }),
          }),
        }),
      }),
    }));

    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(503);
    const json = JSON.parse(res._getData());
    expect(json.status).toBe('unhealthy');
  });

  it('should only allow GET requests', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
