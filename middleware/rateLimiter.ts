import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { AuthenticationError, RateLimitError } from '@/lib/errors/errorHandler';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Rate limiter configurations
export const rateLimiters = {
  // Authentication endpoints - strict limits
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
    analytics: true,
  }),
  
  // General API endpoints
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),
  
  // File upload endpoints
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 uploads per hour
    analytics: true,
  }),
  
  // Render endpoints - resource intensive
  render: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '5 m'), // 10 renders per 5 minutes
    analytics: true,
  }),
  
  // Email sending
  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 emails per hour
    analytics: true,
  }),
  
  // Client approval portal - more lenient
  approval: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '10 m'), // 50 requests per 10 minutes
    analytics: true,
  }),
};

// Get identifier for rate limiting
function getIdentifier(req: NextApiRequest): string {
  // Try to get user ID from session/JWT
  const userId = (req as any).userId || (req as any).session?.user?.id;
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0]
    : req.socket.remoteAddress;
    
  return `ip:${ip || 'unknown'}`;
}

// Rate limit middleware
export function withRateLimit(
  limiterName: keyof typeof rateLimiters,
  options?: {
    skipForAdmin?: boolean;
    customIdentifier?: (req: NextApiRequest) => string;
    costFunction?: (req: NextApiRequest) => number;
  }
) {
  return async function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void | Promise<void>
  ) {
    try {
      // Skip rate limiting for admin users if configured
      if (options?.skipForAdmin && (req as any).user?.role === 'admin') {
        return next();
      }
      
      const identifier = options?.customIdentifier
        ? options.customIdentifier(req)
        : getIdentifier(req);
        
      const limiter = rateLimiters[limiterName];
      const cost = options?.costFunction ? options.costFunction(req) : 1;
      
      const result = await limiter.limit(identifier, { rate: cost });
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', result.limit);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', new Date(result.reset).toISOString());
      
      if (!result.success) {
        res.setHeader('Retry-After', Math.ceil((result.reset - Date.now()) / 1000));
        
        throw new RateLimitError(result.reset);
      }
      
      return next();
    } catch (error) {
    const message = getErrorMessage(error);
      if (error instanceof RateLimitError) {
        return res.status(429).json({
          error: {
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_ERROR',
            retryAfter: error.details?.retryAfter,
          },
        });
      }
      
      // Redis connection error - fail open (allow request)
      console.error('Rate limiter error:', error);
      return next();
    }
  };
}

// Higher-order function for API routes
export function withRateLimitedRoute(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  limiterName: keyof typeof rateLimiters = 'api',
  options?: Parameters<typeof withRateLimit>[1]
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise<void>((resolve, reject) => {
      withRateLimit(limiterName, options)(req, res, () => resolve());
    });
    
    return handler(req, res);
  };
}

// Utility to check rate limit without consuming
export async function checkRateLimit(
  identifier: string,
  limiterName: keyof typeof rateLimiters
): Promise<{
  remaining: number;
  limit: number;
  reset: number;
}> {
  const limiter = rateLimiters[limiterName];
  
  // This is a workaround - Upstash doesn't have a native check method
  // We'll use a very small window to check
  const testLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000000, '1 ms'), // Effectively no limit
  });
  
  const result = await testLimiter.limit(identifier);
  
  return {
    remaining: result.remaining,
    limit: result.limit,
    reset: result.reset,
  };
}

// Rate limit by resource (e.g., per client)
export function withResourceRateLimit(
  getResourceId: (req: NextApiRequest) => string,
  limitsPerResource: number,
  window: string
) {
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limitsPerResource, window as any),
    prefix: 'resource',
  });
  
  return withRateLimit('api', {
    customIdentifier: (req) => {
      const userId = getIdentifier(req);
      const resourceId = getResourceId(req);
      return `${userId}:${resourceId}`;
    },
  });
}

// IP-based rate limiting for public endpoints
export const withIPRateLimit = withRateLimit('api', {
  customIdentifier: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded
      ? (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0]
      : req.socket.remoteAddress;
    return `ip:${ip || 'unknown'}`;
  },
});

// Stricter rate limiting for authentication endpoints
export const withAuthRateLimit = withRateLimit('auth');

// Cost-based rate limiting for expensive operations
export function withCostBasedRateLimit(
  costFunction: (req: NextApiRequest) => number
) {
  return withRateLimit('api', { costFunction });
}
