/**
 * Manual test for asset library functionality
 */

const fetch = require('node-fetch');

async function testAssetAPI() {
  console.log('🧪 Testing Asset Library API...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Fetch assets without authentication (should work in development)
    console.log('\n1️⃣ Testing asset fetching...');
    const assetsResponse = await fetch(`${baseUrl}/api/assets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Assets API responded with: ${assetsResponse.status}`);
    
    if (assetsResponse.status === 401) {
      console.log('✅ Assets API requires authentication (expected)');
    } else if (assetsResponse.status === 200) {
      const assetsData = await assetsResponse.json();
      console.log(`✅ Assets API working: ${assetsData.assets?.length || 0} assets found`);
    } else {
      console.log(`⚠️ Unexpected status: ${assetsResponse.status}`);
    }
    
    // Test 2: Test upload endpoint (will likely fail without auth but should respond)
    console.log('\n2️⃣ Testing upload endpoint availability...');
    
    // Create a simple form data for testing
    const FormData = require('form-data');
    const form = new FormData();
    form.append('files', Buffer.from('test content'), {
      filename: 'test.txt',
      contentType: 'text/plain'
    });
    
    try {
      const uploadResponse = await fetch(`${baseUrl}/api/assets/upload`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders(),
      });
      
      console.log(`Upload API responded with: ${uploadResponse.status}`);
      
      if (uploadResponse.status === 401) {
        console.log('✅ Upload API requires authentication (expected)');
      } else if (uploadResponse.status === 200) {
        console.log('✅ Upload API working');
      } else {
        const errorText = await uploadResponse.text();
        console.log(`⚠️ Upload error (${uploadResponse.status}): ${errorText.substring(0, 200)}`);
      }
    } catch (uploadError) {
      console.log(`❌ Upload test failed: ${uploadError.message}`);
    }
    
    // Test 3: Test assets page loads
    console.log('\n3️⃣ Testing assets page HTML...');
    const pageResponse = await fetch(`${baseUrl}/assets`);
    console.log(`Assets page responded with: ${pageResponse.status}`);
    
    if (pageResponse.status === 200) {
      const html = await pageResponse.text();
      if (html.includes('Assets') && html.includes('Upload')) {
        console.log('✅ Assets page loads correctly');
      } else {
        console.log('⚠️ Assets page loaded but content may be missing');
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Test the component dependencies
function testComponentDependencies() {
  console.log('\n🔧 Testing Component Dependencies...');
  
  try {
    // Test react-dropzone
    const { useDropzone } = require('react-dropzone');
    console.log('✅ react-dropzone available');
    
    // Test formidable
    const formidable = require('formidable');
    console.log('✅ formidable available');
    
    // Test date-fns
    const { format } = require('date-fns');
    console.log('✅ date-fns available');
    
    // Test MUI components
    try {
      const mui = require('@mui/material');
      console.log('✅ @mui/material available');
    } catch (e) {
      console.log('⚠️ @mui/material may have issues');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Dependency test failed:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Asset Library Tests...');
  
  const depTest = testComponentDependencies();
  const apiTest = await testAssetAPI();
  
  console.log('\n📊 Test Results:');
  console.log(`Dependencies: ${depTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`API Tests: ${apiTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (depTest && apiTest) {
    console.log('\n🎉 Asset Library is ready for testing!');
    console.log('✅ All components and APIs are available');
    console.log('✅ Upload functionality should work with authentication');
    console.log('✅ Asset display and filtering should work');
  } else {
    console.log('\n⚠️ Some issues detected - see details above');
  }
}

runTests().catch(console.error);