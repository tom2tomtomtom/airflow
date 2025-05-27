import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ExportData {
  profile: any;
  assets: any[];
  campaigns: any[];
  briefs: any[];
  analytics: any[];
  activity_log: any[];
}

/**
 * Export all user data for GDPR compliance
 * Returns a JSON string instead of a ZIP file to avoid dependencies
 */
export async function exportUserData(userId: string): Promise<string> {
  try {
    // Fetch all user data
    const data: ExportData = {
      profile: await getUserProfile(userId),
      assets: await getUserAssets(userId),
      campaigns: await getUserCampaigns(userId),
      briefs: await getUserBriefs(userId),
      analytics: await getUserAnalytics(userId),
      activity_log: await getUserActivityLog(userId),
    };
    
    // Create export object with metadata
    const exportData = {
      export_metadata: {
        user_id: userId,
        export_date: new Date().toISOString(),
        export_version: '1.0',
        platform: 'AIrWAVE',
      },
      user_data: data,
    };
    
    // Return formatted JSON
    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

async function getUserAssets(userId: string) {
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('created_by', userId);
  
  if (error) throw error;
  return data || [];
}

async function getUserCampaigns(userId: string) {
  const { data, error } = await supabase
    .from('executions')
    .select(`
      *,
      matrices!inner(*)
    `)
    .eq('created_by', userId);
  
  if (error) throw error;
  return data || [];
}

async function getUserBriefs(userId: string) {
  const { data, error } = await supabase
    .from('briefs')
    .select('*')
    .eq('created_by', userId);
  
  if (error) throw error;
  return data || [];
}

async function getUserAnalytics(userId: string) {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId);
  
  if (error && error.code !== 'PGRST116') throw error;
  return data || [];
}

async function getUserActivityLog(userId: string) {
  // This would fetch from an activity log table if implemented
  return [];
}

/**
 * Delete all user data (right to be forgotten)
 */
export async function deleteUserData(userId: string): Promise<void> {
  try {
    // Delete in order of dependencies
    
    // 1. Delete analytics events
    await supabase
      .from('analytics_events')
      .delete()
      .eq('user_id', userId);
    
    // 2. Delete executions
    await supabase
      .from('executions')
      .delete()
      .eq('created_by', userId);
    
    // 3. Delete matrices
    await supabase
      .from('matrices')
      .delete()
      .eq('created_by', userId);
    
    // 4. Delete briefs
    await supabase
      .from('briefs')
      .delete()
      .eq('created_by', userId);
    
    // 5. Delete assets
    await supabase
      .from('assets')
      .delete()
      .eq('created_by', userId);
    
    // 6. Delete user-client relationships
    await supabase
      .from('user_clients')
      .delete()
      .eq('user_id', userId);
    
    // 7. Finally, delete the profile
    await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    console.log(`User data deleted for user: ${userId}`);
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
}

/**
 * Anonymize user data (alternative to deletion)
 */
export async function anonymizeUserData(userId: string): Promise<void> {
  try {
    // Anonymize profile
    await supabase
      .from('profiles')
      .update({
        first_name: 'Anonymous',
        last_name: 'User',
        avatar_url: null,
        metadata: {},
      })
      .eq('id', userId);
    
    // Anonymize assets
    await supabase
      .from('assets')
      .update({
        metadata: {},
      })
      .eq('created_by', userId);
    
    console.log(`User data anonymized for user: ${userId}`);
  } catch (error) {
    console.error('Error anonymizing user data:', error);
    throw error;
  }
}
