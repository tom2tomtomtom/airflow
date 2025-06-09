const { chromium } = require('playwright');

async function testAuthenticatedNavigation() {
  console.log('🔐 Testing authenticated navigation flow...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log(`CONSOLE: ${msg.text()}`));
  page.on('pageerror', error => console.log(`ERROR: ${error.message}`));
  
  try {
    // Go to login page
    console.log('📍 Navigating to login page...');
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ path: 'login-page.png', fullPage: true });
    
    // Check if there's a test login option or fill in credentials
    console.log('🔍 Looking for login form...');
    
    // Try to find email and password fields
    const emailField = await page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = await page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailField.isVisible() && await passwordField.isVisible()) {
      console.log('✅ Found login form, attempting to log in...');
      
      // Use test credentials (you may need to adjust these)
      await emailField.fill('tomh@redbaez.com'); // or 'test@example.com'
      await passwordField.fill('your-password-here'); // adjust as needed
      
      // Look for submit button
      const submitButton = await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
      
      if (await submitButton.isVisible()) {
        await submitButton.click();
        console.log('🚀 Submitted login form...');
        
        // Wait for navigation or error
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`Current URL after login: ${currentUrl}`);
        
        if (currentUrl.includes('/dashboard')) {
          console.log('✅ Successfully logged in! Testing navigation...');
          
          // Now test Flow navigation
          console.log('🎯 Testing Flow navigation...');
          const flowStartTime = Date.now();
          
          await page.click('text=Flow');
          await page.waitForLoadState('networkidle');
          
          const flowTime = Date.now() - flowStartTime;
          console.log(`Flow navigation took: ${flowTime}ms`);
          console.log(`Flow URL: ${page.url()}`);
          
          await page.screenshot({ path: 'flow-page-authenticated.png', fullPage: true });
          
          // Test other navigation items
          const navItems = ['Clients', 'Campaigns', 'Assets'];
          
          for (const navItem of navItems) {
            console.log(`🧪 Testing ${navItem} navigation...`);
            const navStartTime = Date.now();
            
            try {
              await page.click(`text=${navItem}`);
              await page.waitForLoadState('networkidle', { timeout: 10000 });
              
              const navTime = Date.now() - navStartTime;
              console.log(`✅ ${navItem} navigation: ${navTime}ms - ${page.url()}`);
              
              await page.screenshot({ path: `${navItem.toLowerCase()}-authenticated.png`, fullPage: true });
              
            } catch (error) {
              console.log(`❌ ${navItem} navigation failed: ${error.message}`);
            }
          }
        } else {
          console.log('❌ Login failed or redirected elsewhere');
          await page.screenshot({ path: 'login-failed.png', fullPage: true });
        }
      } else {
        console.log('❌ Could not find submit button');
      }
    } else {
      console.log('❌ Could not find login form fields');
      console.log('🔍 Available elements:');
      
      // Debug - list available form elements
      const inputs = await page.locator('input').all();
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const type = await input.getAttribute('type');
        const name = await input.getAttribute('name');
        const placeholder = await input.getAttribute('placeholder');
        console.log(`   Input ${i}: type=${type}, name=${name}, placeholder=${placeholder}`);
      }
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ path: 'test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run the test
testAuthenticatedNavigation().catch(console.error);