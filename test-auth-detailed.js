const puppeteer = require('playwright');

async function testAuthenticationFlow() {
  console.log('🧪 Detailed Authentication Test...\n');
  
  const browser = await puppeteer.chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Enable detailed logging
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('📤 REQUEST:', request.method(), request.url());
      if (request.headers()['cookie']) {
        console.log('🍪 REQUEST COOKIES:', request.headers()['cookie']);
      }
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('📥 RESPONSE:', response.status(), response.url());
      const setCookie = response.headers()['set-cookie'];
      if (setCookie) {
        console.log('🍪 RESPONSE SET-COOKIE:', setCookie);
      }
    }
  });

  try {
    // Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.waitForTimeout(3000);

    // Fill login form
    console.log('2️⃣ Filling login form...');
    await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
    await page.fill('[data-testid="password-input"] input', 'Wijlre2010');

    // Submit and monitor response
    console.log('3️⃣ Submitting login form...');
    await page.click('[data-testid="sign-in-button"]');
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    // Check browser cookies after login
    const cookies = await context.cookies();
    const airwaveCookies = cookies.filter(c => c.name.includes('airwave'));
    console.log('🍪 Browser cookies after login:', airwaveCookies);

    const currentUrl = page.url();
    console.log('📍 Current URL after login:', currentUrl);

    if (currentUrl.includes('dashboard')) {
      console.log('✅ Login successful - redirected to dashboard');
      
      // Test API call with more detail
      console.log('4️⃣ Testing protected API call...');
      
      const result = await page.evaluate(async () => {
        console.log('Making API call...');
        try {
          const response = await fetch('/api/clients', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          
          const responseText = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseText);
          } catch {
            responseData = responseText;
          }
          
          return {
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseData
          };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('📊 Detailed API Response:', JSON.stringify(result, null, 2));
      
      if (result.status === 200) {
        console.log('🎉 AUTHENTICATION WORKING PERFECTLY!');
        console.log('✅ Cookies are properly set and recognized');
        return true;
      } else if (result.status === 401) {
        console.log('❌ Authentication failed - cookies not working');
        console.log('   This could be due to:');
        console.log('   - Cookie not being set properly');
        console.log('   - Cookie not being sent with API requests');
        console.log('   - Token validation failing on server');
        return false;
      } else {
        console.log('⚠️ Unexpected response:', result.status);
        return false;
      }
    } else {
      console.log('❌ Login failed - still on login page');
      return false;
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  } finally {
    await browser.close();
  }
}

testAuthenticationFlow().then(success => {
  if (success) {
    console.log('\n🎉 AUTHENTICATION FULLY WORKING!');
    console.log('Ready to proceed with complete workflow testing.');
  } else {
    console.log('\n❌ Authentication still needs fixing.');
  }
});