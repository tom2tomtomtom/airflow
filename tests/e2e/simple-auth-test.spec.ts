import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@airwave.app';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestUser123!';

test.describe('Simple Authentication Test', () => {
  test('should login and check API access', async ({ page }) => {
    console.log('Starting simple auth test...');

    // Navigate to login page
    await page.goto('/login');
    console.log('✅ Navigated to login page');

    // Fill login form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    console.log('✅ Submitted login form');

    // Wait for redirect
    await page.waitForURL('/dashboard', { timeout: 10000 });
    console.log('✅ Redirected to dashboard');

    // Check for authentication tokens in storage/cookies
    const localStorage = await page.evaluate(() => {
      return {
        airwaveUser: localStorage.getItem('airwave_user'),
        token: localStorage.getItem('token')
      };
    });
    
    const cookies = await page.context().cookies();
    const airwaveTokenCookie = cookies.find(c => c.name === 'airwave_token');
    
    console.log('Local Storage:', localStorage);
    console.log('Airwave Token Cookie:', airwaveTokenCookie ? 'Present' : 'Missing');

    // Try to access the clients API endpoint directly
    await page.goto('/api/clients');
    const responseText = await page.textContent('pre') || await page.textContent('body');
    console.log('API Response:', responseText);

    // Navigate to clients page through UI
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    // Check for 401 errors in network requests
    const response = await page.waitForResponse(response => 
      response.url().includes('/api/clients') && 
      response.request().method() === 'GET'
    );
    
    console.log('Clients API Status:', response.status());
    
    if (response.status() === 401) {
      const responseBody = await response.text();
      console.log('401 Response Body:', responseBody);
    }

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-results/auth-debug.png', fullPage: true });
    console.log('✅ Screenshot saved for debugging');
  });
});