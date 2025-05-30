import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave2.netlify.app';
const TEST_CREDENTIALS = {
  email: 'test@airwave.app',
  password: 'TestUser123!'
};

test.describe('Authentication Debug Tests', () => {
  test('Debug Login Form and Flow', async ({ page }) => {
    console.log('🔍 Debugging login form and authentication flow...');
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'test-results/debug-login-page.png', fullPage: true });
    console.log('📸 Login page screenshot saved');
    
    // Check what login elements are available
    const loginElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        id: input.id,
        className: input.className
      }));
      
      const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
        text: button.textContent?.trim(),
        type: button.type,
        className: button.className,
        disabled: button.disabled
      }));
      
      const forms = Array.from(document.querySelectorAll('form')).map(form => ({
        action: form.action,
        method: form.method,
        className: form.className
      }));
      
      return { inputs, buttons, forms, url: window.location.href };
    });
    
    console.log('🔍 Login page analysis:');
    console.log('Current URL:', loginElements.url);
    console.log('Input fields:', JSON.stringify(loginElements.inputs, null, 2));
    console.log('Buttons:', JSON.stringify(loginElements.buttons, null, 2));
    console.log('Forms:', JSON.stringify(loginElements.forms, null, 2));
    
    // Check for demo login button first
    const demoButton = page.locator('[data-testid="demo-login-button"], button:has-text("Demo"), button:has-text("Guest")');
    const hasDemoButton = await demoButton.first().isVisible();
    console.log(`Demo login button: ${hasDemoButton ? '✅ Available' : '❌ Not found'}`);
    
    if (hasDemoButton) {
      console.log('🎯 Testing demo login flow...');
      await demoButton.first().click();
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`After demo login click: ${currentUrl}`);
      
      if (currentUrl.includes('dashboard')) {
        console.log('✅ Demo login worked - redirected to dashboard');
        return;
      }
    }
    
    // Try real authentication
    console.log('🔐 Testing real authentication...');
    
    // Look for email input with various selectors
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="Email" i]',
      '#email',
      '.email-input'
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      const element = page.locator(selector);
      if (await element.first().isVisible()) {
        emailInput = element.first();
        console.log(`✅ Found email input with selector: ${selector}`);
        break;
      }
    }
    
    // Look for password input
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      'input[placeholder*="Password" i]',
      '#password',
      '.password-input'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      const element = page.locator(selector);
      if (await element.first().isVisible()) {
        passwordInput = element.first();
        console.log(`✅ Found password input with selector: ${selector}`);
        break;
      }
    }
    
    if (emailInput && passwordInput) {
      console.log('📝 Filling login form...');
      await emailInput.fill(TEST_CREDENTIALS.email);
      await passwordInput.fill(TEST_CREDENTIALS.password);
      
      // Take screenshot before submit
      await page.screenshot({ path: 'test-results/debug-before-submit.png', fullPage: true });
      
      // Look for submit button
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Sign In")',
        'button:has-text("Login")',
        'button:has-text("Log In")',
        'input[type="submit"]'
      ];
      
      let submitButton = null;
      for (const selector of submitSelectors) {
        const element = page.locator(selector);
        if (await element.first().isVisible()) {
          submitButton = element.first();
          console.log(`✅ Found submit button with selector: ${selector}`);
          break;
        }
      }
      
      if (submitButton) {
        console.log('🚀 Submitting login form...');
        await submitButton.click();
        
        // Wait and see what happens
        await page.waitForTimeout(5000);
        
        const afterSubmitUrl = page.url();
        console.log(`After submit: ${afterSubmitUrl}`);
        
        // Take screenshot after submit
        await page.screenshot({ path: 'test-results/debug-after-submit.png', fullPage: true });
        
        // Check for error messages
        const errorSelectors = [
          '.error',
          '.alert',
          '[role="alert"]',
          '.notification',
          'text="Error"',
          'text="Invalid"',
          'text="Failed"'
        ];
        
        for (const selector of errorSelectors) {
          const errorElement = page.locator(selector);
          if (await errorElement.first().isVisible()) {
            const errorText = await errorElement.first().textContent();
            console.log(`❌ Error found: ${errorText}`);
          }
        }
        
        // Check if redirected
        if (afterSubmitUrl.includes('dashboard')) {
          console.log('✅ Login successful - redirected to dashboard');
        } else {
          console.log('⚠️ Login did not redirect to dashboard');
          
          // Check current page content
          const pageContent = await page.textContent('body');
          console.log('Page content preview:', pageContent?.substring(0, 500));
        }
      } else {
        console.log('❌ No submit button found');
      }
    } else {
      console.log('❌ Could not find email/password inputs');
      console.log(`Email input found: ${emailInput ? 'Yes' : 'No'}`);
      console.log(`Password input found: ${passwordInput ? 'Yes' : 'No'}`);
    }
  });
});