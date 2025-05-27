import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import { validateRequest, apiSchemas, validateCSRFToken, checkAPIRateLimit } from '@/middleware/validation';
import { loggers } from '@/lib/logger';
import { NextRequest } from 'next/server';

const logger = loggers.auth.child({ endpoint: 'login' });

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

// Convert NextApiRequest to NextRequest for validation
function createNextRequest(req: NextApiRequest): NextRequest {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const headers = new Headers();
  
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  });

  const method = req.method || 'GET';
  const init: RequestInit = {
    method,
    headers,
  };
  
  if (method !== 'GET' && method !== 'HEAD' && req.body) {
    init.body = JSON.stringify(req.body);
  }
  
  return new NextRequest(url, init as any);
}

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
    // Rate limiting check
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : forwardedFor) || req.socket.remoteAddress || 'unknown';
    const rateLimitKey = `login:${ip}`;
    
    if (!checkAPIRateLimit(rateLimitKey, 5, 60000)) { // 5 attempts per minute
      logger.warn('Login rate limit exceeded', { ip: String(ip) });
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.'
      });
    }

    // CSRF validation for production
    if (env.NODE_ENV === 'production' && !env.NEXT_PUBLIC_DEMO_MODE) {
      const nextReq = createNextRequest(req);
      const csrfValid = await validateCSRFToken(nextReq);
      
      if (!csrfValid) {
        logger.warn('CSRF validation failed', { ip: String(ip) });
        return res.status(403).json({
          success: false,
          message: 'Invalid security token'
        });
      }
    }

    // Validate input using our comprehensive validation
    const nextReq = createNextRequest(req);
    const { data: validatedData, error: validationError } = await validateRequest(
      nextReq,
      apiSchemas.login
    );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        ...JSON.parse(await validationError.text()),
      });
    }

    const { email, password } = validatedData;

    // Log login attempt (without password)
    logger.info('Login attempt', { email, ip: String(ip) });

    // Add delay to prevent timing attacks
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if we're in demo mode
    if (env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      logger.info('Demo mode login', { email });
      
      // In demo mode, accept any credentials
      const demoUser = {
        id: 'demo-user-id',
        email: email,
        name: email.split('@')[0] || 'Demo User',
        role: 'user',
      };

      // Create demo token
      const token = jwt.sign(
        {
          sub: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          demo: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
        },
        env.JWT_SECRET || 'demo-secret',
        { algorithm: 'HS256' }
      );

      // Set cookie
      res.setHeader('Set-Cookie', [
        `auth_token=${token}`,
        'Path=/',
        'HttpOnly',
        'SameSite=Lax',
        'Max-Age=86400',
      ].join('; '));

      return res.status(200).json({
        success: true,
        user: demoUser,
        token,
      });
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      logger.warn('Authentication failed', { email, error: authError?.message });
      
      // Generic error message to prevent user enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get user profile from our profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
      logger.error('Profile fetch error', { error: profileError, userId: authData.user.id });
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve user profile'
      });
    }

    // Create profile if it doesn't exist
    let userProfile = profile;
    if (!profile) {
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
        logger.error('Profile creation error', { error: createError, userId: authData.user.id });
        return res.status(500).json({
          success: false,
          message: 'Failed to create user profile'
        });
      }

      userProfile = newProfile;
    }

    // Create JWT token with proper expiry
    const tokenPayload = {
      sub: authData.user.id,
      email: authData.user.email,
      role: userProfile?.role || 'user',
      iat: Math.floor(Date.now() / 1000),
    };

    // Parse expiry duration
    const expiryMatch = env.JWT_EXPIRY.match(/(\d+)([dhms])/);
    let expirySeconds = 86400; // Default 24 hours
    
    if (expiryMatch && expiryMatch[1] && expiryMatch[2]) {
      const num = expiryMatch[1];
      const unit = expiryMatch[2];
      const multipliers: Record<string, number> = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400
      };
      expirySeconds = parseInt(num, 10) * (multipliers[unit] || 86400);
    }

    if (!env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
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

    // Log successful login
    logger.info('Login successful', { userId: authData.user.id, email });

    // Determine user name
    const userName = userProfile?.full_name || 
                    userProfile?.first_name || 
                    email.split('@')[0] || 
                    'User';

    // Return success response
    return res.status(200).json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: userName,
        role: userProfile?.role || 'user',
      },
      token,
    });

  } catch (error) {
    logger.error('Login error', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}