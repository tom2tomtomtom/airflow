import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const credentialsPath = path.join(process.cwd(), 'test-credentials.json');
let testCredentials: any = null;

try {
  if (fs.existsSync(credentialsPath)) {
    testCredentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
  }
} catch (error) {
  console.log('⚠️ Could not load test credentials');
}

test.describe('Workflow Focused Test', () => {
  test('Find and Test UnifiedBriefWorkflow Component', async ({ page }) => {
    console.log('🚀 Starting workflow-focused test...');
    
    if (!testCredentials) {
      console.log('❌ No test credentials available, skipping test');
      return;
    }
    
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', testCredentials.password);
    await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in, current URL:', page.url());
    
    // Inject workflow state tracking immediately
    await injectWorkflowTracking(page);
    
    // Step 1: Analyze dashboard and find workflow access
    await analyzeDashboard(page);
    
    // Step 2: Try different paths to access workflow
    await tryWorkflowAccess(page);
    
    // Step 3: If workflow found, test it thoroughly
    await testWorkflowIfFound(page);
    
    console.log('✅ Workflow-focused test completed');
  });
});

async function injectWorkflowTracking(page: any) {
  await page.addScriptTag({
    content: `
      window.workflowTracker = {
        states: [],
        events: [],
        
        track: function(type, data) {
          const entry = {
            timestamp: Date.now(),
            type,
            data
          };
          
          if (type === 'state') {
            this.states.push(entry);
          } else {
            this.events.push(entry);
          }
          
          console.log('🔧 Tracked:', type, data);
        },
        
        getReport: function() {
          return {
            states: this.states,
            events: this.events,
            stateCount: this.states.length,
            eventCount: this.events.length
          };
        }
      };
      
      // Monitor sessionStorage for workflow state
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = function(key, value) {
        if (key === 'airwave_unified_workflow_state') {
          try {
            const state = JSON.parse(value);
            window.workflowTracker.track('state', {
              step: state.activeStep,
              briefConfirmed: state.briefConfirmed,
              source: 'sessionStorage.setItem'
            });
          } catch (e) {
            window.workflowTracker.track('error', 'Failed to parse workflow state');
          }
        }
        return originalSetItem.call(this, key, value);
      };
      
      console.log('🔧 Workflow tracking initialized');
    `
  });
}

async function analyzeDashboard(page: any) {
  console.log('🔍 Analyzing dashboard...');
  
  await page.screenshot({ path: 'tests/screenshots/dashboard-analysis.png', fullPage: true });
  
  // Check for client selection requirement
  const clientElements = await page.locator('*').filter({ hasText: /client|select.*client|create.*client/i }).all();
  console.log(`👥 Found ${clientElements.length} client-related elements`);
  
  for (let i = 0; i < Math.min(clientElements.length, 5); i++) {
    const element = clientElements[i];
    if (await element.isVisible()) {
      const text = await element.textContent();
      console.log(`  Client element ${i + 1}: "${text?.substring(0, 100)}"`);
    }
  }
  
  // Check for workflow-related buttons/links
  const workflowElements = await page.locator('button, a').filter({ 
    hasText: /generate|create|workflow|campaign|brief|ai.*content/i 
  }).all();
  console.log(`🔧 Found ${workflowElements.length} potential workflow elements`);
  
  for (let i = 0; i < Math.min(workflowElements.length, 10); i++) {
    const element = workflowElements[i];
    if (await element.isVisible()) {
      const text = await element.textContent();
      const href = await element.getAttribute('href');
      console.log(`  Workflow element ${i + 1}: "${text}" -> ${href}`);
    }
  }
  
  // Check current page content
  const pageTitle = await page.title();
  console.log(`📄 Page title: ${pageTitle}`);
  
  // Check for any existing workflow state
  const existingState = await page.evaluate(() => {
    const state = sessionStorage.getItem('airwave_unified_workflow_state');
    return state ? JSON.parse(state) : null;
  });
  
  if (existingState) {
    console.log(`📊 Existing workflow state found: Step ${existingState.activeStep}`);
  } else {
    console.log('📊 No existing workflow state');
  }
}

