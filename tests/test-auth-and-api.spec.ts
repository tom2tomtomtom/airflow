import { test, expect } from '@playwright/test';

test.describe('Authentication and API Tests', () => {
  test('Login and verify /api/clients endpoint', async ({ page }) => {
    console.log('Starting authentication test...');
    
    // Navigate to login page
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    console.log('Navigated to login page');
    
    // Fill in credentials
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'testpassword');
    
    console.log('Filled in credentials');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard or handle any loading
    await page.waitForLoadState('networkidle');
    
    console.log('Submitted login form, checking for successful login...');
    
    // Check if we're redirected to dashboard (successful login)
    const currentUrl = page.url();
    console.log('Current URL after login:', currentUrl);
    
    // Verify we're not still on login page (which would indicate login failure)
    expect(currentUrl).not.toContain('/login');
    
    // Now test the /api/clients endpoint
    console.log('Testing /api/clients endpoint...');
    
    // Make API call to /api/clients
    const response = await page.request.get('https://airwave-complete.netlify.app/api/clients');
    
    console.log('API Response Status:', response.status());
    console.log('API Response Headers:', await response.allHeaders());
    
    // Check if we get 200 instead of 404
    if (response.status() === 200) {
      console.log('SUCCESS: /api/clients returned 200 - profile fix resolved the issue!');
      const responseBody = await response.text();
      console.log('Response body:', responseBody.substring(0, 500) + '...');
    } else if (response.status() === 404) {
      console.log('ISSUE: Still getting 404 - profile fix may not be complete');
    } else {
      console.log('UNEXPECTED: Got status', response.status());
      const responseBody = await response.text();
      console.log('Response body:', responseBody);
    }
    
    // Assert the expected status
    expect(response.status()).toBe(200);
    
    // Verify response is valid JSON (clients array)
    const responseJson = await response.json();
    expect(Array.isArray(responseJson)).toBe(true);
    
    console.log('Test completed successfully!');
  });
  
  test('Verify session persistence and authentication state', async ({ page }) => {
    console.log('Testing session persistence...');
    
    // Login first
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_PASSWORD || 'testpassword');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Navigate to dashboard
    await page.goto('https://airwave-complete.netlify.app/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if user is still authenticated (not redirected to login)
    const currentUrl = page.url();
    console.log('Dashboard URL:', currentUrl);
    expect(currentUrl).toContain('/dashboard');
    
    // Test another API endpoint to verify auth state
    const healthResponse = await page.request.get('https://airwave-complete.netlify.app/api/health');
    console.log('Health endpoint status:', healthResponse.status());
    expect(healthResponse.status()).toBe(200);
    
    console.log('Session persistence test completed!');
  });
});