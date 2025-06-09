const { chromium } = require('playwright');

async function debugFlowSpecific() {
  console.log('🔍 Debugging Flow navigation specifically...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.text()}`));
  
  try {
    // Go to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Debug: Check what navigation elements are available
    console.log('🔍 Checking all navigation elements...');
    
    const navElements = await page.locator('[role="navigation"] button, nav button, nav a').all();
    console.log(`Found ${navElements.length} navigation elements`);
    
    for (let i = 0; i < navElements.length; i++) {
      const element = navElements[i];
      const text = await element.textContent();
      const disabled = await element.isDisabled();
      console.log(`  ${i + 1}: "${text}" (disabled: ${disabled})`);
    }
    
    // Try different selectors for Flow
    const flowSelectors = [
      'text=Flow',
      'button:has-text("Flow")',
      '[aria-label*="Flow"]',
      'span:has-text("Flow")',
      '.MuiListItemText-primary:has-text("Flow")'
    ];
    
    for (const selector of flowSelectors) {
      try {
        console.log(`🧪 Testing selector: ${selector}`);
        const element = await page.locator(selector).first();
        const isVisible = await element.isVisible();
        const count = await page.locator(selector).count();
        console.log(`  - Visible: ${isVisible}, Count: ${count}`);
        
        if (isVisible) {
          console.log(`✅ Found Flow with selector: ${selector}`);
          
          // Try clicking it
          await element.click();
          await page.waitForTimeout(1000);
          console.log(`  - After click: ${page.url()}`);
          
          // Reset for next test
          await page.goto('http://localhost:3000/dashboard');
          await page.waitForLoadState('networkidle');
        }
      } catch (e) {
        console.log(`  - Error: ${e.message.split('\n')[0]}`);
      }
    }
    
    // Check the exact structure around Flow
    console.log('🔍 Examining Flow navigation structure...');
    const flowContainer = await page.locator('text=Flow').first();
    if (await flowContainer.isVisible()) {
      const parent = await flowContainer.locator('..').first();
      const outerHTML = await parent.innerHTML();
      console.log('Flow container HTML:', outerHTML.substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.error('🚨 Debug failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugFlowSpecific().catch(console.error);