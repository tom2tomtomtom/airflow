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

test.describe('Direct Workflow Test', () => {
  test('Test UnifiedBriefWorkflow on /flow page', async ({ page }) => {
    console.log('🚀 Starting direct workflow test on /flow page...');
    
    if (!testCredentials) {
      console.log('❌ No test credentials available, skipping test');
      return;
    }
    
    // Login first
    console.log('🔑 Logging in...');
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', testCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', testCredentials.password);
    await page.locator('button[type="submit"], button:has-text("Sign In")').first().click();
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in, navigating to /flow...');
    
    // Navigate directly to flow page
    await page.goto('/flow');
    await page.waitForTimeout(3000);
    
    console.log('📍 Current URL:', page.url());
    
    // Inject comprehensive workflow tracking
    await injectWorkflowTracking(page);
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/flow-page-initial.png', fullPage: true });
    
    // Test the workflow component
    await testUnifiedBriefWorkflow(page);
    
    console.log('✅ Direct workflow test completed');
  });
});

async function injectWorkflowTracking(page: any) {
  console.log('🔧 Injecting comprehensive workflow tracking...');
  
  await page.addScriptTag({
    content: `
      window.workflowDebugger = {
        states: [],
        events: [],
        componentMounts: [],
        apiCalls: [],
        
        log: function(category, message, data = null) {
          const entry = {
            timestamp: Date.now(),
            category,
            message,
            data,
            url: window.location.href
          };
          
          this.events.push(entry);
          console.log(\`🔧 [\${category}] \${message}\`, data || '');
          
          // Store in sessionStorage for persistence
          try {
            const stored = JSON.parse(sessionStorage.getItem('workflow_debug_log') || '[]');
            stored.push(entry);
            sessionStorage.setItem('workflow_debug_log', JSON.stringify(stored.slice(-100))); // Keep last 100 entries
          } catch (e) {
            console.warn('Failed to store debug log');
          }
        },
        
        trackState: function(step, data) {
          const stateEntry = {
            timestamp: Date.now(),
            step,
            data,
            source: 'manual_track'
          };
          
          this.states.push(stateEntry);
          this.log('STATE', \`Step \${step}\`, data);
        },
        
        getReport: function() {
          return {
            states: this.states,
            events: this.events,
            componentMounts: this.componentMounts,
            apiCalls: this.apiCalls,
            totalEvents: this.events.length,
            stateChanges: this.states.length
          };
        }
      };
      
      // Monitor sessionStorage for workflow state changes
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = function(key, value) {
        if (key === 'airwave_unified_workflow_state') {
          try {
            const state = JSON.parse(value);
            window.workflowDebugger.trackState(state.activeStep, {
              briefConfirmed: state.briefConfirmed,
              hasUploadedFiles: state.uploadedFiles?.length > 0,
              source: 'sessionStorage.setItem'
            });
          } catch (e) {
            window.workflowDebugger.log('ERROR', 'Failed to parse workflow state', e.message);
          }
        }
        return originalSetItem.call(this, key, value);
      };
      
      // Monitor component lifecycle
      const originalConsoleLog = console.log;
      console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('UnifiedBriefWorkflow') || message.includes('workflow')) {
          window.workflowDebugger.log('COMPONENT', message);
        }
        return originalConsoleLog.apply(console, args);
      };
      
      // Monitor fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        window.workflowDebugger.log('API', \`Fetch: \${url}\`);
        
        return originalFetch.apply(this, args).then(response => {
          window.workflowDebugger.log('API', \`Response: \${url} - \${response.status}\`);
          return response;
        }).catch(error => {
          window.workflowDebugger.log('API_ERROR', \`Error: \${url}\`, error.message);
          throw error;
        });
      };
      
      window.workflowDebugger.log('INIT', 'Workflow tracking initialized');
    `
  });
}

