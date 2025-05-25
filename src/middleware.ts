import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Get JWT_SECRET directly for Edge Runtime compatibility
const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-that-is-at-least-32-characters-long';
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
  // API endpoints that should work in demo mode
  '/api/clients',
  '/api/templates',
  '/api/assets',
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
];

// Define routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
};

// Rate limiting map (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

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
  
  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Permissions Policy
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create response object
  let response = NextResponse.next();
  
  // Add security headers to all responses
  response = addSecurityHeaders(response);
  
  // Apply rate limiting to auth endpoints
  if (pathname.startsWith('/api/auth/')) {
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const rateLimitKey = `${ip}:${pathname}`;
    
    if (!checkRateLimit(rateLimitKey, 20, 60000)) { // 20 requests per minute
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  // In demo mode, allow most routes without authentication
  if (isDemoMode) {
    // Check if it's a protected route that should work in demo
    if (demoAllowedRoutes.some(route => pathname.startsWith(route))) {
      return response;
    }
    
    // Check if it's an API route that should work in demo
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
      // Add demo headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-demo-mode', 'true');
      requestHeaders.set('x-user-id', 'demo-user');
      requestHeaders.set('x-user-role', 'user');
      
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      return addSecurityHeaders(response);
    }
  }

  // Allow public routes and static assets
  if (
    publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Static files
  ) {
    return response;
  }

  // Check for auth token in cookies (secure) or headers (for API calls)
  const tokenFromCookie = request.cookies.get('auth_token')?.value;
  const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = tokenFromCookie || tokenFromHeader;

  // In demo mode, create a fake token if none exists
  if (!token && isDemoMode) {
    const demoToken = 'demo-token';
    response.cookies.set('auth_token', demoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
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
    // In demo mode, skip token verification
    if (isDemoMode && (token === 'demo-token' || token.startsWith('demo-'))) {
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

    // Verify the token for non-demo mode
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256']
    });

    // Validate payload structure
    if (!payload.sub || !payload.role || !payload.exp) {
      throw new Error('Invalid token structure');
    }

    // Check token expiration (jwtVerify already does this, but adding explicit check)
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('Token expired');
    }

    // Check role-based access for protected routes
    for (const [route, roles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(route) && !roles.includes(payload.role as string)) {
        // For API routes, return 403
        if (pathname.startsWith('/api')) {
          return NextResponse.json(
            { success: false, message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
        // For pages, redirect to assets page
        return NextResponse.redirect(new URL('/assets', request.url));
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-role', payload.role as string);
      requestHeaders.set('x-user-email', payload.email as string || '');

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

function redirectToLogin(request: NextRequest) {
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
