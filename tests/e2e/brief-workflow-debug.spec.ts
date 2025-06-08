import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Brief Workflow Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Handle login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'tomh@redbaez.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete full brief workflow with debug info', async ({ page }) => {
    console.log('=== Starting Brief Workflow Test ===');
    
    // Step 1: Navigate to flow page
    console.log('1. Navigating to flow page...');
    await page.goto('/flow');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-flow-initial.png', fullPage: true });
    
    // Step 2: Open brief workflow
    console.log('2. Looking for brief workflow trigger...');
    
    // Look for any button that might trigger the brief workflow
    const briefButtons = await page.locator('button:has-text("Brief"), button:has-text("Upload"), button:has-text("Brief Workflow")').all();
    console.log(`Found ${briefButtons.length} potential brief buttons`);
    
    if (briefButtons.length === 0) {
      // Try to find any upload or workflow related elements
      const uploadElements = await page.locator('[data-testid*="upload"], [class*="upload"], [class*="brief"]').all();
      console.log(`Found ${uploadElements.length} upload/brief related elements`);
      
      if (uploadElements.length > 0) {
        console.log('Clicking first upload/brief element...');
        await uploadElements[0].click();
      } else {
        // Look for any dialog or modal triggers
        const modalTriggers = await page.locator('button, [role="button"]').all();
        console.log(`Total interactive elements: ${modalTriggers.length}`);
        
        // Click the first button that might open a dialog
        for (const trigger of modalTriggers.slice(0, 5)) {
          const text = await trigger.textContent();
          console.log(`Button text: "${text}"`);
          if (text && (text.includes('Brief') || text.includes('Upload') || text.includes('Workflow'))) {
            await trigger.click();
            break;
          }
        }
      }
    } else {
      console.log('Clicking brief button...');
      await briefButtons[0].click();
    }
    
    // Wait for dialog/modal to appear
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'debug-after-brief-click.png', fullPage: true });
    
    // Step 3: Look for file upload area
    console.log('3. Looking for file upload area...');
    
    // Check if dialog is open
    const dialog = page.locator('[role="dialog"], .MuiDialog-root, [class*="dialog"]');
    const isDialogVisible = await dialog.isVisible().catch(() => false);
    console.log(`Dialog visible: ${isDialogVisible}`);
    
    if (isDialogVisible) {
      await page.screenshot({ path: 'debug-dialog-open.png', fullPage: true });
    }
    
    // Look for dropzone or file input
    const dropzone = page.locator('[data-testid="dropzone"], [class*="dropzone"], input[type="file"]').first();
    const dropzoneVisible = await dropzone.isVisible().catch(() => false);
    console.log(`Dropzone visible: ${dropzoneVisible}`);
    
    if (!dropzoneVisible) {
      // Look for any element that might be a drop area
      const dropAreas = await page.locator('[class*="drop"], [class*="upload"], [data-testid*="upload"]').all();
      console.log(`Found ${dropAreas.length} potential drop areas`);
      
      if (dropAreas.length > 0) {
        await dropAreas[0].screenshot({ path: 'debug-drop-area.png' });
      }
    }
    
    // Step 4: Upload the brief file
    console.log('4. Uploading brief file...');
    
    const briefFilePath = path.join(process.cwd(), '..', 'documents', 'redbaez airwave brief.docx');
    console.log(`Brief file path: ${briefFilePath}`);
    
    // Try different upload methods
    try {
      // Method 1: Direct file input
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        console.log('Using direct file input...');
        await fileInput.setInputFiles(briefFilePath);
      } else {
        // Method 2: Click and then set files
        console.log('Trying click then file input...');
        await page.locator('[class*="dropzone"], [data-testid*="upload"]').first().click();
        await page.waitForTimeout(1000);
        const hiddenInput = page.locator('input[type="file"]');
        await hiddenInput.setInputFiles(briefFilePath);
      }
    } catch (error) {
      console.log(`Upload error: ${error}`);
      
      // Fallback: Create a simple text file for testing
      console.log('Creating test text file...');
      const testContent = `
Redbaez Airwave Brief
Objective: Create engaging social media content for insurance products
Target Audience: Young professionals aged 25-40
Key Messages: 
- Affordable insurance solutions
- Quick and easy application process
- Comprehensive coverage options
Platforms: Instagram, Facebook, LinkedIn
Budget: $50,000
Timeline: 3 months
Product: Life Insurance
Value Proposition: Protecting what matters most at an affordable price
Industry: Insurance
`;
      
      // Create blob and simulate file upload
      const blob = new Blob([testContent], { type: 'text/plain' });
      const file = new File([blob], 'test-brief.txt', { type: 'text/plain' });
      
      // Create a data transfer
      const dataTransfer = await page.evaluateHandle((file) => {
        const dt = new DataTransfer();
        dt.items.add(file);
        return dt;
      }, file);
      
      // Try to trigger drop event
      await page.locator('[class*="dropzone"], [data-testid*="upload"]').first().dispatchEvent('drop', { dataTransfer });
    }
    
    // Step 5: Wait for processing and look for results
    console.log('5. Waiting for processing...');
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'debug-after-upload.png', fullPage: true });
    
    // Look for processing indicators
    const progressIndicators = await page.locator('[role="progressbar"], .MuiLinearProgress-root, [class*="progress"]').all();
    console.log(`Found ${progressIndicators.length} progress indicators`);
    
    if (progressIndicators.length > 0) {
      console.log('Waiting for processing to complete...');
      await page.waitForTimeout(10000);
    }
    
    // Step 6: Look for parsed results
    console.log('6. Looking for parsed results...');
    await page.screenshot({ path: 'debug-after-processing.png', fullPage: true });
    
    // Look for brief data display
    const briefDataElements = await page.locator('[class*="brief"], [data-testid*="brief"], .MuiTextField-root').all();
    console.log(`Found ${briefDataElements.length} brief data elements`);
    
    // Check for messy/jumbled UI issues
    const allText = await page.textContent('body');
    if (allText) {
      const hasJumbledText = allText.includes('Object') || allText.includes('[object') || allText.includes('undefined');
      console.log(`Detected jumbled text: ${hasJumbledText}`);
      
      if (hasJumbledText) {
        console.log('🚨 ISSUE FOUND: Jumbled text detected in UI');
        
        // Look for specific problematic elements
        const objectTexts = await page.locator(':has-text("Object"), :has-text("[object"), :has-text("undefined")').all();
        for (let i = 0; i < Math.min(objectTexts.length, 3); i++) {
          await objectTexts[i].screenshot({ path: `debug-jumbled-text-${i}.png` });
        }
      }
    }
    
    // Step 7: Look for continue/proceed button
    console.log('7. Looking for continue button...');
    
    const continueButtons = await page.locator('button:has-text("Continue"), button:has-text("Proceed"), button:has-text("Next"), button:has-text("Confirm")').all();
    console.log(`Found ${continueButtons.length} continue buttons`);
    
    if (continueButtons.length > 0) {
      console.log('Found continue button, checking if it works...');
      
      // Get current step/state before clicking
      const beforeClickUrl = page.url();
      const beforeClickContent = await page.textContent('body');
      
      await page.screenshot({ path: 'debug-before-continue.png', fullPage: true });
      
      // Click continue button
      await continueButtons[0].click();
      await page.waitForTimeout(3000);
      
      // Check what happened after clicking
      const afterClickUrl = page.url();
      const afterClickContent = await page.textContent('body');
      
      await page.screenshot({ path: 'debug-after-continue.png', fullPage: true });
      
      console.log(`URL before: ${beforeClickUrl}`);
      console.log(`URL after: ${afterClickUrl}`);
      
      // Check if we went back to start (common issue)
      const wentBackToStart = afterClickUrl === beforeClickUrl && afterClickContent === beforeClickContent;
      if (wentBackToStart) {
        console.log('🚨 ISSUE FOUND: Continue button goes back to start instead of proceeding');
      }
      
      // Look for motivations generation
      console.log('8. Looking for motivations generation...');
      const motivationElements = await page.locator(':has-text("motivation"), :has-text("strategic"), :has-text("generate")').all();
      console.log(`Found ${motivationElements.length} motivation-related elements`);
      
      if (motivationElements.length > 0) {
        console.log('Motivations section found');
        await page.screenshot({ path: 'debug-motivations-section.png', fullPage: true });
      }
    }
    
    // Step 8: Generate summary report
    console.log('8. Generating summary report...');
    
    const summary = {
      dialogOpened: isDialogVisible,
      dropzoneFound: dropzoneVisible,
      briefDataElements: briefDataElements.length,
      continueButtons: continueButtons.length,
      progressIndicators: progressIndicators.length,
      hasJumbledText: allText?.includes('Object') || false,
      currentUrl: page.url(),
      timestamp: new Date().toISOString()
    };
    
    console.log('=== WORKFLOW DEBUG SUMMARY ===');
    console.log(JSON.stringify(summary, null, 2));
    
    // Save final state
    await page.screenshot({ path: 'debug-final-state.png', fullPage: true });
    
    console.log('=== Brief Workflow Test Complete ===');
  });

  test('should test API endpoints directly', async ({ page }) => {
    console.log('=== Testing API Endpoints Directly ===');
    
    // Test brief parsing API
    const testBriefContent = `
Redbaez Airwave Brief
Objective: Create engaging social media content for insurance products
Target Audience: Young professionals aged 25-40
Key Messages: Affordable insurance, Quick application, Comprehensive coverage
Platforms: Instagram, Facebook, LinkedIn
Budget: $50,000
Timeline: 3 months
Product: Life Insurance
Value Proposition: Protecting what matters most at an affordable price
Industry: Insurance
`;
    
    // Create a blob and form data
    const blob = new Blob([testBriefContent], { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', blob, 'test-brief.txt');
    
    // Test parse-brief API
    try {
      const response = await fetch('http://localhost:3000/api/flow/parse-brief', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('Parse Brief API Response:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        // Test motivations generation API
        try {
          const motivationsResponse = await fetch('http://localhost:3000/api/flow/generate-motivations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ briefData: result.data }),
          });
          
          const motivationsResult = await motivationsResponse.json();
          console.log('Motivations API Response:', JSON.stringify(motivationsResult, null, 2));
          
        } catch (error) {
          console.log('Motivations API Error:', error);
        }
      }
      
    } catch (error) {
      console.log('Parse Brief API Error:', error);
    }
    
    console.log('=== API Testing Complete ===');
  });
});