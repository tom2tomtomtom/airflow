import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import { getLogger } from '@/lib/logger';

const logger = getLogger('api/auth/logout');

interface LogoutResponse {
  success: boolean;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Get token from cookies
    const token = req.cookies.airwave_token;

    if (token) {
      // Try to sign out from Supabase
      try {
        if (supabase) {
          await supabase.auth.signOut();
        }
      } catch (error: any) {
        logger.error('Supabase signout error:', error);
        // Continue with cookie clearing even if Supabase signout fails
      }
    }

    // Clear authentication cookies
    res.setHeader('Set-Cookie', [
      'airwave_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
      'airwave_refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);

    // Still clear cookies even if there's an error
    res.setHeader('Set-Cookie', [
      'airwave_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
      'airwave_refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}
