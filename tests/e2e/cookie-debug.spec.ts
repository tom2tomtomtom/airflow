import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Cookie Debug', () => {
  test('should examine cookie details', async ({ page }) => {
    console.log('🍪 Starting detailed cookie analysis...');

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await page.waitForTimeout(3000);

    // Get all cookies with full details
    const allCookies = await page.context().cookies();
    
    console.log('🔍 All cookies after login:');
    allCookies.forEach(cookie => {
      console.log(`Name: ${cookie.name}`);
      console.log(`Value: ${cookie.value.substring(0, 50)}...`);
      console.log(`Domain: ${cookie.domain}`);
      console.log(`Path: ${cookie.path}`);
      console.log(`HttpOnly: ${cookie.httpOnly}`);
      console.log(`Secure: ${cookie.secure}`);
      console.log(`SameSite: ${cookie.sameSite}`);
      console.log('---');
    });

    // Check what document.cookie shows
    const documentCookies = await page.evaluate(() => document.cookie);
    console.log('📄 document.cookie:', documentCookies);

    // Test direct API call with current cookies
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/clients', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        return {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🌐 Direct API call result:', apiResponse);

    // Test with manual cookie setting
    const manualCookieTest = await page.evaluate(async () => {
      // Get the Supabase auth token
      const cookies = document.cookie.split(';');
      const authToken = cookies.find(c => c.trim().startsWith('sb-fdsjlutmfaatslznjxiv-auth-token='));
      
      if (authToken) {
        const tokenValue = authToken.split('=')[1];
        console.log('Found auth token:', tokenValue.substring(0, 20) + '...');
        
        // Try API call with explicit Authorization header
        try {
          const response = await fetch('/api/clients', {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${tokenValue}`
            }
          });
          return {
            withAuth: {
              status: response.status,
              statusText: response.statusText
            }
          };
        } catch (error) {
          return { error: error.message };
        }
      }
      
      return { error: 'No auth token found' };
    });
    
    console.log('🔑 Manual auth header test:', manualCookieTest);

    // Try navigating to clients and capture the redirect
    console.log('🔄 Testing /clients navigation...');
    
    const response = await page.goto('/clients');
    console.log(`📍 /clients response: ${response?.status()} ${response?.statusText()}`);
    console.log(`📍 Final URL: ${page.url()}`);
    
    if (response?.status() === 200) {
      console.log('✅ Success: /clients loaded correctly');
    } else {
      console.log('❌ Failed: /clients did not load');
    }
  });
});