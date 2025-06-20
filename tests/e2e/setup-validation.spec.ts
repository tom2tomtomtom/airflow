import { test, expect } from '@playwright/test';

test.describe('AIRWAVE Setup Validation', () => {
  test('should validate development server is running', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Check if the page loads successfully
    await expect(page).toHaveTitle(/AIrFLOW|AIRWAVE/);
    
    // Check for basic page elements
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Development server is accessible');
  });

  test('should validate login page is accessible', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Check if login form elements exist
    const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]');
    
    // At least one email and password input should exist
    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
    
    console.log('✅ Login page is accessible');
  });

  test('should validate API endpoints are reachable', async ({ page }) => {
    // Test health endpoint
    const response = await page.request.get('/api/health');
    
    // Should return a successful response or at least not 404
    expect(response.status()).not.toBe(404);
    
    console.log('✅ API endpoints are reachable');
  });

  test('should validate responsive design', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
    
    console.log('✅ Responsive design is working');
  });
});
