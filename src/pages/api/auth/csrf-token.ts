/**
 * CSRF Token API Endpoint
 * Provides CSRF tokens for client-side security
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { handleCSRFTokenRequest } from '@/utils/csrf';
import { rateLimiters } from '@/utils/rateLimit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Apply rate limiting
  await new Promise<void>((resolve, reject) => {
    rateLimiters.general(req, res, () => resolve());
  });
  
  // Handle CSRF token request
  return handleCSRFTokenRequest(req, res);
}
