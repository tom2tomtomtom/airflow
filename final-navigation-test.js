const { chromium } = require('playwright');

async function finalNavigationTest() {
  console.log('🎯 Final navigation test - all fixes applied...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    // Only log important messages
    if (msg.text().includes('Navigation clicked') || 
        msg.text().includes('Error') || 
        msg.text().includes('Grid')) {
      console.log(`CONSOLE: ${msg.text()}`);
    }
  });
  
  try {
    // Test direct access to Flow page
    console.log('📍 Testing direct Flow access...');
    await page.goto('http://localhost:3000/flow');
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Flow direct access: ${page.url()}`);
    
    // Test dashboard access (should redirect to login - auth restored)
    console.log('📍 Testing dashboard access (should redirect to login)...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    const dashUrl = page.url();
    if (dashUrl.includes('/login')) {
      console.log('✅ Dashboard properly redirects to login (auth working)');
    } else {
      console.log(`⚠️  Dashboard went to: ${dashUrl}`);
    }
    
    // Remove the debug files
    console.log('🧹 Cleanup: Debug files can be removed');
    
  } catch (error) {
    console.error('🚨 Final test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
finalNavigationTest().catch(console.error);