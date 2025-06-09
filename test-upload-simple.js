const { chromium } = require('playwright');

async function testUploadSimple() {
  console.log('📄 Simple upload test...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced console logging
  page.on('console', msg => {
    console.log(`BROWSER: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('📍 Going to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    console.log('🚀 Starting workflow...');
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(2000);
    
    console.log('📄 Uploading file...');
    await page.setInputFiles('input[type="file"]', '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt');
    
    console.log('⏳ Waiting and monitoring...');
    
    // Monitor for 15 seconds
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(1000);
      
      const isProcessing = await page.locator('text=Processing brief with AI').isVisible();
      const isReviewVisible = await page.locator('text=Review & Edit Brief Content').isVisible();
      
      console.log(`${i + 1}s: Processing=${isProcessing}, Review=${isReviewVisible}`);
      
      if (isReviewVisible) {
        console.log('🎉 SUCCESS! Review interface appeared!');
        
        // Take screenshot
        await page.screenshot({ 
          path: 'success-parsing.png',
          fullPage: true 
        });
        
        // Check some field values
        const title = await page.locator('label:has-text("Brief Title")').locator('..').locator('input').first().inputValue();
        console.log(`✅ Title extracted: "${title}"`);
        
        return;
      }
      
      if (!isProcessing && !isReviewVisible) {
        console.log('❌ Neither processing nor review visible - something is wrong');
        break;
      }
    }
    
    console.log('❌ Timeout - taking screenshot for debugging');
    await page.screenshot({ 
      path: 'upload-timeout.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'upload-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testUploadSimple().catch(console.error);