import { test, expect } from '@playwright/test';

test.describe('Simple Login Test', () => {
  test('Login page loads and password toggle works', async ({ page }) => {
    console.log('🔍 Testing login page...');
    
    // Go to login page
    await page.goto('http://localhost:3000/login');
    
    console.log('✅ Login page loaded');
    
    // Check if password input exists
    const passwordInput = page.locator('[data-testid="password-input"] input');
    await expect(passwordInput).toBeVisible();
    console.log('✅ Password input found');
    
    // Check initial password type
    await expect(passwordInput).toHaveAttribute('type', 'password');
    console.log('✅ Password initially hidden');
    
    // Look for the password toggle button
    const toggleButton = page.locator('[data-testid="password-visibility-toggle"]');
    await expect(toggleButton).toBeVisible();
    console.log('✅ Password toggle button found');
    
    // Test toggle functionality
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    console.log('✅ Password toggle shows password');
    
    // Toggle back
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    console.log('✅ Password toggle hides password');
    
    // Test form validation
    const submitButton = page.locator('[data-testid="sign-in-button"]');
    await submitButton.click();
    
    // Should show validation errors
    const emailError = page.locator('text=Email is required');
    const passwordError = page.locator('text=Password is required');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
    console.log('✅ Form validation works');
    
    // Test email format validation
    const emailInput = page.locator('[data-testid="email-input"] input');
    await emailInput.fill('invalid-email');
    await submitButton.click();
    
    const emailFormatError = page.locator('text=Please enter a valid email address');
    await expect(emailFormatError).toBeVisible();
    console.log('✅ Email format validation works');
    
    // Check for remember me checkbox
    const rememberCheckbox = page.locator('input[name="remember"]');
    await expect(rememberCheckbox).toBeVisible();
    console.log('✅ Remember me checkbox found');
    
    // Check for forgot password link
    const forgotLink = page.locator('text=Forgot your password?');
    await expect(forgotLink).toBeVisible();
    console.log('✅ Forgot password link found');
    
    console.log('🎉 All login page improvements working correctly!');
  });
});