async function tryWorkflowAccess(page: any) {
  console.log('🎯 Trying different workflow access methods...');
  
  // Method 1: Look for "Create Your First Client" and follow that flow
  const createClientButton = page.locator('button, a').filter({ hasText: /create.*first.*client|create.*client/i }).first();
  
  if (await createClientButton.isVisible({ timeout: 2000 })) {
    console.log('🎯 Method 1: Trying "Create First Client" flow...');
    await createClientButton.click();
    await page.waitForTimeout(3000);
    
    console.log('📍 After client creation click:', page.url());
    await page.screenshot({ path: 'tests/screenshots/after-client-creation.png', fullPage: true });
    
    // Check if this leads to workflow
    if (await checkForWorkflowComponent(page)) {
      return true;
    }
  }
  
  // Method 2: Try direct navigation to known workflow URLs
  const workflowUrls = [
    '/generate-enhanced',
    '/workflow',
    '/create',
    '/campaign',
    '/brief'
  ];
  
  for (const url of workflowUrls) {
    console.log(`🎯 Method 2: Trying direct navigation to ${url}...`);
    await page.goto(url);
    await page.waitForTimeout(2000);
    
    if (page.url().includes(url)) {
      console.log(`✅ Successfully accessed ${url}`);
      await page.screenshot({ path: `tests/screenshots/direct-${url.replace('/', '')}.png`, fullPage: true });
      
      if (await checkForWorkflowComponent(page)) {
        return true;
      }
    }
  }
  
  // Method 3: Look for any "Generate" or "AI" buttons on dashboard
  await page.goto('/dashboard');
  await page.waitForTimeout(2000);
  
  const generateButtons = await page.locator('button, a').filter({ 
    hasText: /generate|ai|create.*content|new.*campaign/i 
  }).all();
  
  for (let i = 0; i < Math.min(generateButtons.length, 5); i++) {
    const button = generateButtons[i];
    if (await button.isVisible()) {
      const text = await button.textContent();
      console.log(`🎯 Method 3: Trying generate button "${text}"...`);
      
      await button.click();
      await page.waitForTimeout(3000);
      
      console.log('📍 After generate button click:', page.url());
      
      if (await checkForWorkflowComponent(page)) {
        return true;
      }
      
      // Go back to dashboard for next attempt
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
    }
  }
  
  // Method 4: Check if workflow is embedded in dashboard
  console.log('🎯 Method 4: Checking for embedded workflow on dashboard...');
  await page.goto('/dashboard');
  await page.waitForTimeout(2000);
  
  return await checkForWorkflowComponent(page);
}

async function checkForWorkflowComponent(page: any): Promise<boolean> {
  console.log('🔍 Checking for UnifiedBriefWorkflow component...');
  
  // Look for workflow-specific elements
  const workflowIndicators = [
    '[data-testid*="workflow"]',
    '[class*="workflow"]',
    '[id*="workflow"]',
    'input[type="file"]',
    '[class*="dropzone"]',
    '[data-testid*="drop"]',
    '*:has-text("Drag and drop")',
    '*:has-text("Upload brief")',
    '*:has-text("Step 1")',
    '*:has-text("Step 0")',
    '*:has-text("Motivations")',
    '*:has-text("Copy Generation")'
  ];
  
  for (const selector of workflowIndicators) {
    try {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 })) {
        console.log(`✅ Found workflow indicator: ${selector}`);
        return true;
      }
    } catch (e) {
      // Continue checking
    }
  }
  
  // Check for dialog containing workflow
  const dialogs = await page.locator('[role="dialog"], .MuiDialog-root').all();
  for (let i = 0; i < dialogs.length; i++) {
    const dialog = dialogs[i];
    if (await dialog.isVisible()) {
      console.log(`💬 Found visible dialog ${i + 1}, checking for workflow...`);
      
      const dialogText = await dialog.textContent();
      if (dialogText && (
        dialogText.includes('workflow') ||
        dialogText.includes('upload') ||
        dialogText.includes('brief') ||
        dialogText.includes('motivation')
      )) {
        console.log('✅ Dialog contains workflow content!');
        return true;
      }
    }
  }
  
  console.log('❌ No workflow component found');
  return false;
}

