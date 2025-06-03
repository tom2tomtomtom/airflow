import { test, expect } from '@playwright/test';

test('Debug login flow', async ({ page }) => {
  console.log('Starting debug test...');
  
  // Go to login page
  await page.goto('/login');
  console.log('✅ Navigated to login page');
  
  // Take screenshot
  await page.screenshot({ path: 'login-page-debug.png' });
  
  // Wait for page to be ready
  await page.waitForLoadState('networkidle');
  
  // Check if email input exists
  const emailInput = page.locator('[data-testid="email-input"] input');
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  console.log('✅ Email input found');
  
  // Fill email
  await emailInput.fill('tomh@rebaez.com');
  console.log('✅ Email filled');
  
  // Check if password input exists
  const passwordInput = page.locator('[data-testid="password-input"] input');
  await expect(passwordInput).toBeVisible();
  console.log('✅ Password input found');
  
  // Fill password
  await passwordInput.fill('Wijlre2010');
  console.log('✅ Password filled');
  
  // Take screenshot before clicking
  await page.screenshot({ path: 'login-form-filled-debug.png' });
  
  // Find and click login button
  const loginButton = page.locator('[data-testid="sign-in-button"]');
  await expect(loginButton).toBeVisible();
  console.log('✅ Login button found');
  
  // Click login button
  await loginButton.click();
  console.log('✅ Login button clicked');
  
  // Wait for navigation or error
  try {
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('✅ Successfully navigated to dashboard');
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'dashboard-debug.png' });
  } catch (error) {
    console.log('❌ Failed to navigate to dashboard');
    
    // Check for error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log('Error message:', errorText);
    }
    
    // Take error screenshot
    await page.screenshot({ path: 'login-error-debug.png' });
    
    throw error;
  }
});