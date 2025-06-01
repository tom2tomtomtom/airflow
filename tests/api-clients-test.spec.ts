import { test, expect } from '@playwright/test';

test.describe('API Clients Test', () => {
  test('Test /api/clients endpoint after authentication', async ({ page }) => {
    console.log('Testing /api/clients endpoint after successful authentication...');
    
    // First, login successfully
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', 'tomh@redbaez.com');
    await page.fill('input[type="password"]', 'Wijlre2010');
    
    // Listen for the login response
    const loginResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    
    await page.click('button[type="submit"]');
    
    const loginResponse = await loginResponsePromise;
    console.log('Login response status:', loginResponse.status());
    console.log('Login response headers:', await loginResponse.allHeaders());
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('Successfully redirected to dashboard');
    
    // Now test the /api/clients endpoint with the authenticated session
    console.log('Making authenticated request to /api/clients...');
    
    // Get all cookies to see what we have
    const cookies = await page.context().cookies('https://airwave-complete.netlify.app');
    console.log('Session cookies:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));
    
    // Make the API request with the authenticated context
    const clientsResponse = await page.request.get('https://airwave-complete.netlify.app/api/clients');
    
    console.log('Clients API response status:', clientsResponse.status());
    console.log('Clients API response headers:', await clientsResponse.headers());
    
    if (clientsResponse.status() === 200) {
      console.log('SUCCESS: /api/clients returned 200!');
      const responseBody = await clientsResponse.json();
      console.log('Response body:', JSON.stringify(responseBody, null, 2));
    } else if (clientsResponse.status() === 404) {
      console.log('STILL 404: Profile issue not resolved yet');
      const responseBody = await clientsResponse.text();
      console.log('Error response:', responseBody);
    } else if (clientsResponse.status() === 401) {
      console.log('UNAUTHORIZED: Authentication issue');
      const responseBody = await clientsResponse.text();
      console.log('Auth error:', responseBody);
    } else {
      console.log('UNEXPECTED STATUS:', clientsResponse.status());
      const responseBody = await clientsResponse.text();
      console.log('Response body:', responseBody);
    }
    
    // Also test the request within the browser context (using fetch)
    console.log('Testing /api/clients using browser fetch...');
    const browserResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/clients');
        return {
          status: response.status,
          statusText: response.statusText,
          body: await response.text()
        };
      } catch (error) {
        return {
          error: error.message
        };
      }
    });
    
    console.log('Browser fetch result:', browserResponse);
    
    // Verify if the issue is resolved
    expect(clientsResponse.status()).toBe(200);
  });
});