async function testWorkflowIfFound(page: any) {
  console.log('🧪 Testing workflow component...');
  
  const hasWorkflow = await checkForWorkflowComponent(page);
  
  if (!hasWorkflow) {
    console.log('⚠️ No workflow component found to test');
    return;
  }
  
  console.log('✅ Workflow component found! Starting comprehensive test...');
  
  // Take screenshot of workflow
  await page.screenshot({ path: 'tests/screenshots/workflow-found.png', fullPage: true });
  
  // Test file upload if available
  const fileInputs = await page.locator('input[type="file"]').all();
  if (fileInputs.length > 0) {
    console.log('📁 Testing file upload...');
    
    try {
      // Create a test file
      const testFileContent = `
# Test Brief

## Campaign Objective
Create engaging social media content for a tech startup.

## Target Audience
Young professionals aged 25-35 interested in productivity tools.

## Key Messages
- Boost productivity
- Save time
- Easy to use
- Professional results

## Platforms
- Instagram
- LinkedIn
- Twitter

## Timeline
Launch next week
      `;
      
      // Create a file handle
      const fileHandle = await page.evaluateHandle((content) => {
        const file = new File([content], 'test-brief.md', { type: 'text/markdown' });
        return file;
      }, testFileContent);
      
      // Upload the file
      await fileInputs[0].setInputFiles([fileHandle]);
      console.log('✅ Test file uploaded');
      
      // Wait for processing
      await page.waitForTimeout(5000);
      
      // Take screenshot after upload
      await page.screenshot({ path: 'tests/screenshots/after-file-upload.png', fullPage: true });
      
    } catch (error) {
      console.log('⚠️ File upload failed:', error);
    }
  }
  
  // Monitor workflow state for 15 seconds
  console.log('⏱️ Monitoring workflow state...');
  
  for (let i = 0; i < 15; i++) {
    await page.waitForTimeout(1000);
    
    const currentState = await page.evaluate(() => {
      const state = sessionStorage.getItem('airwave_unified_workflow_state');
      return state ? JSON.parse(state) : null;
    });
    
    if (currentState) {
      console.log(`⏱️ Second ${i + 1}: Step ${currentState.activeStep} (briefConfirmed: ${currentState.briefConfirmed})`);
    } else {
      console.log(`⏱️ Second ${i + 1}: No workflow state`);
    }
    
    // Try to interact with workflow elements
    if (i === 5) {
      await interactWithWorkflowElements(page);
    }
    
    if (i === 10) {
      await interactWithWorkflowElements(page);
    }
  }
  
  // Generate final report
  const report = await page.evaluate(() => (window as any).workflowTracker?.getReport() || {});
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 WORKFLOW TEST REPORT');
  console.log('='.repeat(50));
  console.log('📊 State changes:', report.stateCount || 0);
  console.log('🔔 Events:', report.eventCount || 0);
  
  if (report.states && report.states.length > 0) {
    console.log('\n📈 State progression:');
    report.states.forEach((entry: any, index: number) => {
      console.log(`  ${index + 1}. Step ${entry.data.step} (${entry.data.source})`);
    });
    
    // Check for resets
    const resets = report.states.filter((entry: any, index: number) => {
      if (index === 0) return false;
      const prevEntry = report.states[index - 1];
      return prevEntry.data.step > 0 && entry.data.step === 0;
    });
    
    if (resets.length > 0) {
      console.log(`\n🚨 STATE RESETS DETECTED: ${resets.length}`);
    } else {
      console.log('\n✅ No state resets detected');
    }
  }
  
  console.log('='.repeat(50));
}

async function interactWithWorkflowElements(page: any) {
  console.log('🎯 Attempting workflow interactions...');
  
  // Try to click buttons
  const buttons = await page.locator('button').filter({ 
    hasText: /next|continue|generate|upload|select|create/i 
  }).all();
  
  for (let i = 0; i < Math.min(buttons.length, 3); i++) {
    try {
      const button = buttons[i];
      if (await button.isVisible() && await button.isEnabled()) {
        const text = await button.textContent();
        console.log(`🎯 Clicking button: "${text}"`);
        await button.click();
        await page.waitForTimeout(2000);
        break; // Only click one button per interaction
      }
    } catch (error) {
      console.log('⚠️ Button click failed');
    }
  }
  
  // Try to click on cards or selectable elements
  const cards = await page.locator('[role="button"], .MuiPaper-root, .card').all();
  
  for (let i = 0; i < Math.min(cards.length, 2); i++) {
    try {
      const card = cards[i];
      if (await card.isVisible()) {
        console.log(`🎯 Clicking card ${i + 1}`);
        await card.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('⚠️ Card click failed');
    }
  }
}
