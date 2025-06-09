const { chromium } = require('playwright');

async function debugPageRedirects() {
  console.log('🕵️  Debugging page redirects...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor network requests
  const failedRequests = [];
  page.on('response', response => {
    if (!response.ok()) {
      failedRequests.push({
        url: response.url(),
        status: response.status(),
        statusText: response.statusText()
      });
    }
  });
  
  // Monitor navigation
  page.on('framenavigated', frame => {
    console.log(`NAVIGATION: ${frame.url()}`);
  });
  
  page.on('console', msg => {
    if (msg.text().includes('Navigation clicked') || msg.text().includes('error') || msg.text().includes('Error')) {
      console.log(`CONSOLE: ${msg.text()}`);
    }
  });
  
  try {
    // Test campaigns page
    console.log('📍 Testing campaigns page...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log('🎯 Clicking Campaigns...');
    await page.click('span:has-text("Campaigns")');
    
    // Wait and monitor for redirects
    await page.waitForTimeout(3000);
    
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed requests during navigation:');
      failedRequests.forEach(req => {
        console.log(`  - ${req.status} ${req.statusText}: ${req.url}`);
      });
    }
    
    // Clear failed requests for next test
    failedRequests.length = 0;
    
    // Test assets page
    console.log('\n📍 Testing assets page...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log('🎯 Clicking Assets...');
    await page.click('span:has-text("Assets")');
    
    // Wait and monitor for redirects
    await page.waitForTimeout(3000);
    
    const assetsUrl = page.url();
    console.log(`Assets final URL: ${assetsUrl}`);
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed requests during assets navigation:');
      failedRequests.forEach(req => {
        console.log(`  - ${req.status} ${req.statusText}: ${req.url}`);
      });
    }
    
    // Test a working page for comparison (Clients worked in previous test)
    console.log('\n📍 Testing clients page (should work)...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    failedRequests.length = 0;
    console.log('🎯 Clicking Clients...');
    await page.click('span:has-text("Clients")');
    
    await page.waitForTimeout(3000);
    
    const clientsUrl = page.url();
    console.log(`Clients final URL: ${clientsUrl}`);
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed requests during clients navigation:');
      failedRequests.forEach(req => {
        console.log(`  - ${req.status} ${req.statusText}: ${req.url}`);
      });
    } else {
      console.log('✅ No failed requests for clients');
    }
    
  } catch (error) {
    console.error('🚨 Debug failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugPageRedirects().catch(console.error);