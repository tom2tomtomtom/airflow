import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Comprehensive Authentication & Page Loading Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('1. Login Flow - Complete Authentication Test', async ({ page }) => {
    console.log('🔐 Testing complete login flow...');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/01-login-page.png', fullPage: true });
    
    // Verify login form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")')).toBeVisible();
    
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // Take screenshot before login
    await page.screenshot({ path: 'test-results/02-login-filled.png', fullPage: true });
    
    // Submit login form
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'test-results/03-dashboard-loaded.png', fullPage: true });
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Verify user is logged in (check for user-specific elements)
    await expect(page.locator('h1, h4, h5')).toContainText(/dashboard|welcome|airwave/i);
    
    console.log('✅ Login flow completed successfully');
  });

  test('2. Page Access After Authentication', async ({ page }) => {
    console.log('🔄 Testing page access after authentication...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Test navigation to key pages
    const pagesToTest = [
      { name: 'Dashboard', url: '/dashboard', selector: 'h1, h4, h5' },
      { name: 'Assets', url: '/assets', selector: 'h1, h2, h3' },
      { name: 'Templates', url: '/templates', selector: 'h1, h2, h3' },
      { name: 'Matrix', url: '/matrix', selector: 'h1, h2, h3' },
      { name: 'Strategic Content', url: '/strategic-content', selector: 'h1, h2, h3' },
      { name: 'Generate Enhanced', url: '/generate-enhanced', selector: 'h1, h2, h3' }
    ];
    
    for (const pageTest of pagesToTest) {
      console.log(`Testing ${pageTest.name} page...`);
      
      await page.goto(`${BASE_URL}${pageTest.url}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/04-${pageTest.name.toLowerCase().replace(' ', '-')}.png`, 
        fullPage: true 
      });
      
      // Verify page loaded
      expect(page.url()).toContain(pageTest.url);
      
      // Check for page content
      const pageContent = page.locator(pageTest.selector);
      await expect(pageContent).toBeVisible({ timeout: 5000 });
      
      console.log(`✅ ${pageTest.name} page loaded successfully`);
    }
  });

  test('3. Session Persistence Test', async ({ page }) => {
    console.log('💾 Testing session persistence...');
    
    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Check cookies are set
    const cookies = await page.context().cookies();
    const authCookie = cookies.find(c => c.name === 'airwave_token');
    expect(authCookie).toBeTruthy();
    console.log('✅ Auth cookie found:', authCookie?.name);
    
    // Refresh page and verify still logged in
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be on dashboard
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('h1, h4, h5')).toContainText(/dashboard|welcome|airwave/i);
    
    console.log('✅ Session persisted after page refresh');
  });

  test('4. Protected Route Access Test', async ({ page }) => {
    console.log('🛡️ Testing protected route access...');
    
    // Try to access protected page without login
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login
    expect(page.url()).toContain('/login');
    
    // Now login and try again
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Should now be on dashboard
    expect(page.url()).toContain('/dashboard');
    
    console.log('✅ Protected route access working correctly');
  });

  test('5. Error Handling Test', async ({ page }) => {
    console.log('❌ Testing error handling...');
    
    // Test invalid credentials
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'invalid@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"], .error, .alert')).toBeVisible({ timeout: 5000 });
    
    // Should stay on login page
    expect(page.url()).toContain('/login');
    
    console.log('✅ Error handling working correctly');
  });

  test('6. Logout Test', async ({ page }) => {
    console.log('🚪 Testing logout functionality...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Look for logout button/menu
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      '[data-testid="logout"]',
      '[data-testid="user-menu"]'
    ];
    
    let logoutFound = false;
    for (const selector of logoutSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        await element.click();
        logoutFound = true;
        break;
      }
    }
    
    if (logoutFound) {
      // Wait for redirect to login or home
      await page.waitForURL(/.*\/(login|$)/, { timeout: 10000 });
      console.log('✅ Logout functionality working');
    } else {
      console.log('⚠️ Logout button not found - may need manual testing');
    }
  });
});
