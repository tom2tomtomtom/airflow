import { createClient } from '@supabase/supabase-js';
import { env, isDemo } from './env';
import { Database } from '@/types/database';

// Create a mock Supabase client for demo mode
const createMockSupabaseClient = () => {
  const mockClient = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signIn: async () => ({ data: null, error: { message: 'Demo mode - auth not available' } }),
      signUp: async () => ({ data: null, error: { message: 'Demo mode - auth not available' } }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Demo mode - database not available' } }),
        }),
        single: async () => ({ data: null, error: { message: 'Demo mode - database not available' } }),
      }),
      insert: async () => ({ data: null, error: { message: 'Demo mode - database not available' } }),
      update: async () => ({ data: null, error: { message: 'Demo mode - database not available' } }),
      delete: async () => ({ data: null, error: { message: 'Demo mode - database not available' } }),
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: { message: 'Demo mode - storage not available' } }),
        download: async () => ({ data: null, error: { message: 'Demo mode - storage not available' } }),
        remove: async () => ({ data: null, error: { message: 'Demo mode - storage not available' } }),
      }),
    },
  };
  
  return mockClient as any;
};

// Create Supabase client with validated environment variables
export const supabase = isDemo 
  ? createMockSupabaseClient()
  : createClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key',
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        },
        global: {
          headers: {
            'x-application-name': 'airwave'
          }
        }
      }
    );

// Create service role client for server-side operations (when available)
export const getServiceSupabase = () => {
  if (isDemo) {
    return createMockSupabaseClient();
  }
  
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('Service role key not configured. Using mock client.');
    return createMockSupabaseClient();
  }
  
  return createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Helper function to get user from token with better error handling
export async function getUserFromToken(token: string) {
  if (isDemo) {
    // In demo mode, return a mock user
    return {
      id: 'demo-user',
      email: 'demo@airwave.app',
      app_metadata: {},
      user_metadata: { name: 'Demo User' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
  }

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
    console.error('Error getting user from token:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to validate user token');
  }
}

// Helper function to get user profile with better error handling
export async function getUserProfile(userId: string) {
  if (isDemo) {
    // Return a mock profile in demo mode
    return {
      id: userId,
      first_name: 'Demo',
      last_name: 'User',
      avatar_url: null,
      role: 'admin',
      permissions: {},
      preferences: {},
      metadata: {},
      tenant_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

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
    console.error('Error getting user profile:', error);
    throw error;
  }
}

// Helper function to get user's client access with better error handling
export async function getUserClients(userId: string) {
  if (isDemo) {
    // Return demo client IDs
    return ['demo-client-1', 'demo-client-2', 'demo-client-3'];
  }

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
    console.error('Error getting user clients:', error);
    throw error;
  }
}

// Helper to check if user has access to a specific client
export async function userHasClientAccess(userId: string, clientId: string): Promise<boolean> {
  if (isDemo) {
    // In demo mode, allow access to all demo clients
    return true;
  }

  try {
    const userClients = await getUserClients(userId);
    return userClients.includes(clientId);
  } catch (error) {
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
