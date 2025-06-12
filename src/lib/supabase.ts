import { getErrorMessage } from '@/utils/errorUtils';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Build-safe environment variable access
const getSupabaseConfig = () => {
  // Check if we're in build context
  const isBuildContext = typeof EdgeRuntime !== 'undefined' || 
                        process.env.NETLIFY || 
                        process.env.VERCEL ||
                        process.env.CI === 'true' ||
                        process.env.BUILD_ID ||
                        process.env.NETLIFY_BUILD_BASE ||
                        process.env.NODE_PHASE === 'phase-production-build' ||
                        process.env.NEXT_PHASE === 'phase-production-build';

  // Get environment variables directly for build safety
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdsjlutmfaatslznjxiv.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';

  // During build, validate that required values exist
  if (isBuildContext && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error('@supabase/ssr: Your project\'s URL and API key are required to create a Supabase client!');
  }

  return { supabaseUrl, supabaseAnonKey };
};

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient<Database> | null = null;

// Create Supabase client with build-safe configuration (singleton pattern)
export const supabase = (() => {
  if (!supabaseInstance) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    
    supabaseInstance = createClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storageKey: 'airwave-auth-token', // Use a specific storage key to avoid conflicts
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        },
        global: {
          headers: {
            'x-application-name': 'airwave'
          }
        }
      }
    );
  }
  return supabaseInstance;
})();

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