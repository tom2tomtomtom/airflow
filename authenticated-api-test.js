const { chromium } = require('playwright');
const testData = require('./test-data.js');

async function authenticatedAPITest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const apiResponses = [];
  const errors = [];
  
  // Intercept ALL network requests to see what's happening
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/')) {
      console.log(`🔄 API Request: ${request.method()} ${url}`);
    }
  });

  // Intercept API responses
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/')) {
      try {
        const responseText = await response.text();
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch {
          responseData = responseText;
        }
        
        apiResponses.push({
          url,
          method: response.request().method(),
          status: response.status(),
          data: responseData,
          timestamp: new Date().toISOString()
        });
        
        console.log(`📡 API Response: ${response.request().method()} ${url} - Status: ${response.status()}`);
        if (response.status() !== 200) {
          console.log(`⚠️ Non-200 response:`, responseData);
        }
      } catch (e) {
        console.log(`📡 API Response: ${url} - Status: ${response.status()} (parse error)`);
      }
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
      errors.push({
        type: 'console',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });

  console.log('🚀 Authenticated API Test - Login and Generate Content\n');

  try {
    // Step 1: Try to create a test account through the UI
    console.log('👤 Step 1: Creating test account through signup page');
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(3000);
    
    // Try to fill signup form if it exists
    try {
      await page.fill('input[name="email"], input[type="email"]', 'test@airwave.com');
      await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');
      await page.fill('input[name="name"], input[placeholder*="name"]', 'Test User');
      
      // Look for signup button
      const signupBtn = await page.locator('button:has-text("Sign Up"), button:has-text("Create Account")');
      if (await signupBtn.count() > 0) {
        await signupBtn.click();
        console.log('✅ Signup form submitted');
        await page.waitForTimeout(3000);
      }
    } catch (e) {
      console.log('ℹ️ Signup form not found or already exists, proceeding to login');
    }

    // Step 2: Login with test credentials
    console.log('🔐 Step 2: Logging in with test credentials');
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);
    
    // Fill login form
    await page.fill('input[name="email"], input[type="email"]', 'test@airwave.com');
    await page.fill('input[name="password"], input[type="password"]', 'TestPassword123!');
    
    // Submit login
    const loginBtn = await page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');
    if (await loginBtn.count() > 0) {
      await loginBtn.click();
      console.log('✅ Login form submitted');
      await page.waitForTimeout(5000); // Wait for login to complete
    }
    
    // Check if we're logged in by looking for dashboard or redirect
    const currentUrl = page.url();
    console.log(`🌐 Current URL after login: ${currentUrl}`);
    
    // If we're still on login page, try alternative credentials
    if (currentUrl.includes('/login')) {
      console.log('🔄 Still on login page, trying alternative approach...');
      
      // Try with demo credentials that might exist
      await page.fill('input[name="email"], input[type="email"]', 'demo@airwave.com');
      await page.fill('input[name="password"], input[type="password"]', 'password123');
      await loginBtn.click();
      await page.waitForTimeout(3000);
    }

    // Step 3: Navigate to strategy page and test generation
    console.log('📋 Step 3: Testing strategy page with authentication');
    await page.goto('http://localhost:3000/strategy');
    await page.waitForTimeout(3000);
    
    const strategyUrl = page.url();
    console.log(`🌐 Strategy page URL: ${strategyUrl}`);
    
    if (!strategyUrl.includes('/login')) {
      console.log('✅ Successfully accessed strategy page!');
      
      // Fill real brief data
      const briefContent = testData.briefs[0].content;
      const textareas = await page.locator('textarea');
      if (await textareas.count() > 0) {
        await textareas.first().fill(briefContent);
        console.log('✅ Brief content filled with real test data');
      }
      
      // Fill additional fields
      const inputs = await page.locator('input[type="text"]');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        await inputs.nth(0).fill(testData.briefs[0].target_audience);
        console.log('✅ Target audience filled');
      }
      
      if (inputCount > 1) {
        await inputs.nth(1).fill(testData.briefs[0].campaign_objectives);
        console.log('✅ Campaign objectives filled');
      }
      
      // Click Create Brief button
      const createBtn = await page.locator('button:has-text("Create Brief")');
      if (await createBtn.count() > 0) {
        await createBtn.click();
        console.log('✅ Create Brief clicked');
        await page.waitForTimeout(2000);
      }
      
      // Click Generate Motivations button - this should make real API call
      const generateBtn = await page.locator('button:has-text("Generate Motivations")');
      if (await generateBtn.count() > 0) {
        console.log('🔄 Clicking Generate Motivations - should trigger API call...');
        await generateBtn.click();
        
        // Wait longer for API response
        console.log('⏳ Waiting for motivation generation API response...');
        await page.waitForTimeout(10000);
        
        // Check for results
        const motivationCards = await page.locator('.motivation-card, [data-testid*="motivation"]');
        const motivationCount = await motivationCards.count();
        console.log(`📊 Found ${motivationCount} motivation cards`);
        
        if (motivationCount > 0) {
          console.log('🎉 Motivations generated successfully!');
          
          // Select some motivations
          for (let i = 0; i < Math.min(2, motivationCount); i++) {
            await motivationCards.nth(i).click();
            await page.waitForTimeout(500);
          }
          console.log('✅ Motivations selected');
          
          // Try to generate copy
          const copyBtn = await page.locator('button:has-text("Generate Copy")');
          if (await copyBtn.count() > 0) {
            console.log('🔄 Clicking Generate Copy - should trigger another API call...');
            await copyBtn.click();
            await page.waitForTimeout(8000);
            
            const copyCards = await page.locator('.copy-variation, [data-testid*="copy"]');
            const copyCount = await copyCards.count();
            console.log(`📊 Found ${copyCount} copy variations`);
          }
        }
      }
    } else {
      console.log('❌ Still redirected to login - authentication failed');
    }

    // Step 4: Test generate page if authenticated
    console.log('🎨 Step 4: Testing generate page');
    await page.goto('http://localhost:3000/generate-enhanced');
    await page.waitForTimeout(3000);
    
    const generateUrl = page.url();
    if (!generateUrl.includes('/login')) {
      console.log('✅ Successfully accessed generate page!');
      
      // Fill brief textarea
      const textareas = await page.locator('textarea');
      if (await textareas.count() > 0) {
        await textareas.first().fill(testData.briefs[1].content);
        console.log('✅ Generate page brief filled');
      }
      
      // Click generate motivations
      const genMotivationBtn = await page.locator('button:has-text("Generate Motivations")');
      if (await genMotivationBtn.count() > 0) {
        console.log('🔄 Clicking Generate Motivations on generate page...');
        await genMotivationBtn.click();
        await page.waitForTimeout(8000);
      }
    }

    await page.screenshot({ path: './screenshots/authenticated-test-final.png', fullPage: true });

  } catch (error) {
    console.error('❌ Test execution error:', error);
    errors.push({
      type: 'test',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  await browser.close();

  // Generate report
  const report = {
    testType: 'Authenticated API Test',
    timestamp: new Date().toISOString(),
    summary: {
      apiCallsMade: apiResponses.length,
      successfulCalls: apiResponses.filter(r => r.status >= 200 && r.status < 300).length,
      failedCalls: apiResponses.filter(r => r.status >= 400).length,
      totalErrors: errors.length
    },
    apiResponses,
    errors,
    testData: {
      briefsUsed: testData.briefs.length,
      realContentLength: testData.briefs[0].content.length
    }
  };

  // Save results
  require('fs').writeFileSync('./AUTHENTICATED_API_REPORT.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎊 AUTHENTICATED API TEST COMPLETE');
  console.log(`📊 API Calls Made: ${apiResponses.length}`);
  console.log(`✅ Successful Calls: ${report.summary.successfulCalls}`);
  console.log(`❌ Failed Calls: ${report.summary.failedCalls}`);
  console.log(`🐛 Errors: ${errors.length}`);
  console.log('📄 Full report saved to AUTHENTICATED_API_REPORT.json');
  
  if (apiResponses.length > 0) {
    console.log('\n📡 API RESPONSES CAPTURED:');
    apiResponses.forEach(response => {
      console.log(`- ${response.method} ${response.url} - ${response.status}`);
    });
  } else {
    console.log('\n⚠️ No API responses captured - check authentication');
  }
  
  return report;
}

authenticatedAPITest();