import { test, expect } from '@playwright/test';

test.describe('Debug Authentication', () => {
  test('Debug login process step by step', async ({ page }) => {
    console.log('Starting detailed authentication debug...');
    
    // Navigate to login page
    await page.goto('https://airwave-complete.netlify.app/login');
    await page.waitForLoadState('networkidle');
    
    console.log('Navigated to login page');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'debug-login-page.png', fullPage: true });
    
    // Check if login form elements exist
    const emailInput = await page.locator('input[type="email"]').count();
    const passwordInput = await page.locator('input[type="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();
    
    console.log('Form elements found:');
    console.log('- Email inputs:', emailInput);
    console.log('- Password inputs:', passwordInput);
    console.log('- Submit buttons:', submitButton);
    
    if (emailInput === 0) {
      // Try alternative selectors
      const emailAlt = await page.locator('input[name="email"]').count();
      const emailAlt2 = await page.locator('[placeholder*="email" i]').count();
      console.log('Alternative email selectors:');
      console.log('- input[name="email"]:', emailAlt);
      console.log('- placeholder contains email:', emailAlt2);
    }
    
    if (passwordInput === 0) {
      // Try alternative selectors
      const passwordAlt = await page.locator('input[name="password"]').count();
      const passwordAlt2 = await page.locator('[placeholder*="password" i]').count();
      console.log('Alternative password selectors:');
      console.log('- input[name="password"]:', passwordAlt);
      console.log('- placeholder contains password:', passwordAlt2);
    }
    
    // Get all input elements to see what's available
    const allInputs = await page.locator('input').all();
    console.log('All input elements found:', allInputs.length);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      console.log(`Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", id="${id}"`);
    }
    
    // Try to fill using the most appropriate selectors
    try {
      // Try email input
      if (emailInput > 0) {
        await page.fill('input[type="email"]', 'tomh@redbaez.com');
        console.log('Filled email using type selector');
      } else {
        const emailByName = await page.locator('input[name="email"]').count();
        if (emailByName > 0) {
          await page.fill('input[name="email"]', 'tomh@redbaez.com');
          console.log('Filled email using name selector');
        } else {
          console.log('Could not find email input field');
        }
      }
      
      // Try password input
      if (passwordInput > 0) {
        await page.fill('input[type="password"]', 'Wijlre2010');
        console.log('Filled password using type selector');
      } else {
        const passwordByName = await page.locator('input[name="password"]').count();
        if (passwordByName > 0) {
          await page.fill('input[name="password"]', 'Wijlre2010');
          console.log('Filled password using name selector');
        } else {
          console.log('Could not find password input field');
        }
      }
      
      // Take screenshot after filling
      await page.screenshot({ path: 'debug-filled-form.png', fullPage: true });
      
      // Setup response listener to catch any errors
      page.on('response', response => {
        if (response.url().includes('/api/auth/') || response.url().includes('login')) {
          console.log(`Login-related response: ${response.status()} ${response.url()}`);
        }
      });
      
      // Setup console listener
      page.on('console', msg => {
        console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
      });
      
      // Submit the form
      if (submitButton > 0) {
        await page.click('button[type="submit"]');
        console.log('Clicked submit button');
      } else {
        // Try to find submit button by text
        const loginButtons = await page.locator('button', { hasText: /sign in|login|log in/i }).count();
        if (loginButtons > 0) {
          await page.click('button', { hasText: /sign in|login|log in/i });
          console.log('Clicked login button by text');
        } else {
          console.log('Could not find submit button');
        }
      }
      
      // Wait for navigation or error
      await page.waitForTimeout(3000);
      
      // Check final URL
      const finalUrl = page.url();
      console.log('Final URL after login attempt:', finalUrl);
      
      // Take final screenshot
      await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
      
      // Check for any error messages on the page
      const errorElements = await page.locator('.error, .alert, [role="alert"]').all();
      if (errorElements.length > 0) {
        console.log('Found error elements:');
        for (const error of errorElements) {
          const text = await error.textContent();
          console.log('Error:', text);
        }
      }
      
    } catch (error) {
      console.log('Error during login process:', error);
      await page.screenshot({ path: 'debug-error.png', fullPage: true });
    }
  });
});