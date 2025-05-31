import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' });
    }

    console.log('Testing token validation...');
    console.log('Token length:', token.length);
    console.log('Token prefix:', token.substring(0, 20) + '...');

    // Test token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('Supabase auth result:', { user: !!user, error: error?.message });

    if (error) {
      return res.json({
        success: false,
        error: error.message,
        details: {
          code: error.status,
          name: error.name
        }
      });
    }

    if (!user) {
      return res.json({
        success: false,
        error: 'No user found'
      });
    }

    // Test profile lookup
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    console.log('Profile lookup result:', { profile: !!profile, error: profileError?.message });

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        aud: user.aud,
        role: user.role
      },
      profile: profile || null,
      profileError: profileError?.message || null
    });

  } catch (error) {
    console.error('Auth debug error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}