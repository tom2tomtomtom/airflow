import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { validateSupabaseConfig } from './config';
import { loggers } from '@/lib/logger';

export interface MiddlewareSupabaseResponse {
  response: NextResponse;
  supabase: SupabaseClient<Database>;
}

// Create Supabase client for middleware usage
export function createMiddlewareSupabaseClient(
  request: NextRequest
): MiddlewareSupabaseResponse {
  const config = validateSupabaseConfig();
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    config.url,
    config.anonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update both request and response cookies
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response?.cookies?.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response?.cookies?.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  return { response, supabase };
}

// Update session helper for middleware
export async function updateSession(request: NextRequest) {
  try {
    const { response, supabase } = createMiddlewareSupabaseClient(request);
    
    // This will refresh the session if expired - required for Server Components
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      loggers.supabase.debug('Session refresh error in middleware', { 
        error: error.message,
        path: request.nextUrl.pathname 
      });
    }

    return { response, user };
  } catch (error: any) {
    loggers.supabase.error('Middleware session update failed', error);
    return { 
      response: NextResponse.next({ request: { headers: request.headers } }), 
      user: null 
    };
  }
}