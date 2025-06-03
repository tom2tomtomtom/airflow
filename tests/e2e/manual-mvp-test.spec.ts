import { test, expect } from '@playwright/test';

test('Manual MVP workflow with detailed logging', async ({ page }) => {
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('🔴 Browser console error:', msg.text());
    }
  });

  // Enable request/response logging
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`🔴 HTTP ${response.status()} - ${response.url()}`);
    }
  });

  console.log('🚀 Starting manual MVP test...');
  
  // Step 1: Navigate to app
  console.log('\n📝 Step 1: Navigating to app...');
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'step1-home.png' });
  console.log('Current URL:', page.url());
  
  // Check if we're redirected to login
  if (page.url().includes('/login')) {
    console.log('✅ Redirected to login page');
  } else {
    console.log('⚠️  Not on login page, URL is:', page.url());
  }
  
  // Step 2: Login
  console.log('\n📝 Step 2: Logging in...');
  await page.goto('/login', { waitUntil: 'networkidle' });
  
  // Wait for form to be ready
  await page.waitForSelector('[data-testid="email-input"] input', { state: 'visible' });
  
  // Fill credentials
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  
  await page.screenshot({ path: 'step2-login-filled.png' });
  
  // Click sign in
  await page.click('[data-testid="sign-in-button"]');
  console.log('✅ Clicked sign in button');
  
  // Wait for response
  await page.waitForTimeout(5000); // Give it time
  await page.screenshot({ path: 'step2-after-login.png' });
  console.log('Current URL after login:', page.url());
  
  // Check if we're on dashboard
  if (page.url().includes('/dashboard')) {
    console.log('✅ Successfully reached dashboard!');
    
    // Look for welcome message
    const welcomeText = await page.locator('text=Welcome').first().textContent().catch(() => null);
    if (welcomeText) {
      console.log('✅ Found welcome text:', welcomeText);
    }
  } else {
    console.log('❌ Not on dashboard, checking for errors...');
    
    // Check for error messages
    const errorElement = await page.locator('[data-testid="error-message"], .MuiAlert-root').first();
    if (await errorElement.isVisible()) {
      const errorText = await errorElement.textContent();
      console.log('❌ Error found:', errorText);
    }
  }
  
  // Step 3: Navigate to clients
  console.log('\n📝 Step 3: Navigating to clients...');
  await page.goto('/clients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'step3-clients.png' });
  console.log('Current URL:', page.url());
  
  // Check if we can see client page elements
  const clientsPageTitle = await page.locator('h4:has-text("Clients"), h1:has-text("Clients")').first();
  if (await clientsPageTitle.isVisible()) {
    console.log('✅ On clients page');
  }
  
  // Step 4: Navigate to AI generation
  console.log('\n📝 Step 4: Navigating to AI generation...');
  await page.goto('/generate-enhanced', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'step4-generate.png' });
  console.log('Current URL:', page.url());
  
  // Check for generation form
  const promptField = await page.locator('textarea[placeholder*="Describe"], textarea[placeholder*="prompt"]').first();
  if (await promptField.isVisible()) {
    console.log('✅ Found prompt field for AI generation');
  }
  
  // Final status
  console.log('\n📊 Test Summary:');
  console.log('Final URL:', page.url());
  console.log('Test completed. Check screenshots for visual confirmation.');
});