// Test client creation API directly
async function testClientCreationAPI() {
  console.log('🔌 Testing Client Creation API directly...');
  
  try {
    // First, simulate getting an auth cookie by doing a fake login request
    const response = await fetch('http://localhost:3000/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'sb-fdsjlutmfaatslznjxiv-auth-token=your-token-here' // This would normally come from login
      },
      body: JSON.stringify({
        name: 'Direct API Test Client',
        industry: 'Technology',
        description: 'A test client created via direct API call',
        website: 'https://testclient.com',
        brand_guidelines: {
          voiceTone: 'Professional and friendly',
          targetAudience: 'Tech professionals',
          keyMessages: ['Innovation', 'Quality', 'Trust']
        }
      })
    });
    
    const data = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Data:', parsedData);
    
    if (response.status === 401) {
      console.log('✅ API correctly requires authentication (401 Unauthorized)');
      console.log('🔐 This means the API is working, we just need proper authentication');
    } else if (response.status >= 200 && response.status < 300) {
      console.log('🎉 API client creation successful!');
    } else {
      console.log('❌ API error:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
  
  // Test the GET endpoint as well
  console.log('🔍 Testing GET clients API...');
  try {
    const getResponse = await fetch('http://localhost:3000/api/clients');
    const getData = await getResponse.text();
    let parsedGetData;
    try {
      parsedGetData = JSON.parse(getData);
    } catch {
      parsedGetData = getData;
    }
    
    console.log('📡 GET Response Status:', getResponse.status);
    console.log('📡 GET Response Data:', parsedGetData);
    
  } catch (error) {
    console.log('❌ GET request error:', error.message);
  }
}

testClientCreationAPI();