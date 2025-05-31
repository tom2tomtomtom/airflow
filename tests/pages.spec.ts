import { test, expect } from '@playwright/test';

test.describe('Core Pages', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if page loads without critical errors
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    
    await page.screenshot({ path: 'tests/screenshots/homepage.png' });
  });

  test('should check dashboard accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check if we can access dashboard or are redirected to auth
    const currentUrl = page.url();
    
    await page.screenshot({ path: 'tests/screenshots/dashboard.png' });
    
    console.log('Dashboard URL:', currentUrl);
  });

  test('should check clients page', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/clients.png' });
  });

  test('should check templates page', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/templates.png' });
  });

  test('should check campaigns page', async ({ page }) => {
    await page.goto('/campaigns');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/campaigns.png' });
  });

  test('should check assets page', async ({ page }) => {
    await page.goto('/assets');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/assets.png' });
  });

  test('should check matrix page', async ({ page }) => {
    await page.goto('/matrix');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/matrix.png' });
  });

  test('should check execute page', async ({ page }) => {
    await page.goto('/execute');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/execute.png' });
  });

  test('should check approvals page', async ({ page }) => {
    await page.goto('/approvals');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/approvals.png' });
  });

  test('should check analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ path: 'tests/screenshots/analytics.png' });
  });

  test('should check API health endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBeLessThan(500);
    
    const healthData = await response.json();
    console.log('Health check:', healthData);
  });
});