import { test, expect } from '@playwright/test';

test.describe('AIrWAVE Error Discovery', () => {
  test('discover application errors and issues', async ({ page }) => {
    console.log('🔍 Starting error discovery for AIrWAVE application...');
    
    // Capture console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Capture network errors
    const networkErrors: string[] = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push(`${response.status()} - ${response.url()}`);
      }
    });
    
    try {
      console.log('📡 Navigating to application...');
      const response = await page.goto('http://localhost:3000', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
      
      console.log(`📊 Initial Response: ${response?.status()}`);
      
      // Wait for page to fully load
      await page.waitForTimeout(3000);
      
      // Get page content information
      const title = await page.title();
      const url = page.url();
      console.log(`📄 Page Title: "${title}"`);
      console.log(`🔗 Current URL: ${url}`);
      
      // Check for JavaScript errors on page
      const pageErrors = await page.evaluate(() => {
        // Look for error elements in the DOM
        const errorElements = document.querySelectorAll('[class*="error"], [data-error], .error-message');
        const errors: string[] = [];
        
        errorElements.forEach(element => {
          const text = element.textContent?.trim();
          if (text) errors.push(text);
        });
        
        return errors;
      });
      
      // Report findings
      console.log('\\n🔍 ERROR DISCOVERY RESULTS:');
      console.log(`📊 Console Errors: ${consoleErrors.length}`);
      if (consoleErrors.length > 0) {
        consoleErrors.slice(0, 5).forEach((error, i) => {
          console.log(`   ${i + 1}. ${error.substring(0, 100)}...`);
        });
      }
      
      console.log(`📊 Network Errors: ${networkErrors.length}`);
      if (networkErrors.length > 0) {
        networkErrors.slice(0, 5).forEach((error, i) => {
          console.log(`   ${i + 1}. ${error}`);
        });
      }
      
      console.log(`📊 Page Errors: ${pageErrors.length}`);
      if (pageErrors.length > 0) {
        pageErrors.slice(0, 5).forEach((error, i) => {
          console.log(`   ${i + 1}. ${error.substring(0, 100)}...`);
        });
      }
      
      // Check basic functionality
      const basicElements = {
        hasContent: await page.locator('body').textContent() !== '',
        hasButtons: await page.locator('button').count(),
        hasLinks: await page.locator('a').count(),
        hasInputs: await page.locator('input').count(),
        hasForms: await page.locator('form').count()
      };
      
      console.log('\\n🧩 BASIC FUNCTIONALITY:');
      Object.entries(basicElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Look for authentication elements
      const authElements = {
        loginButton: await page.locator('button:has-text("Login"), button:has-text("Sign in")').count(),
        emailInput: await page.locator('input[type="email"]').count(),
        passwordInput: await page.locator('input[type="password"]').count()
      };
      
      console.log('\\n🔐 AUTHENTICATION ELEMENTS:');
      Object.entries(authElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Look for navigation elements
      const navElements = {
        navigation: await page.locator('nav, [role="navigation"]').count(),
        menuItems: await page.locator('nav a, [role="navigation"] a').count(),
        logo: await page.locator('[alt*="logo"], [class*="logo"]').count()
      };
      
      console.log('\\n🧭 NAVIGATION ELEMENTS:');
      Object.entries(navElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Test passes if we can connect and page has content
      expect(response?.status()).toBeLessThan(500);
      expect(basicElements.hasContent).toBe(true);
      
    } catch (error) {
      console.log(`❌ Critical Error: ${error.message}`);
      
      // Report errors even if test fails
      console.log('\\n🚨 CRITICAL ISSUES DETECTED:');
      console.log(`   Console Errors: ${consoleErrors.length}`);
      console.log(`   Network Errors: ${networkErrors.length}`);
      
      throw error;
    }
  });
  
  test('identify specific page components', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Look for specific AIrWAVE components
    const components = await page.evaluate(() => {
      const selectors = [
        'div[class*="dashboard"]',
        'div[class*="client"]',
        'div[class*="asset"]',
        'div[class*="strategy"]',
        'div[class*="matrix"]',
        'div[class*="campaign"]',
        'div[data-testid]',
        'main',
        'header',
        'footer'
      ];
      
      const found: { [key: string]: number } = {};
      selectors.forEach(selector => {
        found[selector] = document.querySelectorAll(selector).length;
      });
      
      return found;
    });
    
    console.log('\\n🎯 COMPONENT DETECTION:');
    Object.entries(components).forEach(([selector, count]) => {
      if (count > 0) {
        console.log(`   ${selector}: ${count} found`);
      }
    });
    
    expect(true).toBe(true); // Always pass for discovery
  });
});