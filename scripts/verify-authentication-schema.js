#!/usr/bin/env node

/**
 * AIrWAVE Authentication Schema Verification Script
 * 
 * This script verifies that the database schema is properly configured
 * for authentication to work correctly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function section(message) {
  log(`\n${colors.bold}=== ${message} ===${colors.reset}`);
}

async function main() {
  log(`${colors.bold}🔍 AIrWAVE Authentication Schema Verification${colors.reset}\n`);

  // Check environment variables
  section('Environment Configuration');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    error('NEXT_PUBLIC_SUPABASE_URL is not set');
    return;
  } else {
    success(`Supabase URL configured: ${supabaseUrl}`);
  }

  if (!supabaseKey) {
    error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    return;
  } else {
    success('Supabase anon key configured');
  }

  if (!serviceKey) {
    warning('SUPABASE_SERVICE_ROLE_KEY is not set (optional for verification)');
  } else {
    success('Supabase service key configured');
  }

  // Create Supabase client
  const supabase = createClient(supabaseUrl, serviceKey || supabaseKey);

  // Test connection
  section('Database Connection');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      error(`Connection failed: ${error.message}`);
      return;
    }
    success('Database connection successful');
  } catch (err) {
    error(`Connection error: ${err.message}`);
    return;
  }

  // Check profiles table schema
  section('Profiles Table Schema');
  
  try {
    const { data: columns, error } = await supabase.rpc('get_table_columns', { 
      table_name: 'profiles' 
    }).catch(async () => {
      // Fallback: try to query the table structure directly
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'profiles')
        .order('ordinal_position');
      
      return { data, error };
    });

    if (error) {
      // Try alternative method
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .limit(0);
      
      if (testError) {
        error(`Could not check profiles table: ${testError.message}`);
      } else {
        warning('Profiles table exists but could not verify complete schema');
      }
    } else {
      info('Profiles table schema check:');
      
      // Check for required columns
      const requiredColumns = ['id', 'email', 'first_name', 'last_name', 'role'];
      const existingColumns = Array.isArray(columns) ? 
        columns.map(col => col.column_name) : 
        Object.keys(testData || {});

      requiredColumns.forEach(col => {
        if (existingColumns.includes(col)) {
          success(`  ${col} column exists`);
        } else {
          error(`  ${col} column missing`);
        }
      });
    }
  } catch (err) {
    error(`Schema check failed: ${err.message}`);
  }

  // Check RLS policies
  section('Row Level Security');
  
  try {
    const { data: policies, error } = await supabase.rpc('get_policies', {
      table_name: 'profiles'
    }).catch(() => ({ data: null, error: 'Could not check policies' }));

    if (error || !policies) {
      warning('Could not verify RLS policies directly');
      
      // Test basic RLS by trying to access profiles
      const { data, error: rlsError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (rlsError && rlsError.message.includes('row-level security')) {
        success('RLS is enabled on profiles table');
      } else if (!rlsError) {
        success('Profiles table is accessible');
      } else {
        warning(`RLS check inconclusive: ${rlsError.message}`);
      }
    } else {
      success(`Found ${policies.length} RLS policies on profiles table`);
    }
  } catch (err) {
    warning(`RLS check failed: ${err.message}`);
  }

  // Check clients table
  section('Clients Table');
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, slug')
      .limit(1);
      
    if (error) {
      if (error.message.includes('does not exist')) {
        error('Clients table does not exist');
      } else {
        warning(`Clients table issue: ${error.message}`);
      }
    } else {
      success('Clients table exists and is accessible');
    }
  } catch (err) {
    error(`Clients table check failed: ${err.message}`);
  }

  // Check storage buckets
  section('Storage Buckets');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      warning(`Could not check storage buckets: ${error.message}`);
    } else {
      const requiredBuckets = ['assets', 'avatars', 'templates', 'renders', 'campaigns'];
      const existingBuckets = buckets.map(b => b.name);
      
      requiredBuckets.forEach(bucket => {
        if (existingBuckets.includes(bucket)) {
          success(`  ${bucket} bucket exists`);
        } else {
          warning(`  ${bucket} bucket missing`);
        }
      });
    }
  } catch (err) {
    warning(`Storage check failed: ${err.message}`);
  }

  // Test authentication flow
  section('Authentication Test');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'testpassword123';
  
  try {
    info('Testing user signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (signupError) {
      if (signupError.message.includes('Signups not allowed')) {
        warning('Signup disabled - this is normal for production');
      } else {
        error(`Signup test failed: ${signupError.message}`);
      }
    } else if (signupData.user) {
      success('Signup test successful');
      
      // Check if profile was created
      if (signupData.session) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signupData.user.id)
          .single();
          
        if (profileError) {
          warning(`Profile not auto-created: ${profileError.message}`);
        } else {
          success('User profile auto-creation works');
        }
        
        // Clean up test user
        try {
          await supabase.auth.admin.deleteUser(signupData.user.id);
          info('Test user cleaned up');
        } catch (cleanupErr) {
          warning('Could not clean up test user');
        }
      }
    }
  } catch (err) {
    warning(`Authentication test failed: ${err.message}`);
  }

  // Final summary
  section('Summary');
  log('Schema verification completed. If you see any errors above:');
  log('1. Run the fix-authentication-schema.sql script in your Supabase SQL editor');
  log('2. Ensure all environment variables are properly set');
  log('3. Check that RLS policies allow proper access');
  log('4. Verify storage buckets are created with correct permissions');
  log('\nFor detailed setup instructions, see:');
  log('- SUPABASE_COMPLETE_SETUP_GUIDE.md');
  log('- scripts/fix-authentication-schema.sql');
}

// Run the verification
main().catch(console.error);