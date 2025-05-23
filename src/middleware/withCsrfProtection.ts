import { NextApiRequest, NextApiResponse } from 'next';
import { errorResponse, ErrorCode } from '@/utils/api';

export function withCsrfProtection(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
      return handler(req, res);
    }
    
    // Check for CSRF token in headers
    const csrfToken = req.headers['x-csrf-token'];
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    
    // Validate CSRF token
    if (!csrfToken) {
      return errorResponse(
        res,
        ErrorCode.FORBIDDEN,
        'CSRF token missing',
        403
      );
    }
    
    // Check origin and referer
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    if (origin && !origin.startsWith(appUrl)) {
      return errorResponse(
        res,
        ErrorCode.FORBIDDEN,
        'Invalid origin',
        403
      );
    }
    
    if (referer && !referer.startsWith(appUrl)) {
      return errorResponse(
        res,
        ErrorCode.FORBIDDEN,
        'Invalid referer',
        403
      );
    }
    
    // Call the handler
    return handler(req, res);
  };
}
