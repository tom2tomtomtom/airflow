const puppeteer = require('playwright');

async function testAuthenticationFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  const browser = await puppeteer.chromium.launch({ headless: false });
  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();

  try {
    // Navigate to login page
    console.log('1️⃣ Navigating to login page...');
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.waitForTimeout(3000); // Wait for full load
    
    // Take screenshot to see current state
    await page.screenshot({ path: 'login-page-current.png' });
    console.log('📸 Screenshot saved as login-page-current.png');
    
    // Check page content
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Check if form elements exist
    const emailExists = await page.locator('[data-testid="email-input"]').count();
    const passwordExists = await page.locator('[data-testid="password-input"]').count();
    const buttonExists = await page.locator('[data-testid="sign-in-button"]').count();
    
    console.log('🔍 Form elements found:');
    console.log('  Email input:', emailExists);
    console.log('  Password input:', passwordExists);
    console.log('  Sign in button:', buttonExists);
    
    if (emailExists && passwordExists && buttonExists) {
      console.log('✅ All form elements found, proceeding with login...');
      
      // Fill form
      await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
      await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
      
      // Take screenshot before submit
      await page.screenshot({ path: 'login-form-filled.png' });
      
      // Enable request/response logging
      page.on('response', response => {
        if (response.url().includes('/api/auth/login')) {
          console.log('📥 Login API Response:', response.status());
        }
      });
      
      // Submit form
      await page.click('[data-testid="sign-in-button"]');
      
      // Wait for navigation or response
      await page.waitForTimeout(3000);
      
      // Take screenshot after submit
      await page.screenshot({ path: 'login-after-submit.png' });
      
      const currentUrl = page.url();
      console.log('📍 Current URL after login:', currentUrl);
      
      // Test API call
      if (currentUrl.includes('dashboard') || !currentUrl.includes('login')) {
        console.log('✅ Login appears successful, testing API...');
        
        const apiResponse = await page.evaluate(async () => {
          try {
            const response = await fetch('/api/clients', {
              method: 'GET',
              credentials: 'include'
            });
            
            return {
              status: response.status,
              ok: response.ok
            };
          } catch (error) {
            return { error: error.message };
          }
        });
        
        console.log('📊 API Response:', apiResponse);
        
        if (apiResponse.status === 200) {
          console.log('🎉 Authentication working perfectly!');
        } else {
          console.log('❌ Authentication failed - API returned:', apiResponse.status);
        }
      } else {
        console.log('❌ Login failed - still on login page');
      }
      
    } else {
      console.log('❌ Form elements not found, page may not have loaded correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAuthenticationFlow();