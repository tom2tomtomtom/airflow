import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijre2010';

test.describe('Simple Authentication Test', () => {
  
  test('Login and verify access to dashboard', async ({ page }) => {
    console.log('🔐 Testing simple login flow...');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/simple-01-login-page.png', fullPage: true });
    
    // Verify login form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // Take screenshot before login
    await page.screenshot({ path: 'test-results/simple-02-login-filled.png', fullPage: true });
    
    // Submit login form
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-results/simple-03-dashboard.png', fullPage: true });
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
    
    console.log('✅ Simple login flow completed successfully');
    console.log('Current URL:', page.url());
  });
});