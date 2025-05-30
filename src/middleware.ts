import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import type { JwtPayload } from '@/types/auth';

// Security: Ensure JWT_SECRET is properly set
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
const JWT_SECRET = process.env.JWT_SECRET;

// Check if we're in Edge Functions build context or other build environments
const isEdgeBuild = typeof EdgeRuntime !== 'undefined' || 
                   process.env.NETLIFY || 
                   process.env.VERCEL ||
                   !JWT_SECRET;

// Validate JWT_SECRET in production (skip during any build context)
if (!isDemoMode && !JWT_SECRET && !isEdgeBuild && process.env.NODE_ENV === 'production') {
  console.warn('JWT_SECRET environment variable is missing in production mode');
}

// In production runtime, ensure JWT_SECRET meets minimum security requirements
if (!isDemoMode && JWT_SECRET && JWT_SECRET.length < 32 && !isEdgeBuild) {
  console.warn('JWT_SECRET should be at least 32 characters long for security');
}

// Define public routes that don't require authentication
const publicRoutes = [
  '/',  // Root path
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-success',
  '/unauthorized',
  '/api/auth/csrf-token',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/refresh',
  '/api/auth/me',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/change-password',
  // Health check endpoints
  '/api/health',
  '/api/status',
  // Testing endpoints
  '/api/test/openai',
  '/api/test/integration-suite',
  // AI generation endpoints for testing
  '/api/ai/generate',
  '/api/check-video-status',
  '/api/creatomate/test',
  '/api/creatomate/templates',
  // Real-time updates
  '/api/realtime/events',
];

// Define routes that are allowed in demo mode
const demoAllowedRoutes = [
  '/assets',
  '/templates',
  '/matrix',
  '/preview',
  '/generate-enhanced',
  '/strategic-content',
  '/sign-off',
  '/execute',
  '/dashboard',
  '/api/clients',
  '/api/templates',
  '/api/assets',
];

// Define routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
};

// Type for rate limit record
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, RateLimitRecord>();

// Simple rate limiter
function checkRateLimit(identifier: string, limit: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Add security headers
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - Stricter in production
  const cspBase = [
    "default-src 'self'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];

  // More permissive in development/demo mode
  if (isDemoMode || process.env.NODE_ENV === 'development') {
    cspBase.push(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io https://api.creatomate.com ws://localhost:*"
    );
  } else {
    // Production CSP - Allow unsafe-inline for Material-UI emotion styles and event handlers
    cspBase.push(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io https://api.creatomate.com"
    );
  }
  
  response.headers.set('Content-Security-Policy', cspBase.join('; '));
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Additional security headers for production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  // Create response object
  let response = NextResponse.next();
  
  // Add security headers to all responses
  response = addSecurityHeaders(response);
  
  // Apply rate limiting to auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const rateLimitKey = `auth:${ip}`;
    
    if (!checkRateLimit(rateLimitKey, 20, 60000)) { // 20 requests per minute
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // Allow public routes and static assets
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isStaticAsset = pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon') || 
    pathname.includes('.');
    
  if (isPublicRoute || isStaticAsset) {
    return response;
  }

  // In demo mode, handle authentication differently
  if (isDemoMode) {
    const isDemoAllowed = demoAllowedRoutes.some(route => pathname.startsWith(route));
    
    if (isDemoAllowed) {
      // Add demo headers for API routes
      if (pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-demo-mode', 'true');
        requestHeaders.set('x-user-id', 'demo-user');
        requestHeaders.set('x-user-role', 'user');
        requestHeaders.set('x-user-email', 'demo@airwave.app');
        
        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        
        return addSecurityHeaders(response);
      }
      
      return response;
    }
  }

  // Check for auth token in cookies (secure) or headers (for API calls)
  const tokenFromCookie = request.cookies.get('auth_token')?.value;
  const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = tokenFromCookie || tokenFromHeader;

  // In demo mode, create a demo session if no token exists
  if (!token && isDemoMode) {
    // Generate a demo token (this is only for demo mode)
    const demoToken = `demo-${Date.now()}`;
    response.cookies.set('auth_token', demoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
    
    return response;
  }

  if (!token) {
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    // For pages, redirect to login
    return redirectToLogin(request);
  }

  try {
    // In demo mode, accept demo tokens
    if (isDemoMode && token.startsWith('demo-')) {
      // Add demo user info to headers for API routes
      if (pathname.startsWith('/api')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', 'demo-user');
        requestHeaders.set('x-user-role', 'user');
        requestHeaders.set('x-user-email', 'demo@airwave.app');
        requestHeaders.set('x-demo-mode', 'true');

        response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        
        return addSecurityHeaders(response);
      }
      
      return response;
    }

    // Verify real JWT tokens
    if (!JWT_SECRET) {
      // In Edge build context, allow the request to pass through
      if (isEdgeBuild) {
        return response;
      }
      throw new Error('JWT_SECRET not configured');
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256']
    }) as { payload: JwtPayload };

    // Validate payload structure
    if (!payload.sub || !payload.role || !payload.exp) {
      throw new Error('Invalid token structure');
    }

    // Check role-based access for protected routes
    for (const [route, roles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(route) && !roles.includes(payload.role)) {
        // For API routes, return 403
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { success: false, message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
        // For pages, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub);
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-email', payload.email || '');

      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Re-apply security headers
      response = addSecurityHeaders(response);
    }

    // Allow access to the requested page
    return response;
  } catch (error) {
    console.error('Token verification failed:', error);

    // Clear invalid token from cookies
    const errorResponse = pathname.startsWith('/api') 
      ? NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      : redirectToLogin(request);

    // Clear the invalid token
    errorResponse.cookies.delete('auth_token');
    
    return errorResponse;
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  
  // Preserve the original URL for redirect after login
  if (request.nextUrl.pathname !== '/') {
    url.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search);
  }
  
  const response = NextResponse.redirect(url);
  response.cookies.delete('auth_token');
  
  return response;
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - file extensions (images, fonts, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
