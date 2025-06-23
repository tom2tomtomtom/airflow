import { test } from '@playwright/test';

test.describe('Full Workflow Test', () => {
  test('Complete Authentication and Workflow Testing', async ({ page }) => {
    console.log('🚀 Starting full workflow test...');
    
    // Step 1: Go to homepage
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded');
    
    // Step 2: Navigate to login
    const getStartedButton = page.locator('button:has-text("Get Started")').first();
    await getStartedButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigated to login page');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'tests/screenshots/login-page.png', fullPage: true });
    
    // Step 3: Check if we can bypass auth for testing
    // First, let's see what's available on the login page
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    // Look for test credentials or demo options
    const demoButtons = await page.locator('button').filter({ hasText: /demo|test|guest|skip/i }).all();
    console.log(`🔍 Found ${demoButtons.length} demo/test buttons`);
    
    for (let i = 0; i < demoButtons.length; i++) {
      const button = demoButtons[i];
      const text = await button.textContent();
      console.log(`Demo button ${i + 1}: "${text}"`);
    }
    
    // Try to navigate directly to dashboard (might work if auth is disabled in dev)
    console.log('🎯 Attempting direct dashboard access...');
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    const dashboardUrl = page.url();
    console.log('📍 Dashboard URL:', dashboardUrl);
    
    if (dashboardUrl.includes('/dashboard')) {
      console.log('✅ Successfully accessed dashboard!');
      await page.screenshot({ path: 'tests/screenshots/dashboard.png', fullPage: true });
      
      // Test workflow from dashboard
      await testWorkflowFromDashboard(page);
    } else {
      console.log('⚠️ Dashboard access blocked, trying alternative approaches...');
      
      // Try to navigate to generate-enhanced directly
      await page.goto('/generate-enhanced');
      await page.waitForTimeout(3000);
      
      const generateUrl = page.url();
      console.log('📍 Generate URL:', generateUrl);
      
      if (generateUrl.includes('/generate-enhanced')) {
        console.log('✅ Successfully accessed generate page!');
        await page.screenshot({ path: 'tests/screenshots/generate-page.png', fullPage: true });
        
        // Test workflow from generate page
        await testWorkflowFromGeneratePage(page);
      } else {
        console.log('⚠️ All direct access attempts failed');
        
        // Try to find the workflow component directly by URL patterns
        const workflowUrls = [
          '/workflow',
          '/brief',
          '/create',
          '/campaign',
          '/unified-workflow'
        ];
        
        for (const url of workflowUrls) {
          console.log(`🎯 Trying ${url}...`);
          await page.goto(url);
          await page.waitForTimeout(2000);
          
          if (page.url().includes(url)) {
            console.log(`✅ Found workflow at ${url}!`);
            await page.screenshot({ path: `tests/screenshots/workflow-${url.replace('/', '')}.png`, fullPage: true });
            await testWorkflowDirectly(page);
            return;
          }
        }
        
        console.log('⚠️ Could not access workflow, testing what we can see...');
        await testAvailableElements(page);
      }
    }
    
    console.log('✅ Full workflow test completed');
  });
});

