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
  '/api/clients',
  '/api/clients/index',
  '/api/users/profile'
];

// Define routes that require specific roles
const roleBasedRoutes: Record<string, string[]> = {
  '/admin': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
};

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to debug the infinite redirect loop
  return NextResponse.next();

  /* Original middleware code commented out for debugging
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // Redirect to login if no token is found
    return redirectToLogin(request);
  }

  try {
    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_key_change_in_production');
    const { payload } = await jwtVerify(token, secret);

    // Check role-based access for protected routes
    for (const [route, roles] of Object.entries(roleBasedRoutes)) {
      if (pathname.startsWith(route) && !roles.includes(payload.role as string)) {
        // Redirect to dashboard if user doesn't have required role
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add user info to headers for API routes
    if (pathname.startsWith('/api')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.sub as string);
      requestHeaders.set('x-user-role', payload.role as string);

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

    // Clear invalid token
    const response = redirectToLogin(request);
    response.cookies.delete('auth_token');

    return response;
  }
  */
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('from', request.nextUrl.pathname);
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
