// utils/errorUtils.ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleApiError(error: unknown, defaultMessage = 'Internal server error'): {
  message: string;
  statusCode: number;
  code?: string;
} {
  if (isAppError(error)) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code
    };
  }
  
  const message = getErrorMessage(error);
  return {
    message: message || defaultMessage,
    statusCode: 500
  };
}

export function logError(error: unknown, context?: Record<string, any>): void {
  console.error('Error:', {
    message: getErrorMessage(error),
    stack: error instanceof Error ? error.stack : undefined,
    context
  });
}
