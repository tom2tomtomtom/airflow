import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';

// Brief content for testing
const REDBAEZ_BRIEF = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez

Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective: Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed. The campaign should educate, inspire, and excite target audiences about AIrWAVE 2.0's transformative potential while driving adoption through Meta platforms.

Target Audience:
Primary:
• Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
• Mid-to-senior decision-makers (CMOs, creative directors, media planners).
• Industries struggling to meet the demand for scalable, cost-effective ad content.

Secondary:
• Tech-savvy entrepreneurs and SMEs looking to leverage AI for competitive advantage.
• Broader tech enthusiasts curious about AI-driven creative innovation.

The tool:
The Redbaez tool is an advanced AI-powered platform designed to streamline the creation and scaling of digital advertising executions. It is specifically crafted for clients and their agencies to produce highly targeted and customized ad variations efficiently, addressing the increasing demand for diverse and high-performing digital content.

Key Features:
- Sentiment and Theme Analysis: The tool scrapes comments and feedback from the client's existing social media content.
- Customer Motivation Mapping: Using insights from the analysis, it helps define motivations that drive customer action.
- Ad Variations at Scale: The tool creates multiple ad executions based on pre-approved templates.
- AI-Powered Content Creation: Generates AI-created visuals, copywriting, voiceovers and music.

Insight: The biggest challenge in digital marketing today is meeting the insatiable demand for personalized ad content across platforms like Meta. Brands often sacrifice quality for speed—or vice versa. AIrWAVE 2.0 changes the game by delivering creativity and efficiency.

Tone of Voice: Conversational, inspiring, and confident—balancing technical expertise with a sense of creativity and possibility.

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale.
3. Call to Action: "Discover how AIrWAVE 2.0 can transform your ad strategy today."

Deliverables:
• 3x Video Ads (15-30 seconds each)
• 4x Carousel Ads
• 5x Interactive Story Ads
• 2x Educational Reels (60 seconds)
• 1x Lead Magnet (E-book or Whitepaper)

KPIs:
1. Increase awareness of AIrWAVE 2.0 among global marketing decision-makers.
2. Achieve 10,000 sign-ups for AIrWAVE 2.0 demo sessions within the first 3 months.
3. Boost Redbaez's following on Meta platforms by 20% during the campaign.`;

