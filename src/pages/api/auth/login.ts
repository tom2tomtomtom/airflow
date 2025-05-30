import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    token: string;
    role?: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password }: LoginRequest = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email and password are required' 
    });
  }

  try {
    // Check if we're in demo mode, use mock auth
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      // Mock user credentials for demo mode
      const validCredentials = [
        { email: 'test@airwave.com', password: 'testpass123', name: 'Test User', role: 'admin' },
        { email: 'demo@airwave.com', password: 'demo123', name: 'Demo User', role: 'admin' },
      ];

      const user = validCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid email or password' 
        });
      }

      // Generate mock token
      const token = 'demo-jwt-token-' + Date.now();

      return res.status(200).json({
        success: true,
        user: {
          id: 'demo-user-' + Date.now(),
          email: user.email,
          name: user.name,
          role: user.role,
          token,
        },
      });
    }

    // Production mode: Use Supabase authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(401).json({ 
        success: false, 
        error: authError?.message || 'Invalid email or password' 
      });
    }

    // Get user profile from database
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // If profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email || email,
          name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          role: 'user',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile'
        });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: newProfile.id,
          email: newProfile.email,
          name: newProfile.name,
          role: newProfile.role,
          token: authData.session?.access_token || '',
        },
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        token: authData.session?.access_token || '',
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}