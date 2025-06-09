const { chromium } = require('playwright');

async function testProceedOnly() {
  console.log('🎯 Testing just the proceed button functionality...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced console logging
  page.on('console', msg => {
    console.log(`CONSOLE: ${msg.text()}`);
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
    
    // Wait for review interface - we know this works from previous test
    console.log('⏳ Waiting for review interface...');
    await page.waitForTimeout(8000); // Give it more time
    
    // Check if review interface is there
    const reviewVisible = await page.locator('text=Review & Edit Brief Content').isVisible();
    if (!reviewVisible) {
      console.log('❌ Review interface not found - exiting test');
      return;
    }
    
    console.log('✅ Review interface is visible!');
    
    // Edit a field briefly
    const industryField = page.locator('label:has-text("Industry")').locator('..').locator('input').first();
    await industryField.fill('Technology');
    console.log('✏️ Edited industry field');
    
    // Take screenshot before clicking proceed
    await page.screenshot({ 
      path: 'before-proceed-click.png',
      fullPage: true 
    });
    
    // Now the crucial test - click proceed
    console.log('🎯 CRITICAL TEST: Clicking "Confirm & Generate Motivations"...');
    
    const proceedButton = page.locator('text=Confirm & Generate Motivations');
    const isButtonVisible = await proceedButton.isVisible();
    console.log(`Proceed button visible: ${isButtonVisible}`);
    
    if (!isButtonVisible) {
      console.log('❌ Proceed button not found!');
      return;
    }
    
    // Click the button
    await proceedButton.click();
    console.log('✅ Button clicked!');
    
    // Wait a moment and check state
    console.log('⏳ Waiting 3 seconds to see what happens...');
    await page.waitForTimeout(3000);
    
    // Take screenshot after clicking
    await page.screenshot({ 
      path: 'after-proceed-click.png',
      fullPage: true 
    });
    
    // Check current state
    const currentPageText = await page.textContent('body');
    
    console.log('\n📊 ANALYZING CURRENT STATE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (currentPageText.includes('Generate Strategic Motivations')) {
      console.log('🎉 SUCCESS! We are now on the motivations step!');
      console.log('✅ The proceed fix worked correctly!');
      
      // Try to click the generate motivations button to verify it works
      const genButton = page.locator('text=Generate Strategic Motivations');
      if (await genButton.isVisible()) {
        console.log('✅ Generate Motivations button is clickable');
      }
    } else if (currentPageText.includes('Review & Edit Brief Content')) {
      console.log('❌ FAILED: Still stuck on review step');
      console.log('The proceed button click did not advance the workflow');
    } else if (currentPageText.includes('Upload Brief') || currentPageText.includes('Drag & drop')) {
      console.log('❌ MAJOR ISSUE: Workflow reset to upload step');
      console.log('This is the bug the user reported - clicking proceed resets everything');
    } else {
      console.log('❓ UNKNOWN STATE: Need to check screenshots');
      console.log('Page content sample:', currentPageText.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'test-error-proceed.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testProceedOnly().catch(console.error);