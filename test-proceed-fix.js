const { chromium } = require('playwright');

async function testProceedFix() {
  console.log('🔧 Testing the proceed fix...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced console logging
  page.on('console', msg => {
    if (msg.text().includes('onProceed') || msg.text().includes('activeStep') || msg.text().includes('showBriefReview')) {
      console.log(`🟦 CONSOLE: ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    // Start workflow
    console.log('🚀 Starting workflow...');
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(1000);
    
    // Upload brief
    console.log('📄 Uploading brief...');
    const briefPath = '/Users/thomasdowuona-hyde/Documents/redbaez airwave brief.docx';
    await page.setInputFiles('input[type="file"]', briefPath);
    
    // Wait for review interface
    console.log('⏳ Waiting for review interface...');
    await page.waitForSelector('text=Review & Edit Brief Content', { timeout: 15000 });
    console.log('✅ Review interface appeared!');
    
    // Edit a field to test the functionality
    console.log('✏️ Testing field editing...');
    const industryField = page.locator('label:has-text("Industry")').locator('..').locator('input').first();
    await industryField.fill('Technology & Marketing');
    
    // Take screenshot before clicking proceed
    await page.screenshot({ 
      path: 'before-proceed.png',
      fullPage: true 
    });
    
    // Test the proceed button - this is where the bug was happening
    console.log('🎯 Clicking "Confirm & Generate Motivations"...');
    
    // Add a listener for navigation events to see what happens
    page.on('framenavigated', () => {
      console.log('🔄 Frame navigated - this might indicate a page reload');
    });
    
    const proceedButton = page.locator('text=Confirm & Generate Motivations');
    await proceedButton.click();
    
    console.log('⏳ Waiting to see if we proceed to step 1...');
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking proceed
    await page.screenshot({ 
      path: 'after-proceed.png',
      fullPage: true 
    });
    
    // Check what step we're on
    const pageText = await page.textContent('body');
    
    if (pageText.includes('Generate Strategic Motivations')) {
      console.log('🎉 SUCCESS! We properly proceeded to motivations step!');
      
      // Check if we can see the generate motivations button
      const generateBtn = page.locator('text=Generate Strategic Motivations');
      if (await generateBtn.isVisible()) {
        console.log('✅ Generate Motivations button is visible - fix successful!');
      }
    } else if (pageText.includes('Review & Edit Brief Content')) {
      console.log('❌ STILL STUCK: We are still on the review step');
    } else if (pageText.includes('Upload Brief') || pageText.includes('Drag & drop')) {
      console.log('❌ REGRESSION: We jumped back to the beginning (upload step)');
    } else {
      console.log('❓ UNKNOWN STATE: Check screenshots to see what happened');
    }
    
    // Final state check
    console.log('\n📊 FINAL RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (pageText.includes('Generate Strategic Motivations')) {
      console.log('✅ Fix successful - Flow proceeds correctly to motivations');
    } else {
      console.log('❌ Fix failed - Flow still has navigation issues');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'test-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testProceedFix().catch(console.error);