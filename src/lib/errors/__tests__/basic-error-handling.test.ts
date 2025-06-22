/**
 * Basic Error Handling Tests
 * 
 * Tests the core error handling functionality that actually exists
 * in the codebase, focusing on practical error scenarios.
 */

import { AppError, handleError, withErrorHandler, ErrorCodes } from '../errorHandler';

// Mock console methods
const _mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Basic Error Handling Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AppError Class', () => {
    test('should create AppError with message only', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
      expect(error.context).toBeUndefined();
      expect(error.name).toBe('AppError');
    });

    test('should create AppError with all parameters', () => {
      const context = { userId: '123', action: 'update' };
      const error = new AppError('Validation failed', 400, 'VALIDATION_ERROR', context);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.context).toEqual(context);
    });

    test('should be instance of Error', () => {
      const error = new AppError('Test error');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });

    test('should have stack trace', () => {
      const error = new AppError('Test error');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('handleError Function', () => {
    test('should return AppError as-is', () => {
      const appError = new AppError('Test app error', 400, 'TEST_ERROR');
      
      const result = handleError(appError);

      expect(result).toBe(appError);
      expect(result.message).toBe('Test app error');
      expect(result.statusCode).toBe(400);
      expect(result.code).toBe('TEST_ERROR');
    });

    test('should convert generic Error to AppError', () => {
      const genericError = new Error('Generic error');
      
      const result = handleError(genericError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Generic error');
      expect(result.statusCode).toBe(500);
      expect(result.code).toBe('INTERNAL_ERROR');
    });

    test('should add context to converted errors', () => {
      const genericError = new Error('Generic error');
      const context = { operation: 'test', userId: '456' };
      
      const result = handleError(genericError, context);

      expect(result).toBeInstanceOf(AppError);
      expect(result.context).toEqual(context);
    });

    test('should handle errors without throwing', () => {
      const error = new Error('Test error');

      expect(() => handleError(error)).not.toThrow();
    });

    test('should handle null/undefined errors', () => {
      const result = handleError(null as any);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('An unknown error occurred');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('withErrorHandler HOC', () => {
    test('should handle successful operations', async () => {
      const successOperation = jest.fn().mockResolvedValue('success');
      const wrappedOperation = withErrorHandler(successOperation);

      const result = await wrappedOperation('test');
      expect(result).toBe('success');
      expect(successOperation).toHaveBeenCalledWith('test');
    });

    test('should convert errors to AppError', async () => {
      const failingOperation = jest.fn().mockRejectedValue(new Error('Test error'));
      const wrappedOperation = withErrorHandler(failingOperation);

      await expect(wrappedOperation()).rejects.toThrow(AppError);
    });

    test('should preserve AppError instances', async () => {
      const appError = new AppError('Test app error', 400, 'TEST_ERROR');
      const failingOperation = jest.fn().mockRejectedValue(appError);
      const wrappedOperation = withErrorHandler(failingOperation);

      await expect(wrappedOperation()).rejects.toThrow(appError);
    });
  });

  describe('Error Codes', () => {
    test('should have defined error codes', () => {
      expect(ErrorCodes).toBeDefined();
      expect(typeof ErrorCodes).toBe('object');
    });

    test('should use error codes in AppError', () => {
      const error = new AppError('Test error', 400, ErrorCodes.VALIDATION_ERROR);

      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });
  });

  describe('Error Context Handling', () => {
    test('should preserve error context through handling', () => {
      const context = { 
        userId: '123', 
        operation: 'create_user',
        timestamp: new Date().toISOString(),
        requestId: 'req-456'
      };
      
      const error = new AppError('User creation failed', 400, 'USER_CREATE_ERROR', context);
      const result = handleError(error);

      expect(result.context).toEqual(context);
    });

    test('should merge context when handling generic errors', () => {
      const genericError = new Error('Database timeout');
      const context = { operation: 'db_query', timeout: 5000 };
      
      const result = handleError(genericError, context);

      expect(result.context).toEqual(context);
    });

    test('should handle complex context objects', () => {
      const complexContext = {
        user: { id: '123', email: 'test@example.com' },
        request: { method: 'POST', url: '/api/users' },
        metadata: { version: '1.0', feature: 'user_management' },
        performance: { startTime: Date.now(), duration: 150 }
      };
      
      const error = new AppError('Complex operation failed', 500, 'COMPLEX_ERROR', complexContext);

      expect(error.context).toEqual(complexContext);
      expect(error.context.user.id).toBe('123');
      expect(error.context.request.method).toBe('POST');
    });
  });

  describe('Error Helper Functions', () => {
    test('should create unauthorized error', () => {
      const error = new AppError('Unauthorized access', 401, ErrorCodes.UNAUTHORIZED);

      expect(error.message).toBe('Unauthorized access');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe(ErrorCodes.UNAUTHORIZED);
    });

    test('should create validation error', () => {
      const error = new AppError('Invalid email format', 400, ErrorCodes.VALIDATION_ERROR);

      expect(error.message).toBe('Invalid email format');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe(ErrorCodes.VALIDATION_ERROR);
    });

    test('should create not found error', () => {
      const error = new AppError('User not found', 404, ErrorCodes.NOT_FOUND);

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe(ErrorCodes.NOT_FOUND);
    });
  });

  describe('Error Handling Edge Cases', () => {
    test('should handle circular reference in context', () => {
      const circularContext: any = { name: 'test' };
      circularContext.self = circularContext;
      
      // Should not throw when creating error with circular context
      expect(() => {
        new AppError('Circular context error', 400, 'CIRCULAR_ERROR', circularContext);
      }).not.toThrow();
    });

    test('should handle very large context objects', () => {
      const largeContext = {
        data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` }))
      };
      
      const error = new AppError('Large context error', 400, 'LARGE_ERROR', largeContext);
      
      expect(error.context.data).toHaveLength(1000);
    });

    test('should handle undefined message', () => {
      const error = new AppError(undefined as any);
      
      expect(error.message).toBe('');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    test('should handle non-string error codes', () => {
      const error = new AppError('Test error', 400, 123 as any);

      expect(error.code).toBe(123);
    });
  });
});
