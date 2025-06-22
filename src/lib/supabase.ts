import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { loggers } from './logger';

// Build-safe environment variable access with Vercel support
export const getSupabaseConfig = () => {
  // Secure configuration - no hardcoded defaults
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate required environment variables
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
  }

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is required');
  }

  // Validate URL format
  if (!supabaseUrl.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be a valid HTTPS URL');
  }

  // Clean and validate the anon key
  const cleanedAnonKey = supabaseAnonKey
    .replace(/\s+/g, '')
    .replace(/[\r\n\t]/g, '')
    .trim();

  // Validate JWT format (should have 3 parts separated by dots)
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

  if (cleanedAnonKey.length < 50 || !jwtPattern.test(cleanedAnonKey)) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY must be a valid JWT token');
  }

  return {
    supabaseUrl: supabaseUrl.trim(),
    supabaseAnonKey: cleanedAnonKey,
  };
};

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient<Database> | null = null;

// Create Supabase client with build-safe configuration (singleton pattern)
export const supabase = (() => {
  if (!supabaseInstance) {
    try {
      const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

      // Additional validation before creating client
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration is invalid');
      }

      supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: typeof window !== 'undefined',
          persistSession: typeof window !== 'undefined',
          detectSessionInUrl: typeof window !== 'undefined',
          storageKey: 'airwave-auth-token',
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
          headers: {
            'x-application-name': 'airwave',
          },
        },
        db: {
          schema: 'public',
        },
        realtime: {
          disabled: true,
        },
      });
    } catch (error) {
      loggers.db.error('Failed to create Supabase client', error);
      // Re-throw the error instead of creating a fallback with hardcoded credentials
      // This ensures the application fails fast if configuration is incorrect
      throw new Error(
        `Supabase client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
          'Please check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.'
      );
    }
  }
  return supabaseInstance!; // Non-null assertion since we throw if creation fails
})() as SupabaseClient<Database>;

// Create service role client for server-side operations (when available)
let serviceSupabaseInstance: SupabaseClient<Database> | null = null;

export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.'
    );
  }

  if (!serviceSupabaseInstance) {
    const { supabaseUrl } = getSupabaseConfig();
    serviceSupabaseInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return serviceSupabaseInstance;
};

// Helper function to get user from token with better error handling
export async function getUserFromToken(
  token: string
): Promise<Database['public']['Tables']['profiles']['Row']> {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      loggers.auth.error('Supabase auth error', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }

    if (!data.user) {
      throw new Error('No user found for provided token');
    }

    return data.user;
  } catch (error) {
    loggers.auth.error('Error getting user from token', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to validate user token');
  }
}

// Helper function to get user profile with better error handling
export async function getUserProfile(
  userId: string
): Promise<Database['public']['Tables']['profiles']['Row'] | null> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();

    if (error) {
      // Handle case where profile doesn't exist
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return data;
  } catch (error) {
    loggers.db.error('Error getting user profile', error, { userId });
    throw error;
  }
}

// Helper function to get user's client access with better error handling
export async function getUserClients(userId: string): Promise<string[]> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('user_clients')
      .select('client_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to get user clients: ${error.message}`);
    }

    return data?.map((uc: { client_id: string }) => uc.client_id) || [];
  } catch (error) {
    loggers.db.error('Error getting user clients', error, { userId });
    throw error;
  }
}

// Helper to check if user has access to a specific client
export async function userHasClientAccess(userId: string, clientId: string): Promise<boolean> {
  try {
    const userClients = await getUserClients(userId);
    return userClients.includes(clientId);
  } catch (error) {
    loggers.db.error('Error checking client access', error, { userId, clientId });
    return false;
  }
}

// Re-export types from database.ts
export type { Database } from '@/types/database';
export type {
  Analytics,
  ApprovalComment,
  ApprovalWorkflow,
  Approval,
  Asset,
  Brief,
  CampaignAnalytics,
  Client,
  ClientContact,
  ContentVariation,
  CopyAsset,
  CopyText,
  Execution,
  GeneratedContent,
  Matrix,
  Motivation,
  PlatformIntegration,
  Profile,
  SelectedMotivation,
  Strategy,
  StrategyMotivation,
  Template,
  UserClient,
  Tables,
  Inserts,
  Updates,
} from '@/types/database';
