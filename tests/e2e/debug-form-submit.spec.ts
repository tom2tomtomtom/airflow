import { test, expect } from '@playwright/test';

test('Debug form submission', async ({ page }) => {
  // Listen for network requests
  page.on('request', request => {
    if (request.method() === 'POST') {
      console.log(`➡️  POST ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.request().method() === 'POST') {
      console.log(`⬅️  ${response.status()} ${response.url()}`);
    }
  });

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Console error:', msg.text());
    }
  });

  // Navigate to login
  await page.goto('http://localhost:3003/login');
  await page.waitForLoadState('networkidle');
  
  // Fill form
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  
  // Check if form exists
  const form = await page.locator('form[data-testid="login-form"]');
  const formExists = await form.count() > 0;
  console.log('Form exists:', formExists);
  
  // Check button state
  const button = page.locator('[data-testid="sign-in-button"]');
  const isDisabled = await button.isDisabled();
  console.log('Button disabled:', isDisabled);
  
  // Try submitting form directly
  console.log('\n🔐 Submitting form...');
  
  // Method 1: Click button
  await button.click();
  console.log('✅ Clicked button');
  
  // Wait for any network activity
  await page.waitForTimeout(3000);
  
  // Check if we're still on login page
  const currentUrl = page.url();
  console.log('\n📍 Current URL:', currentUrl);
  
  if (currentUrl.includes('/login')) {
    console.log('❌ Still on login page');
    
    // Try Method 2: Submit form directly
    console.log('\n🔄 Trying form.submit()...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.submit();
      }
    });
    
    await page.waitForTimeout(3000);
    console.log('📍 URL after form.submit():', page.url());
  }
});