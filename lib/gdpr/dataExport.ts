import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { format } from 'date-fns';

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
 */
export async function exportUserData(userId: string): Promise<Blob> {
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
    
    // Create ZIP file
    const zip = new JSZip();
    const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
    
    // Add JSON files
    zip.file('profile.json', JSON.stringify(data.profile, null, 2));
    zip.file('assets.json', JSON.stringify(data.assets, null, 2));
    zip.file('campaigns.json', JSON.stringify(data.campaigns, null, 2));
    zip.file('briefs.json', JSON.stringify(data.briefs, null, 2));
    zip.file('analytics.json', JSON.stringify(data.analytics, null, 2));
    zip.file('activity_log.json', JSON.stringify(data.activity_log, null, 2));
    
    // Add README
    zip.file('README.txt', generateReadme(userId, timestamp));
    
    // Generate ZIP
    const blob = await zip.generateAsync({ type: 'blob' });
    
    return blob;
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

function generateReadme(userId: string, timestamp: string): string {
  return `AIrWAVE User Data Export
========================

User ID: ${userId}
Export Date: ${timestamp}

This archive contains all your personal data stored in AIrWAVE.

Contents:
---------
- profile.json: Your user profile information
- assets.json: All assets you've uploaded
- campaigns.json: Your campaign and execution data
- briefs.json: Campaign briefs you've created
- analytics.json: Analytics events associated with your account
- activity_log.json: Your activity history

Data Format:
------------
All data is exported in JSON format for easy reading and processing.

Questions?
----------
If you have any questions about this data export, please contact:
privacy@airwave.com

Thank you for using AIrWAVE!
`;
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
