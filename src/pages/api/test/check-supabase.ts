import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  // Check environment variables
  const envCheck = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',
    
    // Partial values for debugging (first 10 chars only)
    supabaseUrlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) || 'NOT SET',
    anonKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'NOT SET',
  };

  // Test Supabase connection
  let supabaseTest = { connected: false, error: null };
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    if (envCheck.hasSupabaseUrl && envCheck.hasSupabaseAnonKey) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Try to get session (should work even without auth)
      const { error } = await supabase.auth.getSession();
      
      supabaseTest = {
        connected: !error,
        error: error?.message || null
      };
    } else {
      supabaseTest.error = 'Missing Supabase environment variables';
    }
  } catch (error: any) {
    supabaseTest.error = error.message;
  }

  res.status(200).json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envCheck,
    supabaseTest,
    
    // Instructions for fixing
    instructions: {
      ifNotWorking: [
        '1. Ensure all 3 Supabase env vars are set in Netlify',
        '2. NEXT_PUBLIC_DEMO_MODE should be "false" (not false without quotes)',
        '3. Redeploy after adding environment variables',
        '4. Check Supabase project is not paused',
        '5. Verify email confirmations are disabled in Supabase Auth settings'
      ],
      supabaseEnvVars: {
        'NEXT_PUBLIC_SUPABASE_URL': 'https://your-project.supabase.co',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your-anon-key-from-supabase-settings-api',
        'SUPABASE_SERVICE_ROLE_KEY': 'your-service-role-key-from-supabase-settings-api'
      }
    }
  });
}
