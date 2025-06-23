import { test } from '@playwright/test';

test.describe('Quick Workflow Test', () => {
  test('Quick UI Function Test', async ({ page }) => {
    console.log('🚀 Starting quick workflow test...');
    
    // Go to the app
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Page loaded');
    
    // Take a screenshot
    await page.screenshot({ path: 'tests/screenshots/homepage.png', fullPage: true });
    console.log('📸 Homepage screenshot taken');
    
    // Look for workflow triggers
    const buttons = await page.locator('button').all();
    console.log(`🔍 Found ${buttons.length} buttons on page`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`Button ${i + 1}: "${text}" (visible: ${isVisible})`);
    }
    
    // Look for any workflow-related elements
    const workflowElements = await page.locator('*').filter({ hasText: /workflow|campaign|create|brief/i }).all();
    console.log(`🔍 Found ${workflowElements.length} workflow-related elements`);
    
    for (let i = 0; i < Math.min(workflowElements.length, 10); i++) {
      const element = workflowElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      console.log(`Element ${i + 1}: <${tagName}> "${text?.slice(0, 50)}..."`);
    }
    
    // Try to find and click a workflow trigger
    const workflowTriggers = [
      'button:has-text("Create")',
      'button:has-text("Campaign")',
      'button:has-text("Workflow")',
      'button:has-text("New")',
      '[data-testid*="workflow"]',
      '[data-testid*="campaign"]'
    ];
    
    let workflowOpened = false;
    
    for (const selector of workflowTriggers) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`🎯 Found workflow trigger: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          
          // Check if dialog opened
          const dialog = page.locator('[role="dialog"]').first();
          if (await dialog.isVisible({ timeout: 5000 })) {
            console.log('✅ Workflow dialog opened!');
            await page.screenshot({ path: 'tests/screenshots/workflow-dialog.png', fullPage: true });
            workflowOpened = true;
            
            // Test basic functionality
            await testWorkflowBasics(page);
            break;
          }
        }
      } catch (e) {
        const error = e as Error;
        console.log(`❌ Selector ${selector} failed: ${error.message}`);
      }
    }
    
    if (!workflowOpened) {
      console.log('⚠️ Could not open workflow dialog');
      
      // Try to find any dialogs or modals
      const dialogs = await page.locator('[role="dialog"], .modal, .MuiDialog-root').all();
      console.log(`Found ${dialogs.length} potential dialogs`);
      
      // Check for any hidden elements that might be workflow-related
      const hiddenWorkflowElements = await page.locator('*[style*="display: none"], *[hidden]').filter({ hasText: /workflow|campaign/i }).all();
      console.log(`Found ${hiddenWorkflowElements.length} hidden workflow elements`);
    }
    
    console.log('✅ Quick test completed');
  });
});

async function testWorkflowBasics(page: any) {
  console.log('🧪 Testing workflow basics...');
  
  // Inject state monitoring
  await page.addScriptTag({
    content: `
      window.quickTest = {
        states: [],
        trackState: function() {
          const state = sessionStorage.getItem('airwave_unified_workflow_state');
          if (state) {
            const parsed = JSON.parse(state);
            this.states.push({
              timestamp: Date.now(),
              step: parsed.activeStep,
              briefConfirmed: parsed.briefConfirmed
            });
            console.log('State tracked:', parsed.activeStep);
          }
        }
      };
      
      // Track state changes
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = function(key, value) {
        if (key === 'airwave_unified_workflow_state') {
          window.quickTest.trackState();
        }
        return originalSetItem.call(this, key, value);
      };
    `
  });
  
  // Look for file upload area
  const fileInputs = await page.locator('input[type="file"], [data-testid*="drop"], .dropzone').all();
  console.log(`🔍 Found ${fileInputs.length} file input areas`);
  
  // Look for workflow steps
  const stepElements = await page.locator('*').filter({ hasText: /step|motivation|copy|asset|template/i }).all();
  console.log(`🔍 Found ${stepElements.length} step-related elements`);
  
  // Monitor state for 10 seconds
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(1000);
    
    const currentState = await page.evaluate(() => {
      const state = sessionStorage.getItem('airwave_unified_workflow_state');
      return state ? JSON.parse(state) : null;
    });
    
    console.log(`⏱️ Second ${i + 1}: Step ${currentState?.activeStep || 'null'}`);
  }
  
  // Get final state tracking
  const stateTracking = await page.evaluate(() => (window as any).quickTest?.states || []);
  console.log('📊 State changes detected:', stateTracking.length);
  
  if (stateTracking.length > 0) {
    console.log('State history:', stateTracking);
  }
}
