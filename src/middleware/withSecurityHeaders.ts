import { NextApiRequest, NextApiResponse } from 'next';

export function withSecurityHeaders(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get Supabase URL from environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    // Build CSP with proper font and connection sources
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self'"
    ];
    
    if (supabaseUrl) {
      csp[csp.length - 1] += ` ${supabaseUrl}`;
    }
    
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', csp.join('; '));
    
    // Add Permissions-Policy header
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=()');
    
    // Add HSTS header in production
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 
        'max-age=31536000; includeSubDomains; preload');
    }
    
    // Call the handler
    return handler(req, res);
  };
}
