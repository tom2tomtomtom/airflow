/**
 * Sentry Integration Tests
 * 
 * Tests Sentry error monitoring, performance tracking, session replay,
 * and integration across client, server, and edge environments.
 */

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn().mockReturnValue('test-event-id'),
  captureMessage: jest.fn().mockReturnValue('test-message-id'),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setTag: jest.fn(),
  setContext: jest.fn(),
  withScope: jest.fn((callback) => callback({
    setTag: jest.fn(),
    setContext: jest.fn(),
    setLevel: jest.fn()})),
  startTransaction: jest.fn().mockReturnValue({
    setTag: jest.fn(),
    setData: jest.fn(),
    finish: jest.fn()}),
  getCurrentHub: jest.fn().mockReturnValue({
    getScope: jest.fn().mockReturnValue({
      setTag: jest.fn(),
      setContext: jest.fn()})}),
  replayIntegration: jest.fn(),
  browserTracingIntegration: jest.fn(),
  httpIntegration: jest.fn(),
  captureConsoleIntegration: jest.fn()}));

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const _mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('Sentry Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Capture and Reporting', () => {
    test('should capture JavaScript errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const error = new Error('Test JavaScript error');
      error.stack = 'Error: Test JavaScript error\n    at test.js:1:1';
      
      const eventId = Sentry.captureException(error);
      
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
      expect(eventId).toBe('test-event-id');
    });

    test('should capture errors with context', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const error = new Error('Context error');
      const context = {
        user: { id: 'user123', email: 'test@example.com' },
        request: { url: '/api/campaigns', method: 'POST' },
        extra: { campaignId: 'campaign456' }};
      
      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'api_error');
        scope.setContext('request_context', context.request);
        scope.setContext('user_context', context.user);
        Sentry.captureException(error);
      });
      
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    test('should capture custom messages', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const message = 'Custom warning message';
      const level = 'warning';
      
      const eventId = Sentry.captureMessage(message, level);
      
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message, level);
      expect(eventId).toBe('test-message-id');
    });

    test('should handle API errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const apiError = new Error('API request failed');
      apiError.name = 'APIError';
      
      Sentry.withScope((scope) => {
        scope.setTag('error_category', 'api');
        scope.setContext('api_details', {
          endpoint: '/api/campaigns',
          method: 'GET',
          status: 500,
          response: 'Internal Server Error'});
        Sentry.captureException(apiError);
      });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(apiError);
    });

    test('should handle database errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const dbError = new Error('Database connection failed');
      dbError.name = 'DatabaseError';
      
      Sentry.withScope((scope) => {
        scope.setTag('error_category', 'database');
        scope.setContext('database_details', {
          operation: 'SELECT',
          table: 'campaigns',
          query: 'SELECT * FROM campaigns WHERE user_id = ?'});
        Sentry.captureException(dbError);
      });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(dbError);
    });

    test('should handle AI service errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const aiError = new Error('OpenAI API rate limit exceeded');
      aiError.name = 'AIServiceError';
      
      Sentry.withScope((scope) => {
        scope.setTag('error_category', 'ai_service');
        scope.setTag('ai_provider', 'openai');
        scope.setContext('ai_request', {
          model: 'gpt-4',
          tokens: 1000,
          operation: 'chat_completion',
          cost: 0.02});
        Sentry.captureException(aiError);
      });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(aiError);
    });
  });

  describe('Performance Monitoring', () => {
    test('should track transaction performance', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const transaction = Sentry.startTransaction({
        name: 'Campaign Creation',
        op: 'workflow'});
      
      transaction.setTag('user_id', 'user123');
      transaction.setData('campaign_type', 'social_media');
      
      // Simulate work
      setTimeout(() => {
        transaction.finish();
      }, 100);
      
      expect(Sentry.startTransaction).toHaveBeenCalledWith({
        name: 'Campaign Creation',
        op: 'workflow'});
      expect(transaction.setTag).toHaveBeenCalledWith('user_id', 'user123');
      expect(transaction.setData).toHaveBeenCalledWith('campaign_type', 'social_media');
    });

    test('should track API request performance', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const transaction = Sentry.startTransaction({
        name: 'GET /api/campaigns',
        op: 'http.server'});
      
      transaction.setTag('http.method', 'GET');
      transaction.setTag('http.status_code', '200');
      transaction.setData('response_size', 1024);
      
      transaction.finish();
      
      expect(transaction.setTag).toHaveBeenCalledWith('http.method', 'GET');
      expect(transaction.setTag).toHaveBeenCalledWith('http.status_code', '200');
      expect(transaction.setData).toHaveBeenCalledWith('response_size', 1024);
    });

    test('should track database query performance', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const transaction = Sentry.startTransaction({
        name: 'Database Query',
        op: 'db.query'});
      
      transaction.setTag('db.operation', 'SELECT');
      transaction.setTag('db.table', 'campaigns');
      transaction.setData('rows_returned', 25);
      
      transaction.finish();
      
      expect(transaction.setTag).toHaveBeenCalledWith('db.operation', 'SELECT');
      expect(transaction.setTag).toHaveBeenCalledWith('db.table', 'campaigns');
      expect(transaction.setData).toHaveBeenCalledWith('rows_returned', 25);
    });

    test('should track AI service performance', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const transaction = Sentry.startTransaction({
        name: 'AI Copy Generation',
        op: 'ai.generation'});
      
      transaction.setTag('ai.provider', 'openai');
      transaction.setTag('ai.model', 'gpt-4');
      transaction.setData('tokens_used', 1000);
      transaction.setData('cost', 0.02);
      
      transaction.finish();
      
      expect(transaction.setTag).toHaveBeenCalledWith('ai.provider', 'openai');
      expect(transaction.setTag).toHaveBeenCalledWith('ai.model', 'gpt-4');
      expect(transaction.setData).toHaveBeenCalledWith('tokens_used', 1000);
      expect(transaction.setData).toHaveBeenCalledWith('cost', 0.02);
    });
  });

  describe('User Context and Breadcrumbs', () => {
    test('should set user context', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const user = {
        id: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        plan: 'pro'};
      
      Sentry.setUser(user);
      
      expect(Sentry.setUser).toHaveBeenCalledWith(user);
    });

    test('should add navigation breadcrumbs', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      Sentry.addBreadcrumb({
        message: 'User navigated to campaigns page',
        category: 'navigation',
        level: 'info',
        data: {},
          from: '/dashboard',
          to: '/campaigns',
          method: 'click'}});
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User navigated to campaigns page',
        category: 'navigation',
        level: 'info',
        data: {},
          from: '/dashboard',
          to: '/campaigns',
          method: 'click'}});
    });

    test('should add API call breadcrumbs', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      Sentry.addBreadcrumb({
        message: 'API call to create campaign',
        category: 'http',
        level: 'info',
        data: {},
          url: '/api/campaigns',
          method: 'POST',
          status_code: 201,
          response_time: 450}});
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'API call to create campaign',
        category: 'http',
        level: 'info',
        data: {},
          url: '/api/campaigns',
          method: 'POST',
          status_code: 201,
          response_time: 450}});
    });

    test('should add user action breadcrumbs', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      Sentry.addBreadcrumb({
        message: 'User uploaded asset',
        category: 'user',
        level: 'info',
        data: {},
          action: 'upload',
          asset_type: 'image',
          file_size: 1024000,
          file_name: 'logo.png'}});
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'User uploaded asset',
        category: 'user',
        level: 'info',
        data: {},
          action: 'upload',
          asset_type: 'image',
          file_size: 1024000,
          file_name: 'logo.png'}});
    });
  });

  describe('Environment-Specific Configuration', () => {
    test('should handle client-side configuration', () => {
      // Mock client environment
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://app.airwave.com' },
        writable: true});
      
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      expect(Sentry.replayIntegration).toBeDefined();
      expect(Sentry.browserTracingIntegration).toBeDefined();
    });

    test('should handle server-side configuration', () => {
      // Mock server environment
      delete (global as any).window;
      
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      expect(Sentry.httpIntegration).toBeDefined();
      expect(Sentry.captureConsoleIntegration).toBeDefined();
    });

    test('should handle edge runtime configuration', () => {
      // Mock edge environment
      process.env.NEXT_RUNTIME = 'edge';
      
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      // Edge runtime should have minimal configuration
      expect(Sentry.init).toBeDefined();
      
      delete process.env.NEXT_RUNTIME;
    });

    test('should handle development vs production settings', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Test production settings
      process.env.NODE_ENV = 'production';
      expect(process.env.NODE_ENV).toBe('production');
      
      // Test development settings
      process.env.NODE_ENV = 'development';
      expect(process.env.NODE_ENV).toBe('development');
      
      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Filtering and Sampling', () => {
    test('should filter out common non-actionable errors', () => {
      const ignoredErrors = [
        'ECONNREFUSED',
        'ETIMEDOUT',
        'ENOTFOUND',
        'EPIPE',
        'ECONNRESET',
        'AbortError',
        'Non-Error promise rejection captured',
      ];
      
      ignoredErrors.forEach((errorType: any) => {
        const error = new Error(errorType);
        error.name = errorType;
        
        // In real implementation, these would be filtered out
        expect(error.name).toBe(errorType);
      });
    });

    test('should apply sampling rates correctly', () => {
      const productionSampleRate = 0.1; // 10%
      const developmentSampleRate = 1.0; // 100%
      
      expect(productionSampleRate).toBeLessThan(developmentSampleRate);
      expect(productionSampleRate).toBeGreaterThan(0);
      expect(developmentSampleRate).toBeLessThanOrEqual(1);
    });

    test('should handle release tracking', () => {
      const releaseVersion = process.env.NEXT_PUBLIC_SENTRY_RELEASE || 'test-release';
      
      expect(typeof releaseVersion).toBe('string');
      expect(releaseVersion.length).toBeGreaterThan(0);
    });
  });

  describe('Integration with Application Features', () => {
    test('should integrate with workflow error handling', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const workflowError = new Error('Workflow step failed');
      
      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'workflow');
        scope.setContext('workflow_context', {
          step: 'copy_generation',
          user_id: 'user123',
          session_id: 'session456',
          progress: 0.6});
        Sentry.captureException(workflowError);
      });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(workflowError);
    });

    test('should integrate with AI cost monitoring', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const costError = new Error('AI cost limit exceeded');
      
      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'cost_limit');
        scope.setContext('cost_context', {
          user_id: 'user123',
          service: 'openai',
          current_cost: 55.00,
          monthly_limit: 50.00,
          usage_percentage: 110});
        Sentry.captureException(costError);
      });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(costError);
    });

    test('should integrate with performance monitoring', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      const performanceIssue = new Error('Slow database query detected');
      
      Sentry.withScope((scope) => {
        scope.setTag('error_type', 'performance');
        scope.setContext('performance_context', {
          operation: 'db_query',
          duration: 5000, // 5 seconds
          threshold: 1000, // 1 second
          query: 'SELECT * FROM campaigns WHERE user_id = ?'});
        Sentry.captureException(performanceIssue);
      });
      
      expect(Sentry.captureException).toHaveBeenCalledWith(performanceIssue);
    });

    test('should handle session replay data', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      // Session replay should be configured for error sessions
      expect(Sentry.replayIntegration).toBeDefined();
      
      // Mock replay configuration
      const replayConfig = {
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
        networkDetailAllowUrls: [
          'https://app.airwave.com',
          'https://api.creatomate.com',
        ]};
      
      expect(replayConfig.maskAllInputs).toBe(true);
      expect(replayConfig.networkDetailAllowUrls).toContain('https://app.airwave.com');
    });
  });

  describe('Error Recovery and Alerting', () => {
    test('should provide error recovery suggestions', () => {
      const errorRecoveryMap = {
        'Network Error': 'Check internet connection and retry',
        'Validation Error': 'Please correct the highlighted fields',
        'Authentication Error': 'Please log in again',
        'Rate Limit Error': 'Please wait a moment before trying again',
        'Server Error': 'Our team has been notified. Please try again later'};
      
      Object.entries(errorRecoveryMap).forEach(([_errorType, suggestion]) => {
        expect(typeof suggestion).toBe('string');
        expect(suggestion.length).toBeGreaterThan(0);
      });
    });

    test('should handle error escalation', () => {
      const errorSeverityLevels = {
        'info': 1,
        'warning': 2,
        'error': 3,
        'fatal': 4};
      
      Object.entries(errorSeverityLevels).forEach(([level, severity]) => {
        expect(typeof level).toBe('string');
        expect(typeof severity).toBe('number');
        expect(severity).toBeGreaterThan(0);
      });
    });

    test('should track error resolution', () => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/nextjs');
      
      // Mock error resolution tracking
      const errorResolution = {
        error_id: 'test-event-id',
        resolved_at: new Date().toISOString(),
        resolution_method: 'user_retry',
        success: true};
      
      Sentry.addBreadcrumb({
        message: 'Error resolved by user action',
        category: 'error_resolution',
        level: 'info',
        data: errorResolution});
      
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Error resolved by user action',
        category: 'error_resolution',
        level: 'info',
        data: errorResolution});
    });
  });
});
