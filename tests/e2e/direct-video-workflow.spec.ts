import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Direct Video Generation Workflow', () => {
  test('Complete Video Workflow: Login → Direct to Video Studio → AIrWAVE Brief Test', async ({ page }) => {
    console.log('🎬 Starting Direct Video Generation Workflow');
    console.log('📄 Using AIrWAVE 2.0 Creative Brief from Redbaez');

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

    // STEP 2: Navigate directly to Video Studio (bypass dashboard)
    console.log('🎥 Step 2: Navigate directly to Video Studio');
    await page.goto(`${BASE_URL}/video-studio`);
    await page.waitForLoadState('networkidle');

    // Check if video studio loads without major errors
    const hasVideoStudioError = await page.locator('text="Oops! Something went wrong", text="404", text="Page Not Found"').isVisible();
    
    if (!hasVideoStudioError) {
      console.log('✅ Video Studio page loads successfully');
    } else {
      console.log('❌ Video Studio page has errors');
    }

    await page.screenshot({ path: 'test-results/video-studio-direct.png', fullPage: true });

    // STEP 3: Navigate to Strategic Content (Brief Upload)
    console.log('📋 Step 3: Navigate to Strategic Content for Brief Upload');
    await page.goto(`${BASE_URL}/strategic-content`);
    await page.waitForLoadState('networkidle');

    const hasStrategicContentError = await page.locator('text="Oops! Something went wrong", text="404", text="Page Not Found"').isVisible();
    
    if (!hasStrategicContentError) {
      console.log('✅ Strategic Content page loads successfully');
    } else {
      console.log('❌ Strategic Content page has errors');
    }

    await page.screenshot({ path: 'test-results/strategic-content-direct.png', fullPage: true });

    // STEP 4: Test Brief Upload with AIrWAVE 2.0 Content
    console.log('📄 Step 4: Test Brief Upload Interface');

    const airwaveBrief = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez
Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective:
Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed. The campaign should educate, inspire, and excite target audiences about AIrWAVE 2.0's transformative potential while driving adoption through Meta platforms.

Target Audience:
1. Primary: Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
2. Secondary: Tech-savvy entrepreneurs and SMEs looking to leverage AI for competitive advantage.

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale. AIrWAVE 2.0 empowers you to deliver more personalized ads, faster, without compromising on quality.
3. Proof Points: Generates ad variations tailored to different customer motivations.

Creative Execution:
Meta platforms will be at the core of the launch strategy, with creative showcasing the tool's capabilities in action.

Deliverables:
• 3x Video Ads (15-30 seconds each)
• 4x Carousel Ads
• 5x Interactive Story Ads

Call to Action: "Discover how AIrWAVE 2.0 can transform your ad strategy today."`;

    // Look for text input areas
    const textInputs = [
      'textarea[placeholder*="brief"]',
      'textarea[placeholder*="content"]',
      'textarea[placeholder*="paste"]',
      'textarea:visible',
      'input[type="text"]:visible'
    ];

    let briefEntered = false;
    for (const selector of textInputs) {
      const element = page.locator(selector).first();
      if (await element.isVisible()) {
        try {
          await element.fill(airwaveBrief);
          console.log(`✅ AIrWAVE 2.0 brief entered via: ${selector}`);
          briefEntered = true;
          break;
        } catch (error) {
          console.log(`⚠️ Could not fill ${selector}: ${error.message}`);
        }
      }
    }

    if (!briefEntered) {
      console.log('⚠️ No suitable text input found for brief');
    }

    await page.screenshot({ path: 'test-results/brief-entered.png', fullPage: true });

    // STEP 5: Test Generate Enhanced Page
    console.log('🎨 Step 5: Test Generate Enhanced Page');
    await page.goto(`${BASE_URL}/generate-enhanced`);
    await page.waitForLoadState('networkidle');

    const hasGenerateError = await page.locator('text="Oops! Something went wrong", text="404", text="Page Not Found"').isVisible();
    
    if (!hasGenerateError) {
      console.log('✅ Generate Enhanced page loads successfully');
      
      // Look for generation interfaces
      const generationElements = await page.locator(
        'button:has-text("Generate"), textarea, .tab, [role="tab"], .generation'
      ).count();
      
      console.log(`📊 Found ${generationElements} generation-related elements`);
    } else {
      console.log('❌ Generate Enhanced page has errors');
    }

    await page.screenshot({ path: 'test-results/generate-enhanced-direct.png', fullPage: true });

    // STEP 6: Test Matrix Page
    console.log('📊 Step 6: Test Matrix Page');
    await page.goto(`${BASE_URL}/matrix`);
    await page.waitForLoadState('networkidle');

    const hasMatrixError = await page.locator('text="Oops! Something went wrong", text="404", text="Page Not Found"').isVisible();
    
    if (!hasMatrixError) {
      console.log('✅ Matrix page loads successfully');
      
      const matrixElements = await page.locator(
        '.matrix, .grid, table, .MuiGrid-container, .campaign'
      ).count();
      
      console.log(`📊 Found ${matrixElements} matrix-related elements`);
    } else {
      console.log('❌ Matrix page has errors');
    }

    await page.screenshot({ path: 'test-results/matrix-direct.png', fullPage: true });

    // STEP 7: Test Execute Page
    console.log('🚀 Step 7: Test Execute Page');
    await page.goto(`${BASE_URL}/execute`);
    await page.waitForLoadState('networkidle');

    const hasExecuteError = await page.locator('text="Oops! Something went wrong", text="404", text="Page Not Found"').isVisible();
    
    if (!hasExecuteError) {
      console.log('✅ Execute page loads successfully');
      
      const executeElements = await page.locator(
        'button:has-text("Execute"), button:has-text("Render"), .execution'
      ).count();
      
      console.log(`📊 Found ${executeElements} execution-related elements`);
    } else {
      console.log('❌ Execute page has errors');
    }

    await page.screenshot({ path: 'test-results/execute-direct.png', fullPage: true });

    // STEP 8: Summary
    console.log('📋 Step 8: Workflow Summary');
    
    const pagesWorking = [
      !hasVideoStudioError,
      !hasStrategicContentError,
      !hasGenerateError,
      !hasMatrixError,
      !hasExecuteError
    ];

    const workingCount = pagesWorking.filter(Boolean).length;
    console.log(`\n🎊 Workflow Results:
    - Login: ✅ Working
    - Video Studio: ${!hasVideoStudioError ? '✅' : '❌'} 
    - Strategic Content: ${!hasStrategicContentError ? '✅' : '❌'}
    - Generate Enhanced: ${!hasGenerateError ? '✅' : '❌'}
    - Matrix: ${!hasMatrixError ? '✅' : '❌'}
    - Execute: ${!hasExecuteError ? '✅' : '❌'}
    - Brief Entry: ${briefEntered ? '✅' : '⚠️'}
    
    📊 Success Rate: ${workingCount}/5 pages working
    📄 AIrWAVE 2.0 Brief: ${briefEntered ? 'Successfully entered' : 'Interface not found'}`);

    // Assertions for test success
    expect(workingCount).toBeGreaterThan(3); // At least 4 out of 5 pages should work
    expect(briefEntered).toBe(true); // Brief should be enterable somewhere
  });
});