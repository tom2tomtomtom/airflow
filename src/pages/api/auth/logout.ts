import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

type ResponseData = {
  success: boolean;
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
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

    // Sign out from Supabase if we have a token
    if (token) {
      try {
        // Note: For JWT tokens, we primarily rely on client-side cleanup
        // and token expiration. Supabase doesn't maintain server-side 
        // session state for JWT tokens.
        await supabase.auth.signOut();
      } catch (error) {
        // Continue with logout even if Supabase signout fails
        console.warn('Supabase signout warning:', error);
      }
    }

    // Clear the HTTP-only cookie
    res.setHeader('Set-Cookie', [
      'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear the cookie even if there's an error
    res.setHeader('Set-Cookie', [
      'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
    ]);

    return res.status(200).json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  }
}