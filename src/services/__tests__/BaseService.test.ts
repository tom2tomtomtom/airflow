import { BaseService } from '../BaseService';
import { getLogger } from '@/lib/logger';
import { classifyError } from '@/lib/error-handling/error-classifier';
import { cached } from '@/lib/cache/redis-cache';

// Mock the dependencies
jest.mock('@/lib/logger');
jest.mock('@/lib/error-handling/error-classifier');
jest.mock('@/lib/cache/redis-cache');

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

const mockGetLogger = getLogger as jest.Mock;
const mockClassifyError = classifyError as jest.Mock;
const mockCached = cached as jest.Mock;

mockGetLogger.mockReturnValue(mockLogger);
mockClassifyError.mockReturnValue({
  type: 'test_error',
  category: 'server',
  severity: 'medium',
  originalError: new Error('Test error'),
});

// Mock the cached function to return a function
mockCached.mockImplementation((fn, keyGen, options) => {
  return fn; // Return the original function for simplicity
});

// Create concrete implementation for testing
class TestService extends BaseService {
  constructor() {
    super('test-service');
  }

  async testMethod(shouldError = false): Promise<string> {
    if (shouldError) {
      throw new Error('Test error');
    }
    return 'success';
  }

  async testCachedMethod(key: string): Promise<string> {
    return this.cached(
      async () => `cached-result-${key}`,
      () => `test-${key}`,
      { ttl: 60 }
    )();
  }

  async testMethodWithLogging(): Promise<void> {
    this.logOperation('test-operation', { param: 'value' });
  }

  async testMethodWithError(): Promise<void> {
    return this.executeOperation('test-operation', async () => {
      throw new Error('Test error');
    });
  }
}

describe('BaseService', () => {
  let testService: TestService;

  beforeEach(() => {
    jest.clearAllMocks();
    testService = new TestService();
  });

  describe('Constructor', () => {
    it('should initialize with service name and logger', () => {
      // Create a new instance to test constructor behavior
      jest.clearAllMocks();
      const newTestService = new TestService();
      
      expect(mockGetLogger).toHaveBeenCalledWith('test-service');
      expect(newTestService.getServiceName()).toBe('test-service');
      expect(newTestService['logger']).toBe(mockLogger);
    });
  });

  describe('Error Handling', () => {
    it('should handle and classify errors properly', async () => {
      try {
        await testService.testMethodWithError();
      } catch (error) {
        expect(mockClassifyError).toHaveBeenCalledWith(
          error,
          expect.objectContaining({
            route: 'test-service',
            operation: 'test-operation'
          })
        );
      }
    });

    it('should log errors with proper context', async () => {
      try {
        await testService.testMethodWithError();
      } catch (error) {
        // The error should be classified and logged
        expect(mockLogger.error).toHaveBeenCalledWith(
          'test-operation failed',
          expect.any(Error),
          expect.objectContaining({
            service: 'test-service',
            operation: 'test-operation'
          })
        );
      }
    });
  });

  describe('Caching', () => {
    it('should use cached function for caching operations', async () => {
      const result = await testService.testCachedMethod('test-key');
      
      expect(mockCached).toHaveBeenCalledWith(
        expect.any(Function),
        expect.any(Function),
        { ttl: 60 }
      );
      expect(result).toBe('cached-result-test-key');
    });
  });

  describe('Logging', () => {
    it('should log operations with context', async () => {
      await testService.testMethodWithLogging();
      
      expect(mockLogger.info).toHaveBeenCalledWith(
        'test-operation',
        expect.objectContaining({
          service: 'test-service',
          operation: 'test-operation',
          param: 'value'
        })
      );
    });

    it('should provide access to logger methods', () => {
      testService['logger'].info('test message', { context: 'test' });
      
      expect(mockLogger.info).toHaveBeenCalledWith('test message', { context: 'test' });
    });
  });

  describe('Service Configuration', () => {
    it('should allow access to service name', () => {
      expect(testService.getServiceName()).toBe('test-service');
    });

    it('should provide health check method', async () => {
      const health = await testService.healthCheck();
      
      expect(health).toEqual({
        service: 'test-service',
        status: 'healthy',
        timestamp: expect.any(Date),
        version: expect.any(String),
        metadata: expect.objectContaining({
          initialized: false,
          metrics: expect.objectContaining({
            operationCount: expect.any(Number),
            errorCount: expect.any(Number),
            averageResponseTime: expect.any(Number),
            customMetrics: expect.any(Object)
          })
        })
      });
    });

    it('should return service version', () => {
      expect(testService.getVersion()).toBe('1.0.0');
    });

    it('should check initialization status', () => {
      expect(testService.isServiceInitialized()).toBe(false);
    });
  });

  describe('Service Lifecycle', () => {
    it('should handle initialization', async () => {
      await testService.initialize();
      
      expect(testService.isServiceInitialized()).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service initialized',
        expect.objectContaining({
          service: 'test-service'
        })
      );
    });

    it('should handle cleanup', async () => {
      await testService.initialize();
      await testService.cleanup();
      
      expect(testService.isServiceInitialized()).toBe(false);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service cleanup completed',
        expect.objectContaining({
          service: 'test-service'
        })
      );
    });

    it('should not initialize twice', async () => {
      await testService.initialize();
      await testService.initialize();
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Service already initialized',
        expect.objectContaining({
          service: 'test-service'
        })
      );
    });
  });

  describe('Metrics', () => {
    it('should track operation metrics', () => {
      testService.recordMetric('test_operation', 100);
      
      const metrics = testService.getMetrics();
      expect(metrics.customMetrics.test_operation).toBe(100);
      
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Metric recorded',
        expect.objectContaining({
          service: 'test-service',
          metric: 'test_operation',
          value: 100
        })
      );
    });

    it('should return metrics copy', () => {
      const metrics1 = testService.getMetrics();
      const metrics2 = testService.getMetrics();
      
      expect(metrics1).not.toBe(metrics2); // Different objects
      expect(metrics1).toEqual(metrics2); // Same content
    });
  });

  describe('Operation Execution', () => {
    it('should execute operations with metrics tracking', async () => {
      const result = await testService['executeOperation']('test-op', async () => 'success');
      
      expect(result).toBe('success');
      const metrics = testService.getMetrics();
      expect(metrics.operationCount).toBe(1);
      expect(metrics.lastOperationTime).toBeInstanceOf(Date);
    });

    it('should track errors in metrics', async () => {
      try {
        await testService.testMethodWithError();
      } catch (error) {
        const metrics = testService.getMetrics();
        expect(metrics.errorCount).toBe(1);
      }
    });
  });

  describe('Service Errors', () => {
    it('should create service-specific errors', () => {
      const error = testService['createServiceError']('Test message', 'TEST_CODE', { detail: 'value' });
      
      expect(error).toEqual({
        message: '[test-service] Test message',
        code: 'TEST_CODE',
        details: expect.objectContaining({
          service: 'test-service',
          version: '1.0.0',
          detail: 'value'
        })
      });
    });
  });
});