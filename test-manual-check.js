const { chromium } = require('playwright');

async function testManualCheck() {
  console.log('👁️ Manual verification of AI workflow...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📍 Opening test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    console.log('🎯 Starting workflow...');
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(2000);
    
    console.log('📄 Uploading brief...');
    await page.setInputFiles('input[type="file"]', '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt');
    
    console.log('⏳ Waiting 20 seconds for processing (manual observation)...');
    await page.waitForTimeout(20000);
    
    // Take screenshot regardless of state
    await page.screenshot({ 
      path: 'manual-check-final.png',
      fullPage: true 
    });
    
    // Check what's actually on the page
    const pageText = await page.textContent('body');
    
    console.log('\n🔍 PAGE STATE ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (pageText.includes('Review & Edit Brief Content')) {
      console.log('✅ SUCCESS: Review interface is visible!');
      console.log('🎉 AI brief parsing completed successfully');
      
      // Check if fields are populated
      const titleField = page.locator('label:has-text("Brief Title")').locator('..').locator('input').first();
      if (await titleField.isVisible()) {
        const titleValue = await titleField.inputValue();
        console.log(`📋 Brief title: "${titleValue}"`);
      }
      
    } else if (pageText.includes('Processing brief with AI')) {
      console.log('⏳ PROCESSING: Still showing AI processing message');
      console.log('API may be taking longer than expected');
      
    } else if (pageText.includes('Upload Brief') || pageText.includes('Drag & drop')) {
      console.log('🔄 WAITING: Still on upload step');
      console.log('Processing may not have started yet');
      
    } else {
      console.log('❓ UNKNOWN STATE: Check screenshot for details');
      console.log('Page content sample:', pageText.substring(0, 200) + '...');
    }
    
    console.log('\n📸 Screenshot saved as manual-check-final.png');
    console.log('🔍 Please check the screenshot to see the actual UI state');
    
    // Keep browser open for manual inspection
    console.log('\n⏸️ Keeping browser open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('🚨 Manual check failed:', error);
    await page.screenshot({ 
      path: 'manual-check-error.png',
      fullPage: true 
    });
  } finally {
    console.log('\n🏁 Manual check completed');
    await browser.close();
  }
}

testManualCheck().catch(console.error);