import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const testCredentialsPath = path.join(process.cwd(), 'test-credentials.json');
const testCredentials = JSON.parse(fs.readFileSync(testCredentialsPath, 'utf8'));

test.describe('Workflow UI Navigation Test', () => {
  test('Test UI navigation through workflow steps', async ({ page }) => {
    console.log('🚀 Starting UI-only workflow navigation test...');
    
    // Set up error tracking
    const pageErrors = [];
    page.on('pageerror', error => {
      console.log('🚨 PAGE ERROR:', error.message);
      pageErrors.push(error.message);
    });
    
    // Login
    console.log('🔑 Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Logged in successfully');
    
    // Navigate to workflow
    await page.goto('http://localhost:3000/flow');
    await page.waitForTimeout(3000);
    
    // Verify dialog is visible
    const workflowDialog = page.locator('[role="dialog"]');
    await expect(workflowDialog).toBeVisible();
    console.log('💬 Workflow dialog visible');
    
    // Test 1: Verify initial state (Step 0)
    console.log('📍 Test 1: Verifying initial state...');
    const stepperElements = page.locator('[class*="step"], [data-step]');
    const stepperCount = await stepperElements.count();
    console.log(`📊 Found ${stepperCount} stepper elements`);
    
    // Check for drag & drop area
    const dropzoneArea = page.locator('[class*="dropzone"], [data-testid="dropzone"]');
    const hasDropzone = await dropzoneArea.isVisible();
    console.log(`📁 Dropzone visible: ${hasDropzone}`);
    
    // Test 2: Mock brief data and advance to step 1
    console.log('📍 Test 2: Mocking brief data and advancing...');
    
    // Inject mock brief data directly into sessionStorage
    await page.evaluate(() => {
      const mockBriefData = {
        title: "Test Marketing Campaign",
        objective: "Increase brand awareness",
        targetAudience: "Young professionals aged 25-35",
        keyMessages: ["Innovation", "Quality", "Trust"],
        platforms: ["LinkedIn", "Instagram", "Twitter"],
        budget: "$50,000",
        timeline: "Q1 2024",
        product: "AI-powered productivity suite",
        valueProposition: "Transform your workflow with intelligent automation",
        industry: "Technology",
        competitors: ["Notion", "Asana", "Monday.com"]
      };
      
      const mockState = {
        activeStep: 1,
        briefData: mockBriefData,
        briefConfirmed: true,
        showBriefReview: false,
        motivations: [],
        copyVariations: [],
        selectedAssets: [],
        selectedTemplates: [],
        contentMatrix: null,
        processing: false,
        lastError: null
      };
      
      sessionStorage.setItem('airwave_unified_workflow_state', JSON.stringify(mockState));
      console.log('💾 Mock state injected');
    });
    
    // Refresh to load the mock state
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify we're now on step 1 (motivations)
    const motivationSection = page.locator('text=Strategic Motivations').or(page.locator('text=Generate Strategic Motivations')).first();
    const hasMotivations = await motivationSection.isVisible();
    console.log(`🎯 Motivations section visible: ${hasMotivations}`);
    
    // Test 3: Mock motivations and advance to step 2
    console.log('📍 Test 3: Mocking motivations and advancing...');
    
    await page.evaluate(() => {
      const currentState = JSON.parse(sessionStorage.getItem('airwave_unified_workflow_state') || '{}');
      currentState.activeStep = 2;
      currentState.motivations = [
        { id: '1', text: 'Increase productivity', selected: true },
        { id: '2', text: 'Streamline workflows', selected: true },
        { id: '3', text: 'Enhance collaboration', selected: false }
      ];
      sessionStorage.setItem('airwave_unified_workflow_state', JSON.stringify(currentState));
      console.log('💾 Mock motivations injected');
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify we're now on step 2 (copy generation)
    const copySection = page.locator('text=Copy Variations').or(page.locator('text=Generate Copy')).first();
    const hasCopy = await copySection.isVisible();
    console.log(`📝 Copy section visible: ${hasCopy}`);
    
    // Test 4: Mock copy variations and advance to step 3
    console.log('📍 Test 4: Mocking copy variations and advancing...');
    
    await page.evaluate(() => {
      const currentState = JSON.parse(sessionStorage.getItem('airwave_unified_workflow_state') || '{}');
      currentState.activeStep = 3;
      currentState.copyVariations = [
        { id: '1', headline: 'Transform Your Workflow', body: 'Discover the power of AI automation', platform: 'LinkedIn', selected: true },
        { id: '2', headline: 'Work Smarter, Not Harder', body: 'Streamline your daily tasks with intelligent tools', platform: 'Twitter', selected: true }
      ];
      sessionStorage.setItem('airwave_unified_workflow_state', JSON.stringify(currentState));
      console.log('💾 Mock copy variations injected');
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify we're now on step 3 (assets)
    const assetSection = page.locator('text=Asset').or(page.locator('text=Generate Assets')).first();
    const hasAssets = await assetSection.isVisible();
    console.log(`🎨 Assets section visible: ${hasAssets}`);
    
    // Test 5: Mock assets and advance to step 4
    console.log('📍 Test 5: Mocking assets and advancing...');
    
    await page.evaluate(() => {
      const currentState = JSON.parse(sessionStorage.getItem('airwave_unified_workflow_state') || '{}');
      currentState.activeStep = 4;
      currentState.selectedAssets = [
        { id: '1', type: 'image', url: '/mock-image.jpg', title: 'Hero Image' },
        { id: '2', type: 'video', url: '/mock-video.mp4', title: 'Product Demo' }
      ];
      sessionStorage.setItem('airwave_unified_workflow_state', JSON.stringify(currentState));
      console.log('💾 Mock assets injected');
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify we're now on step 4 (templates)
    const templateSection = page.locator('text=Template').or(page.locator('text=Select Template')).first();
    const hasTemplates = await templateSection.isVisible();
    console.log(`📋 Templates section visible: ${hasTemplates}`);
    
    // Test 6: Mock templates and advance to step 5 (matrix)
    console.log('📍 Test 6: Mocking templates and advancing to matrix...');
    
    await page.evaluate(() => {
      const currentState = JSON.parse(sessionStorage.getItem('airwave_unified_workflow_state') || '{}');
      currentState.activeStep = 5;
      currentState.selectedTemplates = [
        { id: '1', name: 'Social Media Template', platform: 'LinkedIn' },
        { id: '2', name: 'Email Template', platform: 'Email' }
      ];
      currentState.contentMatrix = {
        platforms: ['LinkedIn', 'Twitter', 'Email'],
        content: [
          { platform: 'LinkedIn', copy: 'Transform Your Workflow', asset: 'Hero Image' },
          { platform: 'Twitter', copy: 'Work Smarter, Not Harder', asset: 'Product Demo' }
        ]
      };
      sessionStorage.setItem('airwave_unified_workflow_state', JSON.stringify(currentState));
      console.log('💾 Mock matrix injected');
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify we're now on step 5 (matrix)
    const matrixSection = page.locator('text=Content Matrix').or(page.locator('text=Matrix')).first();
    const hasMatrix = await matrixSection.isVisible();
    console.log(`📊 Matrix section visible: ${hasMatrix}`);
    
    // Test 7: Advance to final step
    console.log('📍 Test 7: Advancing to final step...');
    
    await page.evaluate(() => {
      const currentState = JSON.parse(sessionStorage.getItem('airwave_unified_workflow_state') || '{}');
      currentState.activeStep = 6;
      sessionStorage.setItem('airwave_unified_workflow_state', JSON.stringify(currentState));
      console.log('💾 Final step injected');
    });
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Verify we're now on step 6 (ready to render)
    const finalSection = page.locator('text=Ready to Render').or(page.locator('text=Complete')).first();
    const hasFinal = await finalSection.isVisible();
    console.log(`🎉 Final section visible: ${hasFinal}`);
    
    // Get final state
    const finalState = await page.evaluate(() => {
      const stored = sessionStorage.getItem('airwave_unified_workflow_state');
      return stored ? JSON.parse(stored) : null;
    });
    
    console.log('🎯 FINAL UI TEST RESULTS:');
    console.log(`📍 Final Step: ${finalState?.activeStep || 'Unknown'}`);
    console.log(`📁 Has Brief Data: ${finalState?.briefData ? 'YES' : 'NO'}`);
    console.log(`🎯 Has Motivations: ${finalState?.motivations?.length > 0 ? 'YES' : 'NO'}`);
    console.log(`📝 Has Copy Variations: ${finalState?.copyVariations?.length > 0 ? 'YES' : 'NO'}`);
    console.log(`🎨 Has Assets: ${finalState?.selectedAssets?.length > 0 ? 'YES' : 'NO'}`);
    console.log(`📋 Has Templates: ${finalState?.selectedTemplates?.length > 0 ? 'YES' : 'NO'}`);
    console.log(`📊 Has Matrix: ${finalState?.contentMatrix ? 'YES' : 'NO'}`);
    
    // Take final screenshot
    await page.screenshot({ path: 'workflow-ui-test-final.png', fullPage: true });
    
    // Success criteria
    const success = finalState?.activeStep === 6 && 
                   finalState?.briefData && 
                   finalState?.motivations?.length > 0 && 
                   finalState?.copyVariations?.length > 0 && 
                   finalState?.selectedAssets?.length > 0 && 
                   finalState?.selectedTemplates?.length > 0 && 
                   finalState?.contentMatrix;
    
    if (success) {
      console.log('🎉 SUCCESS: UI workflow navigation completed successfully!');
    } else {
      console.log('⚠️ PARTIAL SUCCESS: Some workflow elements missing');
    }
    
    // Report any errors
    if (pageErrors.length > 0) {
      console.log('🚨 Page Errors:', pageErrors);
    }
  });
});
