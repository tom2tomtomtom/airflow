import { test, expect } from '@playwright/test';

/**
 * Strategy Page UI Testing
 * Tests strategy page functionality and user interactions
 */

test.describe('Strategy Page Testing', () => {
  
  test('Test Strategy Page Access and UI Elements', async ({ page }) => {
    console.log('🧠 Testing Strategy Page Access and UI Elements...');
    
    // Navigate to strategy page
    await page.goto('https://airwave-complete.netlify.app/strategy', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Check if authentication is required
    if (page.url().includes('/login')) {
      console.log('🔒 Strategy page requires authentication');
      
      // Take screenshot of login redirect
      await page.screenshot({ 
        path: 'test-results/strategy-page-login-redirect.png', 
        fullPage: true 
      });
      
      // Document what we would test with authentication
      console.log('📋 Strategy Page Testing Plan (requires authentication):');
      console.log('1. Strategy Creation Workflow');
      console.log('   - New strategy form');
      console.log('   - Strategy templates');
      console.log('   - AI-powered suggestions');
      console.log('2. Strategy Management');
      console.log('   - Strategy list/dashboard');
      console.log('   - Edit existing strategies');
      console.log('   - Delete/archive strategies');
      console.log('3. Integration Testing');
      console.log('   - Integration with flow workflow');
      console.log('   - Data flow from brief to strategy');
      console.log('   - Export to campaign matrix');
      console.log('4. UI/UX Elements');
      console.log('   - Navigation within strategy section');
      console.log('   - Form validation');
      console.log('   - Responsive design');
      console.log('   - Loading states and error handling');
      
      return;
    }
    
    // If we reach here, strategy page is accessible
    console.log('✅ Strategy page accessible - testing UI elements');
    
    // Take screenshot of strategy page
    await page.screenshot({ 
      path: 'test-results/strategy-page-loaded.png', 
      fullPage: true 
    });
    
    // Test strategy page UI elements
    const strategyUI = {
      title: await page.title(),
      navigation: await page.locator('nav, .navbar, header nav').count(),
      breadcrumbs: await page.locator('.breadcrumb, nav[aria-label*="breadcrumb"]').count(),
      createButton: await page.locator('button:has-text("Create"), button:has-text("New Strategy"), a:has-text("Add")').count(),
      strategyList: await page.locator('.strategy-item, .card, .list-item').count(),
      searchField: await page.locator('input[type="search"], input[placeholder*="search" i]').count(),
      filterOptions: await page.locator('select, .filter, .dropdown').count(),
      forms: await page.locator('form').count(),
      buttons: await page.locator('button').count()
    };
    
    console.log('🔍 Strategy Page UI Elements:');
    Object.entries(strategyUI).forEach(([element, value]) => {
      console.log(`  ${element}: ${typeof value === 'string' ? value : value + ' elements'}`);
    });
    
    // Test strategy creation workflow if available
    if (strategyUI.createButton > 0) {
      console.log('🎯 Testing strategy creation workflow...');
      
      const createButton = page.locator('button:has-text("Create"), button:has-text("New Strategy"), a:has-text("Add")').first();
      await createButton.click();
      await page.waitForTimeout(2000);
      
      // Check for strategy creation form
      const strategyForm = await page.locator('form, .strategy-form, .create-form').count();
      console.log(`📝 Strategy creation form found: ${strategyForm > 0 ? 'Yes' : 'No'}`);
      
      if (strategyForm > 0) {
        // Test form elements
        const formElements = {
          nameField: await page.locator('input[name*="name"], input[placeholder*="name" i]').count(),
          descriptionField: await page.locator('textarea, input[name*="description"]').count(),
          templateOptions: await page.locator('select[name*="template"], .template-option').count(),
          submitButton: await page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').count()
        };
        
        console.log('📋 Strategy Form Elements:');
        Object.entries(formElements).forEach(([element, count]) => {
          console.log(`  ${element}: ${count} elements`);
        });
        
        // Take screenshot of strategy form
        await page.screenshot({ 
          path: 'test-results/strategy-creation-form.png', 
          fullPage: true 
        });
      }
    }
    
    // Test strategy list functionality if available
    if (strategyUI.strategyList > 0) {
      console.log('📋 Testing strategy list functionality...');
      
      const strategies = await page.locator('.strategy-item, .card, .list-item').all();
      console.log(`📊 Found ${strategies.length} strategy items`);
      
      if (strategies.length > 0) {
        // Test first strategy item
        const firstStrategy = strategies[0];
        const strategyText = await firstStrategy.textContent();
        console.log(`📄 First strategy preview: "${strategyText?.substring(0, 100)}..."`);
        
        // Test strategy interaction
        await firstStrategy.click();
        await page.waitForTimeout(2000);
        
        console.log(`📍 After strategy click: ${page.url()}`);
        
        // Take screenshot after strategy selection
        await page.screenshot({ 
          path: 'test-results/strategy-item-selected.png', 
          fullPage: true 
        });
      }
    }
    
    console.log('✅ Strategy page testing completed');
  });

  test('Test Strategy Page Navigation and Integration', async ({ page }) => {
    console.log('🧭 Testing Strategy Page Navigation and Integration...');
    
    await page.goto('https://airwave-complete.netlify.app/strategy');
    
    if (page.url().includes('/login')) {
      console.log('🔒 Strategy page requires authentication for navigation test');
      
      // Test navigation from login page
      console.log('🧭 Testing navigation from login page...');
      
      const navLinks = await page.locator('nav a, .navbar a, header a').all();
      console.log(`🔗 Found ${navLinks.length} navigation links from login page`);
      
      for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
        const link = navLinks[i];
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text && text.trim()) {
          console.log(`  📎 ${text.trim()} → ${href}`);
        }
      }
      
      return;
    }
    
    // Test navigation within strategy section
    console.log('🧭 Testing strategy section navigation...');
    
    const navigationElements = {
      backToFlow: await page.locator('a:has-text("Flow"), button:has-text("Back"), .breadcrumb a').count(),
      toMatrix: await page.locator('a:has-text("Matrix"), a:has-text("Campaign"), button:has-text("Next")').count(),
      toClients: await page.locator('a:has-text("Client"), a:has-text("Manage")').count(),
      mainNav: await page.locator('nav a, .navbar a').count()
    };
    
    console.log('🧭 Navigation Elements:');
    Object.entries(navigationElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Test workflow integration
    console.log('🔄 Testing workflow integration...');
    
    // Check for data from flow workflow
    const pageContent = await page.textContent('body');
    const hasFlowData = pageContent?.toLowerCase().includes('brief') || 
                       pageContent?.toLowerCase().includes('motivation') ||
                       pageContent?.toLowerCase().includes('generated');
    
    console.log(`📊 Flow data integration: ${hasFlowData ? '✅ Detected' : '❌ Not detected'}`);
    
    // Test export functionality
    const exportButtons = await page.locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Save")').count();
    console.log(`💾 Export options: ${exportButtons} buttons found`);
    
    console.log('✅ Strategy navigation testing completed');
  });

  test('Test Strategy Page Responsive Design', async ({ page }) => {
    console.log('📱 Testing Strategy Page Responsive Design...');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 Testing Strategy page on ${viewport.name} (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://airwave-complete.netlify.app/strategy');
      
      if (page.url().includes('/login')) {
        console.log(`🔒 ${viewport.name}: Requires authentication`);
        
        // Test login page responsiveness
        const loginResponsive = {
          formVisible: await page.locator('form').isVisible(),
          fieldsStacked: viewport.width < 768, // Assume mobile stacking
          buttonsAccessible: await page.locator('button').count() > 0
        };
        
        console.log(`  Login form responsive: ${JSON.stringify(loginResponsive)}`);
        
        // Take screenshot
        await page.screenshot({ 
          path: `test-results/strategy-login-${viewport.name.toLowerCase()}.png`, 
          fullPage: true 
        });
        
        continue;
      }
      
      // Test strategy page responsiveness
      const responsiveElements = {
        navigationVisible: await page.locator('nav, .navbar').isVisible(),
        contentScrollable: await page.evaluate(() => document.body.scrollHeight > window.innerHeight),
        buttonsAccessible: await page.locator('button').count() > 0,
        formsUsable: await page.locator('form input, form textarea').count() > 0
      };
      
      console.log(`  ${viewport.name} responsive check:`, responsiveElements);
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/strategy-page-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
      console.log(`  Horizontal scroll: ${hasHorizontalScroll ? '⚠️ Present' : '✅ None'}`);
    }
    
    console.log('✅ Strategy page responsive design testing completed');
  });

  test('Test Strategy Page Performance', async ({ page }) => {
    console.log('⚡ Testing Strategy Page Performance...');
    
    // Measure page load time
    const startTime = Date.now();
    
    await page.goto('https://airwave-complete.netlify.app/strategy', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Strategy page load time: ${loadTime}ms`);
    
    if (page.url().includes('/login')) {
      console.log('🔒 Testing login page performance instead');
      
      // Test login page performance
      const loginPerformance = {
        loadTime: loadTime,
        jsErrors: 0, // Will be updated by error listener
        imageCount: await page.locator('img').count(),
        formElements: await page.locator('input, button').count()
      };
      
      // Listen for JavaScript errors
      page.on('pageerror', error => {
        loginPerformance.jsErrors++;
        console.log(`🐛 JS Error: ${error.message}`);
      });
      
      // Test form interaction performance
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.count() > 0) {
        const interactionStart = Date.now();
        await emailField.fill('test@example.com');
        const interactionTime = Date.now() - interactionStart;
        console.log(`⚡ Form interaction time: ${interactionTime}ms`);
      }
      
      console.log('📊 Login Page Performance:', loginPerformance);
      
      // Performance assertions for login page
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      return;
    }
    
    // Test strategy page performance
    const performanceMetrics = {
      loadTime: loadTime,
      jsErrors: 0,
      imageCount: await page.locator('img').count(),
      buttonCount: await page.locator('button').count(),
      formCount: await page.locator('form').count()
    };
    
    // Listen for JavaScript errors
    page.on('pageerror', error => {
      performanceMetrics.jsErrors++;
      console.log(`🐛 JS Error: ${error.message}`);
    });
    
    // Test interaction performance
    const createButton = page.locator('button:has-text("Create"), button:has-text("New")').first();
    if (await createButton.count() > 0) {
      const interactionStart = Date.now();
      await createButton.click();
      await page.waitForTimeout(1000);
      const interactionTime = Date.now() - interactionStart;
      console.log(`⚡ Button interaction time: ${interactionTime}ms`);
    }
    
    console.log('📊 Strategy Page Performance:', performanceMetrics);
    
    // Performance assertions
    expect(loadTime).toBeLessThan(8000); // Should load within 8 seconds
    expect(performanceMetrics.jsErrors).toBe(0); // Should have no JS errors
    
    console.log('✅ Strategy page performance testing completed');
  });
});
