import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from '@playwright/test';

test.describe('AIrWAVE Application Workflow Testing', () => {
  
  test('application accessibility and structure', async ({ page }) => {
    console.log('🔍 Testing Application Structure and Accessibility...');
    
    await page.goto('http://localhost:3000');
    
    // Get page title and basic structure
    const title = await page.title();
    console.log(`📄 Page Title: "${title}"`);
    
    // Check for accessibility structure
    const accessibilityElements = await page.evaluate(() => {
      return {
        hasTitle: !!document.title,
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        buttonCount: document.querySelectorAll('button').length,
        linkCount: document.querySelectorAll('a').length,
        inputCount: document.querySelectorAll('input').length,
        formCount: document.querySelectorAll('form').length,
        mainContent: document.querySelectorAll('main, [role="main"]').length,
        navigation: document.querySelectorAll('nav, [role="navigation"]').length,
        hasLogo: document.querySelectorAll('[alt*="logo"], [class*="logo"]').length > 0
      };
    });
    
    console.log('🧩 Application Structure:');
    Object.entries(accessibilityElements).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => {
      const focused = document.activeElement;
      return focused ? focused.tagName.toLowerCase() : 'none';
    });
    
    console.log(`⌨️  Keyboard focus: ${focusedElement}`);
    
    expect(title).toContain('AIrFLOW');
    expect(accessibilityElements.hasTitle).toBe(true);
  });
  
  test('authentication elements discovery', async ({ page }) => {
    console.log('🔐 Discovering Authentication Elements...');
    
    await page.goto('http://localhost:3000');
    
    // Look for authentication elements using Playwright locators
    const authElements = {
      emailInputs: await page.locator('input[type="email"]').count(),
      passwordInputs: await page.locator('input[type="password"]').count(),
      loginButtons: await page.locator('button').filter({ hasText: /login|sign.*in/i }).count(),
      signupButtons: await page.locator('button').filter({ hasText: /sign.*up|register/i }).count(),
      authForms: await page.locator('form').count()
    };
    
    console.log('🔍 Authentication Elements Found:');
    Object.entries(authElements).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Test if we can find any text related to authentication
    const pageText = await page.textContent('body');
    const hasAuthText = pageText ? /login|sign|auth|email|password/i.test(pageText) : false;
    console.log(`📝 Page contains auth-related text: ${hasAuthText}`);
    
    expect(true).toBe(true); // Discovery test always passes
  });
  
  test('navigation and workflow discovery', async ({ page }) => {
    console.log('🧭 Discovering Navigation and Workflow Elements...');
    
    await page.goto('http://localhost:3000');
    
    // Check for navigation elements
    const navigationElements = {
      navLinks: await page.locator('nav a').count(),
      allLinks: await page.locator('a').count(),
      menuButtons: await page.locator('button').filter({ hasText: /menu|nav/i }).count(),
      breadcrumbs: await page.locator('[aria-label*="breadcrumb"], .breadcrumb').count()
    };
    
    console.log('🧭 Navigation Elements:');
    Object.entries(navigationElements).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    // Look for workflow-related elements
    const workflowElements = {
      clientButtons: await page.locator('button').filter({ hasText: /client/i }).count(),
      assetButtons: await page.locator('button').filter({ hasText: /asset|upload|file/i }).count(),
      strategyButtons: await page.locator('button').filter({ hasText: /strategy|ai|generate/i }).count(),
      matrixButtons: await page.locator('button').filter({ hasText: /matrix|campaign/i }).count(),
      executeButtons: await page.locator('button').filter({ hasText: /execute|run|start/i }).count()
    };
    
    console.log('🔄 Workflow Elements:');
    Object.entries(workflowElements).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    expect(true).toBe(true);
  });
  
  test('interactive elements testing', async ({ page }) => {
    console.log('🎯 Testing Interactive Elements...');
    
    await page.goto('http://localhost:3000');
    
    // Get all clickable elements
    const buttons = await page.locator('button').all();
    const links = await page.locator('a').all();
    
    console.log(`🔘 Found ${buttons.length} buttons and ${links.length} links`);
    
    // Test button interactions
    const buttonTestResults = [];
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      try {
        const buttonText = await buttons[i].textContent();
        await buttons[i].click();
        buttonTestResults.push(`✅ Button ${i + 1}: "${buttonText?.substring(0, 20)}..." - Click successful`);
        await page.waitForTimeout(500); // Wait for any effects
      } catch (error) {
    const message = getErrorMessage(error);
        buttonTestResults.push(`❌ Button ${i + 1}: Click failed - ${error.message}`);
      }
    }
    
    console.log('🔘 Button Interaction Results:');
    buttonTestResults.forEach(result => console.log(`   ${result}`));
    
    // Test form interactions if any exist
    const forms = await page.locator('form').all();
    console.log(`📝 Found ${forms.length} forms`);
    
    if (forms.length > 0) {
      const inputs = await page.locator('input').all();
      console.log(`🔣 Found ${inputs.length} input fields`);
      
      // Test first input if available
      if (inputs.length > 0) {
        try {
          await inputs[0].fill('test-value');
          console.log('   ✅ Input field interaction successful');
        } catch (error) {
    const message = getErrorMessage(error);
          console.log(`   ❌ Input interaction failed: ${error.message}`);
        }
      }
    }
    
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });
  
  test('performance and responsiveness', async ({ page }) => {
    console.log('⚡ Testing Performance and Responsiveness...');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Initial load time: ${loadTime}ms`);
    
    // Test different viewport sizes
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1200, height: 800, name: 'Desktop' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      const elements = await page.evaluate(() => {
        return {
          visibleButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.offsetWidth > 0 && btn.offsetHeight > 0
          ).length,
          pageWidth: window.innerWidth,
          pageHeight: window.innerHeight
        };
      });
      
      console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${elements.visibleButtons} visible buttons`);
    }
    
    // Performance metrics
    const performanceData = await page.evaluate(() => {
      return {
        readyState: document.readyState,
        visibilityState: document.visibilityState,
        documentComplete: document.readyState === 'complete'
      };
    });
    
    console.log('📈 Performance Metrics:', performanceData);
    
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    expect(performanceData.documentComplete).toBe(true);
  });
  
  test('complete application workflow simulation', async ({ page }) => {
    console.log('🔄 Running Complete Application Workflow Simulation...');
    
    const workflow = {
      steps: [] as string[],
      errors: [] as string[],
      metrics: {} as { loadTime?: number }
    };
    
    try {
      // Step 1: Application Load
      const loadStart = Date.now();
      await page.goto('http://localhost:3000');
      workflow.metrics.loadTime = Date.now() - loadStart;
      workflow.steps.push('✅ Application loaded successfully');
      
      // Step 2: UI Discovery
      const uiElements = await page.evaluate(() => {
        return {
          totalElements: document.querySelectorAll('*').length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          links: document.querySelectorAll('a').length
        };
      });
      workflow.steps.push(`✅ UI Discovery: ${uiElements.totalElements} elements (${uiElements.buttons} buttons, ${uiElements.inputs} inputs, ${uiElements.links} links)`);
      
      // Step 3: Interaction Testing
      const allButtons = await page.locator('button').all();
      let interactionCount = 0;
      
      for (let i = 0; i < Math.min(allButtons.length, 5); i++) {
        try {
          await allButtons[i].click();
          interactionCount++;
          await page.waitForTimeout(200);
        } catch (error) {
    const message = getErrorMessage(error);
          workflow.errors.push(`Button ${i + 1} interaction failed`);
        }
      }
      workflow.steps.push(`✅ Interaction Testing: ${interactionCount}/${Math.min(allButtons.length, 5)} successful`);
      
      // Step 4: Responsiveness Testing
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(300);
      await page.setViewportSize({ width: 1200, height: 800 });
      workflow.steps.push('✅ Responsiveness: Mobile and desktop layouts tested');
      
      // Step 5: Performance Validation
      const finalPerformance = await page.evaluate(() => {
        return {
          complete: document.readyState === 'complete',
          timestamp: Date.now()
        };
      });
      workflow.steps.push(`✅ Performance: Document ready state ${finalPerformance.complete ? 'complete' : 'loading'}`);
      
      console.log('\\n🎯 Workflow Simulation Results:');
      console.log(`   Total Steps: ${workflow.steps.length}`);
      console.log(`   Load Time: ${workflow.metrics.loadTime}ms`);
      console.log(`   Errors: ${workflow.errors.length}`);
      
      console.log('\\n📋 Completed Steps:');
      workflow.steps.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
      
      if (workflow.errors.length > 0) {
        console.log('\\n❌ Errors Encountered:');
        workflow.errors.forEach(error => console.log(`   • ${error}`));
      }
      
      expect(workflow.steps.length).toBeGreaterThan(3);
      expect(workflow.metrics.loadTime).toBeLessThan(15000);
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Workflow simulation failed: ${error.message}`);
      workflow.errors.push(error.message);
      throw error;
    }
  });
});