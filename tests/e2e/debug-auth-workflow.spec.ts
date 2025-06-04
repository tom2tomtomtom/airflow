import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Debug Authentication Workflow', () => {
  test('should debug full authentication flow', async ({ page }) => {
    console.log('🔍 Starting authentication debug...');

    // Navigate to home page first
    await page.goto('/');
    console.log('✅ Navigated to home page');

    // Check if redirected to login
    const currentUrl = page.url();
    console.log('📍 Current URL after home:', currentUrl);

    // Go to login page
    await page.goto('/login');
    console.log('✅ Navigated to login page');

    // Fill and submit login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // Take screenshot before login
    await page.screenshot({ path: 'test-results/before-login.png' });
    
    await page.click('button[type="submit"]');
    console.log('✅ Submitted login form');

    // Wait for navigation
    await page.waitForTimeout(3000);
    const afterLoginUrl = page.url();
    console.log('📍 URL after login:', afterLoginUrl);

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      return {
        airwaveUser: localStorage.getItem('airwave_user'),
      };
    });
    console.log('💾 LocalStorage:', localStorage.airwaveUser ? 'User data present' : 'No user data');

    // Check cookies
    const cookies = await page.context().cookies();
    const relevantCookies = cookies.filter(c => 
      c.name.includes('supabase') || 
      c.name.includes('airwave') ||
      c.name.includes('auth')
    );
    console.log('🍪 Relevant cookies:', relevantCookies.map(c => `${c.name}=${c.value ? 'present' : 'empty'}`));

    // Take screenshot after login
    await page.screenshot({ path: 'test-results/after-login.png' });

    // Try to navigate to clients page and capture the network request
    let networkError = null;
    page.on('response', async (response) => {
      if (response.url().includes('/clients')) {
        console.log(`🌐 Response to /clients: ${response.status()} ${response.statusText()}`);
        if (response.status() >= 400) {
          try {
            const body = await response.text();
            console.log('📄 Response body:', body);
          } catch (e) {
            console.log('❌ Could not read response body');
          }
        }
      }
    });

    page.on('requestfailed', (request) => {
      if (request.url().includes('/clients')) {
        networkError = request.failure()?.errorText;
        console.log('❌ Request failed to /clients:', networkError);
      }
    });

    console.log('🔄 Attempting to navigate to /clients...');
    
    try {
      await page.goto('/clients', { waitUntil: 'domcontentloaded', timeout: 10000 });
      console.log('✅ Successfully navigated to /clients');
      
      // Take screenshot of clients page
      await page.screenshot({ path: 'test-results/clients-page.png' });
      
      // Check for any visible error messages
      const errorElements = await page.locator('text="401", text="Unauthorized", text="Error"').all();
      if (errorElements.length > 0) {
        console.log('⚠️ Found error elements on page');
      }

    } catch (error) {
      console.log('❌ Failed to navigate to /clients:', error.message);
      console.log('❌ Network error was:', networkError);
      
      // Take screenshot of the error state
      await page.screenshot({ path: 'test-results/clients-error.png' });
    }

    console.log('🔍 Debug complete');
  });
});