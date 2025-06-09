const { chromium } = require('playwright');

async function testNetworkMonitor() {
  console.log('🌐 Testing with network monitoring...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('/api/flow/parse-brief')) {
      console.log(`📤 API REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/flow/parse-brief')) {
      console.log(`📥 API RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.text().includes('Brief parsed') || msg.text().includes('error') || msg.text().includes('Error')) {
      console.log(`BROWSER: ${msg.text()}`);
    }
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
    
    console.log('⏳ Monitoring network and processing...');
    
    // Wait for up to 20 seconds monitoring network activity
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      
      const isReviewVisible = await page.locator('text=Review & Edit Brief Content').isVisible();
      
      if (isReviewVisible) {
        console.log('🎉 SUCCESS! Review interface appeared!');
        return;
      }
      
      if (i === 10) {
        console.log('🔍 10 seconds elapsed - checking page state...');
        const pageText = await page.textContent('body');
        if (pageText.includes('Processing brief with AI')) {
          console.log('ℹ️ Still shows processing message');
        } else {
          console.log('❓ Processing message gone but no review interface');
        }
      }
    }
    
    console.log('❌ Timeout after 20 seconds');
    await page.screenshot({ 
      path: 'network-monitor-timeout.png',
      fullPage: true 
    });
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'network-monitor-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testNetworkMonitor().catch(console.error);