async function testUnifiedBriefWorkflow(page: any) {
  console.log('🧪 Testing UnifiedBriefWorkflow component...');
  
  // Wait for the component to load
  await page.waitForTimeout(2000);
  
  // Check if workflow dialog is visible
  const workflowDialog = page.locator('[role="dialog"]').first();
  const isDialogVisible = await workflowDialog.isVisible({ timeout: 5000 }).catch(() => false);
  
  console.log(`💬 Workflow dialog visible: ${isDialogVisible}`);
  
  if (isDialogVisible) {
    await page.screenshot({ path: 'tests/screenshots/workflow-dialog-open.png', fullPage: true });
    await testWorkflowSteps(page);
  } else {
    // Try to open the workflow
    console.log('🎯 Trying to open workflow...');
    
    const startButton = page.locator('button').filter({ hasText: /start.*flow|open.*workflow/i }).first();
    const isStartButtonVisible = await startButton.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (isStartButtonVisible) {
      console.log('🎯 Clicking Start Flow button...');
      await startButton.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'tests/screenshots/after-start-button.png', fullPage: true });
      
      // Check again for dialog
      const dialogAfterClick = await workflowDialog.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`💬 Dialog visible after start button: ${dialogAfterClick}`);
      
      if (dialogAfterClick) {
        await testWorkflowSteps(page);
      }
    } else {
      console.log('⚠️ No Start Flow button found, checking for embedded workflow...');
      await testEmbeddedWorkflow(page);
    }
  }
  
  // Monitor workflow state for 30 seconds
  console.log('⏱️ Monitoring workflow state changes...');
  await monitorWorkflowState(page, 30);
  
  // Generate final report
  await generateWorkflowReport(page);
}

async function testWorkflowSteps(page: any) {
  console.log('📋 Testing workflow steps...');
  
  // Step 0: File Upload
  console.log('📁 Testing Step 0: File Upload...');
  await testFileUpload(page);
  
  // Step 1: Motivations
  console.log('💡 Testing Step 1: Motivations...');
  await testMotivations(page);
  
  // Step 2: Copy Generation
  console.log('✍️ Testing Step 2: Copy Generation...');
  await testCopyGeneration(page);
  
  // Step 3: Asset Selection
  console.log('🖼️ Testing Step 3: Asset Selection...');
  await testAssetSelection(page);
  
  // Step 4: Template Selection
  console.log('📋 Testing Step 4: Template Selection...');
  await testTemplateSelection(page);
  
  // Step 5: Content Matrix
  console.log('📊 Testing Step 5: Content Matrix...');
  await testContentMatrix(page);
  
  // Step 6: Ready to Render
  console.log('🎯 Testing Step 6: Ready to Render...');
  await testReadyToRender(page);
}

async function testFileUpload(page: any) {
  const fileInputs = await page.locator('input[type="file"]').all();
  const dropzones = await page.locator('[class*="dropzone"], [data-testid*="drop"]').all();
  
  console.log(`📁 Found ${fileInputs.length} file inputs and ${dropzones.length} dropzones`);
  
  if (fileInputs.length > 0 || dropzones.length > 0) {
    await page.screenshot({ path: 'tests/screenshots/step-0-file-upload.png', fullPage: true });
    
    // Try to upload a test file
    if (fileInputs.length > 0) {
      try {
        console.log('📁 Attempting file upload...');
        
        // Create test file content
        const testBriefContent = `
# Test Marketing Brief

## Campaign Objective
Create engaging social media content for a tech startup launching a new productivity app.

## Target Audience
- Young professionals aged 25-35
- Tech-savvy individuals
- Remote workers and freelancers
- Small business owners

## Key Messages
- Boost productivity by 50%
- Save 2+ hours per day
- Easy to use interface
- Seamless team collaboration
- Affordable pricing

## Platforms
- Instagram (Stories, Posts, Reels)
- LinkedIn (Articles, Posts)
- Twitter (Threads, Posts)
- Facebook (Posts, Stories)

## Content Themes
1. Productivity tips and hacks
2. Success stories and testimonials
3. Behind-the-scenes content
4. Educational tutorials
5. Industry insights

## Timeline
- Launch: Next Monday
- Campaign duration: 4 weeks
- Content frequency: Daily posts

## Budget
- Total budget: $5,000
- Paid advertising: $3,000
- Content creation: $2,000

## Success Metrics
- Engagement rate > 5%
- Click-through rate > 2%
- Sign-ups > 1,000
- App downloads > 5,000

## Brand Guidelines
- Use brand colors: Blue (#1E88E5), White (#FFFFFF)
- Maintain professional yet friendly tone
- Include logo in all visual content
- Use consistent hashtags: #ProductivityApp #TechStartup
        `;
        
        // Create a file handle
        const fileHandle = await page.evaluateHandle((content) => {
          const file = new File([content], 'test-marketing-brief.md', { 
            type: 'text/markdown',
            lastModified: Date.now()
          });
          return file;
        }, testBriefContent);
        
        // Upload the file
        await fileInputs[0].setInputFiles([fileHandle]);
        console.log('✅ Test file uploaded successfully');
        
        // Wait for processing
        await page.waitForTimeout(5000);
        
        // Take screenshot after upload
        await page.screenshot({ path: 'tests/screenshots/after-file-upload.png', fullPage: true });
        
        // Check for processing indicators
        const processingIndicators = await page.locator('*').filter({ 
          hasText: /processing|analyzing|uploading|loading/i 
        }).all();
        
        console.log(`⏳ Found ${processingIndicators.length} processing indicators`);
        
        // Wait for processing to complete (up to 15 seconds)
        for (let i = 0; i < 15; i++) {
          await page.waitForTimeout(1000);
          
          const stillProcessing = await page.locator('*').filter({ 
            hasText: /processing|analyzing|uploading/i 
          }).count();
          
          if (stillProcessing === 0) {
            console.log(`✅ Processing completed after ${i + 1} seconds`);
            break;
          }
          
          console.log(`⏳ Still processing... (${i + 1}/15)`);
        }
        
        await page.screenshot({ path: 'tests/screenshots/after-processing.png', fullPage: true });
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log('⚠️ File upload failed:', error);
      }
    }
  } else {
    console.log('⚠️ No file upload elements found');
  }
}

