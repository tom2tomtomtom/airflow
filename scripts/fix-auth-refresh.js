#!/usr/bin/env node

/**
 * Script to test and fix authentication refresh mechanism
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with session persistence enabled
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'airwave-auth',
    storage: {
      getItem: (key) => {
        if (typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key, value) => {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key) => {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        }
      },
    },
  },
});

async function testAuthFlow() {
  console.log('🔍 Testing Supabase authentication flow...\n');

  try {
    // Check current session
    console.log('1. Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Active session found:');
      console.log('   - User ID:', session.user.id);
      console.log('   - Email:', session.user.email);
      console.log('   - Access token expires:', new Date(session.expires_at * 1000).toLocaleString());
      console.log('   - Has refresh token:', !!session.refresh_token);
      
      // Test token refresh
      console.log('\n2. Testing token refresh...');
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ Refresh error:', refreshError.message);
      } else if (refreshData.session) {
        console.log('✅ Token refreshed successfully');
        console.log('   - New expiry:', new Date(refreshData.session.expires_at * 1000).toLocaleString());
      }
    } else {
      console.log('⚠️  No active session found');
      console.log('\nTo test authentication:');
      console.log('1. Start the dev server: npm run dev');
      console.log('2. Navigate to http://localhost:3000/login');
      console.log('3. Log in with test credentials');
      console.log('4. Run this script again to verify session');
    }

    // Check auth state change listener
    console.log('\n3. Setting up auth state listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`\n🔔 Auth event: ${event}`);
      if (session) {
        console.log('   - User:', session.user.email);
        console.log('   - Expires:', new Date(session.expires_at * 1000).toLocaleString());
      }
    });

    console.log('✅ Auth state listener active');
    console.log('\n📝 Recommendations:');
    console.log('1. Ensure NEXT_PUBLIC_DEMO_MODE=false in environment');
    console.log('2. Clear browser cookies if experiencing issues');
    console.log('3. Check browser console for auth errors');
    console.log('4. Verify Supabase project settings allow session refresh');

    // Cleanup
    setTimeout(() => {
      subscription.unsubscribe();
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testAuthFlow();