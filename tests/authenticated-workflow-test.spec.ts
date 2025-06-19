import { test, expect } from '@playwright/test';

test.describe('Authenticated Workflow Test', () => {
  test('Login and Test Workflow Functions', async ({ page }) => {
    console.log('🚀 Starting authenticated workflow test...');
    
    // Go to the app
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded');
    
    // Take screenshot of homepage
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
    
    // Try to login or get started
    const loginButton = page.locator('button:has-text("Login")').first();
    const getStartedButton = page.locator('button:has-text("Get Started")').first();
    
    if (await getStartedButton.isVisible()) {
      console.log('🎯 Clicking Get Started button');
      await getStartedButton.click();
      await page.waitForTimeout(2000);
    } else if (await loginButton.isVisible()) {
      console.log('🎯 Clicking Login button');
      await loginButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'tests/screenshots/after-login-click.png', fullPage: true });
    
    // Look for dashboard or main app interface
    await page.waitForTimeout(3000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Look for workflow-related elements in the authenticated state
    const allButtons = await page.locator('button').all();
    console.log(`🔍 Found ${allButtons.length} buttons after authentication`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      if (text && (
        text.toLowerCase().includes('create') ||
        text.toLowerCase().includes('campaign') ||
        text.toLowerCase().includes('workflow') ||
        text.toLowerCase().includes('brief') ||
        text.toLowerCase().includes('new')
      )) {
        console.log(`🎯 Workflow-related button: "${text}" (visible: ${isVisible})`);
      }
    }
    
    // Look for navigation or menu items
    const navItems = await page.locator('nav a, [role="navigation"] a, .nav a').all();
    console.log(`🔍 Found ${navItems.length} navigation items`);
    
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      const text = await item.textContent();
      console.log(`Nav item ${i + 1}: "${text}"`);
    }
    
    // Try to find workflow triggers
    const workflowTriggers = [
      'button:has-text("Create Campaign")',
      'button:has-text("New Campaign")',
      'button:has-text("Create Brief")',
      'button:has-text("Start Workflow")',
      'a:has-text("Create")',
      'a:has-text("Campaign")',
      '[data-testid*="workflow"]',
      '[data-testid*="campaign"]',
      '[data-testid*="create"]'
    ];
    
    let workflowOpened = false;
    
    for (const selector of workflowTriggers) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`🎯 Found workflow trigger: ${selector}`);
          await element.click();
          await page.waitForTimeout(3000);
          
          // Check if dialog or new page opened
          const dialog = page.locator('[role="dialog"]').first();
          if (await dialog.isVisible({ timeout: 5000 })) {
            console.log('✅ Workflow dialog opened!');
            await page.screenshot({ path: 'tests/screenshots/workflow-dialog.png', fullPage: true });
            workflowOpened = true;
            
            // Test the workflow
            await testWorkflowState(page);
            break;
          } else {
            // Check if we navigated to a new page
            const newUrl = page.url();
            if (newUrl !== currentUrl) {
              console.log(`✅ Navigated to workflow page: ${newUrl}`);
              await page.screenshot({ path: 'tests/screenshots/workflow-page.png', fullPage: true });
              workflowOpened = true;
              
              // Test the workflow
              await testWorkflowState(page);
              break;
            }
          }
        }
      } catch (e) {
        const error = e as Error;
        console.log(`❌ Selector ${selector} failed: ${error.message}`);
      }
    }
    
    if (!workflowOpened) {
      console.log('⚠️ Could not find workflow trigger');
      
      // Take final screenshot to see what's available
      await page.screenshot({ path: 'tests/screenshots/final-state.png', fullPage: true });
      
      // Log all visible text content
      const bodyText = await page.locator('body').textContent();
      console.log('📄 Page content preview:', bodyText?.slice(0, 500) + '...');
    }
    
    console.log('✅ Authenticated workflow test completed');
  });
});

