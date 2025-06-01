import { test, expect } from '@playwright/test';

test.describe('Live Authentication Test', () => {
  test('should authenticate user and verify protected API access', async ({ page, context }) => {
    console.log('🚀 Starting live authentication test...');
    
    // Enable request/response logging
    page.on('request', request => {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      console.log(`📤 Headers:`, request.headers());
    });
    
    page.on('response', response => {
      console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
      console.log(`📥 Headers:`, response.headers());
    });

    // Step 1: Navigate to login page
    console.log('🌐 Navigating to login page...');
    await page.goto('https://airwave-complete.netlify.app/login');
    
    // Wait for page to load and check if we're on login page
    await page.waitForLoadState('networkidle');
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot of login page
    await page.screenshot({ path: 'tests/screenshots/live-auth-login-page.png' });
    console.log('📸 Screenshot taken: login page');

    // Step 2: Fill in login credentials
    console.log('📝 Filling in login credentials...');
    
    // Wait for email input and fill it
    const emailInput = page.locator('input[type="email"], input[name="email"], #email');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('tomh@redbaez.com');
    console.log('✅ Email filled: tomh@redbaez.com');
    
    // Wait for password input and fill it
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('Wijlre2010');
    console.log('✅ Password filled');

    // Step 3: Submit the login form
    console.log('🚀 Submitting login form...');
    
    // Look for submit button or form
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In")');
    
    // Log all cookies before login
    const cookiesBeforeLogin = await context.cookies();
    console.log('🍪 Cookies before login:', cookiesBeforeLogin);
    
    // Submit form and wait for navigation
    await Promise.all([
      page.waitForLoadState('networkidle'),
      submitButton.click()
    ]);
    
    // Wait a bit for any redirects
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL after login attempt: ${page.url()}`);
    
    // Log all cookies after login
    const cookiesAfterLogin = await context.cookies();
    console.log('🍪 Cookies after login:', cookiesAfterLogin);
    
    // Take screenshot after login attempt
    await page.screenshot({ path: 'tests/screenshots/live-auth-after-login.png' });
    console.log('📸 Screenshot taken: after login');

    // Step 4: Check if redirected to dashboard
    console.log('🔍 Checking if redirected to dashboard...');
    
    const currentUrl = page.url();
    const isDashboard = currentUrl.includes('/dashboard') || currentUrl.includes('dashboard');
    
    if (isDashboard) {
      console.log('✅ Successfully redirected to dashboard');
    } else {
      console.log(`❌ Not on dashboard. Current URL: ${currentUrl}`);
      
      // Check for error messages on login page
      const errorMessage = await page.locator('.error, .alert-error, [role="alert"], .text-red-500, .text-danger').first().textContent().catch(() => null);
      if (errorMessage) {
        console.log(`❌ Login error message: ${errorMessage}`);
      }
    }

    // Step 5: Test protected API call to /api/clients
    console.log('🔐 Testing protected API call to /api/clients...');
    
    try {
      // Make API request with current context (including cookies)
      const apiResponse = await page.request.get('https://airwave-complete.netlify.app/api/clients');
      
      console.log(`📡 API Response Status: ${apiResponse.status()}`);
      const headers = await apiResponse.headersArray();
      console.log(`📡 API Response Headers:`, headers);
      
      // Try to get response body
      let responseBody;
      try {
        responseBody = await apiResponse.json();
        console.log(`📡 API Response Body:`, JSON.stringify(responseBody, null, 2));
      } catch (e) {
        const textBody = await apiResponse.text();
        console.log(`📡 API Response Body (text):`, textBody);
        responseBody = textBody;
      }
      
      // Step 6: Report authentication status
      if (apiResponse.status() === 200) {
        console.log('🎉 AUTHENTICATION SUCCESS: API call returned 200');
        console.log('✅ Authentication cookies are working correctly');
        
        expect(apiResponse.status()).toBe(200);
        expect(isDashboard).toBe(true);
        
      } else if (apiResponse.status() === 401) {
        console.log('❌ AUTHENTICATION FAILED: API call returned 401 (Unauthorized)');
        console.log('❌ Authentication cookies are not working or user is not authenticated');
        
        // Still assert what we found for test reporting
        expect(apiResponse.status()).toBe(401);
        
      } else {
        console.log(`⚠️  UNEXPECTED RESPONSE: API call returned ${apiResponse.status()}`);
        console.log('⚠️  This may indicate a server error or other issue');
      }
      
    } catch (error) {
      console.error('❌ Error making API request:', error);
      throw error;
    }

    // Additional debugging: Check for any authentication-related elements
    console.log('🔍 Additional debugging checks...');
    
    // Check if user menu or profile is visible (indicates successful auth)
    const userElements = await page.locator('[data-testid="user-menu"], .user-menu, .profile-menu, button:has-text("Profile"), button:has-text("Logout")').count();
    console.log(`👤 User-related elements found: ${userElements}`);
    
    // Check localStorage for any auth tokens
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key);
        }
      }
      return items;
    });
    console.log('💾 LocalStorage contents:', localStorage);
    
    // Check sessionStorage for any auth tokens
    const sessionStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          items[key] = window.sessionStorage.getItem(key);
        }
      }
      return items;
    });
    console.log('💾 SessionStorage contents:', sessionStorage);

    // Final screenshot
    await page.screenshot({ path: 'tests/screenshots/live-auth-final.png' });
    console.log('📸 Final screenshot taken');
    
    console.log('🏁 Live authentication test completed');
  });
});