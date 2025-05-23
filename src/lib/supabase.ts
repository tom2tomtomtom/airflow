import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be provided');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to get user from token
export async function getUserFromToken(token: string) {
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    throw new Error('Invalid or expired token');
  }
  
  return data.user;
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    throw new Error('Failed to get user profile');
  }
  
  return data;
}

// Helper function to get user's client access
export async function getUserClients(userId: string) {
  const { data, error } = await supabase
    .from('user_clients')
    .select('client_id')
    .eq('user_id', userId);
  
  if (error) {
    throw new Error('Failed to get user clients');
  }
  
  return data.map(uc => uc.client_id);
}
