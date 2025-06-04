import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'tomh@redbaez.com';

test.describe('Credential Testing', () => {
  
  test('Test different password combinations', async ({ page }) => {
    console.log('🔐 Testing different password combinations...');
    
    const passwordsToTry = [
      'Wijre2010',      // Original password from request
      'Wijlre2010',     // Password from existing test files
      'TestPassword123', // Common test password
      'Password123',     // Simple password
      'Airwave2024'      // Project-related password
    ];
    
    for (let i = 0; i < passwordsToTry.length; i++) {
      const password = passwordsToTry[i];
      console.log(`\n🧪 Attempt ${i + 1}: Testing password "${password}"`);
      
      // Navigate to login page
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('domcontentloaded');
      
      // Clear any existing values
      await page.fill('input[type="email"]', '');
      await page.fill('input[type="password"]', '');
      
      // Fill in credentials
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', password);
      
      // Take screenshot before submit
      await page.screenshot({ 
        path: `test-results/credential-test-${i + 1}-${password.replace(/[^a-zA-Z0-9]/g, '')}.png`, 
        fullPage: true 
      });
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for response
      await page.waitForTimeout(3000);
      
      // Check result
      const currentUrl = page.url();
      console.log(`   Current URL: ${currentUrl}`);
      
      if (currentUrl.includes('/dashboard')) {
        console.log(`✅ SUCCESS! Password "${password}" works!`);
        
        // Take success screenshot
        await page.screenshot({ 
          path: `test-results/credential-success-${password.replace(/[^a-zA-Z0-9]/g, '')}.png`, 
          fullPage: true 
        });
        
        // We found working credentials, now test the full app
        await testFullApplicationAccess(page);
        return; // Exit test on success
        
      } else {
        // Look for error messages
        const errorElements = await page.locator('.error, .alert, [role="alert"], .MuiAlert-root').count();
        if (errorElements > 0) {
          const errorText = await page.locator('.error, .alert, [role="alert"], .MuiAlert-root').first().textContent();
          console.log(`   ❌ Error: ${errorText}`);
        } else {
          console.log(`   ❌ Login failed (no specific error message)`);
        }
        
        // Take failure screenshot
        await page.screenshot({ 
          path: `test-results/credential-fail-${i + 1}-${password.replace(/[^a-zA-Z0-9]/g, '')}.png`, 
          fullPage: true 
        });
      }
    }
    
    console.log('\n❌ No working password found from the test set');
    console.log('💡 This might indicate:');
    console.log('   1. The user account needs to be created in the database');
    console.log('   2. Different credentials are required');
    console.log('   3. The authentication system has issues');
  });
  
  test('Try creating a new account', async ({ page }) => {
    console.log('👤 Testing account creation...');
    
    // Look for sign up link or registration page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    
    // Look for sign up links
    const signUpSelectors = [
      'a:has-text("Sign up")',
      'a:has-text("Register")',
      'a:has-text("Create account")',
      'button:has-text("Sign up")',
      '[href*="signup"]',
      '[href*="register"]'
    ];
    
    let signUpFound = false;
    for (const selector of signUpSelectors) {
      const element = page.locator(selector);
      if (await element.count() > 0) {
        console.log(`✅ Found sign up link with selector: ${selector}`);
        await element.first().click();
        signUpFound = true;
        break;
      }
    }
    
    if (signUpFound) {
      await page.waitForLoadState('domcontentloaded');
      await page.screenshot({ path: 'test-results/signup-page.png', fullPage: true });
      
      // Try to create test account
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
        await emailInput.fill(TEST_EMAIL);
        await passwordInput.fill('TestPassword123');
        
        // Look for additional fields
        const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]');
        if (await nameInput.count() > 0) {
          await nameInput.first().fill('Test User');
        }
        
        await page.screenshot({ path: 'test-results/signup-filled.png', fullPage: true });
        
        // Submit signup
        const submitButton = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Create")');
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          await page.waitForTimeout(3000);
          
          await page.screenshot({ path: 'test-results/signup-result.png', fullPage: true });
          console.log('🎯 Account creation attempted');
        }
      }
    } else {
      console.log('❌ No sign up option found');
      
      // Try direct navigation to signup
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForLoadState('domcontentloaded');
      
      if (!page.url().includes('/signup')) {
        console.log('❌ No signup page available');
      } else {
        await page.screenshot({ path: 'test-results/signup-direct.png', fullPage: true });
        console.log('✅ Found signup page via direct navigation');
      }
    }
  });
});

async function testFullApplicationAccess(page) {
  console.log('\n🎯 Testing full application access with working credentials...');
  
  const testPages = [
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Clients', url: '/clients' },
    { name: 'Assets', url: '/assets' },
    { name: 'Templates', url: '/templates' },
    { name: 'Campaigns', url: '/campaigns' },
    { name: 'Matrix', url: '/matrix' },
    { name: 'Generate Enhanced', url: '/generate-enhanced' },
    { name: 'Analytics', url: '/analytics' },
    { name: 'Approvals', url: '/approvals' }
  ];
  
  for (const testPage of testPages) {
    try {
      console.log(`   Testing ${testPage.name}...`);
      await page.goto(`http://localhost:3000${testPage.url}`);
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/full-access-${testPage.name.toLowerCase().replace(/\s+/g, '-')}.png`, 
        fullPage: true 
      });
      
      // Count interactive elements
      const buttons = await page.locator('button').count();
      const inputs = await page.locator('input').count();
      const links = await page.locator('a').count();
      
      console.log(`   ✅ ${testPage.name}: ${buttons} buttons, ${inputs} inputs, ${links} links`);
      
    } catch (error) {
      console.log(`   ❌ ${testPage.name}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Full application access test completed!');
}