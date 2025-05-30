import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

interface SignupResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    token: string;
    role?: string;
  };
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SignupResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { email, password, name }: SignupRequest = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ 
      success: false, 
      error: 'Email, password, and name are required' 
    });
  }

  // Basic validation
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long'
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      error: 'Please enter a valid email address'
    });
  }

  try {
    // Debug log for troubleshooting
    console.log('Signup attempt:', { email, name, demoMode: process.env.NEXT_PUBLIC_DEMO_MODE });
    
    // Check if we're in demo mode - allow demo signups but simulate them
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      // Simulate successful signup in demo mode
      const demoUser = {
        id: 'demo-user-' + Date.now(),
        email: email,
        name: name,
        role: 'user',
        token: 'demo-token-' + Math.random().toString(36).substring(7),
      };

      return res.status(200).json({
        success: true,
        user: demoUser,
        message: 'Demo account created successfully! This is a simulated signup for demonstration purposes.'
      });
    }

    // Production mode: Use Supabase authentication
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      // If Supabase is not available, provide demo mode fallback
      if (authError.message.includes('Invalid API key') || authError.message.includes('network') || authError.message.includes('connection')) {
        console.log('Supabase unavailable, using demo mode fallback');
        const demoUser = {
          id: 'demo-user-' + Date.now(),
          email: email,
          name: name,
          role: 'user',
          token: 'demo-token-' + Math.random().toString(36).substring(7),
        };

        return res.status(200).json({
          success: true,
          user: demoUser,
          message: 'Account created successfully! (Demo mode - Supabase connection unavailable)'
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        error: authError.message 
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create user account'
      });
    }

    // Check if email confirmation is required
    if (!authData.session) {
      return res.status(200).json({
        success: true,
        message: 'Please check your email for a confirmation link before logging in.',
      });
    }

    // If no email confirmation required, create user profile and log them in
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email || email,
        name: name,
        role: 'user',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to create user profile'
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
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}