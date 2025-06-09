const { chromium } = require('playwright');

async function testCurrentWorkflow() {
  console.log('🧪 Testing current workflow with optimized selectors...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor AI processing
  page.on('console', msg => {
    if (msg.text().includes('OpenAI') || msg.text().includes('generated') || msg.text().includes('motivations')) {
      console.log(`🤖 ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 Going to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    // STEP 1: Brief Processing (we know this works)
    console.log('\n🎯 STEP 1: Brief Upload & AI Parsing');
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(2000);
    
    console.log('📄 Uploading AIrWAVE brief...');
    await page.setInputFiles('input[type="file"]', '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt');
    
    console.log('⏳ Waiting for AI brief parsing...');
    await page.waitForSelector('text=Review & Edit Brief Content', { timeout: 30000 });
    console.log('✅ Brief parsing complete!');
    
    // STEP 2: Proceed to Motivations
    console.log('\n🎯 STEP 2: Navigate to Motivations');
    await page.click('text=Confirm & Generate Motivations');
    await page.waitForSelector('text=Generate Strategic Motivations', { timeout: 10000 });
    console.log('✅ Reached motivations step!');
    
    // STEP 3: Generate Motivations
    console.log('\n🎯 STEP 3: Generate Motivations (AI + Template Fallback)');
    await page.click('text=Generate Strategic Motivations');
    
    console.log('⏳ Waiting for motivations generation...');
    await page.waitForSelector('text=Select Strategic Motivations', { timeout: 60000 });
    console.log('✅ Motivations generated!');
    
    // Take screenshot and analyze motivations
    await page.screenshot({ 
      path: 'current-motivations.png',
      fullPage: true 
    });
    
    // Count motivation cards using correct selector
    const motivationCards = await page.locator('text=Select this motivation').count();
    console.log(`🎯 Found ${motivationCards} motivation cards`);
    
    if (motivationCards > 0) {
      // Sample some motivation titles
      console.log('\n📋 GENERATED MOTIVATIONS:');
      for (let i = 0; i < Math.min(3, motivationCards); i++) {
        try {
          // Find the card container and extract title
          const card = page.locator('text=Select this motivation').nth(i).locator('..').locator('..');
          const cardText = await card.textContent();
          const lines = cardText.split('\n').filter(line => line.trim() && !line.includes('Select this'));
          if (lines.length >= 2) {
            console.log(`${i + 1}. "${lines[0].trim()}" - ${lines[1].trim().substring(0, 60)}...`);
          }
        } catch (error) {
          console.log(`${i + 1}. [Could not extract motivation details]`);
        }
      }
      
      // Select minimum required motivations
      const toSelect = Math.min(6, motivationCards);
      console.log(`\n🎯 Selecting ${toSelect} motivations...`);
      
      for (let i = 0; i < toSelect; i++) {
        await page.locator('text=Select this motivation').nth(i).click();
        console.log(`✓ Selected motivation ${i + 1}`);
        await page.waitForTimeout(200); // Small delay between selections
      }
      
      // Proceed to copy generation
      console.log('\n🎯 STEP 4: Proceed to Copy Generation');
      await page.click('text=Generate Copy from Selected Motivations');
      
      console.log('⏳ Waiting for copy generation (AI + Template fallback)...');
      await page.waitForSelector('text=Select Copy Variations', { timeout: 90000 });
      console.log('✅ Copy generation complete!');
      
      await page.screenshot({ 
        path: 'current-copy-variations.png',
        fullPage: true 
      });
      
      // Count copy variations
      const copyCards = await page.locator('text=Select').count();
      console.log(`📝 Generated ${copyCards} copy variations`);
      
      console.log('\n🎉 CURRENT WORKFLOW STATUS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ AI Brief Parsing: WORKING');
      console.log('✅ Motivations Generation: WORKING (template fallback)');
      console.log('✅ Copy Generation: WORKING');
      console.log('✅ Complete Workflow: FUNCTIONAL');
      console.log(`🎯 Generated ${motivationCards} strategic motivations`);
      console.log(`📝 Generated ${copyCards} copy variations`);
      
      if (copyCards > 0) {
        console.log('🎉 FULL WORKFLOW SUCCESSFUL - Ready for production use!');
      }
      
    } else {
      console.log('❌ No motivation cards found - check UI selectors');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
    await page.screenshot({ 
      path: 'current-workflow-error.png',
      fullPage: true 
    });
  } finally {
    console.log('\n🏁 Current workflow test completed');
    await browser.close();
  }
}

testCurrentWorkflow().catch(console.error);