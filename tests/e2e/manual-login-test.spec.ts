import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';

test.describe('Manual Login Test', () => {
  test('Try to actually log in step by step', async ({ page }) => {
    console.log('🔍 Manual login test - step by step debugging');
    
    // Step 1: Go to login page
    console.log('Step 1: Navigate to login page');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: login-page-initial.png');
    
    // Step 2: Examine the login form structure
    console.log('Step 2: Examining login form structure');
    
    // Find all input elements
    const allInputs = await page.locator('input').all();
    console.log(`Found ${allInputs.length} input elements:`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const testId = await input.getAttribute('data-testid');
      console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", testid="${testId}"`);
    }
    
    // Find all buttons
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} button elements:`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const testId = await button.getAttribute('data-testid');
      console.log(`  Button ${i}: text="${text}", type="${type}", testid="${testId}"`);
    }
    
    // Step 3: Try to identify the correct form elements
    console.log('Step 3: Identifying form elements');
    
    let emailInput, passwordInput, submitButton;
    
    // Try different strategies to find email input
    const emailStrategies = [
      'input[type="email"]',
      'input[name="email"]', 
      'input[placeholder*="email" i]',
      '[data-testid="email-input"] input',
      '[data-testid="email-input"]'
    ];
    
    for (const strategy of emailStrategies) {
      const element = page.locator(strategy).first();
      if (await element.isVisible()) {
        emailInput = element;
        console.log(`✅ Found email input with strategy: ${strategy}`);
        break;
      }
    }
    
    // Try different strategies to find password input
    const passwordStrategies = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="password" i]',
      '[data-testid="password-input"] input',
      '[data-testid="password-input"]'
    ];
    
    for (const strategy of passwordStrategies) {
      const element = page.locator(strategy).first();
      if (await element.isVisible()) {
        passwordInput = element;
        console.log(`✅ Found password input with strategy: ${strategy}`);
        break;
      }
    }
    
    // Try to find submit button
    const submitStrategies = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      '[data-testid="sign-in-button"]',
      'button:has-text("Log In")'
    ];
    
    for (const strategy of submitStrategies) {
      const element = page.locator(strategy).first();
      if (await element.isVisible()) {
        submitButton = element;
        console.log(`✅ Found submit button with strategy: ${strategy}`);
        break;
      }
    }
    
    if (!emailInput || !passwordInput || !submitButton) {
      console.log('❌ Could not find all required form elements');
      console.log(`Email input found: ${!!emailInput}`);
      console.log(`Password input found: ${!!passwordInput}`);
      console.log(`Submit button found: ${!!submitButton}`);
      
      // Take another screenshot to see current state
      await page.screenshot({ path: 'login-form-elements-not-found.png', fullPage: true });
      throw new Error('Could not locate login form elements');
    }
    
    // Step 4: Try to fill and submit the form
    console.log('Step 4: Filling login form');
    
    console.log('Filling email...');
    await emailInput.fill('process.env.TEST_EMAIL || 'test@example.com'');
    await page.waitForTimeout(1000);
    
    console.log('Filling password...');
    await passwordInput.fill('process.env.TEST_PASSWORD || 'testpassword'');
    await page.waitForTimeout(1000);
    
    // Take screenshot before submit
    await page.screenshot({ path: 'login-form-filled.png', fullPage: true });
    console.log('📸 Screenshot saved: login-form-filled.png');
    
    console.log('Clicking submit button...');
    
    // Listen for network requests
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
        console.log(`API Response: ${response.status()} ${response.url()}`);
      }
    });
    
    await submitButton.click();
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'login-after-submit.png', fullPage: true });
    console.log('📸 Screenshot saved: login-after-submit.png');
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`Current URL after login attempt: ${currentUrl}`);
    
    // Check for any error messages
    const errorMessages = await page.locator('*:has-text("error"), *:has-text("invalid"), *:has-text("incorrect"), .error, .alert').allTextContents();
    if (errorMessages.length > 0) {
      console.log('Error messages found:');
      errorMessages.forEach(msg => console.log(`  - ${msg}`));
    }
    
    // Check for any success indicators
    const successIndicators = await page.locator('*:has-text("welcome"), *:has-text("dashboard"), .user-menu, [data-testid="user-menu"]').count();
    console.log(`Found ${successIndicators} success indicators`);
    
    // Summary of API responses
    console.log(`\nAPI Responses Summary (${responses.length} total):`);
    responses.forEach(response => {
      console.log(`  ${response.status} ${response.statusText} - ${response.url}`);
    });
    
    // Check if we ended up on dashboard
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Redirected to dashboard');
    } else if (currentUrl.includes('/login')) {
      console.log('❌ FAILED: Still on login page');
    } else {
      console.log(`🤔 UNCLEAR: Ended up on ${currentUrl}`);
    }
  });
  
  test('Check if demo mode or alternative login exists', async ({ page }) => {
    console.log('🔍 Checking for demo mode or alternative login methods');
    
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Look for demo login options
    const demoButtons = await page.locator('*:has-text("demo"), *:has-text("Demo"), [data-testid*="demo"]').allTextContents();
    console.log(`Demo options found: ${demoButtons.length}`);
    demoButtons.forEach(text => console.log(`  - ${text}`));
    
    // Look for alternative login methods
    const altLogins = await page.locator('*:has-text("Google"), *:has-text("GitHub"), *:has-text("OAuth"), *:has-text("SSO")').allTextContents();
    console.log(`Alternative login methods found: ${altLogins.length}`);
    altLogins.forEach(text => console.log(`  - ${text}`));
    
    // Check if there's a registration link
    const signupLinks = await page.locator('a[href*="signup"], a[href*="register"], *:has-text("Sign Up"), *:has-text("Register")').allTextContents();
    console.log(`Signup options found: ${signupLinks.length}`);
    signupLinks.forEach(text => console.log(`  - ${text}`));
  });
});