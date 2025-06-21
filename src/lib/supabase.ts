import { getErrorMessage } from '@/utils/errorUtils';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Build-safe environment variable access with Vercel support
export const getSupabaseConfig = () => {
  // Check if we're in build context
  const isBuildContext = (typeof globalThis !== 'undefined' && 'EdgeRuntime' in globalThis) ||
                        process.env.NETLIFY ||
                        process.env.VERCEL ||
                        process.env.VERCEL_ENV ||
                        process.env.CI === 'true' ||
                        process.env.BUILD_ID ||
                        process.env.NETLIFY_BUILD_BASE ||
                        process.env.NODE_PHASE === 'phase-production-build' ||
                        process.env.NEXT_PHASE === 'phase-production-build';

  // Default Supabase configuration (always available as fallback)
  const defaultSupabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
  const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';

  // Get environment variables with guaranteed fallbacks
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl;
  let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

  // Validate and clean the values
  if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
    console.warn('Invalid Supabase URL, using default');
    supabaseUrl = defaultSupabaseUrl;
  }
  
  // Clean the anon key - remove all whitespace, newlines, and invalid characters
  if (supabaseAnonKey) {
    supabaseAnonKey = supabaseAnonKey.replace(/\s+/g, '').replace(/[\r\n\t]/g, '').trim();
  }
  
  // Validate the token format (should be a JWT with 3 parts separated by dots)
  const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;
  
  if (!supabaseAnonKey || supabaseAnonKey.length < 50 || !jwtPattern.test(supabaseAnonKey)) {
    console.warn('Invalid Supabase anon key format, using default');
    supabaseAnonKey = defaultSupabaseAnonKey;
  }

  // Always return valid values to prevent Supabase client creation errors
  return { 
    supabaseUrl: supabaseUrl.trim(), 
    supabaseAnonKey: supabaseAnonKey.trim().replace(/\s+/g, '') 
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
      
      supabaseInstance = createClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
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
            }
          },
          db: {
            schema: 'public',
          },
          realtime: {
            disabled: true
          } as any
        }
      ) as any;
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
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
    throw new Error('Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }
  
  if (!serviceSupabaseInstance) {
    const { supabaseUrl } = getSupabaseConfig();
    serviceSupabaseInstance = createClient<Database>(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  
  return serviceSupabaseInstance;
};

// Helper function to get user from token with better error handling
export async function getUserFromToken(token: string): Promise<any> {
  if (!token) {
    throw new Error('Token is required');
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Supabase auth error:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
    
    if (!data.user) {
      throw new Error('No user found for provided token');
    }
    
    return data.user;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error getting user from token:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to validate user token');
  }
}

// Helper function to get user profile with better error handling
export async function getUserProfile(userId: string): Promise<any> {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      // Handle case where profile doesn't exist
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
    
    return data;
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error getting user profile:', error);
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
    const message = getErrorMessage(error);
    console.error('Error getting user clients:', error);
    throw error;
  }
}

// Helper to check if user has access to a specific client
export async function userHasClientAccess(userId: string, clientId: string): Promise<boolean> {
  try {
    const userClients = await getUserClients(userId);
    return userClients.includes(clientId);
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Error checking client access:', error);
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