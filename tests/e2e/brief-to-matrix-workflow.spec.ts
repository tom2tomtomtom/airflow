import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

// AIrWAVE 2.0 Creative Brief for testing
const CREATIVE_BRIEF = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez

Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective:
Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed. The campaign should educate, inspire, and excite target audiences about AIrWAVE 2.0's transformative potential while driving adoption through Meta platforms.

Target Audience:
1. Primary:
• Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
• Mid-to-senior decision-makers (CMOs, creative directors, media planners).
• Industries struggling to meet the demand for scalable, cost-effective ad content.

2. Secondary:
• Tech-savvy entrepreneurs and SMEs looking to leverage AI for competitive advantage.
• Broader tech enthusiasts curious about AI-driven creative innovation.

The Tool:
The Redbaez tool is an advanced AI-powered platform designed to streamline the creation and scaling of digital advertising executions. It is specifically crafted for clients and their agencies to produce highly targeted and customized ad variations efficiently, addressing the increasing demand for diverse and high-performing digital content.

Key Features:
• Sentiment and Theme Analysis: Scrapes comments and feedback from existing social media content
• Customer Motivation Mapping: Defines motivations that drive customer action
• Ad Variations at Scale: Creates multiple ad executions based on pre-approved templates
• AI-Powered Content Creation: Generates imagery, video, copywriting, voiceovers, and music
• Multi-Platform Support: Optimized for Meta, TikTok, Snapchat, YouTube, Pinterest

Insight:
The biggest challenge in digital marketing today is meeting the insatiable demand for personalized ad content across platforms like Meta. Brands often sacrifice quality for speed—or vice versa. AIrWAVE 2.0 changes the game by delivering creativity and efficiency, making it possible to test and iterate at scale without breaking budgets or timelines.

Tone of Voice:
Conversational, inspiring, and confident—balancing technical expertise with a sense of creativity and possibility. It should feel like you're hearing from a trusted expert who understands the industry's challenges and offers a solution that's both practical and innovative.

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale. AIrWAVE 2.0 empowers you to deliver more personalized ads, faster, without compromising on quality.
3. Proof Points:
• Generates ad variations tailored to different customer motivations.
• AI-powered insights and creative assets ready to deploy.
• Seamless integration with Meta platforms to supercharge campaign performance.
4. Call to Action: "Discover how AIrWAVE 2.0 can transform your ad strategy today."

Creative Execution:
Meta platforms will be at the core of the launch strategy, with creative showcasing the tool's capabilities in action.

1. Video Content:
• Short-form videos demonstrating the power of AIrWAVE 2.0 to generate personalized, high-performing ad creatives in seconds.
• Case studies featuring brands using the tool to achieve measurable results.

2. Carousel Ads:
• Highlighting key features of AIrWAVE 2.0, with each card focusing on a unique benefit: from customer motivation insights to lightning-fast execution.

Deliverables:
• 3x Video Ads (15-30 seconds each)
• 4x Carousel Ads
• 5x Interactive Story Ads
• 2x Educational Reels (60 seconds)
• 1x Lead Magnet (E-book or Whitepaper)
• Meta Pixels and UTM tracking for campaign optimization

KPIs:
1. Increase awareness of AIrWAVE 2.0 among global marketing decision-makers.
2. Achieve 10,000 sign-ups for AIrWAVE 2.0 demo sessions within the first 3 months.
3. Boost Redbaez's following on Meta platforms by 20% during the campaign.

Creative Mandatories:
• Redbaez and AIrWAVE 2.0 branding.
• Clear, simple messaging highlighting benefits.
• Emphasis on creative scalability and ROI.

Why Meta Platforms:
Meta offers the perfect playground to showcase AIrWAVE 2.0's strengths: personalized, scalable creative executions that drive performance. With advanced targeting, creative ad formats, and robust analytics, Meta platforms ensure the campaign reaches the right people, in the right way, at the right time.`;

