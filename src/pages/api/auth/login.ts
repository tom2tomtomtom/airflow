import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '@/lib/env';

// Input validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

type ResponseData = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
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
    // Validate input
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: ' + validationResult.error.errors.map(e => e.message).join(', ')
      });
    }

    const { email, password } = validationResult.data;

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error('Supabase authentication error:', authError);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get user profile from our profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      // If profile doesn't exist, create one
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile'
        });
      }

      profile = newProfile;
    }

    // Create JWT token with proper expiry from env
    const tokenPayload = {
      sub: authData.user.id,
      email: authData.user.email,
      role: profile?.role || 'user',
      iat: Math.floor(Date.now() / 1000),
    };

    // Parse expiry duration (e.g., "7d" -> 7 days)
    const expiryMatch = env.JWT_EXPIRY.match(/(\d+)([dhms])/);
    let expirySeconds = 86400; // Default 24 hours
    
    if (expiryMatch) {
      const [, num, unit] = expiryMatch;
      const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400
      };
      expirySeconds = parseInt(num) * (multipliers[unit] || 86400);
    }

    const token = jwt.sign(
      { ...tokenPayload, exp: Math.floor(Date.now() / 1000) + expirySeconds },
      env.JWT_SECRET,
      { algorithm: 'HS256' }
    );

    // Set secure HTTP-only cookie
    const cookieOptions = [
      `auth_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${expirySeconds}`,
      env.NODE_ENV === 'production' ? 'Secure' : ''
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    // Return success response
    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: profile?.full_name || profile?.first_name || email.split('@')[0],
        role: profile?.role || 'user',
      },
      token, // Also return token for client-side storage if needed
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