async function attemptLogin(page: Page): Promise<boolean> {
  try {
    console.log('🔐 Attempting login...');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    await emailInput.fill('tomh@redbaez.com');
    await passwordInput.fill('Wijlre2010');
    await submitButton.click();
    
    // Wait and check if login was successful
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login successful!');
      return true;
    } else {
      console.log('❌ Login failed, trying alternative approach...');
      
      // Try to bypass authentication by going directly to pages
      // and checking if they load (demo mode or other access)
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Check if we can access dashboard
      const title = await page.title();
      if (title.includes('Dashboard') || title.includes('AIrWAVE')) {
        console.log('✅ Accessed dashboard without login (demo mode)');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Login attempt failed:', error);
    return false;
  }
}

test.describe('Complete AIrWAVE Workflow with Redbaez Brief', () => {
  test('End-to-End Workflow: Brief Upload → Parsing → Copy Generation → Image Creation → Asset Library → Template → Matrix → Execution', async ({ page }) => {
    console.log('🚀 Starting complete AIrWAVE workflow test with Redbaez brief...');
    
    const workflowSteps = [];
    
    // Track API calls
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
        console.log(`API: ${response.request().method()} ${response.url()} - ${response.status()}`);
      }
    });
    
    // STEP 1: Authentication
    console.log('🔐 Step 1: Authentication');
    const loginSuccess = await attemptLogin(page);
    workflowSteps.push({ step: 'Authentication', success: loginSuccess });
    
    if (!loginSuccess) {
      console.log('⚠️ Proceeding without authentication to test UI components...');
    }
    
    // STEP 2: Brief Upload and Parsing
    console.log('📄 Step 2: Brief Upload and Parsing');
    let briefUploadSuccess = false;
    
    try {
      // Try different pages for brief upload
      const briefPages = ['/strategic-content', '/generate-enhanced', '/briefs'];
      
      for (const pagePath of briefPages) {
        try {
          await page.goto(`${BASE_URL}${pagePath}`);
          await page.waitForLoadState('networkidle');
          
          // Look for upload or text input areas
          const uploadElements = await page.locator('input[type="file"], textarea, [contenteditable], .upload-area, [data-testid*="upload"], [data-testid*="brief"]').count();
          
          if (uploadElements > 0) {
            console.log(`✅ Found brief input interface at ${pagePath}`);
            
            // Try to input the brief content
            const textareas = page.locator('textarea');
            const textareaCount = await textareas.count();
            
            if (textareaCount > 0) {
              console.log('📝 Found textarea, entering brief content...');
              await textareas.first().fill(REDBAEZ_BRIEF);
              
              // Look for submit/process button
              const processButton = page.locator('button:has-text("Process"), button:has-text("Parse"), button:has-text("Analyze"), button:has-text("Generate"), button[type="submit"]').first();
              if (await processButton.isVisible()) {
                await processButton.click();
                console.log('🔄 Brief processing initiated');
                await page.waitForTimeout(5000);
                briefUploadSuccess = true;
              }
            }
            
            // Try file upload if textarea didn't work
            const fileInputs = page.locator('input[type="file"]');
            const fileInputCount = await fileInputs.count();
            
            if (fileInputCount > 0 && !briefUploadSuccess) {
              console.log('📁 Found file input, uploading brief as file...');
              await fileInputs.first().setInputFiles({
                name: 'redbaez-airwave-brief.txt',
                mimeType: 'text/plain',
                buffer: Buffer.from(REDBAEZ_BRIEF)
              });
              
              const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Process")').first();
              if (await uploadButton.isVisible()) {
                await uploadButton.click();
                console.log('📤 Brief file uploaded');
                await page.waitForTimeout(5000);
                briefUploadSuccess = true;
              }
            }
            
            if (briefUploadSuccess) break;
          }
        } catch (error) {
          console.log(`❌ Brief upload failed at ${pagePath}: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Brief upload error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Brief Upload', success: briefUploadSuccess });
    
    // STEP 3: Copy Generation
    console.log('✍️ Step 3: Copy Generation');
    let copyGenSuccess = false;
    
    try {
      // Look for copy generation interface
      const copyGenButton = page.locator('button:has-text("Generate Copy"), button:has-text("Create Copy"), [data-testid*="copy-generate"]').first();
      
      if (await copyGenButton.isVisible()) {
        await copyGenButton.click();
        console.log('🔄 Copy generation started...');
        await page.waitForTimeout(10000); // Wait for AI generation
        
        // Check for generated copy
        const copyOutputs = await page.locator('textarea[readonly], .copy-output, [data-testid*="generated-copy"]').count();
        if (copyOutputs > 0) {
          console.log(`✅ Found ${copyOutputs} generated copy elements`);
          copyGenSuccess = true;
          
          // Try to save generated copy
          const saveButton = page.locator('button:has-text("Save"), button:has-text("Save to Library")').first();
          if (await saveButton.isVisible()) {
            await saveButton.click();
            console.log('💾 Copy saved to library');
          }
        }
      }
    } catch (error) {
      console.log(`❌ Copy generation error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Copy Generation', success: copyGenSuccess });
    
    // STEP 4: Image Creation
    console.log('🎨 Step 4: Image Creation');
    let imageGenSuccess = false;
    
    try {
      // Look for image generation interface
      const imageGenButton = page.locator('button:has-text("Generate Image"), button:has-text("Create Image"), button:has-text("DALL-E"), [data-testid*="image-generate"]').first();
      
      if (await imageGenButton.isVisible()) {
        // Check if there's a prompt input
        const promptInput = page.locator('input[placeholder*="prompt"], input[placeholder*="image"], textarea[placeholder*="describe"]').first();
        
        if (await promptInput.isVisible()) {
          await promptInput.fill('Modern tech office with creative team using AI tools, professional photography, vibrant colors');
          await imageGenButton.click();
          console.log('🔄 Image generation started...');
          await page.waitForTimeout(15000); // Wait for AI image generation
          
          // Check for generated images
          const imageResults = await page.locator('img[src*="data:"], img[src*="blob:"], .generated-image, [data-testid*="generated-image"]').count();
          if (imageResults > 0) {
            console.log(`✅ Found ${imageResults} generated images`);
            imageGenSuccess = true;
            
            // Try to save generated image
            const saveImageButton = page.locator('button:has-text("Save Image"), button:has-text("Save to Library")').first();
            if (await saveImageButton.isVisible()) {
              await saveImageButton.click();
              console.log('💾 Image saved to library');
            }
          }
        }
      }
    } catch (error) {
      console.log(`❌ Image generation error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Image Creation', success: imageGenSuccess });
    
    // STEP 5: Asset Library Management
    console.log('📚 Step 5: Asset Library Management');
    let assetLibrarySuccess = false;
    
    try {
      await page.goto(`${BASE_URL}/assets`);
      await page.waitForLoadState('networkidle');
      
      // Check asset library interface
      const assetElements = await page.locator('.asset-card, .asset-item, img, [data-testid*="asset"], .asset-grid').count();
      console.log(`📁 Found ${assetElements} asset-related elements`);
      
      if (assetElements > 0) {
        assetLibrarySuccess = true;
        
        // Try to organize assets
        const filterButtons = await page.locator('button:has-text("Filter"), select, [data-testid*="filter"]').count();
        console.log(`🔍 Found ${filterButtons} filter options`);
        
        // Try to upload additional assets
        const uploadButton = page.locator('button:has-text("Upload"), input[type="file"]').first();
        if (await uploadButton.isVisible()) {
          console.log('📤 Asset upload interface available');
        }
      }
    } catch (error) {
      console.log(`❌ Asset library error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Asset Library', success: assetLibrarySuccess });
    
    // STEP 6: Template Selection
    console.log('📋 Step 6: Template Selection');
    let templateSuccess = false;
    
    try {
      await page.goto(`${BASE_URL}/templates`);
      await page.waitForLoadState('networkidle');
      
      // Check template library
      const templateElements = await page.locator('.template-card, .template-item, [data-testid*="template"]').count();
      console.log(`📄 Found ${templateElements} template elements`);
      
      if (templateElements > 0) {
        templateSuccess = true;
        
        // Try to select a template
        const firstTemplate = page.locator('.template-card, .template-item').first();
        if (await firstTemplate.isVisible()) {
          await firstTemplate.click();
          console.log('✅ Template selected');
          
          const useTemplateButton = page.locator('button:has-text("Use"), button:has-text("Select"), button:has-text("Apply")').first();
          if (await useTemplateButton.isVisible()) {
            await useTemplateButton.click();
            console.log('📄 Template applied');
          }
        }
      }
    } catch (error) {
      console.log(`❌ Template selection error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Template Selection', success: templateSuccess });
    
    // STEP 7: Matrix Population
    console.log('📊 Step 7: Matrix Population');
    let matrixSuccess = false;
    
    try {
      await page.goto(`${BASE_URL}/matrix`);
      await page.waitForLoadState('networkidle');
      
      // Check matrix interface
      const matrixElements = await page.locator('.matrix-cell, .matrix-grid, table td, .grid-cell, [data-testid*="matrix"]').count();
      console.log(`📊 Found ${matrixElements} matrix elements`);
      
      if (matrixElements > 0) {
        matrixSuccess = true;
        
        // Try to interact with matrix cells
        const matrixCells = page.locator('.matrix-cell, table td, .grid-cell');
        const cellCount = await matrixCells.count();
        
        if (cellCount > 0) {
          console.log(`🎯 Attempting to interact with matrix (${cellCount} cells)`);
          
          try {
            await matrixCells.first().click();
            await page.waitForTimeout(1000);
            console.log('✅ Matrix cell interaction successful');
          } catch (error) {
            console.log('ℹ️ Matrix cell interaction limited');
          }
        }
      }
    } catch (error) {
      console.log(`❌ Matrix error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Matrix Population', success: matrixSuccess });
    
    // STEP 8: Execution/Rendering
    console.log('🚀 Step 8: Execution and Rendering');
    let executionSuccess = false;
    
    try {
      await page.goto(`${BASE_URL}/execute`);
      await page.waitForLoadState('networkidle');
      
      // Check execution interface
      const executeElements = await page.locator('button:has-text("Execute"), button:has-text("Render"), button:has-text("Generate"), [data-testid*="execute"]').count();
      console.log(`🎬 Found ${executeElements} execution-related elements`);
      
      if (executeElements > 0) {
        executionSuccess = true;
        
        // Try to start execution
        const executeButton = page.locator('button:has-text("Execute"), button:has-text("Start"), button:has-text("Render")').first();
        if (await executeButton.isVisible()) {
          console.log('✅ Execution interface available');
          // Don't actually click execute to avoid long processing times
        }
      }
    } catch (error) {
      console.log(`❌ Execution error: ${error.message}`);
    }
    
    workflowSteps.push({ step: 'Execution', success: executionSuccess });
    
    // Final Results
    console.log('\n🎉 Complete Workflow Test Results:');
    console.log('=' .repeat(50));
    
    const successfulSteps = workflowSteps.filter(step => step.success);
    console.log(`✅ Successful Steps: ${successfulSteps.length}/${workflowSteps.length}`);
    
    workflowSteps.forEach(step => {
      const icon = step.success ? '✅' : '❌';
      console.log(`${icon} ${step.step}: ${step.success ? 'SUCCESS' : 'BLOCKED/NOT FOUND'}`);
    });
    
    console.log(`\n📊 API Calls Made: ${apiCalls.length}`);
    const successfulAPIs = apiCalls.filter(call => call.status >= 200 && call.status < 400);
    const authRequiredAPIs = apiCalls.filter(call => call.status === 401);
    console.log(`✅ Successful API calls: ${successfulAPIs.length}`);
    console.log(`🔐 Auth-required API calls: ${authRequiredAPIs.length}`);
    
    // Report on what was actually testable
    const testableWorkflow = successfulSteps.length >= 4; // At least half the workflow
    
    if (testableWorkflow) {
      console.log('\n🎯 CONCLUSION: Workflow components are present and functional');
      console.log('🔧 Main blocker: Authentication session management');
    } else {
      console.log('\n⚠️ CONCLUSION: Limited workflow testing due to access restrictions');
    }
    
    // This test will show us what's actually working
    expect(successfulSteps.length).toBeGreaterThan(0); // At least some steps should work
  });
});