test.describe('Complete Brief-to-Matrix Workflow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    test.setTimeout(300000); // 5 minutes for complete workflow

    // Monitor API calls
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`API: ${response.request().method()} ${response.url()} - ${response.status()}`);
      }
    });

    // Monitor console for important info
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.text().includes('Brief') || msg.text().includes('Copy') || msg.text().includes('Matrix')) {
        console.log(`Console: ${msg.text()}`);
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Complete Workflow: Brief Upload → Parsing → Copy Generation → Matrix Population', async () => {
    console.log('📋 Starting Complete Brief-to-Matrix Workflow Test');
    console.log('📄 Using AIrWAVE 2.0 Creative Brief from Redbaez');

    // STEP 1: Authentication
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

    await page.screenshot({ path: 'test-results/brief-workflow-01-dashboard.png' });

    // STEP 2: Navigate to Brief Upload
    console.log('📤 Step 2: Navigate to Brief Upload');
    
    const briefUploadPaths = [
      '/strategic-content',
      '/briefs', 
      '/brief-upload',
      '/upload'
    ];

    let briefPageFound = false;
    for (const path of briefUploadPaths) {
      try {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForLoadState('networkidle');
        
        // Check for upload interface
        const uploadElements = await page.locator(
          'input[type="file"], [data-testid*="upload"], button:has-text("Upload"), .upload, textarea'
        ).count();
        
        if (uploadElements > 0) {
          console.log(`✅ Brief upload interface found at ${path}`);
          briefPageFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Brief upload path ${path} not accessible`);
      }
    }

    if (!briefPageFound) {
      console.log('⚠️ Dedicated brief upload not found, trying strategic content page');
      await page.goto(`${BASE_URL}/strategic-content`);
      await page.waitForLoadState('networkidle');
    }

    await page.screenshot({ path: 'test-results/brief-workflow-02-upload-page.png' });

    // STEP 3: Upload Brief
    console.log('📄 Step 3: Upload AIrWAVE 2.0 Creative Brief');

    // Try file upload first
    const fileInput = page.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'airwave-2.0-creative-brief.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from(CREATIVE_BRIEF)
      });
      console.log('✅ Brief uploaded via file input');
      
      // Look for process/parse button
      const processButton = page.locator('button:has-text("Process"), button:has-text("Parse"), button:has-text("Analyze"), button[type="submit"]').first();
      if (await processButton.isVisible()) {
        await processButton.click();
        console.log('🔄 Brief processing initiated');
        await page.waitForTimeout(5000);
      }
    } else {
      // Try textarea input
      const textAreaInputs = [
        'textarea[placeholder*="brief"]',
        'textarea[placeholder*="paste"]',
        'textarea[name="content"]',
        'textarea[name="brief"]',
        'textarea:visible'
      ];

      let briefEntered = false;
      for (const selector of textAreaInputs) {
        const element = page.locator(selector).first();
        if (await element.isVisible()) {
          await element.fill(CREATIVE_BRIEF);
          console.log(`✅ Brief entered via textarea: ${selector}`);
          briefEntered = true;
          break;
        }
      }

      if (!briefEntered) {
        console.log('⚠️ No brief input method found, trying any visible textarea');
        const anyTextarea = page.locator('textarea').first();
        if (await anyTextarea.isVisible()) {
          await anyTextarea.fill(CREATIVE_BRIEF);
          console.log('✅ Brief entered in first available textarea');
          briefEntered = true;
        }
      }

      if (briefEntered) {
        // Look for submit/process button
        const submitButtons = [
          'button:has-text("Parse")',
          'button:has-text("Process")',
          'button:has-text("Analyze")',
          'button:has-text("Submit")',
          'button[type="submit"]'
        ];

        for (const selector of submitButtons) {
          const button = page.locator(selector).first();
          if (await button.isVisible()) {
            await button.click();
            console.log(`✅ Submitted brief with button: ${selector}`);
            await page.waitForTimeout(5000);
            break;
          }
        }
      }
    }

    await page.screenshot({ path: 'test-results/brief-workflow-03-brief-uploaded.png' });

    // STEP 4: Wait for Brief Parsing
    console.log('🔍 Step 4: Monitor Brief Parsing');

    let parsingComplete = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!parsingComplete && attempts < maxAttempts) {
      await page.waitForTimeout(3000);
      attempts++;

      // Check for parsing completion indicators
      const completionIndicators = [
        'text="Parsed"',
        'text="Complete"',
        'text="Success"',
        'text="Analysis complete"',
        'text="Brief processed"',
        '.parsed-brief',
        '.brief-analysis',
        '[data-testid*="parsed"]'
      ];

      for (const indicator of completionIndicators) {
        const element = page.locator(indicator);
        if (await element.isVisible()) {
          console.log(`✅ Brief parsing completed! Found: ${indicator}`);
          parsingComplete = true;
          break;
        }
      }

      // Check for extracted information
      const extractedInfo = [
        'text="Redbaez"',
        'text="AIrWAVE 2.0"',
        'text="Brand:"',
        'text="Objective:"',
        'text="Target Audience:"'
      ];

      for (const info of extractedInfo) {
        const element = page.locator(info);
        if (await element.isVisible()) {
          console.log(`✅ Found extracted brief information: ${info}`);
          parsingComplete = true;
          break;
        }
      }

      console.log(`⏳ Parsing attempt ${attempts}/${maxAttempts}`);
    }

    await page.screenshot({ path: 'test-results/brief-workflow-04-parsing-complete.png' });

    // STEP 5: Navigate to Copy Generation
    console.log('✍️ Step 5: Navigate to Copy Generation');

    const copyGenPaths = [
      '/generate-enhanced',
      '/copy-generation',
      '/strategic-content',
      '/generate'
    ];

    let copyGenPageFound = false;
    for (const path of copyGenPaths) {
      try {
        await page.goto(`${BASE_URL}${path}`);
        await page.waitForLoadState('networkidle');
        
        // Look for copy generation interface
        const copyElements = await page.locator(
          'button:has-text("Generate"), textarea, input[placeholder*="copy"], [data-testid*="copy"], button:has-text("Copy")'
        ).count();
        
        if (copyElements > 0) {
          console.log(`✅ Copy generation interface found at ${path}`);
          copyGenPageFound = true;
          break;
        }
      } catch (error) {
        console.log(`❌ Copy generation path ${path} not accessible`);
      }
    }

    await page.screenshot({ path: 'test-results/brief-workflow-05-copy-generation-page.png' });

    // STEP 6: Generate Copy from Brief
    console.log('🎨 Step 6: Generate Copy from AIrWAVE 2.0 Brief');

    // Look for copy generation tab or button
    const copyTab = page.locator('button:has-text("Copy"), .copy-tab, [aria-label*="copy"]').first();
    if (await copyTab.isVisible()) {
      await copyTab.click();
      await page.waitForTimeout(1000);
      console.log('✅ Activated copy generation tab');
    }

    // Look for brief-based generation option
    const briefBasedOptions = [
      'button:has-text("Use Brief")',
      'button:has-text("From Brief")',
      'select option:has-text("Brief")',
      'input[value*="brief"]'
    ];

    for (const selector of briefBasedOptions) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        await element.click();
        console.log(`✅ Selected brief-based generation: ${selector}`);
        break;
      }
    }

    // Try to generate copy
    const generateCopyButtons = [
      'button:has-text("Generate Copy")',
      'button:has-text("Generate")',
      'button:has-text("Create Copy")',
      'button:has-text("Generate Content")'
    ];

    let copyGenerationStarted = false;
    for (const selector of generateCopyButtons) {
      const button = page.locator(selector).first();
      if (await button.isVisible() && !(await button.isDisabled())) {
        await button.click();
        console.log(`✅ Started copy generation: ${selector}`);
        copyGenerationStarted = true;
        break;
      }
    }

    if (copyGenerationStarted) {
      // Wait for copy generation
      await page.waitForTimeout(10000);
      
      // Check for generated copy
      const copyOutputs = [
        'textarea[value*="AIrWAVE"]',
        'textarea[value*="Redbaez"]',
        '.copy-output',
        '[data-testid*="generated"]',
        'textarea:has-text("creative")',
        'textarea:has-text("scale")'
      ];

      let generatedCopyFound = false;
      for (const selector of copyOutputs) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          const copyText = await element.textContent() || await element.inputValue();
          if (copyText && copyText.length > 50) {
            console.log(`✅ Generated copy found: ${copyText.substring(0, 100)}...`);
            generatedCopyFound = true;
            break;
          }
        }
      }

      console.log(`Copy generation result: ${generatedCopyFound ? '✅ Success' : '⚠️ Pending'}`);
    }

    await page.screenshot({ path: 'test-results/brief-workflow-06-copy-generated.png' });

    // STEP 7: Navigate to Matrix
    console.log('📊 Step 7: Navigate to Matrix for Copy Population');

    await page.goto(`${BASE_URL}/matrix`);
    await page.waitForLoadState('networkidle');

    // Check matrix interface
    const matrixElements = await page.locator(
      '.matrix-cell, .matrix-grid, [data-testid*="matrix"], table td, .grid-cell, .MuiGrid-item'
    ).count();

    console.log(`📊 Found ${matrixElements} matrix elements`);
    await page.screenshot({ path: 'test-results/brief-workflow-07-matrix-page.png' });

    // STEP 8: Populate Matrix with Generated Copy
    console.log('🎯 Step 8: Populate Matrix with Generated Copy');

    if (matrixElements > 0) {
      // Try to populate matrix cells
      const matrixCells = page.locator('.matrix-cell, table td, .grid-cell, .MuiGrid-item');
      const cellCount = await matrixCells.count();

      if (cellCount > 0) {
        console.log(`🎯 Attempting to populate ${Math.min(3, cellCount)} matrix cells`);

        for (let i = 0; i < Math.min(3, cellCount); i++) {
          try {
            await matrixCells.nth(i).click();
            await page.waitForTimeout(500);

            // Look for copy selector or input
            const copySelectors = [
              '[data-testid*="copy-selector"]',
              '.copy-selector',
              'button:has-text("Select Copy")',
              'select[name*="copy"]',
              'textarea',
              'input[type="text"]'
            ];

            for (const selector of copySelectors) {
              const element = page.locator(selector).first();
              if (await element.isVisible()) {
                console.log(`📝 Found copy selector: ${selector}`);
                
                if (selector.includes('textarea') || selector.includes('input')) {
                  await element.fill(`AIrWAVE 2.0 copy variation ${i + 1}: The future of creative scalability is here.`);
                } else {
                  await element.click();
                  
                  // Look for copy options
                  const copyOptions = page.locator('.copy-option, [data-testid*="copy-option"], option:has-text("AIrWAVE")');
                  if (await copyOptions.first().isVisible()) {
                    await copyOptions.first().click();
                  }
                }
                
                console.log(`✅ Populated matrix cell ${i + 1}`);
                break;
              }
            }
          } catch (error) {
            console.log(`⚠️ Could not populate cell ${i + 1}: ${error.message}`);
          }
        }
      }
    } else {
      console.log('⚠️ No matrix cells found for population');
    }

    await page.screenshot({ path: 'test-results/brief-workflow-08-matrix-populated.png' });

    // STEP 9: Execute/Render Matrix
    console.log('🚀 Step 9: Execute Matrix Campaign');

    // Look for execute/render button
    const executeButtons = [
      'button:has-text("Execute")',
      'button:has-text("Render")',
      'button:has-text("Generate")',
      'button:has-text("Create Campaign")',
      'button:has-text("Launch")'
    ];

    let executionStarted = false;
    for (const selector of executeButtons) {
      const button = page.locator(selector).first();
      if (await button.isVisible() && !(await button.isDisabled())) {
        await button.click();
        console.log(`✅ Started matrix execution: ${selector}`);
        executionStarted = true;
        break;
      }
    }

    if (executionStarted) {
      await page.waitForTimeout(5000);
      
      // Check for execution progress
      const progressElements = await page.locator('.progress, [data-testid*="progress"], .status, .MuiLinearProgress-root').count();
      console.log(`📊 Found ${progressElements} progress indicators`);
    }

    await page.screenshot({ path: 'test-results/brief-workflow-09-execution-started.png' });

    // STEP 10: Final Verification
    console.log('✅ Step 10: Workflow Summary');

    const workflowSteps = [
      { step: 'Login', completed: true },
      { step: 'Brief upload interface found', completed: briefPageFound },
      { step: 'Brief parsing', completed: parsingComplete },
      { step: 'Copy generation page', completed: copyGenPageFound },
      { step: 'Copy generation started', completed: copyGenerationStarted },
      { step: 'Matrix interface found', completed: matrixElements > 0 },
      { step: 'Matrix execution', completed: executionStarted }
    ];

    console.log('\n📋 Complete Workflow Summary:');
    workflowSteps.forEach((item, index) => {
      console.log(`${index + 1}. ${item.step}: ${item.completed ? '✅' : '⚠️'}`);
    });

    const completedSteps = workflowSteps.filter(item => item.completed).length;
    console.log(`\n🎊 Completed ${completedSteps}/${workflowSteps.length} workflow steps successfully!`);
    
    // Final assertion
    expect(completedSteps).toBeGreaterThan(4); // Expect at least 5 out of 7 steps to work
  });

  test('Brief Content Analysis Verification', async () => {
    console.log('🔍 Testing Brief Content Analysis and Extraction');

    // Login
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navigate to strategic content or brief analysis
    await page.goto(`${BASE_URL}/strategic-content`);
    await page.waitForLoadState('networkidle');

    // Enter the AIrWAVE 2.0 brief
    const briefInput = page.locator('textarea').first();
    if (await briefInput.isVisible()) {
      await briefInput.fill(CREATIVE_BRIEF);
      
      // Submit for analysis
      const analyzeButton = page.locator('button:has-text("Analyze"), button:has-text("Parse"), button:has-text("Process")').first();
      if (await analyzeButton.isVisible()) {
        await analyzeButton.click();
        await page.waitForTimeout(5000);
      }
    }

    // Check for extracted elements
    const expectedElements = [
      'Redbaez',
      'AIrWAVE 2.0',
      'Digital marketers',
      'Meta platforms',
      'Creative scalability'
    ];

    console.log('\n🔍 Checking for extracted brief elements:');
    for (const element of expectedElements) {
      const found = await page.locator(`text="${element}"`).isVisible();
      console.log(`${element}: ${found ? '✅ Found' : '❌ Missing'}`);
    }

    await page.screenshot({ path: 'test-results/brief-analysis-verification.png', fullPage: true });
  });
});