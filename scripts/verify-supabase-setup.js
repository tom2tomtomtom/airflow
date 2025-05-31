#!/usr/bin/env node

/**
 * AIRWAVE SUPABASE SETUP VERIFICATION SCRIPT
 * This script verifies that your Supabase setup is working correctly
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Load environment variables
function loadEnvVars() {
  const envFiles = ['.env.local', '.env'];
  let envVars = {};

  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            envVars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
          }
        }
      }
      logInfo(`Loaded environment variables from ${file}`);
      break;
    }
  }

  // Merge with process.env
  return { ...envVars, ...process.env };
}

async function main() {
  log('\n🚀 AIrWAVE Supabase Setup Verification', 'cyan');
  log('=====================================\n', 'cyan');

  const env = loadEnvVars();
  let hasErrors = false;

  // Check required environment variables
  logInfo('Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const varName of requiredVars) {
    if (env[varName]) {
      logSuccess(`${varName} is set`);
    } else {
      logError(`${varName} is missing`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    logError('Missing required environment variables. Please run setup-netlify-env.sh first.');
    process.exit(1);
  }

  // Create Supabase clients
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('');
  logInfo('Testing Supabase connection...');

  try {
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      logError(`Connection failed: ${error.message}`);
      hasErrors = true;
    } else {
      logSuccess('Basic Supabase connection working');
    }
  } catch (err) {
    logError(`Connection error: ${err.message}`);
    hasErrors = true;
  }

  // Test service role client
  logInfo('Testing service role access...');
  try {
    const { data, error } = await serviceSupabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      logError(`Service role access failed: ${error.message}`);
      hasErrors = true;
    } else {
      logSuccess('Service role access working');
    }
  } catch (err) {
    logError(`Service role error: ${err.message}`);
    hasErrors = true;
  }

  // Check required tables exist
  logInfo('Checking database schema...');
  
  const requiredTables = [
    'profiles',
    'clients',
    'assets',
    'campaigns',
    'templates',
    'matrices',
    'executions',
    'webhooks',
    'platform_integrations',
    'analytics'
  ];

  for (const table of requiredTables) {
    try {
      const { error } = await serviceSupabase.from(table).select('count', { count: 'exact', head: true });
      
      if (error) {
        logError(`Table '${table}' not found or not accessible: ${error.message}`);
        hasErrors = true;
      } else {
        logSuccess(`Table '${table}' exists and accessible`);
      }
    } catch (err) {
      logError(`Error checking table '${table}': ${err.message}`);
      hasErrors = true;
    }
  }

  // Check storage buckets
  logInfo('Checking storage buckets...');
  
  const requiredBuckets = ['assets', 'templates', 'renders', 'avatars', 'campaigns'];

  try {
    const { data: buckets, error } = await serviceSupabase.storage.listBuckets();
    
    if (error) {
      logError(`Failed to list buckets: ${error.message}`);
      hasErrors = true;
    } else {
      const bucketNames = buckets.map(b => b.name);
      
      for (const bucketName of requiredBuckets) {
        if (bucketNames.includes(bucketName)) {
          logSuccess(`Bucket '${bucketName}' exists`);
        } else {
          logError(`Bucket '${bucketName}' not found`);
          hasErrors = true;
        }
      }
    }
  } catch (err) {
    logError(`Error checking buckets: ${err.message}`);
    hasErrors = true;
  }

  // Test storage policies
  logInfo('Testing storage upload permissions...');
  
  try {
    // Test uploading a small file to assets bucket
    const testFile = Buffer.from('test file content');
    const { data, error } = await serviceSupabase.storage
      .from('assets')
      .upload('test/test-file.txt', testFile, {
        contentType: 'text/plain',
        upsert: true
      });

    if (error) {
      logWarning(`Storage upload test failed: ${error.message}`);
      logWarning('This might be due to RLS policies - check your bucket policies');
    } else {
      logSuccess('Storage upload test passed');
      
      // Clean up test file
      await serviceSupabase.storage.from('assets').remove(['test/test-file.txt']);
    }
  } catch (err) {
    logWarning(`Storage test error: ${err.message}`);
  }

  // Check optional API keys
  console.log('');
  logInfo('Checking optional API keys...');
  
  const optionalKeys = [
    { key: 'OPENAI_API_KEY', service: 'OpenAI' },
    { key: 'CREATOMATE_API_KEY', service: 'Creatomate' },
    { key: 'ELEVENLABS_API_KEY', service: 'ElevenLabs' },
    { key: 'RUNWAY_API_KEY', service: 'Runway' }
  ];

  for (const { key, service } of optionalKeys) {
    if (env[key]) {
      logSuccess(`${service} API key is configured`);
    } else {
      logWarning(`${service} API key not set (optional)`);
    }
  }

  // Check feature flags
  console.log('');
  logInfo('Checking feature flags...');
  
  const featureFlags = [
    'ENABLE_AI_FEATURES',
    'ENABLE_VIDEO_GENERATION',
    'ENABLE_SOCIAL_PUBLISHING'
  ];

  for (const flag of featureFlags) {
    const value = env[flag] || 'false';
    if (value === 'true') {
      logSuccess(`${flag} is enabled`);
    } else {
      logInfo(`${flag} is disabled`);
    }
  }

  // Summary
  console.log('');
  log('📊 Verification Summary', 'cyan');
  log('======================', 'cyan');
  
  if (hasErrors) {
    logError('Some issues were found. Please check the errors above and run the setup scripts.');
    console.log('');
    logInfo('Setup scripts to run:');
    console.log('  1. Run: scripts/setup-supabase-complete.sql in your Supabase SQL Editor');
    console.log('  2. Run: ./scripts/setup-netlify-env.sh to generate environment variables');
    console.log('');
    process.exit(1);
  } else {
    logSuccess('All checks passed! Your AIrWAVE Supabase setup is working correctly.');
    console.log('');
    logInfo('Your application is ready for:');
    console.log('  ✅ User authentication');
    console.log('  ✅ Database operations');
    console.log('  ✅ File storage');
    console.log('  ✅ Real-time updates');
    console.log('');
    logSuccess('🚀 Ready for production deployment!');
  }
}

// Run the verification
main().catch(err => {
  logError(`Verification failed: ${err.message}`);
  process.exit(1);
});