#!/usr/bin/env node

/**
 * Authentication Debug Script
 * Tests authentication flow and identifies issues
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'test-password-123';

async function debugAuth() {
  console.log('🔍 AIrWAVE Authentication Debug Tool');
  console.log('=====================================\n');

  // Test 1: Check if server is running
  console.log('1. Testing server connectivity...');
  try {
    const response = await axios.get(`${BASE_URL}/api/status`, { timeout: 5000 });
    console.log('✅ Server is running');
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data)}\n`);
  } catch (error) {
    console.log('❌ Server not accessible');
    console.log(`   Error: ${error.message}`);
    console.log('   Make sure to run: npm run dev\n');
    return;
  }

  // Test 2: Check login endpoint
  console.log('2. Testing login endpoint...');
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    }, {
      timeout: 10000,
      validateStatus: () => true // Don't throw on 4xx/5xx
    });

    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Login successful');
      
      // Check cookies
      const cookies = response.headers['set-cookie'];
      if (cookies) {
        console.log('   Cookies set:');
        cookies.forEach(cookie => {
          console.log(`     ${cookie}`);
        });
      } else {
        console.log('⚠️  No cookies set in response');
      }
    } else {
      console.log('❌ Login failed');
      console.log(`   Error: ${response.data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Login request failed');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 3: Check protected endpoint
  console.log('3. Testing protected endpoint access...');
  try {
    // First login to get token
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });

    if (loginResponse.data.success && loginResponse.data.user.token) {
      const token = loginResponse.data.user.token;
      
      // Test protected endpoint
      const protectedResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000,
        validateStatus: () => true
      });

      console.log(`   Status: ${protectedResponse.status}`);
      console.log(`   Response: ${JSON.stringify(protectedResponse.data, null, 2)}`);
      
      if (protectedResponse.status === 200) {
        console.log('✅ Protected endpoint accessible');
      } else {
        console.log('❌ Protected endpoint not accessible');
      }
    } else {
      console.log('❌ Could not get token for protected endpoint test');
    }
  } catch (error) {
    console.log('❌ Protected endpoint test failed');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Test 4: Check environment variables
  console.log('4. Checking environment configuration...');
  try {
    const envResponse = await axios.get(`${BASE_URL}/api/auth/test`, {
      timeout: 5000,
      validateStatus: () => true
    });

    console.log(`   Status: ${envResponse.status}`);
    if (envResponse.data) {
      console.log(`   Environment check: ${JSON.stringify(envResponse.data, null, 2)}`);
    }
  } catch (error) {
    console.log('⚠️  Environment check endpoint not available');
  }
  console.log('');

  // Test 5: Check database connectivity
  console.log('5. Testing database connectivity...');
  try {
    // Try to access a simple API that uses the database
    const dbResponse = await axios.get(`${BASE_URL}/api/clients`, {
      timeout: 5000,
      validateStatus: () => true
    });

    if (dbResponse.status === 401) {
      console.log('✅ Database endpoint responding (requires auth)');
    } else if (dbResponse.status === 200) {
      console.log('✅ Database endpoint accessible');
    } else {
      console.log(`⚠️  Database endpoint returned: ${dbResponse.status}`);
    }
  } catch (error) {
    console.log('❌ Database connectivity test failed');
    console.log(`   Error: ${error.message}`);
  }
  console.log('');

  // Summary
  console.log('🎯 Debug Summary');
  console.log('================');
  console.log('If all tests pass, authentication should work correctly.');
  console.log('If any tests fail, check the error messages above.');
  console.log('');
  console.log('Common issues:');
  console.log('- Server not running: Run `npm run dev`');
  console.log('- Environment variables: Check Netlify environment settings');
  console.log('- Database issues: Check Supabase connection');
  console.log('- Cookie issues: Check middleware configuration');
  console.log('');
  console.log('Next steps:');
  console.log('1. Fix any failing tests');
  console.log('2. Run Playwright tests: `npm run test:e2e`');
  console.log('3. Test in browser manually');
}

// Run the debug script
debugAuth().catch(error => {
  console.error('Debug script failed:', error);
  process.exit(1);
});
