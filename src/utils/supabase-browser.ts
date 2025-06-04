import { createBrowserClient, SupabaseClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// Singleton instance to prevent multiple GoTrueClient warnings
let browserClientInstance: SupabaseClient<Database> | null = null;

export function createSupabaseBrowserClient() {
  // Return existing instance if already created
  if (browserClientInstance) {
    return browserClientInstance;
  }

  // Create new instance with singleton pattern
  browserClientInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Only run in browser environment
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            return undefined;
          }
          // Get cookie value from document.cookie
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) {
            return parts.pop()?.split(';').shift();
          }
          return undefined;
        },
        set(name: string, value: string, options: any) {
          // Only run in browser environment
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
          }
          // Set cookie with proper attributes for server-side reading
          let cookieString = `${name}=${value}`;
          
          if (options?.expires) {
            cookieString += `; expires=${options.expires.toUTCString()}`;
          }
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          } else {
            cookieString += `; path=/`;
          }
          if (options?.secure) {
            cookieString += `; secure`;
          }
          if (options?.httpOnly) {
            cookieString += `; httponly`;
          }
          if (options?.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
          }
          
          document.cookie = cookieString;
        },
        remove(name: string, options: any) {
          // Only run in browser environment
          if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
          }
          // Remove cookie by setting expiry in the past
          let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
          if (options?.path) {
            cookieString += `; path=${options.path}`;
          } else {
            cookieString += `; path=/`;
          }
          if (options?.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          document.cookie = cookieString;
        },
      },
    }
  );

  return browserClientInstance;
}

// Helper to reset the client instance (useful for testing or logout)
export function resetSupabaseBrowserClient() {
  browserClientInstance = null;
}