import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';

// Generate a secure CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

// Validate CSRF token
export function validateCSRFToken(req: NextApiRequest): boolean {
  // Skip CSRF validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method || '')) {
    return true;
  }

  // Skip CSRF validation in development for easier testing
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_CSRF === 'true') {
    return true;
  }

  const tokenFromHeader = req.headers[CSRF_HEADER_NAME] as string;
  const tokenFromCookie = req.cookies[CSRF_COOKIE_NAME];

  // Both tokens must exist and match
  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(tokenFromHeader, 'hex'),
    Buffer.from(tokenFromCookie, 'hex')
  );
}

// Set CSRF token in response
export function setCSRFToken(res: NextApiResponse, token: string): void {
  // Set as HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    [
      `${CSRF_COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`,
      ...(process.env.NODE_ENV === 'production' ? ['Secure'] : []),
    ].join('; ')
  );

  // Also send in response header for client-side access
  res.setHeader('X-CSRF-Token', token);
}

// CSRF protection middleware
export function withCSRFProtection(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Generate and set CSRF token for GET requests
    if (req.method === 'GET') {
      const token = generateCSRFToken();
      setCSRFToken(res, token);
      return handler(req, res);
    }

    // Validate CSRF token for state-changing requests
    if (!validateCSRFToken(req)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'CSRF token missing',
        },
      });
    }

    return handler(req, res);
  };
}

// Get CSRF token endpoint
export async function handleCSRFToken(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = generateCSRFToken();
  setCSRFToken(res, token);

  return res.status(200).json({
    success: true,
    token,
    message: 'CSRF token generated',
  });
}
