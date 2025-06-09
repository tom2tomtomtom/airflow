const { chromium } = require('playwright');

async function testNavigation() {
  console.log('🧪 Testing navigation without authentication...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.text()}`));
  page.on('pageerror', error => console.log(`ERROR: ${error.message}`));
  
  try {
    // Test direct access to Flow page
    console.log('📍 Testing direct access to Flow page...');
    await page.goto('http://localhost:3000/flow');
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Direct Flow access: ${page.url()}`);
    await page.screenshot({ path: 'direct-flow-access.png', fullPage: true });
    
    // Test dashboard access
    console.log('📍 Testing direct access to Dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Direct Dashboard access: ${page.url()}`);
    await page.screenshot({ path: 'direct-dashboard-access.png', fullPage: true });
    
    // Now test navigation from dashboard
    console.log('🧭 Testing navigation from Dashboard...');
    
    // Test Flow navigation
    console.log('🎯 Clicking Flow navigation...');
    const flowStartTime = Date.now();
    
    await page.click('text=Flow');
    await page.waitForLoadState('networkidle');
    
    const flowTime = Date.now() - flowStartTime;
    console.log(`✅ Flow navigation: ${flowTime}ms - ${page.url()}`);
    await page.screenshot({ path: 'nav-flow-success.png', fullPage: true });
    
    // Test other navigation items
    const navItems = [
      { name: 'Clients', expectedPath: '/clients' },
      { name: 'Campaigns', expectedPath: '/campaigns' },
      { name: 'Assets', expectedPath: '/assets' },
      { name: 'Matrix', expectedPath: '/matrix' }
    ];
    
    for (const navItem of navItems) {
      console.log(`🧪 Testing ${navItem.name} navigation...`);
      const navStartTime = Date.now();
      
      try {
        await page.click(`text=${navItem.name}`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        const navTime = Date.now() - navStartTime;
        const currentUrl = page.url();
        const currentPath = new URL(currentUrl).pathname;
        
        if (currentPath === navItem.expectedPath) {
          console.log(`✅ ${navItem.name} navigation: ${navTime}ms - SUCCESS`);
        } else {
          console.log(`⚠️  ${navItem.name} navigation: ${navTime}ms - Expected ${navItem.expectedPath} but got ${currentPath}`);
        }
        
        await page.screenshot({ path: `nav-${navItem.name.toLowerCase()}.png`, fullPage: true });
        
      } catch (error) {
        console.log(`❌ ${navItem.name} navigation failed: ${error.message}`);
        await page.screenshot({ path: `nav-${navItem.name.toLowerCase()}-error.png`, fullPage: true });
      }
    }
    
    // Test double-click issue specifically
    console.log('🔄 Testing double-click issue...');
    
    // Go back to dashboard first
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // First click on Flow
    console.log('1️⃣ First click on Flow...');
    const firstClickTime = Date.now();
    await page.click('text=Flow');
    await page.waitForTimeout(1000); // Wait a bit
    
    const firstClickResult = page.url();
    const firstDuration = Date.now() - firstClickTime;
    console.log(`First click result: ${firstClickResult} (${firstDuration}ms)`);
    
    const firstPath = new URL(firstClickResult).pathname;
    if (firstPath === '/flow') {
      console.log('✅ First click worked correctly!');
    } else {
      console.log(`❌ First click went to ${firstPath} instead of /flow`);
      
      // Second click
      console.log('2️⃣ Second click on Flow...');
      const secondClickTime = Date.now();
      await page.click('text=Flow');
      await page.waitForLoadState('networkidle');
      
      const secondClickResult = page.url();
      const secondDuration = Date.now() - secondClickTime;
      console.log(`Second click result: ${secondClickResult} (${secondDuration}ms)`);
      
      const secondPath = new URL(secondClickResult).pathname;
      if (secondPath === '/flow') {
        console.log('✅ Second click worked!');
      } else {
        console.log(`❌ Second click also failed: ${secondPath}`);
      }
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ path: 'navigation-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testNavigation().catch(console.error);