async function testMotivations(page: any) {
  const motivationElements = await page.locator('*').filter({ 
    hasText: /motivation|objective|goal/i 
  }).all();
  
  console.log(`💡 Found ${motivationElements.length} motivation-related elements`);
  
  // Look for selectable motivation cards or buttons
  const motivationCards = await page.locator('[role="button"], .MuiPaper-root, .card').filter({
    hasText: /awareness|engagement|conversion|retention/i
  }).all();
  
  if (motivationCards.length > 0) {
    console.log(`💡 Found ${motivationCards.length} motivation cards, selecting first one...`);
    await motivationCards[0].click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/step-1-motivations.png', fullPage: true });
  }
}

async function testCopyGeneration(page: any) {
  const generateButtons = await page.locator('button').filter({ 
    hasText: /generate|create.*copy|ai.*generate/i 
  }).all();
  
  console.log(`✍️ Found ${generateButtons.length} generate buttons`);
  
  if (generateButtons.length > 0) {
    console.log('✍️ Clicking generate button...');
    await generateButtons[0].click();
    await page.waitForTimeout(5000); // Wait longer for AI generation
    await page.screenshot({ path: 'tests/screenshots/step-2-copy-generation.png', fullPage: true });
  }
}

async function testAssetSelection(page: any) {
  const assetElements = await page.locator('*').filter({ 
    hasText: /asset|image|video|media/i 
  }).all();
  
  console.log(`🖼️ Found ${assetElements.length} asset-related elements`);
  
  // Look for asset selection cards
  const assetCards = await page.locator('[role="button"], .MuiPaper-root').filter({
    hasText: /stock.*photo|custom.*asset|video|image/i
  }).all();
  
  if (assetCards.length > 0) {
    console.log(`🖼️ Selecting first asset option...`);
    await assetCards[0].click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/step-3-asset-selection.png', fullPage: true });
  }
}

async function testTemplateSelection(page: any) {
  const templateElements = await page.locator('*').filter({ 
    hasText: /template|layout|design/i 
  }).all();
  
  console.log(`📋 Found ${templateElements.length} template-related elements`);
  
  // Look for template cards
  const templateCards = await page.locator('[role="button"], .MuiPaper-root').filter({
    hasText: /template|layout|design|style/i
  }).all();
  
  if (templateCards.length > 0) {
    console.log(`📋 Selecting first template...`);
    await templateCards[0].click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'tests/screenshots/step-4-template-selection.png', fullPage: true });
  }
}

async function testContentMatrix(page: any) {
  const matrixElements = await page.locator('*').filter({ 
    hasText: /matrix|summary|review/i 
  }).all();
  
  console.log(`📊 Found ${matrixElements.length} matrix-related elements`);
  await page.screenshot({ path: 'tests/screenshots/step-5-content-matrix.png', fullPage: true });
}

async function testReadyToRender(page: any) {
  const renderElements = await page.locator('*').filter({ 
    hasText: /render|execute|launch|complete/i 
  }).all();
  
  console.log(`🎯 Found ${renderElements.length} render-related elements`);
  
  const executeButtons = await page.locator('button').filter({ 
    hasText: /execute|render|launch|complete/i 
  }).all();
  
  if (executeButtons.length > 0) {
    console.log(`🎯 Found execute button, taking screenshot...`);
    await page.screenshot({ path: 'tests/screenshots/step-6-ready-to-render.png', fullPage: true });
  }
}

