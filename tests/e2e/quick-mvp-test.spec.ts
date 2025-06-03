import { test, expect } from '@playwright/test';

test('Quick MVP test - Login and navigate', async ({ page }) => {
  // Go directly to login
  await page.goto('http://localhost:3003/login');
  await page.waitForLoadState('networkidle');
  
  console.log('📍 On login page');
  
  // Fill login form
  await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
  await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
  
  // Click sign in
  await page.click('[data-testid="sign-in-button"]');
  console.log('✅ Clicked sign in');
  
  // Wait for navigation with longer timeout
  try {
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✅ Successfully navigated to dashboard!');
  } catch (e) {
    console.log('❌ Failed to navigate to dashboard');
    console.log('Current URL:', page.url());
    
    // Check for errors
    const errorMsg = await page.locator('[data-testid="error-message"]').textContent().catch(() => null);
    if (errorMsg) {
      console.log('Error message:', errorMsg);
    }
    
    throw e;
  }
  
  // Verify we're on dashboard
  await expect(page.locator('h4:has-text("Welcome back")')).toBeVisible({ timeout: 5000 });
  console.log('✅ Dashboard loaded successfully');
  
  // Test navigation to other pages
  console.log('\n🧭 Testing navigation...');
  
  // Navigate to clients
  await page.goto('http://localhost:3003/clients');
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated to clients page');
  
  // Navigate to AI generation
  await page.goto('http://localhost:3003/generate-enhanced');
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated to AI generation page');
  
  // Navigate to assets
  await page.goto('http://localhost:3003/assets');
  await page.waitForLoadState('networkidle');
  console.log('✅ Navigated to assets page');
  
  console.log('\n✅ All navigation tests passed!');
});