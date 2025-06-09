const { chromium } = require('playwright');

async function testCompleteAIWorkflow() {
  console.log('🤖 Testing complete AI-powered workflow...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor all console messages to track AI processing
  page.on('console', msg => {
    if (msg.text().includes('OpenAI') || msg.text().includes('generated') || msg.text().includes('motivations') || msg.text().includes('copy')) {
      console.log(`🤖 AI: ${msg.text()}`);
    }
  });
  
  // Monitor network requests to track API calls
  page.on('response', response => {
    if (response.url().includes('/api/flow/')) {
      const urlParts = response.url().split('/');
      const endpoint = urlParts[urlParts.length - 1];
      console.log(`📡 API: ${endpoint} - ${response.status()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    // STEP 1: Upload and Parse Brief with AI
    console.log('\n🎯 STEP 1: AI Brief Parsing');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(2000);
    
    console.log('📄 Uploading AIrWAVE brief...');
    await page.setInputFiles('input[type="file"]', '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt');
    
    console.log('⏳ Waiting for AI brief parsing...');
    await page.waitForSelector('text=Review & Edit Brief Content', { timeout: 30000 });
    console.log('✅ AI brief parsing complete!');
    
    // Quick validation of parsed content
    const briefTitle = await page.locator('label:has-text("Brief Title")').locator('..').locator('input').first().inputValue();
    console.log(`📋 Parsed title: "${briefTitle.substring(0, 40)}..."`);
    
    // STEP 2: Proceed to AI Motivations Generation
    console.log('\n🎯 STEP 2: AI Motivations Generation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await page.click('text=Confirm & Generate Motivations');
    console.log('🚀 Proceeding to motivations...');
    
    // Wait for motivations step and AI generation
    await page.waitForSelector('text=Generate Strategic Motivations', { timeout: 10000 });
    console.log('✅ Reached motivations step!');
    
    console.log('🤖 Triggering AI motivations generation...');
    await page.click('text=Generate Strategic Motivations');
    
    console.log('⏳ Waiting for AI to generate motivations (up to 45 seconds)...');
    await page.waitForSelector('text=Select Strategic Motivations', { timeout: 45000 });
    console.log('✅ AI motivations generation complete!');
    
    // Count generated motivations
    const motivationCards = await page.locator('[role="button"]:has-text("Select this motivation")').count();
    console.log(`🎯 Generated ${motivationCards} AI-powered motivations`);
    
    // Take screenshot of motivations
    await page.screenshot({ 
      path: 'ai-motivations-generated.png',
      fullPage: true 
    });
    
    // Select 6 motivations (minimum required)
    console.log('🎯 Selecting 6 motivations for copy generation...');
    for (let i = 0; i < Math.min(6, motivationCards); i++) {
      await page.locator('[role="button"]:has-text("Select this motivation")').nth(i).click();
      console.log(`✓ Selected motivation ${i + 1}`);
    }
    
    // STEP 3: Proceed to AI Copy Generation
    console.log('\n🎯 STEP 3: AI Copy Generation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await page.click('text=Generate Copy from Selected Motivations');
    console.log('🚀 Triggering AI copy generation...');
    
    console.log('⏳ Waiting for AI to generate copy variations (up to 60 seconds)...');
    await page.waitForSelector('text=Select Copy Variations', { timeout: 60000 });
    console.log('✅ AI copy generation complete!');
    
    // Count generated copy variations
    const copyCards = await page.locator('text=Select:checked').count();
    const totalCopy = await page.locator('[role="button"]:has-text("Select")').count();
    console.log(`📝 Generated ${totalCopy} AI-powered copy variations`);
    
    // Take screenshot of copy variations
    await page.screenshot({ 
      path: 'ai-copy-generated.png',
      fullPage: true 
    });
    
    // Sample some copy text
    console.log('\n📝 SAMPLE AI-GENERATED COPY:');
    for (let i = 0; i < Math.min(3, totalCopy); i++) {
      try {
        const copyText = await page.locator('text=Select').nth(i).locator('..').locator('..').textContent();
        const lines = copyText.split('\n').filter(line => line.trim() && !line.includes('Select'));
        if (lines.length > 0) {
          console.log(`${i + 1}. "${lines[0].trim()}"`);
        }
      } catch (error) {
        console.log(`${i + 1}. [Could not extract copy text]`);
      }
    }
    
    console.log('\n🎉 COMPLETE AI WORKFLOW TEST RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ AI Brief Parsing: WORKING');
    console.log('✅ AI Motivations Generation: WORKING');  
    console.log('✅ AI Copy Generation: WORKING');
    console.log('✅ Complete Workflow Integration: SUCCESSFUL');
    console.log(`🎯 Generated ${motivationCards} strategic motivations`);
    console.log(`📝 Generated ${totalCopy} copy variations`);
    console.log('🤖 All AI systems operational and producing quality output!');
    
  } catch (error) {
    console.error('🚨 Workflow test failed:', error);
    await page.screenshot({ 
      path: 'ai-workflow-error.png',
      fullPage: true 
    });
  } finally {
    console.log('\n🏁 Complete AI workflow test completed');
    await browser.close();
  }
}

testCompleteAIWorkflow().catch(console.error);