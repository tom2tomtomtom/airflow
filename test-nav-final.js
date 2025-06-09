const { chromium } = require('playwright');

async function testNavigationFinal() {
  console.log('🎯 Final navigation test with debug logging...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.text()}`));
  page.on('pageerror', error => console.log(`ERROR: ${error.message}`));
  
  try {
    // Go to dashboard
    console.log('📍 Loading dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Dashboard loaded: ${page.url()}`);
    
    // Test Flow navigation with console monitoring
    console.log('🎯 Clicking Flow navigation...');
    
    await page.click('text=Flow');
    await page.waitForTimeout(2000);
    
    console.log(`Result: ${page.url()}`);
    
    if (page.url().includes('/flow')) {
      console.log('✅ Flow navigation working!');
    } else {
      console.log('❌ Flow navigation failed');
    }
    
    // Test going back to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test other navigation items
    const navItems = ['Clients', 'Campaigns', 'Assets'];
    
    for (const navItem of navItems) {
      console.log(`🧪 Testing ${navItem}...`);
      await page.click(`text=${navItem}`);
      await page.waitForTimeout(2000);
      console.log(`${navItem} result: ${page.url()}`);
      
      // Go back to dashboard for next test
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testNavigationFinal().catch(console.error);