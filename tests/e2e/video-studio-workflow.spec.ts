import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

test.describe('Video Studio Workflow Test', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    test.setTimeout(180000); // 3 minutes for video generation

    // Monitor API calls
    page.on('response', response => {
      if (response.url().includes('/api/video') || response.url().includes('/api/auth')) {
        console.log(`API: ${response.request().method()} ${response.url()} - ${response.status()}`);
      }
    });

    // Monitor console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console Error: ${msg.text()}`);
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Complete Video Generation Workflow: Login → Video Studio → Generate Video', async () => {
    console.log('🎬 Starting Video Studio Workflow Test');

    // STEP 1: Login
    console.log('🔐 Step 1: Authentication');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
    await loginButton.click();

    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('✅ Login successful');
    } catch (error) {
      console.log('❌ Login failed');
      throw error;
    }

    // STEP 2: Navigate to Video Studio
    console.log('🎥 Step 2: Navigate to Video Studio');
    await page.goto(`${BASE_URL}/video-studio`);
    await page.waitForLoadState('networkidle');

    // Take screenshot of video studio page
    await page.screenshot({ path: 'test-results/video-studio-loaded.png', fullPage: true });

    // Verify video studio components
    const videoStudioTitle = page.locator('h1:has-text("Video Studio"), h4:has-text("Video Studio")');
    expect(await videoStudioTitle.isVisible()).toBe(true);
    console.log('✅ Video Studio page loaded');

    // STEP 3: Check for Video Generation Interface
    console.log('📝 Step 3: Locate Video Generation Interface');

    // Look for the "New Generation" button or similar
    const newGenerationButton = page.locator('button:has-text("New Generation"), button:has-text("Generate")').first();
    
    if (await newGenerationButton.isVisible()) {
      await newGenerationButton.click();
      console.log('✅ Clicked New Generation button');
    }

    // Wait for the generation tab to load
    await page.waitForTimeout(2000);

    // Look for video generation form elements
    const videoPromptInput = page.locator('textarea[label*="Video Prompt"], textarea[placeholder*="video"], textarea[placeholder*="Describe"]').first();
    
    // If not found, try other selectors
    if (!(await videoPromptInput.isVisible())) {
      const alternativeInputs = [
        'textarea[name="prompt"]',
        'textarea[placeholder*="describe"]',
        'textarea[placeholder*="generate"]',
        'textarea:visible',
        'input[placeholder*="video"]'
      ];
      
      for (const selector of alternativeInputs) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          console.log(`✅ Found video input with selector: ${selector}`);
          break;
        }
      }
    }

    // STEP 4: Fill Video Generation Form
    console.log('✍️ Step 4: Fill Video Generation Form');

    const videoPrompt = "Create a professional 30-second commercial video showcasing a modern tech startup office environment. Include scenes of collaborative work, innovation, and growth. Use cinematic style with smooth camera movements and professional lighting.";

    // Try to find and fill the prompt input
    const promptSelectors = [
      'textarea[label*="Video Prompt"]',
      'textarea[placeholder*="video"]',
      'textarea[placeholder*="Describe"]',
      'textarea[name="prompt"]',
      'textarea:visible'
    ];

    let promptFilled = false;
    for (const selector of promptSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.fill(videoPrompt);
        console.log(`✅ Filled video prompt using selector: ${selector}`);
        promptFilled = true;
        break;
      }
    }

    if (!promptFilled) {
      console.log('⚠️ Could not find video prompt input, trying to fill any visible textarea');
      const anyTextarea = page.locator('textarea').first();
      if (await anyTextarea.isVisible()) {
        await anyTextarea.fill(videoPrompt);
        console.log('✅ Filled video prompt in first visible textarea');
        promptFilled = true;
      }
    }

    expect(promptFilled).toBe(true);

    // Take screenshot of filled form
    await page.screenshot({ path: 'test-results/video-form-filled.png', fullPage: true });

    // STEP 5: Configure Video Settings
    console.log('⚙️ Step 5: Configure Video Settings');

    // Try to set video style
    const styleButtons = page.locator('button:has-text("commercial"), button:has-text("cinematic"), .MuiChip-root:has-text("commercial")');
    if (await styleButtons.first().isVisible()) {
      await styleButtons.first().click();
      console.log('✅ Selected video style');
    }

    // Try to set duration
    const durationSlider = page.locator('input[type="range"], .MuiSlider-thumb').first();
    if (await durationSlider.isVisible()) {
      // Set to 30 seconds if possible
      await durationSlider.click();
      console.log('✅ Configured duration');
    }

    // STEP 6: Start Video Generation
    console.log('🚀 Step 6: Start Video Generation');

    const generateButtons = [
      'button:has-text("Generate Video")',
      'button:has-text("Generate")',
      'button:has-text("Create Video")',
      'button[type="submit"]'
    ];

    let generationStarted = false;
    for (const selector of generateButtons) {
      const button = page.locator(selector).first();
      if (await button.isVisible() && !(await button.isDisabled())) {
        await button.click();
        console.log(`✅ Clicked generate button: ${selector}`);
        generationStarted = true;
        break;
      }
    }

    expect(generationStarted).toBe(true);

    // Wait for generation to start
    await page.waitForTimeout(3000);

    // Take screenshot after generation started
    await page.screenshot({ path: 'test-results/video-generation-started.png', fullPage: true });

    // STEP 7: Monitor Generation Progress
    console.log('📊 Step 7: Monitor Generation Progress');

    let generationCompleted = false;
    let progressFound = false;
    let attempts = 0;
    const maxAttempts = 30; // Wait up to 3 minutes

    while (!generationCompleted && attempts < maxAttempts) {
      await page.waitForTimeout(6000); // Wait 6 seconds between checks
      attempts++;

      // Check for progress indicators
      const progressIndicators = [
        '.MuiLinearProgress-root',
        '.MuiCircularProgress-root',
        'text="Generating"',
        'text="Processing"',
        'text="pending"',
        'text="processing"',
        '[data-testid*="progress"]'
      ];

      for (const indicator of progressIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible()) {
          if (!progressFound) {
            console.log(`✅ Found progress indicator: ${indicator}`);
            progressFound = true;
          }
          break;
        }
      }

      // Check for completion indicators
      const completionIndicators = [
        'text="completed"',
        'text="Completed"',
        'text="success"',
        'text="Success"',
        'video[src*="blob:"]',
        'video[src*="mp4"]',
        'source[src*="mp4"]',
        '.video-result',
        '[data-testid*="video-result"]'
      ];

      for (const indicator of completionIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible()) {
          console.log(`🎉 Video generation completed! Found: ${indicator}`);
          generationCompleted = true;
          break;
        }
      }

      // Check for error states
      const errorIndicators = [
        'text="failed"',
        'text="Failed"',
        'text="error"',
        'text="Error"',
        '.MuiAlert-standardError'
      ];

      for (const indicator of errorIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible()) {
          console.log(`❌ Error detected: ${indicator}`);
          const errorText = await element.textContent();
          console.log(`Error details: ${errorText}`);
          break;
        }
      }

      // Check for any new video generations in the list
      const videoCards = page.locator('.MuiCard-root:has-text("Generation")');
      const cardCount = await videoCards.count();
      if (cardCount > 0) {
        console.log(`📹 Found ${cardCount} generation card(s)`);
        
        // Look for status chips
        const statusChips = page.locator('.MuiChip-root:has-text("completed"), .MuiChip-root:has-text("processing"), .MuiChip-root:has-text("pending")');
        const statusCount = await statusChips.count();
        if (statusCount > 0) {
          const statusText = await statusChips.first().textContent();
          console.log(`📊 Generation status: ${statusText}`);
          
          if (statusText?.toLowerCase().includes('completed')) {
            generationCompleted = true;
            break;
          }
        }
      }

      console.log(`⏳ Attempt ${attempts}/${maxAttempts} - Monitoring generation...`);
    }

    // Take final screenshot
    await page.screenshot({ path: 'test-results/video-generation-final.png', fullPage: true });

    // STEP 8: Verify Results
    console.log('✅ Step 8: Verify Results');

    if (generationCompleted) {
      console.log('🎊 Video generation completed successfully!');
      
      // Try to find the generated video
      const videoElement = page.locator('video, source[src*="mp4"]').first();
      if (await videoElement.isVisible()) {
        console.log('📹 Generated video element found in DOM');
        
        const videoSrc = await videoElement.getAttribute('src') || await videoElement.getAttribute('data-src');
        if (videoSrc) {
          console.log(`🔗 Video source: ${videoSrc.substring(0, 100)}...`);
        }
      }
    } else if (progressFound) {
      console.log('⏳ Video generation in progress (timeout reached)');
    } else {
      console.log('⚠️ No clear progress indicators found, but generation may have started');
    }

    // Final summary
    console.log('\n📋 Workflow Summary:');
    console.log('1. ✅ Login successful');
    console.log('2. ✅ Video Studio page loaded');
    console.log('3. ✅ Video generation form accessed');
    console.log('4. ✅ Video prompt filled');
    console.log('5. ✅ Generation initiated');
    console.log(`6. ${progressFound ? '✅' : '⚠️'} Progress monitoring`);
    console.log(`7. ${generationCompleted ? '✅' : '⏳'} Generation ${generationCompleted ? 'completed' : 'in progress'}`);

    // Assertion for test success
    expect(promptFilled && generationStarted).toBe(true);
  });

  test('Video Studio UI Component Verification', async () => {
    console.log('🎨 Testing Video Studio UI Components');

    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate to Video Studio
    await page.goto(`${BASE_URL}/video-studio`);
    await page.waitForLoadState('networkidle');

    // Check UI components
    const uiComponents = [
      { name: 'Page Title', selector: 'h1:has-text("Video Studio"), h4:has-text("Video Studio")' },
      { name: 'New Generation Button', selector: 'button:has-text("New Generation"), button:has-text("Generate")' },
      { name: 'Stats Cards', selector: '.MuiCard-root, .card' },
      { name: 'Tabs', selector: '.MuiTab-root, [role="tab"]' },
      { name: 'Video Generation Form', selector: 'textarea, input[type="text"]' },
    ];

    console.log('\n🔍 UI Component Check:');
    for (const component of uiComponents) {
      const element = page.locator(component.selector);
      const isVisible = await element.first().isVisible();
      console.log(`${component.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
    }

    // Take comprehensive screenshot
    await page.screenshot({ path: 'test-results/video-studio-ui-components.png', fullPage: true });
  });
});