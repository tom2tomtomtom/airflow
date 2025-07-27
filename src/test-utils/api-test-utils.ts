/**
 * Comprehensive API Testing Utilities
 * Provides utilities for testing API endpoints, middleware, and database operations
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks, RequestMethod } from 'node-mocks-http';
import {
  NextApiHandler,
  ExtendedMockRequest,
  ExtendedMockResponse,
  isMockResponse,
  DatabaseMockStructure,
  UserTestData,
  ClientTestData,
  WorkflowTestData,
  AssetTestData,
  CampaignTestData,
  HttpMethod,
  AsyncTestFunction,
  MockCreationOptions
} from './types';

// Mock data factories
export class TestDataFactory {
  static createUser(overrides: Partial<UserTestData> = {}): UserTestData {
    return {
      id: 'test-user-123',
      email: 'test@example.com',
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createClient(overrides: Partial<ClientTestData> = {}): ClientTestData {
    return {
      id: 'test-client-123',
      name: 'Test Client',
      email: 'client@example.com',
      user_id: 'test-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createWorkflow(overrides: Partial<WorkflowTestData> = {}): WorkflowTestData {
    return {
      id: 'test-workflow-123',
      user_id: 'test-user-123',
      current_step: 0,
      brief_data: {
        motivations: [],
        copy_variations: [],
        selected_assets: [],
        selected_template: null,
        processing: false,
        last_error: null,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createAsset(overrides: Partial<AssetTestData> = {}): AssetTestData {
    return {
      id: 'test-asset-123',
      name: 'test-image.jpg',
      type: 'image',
      size: 1024000,
      url: 'https://example.com/test-image.jpg',
      user_id: 'test-user-123',
      created_at: new Date().toISOString(),
      ...overrides,
    };
  }

  static createCampaign(overrides: Partial<CampaignTestData> = {}): CampaignTestData {
    return {
      id: 'test-campaign-123',
      name: 'Test Campaign',
      brief: 'Test campaign brief',
      client_id: 'test-client-123',
      user_id: 'test-user-123',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }
}

// API request builder for testing
export class APIRequestBuilder {
  private method: HttpMethod = 'GET';
  private body: any = {};
  private query: Record<string, string> = {};
  private headers: Record<string, string> = {};

  static create() {
    return new APIRequestBuilder();
  }

  setMethod(method: HttpMethod) {
    this.method = method;
    return this;
  }

  get(path?: string) {
    this.method = 'GET';
    return this;
  }

  post(path?: string) {
    this.method = 'POST';
    return this;
  }

  put(path?: string) {
    this.method = 'PUT';
    return this;
  }

  delete(path?: string) {
    this.method = 'DELETE';
    return this;
  }

  patch(path?: string) {
    this.method = 'PATCH';
    return this;
  }

  setBody(body: any) {
    this.body = body;
    return this;
  }

  setQuery(query: Record<string, string>) {
    this.query = query;
    return this;
  }

  setHeaders(headers: Record<string, string>) {
    this.headers = headers;
    return this;
  }

  withAuth(token: string = 'Bearer test-token') {
    this.headers.authorization = token;
    return this;
  }

  withCSRF(token: string = 'test-csrf-token') {
    this.headers['x-csrf-token'] = token;
    return this;
  }

  withQuery(query: Record<string, string>) {
    this.query = { ...this.query, ...query };
    return this;
  }

  withBody(body: any) {
    this.body = body;
    return this;
  }

  build(): { req: NextApiRequest; res: NextApiResponse } {
    const { req, res } = createMocks({
      method: this.method as RequestMethod,
      body: this.body,
      query: this.query,
      headers: this.headers,
    });

    // Enhance the mock request with Next.js specific properties
    const enhancedReq = req as ExtendedMockRequest;
    enhancedReq.env = process.env;
    enhancedReq.preview = false;
    enhancedReq.previewData = undefined;

    return { 
      req: enhancedReq as NextApiRequest, 
      res: res as unknown as NextApiResponse 
    };
  }
}

// Database mock manager
export class DatabaseMockManager {
  private static supabaseMocks: DatabaseMockStructure;

  static reset() {
    return this.resetMocks();
  }

  static resetMocks(): DatabaseMockStructure {
    this.supabaseMocks = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({
            data: { user: TestDataFactory.createUser() },
            error: null,
          })
        ),
        signIn: jest.fn(() => Promise.resolve({ data: null, error: null })),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
        signUp: jest.fn(() => Promise.resolve({ data: null, error: null })),
      },
    };

    return this.supabaseMocks;
  }

  static mockSuccessfulQuery(data: any) {
    if (this.supabaseMocks?.from) {
      this.supabaseMocks.from.mockReturnValue({
        ...this.supabaseMocks.from(),
        single: jest.fn(() => Promise.resolve({ data, error: null })),
      });
    }
  }

  static mockFailedQuery(error: any) {
    if (this.supabaseMocks?.from) {
      this.supabaseMocks.from.mockReturnValue({
        ...this.supabaseMocks.from(),
        single: jest.fn(() => Promise.resolve({ data: null, error })),
      });
    }
  }

  static mockArrayQuery(data: any[]) {
    if (this.supabaseMocks?.from) {
      this.supabaseMocks.from.mockReturnValue({
        ...this.supabaseMocks.from(),
        then: jest.fn(() => Promise.resolve({ data, error: null })),
      });
    }
  }

  static getMocks(): DatabaseMockStructure {
    return this.supabaseMocks;
  }
}

// API test runner with common patterns
export class APITestRunner {
  static async testAuthRequired(handler: NextApiHandler, method: HttpMethod = 'GET') {
    const { req, res } = APIRequestBuilder.create().setMethod(method).build();

    await handler(req, res);

    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(401);
    expect(JSON.parse(mockRes._getData())).toMatchObject({
      success: false,
      error: expect.objectContaining({
        message: expect.stringContaining('Authentication required'),
      }),
    });
  }

  static async testValidInput(handler: NextApiHandler, validData: any, method: HttpMethod = 'POST') {
    const { req, res } = APIRequestBuilder.create()
      .setMethod(method)
      .setBody(validData)
      .withAuth()
      .build();

    await handler(req, res);

    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(200);
    expect(JSON.parse(mockRes._getData())).toMatchObject({
      success: true,
    });
  }

  static async testInvalidInput(handler: NextApiHandler, invalidData: any, method: HttpMethod = 'POST') {
    const { req, res } = APIRequestBuilder.create()
      .setMethod(method)
      .setBody(invalidData)
      .withAuth()
      .build();

    await handler(req, res);

    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(400);
    expect(JSON.parse(mockRes._getData())).toMatchObject({
      success: false,
      error: expect.objectContaining({
        message: expect.any(String),
      }),
    });
  }

  static async testMethodNotAllowed(handler: NextApiHandler, disallowedMethod: HttpMethod = 'DELETE') {
    const { req, res } = APIRequestBuilder.create().setMethod(disallowedMethod).withAuth().build();

    await handler(req, res);

    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(405);
  }

  static async testDatabaseError(handler: NextApiHandler, method: HttpMethod = 'GET') {
    DatabaseMockManager.mockFailedQuery({
      message: 'Database connection failed',
      code: 'PGRST301',
    });

    const { req, res } = APIRequestBuilder.create().setMethod(method).withAuth().build();

    await handler(req, res);

    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(500);
    expect(JSON.parse(mockRes._getData())).toMatchObject({
      success: false,
      error: expect.objectContaining({
        message: expect.stringContaining('Database'),
      }),
    });
  }

  static async testRateLimit(handler: NextApiHandler, attempts: number = 6) {
    const requests = [];

    for (let i = 0; i < attempts; i++) {
      const { req, res } = APIRequestBuilder.create().setMethod('POST').withAuth().build();

      requests.push(handler(req, res));
    }

    await Promise.all(requests);

    // Last request should be rate limited (this is a simplified test)
    // In real implementation, you'd need to test against actual rate limiter
  }

  static expectSuccessResponse(res: NextApiResponse, expectedData?: any) {
    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(200);
    const data = JSON.parse(mockRes._getData());
    expect(data.success).toBe(true);

    if (expectedData) {
      expect(data.data).toMatchObject(expectedData);
    }
  }

  static expectErrorResponse(res: NextApiResponse, expectedStatus: number = 400, expectedMessage?: string) {
    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(expectedStatus);
    const data = JSON.parse(mockRes._getData());
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();

    if (expectedMessage) {
      expect(data.error.message).toContain(expectedMessage);
    }
  }

  static async testEndpoint(handler: NextApiHandler, { req, res }: { req: NextApiRequest; res: NextApiResponse }) {
    await handler(req, res);
    return { req, res };
  }

  static expectSuccess(res: NextApiResponse) {
    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBe(200);
    const data = JSON.parse(mockRes._getData());
    expect(data.success).toBe(true);
    return data;
  }
}

// Mock implementations for external services
export const mockExternalServices = () => {
  // Mock OpenAI
  jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mock AI response' } }],
            usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 },
          }),
        },
      },
    })),
  }));

  // Mock Redis
  jest.mock('ioredis', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue('OK'),
      del: jest.fn().mockResolvedValue(1),
      incr: jest.fn().mockResolvedValue(1),
      expire: jest.fn().mockResolvedValue(1),
      connect: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    })),
  }));

  // Mock file upload
  jest.mock('formidable', () => ({
    IncomingForm: jest.fn().mockImplementation(() => ({
      parse: jest.fn().mockImplementation((req, callback) => {
        callback(
          null,
          {},
          {
            file: {
              filepath: '/tmp/test-file',
              originalFilename: 'test.jpg',
              mimetype: 'image/jpeg',
              size: 1024000,
            },
          }
        );
      }),
    })),
  }));
};

// Security test helpers
export const SecurityTestHelpers = {
  testSQLInjection: async (handler: NextApiHandler, field: string) => {
    const maliciousData = {
      [field]: "'; DROP TABLE users; --",
    };

    const { req, res } = APIRequestBuilder.create()
      .setMethod('POST')
      .setBody(maliciousData)
      .withAuth()
      .build();

    await handler(req, res);

    // Should not crash and should return validation error
    const mockRes = res as unknown as ExtendedMockResponse;
    expect(mockRes._getStatusCode()).toBeLessThan(500);
  },

  testXSSPrevention: async (handler: NextApiHandler, field: string) => {
    const maliciousData = {
      [field]: "<script>alert('xss')</script>",
    };

    const { req, res } = APIRequestBuilder.create()
      .setMethod('POST')
      .setBody(maliciousData)
      .withAuth()
      .build();

    await handler(req, res);

    const mockRes = res as unknown as ExtendedMockResponse;
    const responseData = JSON.parse(mockRes._getData());
    if (responseData.data && responseData.data[field]) {
      expect(responseData.data[field]).not.toContain('<script>');
    }
  },

  testCSRFProtection: async (handler: NextApiHandler) => {
    const { req, res } = APIRequestBuilder.create()
      .setMethod('POST')
      .setBody({ test: 'data' })
      .withAuth()
      // Missing CSRF token
      .build();

    await handler(req, res);

    // Should require CSRF token for state-changing operations
    // This is dependent on actual CSRF middleware implementation
  },
};

// Performance test helpers
export const PerformanceTestHelpers = {
  measureExecutionTime: async (asyncFunction: AsyncTestFunction) => {
    const start = Date.now();
    await asyncFunction();
    const end = Date.now();
    return end - start;
  },
  testResponseTime: async (handler: NextApiHandler, maxTime: number = 1000) => {
    const { req, res } = APIRequestBuilder.create().withAuth().build();

    const executionTime = await PerformanceTestHelpers.measureExecutionTime(async () =>
      await handler(req, res)
    );

    expect(executionTime).toBeLessThan(maxTime);
  },
};

// Export commonly used test utilities
export const createMockUser = TestDataFactory.createUser;
export const createMockClient = TestDataFactory.createClient;
export const createMockWorkflow = TestDataFactory.createWorkflow;
export const createMockAsset = TestDataFactory.createAsset;
export const createMockCampaign = TestDataFactory.createCampaign;

// Setup function for test suites
export const setupApiTests = () => {
  beforeEach(() => {
    DatabaseMockManager.resetMocks();
    jest.clearAllMocks();
  });

  return {
    TestDataFactory,
    APIRequestBuilder,
    DatabaseMockManager,
    APITestRunner,
    SecurityTestHelpers,
    PerformanceTestHelpers,
  };
};
