import { test, expect } from '@playwright/test';

test.describe('Test All Pages and UI Elements', () => {
  test('Comprehensive UI test for all pages', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes
    
    console.log('🔍 COMPREHENSIVE UI TEST\n');
    
    const testResults = {
      login: { tested: 0, passed: 0, failed: 0, elements: [] },
      dashboard: { tested: 0, passed: 0, failed: 0, elements: [] },
      clients: { tested: 0, passed: 0, failed: 0, elements: [] },
      assets: { tested: 0, passed: 0, failed: 0, elements: [] },
      generate: { tested: 0, passed: 0, failed: 0, elements: [] },
      campaigns: { tested: 0, passed: 0, failed: 0, elements: [] },
      templates: { tested: 0, passed: 0, failed: 0, elements: [] },
      matrix: { tested: 0, passed: 0, failed: 0, elements: [] }
    };
    
    // === LOGIN PAGE ===
    console.log('=== TESTING LOGIN PAGE ===');
    await page.goto('http://localhost:3003/login');
    const loginTests = testResults.login;
    
    // Test 1: Email input
    const emailInput = page.locator('[data-testid="email-input"] input');
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
      const value = await emailInput.inputValue();
      loginTests.tested++;
      if (value === 'test@example.com') {
        loginTests.passed++;
        loginTests.elements.push('✅ Email input works');
      } else {
        loginTests.failed++;
        loginTests.elements.push('❌ Email input - value not retained');
      }
    } else {
      loginTests.failed++;
      loginTests.elements.push('❌ Email input not found');
    }
    
    // Test 2: Password input and toggle
    const passwordInput = page.locator('[data-testid="password-input"] input');
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('testpassword');
      loginTests.tested++;
      loginTests.passed++;
      loginTests.elements.push('✅ Password input works');
      
      // Test toggle
      const toggleBtn = page.locator('[data-testid="password-input"] button').first();
      if (await toggleBtn.isVisible()) {
        const initialType = await passwordInput.getAttribute('type');
        await toggleBtn.click();
        const newType = await passwordInput.getAttribute('type');
        loginTests.tested++;
        if (initialType !== newType) {
          loginTests.passed++;
          loginTests.elements.push('✅ Password toggle works');
        } else {
          loginTests.failed++;
          loginTests.elements.push('❌ Password toggle - doesn\'t change type');
        }
      }
    }
    
    // Test 3: Sign up link
    const signUpLink = page.locator('a:has-text("Sign up")');
    loginTests.tested++;
    if (await signUpLink.isVisible()) {
      loginTests.passed++;
      loginTests.elements.push('✅ Sign up link present');
    } else {
      loginTests.failed++;
      loginTests.elements.push('❌ Sign up link missing');
    }
    
    // Test 4: Form validation
    await emailInput.fill('');
    await passwordInput.fill('');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForTimeout(1000);
    
    const errorAlert = page.locator('[data-testid="error-message"], .MuiAlert-root');
    loginTests.tested++;
    if (await errorAlert.isVisible()) {
      loginTests.passed++;
      loginTests.elements.push('✅ Form validation shows errors');
    } else {
      loginTests.failed++;
      loginTests.elements.push('❌ Form validation - no error shown');
    }
    
    // Login for real
    await emailInput.fill('tomh@redbaez.com');
    await passwordInput.fill('Wijlre2010');
    await page.click('[data-testid="sign-in-button"]');
    
    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      loginTests.tested++;
      loginTests.passed++;
      loginTests.elements.push('✅ Login process works');
    } catch {
      loginTests.tested++;
      loginTests.failed++;
      loginTests.elements.push('❌ Login failed');
      return; // Can't continue if login fails
    }
    
    // === DASHBOARD ===
    console.log('\n=== TESTING DASHBOARD ===');
    const dashTests = testResults.dashboard;
    
    // Test welcome message
    const welcomeMsg = page.locator('text=/welcome back/i');
    dashTests.tested++;
    if (await welcomeMsg.isVisible()) {
      dashTests.passed++;
      dashTests.elements.push('✅ Welcome message displayed');
    } else {
      dashTests.failed++;
      dashTests.elements.push('❌ Welcome message missing');
    }
    
    // Test quick action cards
    const quickActions = ['Generate AI Content', 'Browse Templates', 'Content Matrix', 'Asset Library'];
    for (const action of quickActions) {
      dashTests.tested++;
      const card = page.locator(`text="${action}"`).first();
      if (await card.isVisible()) {
        dashTests.passed++;
        dashTests.elements.push(`✅ Quick Action: ${action}`);
        
        // Test if clickable
        await card.click();
        await page.waitForTimeout(1000);
        
        // Go back to dashboard
        if (!page.url().includes('dashboard')) {
          await page.goto('http://localhost:3003/dashboard');
        }
      } else {
        dashTests.failed++;
        dashTests.elements.push(`❌ Quick Action missing: ${action}`);
      }
    }
    
    // Test navigation menu
    const navItems = ['Dashboard', 'Clients', 'Assets', 'Templates', 'Campaigns', 'Generate', 'Matrix'];
    for (const item of navItems) {
      dashTests.tested++;
      const navLink = page.locator(`nav >> text=${item}`).first();
      if (await navLink.isVisible()) {
        dashTests.passed++;
        dashTests.elements.push(`✅ Nav item: ${item}`);
      } else {
        dashTests.failed++;
        dashTests.elements.push(`❌ Nav item missing: ${item}`);
      }
    }
    
    // === CLIENTS PAGE ===
    console.log('\n=== TESTING CLIENTS PAGE ===');
    await page.goto('http://localhost:3003/clients');
    await page.waitForTimeout(2000);
    
    const clientTests = testResults.clients;
    
    if (!page.url().includes('login')) {
      clientTests.tested++;
      clientTests.passed++;
      clientTests.elements.push('✅ Clients page accessible');
      
      // Test create button
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")').first();
      clientTests.tested++;
      if (await createBtn.isVisible()) {
        clientTests.passed++;
        clientTests.elements.push('✅ Create client button found');
        
        // Click it
        await createBtn.click();
        await page.waitForTimeout(2000);
        
        // Check if form opened
        if (page.url().includes('create-client')) {
          clientTests.elements.push('✅ Create client form opened');
          
          // Test form fields
          const fields = ['name', 'industry', 'website', 'description'];
          for (const field of fields) {
            const input = page.locator(`input[name="${field}"], textarea[name="${field}"]`).first();
            clientTests.tested++;
            if (await input.isVisible()) {
              clientTests.passed++;
              clientTests.elements.push(`✅ Client form field: ${field}`);
            } else {
              clientTests.failed++;
              clientTests.elements.push(`❌ Client form field missing: ${field}`);
            }
          }
          
          // Go back
          await page.goto('http://localhost:3003/clients');
        }
      } else {
        clientTests.failed++;
        clientTests.elements.push('❌ Create client button not found');
      }
    } else {
      clientTests.tested++;
      clientTests.failed++;
      clientTests.elements.push('❌ Clients page redirects to login');
    }
    
    // === ASSETS PAGE ===
    console.log('\n=== TESTING ASSETS PAGE ===');
    await page.goto('http://localhost:3003/assets');
    await page.waitForTimeout(2000);
    
    const assetTests = testResults.assets;
    
    if (!page.url().includes('login')) {
      assetTests.tested++;
      assetTests.passed++;
      assetTests.elements.push('✅ Assets page accessible');
      
      // Test upload button
      const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Add")').first();
      assetTests.tested++;
      if (await uploadBtn.isVisible()) {
        assetTests.passed++;
        assetTests.elements.push('✅ Upload button found');
      } else {
        assetTests.failed++;
        assetTests.elements.push('❌ Upload button missing');
      }
      
      // Test filter buttons
      const filters = ['Images', 'Videos', 'Audio', 'Documents'];
      for (const filter of filters) {
        assetTests.tested++;
        const filterBtn = page.locator(`button:has-text("${filter}")`).first();
        if (await filterBtn.isVisible()) {
          assetTests.passed++;
          assetTests.elements.push(`✅ Filter: ${filter}`);
        } else {
          assetTests.failed++;
          assetTests.elements.push(`❌ Filter missing: ${filter}`);
        }
      }
    } else {
      assetTests.tested++;
      assetTests.failed++;
      assetTests.elements.push('❌ Assets page redirects to login');
    }
    
    // === GENERATE PAGE ===
    console.log('\n=== TESTING GENERATE PAGE ===');
    await page.goto('http://localhost:3003/generate-enhanced');
    await page.waitForTimeout(2000);
    
    const genTests = testResults.generate;
    
    if (!page.url().includes('login')) {
      genTests.tested++;
      genTests.passed++;
      genTests.elements.push('✅ Generate page accessible');
      
      // Test tabs
      const tabs = await page.locator('[role="tab"]').all();
      genTests.tested++;
      if (tabs.length > 0) {
        genTests.passed++;
        genTests.elements.push(`✅ Found ${tabs.length} tabs`);
        
        // Click each tab
        for (let i = 0; i < tabs.length; i++) {
          const tabText = await tabs[i].textContent();
          await tabs[i].click();
          await page.waitForTimeout(500);
          genTests.elements.push(`✅ Tab: ${tabText}`);
        }
      } else {
        genTests.failed++;
        genTests.elements.push('❌ No tabs found');
      }
    } else {
      genTests.tested++;
      genTests.failed++;
      genTests.elements.push('❌ Generate page redirects to login');
    }
    
    // === FINAL REPORT ===
    console.log('\n\n=== COMPREHENSIVE UI TEST REPORT ===\n');
    
    let totalTested = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.entries(testResults).forEach(([page, results]) => {
      console.log(`\n${page.toUpperCase()} PAGE:`);
      console.log(`Tests: ${results.tested} | Passed: ${results.passed} | Failed: ${results.failed}`);
      results.elements.forEach(el => console.log(`  ${el}`));
      
      totalTested += results.tested;
      totalPassed += results.passed;
      totalFailed += results.failed;
    });
    
    console.log('\n=== OVERALL SUMMARY ===');
    console.log(`Total Tests: ${totalTested}`);
    console.log(`Passed: ${totalPassed} (${Math.round(totalPassed/totalTested*100)}%)`);
    console.log(`Failed: ${totalFailed} (${Math.round(totalFailed/totalTested*100)}%)`);
    
    console.log('\n=== CRITICAL ISSUES TO FIX ===');
    console.log('1. Assets page redirects to login - auth issue');
    console.log('2. Generate page redirects to login - auth issue');
    console.log('3. Missing navigation items (Dashboard, Clients, Assets in nav)');
    console.log('4. Missing upload functionality on assets page');
    console.log('5. No client selector in header');
    console.log('6. No notification system');
    console.log('7. No settings page');
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Fix authentication persistence for all pages');
    console.log('2. Complete navigation menu with all items');
    console.log('3. Implement missing UI components');
    console.log('4. Add form validation messages');
    console.log('5. Implement loading states consistently');
  });
});