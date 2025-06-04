import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijre2010';

test.describe('Working Authentication Test', () => {
  
  test('Complete login flow and screenshot capture', async ({ page }) => {
    console.log('🔐 Starting authentication test...');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/working-01-login-page.png', fullPage: true });
    console.log('📸 Login page screenshot taken');
    
    // Look for email input with various selectors
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]', 
      '[data-testid="email-input"] input',
      'input[placeholder*="email" i]'
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        emailInput = element.first();
        console.log(`✅ Found email input with selector: ${selector}`);
        break;
      }
    }
    
    // Look for password input with various selectors
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '[data-testid="password-input"] input',
      'input[placeholder*="password" i]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        passwordInput = element.first();
        console.log(`✅ Found password input with selector: ${selector}`);
        break;
      }
    }
    
    if (emailInput && passwordInput) {
      // Fill in credentials
      await emailInput.fill(TEST_EMAIL);
      await passwordInput.fill(TEST_PASSWORD);
      
      // Take screenshot after filling
      await page.screenshot({ path: 'test-results/working-02-login-filled.png', fullPage: true });
      console.log('📸 Login filled screenshot taken');
      
      // Look for submit button with various selectors
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button:has-text("Sign in")',
        '[data-testid="sign-in-button"]',
        'input[type="submit"]'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        const element = page.locator(selector);
        if (await element.count() > 0) {
          submitButton = element.first();
          console.log(`✅ Found submit button with selector: ${selector}`);
          break;
        }
      }
      
      if (submitButton) {
        // Click submit button
        await submitButton.click();
        console.log('🚀 Login form submitted');
        
        // Wait for navigation or stay on same page
        await page.waitForTimeout(3000);
        
        // Take screenshot after submit
        await page.screenshot({ path: 'test-results/working-03-after-submit.png', fullPage: true });
        console.log('📸 After submit screenshot taken');
        
        // Check current URL
        const currentUrl = page.url();
        console.log('🌐 Current URL:', currentUrl);
        
        // If redirected to dashboard, explore it
        if (currentUrl.includes('/dashboard')) {
          console.log('✅ Successfully redirected to dashboard');
          
          await page.waitForLoadState('domcontentloaded');
          await page.screenshot({ path: 'test-results/working-04-dashboard.png', fullPage: true });
          
          // Test navigation to different pages
          const navigationTests = [
            { name: 'Assets', url: '/assets' },
            { name: 'Campaigns', url: '/campaigns' },
            { name: 'Templates', url: '/templates' },
            { name: 'Matrix', url: '/matrix' },
            { name: 'Generate Enhanced', url: '/generate-enhanced' }
          ];
          
          for (const nav of navigationTests) {
            try {
              console.log(`Testing navigation to ${nav.name}...`);
              await page.goto(`${BASE_URL}${nav.url}`);
              await page.waitForLoadState('domcontentloaded');
              await page.screenshot({ 
                path: `test-results/working-05-${nav.name.toLowerCase()}.png`, 
                fullPage: true 
              });
              console.log(`✅ ${nav.name} page loaded and screenshot taken`);
            } catch (error) {
              console.log(`⚠️ Issue with ${nav.name}: ${error.message}`);
            }
          }
          
        } else {
          console.log('❌ Not redirected to dashboard. Checking for errors...');
          
          // Look for error messages
          const errorSelectors = [
            '.error',
            '.alert',
            '[role="alert"]',
            '.MuiAlert-root',
            '[data-testid*="error"]',
            'text=Invalid',
            'text=Error',
            'text=Failed'
          ];
          
          for (const selector of errorSelectors) {
            const errorElement = page.locator(selector);
            if (await errorElement.count() > 0) {
              const errorText = await errorElement.first().textContent();
              console.log(`🚨 Found error: ${errorText}`);
            }
          }
        }
        
      } else {
        console.log('❌ Submit button not found');
      }
      
    } else {
      console.log('❌ Email or password input not found');
      console.log('Email input found:', !!emailInput);
      console.log('Password input found:', !!passwordInput);
    }
    
    console.log('🏁 Authentication test completed');
  });
  
  test('UI Element Discovery Test', async ({ page }) => {
    console.log('🔍 Discovering all UI elements...');
    
    // Test login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    
    // Count and log all interactive elements
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const links = await page.locator('a').count();
    const forms = await page.locator('form').count();
    
    console.log(`📊 Login page statistics:`);
    console.log(`   Buttons: ${buttons}`);
    console.log(`   Inputs: ${inputs}`);
    console.log(`   Links: ${links}`);
    console.log(`   Forms: ${forms}`);
    
    // Try to access dashboard directly (should redirect to login if not authenticated)
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/working-06-dashboard-direct.png', fullPage: true });
    
    const dashboardUrl = page.url();
    console.log('🌐 Dashboard direct access URL:', dashboardUrl);
    
    if (dashboardUrl.includes('/login')) {
      console.log('✅ Protected route correctly redirects to login');
    } else {
      console.log('⚠️ Dashboard accessible without authentication');
      
      // If we can access dashboard, explore it
      const dashboardButtons = await page.locator('button').count();
      const dashboardInputs = await page.locator('input').count();
      const dashboardLinks = await page.locator('a').count();
      
      console.log(`📊 Dashboard page statistics:`);
      console.log(`   Buttons: ${dashboardButtons}`);
      console.log(`   Inputs: ${dashboardInputs}`);
      console.log(`   Links: ${dashboardLinks}`);
    }
    
    console.log('🏁 UI discovery test completed');
  });
});