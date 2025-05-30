// API Integration Test for AIrWAVE Platform
// Tests core API functionality and integrations

const BASE_URL = 'https://airwave2.netlify.app';

const creatomateConfig = {
  templateId: '374ee9e3-de75-4feb-bfae-5c5e11d88d80',
  apiKey: '5ab32660fef044e5b135a646a78cff8ec7e2503b79e201bad7e566f4b24ec111f2fa7e01a824eaa77904c1783e083efa',
  modifications: {
    "Music.source": "https://creatomate.com/files/assets/b5dc815e-dcc9-4c62-9405-f94913936bf5",
    "Background-1.source": "https://creatomate.com/files/assets/4a7903f0-37bc-48df-9d83-5eb52afd5d07",
    "Text-1.text": "Test Text 1 - AIrWAVE Platform Test",
    "Background-2.source": "https://creatomate.com/files/assets/4a6f6b28-bb42-4987-8eca-7ee36b347ee7",
    "Text-2.text": "Test Text 2 - Matrix Functionality"
  }
};

async function testAPI() {
  console.log('🧪 AIrWAVE API Integration Test Suite');
  console.log('=====================================\n');

  // Test 1: Health Check
  console.log('1. Testing API Health...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Health: ${data.status || 'unknown'}`);
    console.log(`   ✅ Health endpoint responding\n`);
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}\n`);
  }

  // Test 2: Authentication API
  console.log('2. Testing Authentication API...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@airwave.app',
        password: 'demo123'
      })
    });
    console.log(`   Login Status: ${loginResponse.status}`);
    
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpass123',
        name: 'Test User'
      })
    });
    console.log(`   Signup Status: ${signupResponse.status}`);
    console.log(`   ✅ Authentication endpoints responding\n`);
  } catch (error) {
    console.log(`   ❌ Authentication test failed: ${error.message}\n`);
  }

  // Test 3: Templates API
  console.log('3. Testing Templates API...');
  try {
    const response = await fetch(`${BASE_URL}/api/templates`);
    const data = await response.json();
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates found: ${Array.isArray(data) ? data.length : 'unknown'}`);
    console.log(`   ✅ Templates endpoint responding\n`);
  } catch (error) {
    console.log(`   ❌ Templates test failed: ${error.message}\n`);
  }

  // Test 4: Creatomate Integration
  console.log('4. Testing Creatomate Integration...');
  try {
    const response = await fetch(`${BASE_URL}/api/creatomate/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: creatomateConfig.templateId,
        modifications: creatomateConfig.modifications
      })
    });
    console.log(`   Render Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Render Response: ${JSON.stringify(data, null, 2)}`);
      console.log(`   ✅ Creatomate integration working`);
    } else {
      const errorData = await response.text();
      console.log(`   ⚠️  Creatomate response: ${errorData}`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Creatomate test failed: ${error.message}\n`);
  }

  // Test 5: Assets API
  console.log('5. Testing Assets API...');
  try {
    const response = await fetch(`${BASE_URL}/api/assets`);
    console.log(`   Assets Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Assets found: ${Array.isArray(data) ? data.length : 'unknown'}`);
      console.log(`   ✅ Assets endpoint responding`);
    } else {
      console.log(`   ⚠️  Assets endpoint may need authentication`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Assets test failed: ${error.message}\n`);
  }

  // Test 6: OpenAI Integration
  console.log('6. Testing OpenAI Integration...');
  try {
    const response = await fetch(`${BASE_URL}/api/ai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Generate test marketing content',
        type: 'motivation'
      })
    });
    console.log(`   AI Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   AI Response: ${JSON.stringify(data, null, 2)}`);
      console.log(`   ✅ AI integration responding`);
    } else {
      console.log(`   ⚠️  AI integration may be in demo mode`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ AI test failed: ${error.message}\n`);
  }

  // Test 7: Direct Creatomate API Test
  console.log('7. Testing Direct Creatomate API...');
  try {
    const response = await fetch('https://api.creatomate.com/v1/renders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${creatomateConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([{
        template_id: creatomateConfig.templateId,
        modifications: creatomateConfig.modifications
      }])
    });
    
    console.log(`   Direct Creatomate Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   Render ID: ${data[0]?.id || 'unknown'}`);
      console.log(`   Status: ${data[0]?.status || 'unknown'}`);
      console.log(`   ✅ Direct Creatomate API working`);
    } else {
      const errorData = await response.text();
      console.log(`   ❌ Direct Creatomate error: ${errorData}`);
    }
    console.log('');
  } catch (error) {
    console.log(`   ❌ Direct Creatomate test failed: ${error.message}\n`);
  }

  console.log('🏁 API Integration Test Complete');
  console.log('=====================================');
}

// Run the test
testAPI().catch(console.error);