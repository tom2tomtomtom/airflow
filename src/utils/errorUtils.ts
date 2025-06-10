/**
 * Utility functions for handling errors consistently across the application
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

/**
 * Safely extracts an error message from any error type
 * @param error - The error to extract message from
 * @returns A string error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return 'An unknown error occurred';
}

/**
 * Creates a standardized error object
 * @param message - Error message
 * @param code - Optional error code
 * @param status - Optional HTTP status code
 * @param details - Optional additional error details
 * @returns Standardized error object
 */
export function createError(
  message: string,
  code?: string,
  status?: number,
  details?: any
): AppError {
  return {
    message,
    code,
    status,
    details,
  };
}

/**
 * Checks if an error is a known application error
 * @param error - The error to check
 * @returns True if it's an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Safely logs an error without exposing sensitive information
 * @param error - The error to log
 * @param context - Optional context information
 */
export function logError(error: unknown, context?: string): void {
  const message = getErrorMessage(error);
  const prefix = context ? `[${context}]` : '';
  
  if (process.env.NODE_ENV === 'development') {
    console.error(`${prefix} Error:`, error);
  } else {
    // In production, only log the message to avoid exposing sensitive data
    console.error(`${prefix} Error: ${message}`);
  }
}

/**
 * Formats an error for API responses
 * @param error - The error to format
 * @returns Formatted error object suitable for API responses
 */
export function formatApiError(error: unknown): { error: string; code?: string } {
  if (isAppError(error)) {
    return {
      error: error.message,
      code: error.code,
    };
  }
  
  const message = getErrorMessage(error);
  return {
    error: message,
  };
}

/**
 * Error boundary helper for React components
 * @param error - The error that occurred
 * @param errorInfo - Additional error information
 */
export function handleComponentError(error: Error, errorInfo: any): void {
  logError(error, 'Component Error');
  
  // In production, you might want to send errors to a monitoring service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to error monitoring service
    // errorMonitoringService.captureException(error, { extra: errorInfo });
  }
}