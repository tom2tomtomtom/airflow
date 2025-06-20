#!/usr/bin/env node

/**
 * API Endpoints Test Script
 * Tests all major API endpoints to verify they work correctly
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword123';

console.log('🧪 AIrWAVE API Endpoints Test');
console.log('============================');
console.log(`Testing against: ${BASE_URL}`);
console.log('');

let authToken = null;

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test authentication
async function testAuth() {
  console.log('🔐 Testing Authentication...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }
    });

    if (response.status === 200 && response.data.success) {
      authToken = response.data.token;
      console.log('   ✅ Login successful');
      console.log(`   📝 Token: ${authToken ? 'Received' : 'Missing'}`);
      return true;
    } else {
      console.log('   ❌ Login failed:', response.data.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Login error:', error.message);
    return false;
  }
}

// Test clients API
async function testClients() {
  console.log('👥 Testing Clients API...');
  
  if (!authToken) {
    console.log('   ⚠️  Skipping - no auth token');
    return;
  }

  try {
    // Test GET clients
    const getResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (getResponse.status === 200) {
      console.log('   ✅ GET /api/clients - Success');
      console.log(`   📊 Found ${getResponse.data.clients?.length || 0} clients`);
    } else {
      console.log('   ❌ GET /api/clients - Failed:', getResponse.data.message);
    }

    // Test POST client (create new)
    const testClient = {
      name: `Test Client ${Date.now()}`,
      industry: 'Technology',
      description: 'API test client',
      primaryColor: '#3a86ff',
      secondaryColor: '#8338ec'
    };

    const postResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: testClient
    });

    if (postResponse.status === 201) {
      console.log('   ✅ POST /api/clients - Success');
      console.log(`   🆕 Created client: ${postResponse.data.client?.name}`);
      return postResponse.data.client?.id;
    } else {
      console.log('   ❌ POST /api/clients - Failed:', postResponse.data.message);
      console.log('   🔍 Error details:', postResponse.data);
    }
  } catch (error) {
    console.log('   ❌ Clients API error:', error.message);
  }
}

// Test assets API
async function testAssets(clientId) {
  console.log('📁 Testing Assets API...');
  
  if (!authToken) {
    console.log('   ⚠️  Skipping - no auth token');
    return;
  }

  if (!clientId) {
    console.log('   ⚠️  Skipping - no client ID');
    return;
  }

  try {
    // Test GET assets
    const getResponse = await makeRequest(`${BASE_URL}/api/assets?clientId=${clientId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (getResponse.status === 200) {
      console.log('   ✅ GET /api/assets - Success');
      console.log(`   📊 Found ${getResponse.data.assets?.length || 0} assets`);
    } else {
      console.log('   ❌ GET /api/assets - Failed:', getResponse.data.message);
    }

    // Test POST asset (create new)
    const testAsset = {
      name: `Test Asset ${Date.now()}`,
      type: 'image',
      url: 'https://via.placeholder.com/800x600',
      thumbnailUrl: 'https://via.placeholder.com/200x150',
      description: 'API test asset',
      tags: ['test', 'api'],
      clientId: clientId,
      width: 800,
      height: 600,
      size: 50000,
      mimeType: 'image/png'
    };

    const postResponse = await makeRequest(`${BASE_URL}/api/assets`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: testAsset
    });

    if (postResponse.status === 201) {
      console.log('   ✅ POST /api/assets - Success');
      console.log(`   🆕 Created asset: ${postResponse.data.asset?.name}`);
    } else {
      console.log('   ❌ POST /api/assets - Failed:', postResponse.data.message);
      console.log('   🔍 Error details:', postResponse.data);
    }
  } catch (error) {
    console.log('   ❌ Assets API error:', error.message);
  }
}

// Test AI generation API
async function testAI() {
  console.log('🤖 Testing AI Generation API...');
  
  if (!authToken) {
    console.log('   ⚠️  Skipping - no auth token');
    return;
  }

  try {
    const response = await makeRequest(`${BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        type: 'text',
        prompt: 'Create a tagline for a tech startup',
        count: 3
      }
    });

    if (response.status === 200) {
      console.log('   ✅ POST /api/ai/generate - Success');
      console.log(`   🎯 Generated ${response.data.result?.length || 0} variations`);
    } else {
      console.log('   ❌ POST /api/ai/generate - Failed:', response.data.message);
    }
  } catch (error) {
    console.log('   ❌ AI API error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('Starting API tests...\n');
  
  // Test authentication first
  const authSuccess = await testAuth();
  console.log('');
  
  if (!authSuccess) {
    console.log('❌ Authentication failed - stopping tests');
    return;
  }
  
  // Test clients API
  const clientId = await testClients();
  console.log('');
  
  // Test assets API
  await testAssets(clientId);
  console.log('');
  
  // Test AI API
  await testAI();
  console.log('');
  
  console.log('🎉 API tests completed!');
  console.log('');
  console.log('📋 Summary:');
  console.log('- Authentication: Working');
  console.log('- Clients API: Check results above');
  console.log('- Assets API: Check results above');
  console.log('- AI API: Check results above');
}

// Run the tests
runTests().catch(console.error);
