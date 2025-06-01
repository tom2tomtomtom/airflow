// Simple script to create test client via API
const BASE_URL = 'https://airwave-complete.netlify.app';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

async function createTestClient() {
  console.log('🚀 Creating test client via API...');

  try {
    // 1. Login to get token
    console.log('🔐 Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }),
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      throw new Error(`Login failed: ${loginData.message}`);
    }

    const token = loginData.token;
    console.log('✅ Login successful');

    // 2. Create test client
    console.log('🏢 Creating test client...');
    const clientData = {
      name: 'Redbaez Digital Agency',
      industry: 'Marketing & Advertising',
      description: 'Leading digital marketing agency specializing in AI-powered creative solutions',
      website: 'https://redbaez.com',
      primaryColor: '#1976d2',
      secondaryColor: '#dc004e',
      socialMedia: {
        twitter: '@redbaez',
        linkedin: 'redbaez-digital',
      },
      brandGuidelines: {
        voiceTone: 'Professional, innovative, approachable',
        targetAudience: 'Digital marketers and creative agencies',
        keyMessages: ['Innovation', 'Quality', 'Scalable Solutions']
      }
    };

    const clientResponse = await fetch(`${BASE_URL}/api/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!clientResponse.ok) {
      const errorText = await clientResponse.text();
      throw new Error(`Client creation failed: ${clientResponse.status} - ${errorText}`);
    }

    const clientResult = await clientResponse.json();
    if (!clientResult.success) {
      throw new Error(`Client creation failed: ${clientResult.message}`);
    }

    console.log('✅ Client created successfully!');
    console.log(`   Name: ${clientResult.client.name}`);
    console.log(`   ID: ${clientResult.client.id}`);

    // 3. Verify by fetching clients
    console.log('📋 Verifying client access...');
    const fetchResponse = await fetch(`${BASE_URL}/api/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (fetchResponse.ok) {
      const fetchResult = await fetchResponse.json();
      console.log(`✅ Found ${fetchResult.clients?.length || 0} clients for user`);
      if (fetchResult.clients?.length > 0) {
        fetchResult.clients.forEach(client => {
          console.log(`   - ${client.name} (${client.industry})`);
        });
      }
    }

    console.log('🎉 Test client setup completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createTestClient();