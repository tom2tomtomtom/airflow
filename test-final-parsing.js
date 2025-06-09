const { chromium } = require('playwright');

async function testFinalParsing() {
  console.log('🎯 FINAL TEST: Complete parsing validation for AIrWAVE brief...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced console logging for debugging
  page.on('console', msg => {
    if (msg.text().includes('Brief parsed') || msg.text().includes('OpenAI')) {
      console.log(`🤖 ${msg.text()}`);
    }
  });
  
  try {
    console.log('📍 Navigating to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    // Start workflow
    console.log('🚀 Starting workflow...');
    await page.click('[data-testid="start-flow-button"]');
    await page.waitForTimeout(1000);
    
    // Upload the AIrWAVE brief
    console.log('📄 Uploading AIrWAVE 2.0 brief...');
    const briefPath = '/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt';
    await page.setInputFiles('input[type="file"]', briefPath);
    
    // Wait for processing
    console.log('⏳ Waiting for brief processing...');
    await page.waitForTimeout(8000);
    
    // Check if review interface appeared
    const reviewVisible = await page.locator('text=Review & Edit Brief Content').isVisible();
    if (!reviewVisible) {
      console.log('❌ Review interface not visible, waiting longer...');
      await page.waitForTimeout(5000);
      
      if (!(await page.locator('text=Review & Edit Brief Content').isVisible())) {
        console.log('❌ Review interface still not visible after 13 seconds');
        await page.screenshot({ path: 'final-parsing-timeout.png', fullPage: true });
        return;
      }
    }
    
    console.log('✅ Review interface is visible! Analyzing parsing results...');
    
    // Take comprehensive screenshot
    await page.screenshot({ 
      path: 'final-parsing-results.png',
      fullPage: true 
    });
    
    // Comprehensive field analysis for AIrWAVE brief
    const fieldAnalysis = [
      {
        label: 'Brief Title',
        expectedContent: ['AIrWAVE', '2.0', 'Global Launch'],
        weight: 2
      },
      {
        label: 'Industry', 
        expectedContent: ['marketing', 'digital', 'advertising', 'ecommerce'],
        weight: 1
      },
      {
        label: 'Objective',
        expectedContent: ['Position', 'game-changing', 'brands', 'agencies'],
        weight: 3
      },
      {
        label: 'Target Audience',
        expectedContent: ['Digital marketers', 'creative agencies', 'CMOs', 'decision-makers'],
        weight: 3
      },
      {
        label: 'Value Proposition',
        expectedContent: ['Create', 'Test', 'Iterate', 'Scale', 'personalized'],
        weight: 2
      },
      {
        label: 'Product/Service Description',
        expectedContent: ['AI-powered', 'platform', 'advertising', 'executions'],
        weight: 2
      }
    ];
    
    console.log('\n📊 COMPREHENSIVE PARSING ANALYSIS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    let totalScore = 0;
    let maxScore = 0;
    
    for (const field of fieldAnalysis) {
      try {
        const input = page.locator(`label:has-text("${field.label}")`).locator('..').locator('input, textarea').first();
        
        if (await input.isVisible()) {
          const value = await input.inputValue();
          const hasContent = value && value.trim().length > 0;
          
          if (hasContent) {
            // Check how many expected content pieces are found
            const valueLower = value.toLowerCase();
            const foundContent = field.expectedContent.filter(content => 
              valueLower.includes(content.toLowerCase())
            );
            
            const contentScore = (foundContent.length / field.expectedContent.length) * field.weight;
            totalScore += contentScore;
            
            const percentage = (foundContent.length / field.expectedContent.length) * 100;
            
            if (percentage >= 75) {
              console.log(`🎉 ${field.label}: EXCELLENT (${percentage.toFixed(0)}%)`);
              console.log(`   "${value.substring(0, 80)}..."`);
              console.log(`   ✅ Found: ${foundContent.join(', ')}`);
            } else if (percentage >= 50) {
              console.log(`✅ ${field.label}: GOOD (${percentage.toFixed(0)}%)`);
              console.log(`   "${value.substring(0, 80)}..."`);
              console.log(`   ✅ Found: ${foundContent.join(', ')}`);
            } else if (percentage >= 25) {
              console.log(`⚠️ ${field.label}: PARTIAL (${percentage.toFixed(0)}%)`);
              console.log(`   "${value.substring(0, 80)}..."`);
              if (foundContent.length > 0) {
                console.log(`   ✅ Found: ${foundContent.join(', ')}`);
              }
            } else {
              console.log(`❌ ${field.label}: POOR - content found but doesn't match expected`);
              console.log(`   "${value.substring(0, 80)}..."`);
            }
          } else {
            console.log(`❌ ${field.label}: EMPTY`);
          }
        } else {
          console.log(`❌ ${field.label}: FIELD NOT FOUND`);
        }
        
        maxScore += field.weight;
        
      } catch (error) {
        console.log(`❌ ${field.label}: ERROR - ${error.message}`);
        maxScore += field.weight;
      }
    }
    
    // Check key messages specifically
    console.log('\n📋 KEY MESSAGES ANALYSIS:');
    try {
      // Look for key message fields in the form
      const allInputs = await page.locator('input, textarea').all();
      let keyMessageCount = 0;
      
      for (const input of allInputs) {
        const value = await input.inputValue();
        if (value && (
          value.includes('future of creative') ||
          value.includes('Create. Test. Iterate') ||
          value.includes('personalized ads') ||
          value.includes('transform your ad strategy')
        )) {
          keyMessageCount++;
          console.log(`✅ Key Message Found: "${value.substring(0, 60)}..."`);
        }
      }
      
      if (keyMessageCount >= 3) {
        console.log(`🎉 EXCELLENT: Found ${keyMessageCount} relevant key messages`);
      } else if (keyMessageCount >= 1) {
        console.log(`✅ GOOD: Found ${keyMessageCount} relevant key messages`);
      } else {
        console.log(`⚠️ LIMITED: Key messages need improvement`);
      }
      
    } catch (error) {
      console.log('Could not analyze key messages in detail');
    }
    
    const finalScore = (totalScore / maxScore) * 100;
    
    console.log('\n🏆 FINAL PARSING QUALITY ASSESSMENT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 Overall Score: ${finalScore.toFixed(1)}%`);
    
    if (finalScore >= 80) {
      console.log('🎉 OUTSTANDING! Your brief parsing is working excellently');
      console.log('   The system successfully extracted detailed information from your AIrWAVE brief');
    } else if (finalScore >= 65) {
      console.log('✅ VERY GOOD! Brief parsing is working well');
      console.log('   Most important information was successfully extracted');
    } else if (finalScore >= 50) {
      console.log('👍 GOOD! Basic parsing working, room for improvement');
      console.log('   Consider adding OpenAI API key for better results');
    } else {
      console.log('⚠️ NEEDS IMPROVEMENT! Parsing is basic');
      console.log('   Recommend adding OpenAI API key for better extraction');
    }
    
    // Test workflow continuation
    console.log('\n🎯 Testing workflow continuation...');
    const proceedBtn = page.locator('text=Confirm & Generate Motivations');
    if (await proceedBtn.isVisible()) {
      console.log('✅ Ready to proceed to motivations generation');
      console.log('🎉 COMPLETE SUCCESS: Brief parsing and workflow ready!');
    } else {
      console.log('❌ Proceed button not found');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'final-parsing-error.png',
      fullPage: true 
    });
  } finally {
    console.log('\n🏁 Final parsing test completed');
    await browser.close();
  }
}

testFinalParsing().catch(console.error);