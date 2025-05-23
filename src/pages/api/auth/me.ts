import type { NextApiRequest, NextApiResponse } from 'next';
import { jwtVerify } from 'jose';

type ResponseData = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
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
    // Get token from cookie or header
    const tokenFromCookie = req.cookies.auth_token;
    const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    // Verify the token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Validate payload structure
    if (!payload.sub || !payload.role || !payload.exp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure'
      });
    }

    // Check token expiration (jwtVerify already does this, but adding explicit check)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Return user info
    return res.status(200).json({
      success: true,
      user: {
        id: payload.sub as string,
        email: payload.email as string,
        role: payload.role as string,
      }
    });

  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}