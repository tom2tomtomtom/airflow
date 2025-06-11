import { test, expect } from '@playwright/test';

test.describe('Framework Validation', () => {
  test('basic framework test', async ({ page }) => {
    // Use a reliable external URL to test framework
    await page.goto('https://example.com');
    
    // Basic assertions to verify framework works
    await expect(page).toHaveTitle(/Example/);
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    
    console.log('✅ Playwright framework is working correctly');
  });
  
  test('browser capabilities test', async ({ page, browserName }) => {
    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(userAgent).toBeTruthy();
    
    console.log(`✅ ${browserName} browser test completed`);
  });
});