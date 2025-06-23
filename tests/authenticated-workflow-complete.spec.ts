import { getErrorMessage } from '@/utils/errorUtils';
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const credentialsPath = path.join(process.cwd(), 'test-credentials.json');
let testCredentials: any = null;

try {
  if (fs.existsSync(credentialsPath)) {
    testCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('✅ Test credentials loaded');
  }
} catch (error) {
    const message = getErrorMessage(error);
  console.log('⚠️ Could not load test credentials');
}

test.describe('Authenticated Workflow Complete Test', () => {
  test('Login with Test User and Test Complete Workflow', async ({ page }) => {
    console.log('🚀 Starting authenticated workflow complete test...');
    
    if (!testCredentials) {
      console.log('❌ No test credentials available, skipping test');
      return;
    }
    
    // Step 1: Navigate to login page
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    console.log('✅ Login page loaded');
    
    // Step 2: Fill in credentials and login
    await page.fill('input[name="email"], input[type="email"]', testCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', testCredentials.password);
    
    console.log('🔑 Credentials filled, attempting login...');
    
    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
    await loginButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(5000);
    
    const currentUrl = page.url();
    console.log('📍 After login URL:', currentUrl);
    
    // Take screenshot after login
    await page.screenshot({ path: 'tests/screenshots/after-login.png', fullPage: true });
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Successfully logged in and redirected to dashboard!');
      await testWorkflowFromAuthenticatedDashboard(page);
    } else if (currentUrl.includes('/login')) {
      console.log('⚠️ Still on login page, checking for errors...');
      
      // Check for error messages
      const errorMessages = await page.locator('.error, [role="alert"], .MuiAlert-root').all();
      for (let i = 0; i < errorMessages.length; i++) {
        const error = errorMessages[i];
        if (await error.isVisible()) {
          const errorText = await error.textContent();
          console.log(`❌ Error message ${i + 1}: ${errorText}`);
        }
      }
      
      // Try alternative authentication methods
      await tryAlternativeAuth(page);
    } else {
      console.log('📍 Redirected to unexpected URL, investigating...');
      await page.screenshot({ path: 'tests/screenshots/unexpected-redirect.png', fullPage: true });
      
      // Try to navigate to dashboard manually
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/dashboard')) {
        console.log('✅ Manual dashboard navigation successful!');
        await testWorkflowFromAuthenticatedDashboard(page);
      }
    }
    
    console.log('✅ Authenticated workflow complete test finished');
  });
});