async function testWorkflowState(page: any) {
  console.log('🧪 Testing workflow state management...');
  
  // Inject comprehensive state tracking
  await page.addScriptTag({
    content: `
      window.workflowTester = {
        states: [],
        events: [],
        
        trackState: function(state, source) {
          this.states.push({
            timestamp: Date.now(),
            step: state.activeStep,
            briefConfirmed: state.briefConfirmed,
            source,
            fullState: JSON.parse(JSON.stringify(state))
          });
          console.log('🔧 State tracked:', state.activeStep, 'from', source);
        },
        
        trackEvent: function(event, data) {
          this.events.push({
            timestamp: Date.now(),
            event,
            data
          });
          console.log('🔧 Event tracked:', event, data);
        },
        
        getReport: function() {
          return {
            stateChanges: this.states.length,
            events: this.events.length,
            currentState: this.states[this.states.length - 1],
            allStates: this.states,
            allEvents: this.events
          };
        }
      };
      
      // Override sessionStorage to track all operations
      const originalSetItem = sessionStorage.setItem;
      const originalGetItem = sessionStorage.getItem;
      
      sessionStorage.setItem = function(key, value) {
        if (key === 'airwave_unified_workflow_state') {
          try {
            const state = JSON.parse(value);
            window.workflowTester.trackState(state, 'sessionStorage.setItem');
          } catch (e) {
            console.error('Failed to parse state:', e);
          }
        }
        return originalSetItem.call(this, key, value);
      };
      
      sessionStorage.getItem = function(key) {
        const value = originalGetItem.call(this, key);
        if (key === 'airwave_unified_workflow_state' && value) {
          window.workflowTester.trackEvent('sessionStorage.getItem', { hasValue: !!value });
        }
        return value;
      };
      
      console.log('🔧 Workflow state tracking initialized');
    `
  });
  
  // Look for workflow elements
  const fileInputs = await page.locator('input[type="file"], [data-testid*="drop"], .dropzone, [class*="drop"]').all();
  console.log(`🔍 Found ${fileInputs.length} file input areas`);
  
  const motivationElements = await page.locator('*').filter({ hasText: /motivation|inspire|goal/i }).all();
  console.log(`🔍 Found ${motivationElements.length} motivation-related elements`);
  
  const stepElements = await page.locator('*').filter({ hasText: /step|phase|stage/i }).all();
  console.log(`🔍 Found ${stepElements.length} step-related elements`);
  
  // Monitor for state changes over 15 seconds
  console.log('⏱️ Monitoring workflow state for 15 seconds...');
  
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    
    const currentState = await page.evaluate(() => {
      const state = sessionStorage.getItem('airwave_unified_workflow_state');
      return state ? JSON.parse(state) : null;
    });
    
    if (currentState) {
      console.log(`⏱️ Second ${i + 1}: Step ${currentState.activeStep} (briefConfirmed: ${currentState.briefConfirmed})`);
    } else {
      console.log(`⏱️ Second ${i + 1}: No workflow state found`);
    }
    
    // Try to interact with visible elements
    if (i === 5) {
      // Try to click on any visible workflow buttons
      const workflowButtons = await page.locator('button').filter({ hasText: /next|continue|upload|select|generate/i }).all();
      if (workflowButtons.length > 0) {
        try {
          const firstButton = workflowButtons[0];
          const buttonText = await firstButton.textContent();
          if (await firstButton.isVisible()) {
            console.log(`🎯 Clicking button: "${buttonText}"`);
            await firstButton.click();
            await page.waitForTimeout(2000);
          }
        } catch (e) {
          console.log('⚠️ Could not click workflow button');
        }
      }
    }
  }
  
  // Get final report
  const report = await page.evaluate(() => (window as any).workflowTester?.getReport() || {});
  console.log('📊 WORKFLOW TEST REPORT:');
  console.log('State changes:', report.stateChanges || 0);
  console.log('Events:', report.events || 0);
  console.log('Current state:', report.currentState);
  
  if (report.allStates && report.allStates.length > 0) {
    console.log('📊 State progression:');
    report.allStates.forEach((state: any, index: number) => {
      console.log(`  ${index + 1}. Step ${state.step} (${state.source})`);
    });
    
    // Check for state resets
    const resets = report.allStates.filter((state: any, index: number) => {
      if (index === 0) return false;
      const prevState = report.allStates[index - 1];
      return prevState.step > 0 && state.step === 0;
    });
    
    if (resets.length > 0) {
      console.log('🚨 STATE RESETS DETECTED:', resets.length);
      resets.forEach((reset: any, index: number) => {
        console.log(`  Reset ${index + 1}: ${reset.source} at ${new Date(reset.timestamp).toISOString()}`);
      });
    } else {
      console.log('✅ No state resets detected');
    }
  }
  
  console.log('✅ Workflow state testing completed');
}
