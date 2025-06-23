import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/utils/supabase-middleware';

// No JWT_SECRET needed - using Supabase for authentication

// Define public routes that don't require authentication
const publicRoutes = [
  '/',  // Root path
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-success',
  '/unauthorized',
  // Debug routes removed for production security
  // Testing routes for UI tests - REMOVED FOR PRODUCTION SECURITY
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
  // Production endpoints only
  '/api/check-video-status',
  // Real-time updates
  '/api/realtime/events',
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
  response?.headers?.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response?.headers?.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response?.headers?.set('X-XSS-Protection', '1; mode=block');
  
  // Control referrer information
  response?.headers?.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - Improved security
  const cspBase = [
    "default-src 'self'",
    "font-src 'self'",
    "img-src 'self' data: https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  // Don't add upgrade-insecure-requests in development
  if (process.env.NODE_ENV === 'production') {
    cspBase.push("upgrade-insecure-requests");
  }

  // More permissive in development mode
  if (process.env.NODE_ENV === 'development') {
    cspBase.push(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io https://api.creatomate.com https://graph.facebook.com https://api.twitter.com https://api.linkedin.com ws://localhost:* http://localhost:*"
    );
  } else {
    // Production CSP - Allow unsafe-inline for Material-UI emotion styles and unsafe-hashes for event handlers
    cspBase.push(
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes'",
      "style-src 'self' 'unsafe-inline'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.elevenlabs.io https://api.creatomate.com https://graph.facebook.com https://api.twitter.com https://api.linkedin.com"
    );
  }
  
  response?.headers?.set('Content-Security-Policy', cspBase.join('; '));
  
  // Permissions Policy
  response?.headers?.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  
  // Additional security headers for production
  if (process.env.NODE_ENV === 'production') {
    response?.headers?.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  // REMOVED: Temporary development bypass - auth is now restored
  
  // Update session and get response
  const { response: updatedResponse, user } = await updateSession(request);
  let response = updatedResponse;
  
  // Add security headers to all responses
  response = addSecurityHeaders(response);
  
  // Rate limiting is now handled at the individual API endpoint level
  // This provides more granular control and better error handling

  // Allow public routes and static assets
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
  
  const isStaticAsset = pathname.startsWith('/_next') || 
    pathname.startsWith('/favicon') || 
    pathname.includes('.');
  
  // Let API routes handle their own authentication via withAuth middleware
  const isApiRoute = pathname.startsWith('/api');
    
  if (isPublicRoute || isStaticAsset || isApiRoute) {
    return response;
  }


  try {
    // Check if user is authenticated
    const hasSession = !!user;
    
    if (!hasSession) {
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
    
    // User is authenticated - add user info to headers for API routes
    if (pathname.startsWith('/api') && user) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', user.id);
      requestHeaders.set('x-user-email', user.email || '');
      
      response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
      
      // Re-apply security headers
      response = addSecurityHeaders(response);
    }
    
    // IMPORTANT: Return the modified response to ensure cookies are set
    return response;
  } catch (error: any) {
    console.error('Middleware error:', error);
    
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { success: false, message: 'Authentication error' },
        { status: 401 }
      );
    }
    
    // For pages, redirect to login
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  
  // Prevent infinite redirect loops
  if (url.pathname === '/login') {
    return NextResponse.next();
  }
  
  url.pathname = '/login';
  
  // Preserve the original URL for redirect after login (but don't redirect if already on login)
  if (request.nextUrl.pathname !== '/' && request.nextUrl.pathname !== '/login') {
    url.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search);
  }
  
  const response = NextResponse.redirect(url);
  response?.cookies?.delete('airwave_token');
  response?.cookies?.delete('auth_token');
  
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
