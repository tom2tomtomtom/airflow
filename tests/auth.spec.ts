import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/');
    
    // Check if we're redirected to login or if login form is present
    await page.waitForLoadState('networkidle');
    
    // Look for common login elements
    const hasLoginForm = await page.locator('form').count() > 0;
    const hasEmailField = await page.locator('input[type="email"], input[name="email"]').count() > 0;
    const hasPasswordField = await page.locator('input[type="password"], input[name="password"]').count() > 0;
    const hasLoginButton = await page.getByText(/sign in|login|log in/i).count() > 0;
    
    // Check for auth-related content
    expect(hasLoginForm || hasEmailField || hasPasswordField || hasLoginButton).toBeTruthy();
    
    await page.screenshot({ path: 'tests/screenshots/login-page.png' });
  });

  test('should handle login form interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to find and interact with login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('testpassword123');
        
        // Look for submit button
        const submitButton = page.getByRole('button', { name: /sign in|login|log in/i }).first();
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Wait for response
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'tests/screenshots/login-attempt.png' });
        }
      }
    }
  });

  test('should check for signup functionality', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for signup links or buttons
    const signupLink = page.getByText(/sign up|register|create account/i).first();
    
    if (await signupLink.count() > 0) {
      await signupLink.click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/signup-page.png' });
    }
  });
});