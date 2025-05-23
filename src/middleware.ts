import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define public routes that don't require authentication
const publicRoutes = [
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
  '/api/status'
];

// Define routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and static assets
  if (
    publicRoutes.some(route => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (secure) or headers (for API calls)
  const tokenFromCookie = request.cookies.get('auth_token')?.value;
  const tokenFromHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = tokenFromCookie || tokenFromHeader;

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
    // Verify the token
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not found in environment variables');
      throw new Error('Server configuration error');
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

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
        // For pages, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-role', payload.role as string);
      requestHeaders.set('x-user-email', payload.email as string || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Allow access to the requested page
    return NextResponse.next();
  } catch (error) {
    console.error('Token verification failed:', error);

    // Clear invalid token from cookies
    const response = pathname.startsWith('/api') 
      ? NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      : redirectToLogin(request);

    // Clear the invalid token
    response.cookies.delete('auth_token');
    
    return response;
  }
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  
  // Preserve the original URL for redirect after login
  if (request.nextUrl.pathname !== '/') {
    url.searchParams.set('from', request.nextUrl.pathname + request.nextUrl.search);
  }
  
  return NextResponse.redirect(url);
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