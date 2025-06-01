import { test, expect } from '@playwright/test';

test.describe('Authentication Token Debug Test', () => {
  test('should extract auth token and test token validation via debug endpoint', async ({ page, context }) => {
    console.log('🚀 Starting authentication token debug test...');
    
    let authToken: string | null = null;
    let authCookies: any[] = [];
    
    // Step 1: Navigate to login page
    console.log('🌐 Navigating to login page...');
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Step 2: Fill in login credentials
    console.log('📝 Filling in login credentials...');
    
    const emailInput = page.locator('input[type="email"], input[name="email"], #email');
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await emailInput.fill('process.env.TEST_EMAIL || 'test@example.com'');
    
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.fill('process.env.TEST_PASSWORD || 'testpassword'');
    
    console.log('✅ Credentials filled');

    // Step 3: Capture network requests to extract tokens
    console.log('🕸️ Setting up network monitoring...');
    
    page.on('response', async response => {
      const url = response.url();
      console.log(`📥 RESPONSE: ${response.status()} ${url}`);
      
      // Check for auth-related responses
      if (url.includes('/auth/') || url.includes('supabase')) {
        console.log(`🔐 Auth-related response: ${url}`);
        try {
          const headers = response.headers();
          console.log(`🔐 Auth response headers:`, headers);
          
          // Try to get response body for auth calls
          if (response.status() === 200) {
            const responseText = await response.text();
            console.log(`🔐 Auth response body: ${responseText}`);
            
            // Try to parse as JSON and extract tokens
            try {
              const jsonResponse = JSON.parse(responseText);
              if (jsonResponse.access_token) {
                authToken = jsonResponse.access_token;
                console.log(`🎫 Found access_token in response: ${authToken.substring(0, 20)}...`);
              }
              if (jsonResponse.session?.access_token) {
                authToken = jsonResponse.session.access_token;
                console.log(`🎫 Found session.access_token: ${authToken.substring(0, 20)}...`);
              }
              if (jsonResponse.user?.token) {
                authToken = jsonResponse.user.token;
                console.log(`🎫 Found user.token in response: ${authToken.substring(0, 20)}...`);
              }
            } catch (e) {
              console.log('📝 Non-JSON auth response');
            }
          }
        } catch (e) {
          console.log(`⚠️ Error processing auth response: ${e}`);
        }
      }
    });

    // Step 4: Submit login form
    console.log('🚀 Submitting login form...');
    
    const submitButton = page.locator('button[type="submit"], input[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In")');
    
    await Promise.all([
      page.waitForLoadState('networkidle'),
      submitButton.click()
    ]);
    
    await page.waitForTimeout(3000);
    
    console.log(`📍 URL after login: ${page.url()}`);

    // Step 5: Extract tokens from cookies and storage
    console.log('🍪 Extracting tokens from cookies and storage...');
    
    // Get all cookies
    authCookies = await context.cookies();
    console.log('🍪 All cookies:', authCookies);
    
    // Look for auth tokens in cookies
    const supabaseCookies = authCookies.filter(cookie => 
      cookie.name.includes('supabase') || 
      cookie.name.includes('auth') ||
      cookie.name.includes('session') ||
      cookie.name.includes('token')
    );
    console.log('🎫 Auth-related cookies:', supabaseCookies);
    
    // Extract token from Supabase auth cookie if present
    const authCookie = authCookies.find(cookie => 
      cookie.name.includes('supabase-auth-token') ||
      cookie.name.includes('sb-') ||
      cookie.name === 'supabase.auth.token'
    );
    
    if (authCookie) {
      console.log(`🎫 Found auth cookie: ${authCookie.name} = ${authCookie.value.substring(0, 50)}...`);
      
      // Try to parse cookie value as JSON to extract access_token
      try {
        const cookieData = JSON.parse(decodeURIComponent(authCookie.value));
        if (cookieData.access_token) {
          authToken = cookieData.access_token;
          console.log(`🎫 Extracted access_token from cookie: ${authToken.substring(0, 20)}...`);
        }
        if (cookieData.session?.access_token) {
          authToken = cookieData.session.access_token;
          console.log(`🎫 Extracted session.access_token from cookie: ${authToken.substring(0, 20)}...`);
        }
      } catch (e) {
        console.log('⚠️ Could not parse auth cookie as JSON');
        // Maybe the token is directly in the cookie value
        if (authCookie.value.length > 100) {
          authToken = authCookie.value;
          console.log(`🎫 Using cookie value directly as token: ${authToken.substring(0, 20)}...`);
        }
      }
    }
    
    // Check localStorage and sessionStorage
    const localStorage = await page.evaluate(() => {
      const items: any = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key);
        }
      }
      return items;
    });
    
    const sessionStorage = await page.evaluate(() => {
      const items: any = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          items[key] = window.sessionStorage.getItem(key);
        }
      }
      return items;
    });
    
    console.log('💾 LocalStorage:', localStorage);
    console.log('💾 SessionStorage:', sessionStorage);
    
    // Look for tokens in storage
    Object.entries(localStorage).forEach(([key, value]) => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('token')) {
        console.log(`🎫 Found auth-related localStorage: ${key}`);
        try {
          const parsed = JSON.parse(value as string);
          if (parsed.access_token) {
            authToken = parsed.access_token;
            console.log(`🎫 Extracted access_token from localStorage: ${authToken.substring(0, 20)}...`);
          }
        } catch (e) {
          if ((value as string).length > 100) {
            authToken = value as string;
            console.log(`🎫 Using localStorage value as token: ${authToken.substring(0, 20)}...`);
          }
        }
      }
    });
    
    Object.entries(sessionStorage).forEach(([key, value]) => {
      if (key.includes('supabase') || key.includes('auth') || key.includes('token')) {
        console.log(`🎫 Found auth-related sessionStorage: ${key}`);
        try {
          const parsed = JSON.parse(value as string);
          if (parsed.access_token) {
            authToken = parsed.access_token;
            console.log(`🎫 Extracted access_token from sessionStorage: ${authToken.substring(0, 20)}...`);
          }
        } catch (e) {
          if ((value as string).length > 100) {
            authToken = value as string;
            console.log(`🎫 Using sessionStorage value as token: ${authToken.substring(0, 20)}...`);
          }
        }
      }
    });

    // Step 6: Test the auth-debug endpoint
    console.log('🔬 Testing auth-debug endpoint...');
    
    if (!authToken) {
      console.log('❌ No auth token found - cannot test debug endpoint');
      console.log('🔍 Available cookies:', authCookies.map(c => c.name));
      console.log('🔍 Available localStorage keys:', Object.keys(localStorage));
      console.log('🔍 Available sessionStorage keys:', Object.keys(sessionStorage));
      
      // Try to make the API call anyway to see what happens
      console.log('🔬 Making auth-debug call without token...');
      
      try {
        const debugResponse = await page.request.post('https://airwave-complete.netlify.app/api/test/auth-debug', {
          data: { token: null }
        });
        
        console.log(`🔬 Debug endpoint response (no token): ${debugResponse.status()}`);
        const debugResult = await debugResponse.json();
        console.log(`🔬 Debug endpoint result:`, debugResult);
      } catch (error) {
        console.log(`❌ Error calling debug endpoint without token:`, error);
      }
      
    } else {
      console.log(`🎫 Testing with token: ${authToken.substring(0, 20)}...${authToken.substring(-10)}`);
      console.log(`🎫 Token length: ${authToken.length}`);
      
      try {
        const debugResponse = await page.request.post('https://airwave-complete.netlify.app/api/test/auth-debug', {
          data: { token: authToken },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🔬 Debug endpoint response status: ${debugResponse.status()}`);
        const debugHeaders = debugResponse.headers();
        console.log(`🔬 Debug endpoint response headers:`, debugHeaders);
        
        const debugResult = await debugResponse.json();
        console.log(`🔬 Debug endpoint result:`, JSON.stringify(debugResult, null, 2));
        
        // Analyze the debug result
        if (debugResult.success) {
          console.log('✅ TOKEN VALIDATION SUCCESS!');
          console.log(`✅ User ID: ${debugResult.user?.id}`);
          console.log(`✅ User Email: ${debugResult.user?.email}`);
          console.log(`✅ User Role: ${debugResult.user?.role}`);
          console.log(`✅ Profile Found: ${!!debugResult.profile}`);
          
          if (debugResult.profile) {
            console.log(`✅ Profile Data:`, debugResult.profile);
          }
          
          if (debugResult.profileError) {
            console.log(`⚠️ Profile Error: ${debugResult.profileError}`);
          }
          
        } else {
          console.log('❌ TOKEN VALIDATION FAILED!');
          console.log(`❌ Error: ${debugResult.error}`);
          if (debugResult.details) {
            console.log(`❌ Error Details:`, debugResult.details);
          }
        }
        
        expect(debugResponse.status()).toBe(200);
        
      } catch (error) {
        console.log(`❌ Error calling debug endpoint:`, error);
        throw error;
      }
    }

    // Step 7: Also test a protected API endpoint to compare
    console.log('🔐 Testing protected API endpoint for comparison...');
    
    try {
      const apiResponse = await page.request.get('https://airwave-complete.netlify.app/api/clients');
      console.log(`🔐 Protected API (/api/clients) status: ${apiResponse.status()}`);
      
      if (apiResponse.status() === 200) {
        const apiResult = await apiResponse.json();
        console.log(`🔐 Protected API success:`, apiResult);
      } else {
        const apiError = await apiResponse.text();
        console.log(`🔐 Protected API error: ${apiError}`);
      }
      
    } catch (error) {
      console.log(`❌ Error calling protected API:`, error);
    }

    console.log('🏁 Authentication token debug test completed');
  });
});