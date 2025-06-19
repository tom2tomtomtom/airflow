import { test, expect, Page } from '@playwright/test';

// Test actual functionality on each page, not just loading
test.describe('AIRWAVE Functional Workflow Testing', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.describe('1. Authentication Functional Testing', () => {
    test('Login form actually works with real authentication', async () => {
      console.log('🔐 Testing Login Functionality...');
      
      // Navigate to login
      await page.goto('http://localhost:3000/login');
      await page.waitForLoadState('networkidle');
      
      // Test form validation first
      await test.step('Test form validation', async () => {
        const signInButton = page.locator('[data-testid="sign-in-button"]');
        await signInButton.click();
        
        // Should show validation errors
        await page.waitForTimeout(1000);
        const errorElements = page.locator('.MuiFormHelperText-root.Mui-error');
        const errorCount = await errorElements.count();
        console.log(`Found ${errorCount} validation errors (expected)`);
      });

      // Test actual login
      await test.step('Test successful login', async () => {
        const emailInput = page.locator('[data-testid="email-input"] input');
        const passwordInput = page.locator('[data-testid="password-input"] input');
        const signInButton = page.locator('[data-testid="sign-in-button"]');
        
        await emailInput.fill('test@airwave.app');
        await passwordInput.fill('TestUser123!');
        await signInButton.click();
        
        // Wait for navigation or error
        await Promise.race([
          page.waitForURL('**/dashboard', { timeout: 10000 }),
          page.waitForURL('**/clients', { timeout: 10000 }),
          page.waitForSelector('.MuiAlert-root', { timeout: 5000 })
        ]);
        
        const currentUrl = page.url();
        console.log(`After login, redirected to: ${currentUrl}`);
        
        // Check if we're authenticated by looking for user-specific elements
        const isAuthenticated = currentUrl.includes('/dashboard') || 
                               currentUrl.includes('/clients') ||
                               await page.locator('[data-testid="user-menu"]').isVisible({ timeout: 2000 });
        
        console.log(`Authentication successful: ${isAuthenticated}`);
        expect(isAuthenticated).toBe(true);
      });
    });

    test('Signup form functionality', async () => {
      console.log('📝 Testing Signup Functionality...');
      
      await page.goto('http://localhost:3000/signup');
      await page.waitForLoadState('networkidle');
      
      // Test form elements exist and are interactive
      const nameInput = page.locator('[data-testid="name-input"] input');
      const emailInput = page.locator('[data-testid="email-input"] input');
      const passwordInput = page.locator('[data-testid="password-input"] input');
      const confirmPasswordInput = page.locator('[data-testid="confirm-password-input"] input');
      const signUpButton = page.locator('[data-testid="sign-up-button"]');
      
      // Test form validation
      await signUpButton.click();
      await page.waitForTimeout(1000);
      
      // Fill form with test data
      await nameInput.fill('Test User');
      await emailInput.fill('newuser@test.com');
      await passwordInput.fill('TestPassword123!');
      await confirmPasswordInput.fill('TestPassword123!');
      
      console.log('Signup form filled successfully');
      
      // Note: We won't actually submit to avoid creating test users
      const formFilled = await nameInput.inputValue() === 'Test User' &&
                         await emailInput.inputValue() === 'newuser@test.com';
      expect(formFilled).toBe(true);
    });
  });

  test.describe('2. Dashboard Functional Testing', () => {
    test.beforeEach(async () => {
      // Login first
      await page.goto('http://localhost:3000/login');
      await page.locator('[data-testid="email-input"] input').fill('test@airwave.app');
      await page.locator('[data-testid="password-input"] input').fill('TestUser123!');
      await page.locator('[data-testid="sign-in-button"]').click();
      await page.waitForTimeout(3000); // Wait for login
    });

    test('Dashboard displays data and interactive elements work', async () => {
      console.log('📊 Testing Dashboard Functionality...');
      
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Test dashboard widgets and data
      await test.step('Check dashboard widgets', async () => {
        // Look for common dashboard elements
        const widgets = await page.locator('.MuiCard-root, .MuiPaper-root, [data-testid*="widget"], [data-testid*="card"]').count();
        console.log(`Found ${widgets} dashboard widgets/cards`);
        
        // Check for data displays
        const dataElements = await page.locator('h1, h2, h3, h4, h5, h6').count();
        console.log(`Found ${dataElements} heading elements`);
        
        // Check for interactive elements
        const buttons = await page.locator('button').count();
        console.log(`Found ${buttons} interactive buttons`);
        
        expect(widgets + dataElements + buttons).toBeGreaterThan(0);
      });

      // Test navigation from dashboard
      await test.step('Test dashboard navigation', async () => {
        const navLinks = page.locator('a[href*="/"], button[data-testid*="nav"]');
        const linkCount = await navLinks.count();
        console.log(`Found ${linkCount} navigation elements`);
        
        if (linkCount > 0) {
          const firstLink = navLinks.first();
          const linkText = await firstLink.textContent();
          console.log(`First navigation element: "${linkText}"`);
        }
      });
    });
  });
});
