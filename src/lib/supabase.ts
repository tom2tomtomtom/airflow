import { getErrorMessage } from '@/utils/errorUtils';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env';
import { Database } from '@/types/database';

// Singleton instance to prevent multiple GoTrueClient warnings
let supabaseInstance: SupabaseClient<Database> | null = null;

// Create Supabase client with validated environment variables (singleton pattern)
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key',
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
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Service role key not configured. Please set SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }
  
  if (!serviceSupabaseInstance) {
    serviceSupabaseInstance = createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
      env.SUPABASE_SERVICE_ROLE_KEY,
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