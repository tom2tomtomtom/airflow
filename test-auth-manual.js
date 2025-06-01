const puppeteer = require('playwright');

async function testAuthenticationFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  const browser = await puppeteer.chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  // Enable request/response logging
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      console.log('📤 REQUEST:', request.method(), request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log('📥 RESPONSE:', response.status(), response.url());
    }
  });

  try {
    // Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    await page.goto('https://airwave-0525-codex.netlify.app/login');
    await page.waitForLoadState('networkidle');

    // Fill login form
    console.log('2️⃣ Filling login form...');
    await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
    await page.fill('[data-testid="password-input"] input', 'Wijlre2010');

    // Submit form and wait for response
    console.log('3️⃣ Submitting login form...');
    const loginPromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/login')
    );
    
    await page.click('[data-testid="sign-in-button"]');
    const loginResponse = await loginPromise;
    
    console.log('✅ Login response received:', loginResponse.status());
    
    // Check if we got redirected to dashboard
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    console.log('📍 Current URL after login:', currentUrl);

    // Test protected API call to check if cookies are working
    console.log('4️⃣ Testing protected API call...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/clients', {
          method: 'GET',
          credentials: 'include'
        });
        
        return {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('📊 API Response:', apiResponse);

    if (apiResponse.status === 200) {
      console.log('✅ Authentication working! Cookies are properly set.');
    } else if (apiResponse.status === 401) {
      console.log('❌ Authentication failed. Cookie not working.');
      
      // Check cookies in browser
      const cookies = await context.cookies();
      console.log('🍪 Browser cookies:', cookies.filter(c => c.name.includes('airwave')));
    } else {
      console.log('⚠️ Unexpected response:', apiResponse);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAuthenticationFlow();