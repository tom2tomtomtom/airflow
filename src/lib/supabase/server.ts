import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { validateSupabaseConfig } from './config';
import { loggers } from '@/lib/logger';

// Create a Supabase client for server-side usage with anon key
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();
  const config = validateSupabaseConfig();

  try {
    const client = createServerClient<Database>(
      config.url,
      config.anonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // The `set` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
              loggers.supabase.debug('Cookie set from Server Component', { name });
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // The `delete` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
              loggers.supabase.debug('Cookie remove from Server Component', { name });
            }
          },
        },
      }
    );

    return client;
  } catch (error) {
    loggers.supabase.error('Failed to create server Supabase client', error);
    throw new Error('Failed to initialize server Supabase client');
  }
}

// Legacy alias for backwards compatibility
export const createClient = createServerSupabaseClient;