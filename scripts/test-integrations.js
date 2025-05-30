#!/usr/bin/env node

/**
 * AIrWAVE Integration Test Script
 * 
 * This script tests all the major integrations we've set up:
 * - OpenAI API connectivity and functionality
 * - Creatomate API connectivity and functionality
 * - Supabase database and storage connectivity
 * - Environment variable configuration
 * - Feature flags and demo mode status
 */

const axios = require('axios');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function runIntegrationTests() {
  console.log('🚀 Starting AIrWAVE Integration Test Suite...\n');
  
  const results = [];
  
  // Test 1: OpenAI Integration
  console.log('1️⃣  Testing OpenAI Integration...');
  try {
    const response = await axios.get(`${BASE_URL}/api/test/openai`, {
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('   ✅ OpenAI integration working');
      console.log(`   📝 Response: ${response.data.message}`);
      console.log(`   🤖 Model: ${response.data.model}`);
      results.push({ test: 'OpenAI', status: 'PASS', message: response.data.message });
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.log('   ❌ OpenAI integration failed');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'OpenAI', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Test 2: Creatomate Connectivity
  console.log('2️⃣  Testing Creatomate Connectivity...');
  try {
    const response = await axios.get(`${BASE_URL}/api/creatomate/test`, {
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('   ✅ Creatomate connectivity working');
      console.log(`   📝 Message: ${response.data.data.message}`);
      console.log(`   📊 Rate Limit Remaining: ${response.data.data.rateLimitRemaining}`);
      results.push({ test: 'Creatomate Connectivity', status: 'PASS' });
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.log('   ❌ Creatomate connectivity failed');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'Creatomate Connectivity', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Test 3: Creatomate Templates
  console.log('3️⃣  Testing Creatomate Templates Access...');
  try {
    const response = await axios.get(`${BASE_URL}/api/creatomate/templates?limit=3`, {
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('   ✅ Creatomate templates accessible');
      console.log(`   📊 Templates found: ${response.data.data.length}`);
      if (response.data.data.length > 0) {
        console.log(`   🎨 Sample template: ${response.data.data[0].name}`);
      }
      results.push({ test: 'Creatomate Templates', status: 'PASS' });
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.log('   ❌ Creatomate templates access failed');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'Creatomate Templates', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Test 4: Creatomate Account Info
  console.log('4️⃣  Testing Creatomate Account Information...');
  try {
    const response = await axios.get(`${BASE_URL}/api/creatomate/account`, {
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('   ✅ Creatomate account accessible');
      console.log(`   💳 Plan: ${response.data.data.plan}`);
      console.log(`   🎯 Credits Remaining: ${response.data.data.creditsRemaining}`);
      console.log(`   📊 Credits Used: ${response.data.data.creditsUsed}`);
      results.push({ test: 'Creatomate Account', status: 'PASS' });
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.log('   ❌ Creatomate account access failed');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'Creatomate Account', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Test 5: Supabase Integration
  console.log('5️⃣  Testing Supabase Integration...');
  try {
    const response = await axios.get(`${BASE_URL}/api/test/supabase`, {
      timeout: 30000
    });
    
    if (response.data.success) {
      console.log('   ✅ Supabase integration working');
      console.log(`   📝 Message: ${response.data.message}`);
      console.log(`   🗄️  Database connected: ${response.data.data.database.connected}`);
      console.log(`   📊 Storage accessible: ${response.data.data.storage.accessible}`);
      
      const tables = response.data.data.database.tables;
      const accessibleTables = tables.filter(t => t.accessible).length;
      console.log(`   📋 Tables accessible: ${accessibleTables}/${tables.length}`);
      
      results.push({ test: 'Supabase', status: 'PASS' });
    } else {
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.log('   ❌ Supabase integration failed');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'Supabase', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Test 6: Authentication System
  console.log('6️⃣  Testing Authentication System...');
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/test`, {
      timeout: 10000
    });
    
    if (response.data.success) {
      console.log('   ✅ Authentication system working');
      console.log(`   🔧 Mode: ${response.data.mode}`);
      console.log(`   📝 ${response.data.message}`);
      
      if (response.data.testCredentials) {
        console.log('   🔑 Test credentials available:');
        response.data.testCredentials.forEach(cred => {
          console.log(`      - ${cred.email} / ${cred.password}`);
        });
      }
      
      results.push({ test: 'Authentication', status: 'PASS' });
    } else {
      throw new Error('Auth test returned failure');
    }
  } catch (error) {
    console.log('   ❌ Authentication system failed');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'Authentication', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Test 7: Full Integration Suite
  console.log('7️⃣  Running Complete Integration Suite...');
  try {
    const response = await axios.get(`${BASE_URL}/api/test/integration-suite`, {
      timeout: 120000 // 2 minutes
    });
    
    if (response.data.success) {
      console.log('   ✅ Complete integration suite passed');
      console.log(`   📊 Summary: ${response.data.summary.passed}/${response.data.summary.total} tests passed`);
      console.log(`   ⏱️  Duration: ${response.data.summary.duration}ms`);
      results.push({ test: 'Integration Suite', status: 'PASS' });
    } else {
      console.log('   ⚠️  Some integration tests failed');
      console.log(`   📊 Summary: ${response.data.summary.passed}/${response.data.summary.total} tests passed`);
      response.data.results.forEach(result => {
        if (result.status === 'fail') {
          console.log(`   ❌ ${result.name}: ${result.error}`);
        }
      });
      results.push({ test: 'Integration Suite', status: 'PARTIAL' });
    }
  } catch (error) {
    console.log('   ❌ Integration suite failed to run');
    console.log(`   🚨 Error: ${error.response?.data?.error || error.message}`);
    results.push({ test: 'Integration Suite', status: 'FAIL', error: error.message });
  }
  
  console.log('');

  // Summary
  console.log('📋 Test Summary:');
  console.log('================');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const partial = results.filter(r => r.status === 'PARTIAL').length;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'PARTIAL' ? '⚠️' : '❌';
    console.log(`${icon} ${result.test}: ${result.status}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  console.log('');
  console.log(`🎯 Overall: ${passed} passed, ${partial} partial, ${failed} failed`);
  
  if (failed === 0 && partial === 0) {
    console.log('🎉 All integrations are working perfectly! AIrWAVE is ready for production.');
    process.exit(0);
  } else if (failed > 0) {
    console.log('🚨 Some integrations failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('⚠️  Some integrations have issues but are partially working.');
    process.exit(0);
  }
}

// Check if we're running in a development environment
if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_APP_URL) {
  console.log('⚠️  Running in production mode. Make sure your app is deployed and accessible.');
  console.log('   Set NEXT_PUBLIC_APP_URL environment variable if testing a deployed version.');
  console.log('');
}

runIntegrationTests().catch(error => {
  console.error('💥 Integration test script failed:', error.message);
  process.exit(1);
});