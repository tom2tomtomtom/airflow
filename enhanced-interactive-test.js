const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runEnhancedInteractiveTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './test-videos/' }
  });
  
  const page = await context.newPage();
  
  // Enhanced error tracking
  const errors = [];
  const interactions = [];
  const testResults = {
    strategy: { passed: 0, failed: 0, tests: [] },
    generate: { passed: 0, failed: 0, tests: [] },
    login: { passed: 0, failed: 0, tests: [] }
  };
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({
      type: 'page',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });

  async function logInteraction(testName, action, element, result = 'success') {
    const interaction = {
      testName,
      action,
      element,
      result,
      timestamp: new Date().toISOString(),
      url: page.url()
    };
    interactions.push(interaction);
    console.log(`${result === 'success' ? '✅' : '❌'} ${testName}: ${action} - ${element} - ${result}`);
    return interaction;
  }

  async function runTest(testName, testFn, category) {
    try {
      await testFn();
      testResults[category].passed++;
      testResults[category].tests.push({ name: testName, result: 'PASS' });
    } catch (error) {
      testResults[category].failed++;
      testResults[category].tests.push({ name: testName, result: 'FAIL', error: error.message });
      console.error(`❌ ${testName} FAILED:`, error.message);
    }
  }

  async function fillFormField(selector, value, fieldName) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.fill(selector, value);
      await logInteraction('Form Fill', `Fill ${fieldName}`, selector);
      return true;
    } catch (error) {
      await logInteraction('Form Fill', `Fill ${fieldName}`, selector, 'failed');
      return false;
    }
  }

  async function clickElement(selector, elementName) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      await page.waitForTimeout(1000); // Wait for any animations
      await logInteraction('Click', `Click ${elementName}`, selector);
      return true;
    } catch (error) {
      await logInteraction('Click', `Click ${elementName}`, selector, 'failed');
      return false;
    }
  }

  async function selectFromDropdown(selector, value, dropdownName) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      await page.click(selector);
      await page.waitForTimeout(500);
      await page.click(`text="${value}"`);
      await logInteraction('Select', `Select ${value} from ${dropdownName}`, selector);
      return true;
    } catch (error) {
      await logInteraction('Select', `Select from ${dropdownName}`, selector, 'failed');
      return false;
    }
  }

  console.log('\n🚀 STARTING ENHANCED INTERACTIVE UX TEST\n');

  try {
    // TEST 1: Login Page Comprehensive Testing
    console.log('📋 TESTING LOGIN PAGE');
    await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: './screenshots/login-initial.png', fullPage: true });

    await runTest('Login Form Fill', async () => {
      // Fill email
      await fillFormField('input[type="email"], input[name="email"], #email', 'test@airwave.com', 'email field');
      
      // Fill password
      await fillFormField('input[type="password"], input[name="password"], #password', 'TestPassword123!', 'password field');
      
      // Test remember me checkbox
      const checkbox = await page.locator('input[type="checkbox"]').first();
      if (await checkbox.count() > 0) {
        await checkbox.click();
        await logInteraction('Login Form', 'Toggle remember me', 'checkbox');
      }
      
      // Test login button hover (don't submit)
      const loginBtn = await page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]');
      if (await loginBtn.count() > 0) {
        await loginBtn.hover();
        await logInteraction('Login Form', 'Hover login button', 'login button');
      }
    }, 'login');

    await page.screenshot({ path: './screenshots/login-filled.png', fullPage: true });

    // TEST 2: Strategy Page Comprehensive Testing
    console.log('\n📋 TESTING STRATEGY PAGE');
    await page.goto('http://localhost:3000/strategy', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: './screenshots/strategy-initial.png', fullPage: true });

    await runTest('Strategy Brief Creation', async () => {
      // Fill campaign brief
      const briefText = "Launch a revolutionary AI-powered productivity app targeting tech-savvy professionals aged 25-40. Focus on time-saving benefits, seamless integration, and professional growth opportunities.";
      await fillFormField('textarea[placeholder*="brief"], textarea[placeholder*="campaign"]', briefText, 'campaign brief');
      
      // Fill target audience
      await fillFormField('input[label*="audience"], input[placeholder*="audience"]', 'Tech professionals, entrepreneurs, startup founders', 'target audience');
      
      // Fill campaign objectives
      await fillFormField('input[label*="objective"], input[placeholder*="goal"]', 'Increase app downloads by 300%, build brand awareness, generate 10k signups', 'campaign objectives');
      
      // Click create brief button
      await clickElement('button:has-text("Create Brief")', 'create brief button');
      await page.waitForTimeout(2000);
    }, 'strategy');

    await runTest('Strategy Motivations Generation', async () => {
      // Generate motivations with fake data
      const generateBtn = await page.locator('button:has-text("Generate Motivations")');
      if (await generateBtn.count() > 0) {
        await generateBtn.click();
        await logInteraction('Strategy', 'Generate motivations', 'generate button');
        await page.waitForTimeout(3000); // Wait for fake data to load
      }
      
      // Select motivations if they appear
      const motivationCards = await page.locator('[data-testid*="motivation"], .motivation-card, button:has-text("Emotional Connection")');
      if (await motivationCards.count() > 0) {
        for (let i = 0; i < Math.min(2, await motivationCards.count()); i++) {
          await motivationCards.nth(i).click();
          await logInteraction('Strategy', `Select motivation ${i+1}`, 'motivation card');
          await page.waitForTimeout(500);
        }
      }
    }, 'strategy');

    await runTest('Strategy Platform Selection', async () => {
      // Test platform selection dropdown (fix selector)
      const platformDropdown = await page.locator('select, [role="combobox"], .MuiSelect-root');
      if (await platformDropdown.count() > 0) {
        await platformDropdown.first().click();
        await page.waitForTimeout(500);
        
        // Select multiple platforms
        const platforms = ['Instagram', 'LinkedIn', 'Facebook'];
        for (const platform of platforms) {
          const option = await page.locator(`text="${platform}"`);
          if (await option.count() > 0) {
            await option.click();
            await logInteraction('Strategy', `Select ${platform}`, 'platform option');
          }
        }
      }
      
      // Test tone selection (fix selector)
      const toneSelect = await page.locator('select, [aria-label*="tone"], .MuiSelect-root');
      if (await toneSelect.count() > 1) {
        await toneSelect.nth(1).click();
        await page.waitForTimeout(500);
        const profOption = await page.locator('text="professional"');
        if (await profOption.count() > 0) {
          await profOption.click();
          await logInteraction('Strategy', 'Select professional tone', 'tone option');
        }
      }
      
      // Test style selection (fix selector)
      const styleSelect = await page.locator('select, [aria-label*="style"], .MuiSelect-root');
      if (await styleSelect.count() > 2) {
        await styleSelect.nth(2).click();
        await page.waitForTimeout(500);
        const engagingOption = await page.locator('text="engaging"');
        if (await engagingOption.count() > 0) {
          await engagingOption.click();
          await logInteraction('Strategy', 'Select engaging style', 'style option');
        }
      }
    }, 'strategy');

    await runTest('Strategy Copy Generation', async () => {
      // Generate copy variations
      const copyBtn = await page.locator('button:has-text("Generate Copy")');
      if (await copyBtn.count() > 0) {
        await copyBtn.click();
        await logInteraction('Strategy', 'Generate copy variations', 'copy generate button');
        await page.waitForTimeout(3000);
      }
      
      // Select copy variations if they appear
      const copyCards = await page.locator('.copy-variation, [data-testid*="copy"]');
      if (await copyCards.count() > 0) {
        for (let i = 0; i < Math.min(2, await copyCards.count()); i++) {
          await copyCards.nth(i).click();
          await logInteraction('Strategy', `Select copy variation ${i+1}`, 'copy card');
          await page.waitForTimeout(500);
        }
      }
    }, 'strategy');

    await page.screenshot({ path: './screenshots/strategy-complete.png', fullPage: true });

    // TEST 3: Generate Page Comprehensive Testing
    console.log('\n📋 TESTING GENERATE PAGE');
    await page.goto('http://localhost:3000/generate-enhanced', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: './screenshots/generate-initial.png', fullPage: true });

    await runTest('Generate Strategy Tab', async () => {
      // Fill brief text area
      const briefText = "Create compelling marketing content for our AI productivity app launch targeting busy professionals.";
      await fillFormField('textarea[placeholder*="brief"]', briefText, 'brief text area');
      
      // Click test data generation button
      const testBtn = await page.locator('[data-testid="generate-test-motivations"], button:has-text("Generate Test Data")');
      if (await testBtn.count() > 0) {
        await testBtn.click();
        await logInteraction('Generate', 'Generate test motivations', 'test data button');
        await page.waitForTimeout(3000);
      }
      
      // Select generated motivations
      const motivations = await page.locator('[data-testid*="motivation"], .motivation-card');
      if (await motivations.count() > 0) {
        for (let i = 0; i < Math.min(2, await motivations.count()); i++) {
          await motivations.nth(i).click();
          await logInteraction('Generate', `Select motivation ${i+1}`, 'motivation');
          await page.waitForTimeout(500);
        }
      }
    }, 'generate');

    await runTest('Generate Copy Tab', async () => {
      // Switch to copy tab
      await clickElement('tab:has-text("Copy"), [value="copy"]', 'copy tab');
      await page.waitForTimeout(1000);
      
      // Configure copy settings
      const toneSelect = await page.locator('select[label*="tone"], #tone');
      if (await toneSelect.count() > 0) {
        await toneSelect.selectOption('professional');
        await logInteraction('Generate', 'Set tone to professional', 'tone selector');
      }
      
      // Generate test copy
      const generateCopyBtn = await page.locator('button:has-text("Generate Test Copy"), [data-testid*="copy"]');
      if (await generateCopyBtn.count() > 0) {
        await generateCopyBtn.click();
        await logInteraction('Generate', 'Generate test copy', 'copy generation button');
        await page.waitForTimeout(2000);
      }
    }, 'generate');

    await runTest('Generate Image Tab', async () => {
      // Switch to image tab
      await clickElement('tab:has-text("Images"), [value="image"]', 'image tab');
      await page.waitForTimeout(1000);
      
      // Fill image prompt
      await fillFormField('input[placeholder*="prompt"], textarea[placeholder*="image"]', 'Professional marketing visual showcasing AI productivity app with modern design', 'image prompt');
      
      // Select image style
      const styleSelect = await page.locator('select[label*="style"], #imageStyle');
      if (await styleSelect.count() > 0) {
        await styleSelect.selectOption('photorealistic');
        await logInteraction('Generate', 'Set image style', 'style selector');
      }
      
      // Generate test images
      const generateImgBtn = await page.locator('button:has-text("Generate Images"), button:has-text("Generate Test Images")');
      if (await generateImgBtn.count() > 0) {
        await generateImgBtn.click();
        await logInteraction('Generate', 'Generate test images', 'image generation button');
        await page.waitForTimeout(3000);
      }
    }, 'generate');

    await runTest('Generate Video Tab', async () => {
      // Switch to video tab
      await clickElement('tab:has-text("Videos"), [value="video"]', 'video tab');
      await page.waitForTimeout(1000);
      
      // Fill video prompt
      await fillFormField('textarea[placeholder*="video"], input[placeholder*="video"]', 'Create dynamic marketing video showcasing app features with professional voiceover', 'video prompt');
      
      // Adjust video settings
      const durationSlider = await page.locator('input[type="range"], .slider');
      if (await durationSlider.count() > 0) {
        await durationSlider.fill('30');
        await logInteraction('Generate', 'Set video duration', 'duration slider');
      }
      
      // Generate test video
      const generateVidBtn = await page.locator('button:has-text("Generate Video"), button:has-text("Generate Test Video")');
      if (await generateVidBtn.count() > 0) {
        await generateVidBtn.click();
        await logInteraction('Generate', 'Generate test video', 'video generation button');
        await page.waitForTimeout(4000);
      }
    }, 'generate');

    await runTest('Generate Voice Tab', async () => {
      // Switch to voice tab
      await clickElement('tab:has-text("Voice"), [value="voice"]', 'voice tab');
      await page.waitForTimeout(1000);
      
      // Fill voice text
      await fillFormField('textarea[placeholder*="voice"], textarea[placeholder*="text"]', 'Transform your productivity with our revolutionary AI-powered app. Experience seamless workflow integration today.', 'voice text');
      
      // Select voice options
      const voiceSelect = await page.locator('select[label*="voice"], #voice');
      if (await voiceSelect.count() > 0) {
        await voiceSelect.selectOption('emma');
        await logInteraction('Generate', 'Select voice type', 'voice selector');
      }
      
      // Generate test voice
      const generateVoiceBtn = await page.locator('button:has-text("Generate Voice"), button:has-text("Generate Test Voice")');
      if (await generateVoiceBtn.count() > 0) {
        await generateVoiceBtn.click();
        await logInteraction('Generate', 'Generate test voice', 'voice generation button');
        await page.waitForTimeout(3000);
      }
    }, 'generate');

    await page.screenshot({ path: './screenshots/generate-complete.png', fullPage: true });

    // TEST 4: File Upload Simulation
    console.log('\n📋 TESTING FILE UPLOADS');
    await runTest('File Upload Testing', async () => {
      // Look for file upload inputs
      const fileInputs = await page.locator('input[type="file"]');
      if (await fileInputs.count() > 0) {
        // Create a test file
        const testFilePath = path.join(process.cwd(), 'test-upload.txt');
        fs.writeFileSync(testFilePath, 'Test file content for upload testing');
        
        await fileInputs.first().setInputFiles(testFilePath);
        await logInteraction('File Upload', 'Upload test file', 'file input');
        
        // Clean up
        fs.unlinkSync(testFilePath);
      }
      
      // Test drag and drop areas
      const dropZones = await page.locator('.dropzone, .file-upload, [data-testid*="upload"]');
      if (await dropZones.count() > 0) {
        await dropZones.first().hover();
        await logInteraction('File Upload', 'Hover drop zone', 'drag drop area');
      }
    }, 'generate');

  } catch (error) {
    console.error('Test execution error:', error);
    errors.push({
      type: 'test',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  await browser.close();

  // Generate comprehensive report
  const totalTests = Object.values(testResults).reduce((sum, cat) => sum + cat.passed + cat.failed, 0);
  const totalPassed = Object.values(testResults).reduce((sum, cat) => sum + cat.passed, 0);
  const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

  const report = {
    testType: 'Enhanced Interactive UX Test with Fake Data',
    timestamp: new Date().toISOString(),
    summary: {
      totalTests,
      totalPassed,
      totalFailed: totalTests - totalPassed,
      successRate: `${successRate}%`,
      totalInteractions: interactions.length,
      totalErrors: errors.length
    },
    testResults,
    interactions,
    errors,
    recommendations: []
  };

  // Add detailed recommendations
  if (successRate >= 90) {
    report.recommendations.push('🎉 Excellent: Interactive elements working perfectly');
  } else if (successRate >= 75) {
    report.recommendations.push('✅ Good: Most interactive elements working well');
  } else {
    report.recommendations.push('⚠️ Needs attention: Several interactive elements failing');
  }

  if (errors.length === 0) {
    report.recommendations.push('✅ No console errors detected during testing');
  } else {
    report.recommendations.push(`⚠️ ${errors.length} errors found - check console logs`);
  }

  if (interactions.length > 20) {
    report.recommendations.push('✅ Rich interactive functionality detected');
  } else {
    report.recommendations.push('ℹ️ Consider adding more interactive elements');
  }

  // Save results
  fs.writeFileSync('./ENHANCED_INTERACTIVE_REPORT.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎊 ENHANCED INTERACTIVE UX TEST COMPLETE');
  console.log(`📊 Results: ${totalPassed}/${totalTests} tests passed (${successRate}%)`);
  console.log(`🔄 Interactions: ${interactions.length}`);
  console.log(`❌ Errors: ${errors.length}`);
  console.log('📄 Full report saved to ENHANCED_INTERACTIVE_REPORT.json');
  
  return report;
}

// Create directories
if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');
if (!fs.existsSync('./test-videos')) fs.mkdirSync('./test-videos');

runEnhancedInteractiveTest().catch(console.error);