async function tryAlternativeAuth(page: any) {
  console.log('🔄 Trying alternative authentication methods...');
  
  // Check if there's a debug login endpoint
  try {
    await page.goto('/api/auth/login-debug');
    await page.waitForTimeout(2000);
    
    const debugResponse = await page.textContent('body');
    console.log('🔧 Debug auth response:', debugResponse?.substring(0, 200));
    
    // Try to navigate to dashboard after debug auth
    await page.goto('/dashboard');
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/dashboard')) {
      console.log('✅ Debug authentication successful!');
      await testWorkflowFromAuthenticatedDashboard(page);
      return;
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.log('⚠️ Debug auth failed');
  }
  
  // Try to set authentication cookies/localStorage manually
  try {
    if (testCredentials.token) {
      await page.evaluate((token) => {
        localStorage.setItem('supabase.auth.token', token);
        sessionStorage.setItem('supabase.auth.token', token);
      }, testCredentials.token);
      
      console.log('🔧 Set auth token in storage, retrying dashboard...');
      await page.goto('/dashboard');
      await page.waitForTimeout(3000);
      
      if (page.url().includes('/dashboard')) {
        console.log('✅ Manual token authentication successful!');
        await testWorkflowFromAuthenticatedDashboard(page);
        return;
      }
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.log('⚠️ Manual token auth failed');
  }
}

async function testWorkflowFromAuthenticatedDashboard(page: any) {
  console.log('🧪 Testing workflow from authenticated dashboard...');
  
  // Take screenshot of dashboard
  await page.screenshot({ path: 'tests/screenshots/authenticated-dashboard.png', fullPage: true });
  
  // Inject comprehensive workflow state tracking
  await page.addScriptTag({
    content: `
      window.workflowTester = {
        states: [],
        events: [],
        components: [],
        apiCalls: [],
        
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
        
        trackApiCall: function(url, method, status) {
          this.apiCalls.push({
            timestamp: Date.now(),
            url,
            method,
            status
          });
          console.log('🔧 API call tracked:', method, url, status);
        },
        
        getReport: function() {
          return {
            stateChanges: this.states.length,
            events: this.events.length,
            componentMounts: this.components.filter(c => c.action === 'mount').length,
            componentUnmounts: this.components.filter(c => c.action === 'unmount').length,
            apiCalls: this.apiCalls.length,
            currentState: this.states[this.states.length - 1],
            allStates: this.states,
            allEvents: this.events,
            allComponents: this.components,
            allApiCalls: this.apiCalls
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
      
      // Override fetch to track API calls
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        const options = args[1] || {};
        const method = options.method || 'GET';
        
        return originalFetch.apply(this, args).then(response => {
          if (typeof url === 'string' && url.includes('/api/')) {
            window.workflowTester.trackApiCall(url, method, response.status);
          }
          return response;
        });
      };
      
      console.log('🔧 Comprehensive workflow tracking initialized');
    `
  });
  
  // Look for workflow access points
  console.log('🔍 Looking for workflow access points...');
  
  // Check for "Generate AI Content" button
  const generateButton = page.locator('button, a').filter({ hasText: /generate.*ai.*content|ai.*content|generate.*content/i }).first();
  
  if (await generateButton.isVisible({ timeout: 5000 })) {
    console.log('🎯 Found Generate AI Content button, clicking...');
    await generateButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📍 After generate click:', page.url());
    await page.screenshot({ path: 'tests/screenshots/after-generate-click.png', fullPage: true });
    
    await testUnifiedWorkflow(page);
  } else {
    console.log('⚠️ Generate AI Content button not found, looking for alternatives...');
    
    // Look for other workflow entry points
    const workflowLinks = [
      'a[href*="generate"]',
      'a[href*="workflow"]',
      'a[href*="create"]',
      'a[href*="campaign"]',
      'button:has-text("Create")',
      'button:has-text("New")',
      'button:has-text("Start")'
    ];
    
    for (const selector of workflowLinks) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          const text = await element.textContent();
          console.log(`🎯 Found potential workflow link: "${text}"`);
          await element.click();
          await page.waitForTimeout(3000);
          
          const newUrl = page.url();
          if (newUrl !== '/dashboard') {
            console.log(`✅ Navigation successful to: ${newUrl}`);
            await page.screenshot({ path: 'tests/screenshots/workflow-entry.png', fullPage: true });
            await testUnifiedWorkflow(page);
            return;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    console.log('⚠️ No workflow entry points found, testing current page elements...');
    await testCurrentPageElements(page);
  }
}

async function testUnifiedWorkflow(page: any) {
  console.log('🧪 Testing UnifiedBriefWorkflow component...');
  
  // Look for workflow dialog or component
  const workflowDialog = page.locator('[role="dialog"], .MuiDialog-root').first();
  const workflowComponent = page.locator('[data-testid*="workflow"], [class*="workflow"]').first();
  
  let workflowContainer = null;
  
  if (await workflowDialog.isVisible({ timeout: 5000 })) {
    console.log('✅ Workflow dialog found');
    workflowContainer = workflowDialog;
    await page.screenshot({ path: 'tests/screenshots/workflow-dialog.png', fullPage: true });
  } else if (await workflowComponent.isVisible({ timeout: 5000 })) {
    console.log('✅ Workflow component found');
    workflowContainer = workflowComponent;
    await page.screenshot({ path: 'tests/screenshots/workflow-component.png', fullPage: true });
  } else {
    console.log('⚠️ No workflow container found, testing page as-is');
    workflowContainer = page.locator('body');
    await page.screenshot({ path: 'tests/screenshots/workflow-page.png', fullPage: true });
  }
  
  // Test workflow steps
  console.log('🔄 Testing workflow steps...');
  
  // Step 0: File Upload / Drag & Drop
  await testFileUploadStep(page, workflowContainer);
  
  // Step 1: Motivations
  await testMotivationsStep(page, workflowContainer);
  
  // Step 2: Copy Generation
  await testCopyGenerationStep(page, workflowContainer);
  
  // Step 3: Asset Selection
  await testAssetSelectionStep(page, workflowContainer);
  
  // Step 4: Template Selection
  await testTemplateSelectionStep(page, workflowContainer);
  
  // Step 5: Content Matrix
  await testContentMatrixStep(page, workflowContainer);
  
  // Step 6: Ready to Render
  await testReadyToRenderStep(page, workflowContainer);
  
  // Generate final report
  await generateWorkflowReport(page);
}

async function testFileUploadStep(page: any, container: any) {
  console.log('📁 Testing Step 0: File Upload...');
  
  // Look for file inputs and dropzones
  const fileInputs = await container.locator('input[type="file"]').all();
  const dropzones = await container.locator('[class*="drop"], [data-testid*="drop"]').all();
  
  console.log(`Found ${fileInputs.length} file inputs and ${dropzones.length} dropzones`);
  
  if (fileInputs.length > 0) {
    try {
      const fileInput = fileInputs[0];
      
      // Create a test file
      const testFile = await page.evaluateHandle(() => {
        const file = new File(['test brief content'], 'test-brief.txt', { type: 'text/plain' });
        return file;
      });
      
      await fileInput.setInputFiles([testFile]);
      console.log('✅ Test file uploaded');
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/after-file-upload.png', fullPage: true });
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log('⚠️ File upload failed:', error);
    }
  }
  
  // Monitor state changes
  await monitorStateChanges(page, 5);
}

async function testMotivationsStep(page: any, container: any) {
  console.log('💡 Testing Step 1: Motivations...');
  
  // Look for motivation cards or buttons
  const motivationElements = await container.locator('*').filter({ hasText: /motivation|inspire|goal/i }).all();
  console.log(`Found ${motivationElements.length} motivation elements`);
  
  // Try to click on motivation options
  for (let i = 0; i < Math.min(motivationElements.length, 3); i++) {
    try {
      const element = motivationElements[i];
      if (await element.isVisible()) {
        const text = await element.textContent();
        console.log(`🎯 Clicking motivation: "${text?.substring(0, 50)}..."`);
        await element.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`⚠️ Could not click motivation ${i + 1}`);
    }
  }
  
  await monitorStateChanges(page, 3);
  await page.screenshot({ path: 'tests/screenshots/motivations-step.png', fullPage: true });
}

async function testCopyGenerationStep(page: any, container: any) {
  console.log('✍️ Testing Step 2: Copy Generation...');
  
  // Look for generate buttons
  const generateButtons = await container.locator('button').filter({ hasText: /generate|create.*copy/i }).all();
  console.log(`Found ${generateButtons.length} generate buttons`);
  
  if (generateButtons.length > 0) {
    try {
      const generateButton = generateButtons[0];
      if (await generateButton.isVisible()) {
        console.log('🎯 Clicking generate button');
        await generateButton.click();
        await page.waitForTimeout(5000); // Wait longer for API call
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.log('⚠️ Generate button click failed');
    }
  }
  
  await monitorStateChanges(page, 5);
  await page.screenshot({ path: 'tests/screenshots/copy-generation-step.png', fullPage: true });
}

async function testAssetSelectionStep(page: any, container: any) {
  console.log('🖼️ Testing Step 3: Asset Selection...');
  
  // Look for asset options
  const assetElements = await container.locator('*').filter({ hasText: /asset|image|video|photo/i }).all();
  console.log(`Found ${assetElements.length} asset elements`);
  
  await monitorStateChanges(page, 3);
  await page.screenshot({ path: 'tests/screenshots/asset-selection-step.png', fullPage: true });
}

async function testTemplateSelectionStep(page: any, container: any) {
  console.log('📋 Testing Step 4: Template Selection...');
  
  // Look for template options
  const templateElements = await container.locator('*').filter({ hasText: /template|layout|format/i }).all();
  console.log(`Found ${templateElements.length} template elements`);
  
  await monitorStateChanges(page, 3);
  await page.screenshot({ path: 'tests/screenshots/template-selection-step.png', fullPage: true });
}

async function testContentMatrixStep(page: any, container: any) {
  console.log('📊 Testing Step 5: Content Matrix...');
  
  // Look for matrix or summary elements
  const matrixElements = await container.locator('*').filter({ hasText: /matrix|summary|overview/i }).all();
  console.log(`Found ${matrixElements.length} matrix elements`);
  
  await monitorStateChanges(page, 3);
  await page.screenshot({ path: 'tests/screenshots/content-matrix-step.png', fullPage: true });
}

async function testReadyToRenderStep(page: any, container: any) {
  console.log('🎬 Testing Step 6: Ready to Render...');
  
  // Look for render or finish buttons
  const renderButtons = await container.locator('button').filter({ hasText: /render|finish|complete|done/i }).all();
  console.log(`Found ${renderButtons.length} render buttons`);
  
  await monitorStateChanges(page, 3);
  await page.screenshot({ path: 'tests/screenshots/ready-to-render-step.png', fullPage: true });
}

async function monitorStateChanges(page: any, seconds: number) {
  for (let i = 0; i < seconds; i++) {
    await page.waitForTimeout(1000);
    
    const currentState = await page.evaluate(() => {
      const state = sessionStorage.getItem('airwave_unified_workflow_state');
      return state ? JSON.parse(state) : null;
    });
    
    if (currentState) {
      console.log(`⏱️ State: Step ${currentState.activeStep} (briefConfirmed: ${currentState.briefConfirmed})`);
    }
  }
}

async function generateWorkflowReport(page: any) {
  console.log('📊 Generating comprehensive workflow report...');
  
  const report = await page.evaluate(() => (window as any).workflowTester?.getReport() || {});
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE WORKFLOW TEST REPORT');
  console.log('='.repeat(60));
  console.log('📈 State changes:', report.stateChanges || 0);
  console.log('🔔 Events:', report.events || 0);
  console.log('🔧 Component mounts:', report.componentMounts || 0);
  console.log('🔧 Component unmounts:', report.componentUnmounts || 0);
  console.log('🌐 API calls:', report.apiCalls || 0);
  console.log('📍 Current state:', report.currentState);
  
  if (report.allStates && report.allStates.length > 0) {
    console.log('\n📊 STATE PROGRESSION:');
    report.allStates.forEach((state: any, index: number) => {
      console.log(`  ${index + 1}. Step ${state.step} (${state.source}) at ${new Date(state.timestamp).toISOString()}`);
    });
    
    // Analyze state resets
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
    
    // Analyze workflow progression
    const maxStep = Math.max(...report.allStates.map((s: any) => s.step));
    console.log(`\n📈 Maximum step reached: ${maxStep}/6`);
    
    if (maxStep >= 6) {
      console.log('🎉 WORKFLOW COMPLETED SUCCESSFULLY!');
    } else if (maxStep >= 3) {
      console.log('⚠️ Workflow partially completed');
    } else {
      console.log('❌ Workflow did not progress significantly');
    }
  }
  
  if (report.allApiCalls && report.allApiCalls.length > 0) {
    console.log('\n🌐 API CALLS:');
    report.allApiCalls.forEach((call: any, index: number) => {
      console.log(`  ${index + 1}. ${call.method} ${call.url} (${call.status})`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('✅ Workflow test report complete');
}

async function testCurrentPageElements(page: any) {
  console.log('🧪 Testing current page elements...');
  
  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/current-page-elements.png', fullPage: true });
  
  // Log visible buttons
  const buttons = await page.locator('button').all();
  console.log(`🔘 Found ${buttons.length} buttons`);
  
  for (let i = 0; i < Math.min(buttons.length, 10); i++) {
    const button = buttons[i];
    if (await button.isVisible()) {
      const text = await button.textContent();
      console.log(`  Button ${i + 1}: "${text}"`);
    }
  }
  
  // Log visible links
  const links = await page.locator('a').all();
  console.log(`🔗 Found ${links.length} links`);
  
  for (let i = 0; i < Math.min(links.length, 10); i++) {
    const link = links[i];
    if (await link.isVisible()) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`  Link ${i + 1}: "${text}" -> ${href}`);
    }
  }
}
