const { chromium } = require('playwright');

async function debugNavigationClicks() {
  console.log('🕵️  Debugging navigation click behavior...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable detailed logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.text()}`));
  page.on('pageerror', error => console.log(`PAGE ERROR: ${error.message}`));
  page.on('request', request => {
    if (request.url().includes('dashboard') || request.url().includes('flow')) {
      console.log(`REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  page.on('response', response => {
    if (response.url().includes('dashboard') || response.url().includes('flow')) {
      console.log(`RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    // Go to dashboard
    console.log('📍 Loading dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`✅ Dashboard loaded: ${page.url()}`);
    
    // Debug: Check if Flow navigation link exists and is clickable
    console.log('🔍 Checking navigation elements...');
    
    const flowLink = await page.locator('text=Flow').first();
    const isVisible = await flowLink.isVisible();
    const isEnabled = await flowLink.isEnabled();
    
    console.log(`Flow link - Visible: ${isVisible}, Enabled: ${isEnabled}`);
    
    if (isVisible) {
      // Get the actual href attribute
      const href = await flowLink.getAttribute('href');
      console.log(`Flow link href: ${href}`);
      
      // Check if it's actually a router.push call
      console.log('🎯 Clicking Flow with detailed monitoring...');
      
      // Listen for navigation events
      page.on('framenavigated', frame => {
        console.log(`NAVIGATION: ${frame.url()}`);
      });
      
      // Click and monitor what happens
      await flowLink.click();
      
      // Wait a bit and check URL
      await page.waitForTimeout(2000);
      console.log(`URL after click: ${page.url()}`);
      
      // Try direct evaluation of router.push
      console.log('🧪 Testing direct router.push...');
      await page.evaluate(() => {
        if (window.__NEXT_DATA__ && window.next && window.next.router) {
          console.log('Router available, pushing to /flow');
          window.next.router.push('/flow');
        } else {
          console.log('Router not available');
        }
      });
      
      await page.waitForTimeout(2000);
      console.log(`URL after router.push: ${page.url()}`);
      
    } else {
      console.log('❌ Flow link not found or not visible');
      
      // Debug: List all available navigation links
      const navLinks = await page.locator('nav a, nav button').all();
      console.log(`Found ${navLinks.length} navigation elements:`);
      
      for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
        const link = navLinks[i];
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        console.log(`  ${i}: "${text}" href="${href}"`);
      }
    }
    
    // Test with different selector approaches
    console.log('🔄 Trying alternative selectors...');
    
    try {
      // Try by href
      await page.click('[href="/flow"]');
      await page.waitForTimeout(1000);
      console.log(`After href click: ${page.url()}`);
    } catch (e) {
      console.log('Href selector failed:', e.message.split('\n')[0]);
    }
    
    try {
      // Try by text content in ListItemButton
      await page.click('button:has-text("Flow")');
      await page.waitForTimeout(1000);
      console.log(`After button click: ${page.url()}`);
    } catch (e) {
      console.log('Button selector failed:', e.message.split('\n')[0]);
    }
    
  } catch (error) {
    console.error('🚨 Debug failed:', error);
    await page.screenshot({ path: 'debug-navigation-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the debug
debugNavigationClicks().catch(console.error);