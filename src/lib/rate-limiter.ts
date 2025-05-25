import Redis from 'ioredis';
import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { env } from './env';
import { logger } from './logger';

// Initialize Redis client
const redis = env.REDIS_URL 
  ? new Redis(env.REDIS_URL, {
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    })
  : null;

// Redis health check
if (redis) {
  redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });
  
  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });
}

// Create rate limiters with fallback to memory if Redis is unavailable
export const createRateLimiter = (options: {
  points: number;
  duration: number;
  keyPrefix: string;
}) => {
  if (redis) {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: `rate_limit:${options.keyPrefix}`,
      points: options.points,
      duration: options.duration,
      execEvenly: false,
    });
  }
  
  // Fallback to memory rate limiter if Redis is not available
  logger.warn(`Using in-memory rate limiter for ${options.keyPrefix} - Redis not available`);
  return new RateLimiterMemory({
    points: options.points,
    duration: options.duration,
    execEvenly: false,
  });
};

// Pre-configured rate limiters
export const rateLimiters = {
  // Auth endpoints - strict limits
  auth: createRateLimiter({
    points: 5,
    duration: 60, // 5 requests per minute
    keyPrefix: 'auth',
  }),
  
  // API endpoints - moderate limits
  api: createRateLimiter({
    points: 100,
    duration: 60, // 100 requests per minute
    keyPrefix: 'api',
  }),
  
  // File upload endpoints - strict limits
  upload: createRateLimiter({
    points: 10,
    duration: 300, // 10 uploads per 5 minutes
    keyPrefix: 'upload',
  }),
  
  // AI generation endpoints - expensive operations
  ai: createRateLimiter({
    points: 20,
    duration: 3600, // 20 requests per hour
    keyPrefix: 'ai',
  }),
};

// Middleware factory
export const rateLimitMiddleware = (limiterName: keyof typeof rateLimiters) => {
  return async (req: any, res: any, next: any) => {
    const limiter = rateLimiters[limiterName];
    const key = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    
    try {
      await limiter.consume(key);
      
      // Add rate limit headers
      const rateLimiterRes = await limiter.get(key);
      if (rateLimiterRes) {
        res.setHeader('X-RateLimit-Limit', limiter.points);
        res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints || 0);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString());
      }
      
      next();
    } catch (error) {
      // Rate limit exceeded
      res.setHeader('Retry-After', String(Math.round(error.msBeforeNext / 1000)) || '60');
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Please try again later',
        retryAfter: Math.round(error.msBeforeNext / 1000),
      });
    }
  };
};

// Helper function for manual rate limit checking
export const checkRateLimit = async (
  limiterName: keyof typeof rateLimiters,
  key: string
): Promise<{ allowed: boolean; remaining?: number; resetAt?: Date }> => {
  const limiter = rateLimiters[limiterName];
  
  try {
    const rateLimiterRes = await limiter.get(key);
    
    if (!rateLimiterRes) {
      return { allowed: true, remaining: limiter.points };
    }
    
    return {
      allowed: rateLimiterRes.remainingPoints > 0,
      remaining: rateLimiterRes.remainingPoints,
      resetAt: new Date(Date.now() + rateLimiterRes.msBeforeNext),
    };
  } catch (error) {
    logger.error('Rate limit check error:', error);
    return { allowed: true }; // Fail open in case of errors
  }
};

// Clean up on exit
if (redis) {
  process.on('SIGTERM', () => {
    redis.disconnect();
  });
}

export default rateLimiters;
