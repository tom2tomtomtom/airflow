import { test, expect, Page } from '@playwright/test';
import path from 'path';

/**
 * Complete UI Workflow Testing with Playwright
 * Tests all workflow functions and identifies state reset issues
 */

test.describe('AIRWAVE Complete UI Workflow Testing', () => {
  let page: Page;
  
  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    
    // Connect to existing development server
    await page.goto('http://127.0.0.1:54278');
    await page.waitForLoadState('networkidle');
    
    // Clear any existing state
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    
    console.log('🧪 UI Test setup complete - connected to dev server');
  });

  test('Complete Workflow State Testing', async () => {
    console.log('🚀 Starting complete workflow UI test...');
    
    // Inject comprehensive state tracking
    await page.addScriptTag({
      content: `
        window.workflowStateTracker = {
          logs: [],
          componentInstances: new Map(),
          stateChanges: [],
          apiCalls: [],
          errors: [],
          
          log: function(type, message, data = null) {
            const entry = {
              timestamp: Date.now(),
              type,
              message,
              data: data ? JSON.parse(JSON.stringify(data)) : null
            };
            this.logs.push(entry);
            console.log(\`🔧 [\${type}] \${message}\`, data);
          },
          
          trackComponent: function(id, action, step = null) {
            if (action === 'mount') {
              this.componentInstances.set(id, { mountTime: Date.now(), step });
              this.log('COMPONENT', \`Component mounted: \${id}\`, { totalInstances: this.componentInstances.size, step });
            } else if (action === 'unmount') {
              this.componentInstances.delete(id);
              this.log('COMPONENT', \`Component unmounted: \${id}\`, { totalInstances: this.componentInstances.size });
            }
          },
          
          trackState: function(newState, source, oldState = null) {
            this.stateChanges.push({
              timestamp: Date.now(),
              newState: JSON.parse(JSON.stringify(newState)),
              oldState: oldState ? JSON.parse(JSON.stringify(oldState)) : null,
              source
            });
            this.log('STATE', \`State changed from \${source}\`, { 
              step: newState.activeStep, 
              briefConfirmed: newState.briefConfirmed,
              motivationsCount: newState.motivations?.length || 0,
              copyCount: newState.copyVariations?.length || 0
            });
          },
          
          trackAPI: function(url, method, status, duration) {
            this.apiCalls.push({
              timestamp: Date.now(),
              url, method, status, duration
            });
            this.log('API', \`\${method} \${url} - \${status}\`, { duration });
          },
          
          trackError: function(error, context) {
            this.errors.push({
              timestamp: Date.now(),
              error: error.toString(),
              context
            });
            this.log('ERROR', error.toString(), context);
          },
          
          getReport: function() {
            return {
              summary: {
                totalLogs: this.logs.length,
                componentInstances: this.componentInstances.size,
                stateChanges: this.stateChanges.length,
                apiCalls: this.apiCalls.length,
                errors: this.errors.length
              },
              componentInstances: Array.from(this.componentInstances.entries()),
              stateChanges: this.stateChanges,
              apiCalls: this.apiCalls,
              errors: this.errors,
              logs: this.logs
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
              window.workflowStateTracker.trackState(state, 'sessionStorage.setItem');
            } catch (e) {
              window.workflowStateTracker.trackError(e, 'sessionStorage.setItem parse error');
            }
          }
          return originalSetItem.call(this, key, value);
        };
        
        sessionStorage.getItem = function(key) {
          const value = originalGetItem.call(this, key);
          if (key === 'airwave_unified_workflow_state' && value) {
            window.workflowStateTracker.log('STORAGE', 'Retrieved state from sessionStorage', { hasValue: !!value });
          }
          return value;
        };
        
        sessionStorage.removeItem = function(key) {
          if (key === 'airwave_unified_workflow_state') {
            window.workflowStateTracker.log('STORAGE', 'Removed state from sessionStorage');
          }
          return originalRemoveItem.call(this, key);
        };
        
        // Track API calls
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          const startTime = Date.now();
          const url = args[0];
          const options = args[1] || {};
          const method = options.method || 'GET';
          
          return originalFetch.apply(this, args).then(response => {
            const duration = Date.now() - startTime;
            window.workflowStateTracker.trackAPI(url, method, response.status, duration);
            return response;
          }).catch(error => {
            const duration = Date.now() - startTime;
            window.workflowStateTracker.trackAPI(url, method, 'ERROR', duration);
            window.workflowStateTracker.trackError(error, 'fetch error');
            throw error;
          });
        };
        
        window.workflowStateTracker.log('INIT', 'State tracking initialized');
      `
    });

    // Step 1: Find and open workflow
    console.log('🔍 Step 1: Finding workflow trigger...');
    
    const workflowSelectors = [
      'text=Create Campaign',
      'text=Start Workflow',
      'text=New Campaign',
      'button:has-text("Create")',
      'button:has-text("Campaign")',
      '[data-testid="workflow-trigger"]'
    ];
    
    let workflowButton = null;
    for (const selector of workflowSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          workflowButton = element;
          console.log(`✅ Found workflow trigger: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    // If no specific trigger found, look for any button with relevant text
    if (!workflowButton) {
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        if (text && (
          text.toLowerCase().includes('create') ||
          text.toLowerCase().includes('workflow') ||
          text.toLowerCase().includes('campaign') ||
          text.toLowerCase().includes('start')
        )) {
          workflowButton = button;
          console.log(`✅ Found workflow trigger by text: "${text}"`);
          break;
        }
      }
    }
    
    expect(workflowButton).toBeTruthy();
    await workflowButton.click();
    console.log('🎯 Clicked workflow trigger');
    
    // Wait for dialog to appear
    await page.waitForTimeout(2000);
    
    // Step 2: Verify dialog opened and check initial state
    console.log('🔍 Step 2: Verifying dialog opened...');
    
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });
    console.log('✅ Workflow dialog opened');
    
    // Get initial state report
    const initialReport = await page.evaluate(() => window.workflowStateTracker.getReport());
    console.log('📊 Initial state:', initialReport.summary);
    
    // Step 3: Test file upload functionality
    console.log('🔍 Step 3: Testing file upload...');
    
    const fileInputSelectors = [
      'input[type="file"]',
      '[data-testid="dropzone"]',
      '.dropzone'
    ];
    
    let fileInput = null;
    for (const selector of fileInputSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 2000 })) {
          fileInput = element;
          console.log(`✅ Found file input: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (fileInput) {
      // Test file upload
      const testFilePath = path.join(__dirname, 'fixtures', 'test-brief.pdf');
      
      try {
        if (await fileInput.getAttribute('type') === 'file') {
          await fileInput.setInputFiles(testFilePath);
          console.log('📄 File uploaded via input');
        } else {
          // Simulate drag and drop
          await page.evaluate(() => {
            const dropzone = document.querySelector('[data-testid="dropzone"]') || 
                            document.querySelector('.dropzone');
            if (dropzone) {
              const file = new File(['test brief content'], 'test-brief.pdf', { type: 'application/pdf' });
              const dataTransfer = new DataTransfer();
              dataTransfer.items.add(file);
              
              const dropEvent = new DragEvent('drop', { dataTransfer });
              dropzone.dispatchEvent(dropEvent);
            }
          });
          console.log('📄 File uploaded via drag/drop simulation');
        }
        
        // Wait for file processing
        await page.waitForTimeout(5000);
        
      } catch (error) {
        console.log('⚠️ File upload failed:', error.message);
      }
    }
    
    // Step 4: Monitor workflow progression
    console.log('🔍 Step 4: Monitoring workflow progression...');
    
    const progressionSteps = [
      { step: 0, name: 'File Upload', selector: 'text=Drop files here' },
      { step: 1, name: 'Motivations', selector: 'text=Select motivations' },
      { step: 2, name: 'Copy Generation', selector: 'text=Generate copy' },
      { step: 3, name: 'Assets', selector: 'text=Select assets' },
      { step: 4, name: 'Templates', selector: 'text=Choose template' },
      { step: 5, name: 'Matrix', selector: 'text=Content matrix' },
      { step: 6, name: 'Ready', selector: 'text=Ready to render' }
    ];
    
    for (let i = 0; i < 60; i++) { // Monitor for 60 seconds
      await page.waitForTimeout(1000);
      
      const currentState = await page.evaluate(() => {
        const state = sessionStorage.getItem('airwave_unified_workflow_state');
        return state ? JSON.parse(state) : null;
      });
      
      if (currentState) {
        const stepInfo = progressionSteps[currentState.activeStep] || { name: 'Unknown' };
        console.log(`📊 Second ${i + 1}: Step ${currentState.activeStep} (${stepInfo.name})`);
        
        // Try to interact with current step
        await this.interactWithCurrentStep(page, currentState.activeStep);
      }
      
      // Check for state resets
      if (i > 10 && currentState && currentState.activeStep === 0) {
        const report = await page.evaluate(() => window.workflowStateTracker.getReport());
        const recentStateChanges = report.stateChanges.slice(-5);
        console.log('🚨 POTENTIAL STATE RESET DETECTED');
        console.log('Recent state changes:', recentStateChanges);
      }
    }
    
    // Step 5: Generate comprehensive report
    console.log('🔍 Step 5: Generating final report...');
    
    const finalReport = await page.evaluate(() => window.workflowStateTracker.getReport());
    
    console.log('📋 COMPREHENSIVE TEST REPORT');
    console.log('============================');
    console.log('Summary:', finalReport.summary);
    console.log('Component Instances:', finalReport.componentInstances);
    console.log('State Changes:', finalReport.stateChanges.length);
    console.log('API Calls:', finalReport.apiCalls.length);
    console.log('Errors:', finalReport.errors.length);
    
    // Analyze for issues
    const issues = this.analyzeIssues(finalReport);
    console.log('🔍 ISSUES DETECTED:', issues);
    
    // Assertions
    expect(finalReport.summary.componentInstances).toBeLessThanOrEqual(1);
    expect(finalReport.errors.length).toBe(0);
    
    // Check for state resets
    const stateResets = finalReport.stateChanges.filter((change, index) => {
      if (index === 0) return false;
      const prevChange = finalReport.stateChanges[index - 1];
      return prevChange.newState.activeStep > 0 && change.newState.activeStep === 0;
    });
    
    if (stateResets.length > 0) {
      console.log('🚨 STATE RESETS DETECTED:', stateResets);
    }
    
    // Save detailed report
    await page.evaluate((report) => {
      localStorage.setItem('playwright_test_report', JSON.stringify(report, null, 2));
    }, finalReport);
    
    console.log('✅ Test completed - detailed report saved to localStorage');
  });

  // Helper method to interact with current workflow step
  async interactWithCurrentStep(page: Page, step: number) {
    try {
      switch (step) {
        case 0: // File upload
          // Already handled in main test
          break;
          
        case 1: // Motivations
          const motivationCards = page.locator('[data-testid="motivation-card"]');
          const motivationCount = await motivationCards.count();
          if (motivationCount > 0) {
            await motivationCards.first().click();
            console.log('🎯 Clicked motivation card');
          }
          
          const nextButton = page.locator('button:has-text("Next")');
          if (await nextButton.isVisible({ timeout: 1000 })) {
            await nextButton.click();
            console.log('🎯 Clicked Next button');
          }
          break;
          
        case 2: // Copy generation
          const generateButton = page.locator('button:has-text("Generate")');
          if (await generateButton.isVisible({ timeout: 1000 })) {
            await generateButton.click();
            console.log('🎯 Clicked Generate button');
          }
          break;
          
        case 3: // Assets
          const assetCards = page.locator('[data-testid="asset-card"]');
          const assetCount = await assetCards.count();
          if (assetCount > 0) {
            await assetCards.first().click();
            console.log('🎯 Clicked asset card');
          }
          break;
          
        case 4: // Templates
          const templateCards = page.locator('[data-testid="template-card"]');
          const templateCount = await templateCards.count();
          if (templateCount > 0) {
            await templateCards.first().click();
            console.log('🎯 Clicked template card');
          }
          break;
          
        case 5: // Matrix
          const continueButton = page.locator('button:has-text("Continue")');
          if (await continueButton.isVisible({ timeout: 1000 })) {
            await continueButton.click();
            console.log('🎯 Clicked Continue button');
          }
          break;
          
        case 6: // Ready
          console.log('✅ Reached final step');
          break;
      }
    } catch (error) {
      console.log(`⚠️ Error interacting with step ${step}:`, error.message);
    }
  }

  // Helper method to analyze issues in the report
  analyzeIssues(report: any) {
    const issues = [];
    
    // Check for multiple component instances
    if (report.summary.componentInstances > 1) {
      issues.push('Multiple component instances detected (memory leak)');
    }
    
    // Check for state resets
    const stateResets = report.stateChanges.filter((change: any, index: number) => {
      if (index === 0) return false;
      const prevChange = report.stateChanges[index - 1];
      return prevChange.newState.activeStep > 0 && change.newState.activeStep === 0;
    });
    
    if (stateResets.length > 0) {
      issues.push(`${stateResets.length} unexpected state resets detected`);
    }
    
    // Check for API errors
    const apiErrors = report.apiCalls.filter((call: any) => call.status === 'ERROR' || call.status >= 400);
    if (apiErrors.length > 0) {
      issues.push(`${apiErrors.length} API errors detected`);
    }
    
    // Check for JavaScript errors
    if (report.errors.length > 0) {
      issues.push(`${report.errors.length} JavaScript errors detected`);
    }
    
    return issues;
  }
});
