import { getErrorMessage } from '@/utils/errorUtils';
import * as Sentry from '@sentry/nextjs';

export class AppError extends Error {
  public readonly isOperational: boolean;
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401, true);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409, true);
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super(
      'Too many requests',
      'RATE_LIMIT_ERROR',
      429,
      true,
      { retryAfter }
    );
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(
      `External service error: ${service}`,
      'EXTERNAL_SERVICE_ERROR',
      502,
      true,
      { service, originalError: originalError?.message }
    );
  }
}

// Error handler function
export function handleError(error: Error | AppError): void {
  if (error instanceof AppError && error.isOperational) {
    // Operational errors - expected errors that we can handle gracefully
    console.error(`Operational error [${error.code}]:`, error.message);
    
    // Log to monitoring but don't alert
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        level: 'warning',
        tags: {
          error_type: 'operational',
          error_code: error.code,
        },
      });
    }
  } else {
    // Programming errors - unexpected errors that need immediate attention
    console.error('Critical error:', error);
    
    // Alert immediately in production
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        level: 'error',
        tags: {
          error_type: 'critical',
        },
      });
    }
  }
}

// API error response helper
export function createErrorResponse(error: Error | AppError) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        ...(error.details && { details: error.details }),
      },
    };
  }
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production') {
    return {
      error: {
        message: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
    };
  }
  
  return {
    error: {
      message: error.message,
      code: 'INTERNAL_ERROR',
      stack: error.stack,
    },
  };
}

// Async error wrapper for API routes
export function withErrorHandler(
  handler: (req: any, res: any) => Promise<void>
) {
  return async (req: any, res: any) => {
    try {
      await handler(req, res);
    } catch (error) {
    const message = getErrorMessage(error);
      handleError(error as Error);
      
      const statusCode = error instanceof AppError ? error.statusCode : 500;
      const response = createErrorResponse(error as Error);
      
      res.status(statusCode).json(response);
    }
  };
}

// React error boundary error handler
export function handleReactError(error: Error, errorInfo: any) {
  console.error('React error boundary:', error, errorInfo);
  
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
}
