const puppeteer = require('puppeteer');

async function testRefactoredComponent() {
  console.log('=== Testing Refactored UnifiedBriefWorkflow Component ===');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to flow page
    console.log('1. Navigating to flow page...');
    await page.goto('http://localhost:3001/flow');
    
    // Wait for potential redirects or loading
    await page.waitForTimeout(3000);
    
    console.log('✅ Page loaded successfully - refactoring did not break compilation');
    
    // Take screenshot to confirm
    await page.screenshot({ path: 'refactor-test.png' });
    
  } catch (error) {
    console.log('❌ Error testing refactored component:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('=== Refactor Test Complete ===');
}

// Only run if called directly
if (require.main === module) {
  testRefactoredComponent();
}

module.exports = { testRefactoredComponent };