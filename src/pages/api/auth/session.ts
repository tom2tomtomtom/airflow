import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * Session API endpoint
 * Returns current authentication session status
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create Supabase client with server-side auth
    const supabase = createServerSupabaseClient({ req, res });
    
    // Get current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      return res.status(500).json({ 
        error: 'Internal server error',
        authenticated: false 
      });
    }

    if (!session) {
      return res.status(200).json({
        authenticated: false,
        session: null,
        user: null
      });
    }

    // Return session information (excluding sensitive data)
    return res.status(200).json({
      authenticated: true,
      session: Record<string, unknown>$1
  access_token: session.access_token ? '[REDACTED]' : null,
        expires_at: session.expires_at,
        expires_in: session.expires_in,
        token_type: session.token_type },
  user: Record<string, unknown>$1
  id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        created_at: session.user.created_at,
        last_sign_in_at: session.user.last_sign_in_at
      }
    });

  } catch (error: any) {
    console.error('Session API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      authenticated: false 
    });
  }
}