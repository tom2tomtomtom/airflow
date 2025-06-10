import { test, expect } from '@playwright/test';

test.describe('Simple Flow Analysis', () => {
  test('Examine Flow Page DOM Structure', async ({ page }) => {
    console.log('🔍 Starting simple flow analysis...');
    
    await page.goto('/flow', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/flow-simple-1-initial.png',
      fullPage: true 
    });
    
    console.log('📄 Flow page loaded');
    console.log(`Page title: ${await page.title()}`);
    
    // Get basic page structure
    const bodyHTML = await page.locator('body').innerHTML();
    
    // Look for key components by checking what's actually rendered
    console.log('\n=== BASIC STRUCTURE ===');
    
    // Check for main workflow containers
    const mainContainers = await page.locator('main, .main, #main, [role="main"]').count();
    console.log(`Main containers: ${mainContainers}`);
    
    // Check for workflow-related divs
    const workflowDivs = await page.locator('div').count();
    console.log(`Total divs: ${workflowDivs}`);
    
    // Look for specific class patterns
    const workflowClasses = [
      '.workflow',
      '.brief-workflow', 
      '.unified-workflow',
      '.UnifiedBriefWorkflow',
      '[data-testid*="workflow"]'
    ];
    
    for (const className of workflowClasses) {
      const count = await page.locator(className).count();
      if (count > 0) {
        console.log(`✅ Found ${className}: ${count} elements`);
        
        // Get the text content to see what's inside
        try {
          const content = await page.locator(className).first().textContent();
          console.log(`Content preview: ${content?.substring(0, 200)}...`);
        } catch (error) {
          console.log(`Could not read content of ${className}`);
        }
      }
    }
    
    // Look for forms and inputs
    console.log('\n=== FORMS AND INPUTS ===');
    const forms = await page.locator('form').count();
    const inputs = await page.locator('input').count();
    const textareas = await page.locator('textarea').count();
    const buttons = await page.locator('button').count();
    
    console.log(`Forms: ${forms}`);
    console.log(`Inputs: ${inputs}`);
    console.log(`Textareas: ${textareas}`);
    console.log(`Buttons: ${buttons}`);
    
    // List all buttons with their text
    const allButtons = await page.locator('button').all();
    console.log('\n=== BUTTON ANALYSIS ===');
    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      try {
        const button = allButtons[i];
        const text = await button.textContent();
        const visible = await button.isVisible();
        const enabled = await button.isEnabled();
        console.log(`Button ${i}: "${text?.trim()}" (visible: ${visible}, enabled: ${enabled})`);
      } catch (error) {
        console.log(`Button ${i}: Error reading - ${error.message}`);
      }
    }
    
    // Check for any React component references in the HTML
    console.log('\n=== REACT COMPONENT CHECK ===');
    const hasUnifiedWorkflow = bodyHTML.includes('UnifiedBriefWorkflow');
    const hasBriefUpload = bodyHTML.includes('brief') || bodyHTML.includes('Brief');
    const hasMotivation = bodyHTML.includes('motivation') || bodyHTML.includes('Motivation');
    const hasCopy = bodyHTML.includes('copy') || bodyHTML.includes('Copy');
    
    console.log(`Contains UnifiedBriefWorkflow: ${hasUnifiedWorkflow}`);
    console.log(`Contains brief/Brief: ${hasBriefUpload}`);
    console.log(`Contains motivation/Motivation: ${hasMotivation}`);
    console.log(`Contains copy/Copy: ${hasCopy}`);
    
    // Look for any error messages
    console.log('\n=== ERROR CHECK ===');
    const errorElements = await page.locator('.error, [role="alert"], .alert-error').count();
    if (errorElements > 0) {
      console.log(`⚠️ Found ${errorElements} error elements`);
      const firstError = await page.locator('.error, [role="alert"], .alert-error').first().textContent();
      console.log(`First error: ${firstError}`);
    } else {
      console.log('✅ No errors found');
    }
    
    // Look for loading states
    console.log('\n=== LOADING STATE CHECK ===');
    const loadingElements = await page.locator('.loading, .spinner, [role="progressbar"]').count();
    console.log(`Loading elements: ${loadingElements}`);
    
    // Check network requests
    console.log('\n=== FINAL SCREENSHOTS ===');
    await page.screenshot({ 
      path: 'screenshots/flow-simple-2-final.png',
      fullPage: true 
    });
    
    // Try to click the "Hide Workflow" button to see if anything is hidden
    const hideButton = page.locator('button:has-text("Hide Workflow")');
    if (await hideButton.isVisible()) {
      console.log('🔘 Found "Hide Workflow" button - workflow should be visible');
      
      // Check what's inside the workflow area
      const workflowContent = await page.locator('body').textContent();
      
      // Look for specific workflow-related text
      const hasSteps = workflowContent?.includes('Step') || workflowContent?.includes('step');
      const hasUpload = workflowContent?.includes('Upload') || workflowContent?.includes('upload');
      const hasParse = workflowContent?.includes('Parse') || workflowContent?.includes('parse');
      
      console.log(`Workflow contains steps: ${hasSteps}`);
      console.log(`Workflow contains upload: ${hasUpload}`);
      console.log(`Workflow contains parse: ${hasParse}`);
      
    } else {
      console.log('❌ No "Hide Workflow" button found - workflow might be hidden');
      
      // Try to find "Start Flow" button
      const startButton = page.locator('button:has-text("Start Flow")');
      if (await startButton.isVisible()) {
        console.log('🔘 Found "Start Flow" button - clicking to open workflow');
        await startButton.click();
        await page.waitForTimeout(3000);
        
        await page.screenshot({ 
          path: 'screenshots/flow-simple-3-after-start.png',
          fullPage: true 
        });
      }
    }
    
    console.log('\n✅ Simple flow analysis completed');
  });
});