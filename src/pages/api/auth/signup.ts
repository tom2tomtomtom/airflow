import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Input validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
});

type ResponseData = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    emailConfirmed: boolean;
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
    const validationResult = signupSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input: ' + validationResult.error.errors.map(e => e.message).join(', ')
      });
    }

    const { email, password, name, firstName, lastName } = validationResult.data;
    
    // Determine full name - ensure it's always a string
    let fullName: string;
    
    if (name) {
      fullName = name;
    } else if (firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    } else if (firstName) {
      fullName = firstName;
    } else if (lastName) {
      fullName = lastName;
    } else {
      fullName = email.split('@')[0];
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      console.error('Supabase signup error:', authError);
      
      // Handle specific error cases
      if (authError.message.includes('already registered')) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }
      
      if (authError.message.includes('Password')) {
        return res.status(400).json({
          success: false,
          message: 'Password does not meet requirements'
        });
      }

      return res.status(400).json({
        success: false,
        message: authError.message || 'Failed to create account'
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Create user profile in our profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName,
        role: 'user', // Default role
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail the request if profile creation fails, as the user is already created
      console.warn('User created but profile creation failed - user can still log in');
    }

    // If user is immediately confirmed (no email verification required)
    if (authData.user.email_confirmed_at) {
      // Create JWT token
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }

      const tokenPayload = {
        sub: authData.user.id,
        email: authData.user.email,
        role: 'user',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

      // Set secure HTTP-only cookie
      const isProduction = process.env.NODE_ENV === 'production';
      res.setHeader('Set-Cookie', [
        `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${24 * 60 * 60}${isProduction ? '; Secure' : ''}`
      ]);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: fullName,
          role: 'user',
          emailConfirmed: true,
        },
        token,
      });
    } else {
      // Email confirmation required
      return res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email to verify your account.',
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: fullName,
          role: 'user',
          emailConfirmed: false,
        },
      });
    }

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}