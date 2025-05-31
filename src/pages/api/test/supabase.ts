import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

interface SupabaseTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  timestamp?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SupabaseTestResponse>
): Promise<void> {
  // Only allow GET requests for testing
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed - use GET' 
    });
  }

  try {
    // Check if Supabase configuration is available
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase configuration not complete - missing URL or service role key' 
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Testing Supabase connection...');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Basic connectivity - try to read from a system table
    const { data: healthCheck, error: healthError } = await supabase
      .from('pg_stat_database')
      .select('datname')
      .limit(1);

    if (healthError) {
      throw new Error(`Supabase health check failed: ${healthError.message}`);
    }

    // Test 2: Check if we can access our main tables (users, clients, campaigns)
    const tableTests = [];
    
    // Test users table
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      tableTests.push({
        table: 'users',
        accessible: !usersError,
        error: usersError?.message || null,
        recordCount: usersData?.length || 0
      });
    } catch (error) {
    const message = getErrorMessage(error);
      tableTests.push({
        table: 'users',
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test clients table
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id')
        .limit(1);
      
      tableTests.push({
        table: 'clients',
        accessible: !clientsError,
        error: clientsError?.message || null,
        recordCount: clientsData?.length || 0
      });
    } catch (error) {
    const message = getErrorMessage(error);
      tableTests.push({
        table: 'clients',
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test campaigns table
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select('id')
        .limit(1);
      
      tableTests.push({
        table: 'campaigns',
        accessible: !campaignsError,
        error: campaignsError?.message || null,
        recordCount: campaignsData?.length || 0
      });
    } catch (error) {
    const message = getErrorMessage(error);
      tableTests.push({
        table: 'campaigns',
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    // Test 3: Storage bucket access
    let storageTest = null;
    try {
      const { data: buckets, error: bucketsError } = await supabase
        .storage
        .listBuckets();

      storageTest = {
        accessible: !bucketsError,
        bucketCount: buckets?.length || 0,
        buckets: buckets?.map(b => b.name) || [],
        error: bucketsError?.message || null
      };
    } catch (error) {
    const message = getErrorMessage(error);
      storageTest = {
        accessible: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    const successfulTables = tableTests.filter(t => t.accessible).length;
    const allTestsPassed = successfulTables === tableTests.length && storageTest?.accessible;

    console.log('Supabase test completed:', {
      tablesAccessible: `${successfulTables}/${tableTests.length}`,
      storageAccessible: storageTest?.accessible,
      allTestsPassed
    });

    return res.status(200).json({ 
      success: allTestsPassed,
      message: allTestsPassed 
        ? 'Supabase integration is working perfectly! Ready for AIrWAVE data operations.'
        : 'Supabase connection established but some features may be limited.',
      data: {
        database: {
          connected: true,
          tables: tableTests
        },
        storage: storageTest,
        url: supabaseUrl,
        allTestsPassed
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Supabase test failed:', error);
    
    // Handle specific Supabase errors
    let errorMessage = 'Unknown error';
    if (error.message?.includes('Invalid API key')) {
      errorMessage = 'Invalid Supabase API key';
    } else if (error.message?.includes('database')) {
      errorMessage = 'Database connection failed';
    } else if (error.message?.includes('network')) {
      errorMessage = 'Network error connecting to Supabase';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return res.status(500).json({ 
      success: false, 
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}

export const config = {
  api: {
    externalResolver: true,
  },
  maxDuration: 30,
};