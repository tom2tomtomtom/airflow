import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse, ErrorCode } from '@/utils/api';

// Simple in-memory rate limiting
// In production, use Redis or another distributed cache
const rateLimit = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  limit: number;
  windowMs: number;
  keyGenerator?: (req: NextApiRequest) => string;
}

export function withRateLimit(options: RateLimitOptions) {
  const {
    limit = 60,
    windowMs = 60 * 1000, // 1 minute
    keyGenerator = (req) => {
      // Use IP address as default key
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      return `${ip}`;
    },
  } = options;

  return function (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
    return async function (req: NextApiRequest, res: NextApiResponse) {
      // Generate key for this request
      const key = keyGenerator(req);
      
      // Get current time
      const now = Date.now();
      
      // Get or create rate limit entry
      let entry = rateLimit.get(key);
      
      if (!entry || entry.resetTime < now) {
        // Create new entry or reset if window has passed
        entry = { count: 0, resetTime: now + windowMs };
        rateLimit.set(key, entry);
      }
      
      // Increment count
      entry.count++;
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - entry.count).toString());
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000).toString());
      
      // Check if rate limit exceeded
      if (entry.count > limit) {
        return errorResponse(
          res,
          ErrorCode.RATE_LIMIT_EXCEEDED,
          'Too many requests, please try again later',
          429
        );
      }
      
      // Call the handler
      return handler(req, res);
    };
  };
}