async function testEmbeddedWorkflow(page: any) {
  console.log('🔍 Testing embedded workflow elements...');
  
  // Look for any workflow-related elements on the page
  const workflowElements = await page.locator('*').filter({
    hasText: /upload|drag.*drop|brief|step|workflow/i
  }).all();
  
  console.log(`🔍 Found ${workflowElements.length} potential workflow elements`);
  
  if (workflowElements.length > 0) {
    await page.screenshot({ path: 'tests/screenshots/embedded-workflow.png', fullPage: true });
    
    // Try to interact with the first few elements
    for (let i = 0; i < Math.min(workflowElements.length, 3); i++) {
      const element = workflowElements[i];
      if (await element.isVisible()) {
        const text = await element.textContent();
        console.log(`🔍 Workflow element ${i + 1}: "${text?.substring(0, 50)}"`);
      }
    }
  }
}

async function monitorWorkflowState(page: any, durationSeconds: number) {
  console.log(`⏱️ Monitoring workflow state for ${durationSeconds} seconds...`);
  
  for (let i = 0; i < durationSeconds; i++) {
    await page.waitForTimeout(1000);
    
    // Check current workflow state
    const currentState = await page.evaluate(() => {
      const state = sessionStorage.getItem('airwave_unified_workflow_state');
      return state ? JSON.parse(state) : null;
    });
    
    if (currentState) {
      console.log(`⏱️ ${i + 1}s: Step ${currentState.activeStep} (briefConfirmed: ${currentState.briefConfirmed})`);
    } else {
      console.log(`⏱️ ${i + 1}s: No workflow state`);
    }
    
    // Try random interactions every 10 seconds
    if (i > 0 && i % 10 === 0) {
      await tryRandomInteraction(page);
    }
  }
}

async function tryRandomInteraction(page: any) {
  console.log('🎲 Trying random interaction...');
  
  try {
    // Try to click a button
    const buttons = await page.locator('button').filter({
      hasText: /next|continue|generate|select|upload/i
    }).all();
    
    if (buttons.length > 0) {
      const randomButton = buttons[Math.floor(Math.random() * buttons.length)];
      if (await randomButton.isVisible() && await randomButton.isEnabled()) {
        const text = await randomButton.textContent();
        console.log(`🎲 Clicking random button: "${text}"`);
        await randomButton.click();
        await page.waitForTimeout(2000);
      }
    }
  } catch (error) {
    const message = getErrorMessage(error);
    console.log('🎲 Random interaction failed (expected)');
  }
}

async function generateWorkflowReport(page: any) {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 COMPREHENSIVE WORKFLOW TEST REPORT');
  console.log('='.repeat(60));
  
  // Get tracking data
  const report = await page.evaluate(() => (window as any).workflowDebugger?.getReport() || {});
  
  console.log(`📊 Total Events: ${report.totalEvents || 0}`);
  console.log(`📈 State Changes: ${report.stateChanges || 0}`);
  
  if (report.states && report.states.length > 0) {
    console.log('\n📈 WORKFLOW STATE PROGRESSION:');
    report.states.forEach((entry: any, index: number) => {
      console.log(`  ${index + 1}. Step ${entry.step} - ${entry.data.source} (${new Date(entry.timestamp).toLocaleTimeString()})`);
    });
    
    // Detect state resets
    const resets = report.states.filter((entry: any, index: number) => {
      if (index === 0) return false;
      const prevEntry = report.states[index - 1];
      return prevEntry.step > 0 && entry.step === 0;
    });
    
    if (resets.length > 0) {
      console.log(`\n🚨 STATE RESETS DETECTED: ${resets.length}`);
      resets.forEach((reset: any, index: number) => {
        console.log(`  Reset ${index + 1}: ${new Date(reset.timestamp).toLocaleTimeString()}`);
      });
    } else {
      console.log('\n✅ NO STATE RESETS DETECTED');
    }
  } else {
    console.log('\n⚠️ NO STATE CHANGES RECORDED');
  }
  
  if (report.events && report.events.length > 0) {
    console.log('\n🔔 RECENT EVENTS:');
    const recentEvents = report.events.slice(-10);
    recentEvents.forEach((event: any, index: number) => {
      console.log(`  ${index + 1}. [${event.category}] ${event.message}`);
    });
  }
  
  // Check final workflow state
  const finalState = await page.evaluate(() => {
    const state = sessionStorage.getItem('airwave_unified_workflow_state');
    return state ? JSON.parse(state) : null;
  });
  
  if (finalState) {
    console.log(`\n🏁 FINAL STATE: Step ${finalState.activeStep}`);
    console.log(`   Brief Confirmed: ${finalState.briefConfirmed}`);
    console.log(`   Uploaded Files: ${finalState.uploadedFiles?.length || 0}`);
  } else {
    console.log('\n🏁 NO FINAL STATE FOUND');
  }
  
  console.log('='.repeat(60));
  
  // Take final screenshot
  await page.screenshot({ path: 'tests/screenshots/final-workflow-state.png', fullPage: true });
}
