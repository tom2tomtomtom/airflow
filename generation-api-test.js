const { chromium } = require('playwright');
const fs = require('fs');
const testData = require('./test-data.js');

async function runGenerationAPITest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './test-videos/' }
  });
  
  const page = await context.newPage();
  
  const testResults = {
    strategy: { passed: 0, failed: 0, tests: [] },
    generate: { passed: 0, failed: 0, tests: [] },
    apis: { passed: 0, failed: 0, tests: [] }
  };
  
  const apiResponses = [];
  const errors = [];

  // Intercept API calls to monitor generation requests
  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/strategy-generate') || 
        url.includes('/api/copy-generate') || 
        url.includes('/api/ai/generate')) {
      try {
        const responseData = await response.json();
        apiResponses.push({
          url,
          status: response.status(),
          data: responseData,
          timestamp: new Date().toISOString()
        });
        console.log(`📡 API Response: ${url} - Status: ${response.status()}`);
      } catch (e) {
        console.log(`📡 API Response: ${url} - Status: ${response.status()} (non-JSON)`);
      }
    }
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });

  async function runTest(testName, testFn, category) {
    try {
      console.log(`🧪 Running: ${testName}`);
      await testFn();
      testResults[category].passed++;
      testResults[category].tests.push({ name: testName, result: 'PASS' });
      console.log(`✅ ${testName} - PASSED`);
    } catch (error) {
      testResults[category].failed++;
      testResults[category].tests.push({ name: testName, result: 'FAIL', error: error.message });
      console.error(`❌ ${testName} - FAILED:`, error.message);
    }
  }

  async function loginWithTestUser() {
    await page.goto('http://localhost:3000/login');
    
    // Use test credentials
    await page.fill('input[type="email"]', 'test@airwave.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    
    // Don't actually submit - just prepare for testing
    console.log('🔐 Login credentials filled (not submitted for testing)');
  }

  async function waitForGeneration(expectedTime = 5000) {
    console.log('⏳ Waiting for generation to complete...');
    await page.waitForTimeout(expectedTime);
  }

  async function checkGenerationResults(selector, itemName) {
    await page.waitForTimeout(2000);
    const results = await page.locator(selector);
    const count = await results.count();
    console.log(`📊 Found ${count} ${itemName} results`);
    return count > 0;
  }

  console.log('\n🚀 STARTING GENERATION API TEST WITH REAL DATA\n');

  try {
    await loginWithTestUser();

    // TEST 1: Strategy Generation with Real Brief Data
    console.log('\n📋 TESTING STRATEGY PAGE WITH REAL GENERATION');
    
    await runTest('Strategy Brief Input with Real Data', async () => {
      await page.goto('http://localhost:3000/strategy');
      await page.waitForTimeout(3000);
      
      // Use real test brief data
      const brief = testData.briefs[0];
      
      await page.fill('textarea[placeholder*="brief"]', brief.content);
      await page.fill('input[placeholder*="audience"]', brief.target_audience);
      await page.fill('input[placeholder*="objective"]', brief.campaign_objectives);
      
      // Create brief
      await page.click('button:has-text("Create Brief")');
      await page.waitForTimeout(2000);
      
      console.log('📝 Brief created with real test data');
    }, 'strategy');

    await runTest('Generate Real Motivations', async () => {
      // Click generate motivations - this should call real API
      await page.click('button:has-text("Generate Motivations")');
      
      // Wait for API call and response
      await waitForGeneration(8000);
      
      // Check if motivations were generated
      const hasMotivations = await checkGenerationResults('.motivation-card, [data-testid*="motivation"]', 'motivation');
      
      if (!hasMotivations) {
        // Check for error messages
        const errorMsg = await page.locator('.error, [role="alert"]').textContent();
        throw new Error(`No motivations generated. Error: ${errorMsg || 'Unknown'}`);
      }
    }, 'strategy');

    await runTest('Select Motivations and Platform Settings', async () => {
      // Select first 2 motivations
      const motivations = await page.locator('.motivation-card, [data-testid*="motivation"]');
      const count = await motivations.count();
      
      for (let i = 0; i < Math.min(2, count); i++) {
        await motivations.nth(i).click();
        await page.waitForTimeout(500);
      }
      
      // Set platform and tone settings for copy generation
      const platformSelect = await page.locator('.MuiSelect-root, select').first();
      if (await platformSelect.count() > 0) {
        await platformSelect.click();
        await page.waitForTimeout(500);
        
        // Select platforms from test data
        for (const platform of testData.copyParameters[0].platforms) {
          const option = await page.locator(`text="${platform}"`);
          if (await option.count() > 0) {
            await option.click();
            await page.waitForTimeout(300);
          }
        }
      }
      
      console.log('✅ Motivations selected and platforms configured');
    }, 'strategy');

    await runTest('Generate Real Copy Variations', async () => {
      // Generate copy with real API call
      await page.click('button:has-text("Generate Copy")');
      
      // Wait for copy generation
      await waitForGeneration(10000);
      
      // Check for generated copy
      const hasCopy = await checkGenerationResults('.copy-variation, [data-testid*="copy"]', 'copy variation');
      
      if (!hasCopy) {
        const errorMsg = await page.locator('.error, [role="alert"]').textContent();
        throw new Error(`No copy generated. Error: ${errorMsg || 'Unknown'}`);
      }
    }, 'strategy');

    // TEST 2: Generate Page with Real API Calls
    console.log('\n🎨 TESTING GENERATE PAGE WITH REAL APIS');
    
    await runTest('Generate Page Brief Input', async () => {
      await page.goto('http://localhost:3000/generate-enhanced');
      await page.waitForTimeout(3000);
      
      // Use real brief data
      const brief = testData.briefs[1];
      await page.fill('textarea[placeholder*="brief"]', brief.content);
      
      console.log('📝 Brief filled on generate page');
    }, 'generate');

    await runTest('Generate Strategy Motivations', async () => {
      await page.click('[data-testid="generate-motivations"], button:has-text("Generate Motivations")');
      
      // Wait for real API response
      await waitForGeneration(8000);
      
      const hasMotivations = await checkGenerationResults('[data-testid*="motivation"], .motivation-card', 'motivation');
      
      if (!hasMotivations) {
        throw new Error('No motivations generated on generate page');
      }
    }, 'generate');

    await runTest('Generate Images with Real Prompts', async () => {
      // Switch to image tab
      await page.click('[role="tab"]:has-text("Images"), button:has-text("Images")');
      await page.waitForTimeout(1000);
      
      // Use real image prompt from test data
      const imagePrompt = testData.imagePrompts[0];
      await page.fill('textarea[placeholder*="prompt"], input[placeholder*="prompt"]', imagePrompt.prompt);
      
      // Set style if available
      const styleSelect = await page.locator('select[id*="style"], .MuiSelect-root');
      if (await styleSelect.count() > 0) {
        await styleSelect.click();
        await page.waitForTimeout(500);
        await page.click(`text="${imagePrompt.style}"`);
      }
      
      // Generate images
      await page.click('button:has-text("Generate Images"), button:has-text("Generate")');
      
      // Wait for image generation (longer timeout)
      await waitForGeneration(15000);
      
      console.log('🖼️ Image generation initiated with real prompt');
    }, 'generate');

    await runTest('Generate Video with Real Prompt', async () => {
      // Switch to video tab
      await page.click('[role="tab"]:has-text("Videos"), button:has-text("Video")');
      await page.waitForTimeout(1000);
      
      // Use real video prompt
      const videoPrompt = testData.videoPrompts[0];
      await page.fill('textarea[placeholder*="video"], input[placeholder*="video"]', videoPrompt.prompt);
      
      // Set duration
      const durationInput = await page.locator('input[type="range"], input[type="number"]');
      if (await durationInput.count() > 0) {
        await durationInput.fill(videoPrompt.duration.toString());
      }
      
      // Generate video
      await page.click('button:has-text("Generate Video"), button:has-text("Generate")');
      
      // Wait for video generation
      await waitForGeneration(20000);
      
      console.log('🎥 Video generation initiated with real prompt');
    }, 'generate');

    await runTest('Generate Voice with Real Script', async () => {
      // Switch to voice tab
      await page.click('[role="tab"]:has-text("Voice"), button:has-text("Voice")');
      await page.waitForTimeout(1000);
      
      // Use real voice script
      const voiceScript = testData.voiceScripts[0];
      await page.fill('textarea[placeholder*="text"], textarea[placeholder*="voice"]', voiceScript.text);
      
      // Set voice type if available
      const voiceSelect = await page.locator('select[id*="voice"]');
      if (await voiceSelect.count() > 0) {
        await voiceSelect.selectOption(voiceScript.voice);
      }
      
      // Generate voice
      await page.click('button:has-text("Generate Voice"), button:has-text("Generate")');
      
      // Wait for voice generation
      await waitForGeneration(10000);
      
      console.log('🎤 Voice generation initiated with real script');
    }, 'generate');

    // TEST 3: API Response Validation
    await runTest('Validate API Responses', async () => {
      console.log(`📊 Total API calls made: ${apiResponses.length}`);
      
      let successfulCalls = 0;
      let failedCalls = 0;
      
      for (const response of apiResponses) {
        if (response.status >= 200 && response.status < 300) {
          successfulCalls++;
          console.log(`✅ API Success: ${response.url}`);
        } else {
          failedCalls++;
          console.log(`❌ API Failed: ${response.url} - Status: ${response.status}`);
        }
      }
      
      if (failedCalls > successfulCalls) {
        throw new Error(`More API calls failed (${failedCalls}) than succeeded (${successfulCalls})`);
      }
      
      console.log(`📈 API Summary: ${successfulCalls} success, ${failedCalls} failed`);
    }, 'apis');

  } catch (error) {
    console.error('Test execution error:', error);
    errors.push({
      type: 'test',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  await page.screenshot({ path: './screenshots/generation-test-final.png', fullPage: true });
  await browser.close();

  // Generate comprehensive report
  const totalTests = Object.values(testResults).reduce((sum, cat) => sum + cat.passed + cat.failed, 0);
  const totalPassed = Object.values(testResults).reduce((sum, cat) => sum + cat.passed, 0);
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

  const report = {
    testType: 'Generation API Test with Real Data',
    timestamp: new Date().toISOString(),
    testData: {
      briefsUsed: testData.briefs.length,
      promptsUsed: testData.imagePrompts.length + testData.videoPrompts.length,
      scriptsUsed: testData.voiceScripts.length
    },
    summary: {
      totalTests,
      totalPassed,
      totalFailed: totalTests - totalPassed,
      successRate: `${successRate}%`,
      apiCallsMade: apiResponses.length,
      totalErrors: errors.length
    },
    testResults,
    apiResponses,
    errors,
    recommendations: []
  };

  // Add recommendations
  if (successRate >= 80) {
    report.recommendations.push('🎉 Great: Generation APIs working well with real data');
  } else {
    report.recommendations.push('⚠️ Generation APIs need attention');
  }

  if (apiResponses.length > 5) {
    report.recommendations.push('✅ Good API coverage - multiple generation endpoints tested');
  } else {
    report.recommendations.push('ℹ️ Limited API testing - consider expanding coverage');
  }

  if (errors.length === 0) {
    report.recommendations.push('✅ No errors detected during generation testing');
  } else {
    report.recommendations.push(`⚠️ ${errors.length} errors found during testing`);
  }

  // Save results
  fs.writeFileSync('./GENERATION_API_TEST_REPORT.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎊 GENERATION API TEST COMPLETE');
  console.log(`📊 Results: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);
  console.log(`📡 API calls: ${apiResponses.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log('📄 Full report saved to GENERATION_API_TEST_REPORT.json');
  
  return report;
}

// Create directories
if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');
if (!fs.existsSync('./test-videos')) fs.mkdirSync('./test-videos');

runGenerationAPITest().catch(console.error);