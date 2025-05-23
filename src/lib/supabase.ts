import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdsjlutmfaatslznjxiv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkc2psdXRtZmFhdHNsem5qeGl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1NzQyMTQsImV4cCI6MjA2MzE1MDIxNH0.wO2DjC0Y2lRQj9lzMJ-frqlMXuC-r5TM-wwmRQXN5Fg';

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
