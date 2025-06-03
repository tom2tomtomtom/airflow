import { test, expect } from '@playwright/test';

test('Debug authentication API', async ({ page }) => {
  // Monitor API calls
  const apiCalls: any[] = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/') || request.url().includes('supabase')) {
      console.log(`➡️  ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth/login') || response.url().includes('auth/v1/token')) {
      const status = response.status();
      console.log(`⬅️  ${status} ${response.url()}`);
      
      try {
        const body = await response.json();
        console.log('Response body:', JSON.stringify(body, null, 2));
      } catch (e) {
        console.log('Response text:', await response.text());
      }
      
      apiCalls.push({
        url: response.url(),
        status,
        method: response.request().method(),
      });
    }
  });

  // Navigate to login
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  
  // Fill form
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  
  console.log('\n🔐 Submitting login form...\n');
  
  // Click submit and wait
  await page.click('[data-testid="sign-in-button"]');
  
  // Wait for API response
  await page.waitForTimeout(5000);
  
  console.log('\n📊 API Call Summary:');
  apiCalls.forEach(call => {
    console.log(`${call.method} ${call.url} - Status: ${call.status}`);
  });
  
  // Check current location
  console.log('\n📍 Current URL:', page.url());
  
  // Check for any error alerts
  const alerts = await page.locator('.MuiAlert-root').all();
  for (const alert of alerts) {
    const text = await alert.textContent();
    console.log('🚨 Alert found:', text);
  }
});