async function testWorkflowFromDashboard(page: any) {
  console.log('🧪 Testing workflow from dashboard...');
  
  // Look for "Generate AI Content" button
  const generateButton = page.locator('button, a').filter({ hasText: /generate.*ai.*content|ai.*content|generate.*content/i }).first();
  
  if (await generateButton.isVisible({ timeout: 5000 })) {
    console.log('🎯 Found Generate AI Content button');
    await generateButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📍 After clicking generate:', page.url());
    await page.screenshot({ path: 'tests/screenshots/after-generate-click.png', fullPage: true });
    
    await testWorkflowDirectly(page);
  } else {
    console.log('⚠️ Generate AI Content button not found');
    
    // Look for any workflow-related links
    const allLinks = await page.locator('a, button').all();
    console.log(`🔍 Checking ${allLinks.length} links for workflow access...`);
    
    for (let i = 0; i < Math.min(allLinks.length, 20); i++) {
      const link = allLinks[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      
      if (text && (
        text.toLowerCase().includes('create') ||
        text.toLowerCase().includes('workflow') ||
        text.toLowerCase().includes('campaign') ||
        text.toLowerCase().includes('brief') ||
        text.toLowerCase().includes('generate')
      )) {
        console.log(`🎯 Potential workflow link: "${text}" -> ${href}`);
        
        if (href && !href.startsWith('#')) {
          await link.click();
          await page.waitForTimeout(3000);
          
          if (page.url() !== '/dashboard') {
            console.log('✅ Navigation successful, testing workflow...');
            await page.screenshot({ path: 'tests/screenshots/workflow-from-dashboard.png', fullPage: true });
            await testWorkflowDirectly(page);
            return;
          }
        }
      }
    }
  }
}

async function testWorkflowFromGeneratePage(page: any) {
  console.log('🧪 Testing workflow from generate page...');
  await testWorkflowDirectly(page);
}

async function testWorkflowDirectly(page: any) {
  console.log('🧪 Testing workflow directly...');
  
  // Inject comprehensive state tracking
  await page.addScriptTag({
    content: `
      window.workflowTester = {
        states: [],
        events: [],
        components: [],
        
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
        
        trackEvent: function(_event, data) {
          this.events.push({
            timestamp: Date.now(),
            event,
            data
          });
          console.log('🔧 Event tracked:', event, data);
        },
        
        trackComponent: function(componentName, action) {
          this.components.push({
            timestamp: Date.now(),
            component: componentName,
            action
          });
          console.log('🔧 Component tracked:', componentName, action);
        },
        
        getReport: function() {
          return {
            stateChanges: this.states.length,
            events: this.events.length,
            componentMounts: this.components.filter(c => c.action === 'mount').length,
            componentUnmounts: this.components.filter(c => c.action === 'unmount').length,
            currentState: this.states[this.states.length - 1],
            allStates: this.states,
            allEvents: this.events,
            allComponents: this.components
          };
        }
      };
      
      // Override sessionStorage to track all operations
      const originalSetItem = sessionStorage.setItem;
      const originalGetItem = sessionStorage.getItem;
      const originalRemoveItem = sessionStorage.removeItem;
      
      sessionStorage.setItem = function(key, value) {
        if (key === 'airwave_unified_workflow_state') {
          try {
            const state = JSON.parse(value);
            window.workflowTester.trackState(state, 'sessionStorage.setItem');
          } catch (e) {
            console.error('Failed to parse state:', e);
          }
        }
        window.workflowTester.trackEvent('sessionStorage.setItem', { key, hasValue: !!value });
        return originalSetItem.call(this, key, value);
      };
      
      sessionStorage.getItem = function(key) {
        const value = originalGetItem.call(this, key);
        if (key === 'airwave_unified_workflow_state') {
          window.workflowTester.trackEvent('sessionStorage.getItem', { hasValue: !!value });
        }
        return value;
      };
      
      sessionStorage.removeItem = function(key) {
        if (key === 'airwave_unified_workflow_state') {
          window.workflowTester.trackEvent('sessionStorage.removeItem', { key });
        }
        return originalRemoveItem.call(this, key);
      };
      
      console.log('🔧 Workflow state tracking initialized');
    `
  });
  
  // Look for workflow elements
  console.log('🔍 Scanning for workflow elements...');
  
  const fileInputs = await page.locator('input[type="file"], [data-testid*="drop"], .dropzone, [class*="drop"]').all();
  console.log(`📁 Found ${fileInputs.length} file input areas`);
  
  const workflowButtons = await page.locator('button').filter({ hasText: /upload|next|continue|generate|select|create|start/i }).all();
  console.log(`🔘 Found ${workflowButtons.length} workflow buttons`);
  
  const stepIndicators = await page.locator('*').filter({ hasText: /step|phase|stage|\d+\/\d+/i }).all();
  console.log(`📊 Found ${stepIndicators.length} step indicators`);
  
  const dialogElements = await page.locator('[role="dialog"], .MuiDialog-root, [data-testid*="dialog"]').all();
  console.log(`💬 Found ${dialogElements.length} dialog elements`);
  
  // Check for UnifiedBriefWorkflow component
  const workflowComponent = page.locator('[data-testid*="workflow"], [class*="workflow"], [id*="workflow"]').first();
  const hasWorkflowComponent = await workflowComponent.isVisible({ timeout: 2000 });
  console.log(`🔧 Workflow component visible: ${hasWorkflowComponent}`);
  
  // Monitor for state changes over 20 seconds
  console.log('⏱️ Monitoring workflow state for 20 seconds...');
  
  for (let i = 0; i < 20; i++) {
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
    
    // Try to interact with elements at different intervals
    if (i === 3 && fileInputs.length > 0) {
      console.log('🎯 Attempting file upload simulation...');
      try {
        const firstFileInput = fileInputs[0];
        if (await firstFileInput.isVisible()) {
          // Create a test file
          await page.evaluate(() => {
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (input) {
              const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              input.files = dataTransfer.files;
              
              // Trigger change event
              const event = new Event('change', { bubbles: true });
              input.dispatchEvent(_event);
            }
          });
          console.log('✅ File upload simulated');
        }
      } catch (e) {
        console.log('⚠️ File upload simulation failed');
      }
    }
    
    if (i === 7 && workflowButtons.length > 0) {
      console.log('🎯 Attempting button interaction...');
      try {
        const visibleButtons = [];
        for (const button of workflowButtons) {
          if (await button.isVisible()) {
            const text = await button.textContent();
            visibleButtons.push({ button, text });
          }
        }
        
        if (visibleButtons.length > 0) {
          const { button, text } = visibleButtons[0];
          console.log(`🎯 Clicking button: "${text}"`);
          await button.click();
          await page.waitForTimeout(2000);
        }
      } catch (e) {
        console.log('⚠️ Button interaction failed');
      }
    }
    
    if (i === 12 && dialogElements.length > 0) {
      console.log('🎯 Checking dialog state...');
      for (let j = 0; j < dialogElements.length; j++) {
        const dialog = dialogElements[j];
        const isVisible = await dialog.isVisible();
        console.log(`💬 Dialog ${j + 1} visible: ${isVisible}`);
      }
    }
  }
  
  // Get final report
  const report = await page.evaluate(() => (window as any).workflowTester?.getReport() || {});
  console.log('📊 COMPREHENSIVE WORKFLOW TEST REPORT:');
  console.log('='.repeat(50));
  console.log('State changes:', report.stateChanges || 0);
  console.log('Events:', report.events || 0);
  console.log('Component mounts:', report.componentMounts || 0);
  console.log('Component unmounts:', report.componentUnmounts || 0);
  console.log('Current state:', report.currentState);
  
  if (report.allStates && report.allStates.length > 0) {
    console.log('\n📊 State progression:');
    report.allStates.forEach((state: any, index: number) => {
      console.log(`  ${index + 1}. Step ${state.step} (${state.source}) at ${new Date(state.timestamp).toISOString()}`);
    });
    
    // Check for state resets
    const resets = report.allStates.filter((state: any, index: number) => {
      if (index === 0) return false;
      const prevState = report.allStates[index - 1];
      return prevState.step > 0 && state.step === 0;
    });
    
    if (resets.length > 0) {
      console.log('\n🚨 STATE RESETS DETECTED:', resets.length);
      resets.forEach((reset: any, index: number) => {
        console.log(`  Reset ${index + 1}: ${reset.source} at ${new Date(reset.timestamp).toISOString()}`);
      });
    } else {
      console.log('\n✅ No state resets detected');
    }
  }
  
  if (report.allEvents && report.allEvents.length > 0) {
    console.log('\n📊 Session storage events:');
    report.allEvents.slice(-10).forEach((event: any, index: number) => {
      console.log(`  ${event.event} at ${new Date(event.timestamp).toISOString()}`);
    });
  }
  
  console.log('='.repeat(50));
  console.log('✅ Workflow state testing completed');
}

async function testAvailableElements(page: any) {
  console.log('🧪 Testing available elements...');
  
  // Take screenshot of current state
  await page.screenshot({ path: 'tests/screenshots/available-elements.png', fullPage: true });
  
  // Log all visible buttons
  const allButtons = await page.locator('button').all();
  console.log(`🔘 Found ${allButtons.length} total buttons`);
  
  for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
    const button = allButtons[i];
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    console.log(`Button ${i + 1}: "${text}" (visible: ${isVisible})`);
  }
  
  // Log all links
  const allLinks = await page.locator('a').all();
  console.log(`🔗 Found ${allLinks.length} total links`);
  
  for (let i = 0; i < Math.min(allLinks.length, 10); i++) {
    const link = allLinks[i];
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    const isVisible = await link.isVisible();
    console.log(`Link ${i + 1}: "${text}" -> ${href} (visible: ${isVisible})`);
  }
}
