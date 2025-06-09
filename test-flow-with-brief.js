const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function testFlowWithBrief() {
  console.log('🧪 Testing Flow with brief document...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set up console logging
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Brief parsed') || 
        text.includes('Error') || 
        text.includes('Failed') ||
        text.includes('review step')) {
      console.log(`CONSOLE: ${text}`);
    }
  });
  
  // Set up error handling
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('📍 Navigating to Flow page...');
    await page.goto('http://localhost:3000/flow');
    await page.waitForLoadState('networkidle');
    
    // Check if we're redirected to login
    if (page.url().includes('/login')) {
      console.log('🔐 Redirected to login, signing in...');
      
      // Fill in login form
      await page.fill('input[type="email"]', 'tomh@redbaez.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      console.log('⏳ Waiting for authentication...');
      await page.waitForLoadState('networkidle');
      
      // Navigate back to Flow after login
      await page.goto('http://localhost:3000/flow');
      await page.waitForLoadState('networkidle');
    }
    
    console.log('🔍 Looking for workflow dialog...');
    
    // Look for the "Start Flow" button or similar trigger
    const startButtons = [
      'text=Start Flow',
      'text=Start New Flow', 
      'text=Upload Brief',
      'text=Begin Workflow',
      '[data-testid="start-flow-button"]',
      'button:has-text("Flow")',
      'button:has-text("Brief")'
    ];
    
    let workflowButton = null;
    for (const selector of startButtons) {
      try {
        workflowButton = await page.locator(selector).first();
        if (await workflowButton.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found workflow button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (workflowButton && await workflowButton.isVisible()) {
      console.log('🖱️ Clicking workflow button...');
      await workflowButton.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('⚠️ No workflow button found, looking for upload zone...');
    }
    
    // Look for the drag and drop zone
    console.log('🔍 Looking for upload zone...');
    const uploadZone = page.locator('[data-testid="upload-zone"], .dropzone, input[type="file"]').first();
    
    if (await uploadZone.isVisible({ timeout: 5000 })) {
      console.log('✅ Found upload zone');
      
      // Path to the brief document
      const briefPath = '/Users/thomasdowuona-hyde/Documents/redbaez airwave brief.docx';
      
      // Check if file exists
      if (fs.existsSync(briefPath)) {
        console.log('📄 Found brief document, uploading...');
        
        // Upload the file
        await uploadZone.setInputFiles(briefPath);
        
        console.log('⏳ Waiting for brief processing...');
        
        // Wait for processing to complete and review interface to appear
        try {
          await page.waitForSelector('text=Review & Edit Brief Content', { timeout: 15000 });
          console.log('✅ Brief review interface appeared!');
          
          // Take a screenshot of the review interface
          await page.screenshot({ 
            path: 'brief-review-interface.png',
            fullPage: true 
          });
          console.log('📸 Screenshot saved as brief-review-interface.png');
          
          // Check for specific fields in the review interface
          const fields = [
            'Brief Title',
            'Industry', 
            'Objective',
            'Target Audience',
            'Value Proposition',
            'Product/Service Description'
          ];
          
          for (const field of fields) {
            const fieldElement = page.locator(`label:has-text("${field}")`);
            if (await fieldElement.isVisible()) {
              console.log(`✅ Found field: ${field}`);
            } else {
              console.log(`❌ Missing field: ${field}`);
            }
          }
          
          // Look for the confirm button
          const confirmButton = page.locator('text=Confirm & Generate Motivations');
          if (await confirmButton.isVisible()) {
            console.log('✅ Found confirm button');
            console.log('🎯 Test completed successfully - brief review interface is working!');
          } else {
            console.log('❌ Confirm button not found');
          }
          
        } catch (error) {
          console.error('❌ Brief processing failed or review interface did not appear:', error.message);
          
          // Check for any error messages
          const errorElements = await page.locator('.error, [role="alert"], .alert-error').all();
          for (const errorEl of errorElements) {
            const text = await errorEl.textContent();
            console.log(`Error message: ${text}`);
          }
          
          // Take screenshot of current state
          await page.screenshot({ 
            path: 'flow-error-state.png',
            fullPage: true 
          });
          console.log('📸 Error screenshot saved as flow-error-state.png');
        }
        
      } else {
        console.log(`❌ Brief document not found at: ${briefPath}`);
        console.log('📁 Please check if the file exists in the Documents folder');
      }
      
    } else {
      console.log('❌ Upload zone not found');
      
      // Take screenshot to see current state
      await page.screenshot({ 
        path: 'flow-page-state.png',
        fullPage: true 
      });
      console.log('📸 Screenshot saved as flow-page-state.png');
      
      // Log all visible elements for debugging
      const buttons = await page.locator('button').all();
      console.log('Available buttons:');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.trim()) {
          console.log(`  - "${text.trim()}"`);
        }
      }
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'test-failure.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

// Run the test
testFlowWithBrief().catch(console.error);