import type { NextApiRequest, NextApiResponse } from 'next';

interface DebugLoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    token: string;
    role: string;
  };
  error?: string;
  debug?: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebugLoginResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Debug information
    const debug = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      receivedEmail: email,
      receivedPassword: !!password,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...',
    };

    // For testing purposes, allow the specific test credentials
    if (email === 'tomh@redbaez.com' && password === 'Wijlre2010') {
      // Create a mock user session
      const mockUser = {
        id: 'test-user-id-123',
        email: email,
        name: 'Tom H',
        token: 'mock-jwt-token-for-testing',
        role: 'admin',
      };

      // Set cookie for session
      const maxAge = 7 * 24 * 60 * 60; // 7 days
      const cookieSettings = `HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/`;
      
      res.setHeader('Set-Cookie', [
        `airwave_token=${mockUser.token}; ${cookieSettings}`,
        `airwave_refresh_token=mock-refresh-token; ${cookieSettings}`
      ]);

      return res.status(200).json({
        success: true,
        user: mockUser,
        debug: debug
      });
    }

    // If not test credentials, return error with debug info
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials or Supabase not configured',
      debug: debug
    });

  } catch (error) {
    console.error('Debug login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      debug: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }
    });
  }
}
