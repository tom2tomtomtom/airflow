import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = 'test.user@example.com';
const TEST_PASSWORD = 'Test123!@#';

// Helper function to login
async function login(page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('[data-testid="email-input"]', TEST_EMAIL);
  await page.fill('[data-testid="password-input"]', TEST_PASSWORD);
  await page.click('[data-testid="sign-in-button"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

test.describe('UI Elements Testing', () => {
  test('Login page - password visibility toggle', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Check password input is initially hidden
    const passwordInput = page.locator('[data-testid="password-input"] input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Click the toggle button
    const toggleButton = page.locator('[aria-label="Toggle password visibility"]');
    await expect(toggleButton).toBeVisible();
    await toggleButton.click();
    
    // Check password is now visible
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Click again to hide
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Login page - form validation', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Try to submit empty form
    await page.click('[data-testid="sign-in-button"]');
    
    // Check for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Please enter both email and password');
  });

  test('Dashboard - navigation elements', async ({ page }) => {
    await login(page);
    
    // Check sidebar navigation
    await expect(page.locator('[data-testid="sidebar-nav"]')).toBeVisible();
    
    // Check user menu
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Click user menu
    await page.click('[data-testid="user-menu"]');
    await expect(page.locator('text=Logout')).toBeVisible();
  });

  test('Assets page - upload button', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/assets`);
    
    // Check for upload button
    const uploadButton = page.locator('[data-testid="upload-button"]');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toContainText('Upload Assets');
    
    // Click upload button
    await uploadButton.click();
    
    // Check upload modal appears
    await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
  });

  test('Generate page - tabs and forms', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/generate-enhanced`);
    
    // Check for generation tabs
    await expect(page.locator('[data-testid="generation-tabs"]')).toBeVisible();
    
    // Check for individual tabs
    const tabs = ['Copy', 'Image', 'Voice'];
    for (const tab of tabs) {
      await expect(page.locator(`text=${tab}`)).toBeVisible();
    }
    
    // Check generate button
    const generateButton = page.locator('[data-testid="generate-button"]');
    await expect(generateButton).toBeVisible();
  });

  test('Navigation links work correctly', async ({ page }) => {
    await login(page);
    
    // Test navigation to different pages
    const navLinks = [
      { text: 'Assets', url: '/assets' },
      { text: 'Campaigns', url: '/campaigns' },
      { text: 'Analytics', url: '/analytics' }
    ];
    
    for (const link of navLinks) {
      await page.click(`[data-testid="sidebar-nav"] >> text=${link.text}`);
      await expect(page).toHaveURL(new RegExp(link.url));
      await page.waitForLoadState('networkidle');
    }
  });

  test('Assets page - no redirect when authenticated', async ({ page }) => {
    await login(page);
    
    // Navigate to assets page
    await page.goto(`${BASE_URL}/assets`);
    
    // Should stay on assets page, not redirect to login
    await expect(page).toHaveURL(/\/assets/);
    
    // Content should be visible
    await expect(page.locator('text=Asset Library')).toBeVisible();
  });

  test('Generate page - no redirect when authenticated', async ({ page }) => {
    await login(page);
    
    // Navigate to generate page
    await page.goto(`${BASE_URL}/generate-enhanced`);
    
    // Should stay on generate page
    await expect(page).toHaveURL(/\/generate-enhanced/);
    
    // Content should be visible
    await expect(page.locator('text=Generate Content')).toBeVisible();
  });
});