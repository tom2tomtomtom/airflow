import { NextApiResponse } from 'next';
import { getErrorMessage } from '@/utils/errorUtils';

// Standard API response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId?: string;
  };
}

// Error codes enum
export enum ApiErrorCode {
  // Client errors (4xx)
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  METHOD_NOT_ALLOWED = 'METHOD_NOT_ALLOWED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  CSRF_INVALID = 'CSRF_INVALID',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR'}

// Success response helper
export function successResponse<T>(
  res: NextApiResponse,
  data: T,
  statusCode: number = 200,
  meta?: ApiResponse<T>['meta']
): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {},
      timestamp: new Date().toISOString(),
      ...meta}};
  
  res.status(statusCode).json(response);
}

// Error response helper
export function errorResponse(
  res: NextApiResponse,
  code: ApiErrorCode,
  message: string,
  statusCode: number = 400,
  details?: any
): void {
  const response: ApiResponse = {
    success: false,
    error: {},
      code,
      message,
      ...(details && { details })},
    meta: {},
      timestamp: new Date().toISOString()}};
  
  res.status(statusCode).json(response);
}

// Handle caught errors and return appropriate response
export function handleApiError(
  res: NextApiResponse,
  error: unknown,
  context?: string
): void {
  // Log error for monitoring (production-safe)
  if (process.env.NODE_ENV === 'development') {
    console.error(`API Error${context ? ` in ${context}` : ''}:`, error);
  }
  
  // Handle specific error types
  if (error instanceof Error) {
    // Database errors
    if (error.message.includes('database') || error.message.includes('supabase')) {
      return errorResponse(
        res,
        ApiErrorCode.DATABASE_ERROR,
        'Database operation failed',
        500,
        process.env.NODE_ENV === 'development' ? error.message : undefined
      );
    }
    
    // Validation errors
    if (error.message.includes('validation') || error.message.includes('required')) {
      return errorResponse(
        res,
        ApiErrorCode.VALIDATION_ERROR,
        error.message,
        400
      );
    }
    
    // Authentication errors
    if (error.message.includes('unauthorized') || error.message.includes('authentication')) {
      return errorResponse(
        res,
        ApiErrorCode.UNAUTHORIZED,
        'Authentication required',
        401
      );
    }
    
    // Permission errors
    if (error.message.includes('forbidden') || error.message.includes('permission')) {
      return errorResponse(
        res,
        ApiErrorCode.FORBIDDEN,
        'Insufficient permissions',
        403
      );
    }
  }
  
  // Default internal server error
  errorResponse(
    res,
    ApiErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred',
    500,
    process.env.NODE_ENV === 'development' ? getErrorMessage(error) : undefined
  );
}

// Method not allowed helper
export function methodNotAllowed(
  res: NextApiResponse,
  allowedMethods: string[]
): void {
  res.setHeader('Allow', allowedMethods);
  errorResponse(
    res,
    ApiErrorCode.METHOD_NOT_ALLOWED,
    `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    405
  );
}

// Pagination helper
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number
): NonNullable<NonNullable<ApiResponse['meta']>['pagination']> {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)};
}

// Validation helper
export function validateRequiredFields(
  data: Record<string, any>,
  requiredFields: string[]
): string[] {
  const missing: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      missing.push(field);
    }
  }
  
  return missing;
}
