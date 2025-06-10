/**
 * Rate limiting middleware for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRateLimitError } from '@/lib/errors/errorHandler';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// In-memory store for rate limiting (use Redis in production)
const store = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple rate limiter implementation
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<boolean> => {
    // Get client identifier (IP address or user ID)
    const clientId = getClientId(request);
    
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Clean up expired entries
    for (const [key, value] of store.entries()) {
      if (value.resetTime < now) {
        store.delete(key);
      }
    }
    
    // Get current rate limit data
    const current = store.get(clientId);
    
    if (!current || current.resetTime < now) {
      // First request in window or window has expired
      store.set(clientId, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }
    
    // Check if limit exceeded
    if (current.count >= config.maxRequests) {
      return false;
    }
    
    // Increment counter
    current.count++;
    return true;
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientId(request: NextRequest): string {
  // Try to get user ID from auth header first
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT token if possible
    try {
      const token = authHeader.replace('Bearer ', '');
      // In a real implementation, you'd decode the JWT
      // For now, just use the token as identifier
      return `user:${token.substring(0, 10)}`;
    } catch {
      // Fall through to IP-based identification
    }
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip:${ip}`;
}

/**
 * Common rate limit configurations
 */
export const RateLimitConfigs = {
  // Strict rate limit for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  
  // General API rate limit
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
  
  // AI generation rate limit
  aiGeneration: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 generations per minute
  },
  
  // File upload rate limit
  upload: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 uploads per minute
  },
} as const;

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const rateLimiter = createRateLimiter(config);
  
  return async (request: NextRequest): Promise<NextResponse> => {
    const allowed = await rateLimiter(request);
    
    if (!allowed) {
      const error = createRateLimitError();
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    
    return handler(request);
  };
}