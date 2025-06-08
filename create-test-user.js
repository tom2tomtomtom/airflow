const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function createTestUser() {
  const testUser = {
    email: 'test@airwave.com',
    password: 'TestPassword123!',
    name: 'Test User'
  };

  console.log('🔧 Creating test user for API testing...');
  
  try {
    // Create user via signup API
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test user created successfully!');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Password:', testUser.password);
      console.log('👤 User ID:', data.user?.id);
      console.log('🎫 Token:', data.user?.token?.substring(0, 20) + '...');
      
      // Save test credentials for the test
      require('fs').writeFileSync('./test-credentials.json', JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        userId: data.user?.id,
        token: data.user?.token
      }, null, 2));
      
      console.log('💾 Test credentials saved to test-credentials.json');
      return data.user;
    } else {
      console.log('❌ Failed to create test user:', data.error);
      
      // Try to login with existing credentials
      console.log('🔄 Attempting to login with existing test user...');
      return await loginTestUser();
    }
  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
    
    // Try to login instead
    console.log('🔄 Attempting to login with existing test user...');
    return await loginTestUser();
  }
}

async function loginTestUser() {
  const testUser = {
    email: 'test@airwave.com',
    password: 'TestPassword123!'
  };

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Test user login successful!');
      console.log('👤 User ID:', data.user?.id);
      console.log('🎫 Token:', data.user?.token?.substring(0, 20) + '...');
      
      // Save test credentials for the test
      require('fs').writeFileSync('./test-credentials.json', JSON.stringify({
        email: testUser.email,
        password: testUser.password,
        userId: data.user?.id,
        token: data.user?.token
      }, null, 2));
      
      console.log('💾 Test credentials saved to test-credentials.json');
      return data.user;
    } else {
      console.log('❌ Failed to login test user:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Error logging in test user:', error.message);
    return null;
  }
}

// Run the function
createTestUser().then(user => {
  if (user) {
    console.log('\n🎉 Test user ready for API testing!');
  } else {
    console.log('\n❌ Could not create or login test user');
  }
}).catch(console.error);