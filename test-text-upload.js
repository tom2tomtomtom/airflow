const { chromium } = require('playwright');

async function testTextUpload() {
  console.log('📄 Testing text file upload with enhanced parsing...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced console logging
  page.on('console', msg => {
    console.log(`CONSOLE: ${msg.text()}`);
  });
  
  try {
    console.log('📍 Navigating to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    // Start workflow
    console.log('🚀 Starting workflow...');
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(1000);
    
    // Upload the text file instead of .docx
    console.log('📄 Uploading text file (easier to parse)...');
    const briefPath = '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt';
    await page.setInputFiles('input[type="file"]', briefPath);
    
    // Wait for processing
    console.log('⏳ Waiting for processing...');
    await page.waitForTimeout(10000);
    
    // Check if review interface appeared
    const reviewVisible = await page.locator('text=Review & Edit Brief Content').isVisible();
    if (!reviewVisible) {
      console.log('❌ Review interface not found');
      
      // Check if there's an error message
      const pageText = await page.textContent('body');
      if (pageText.includes('Processing brief with AI')) {
        console.log('ℹ️ Still processing - let us wait a bit more...');
        await page.waitForTimeout(10000);
        
        const reviewVisible2 = await page.locator('text=Review & Edit Brief Content').isVisible();
        if (reviewVisible2) {
          console.log('✅ Review interface appeared after extended wait!');
        } else {
          console.log('❌ Review interface still not showing after 20 seconds');
        }
      }
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: 'text-upload-debug.png',
        fullPage: true 
      });
      return;
    }
    
    console.log('✅ Review interface appeared! Checking parsed content...');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'text-upload-success.png',
      fullPage: true 
    });
    
    // Check specific fields for the Redbaez AIrWAVE brief
    const fields = [
      { label: 'Brief Title', test: (value) => value.includes('AIrWAVE') },
      { label: 'Industry', test: (value) => value.length > 0 },
      { label: 'Objective', test: (value) => value.includes('Position') || value.includes('game-changing') },
      { label: 'Target Audience', test: (value) => value.includes('Digital marketers') || value.includes('agencies') },
      { label: 'Value Proposition', test: (value) => value.length > 0 },
      { label: 'Product/Service Description', test: (value) => value.length > 0 }
    ];
    
    console.log('\n🔍 CHECKING PARSING QUALITY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let qualityScore = 0;
    
    for (const field of fields) {
      try {
        const input = page.locator(`label:has-text("${field.label}")`).locator('..').locator('input, textarea').first();
        if (await input.isVisible()) {
          const value = await input.inputValue();
          const hasContent = value && value.trim().length > 0;
          const passesTest = hasContent && field.test(value);
          
          if (passesTest) {
            console.log(`✅ ${field.label}: EXCELLENT - "${value.substring(0, 60)}..."`);
            qualityScore += 2;
          } else if (hasContent) {
            console.log(`⚠️ ${field.label}: OK - "${value.substring(0, 60)}..."`);
            qualityScore += 1;
          } else {
            console.log(`❌ ${field.label}: EMPTY`);
          }
        } else {
          console.log(`❌ ${field.label}: FIELD NOT FOUND`);
        }
      } catch (error) {
        console.log(`❌ ${field.label}: ERROR - ${error.message}`);
      }
    }
    
    const maxScore = fields.length * 2;
    const percentage = (qualityScore / maxScore) * 100;
    
    console.log('\n🏆 PARSING QUALITY RESULTS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Quality Score: ${qualityScore}/${maxScore} (${percentage.toFixed(1)}%)`);
    
    if (percentage >= 80) {
      console.log('🎉 EXCELLENT! Parsing is working very well');
    } else if (percentage >= 60) {
      console.log('✅ GOOD! Parsing is working but could be better');
    } else if (percentage >= 40) {
      console.log('⚠️ FAIR! Basic parsing working, needs OpenAI integration');
    } else {
      console.log('❌ POOR! Parsing needs significant improvement');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'text-upload-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testTextUpload().catch(console.error);