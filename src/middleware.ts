// Authentication and compression middleware
import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/clients',
  '/campaigns',
  '/assets',
  '/motivations',
  '/execution',
  '/analytics',
  '/approvals',
  '/matrix',
  '/strategic-content',
  '/flow',
  '/settings',
  '/profile',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/signin',
  '/signup',
  '/auth',
  '/forgot-password',
  '/reset-password',
  '/test-auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, static files, and internal Next.js files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.') ||
    pathname.includes('.')
  ) {
    // Enable compression for API routes and static assets
    const response = NextResponse.next();

    if (pathname.startsWith('/_next/static/')) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      response.headers.set('Content-Encoding', 'gzip');
    }

    if (pathname.startsWith('/api/')) {
      response.headers.set('Content-Encoding', 'gzip');
      response.headers.set('Vary', 'Accept-Encoding');
    }

    return response;
  }

  // Update Supabase session
  const { response, user } = await updateSession(request);

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(
    route => pathname === route || pathname.startsWith(route)
  );

  // If it's a protected route and user is not authenticated, redirect to login
  if (isProtectedRoute && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and tries to access auth pages, redirect to dashboard
  if (user && (pathname === '/login' || pathname === '/signin' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/api/:path*'],
};
