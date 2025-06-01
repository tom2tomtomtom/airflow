#!/usr/bin/env node

/**
 * AIrWAVE Supabase Authentication Diagnostic Script
 * 
 * This script comprehensively diagnoses authentication issues,
 * specifically focusing on 401 errors after successful login.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
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
  log(`\n${colors.bold}${colors.cyan}=== ${message} ===${colors.reset}`);
}

function subsection(message) {
  log(`\n${colors.bold}${colors.magenta}--- ${message} ---${colors.reset}`);
}

function detail(message) {
  log(`   ${colors.dim}${message}${colors.reset}`);
}

async function main() {
  log(`${colors.bold}${colors.cyan}🔍 AIrWAVE Supabase Authentication Diagnostic${colors.reset}`);
  log(`${colors.dim}Analyzing authentication configuration and potential 401 error causes${colors.reset}\n`);

  // Phase 1: Environment Configuration Check
  section('1. Environment Configuration Analysis');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const jwtSecret = process.env.JWT_SECRET;

  if (!supabaseUrl) {
    error('NEXT_PUBLIC_SUPABASE_URL is not set');
    info('This is required for Supabase connection');
    return;
  } else {
    success(`Supabase URL: ${supabaseUrl}`);
    
    // Validate URL format
    if (!supabaseUrl.includes('.supabase.co') && !supabaseUrl.includes('localhost')) {
      warning('URL format might be incorrect - should be like https://xxx.supabase.co');
    }
  }

  if (!supabaseAnonKey) {
    error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    info('This is required for client-side authentication');
    return;
  } else {
    success('Supabase anon key is configured');
    detail(`Key starts with: ${supabaseAnonKey.substring(0, 20)}...`);
    
    // Validate key format
    if (!supabaseAnonKey.startsWith('eyJ')) {
      warning('Anon key format might be incorrect - should start with "eyJ"');
    }
  }

  if (!serviceKey) {
    warning('SUPABASE_SERVICE_ROLE_KEY is not set');
    info('This is needed for admin operations and some diagnostics');
  } else {
    success('Service role key is configured');
    detail(`Key starts with: ${serviceKey.substring(0, 20)}...`);
    
    if (!serviceKey.startsWith('eyJ')) {
      warning('Service role key format might be incorrect - should start with "eyJ"');
    }
  }

  if (!jwtSecret) {
    warning('JWT_SECRET is not set');
    info('This might affect session management in API routes');
  } else {
    success('JWT_SECRET is configured');
    if (jwtSecret.length < 32) {
      warning('JWT_SECRET should be at least 32 characters long');
    }
  }

  // Create Supabase clients
  const anonClient = createClient(supabaseUrl, supabaseAnonKey);
  const serviceClient = serviceKey ? createClient(supabaseUrl, serviceKey) : null;

  // Phase 2: Basic Connection Tests
  section('2. Supabase Connection Tests');
  
  subsection('Testing Anonymous Client Connection');
  try {
    const { data, error } = await anonClient.auth.getSession();
    if (error) {
      error(`Anon client connection failed: ${error.message}`);
    } else {
      success('Anonymous client connection successful');
      detail(`Current session: ${data.session ? 'Active' : 'None'}`);
    }
  } catch (err) {
    error(`Anon client error: ${err.message}`);
  }

  if (serviceClient) {
    subsection('Testing Service Role Client Connection');
    try {
      const { data, error } = await serviceClient.from('profiles').select('count').limit(1);
      if (error) {
        error(`Service client connection failed: ${error.message}`);
      } else {
        success('Service role client connection successful');
      }
    } catch (err) {
      error(`Service client error: ${err.message}`);
    }
  }

  // Phase 3: Database Schema Analysis
  section('3. Database Schema Analysis');
  
  subsection('Checking Core Tables');
  const coreTables = ['profiles', 'clients', 'assets', 'campaigns', 'templates', 'matrices', 'executions'];
  
  for (const table of coreTables) {
    try {
      const { data, error } = await (serviceClient || anonClient)
        .from(table)
        .select('*')
        .limit(0); // Just check if table exists
        
      if (error) {
        if (error.message.includes('does not exist')) {
          error(`Table '${table}' does not exist`);
        } else if (error.message.includes('permission denied')) {
          warning(`Table '${table}' exists but has permission issues`);
          detail(`Error: ${error.message}`);
        } else {
          warning(`Table '${table}' has issues: ${error.message}`);
        }
      } else {
        success(`Table '${table}' exists and is accessible`);
      }
    } catch (err) {
      error(`Failed to check table '${table}': ${err.message}`);
    }
  }

  // Phase 4: Row Level Security Analysis
  section('4. Row Level Security (RLS) Analysis');
  
  subsection('Checking RLS Status');
  if (serviceClient) {
    try {
      // Check if RLS is enabled on core tables
      const { data: rlsStatus, error } = await serviceClient
        .from('pg_tables')
        .select('tablename, rowsecurity')
        .in('tablename', coreTables);
        
      if (error) {
        warning(`Could not check RLS status: ${error.message}`);
      } else {
        rlsStatus.forEach(table => {
          if (table.rowsecurity) {
            success(`RLS enabled on '${table.tablename}'`);
          } else {
            warning(`RLS disabled on '${table.tablename}' - this could cause security issues`);
          }
        });
      }
    } catch (err) {
      warning(`RLS status check failed: ${err.message}`);
    }
  }

  subsection('Testing RLS Policies');
  try {
    // Test without authentication (should fail with RLS)
    const { data, error } = await anonClient
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (error) {
      if (error.message.includes('row-level security') || error.message.includes('permission denied')) {
        success('RLS policies are working - unauthenticated access blocked');
        detail('This is expected behavior for security');
      } else {
        warning(`Unexpected RLS test result: ${error.message}`);
      }
    } else {
      warning('RLS might not be properly configured - unauthenticated access allowed');
    }
  } catch (err) {
    warning(`RLS test failed: ${err.message}`);
  }

  // Phase 5: User Authentication Flow Test
  section('5. Authentication Flow Analysis');
  
  subsection('Testing User Lookup');
  
  // Check if the specific user exists
  const testEmail = 'tomh@redbaez.com';
  info(`Looking for user: ${testEmail}`);
  
  if (serviceClient) {
    try {
      // Check auth.users table
      const { data: authUsers, error: authError } = await serviceClient.auth.admin.listUsers();
      
      if (authError) {
        error(`Could not query auth users: ${authError.message}`);
      } else {
        const targetUser = authUsers.users.find(u => u.email === testEmail);
        
        if (targetUser) {
          success(`User ${testEmail} found in auth.users`);
          detail(`User ID: ${targetUser.id}`);
          detail(`Email confirmed: ${targetUser.email_confirmed_at ? 'Yes' : 'No'}`);
          detail(`Last sign-in: ${targetUser.last_sign_in_at || 'Never'}`);
          detail(`Created: ${targetUser.created_at}`);
          
          // Check if profile exists
          try {
            const { data: profile, error: profileError } = await serviceClient
              .from('profiles')
              .select('*')
              .eq('id', targetUser.id)
              .single();
              
            if (profileError) {
              if (profileError.code === 'PGRST116') {
                warning('User exists in auth.users but no profile in profiles table');
                info('This could cause 401 errors after login');
              } else {
                error(`Profile query failed: ${profileError.message}`);
              }
            } else {
              success('User profile exists in profiles table');
              detail(`Name: ${profile.full_name || profile.first_name + ' ' + profile.last_name || 'Not set'}`);
              detail(`Role: ${profile.role || 'Not set'}`);
              detail(`Company: ${profile.company || 'Not set'}`);
            }
          } catch (err) {
            error(`Profile check failed: ${err.message}`);
          }
          
          // Check user's clients
          try {
            const { data: clients, error: clientsError } = await serviceClient
              .from('clients')
              .select('id, name, slug')
              .eq('created_by', targetUser.id);
              
            if (clientsError) {
              warning(`Could not check user's clients: ${clientsError.message}`);
            } else {
              if (clients.length > 0) {
                success(`User has ${clients.length} client(s)`);
                clients.forEach(client => {
                  detail(`- ${client.name} (${client.slug})`);
                });
              } else {
                info('User has no clients yet');
              }
            }
          } catch (err) {
            warning(`Client check failed: ${err.message}`);
          }
          
        } else {
          warning(`User ${testEmail} not found in auth.users`);
          info('They may need to sign up first');
        }
      }
    } catch (err) {
      error(`User lookup failed: ${err.message}`);
    }
  } else {
    warning('Cannot check user details without service role key');
  }

  // Phase 6: API Route Analysis
  section('6. API Route Configuration Analysis');
  
  subsection('Checking Middleware Configuration');
  
  // Check if middleware file exists and is properly configured
  const fs = require('fs');
  const path = require('path');
  
  const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    success('Middleware file exists');
    
    try {
      const middlewareContent = fs.readFileSync(middlewarePath, 'utf8');
      
      if (middlewareContent.includes('auth')) {
        success('Middleware includes auth handling');
      } else {
        warning('Middleware might not handle authentication');
      }
      
      if (middlewareContent.includes('supabase')) {
        success('Middleware includes Supabase integration');
      } else {
        warning('Middleware might not integrate with Supabase');
      }
    } catch (err) {
      warning(`Could not analyze middleware: ${err.message}`);
    }
  } else {
    warning('No middleware.ts file found - this might affect authentication');
  }

  // Phase 7: Session Management Analysis
  section('7. Session Management Analysis');
  
  subsection('Testing Session Configuration');
  
  // Check Supabase client configuration
  info('Analyzing Supabase client configuration...');
  
  const clientConfig = anonClient.supabaseUrl;
  if (clientConfig) {
    success('Supabase client is properly initialized');
  }
  
  // Test session persistence
  try {
    const { data: sessionData } = await anonClient.auth.getSession();
    info('Session persistence test:');
    detail(`Auto refresh: ${anonClient.auth.autoRefreshToken ? 'Enabled' : 'Disabled'}`);
    detail(`Persist session: ${anonClient.auth.persistSession ? 'Enabled' : 'Disabled'}`);
    detail(`Detect session in URL: ${anonClient.auth.detectSessionInUrl ? 'Enabled' : 'Disabled'}`);
  } catch (err) {
    warning(`Session config check failed: ${err.message}`);
  }

  // Phase 8: Specific 401 Error Diagnostics
  section('8. 401 Error Root Cause Analysis');
  
  subsection('Common Causes of 401 After Successful Login');
  
  info('Analyzing potential causes:');
  
  // Check 1: JWT Secret mismatch
  if (!jwtSecret) {
    error('JWT_SECRET not configured - this is likely the main cause');
    info('API routes use JWT_SECRET to verify tokens');
    info('Without it, all authenticated API calls will return 401');
  } else {
    success('JWT_SECRET is configured');
  }
  
  // Check 2: Token header format
  info('Token header format:');
  detail('Ensure Authorization header uses format: "Bearer <token>"');
  detail('Check browser developer tools Network tab for API calls');
  
  // Check 3: Token expiry
  info('Token expiry settings:');
  const jwtExpiry = process.env.JWT_EXPIRY || '7d';
  detail(`JWT expiry: ${jwtExpiry}`);
  detail('If tokens expire too quickly, users get 401 errors');
  
  // Check 4: CORS configuration
  info('CORS configuration:');
  const allowedOrigins = process.env.ALLOWED_ORIGINS;
  if (allowedOrigins) {
    detail(`Allowed origins: ${allowedOrigins}`);
  } else {
    warning('ALLOWED_ORIGINS not set - might cause CORS issues');
  }

  // Phase 9: Storage and Bucket Analysis
  section('9. Storage Configuration Analysis');
  
  subsection('Checking Storage Buckets');
  
  try {
    const { data: buckets, error } = await anonClient.storage.listBuckets();
    
    if (error) {
      warning(`Could not list storage buckets: ${error.message}`);
    } else {
      const requiredBuckets = ['assets', 'avatars', 'templates', 'renders', 'campaigns'];
      
      success(`Found ${buckets.length} storage bucket(s)`);
      
      requiredBuckets.forEach(bucketName => {
        const bucket = buckets.find(b => b.name === bucketName);
        if (bucket) {
          success(`Bucket '${bucketName}' exists (public: ${bucket.public})`);
        } else {
          warning(`Missing bucket: '${bucketName}'`);
        }
      });
    }
  } catch (err) {
    warning(`Storage check failed: ${err.message}`);
  }

  // Phase 10: Recommendations
  section('10. Diagnostic Summary & Recommendations');
  
  info('Based on the analysis above, here are the most likely causes of 401 errors:');
  
  console.log('\n🎯 ' + colors.bold + colors.green + 'TOP RECOMMENDATIONS:' + colors.reset);
  
  if (!jwtSecret) {
    console.log('   1️⃣  ' + colors.red + 'CRITICAL: Set JWT_SECRET environment variable' + colors.reset);
    console.log('      This is the most common cause of 401 errors after login');
    console.log('      Generate a secure 32+ character secret and add to environment');
  }
  
  console.log('   2️⃣  ' + colors.yellow + 'Check browser Network tab for failed API calls' + colors.reset);
  console.log('      Look for calls returning 401 and examine headers');
  
  console.log('   3️⃣  ' + colors.blue + 'Verify user profile exists in profiles table' + colors.reset);
  console.log('      Users need both auth.users entry AND profiles table entry');
  
  console.log('   4️⃣  ' + colors.cyan + 'Ensure RLS policies allow authenticated access' + colors.reset);
  console.log('      Policies might be too restrictive for the user');
  
  console.log('\n🔧 ' + colors.bold + colors.magenta + 'IMMEDIATE FIXES:' + colors.reset);
  
  if (!jwtSecret) {
    console.log('   • Add to .env.local: JWT_SECRET=<32-character-random-string>');
    console.log('   • Add to Netlify env vars: JWT_SECRET=<same-secret>');
  }
  
  console.log('   • Run: npm run dev and test login again');
  console.log('   • Check browser console for additional error messages');
  console.log('   • Verify Supabase project is active and not paused');
  
  console.log('\n📚 ' + colors.bold + colors.blue + 'USEFUL DEBUG COMMANDS:' + colors.reset);
  console.log('   • node scripts/verify-supabase-setup.js');
  console.log('   • node scripts/create-test-user.ts');
  console.log('   • Check Supabase Dashboard > Authentication > Users');
  console.log('   • Check Supabase Dashboard > Database > RLS Policies');
  
  log('\n' + colors.bold + colors.green + '✨ Diagnostic complete!' + colors.reset);
}

// Run the diagnostic
main().catch(console.error);