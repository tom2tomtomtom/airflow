import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { env } from '@/lib/env';

type ResponseData = {
  success: boolean;
  csrfToken?: string;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Generate a secure random CSRF token
    const csrfToken = crypto.randomBytes(32).toString('hex');
    
    // Set the token in a secure HTTP-only cookie
    const cookieOptions = [
      `csrf_token=${csrfToken}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict', // Strict for CSRF protection
      'Max-Age=3600', // 1 hour
      env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    // Return the token to be included in request headers
    return res.status(200).json({
      success: true,
      csrfToken,
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate CSRF token' 
    });
  }
}
