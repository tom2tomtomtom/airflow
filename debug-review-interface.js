const { chromium } = require('playwright');
const fs = require('fs');

async function debugReviewInterface() {
  console.log('🔍 Debugging review interface issue...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced logging
  page.on('console', msg => {
    console.log(`CONSOLE: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('📍 Navigating to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    // Start the workflow
    const startButton = page.locator('[data-testid="start-flow-button"]');
    await startButton.click();
    await page.waitForTimeout(2000);
    
    // Upload the brief
    const fileInput = page.locator('input[type="file"]');
    const briefPath = '/Users/thomasdowuona-hyde/Documents/redbaez airwave brief.docx';
    
    if (fs.existsSync(briefPath)) {
      console.log('📄 Uploading brief...');
      await fileInput.setInputFiles(briefPath);
      
      console.log('⏳ Waiting for processing to complete...');
      
      // Wait longer and check for various possible states
      await page.waitForTimeout(5000);
      
      // Take screenshot after upload
      await page.screenshot({ 
        path: 'after-upload.png',
        fullPage: true 
      });
      
      // Check what's actually on the page
      const bodyText = await page.textContent('body');
      console.log('Page contains "Review & Edit":', bodyText.includes('Review & Edit'));
      console.log('Page contains "Brief Content":', bodyText.includes('Brief Content'));
      console.log('Page contains "Brief Processed":', bodyText.includes('Brief Processed'));
      console.log('Page contains "Processing":', bodyText.includes('Processing'));
      console.log('Page contains "Brief Title":', bodyText.includes('Brief Title'));
      
      // Check for specific elements
      const reviewHeader = page.locator('text=Review & Edit Brief Content');
      console.log('Review header visible:', await reviewHeader.isVisible());
      
      const briefTitle = page.locator('label:has-text("Brief Title")');
      console.log('Brief Title label visible:', await briefTitle.isVisible());
      
      const successAlert = page.locator('text=Brief Processed Successfully');
      console.log('Success alert visible:', await successAlert.isVisible());
      
      const processingIndicator = page.locator('text=Processing brief with AI');
      console.log('Processing indicator visible:', await processingIndicator.isVisible());
      
      // Check if we're still in step 0 vs moved to review
      const stepIndicator = page.locator('.MuiStepper-root .MuiStep-root.Mui-active');
      if (await stepIndicator.isVisible()) {
        const stepText = await stepIndicator.textContent();
        console.log('Active step:', stepText);
      }
      
      // Log any error text
      const errorElements = await page.locator('.error, [role="alert"], .MuiAlert-root').all();
      for (const errorEl of errorElements) {
        const text = await errorEl.textContent();
        if (text && text.trim()) {
          console.log(`Alert/Error: ${text}`);
        }
      }
      
      // Wait a bit more and check again
      console.log('⏳ Waiting additional time...');
      await page.waitForTimeout(10000);
      
      await page.screenshot({ 
        path: 'after-wait.png',
        fullPage: true 
      });
      
      // Final check
      const finalBodyText = await page.textContent('body');
      console.log('Final page contains "Review & Edit":', finalBodyText.includes('Review & Edit'));
      
      // If review interface appeared, check field values
      if (finalBodyText.includes('Review & Edit')) {
        console.log('✅ Review interface found! Checking field values...');
        
        const titleInput = page.locator('label:has-text("Brief Title")').locator('..').locator('input, textarea').first();
        if (await titleInput.isVisible()) {
          const titleValue = await titleInput.inputValue();
          console.log(`Brief Title value: "${titleValue}"`);
        }
        
        const objectiveInput = page.locator('label:has-text("Objective")').locator('..').locator('input, textarea').first();
        if (await objectiveInput.isVisible()) {
          const objectiveValue = await objectiveInput.inputValue();
          console.log(`Objective value: "${objectiveValue.substring(0, 100)}..."`);
        }
      } else {
        console.log('❌ Review interface never appeared');
      }
      
    } else {
      console.log('❌ Brief file not found');
    }
    
  } catch (error) {
    console.error('🚨 Debug failed:', error);
    await page.screenshot({ 
      path: 'debug-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Debug completed');
    await browser.close();
  }
}

debugReviewInterface().catch(console.error);