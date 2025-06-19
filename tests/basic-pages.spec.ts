import { test, expect } from '@playwright/test';

test.describe('AIRWAVE Basic Pages Tests', () => {
  test('Login page should be accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/.*Login.*|.*AIRWAVE.*/);
    
    // Check that login form elements are present
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
  });

  test('Dashboard should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*login.*/);
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
  });

  test('All main pages should exist and redirect to login when not authenticated', async ({ page }) => {
    const pages = [
      '/clients',
      '/strategic-content', 
      '/generate-enhanced',
      '/execute',
      '/approvals',
      '/analytics',
      '/social-publishing',
      '/sign-off'
    ];

    for (const pagePath of pages) {
      console.log(`Testing page: ${pagePath}`);
      await page.goto(pagePath);
      
      // All pages should redirect to login (not 404)
      await expect(page).toHaveURL(/.*login.*/);
      console.log(`✅ Page ${pagePath} exists and redirects to login`);
    }
  });

  test('Root page should redirect appropriately', async ({ page }) => {
    await page.goto('/');
    
    // Should either show a landing page or redirect to login/dashboard
    const currentURL = page.url();
    expect(currentURL).toMatch(/\/(login|dashboard|$)/);
  });
});
