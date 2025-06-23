/**
 * CSRF Token Generation Endpoint
 * Provides CSRF tokens for client-side applications
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { generateCsrfTokenAPI } from '@/middleware/withCsrfProtection';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed'  }
    });
  }

  return generateCsrfTokenAPI(req, res);
}
