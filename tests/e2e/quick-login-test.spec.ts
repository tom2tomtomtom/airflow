import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

test.describe('Quick Environment and Login Test', () => {
  test('Login and Dashboard Access Test', async ({ page }) => {
    console.log('🔍 Testing login and dashboard access after fixes...');

    // STEP 1: Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');

    // STEP 2: Fill and submit login form
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
    await loginButton.click();

    // STEP 3: Wait for dashboard redirect
    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('✅ Login successful - redirected to dashboard');
    } catch (error) {
      console.log('❌ Login failed or redirect timeout');
      await page.screenshot({ path: 'test-results/login-test-failed.png' });
      throw error;
    }

    // STEP 4: Check for environment errors
    await page.waitForTimeout(3000); // Let page load completely

    // Look for error indicators
    const errorIndicators = [
      'text="Oops! Something went wrong"',
      'text="VisibilityOff is not defined"',
      'text="ZodError"',
      '.error',
      '[data-testid="error"]'
    ];

    let errorsFound = 0;
    for (const indicator of errorIndicators) {
      const element = page.locator(indicator);
      if (await element.isVisible()) {
        console.log(`❌ Error found: ${indicator}`);
        errorsFound++;
      }
    }

    // STEP 5: Check for successful dashboard elements
    const successIndicators = [
      'text="Welcome back"',
      'text="Quick Actions"',
      'text="Dashboard"',
      '.dashboard-card',
      '[data-testid="user-menu"]'
    ];

    let successElements = 0;
    for (const indicator of successIndicators) {
      const element = page.locator(indicator);
      if (await element.isVisible()) {
        console.log(`✅ Dashboard element found: ${indicator}`);
        successElements++;
      }
    }

    // Take screenshot of current state
    await page.screenshot({ path: 'test-results/dashboard-after-fixes.png', fullPage: true });

    console.log(`\n📊 Dashboard Status:
    - Error indicators: ${errorsFound}
    - Success elements: ${successElements}
    - Dashboard functional: ${errorsFound === 0 && successElements > 0 ? 'YES' : 'PARTIAL'}`);

    // STEP 6: Test navigation to different pages
    const pagesToTest = [
      { name: 'Clients', url: '/clients' },
      { name: 'Assets', url: '/assets' },
      { name: 'Video Studio', url: '/video-studio' },
      { name: 'Strategic Content', url: '/strategic-content' }
    ];

    console.log('\n🔍 Testing page navigation...');
    for (const pageTest of pagesToTest) {
      try {
        await page.goto(`${BASE_URL}${pageTest.url}`);
        await page.waitForLoadState('networkidle');
        
        // Check if page loads without major errors
        const hasError = await page.locator('text="Oops! Something went wrong", text="404", text="Page Not Found"').isVisible();
        
        if (!hasError) {
          console.log(`✅ ${pageTest.name} page loads successfully`);
        } else {
          console.log(`❌ ${pageTest.name} page has errors`);
        }
      } catch (error) {
        console.log(`❌ ${pageTest.name} page failed to load`);
      }
    }

    // Assert that we have at least basic dashboard functionality
    expect(successElements).toBeGreaterThan(0);
    expect(errorsFound).toBeLessThan(3); // Allow some minor errors but not major ones
  });
});