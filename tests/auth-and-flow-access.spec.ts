import { test, expect } from '@playwright/test';

/**
 * Authentication & Flow Access Testing
 * Tests login functionality and authenticated access to flow pages
 */

test.describe('Authentication & Flow Access', () => {
  
  test('Test Login Page and Authentication Flow', async ({ page }) => {
    console.log('🔐 Testing Login Page and Authentication...');
    
    // Navigate to login page
    await page.goto('https://airwave-complete.netlify.app/login', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'test-results/login-page.png', 
      fullPage: true 
    });
    
    // Check login page elements
    const loginElements = {
      emailField: await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').count(),
      passwordField: await page.locator('input[type="password"], input[name="password"]').count(),
      loginButton: await page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]').count(),
      signupLink: await page.locator('a:has-text("Sign Up"), a:has-text("Register"), a:has-text("Create Account")').count()
    };
    
    console.log('🔍 Login Elements Found:');
    Object.entries(loginElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Test with demo credentials if available
    const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]').first();
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      console.log('📝 Testing login form...');
      
      // Try common demo credentials
      const testCredentials = [
        { email: 'demo@airwave.com', password: 'demo123' },
        { email: 'test@test.com', password: 'password' },
        { email: 'admin@airwave.com', password: 'admin123' }
      ];
      
      for (const creds of testCredentials) {
        console.log(`🔑 Trying credentials: ${creds.email}`);
        
        await emailField.fill(creds.email);
        await passwordField.fill(creds.password);
        
        if (await loginButton.count() > 0) {
          await loginButton.click();
          await page.waitForTimeout(3000);
          
          // Check if login was successful
          const currentUrl = page.url();
          if (!currentUrl.includes('/login')) {
            console.log(`✅ Login successful with ${creds.email}!`);
            console.log(`📍 Redirected to: ${currentUrl}`);
            
            // Take screenshot of successful login
            await page.screenshot({ 
              path: 'test-results/login-success.png', 
              fullPage: true 
            });
            
            // Login successful - continue with test
            break;
          }
        }
        
        // Clear fields for next attempt
        await emailField.clear();
        await passwordField.clear();
      }
    }
    
    console.log('⚠️ Could not authenticate with test credentials');
  });

  test('Test Flow Page Access After Authentication', async ({ page }) => {
    console.log('🌊 Testing Flow Page Access...');
    
    // First try to access flow page directly
    await page.goto('https://airwave-complete.netlify.app/flow', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    const currentUrl = page.url();
    console.log(`📍 Flow page access URL: ${currentUrl}`);
    
    if (currentUrl.includes('/login')) {
      console.log('🔒 Flow page requires authentication - redirected to login');
      
      // Test authentication bypass or guest access
      const guestElements = await page.locator('button:has-text("Guest"), a:has-text("Demo"), button:has-text("Try Demo")').count();
      console.log(`👤 Guest access options: ${guestElements}`);
      
      if (guestElements > 0) {
        const guestButton = page.locator('button:has-text("Guest"), a:has-text("Demo"), button:has-text("Try Demo")').first();
        await guestButton.click();
        await page.waitForTimeout(3000);
        
        if (page.url().includes('/flow')) {
          console.log('✅ Guest access to flow successful!');
        }
      }
    } else {
      console.log('✅ Flow page accessible without authentication');
    }
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'test-results/flow-access-attempt.png', 
      fullPage: true 
    });
    
    // Test navigation to other protected pages
    const protectedPages = ['/strategy', '/matrix', '/campaigns', '/clients', '/assets'];
    
    for (const pagePath of protectedPages) {
      console.log(`🔍 Testing access to ${pagePath}...`);
      await page.goto(`https://airwave-complete.netlify.app${pagePath}`, { timeout: 15000 });
      
      const pageUrl = page.url();
      const requiresAuth = pageUrl.includes('/login');
      
      console.log(`  ${pagePath}: ${requiresAuth ? '🔒 Requires Auth' : '✅ Accessible'}`);
    }
    
    console.log('✅ Flow access testing completed');
  });

  test('Test Public Pages Access', async ({ page }) => {
    console.log('🌐 Testing Public Pages Access...');
    
    const publicPages = ['/', '/about', '/pricing', '/contact', '/features'];
    
    for (const pagePath of publicPages) {
      console.log(`🔍 Testing public page: ${pagePath}`);
      
      try {
        await page.goto(`https://airwave-complete.netlify.app${pagePath}`, { 
          timeout: 15000,
          waitUntil: 'networkidle' 
        });
        
        const pageUrl = page.url();
        const isAccessible = !pageUrl.includes('/login') && !pageUrl.includes('/404');
        
        console.log(`  ${pagePath}: ${isAccessible ? '✅ Accessible' : '❌ Not Accessible'}`);
        
        if (isAccessible) {
          // Take screenshot of accessible public pages
          await page.screenshot({ 
            path: `test-results/public-page-${pagePath.replace('/', 'home')}.png`, 
            fullPage: true 
          });
        }
        
      } catch (error) {
        console.log(`  ${pagePath}: ❌ Error accessing page`);
      }
    }
    
    console.log('✅ Public pages testing completed');
  });
});
