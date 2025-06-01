#!/usr/bin/env node

/**
 * Test Login API
 */

const http = require('http');

console.log('🧪 Testing Login API');
console.log('===================\n');

const testLogin = async () => {
  const postData = JSON.stringify({
    email: 'tomh@redbaez.com',
    password: 'Wijlre2010'
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

const main = async () => {
  try {
    console.log('Testing login with credentials: tomh@redbaez.com / Wijlre2010');
    
    const result = await testLogin();
    
    console.log('Status Code:', result.statusCode);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    if (result.statusCode === 200 && result.data.success) {
      console.log('\n✅ LOGIN TEST PASSED!');
      console.log('User:', result.data.user.name);
      console.log('Email:', result.data.user.email);
      console.log('Token:', result.data.user.token);
      
      // Check for cookies
      const cookies = result.headers['set-cookie'];
      if (cookies) {
        console.log('Cookies set:', cookies.length);
        cookies.forEach(cookie => {
          if (cookie.includes('airwave_token')) {
            console.log('✅ Auth token cookie set');
          }
        });
      }
    } else {
      console.log('\n❌ LOGIN TEST FAILED');
      console.log('Error:', result.data.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

main();
