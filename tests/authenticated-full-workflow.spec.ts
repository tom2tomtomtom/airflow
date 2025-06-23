import { test, expect } from '@playwright/test';

/**
 * Authenticated Full AIRWAVE Workflow Testing
 * Tests complete AIRWAVE functionality with real credentials and RedBaez brief
 */

const CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password-123'
};

const REDBAEZ_BRIEF = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez
Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective: Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed. The campaign should educate, inspire, and excite target audiences about AIrWAVE 2.0's transformative potential while driving adoption through Meta platforms.

Target Audience:
1. Primary:
• Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
• Mid-to-senior decision-makers (CMOs, creative directors, media planners).
• Industries struggling to meet the demand for scalable, cost-effective ad content.

2. Secondary:
• Tech-savvy entrepreneurs and SMEs looking to leverage AI for competitive advantage.
• Broader tech enthusiasts curious about AI-driven creative innovation.

The Tool: The Redbaez tool is an advanced AI-powered platform designed to streamline the creation and scaling of digital advertising executions. It is specifically crafted for clients and their agencies to produce highly targeted and customized ad variations efficiently, addressing the increasing demand for diverse and high-performing digital content.

Key Features:
- Sentiment and Theme Analysis: Scrapes comments and feedback from existing social media content
- Customer Motivation Mapping: Defines motivations that drive customer action
- Ad Variations at Scale: Creates multiple ad executions based on pre-approved templates
- AI-Powered Content Creation: Generates imagery, video, copywriting, voiceovers and music
- Multi-Platform Support: Tailored for Meta, TikTok, Snapchat, YouTube, Pinterest

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale. AIrWAVE 2.0 empowers you to deliver more personalized ads, faster, without compromising on quality.
3. Proof Points:
• Generates ad variations tailored to different customer motivations
• AI-powered insights and creative assets ready to deploy
• Seamless integration with Meta platforms to supercharge campaign performance
4. Call to Action: "Discover how AIrWAVE 2.0 can transform your ad strategy today."

Deliverables:
• 3x Video Ads (15-30 seconds each)
• 4x Carousel Ads
• 5x Interactive Story Ads
• 2x Educational Reels (60 seconds)
• 1x Lead Magnet (E-book or Whitepaper)

KPIs:
1. Increase awareness of AIrWAVE 2.0 among global marketing decision-makers
2. Achieve 10,000 sign-ups for AIrWAVE 2.0 demo sessions within the first 3 months
3. Boost Redbaez's following on Meta platforms by 20% during the campaign

Budget: TBD
Launch Date: TBD

Creative Mandatories:
• Redbaez and AIrWAVE 2.0 branding
• Clear, simple messaging highlighting benefits
• Emphasis on creative scalability and ROI`;

test.describe('Authenticated Full AIRWAVE Workflow', () => {
  
  // Helper function to login
  async function login(page: any) {
    console.log('🔐 Logging in with provided credentials...');
    
    await page.goto('https://airwave-complete.netlify.app/login');
    
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]').first();
    
    await emailField.fill(CREDENTIALS.email);
    await passwordField.fill(CREDENTIALS.password);
    await loginButton.click();
    
    // Wait for login to complete
    await page.waitForTimeout(3000);
    
    const isLoggedIn = !page.url().includes('/login');
    console.log(`🔑 Login ${isLoggedIn ? 'successful' : 'failed'}: ${page.url()}`);
    
    return isLoggedIn;
  }

  test('Complete RedBaez AIRWAVE Workflow Test', async ({ page }) => {
    console.log('🎯 Starting Complete RedBaez AIRWAVE Workflow Test...');
    
    // Step 1: Login
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    
    if (!loginSuccess) {
      console.log('❌ Login failed - cannot proceed with workflow test');
      return;
    }
    
    // Take screenshot after successful login
    await page.screenshot({ 
      path: 'test-results/authenticated-dashboard.png', 
      fullPage: true 
    });
    
    console.log('✅ Successfully authenticated - proceeding with workflow');
    
    // Step 2: Navigate to Flow Page
    console.log('🌊 Navigating to Flow page...');
    await page.goto('https://airwave-complete.netlify.app/flow');
    await page.waitForTimeout(2000);
    
    console.log(`📍 Flow page URL: ${page.url()}`);
    
    // Take screenshot of authenticated flow page
    await page.screenshot({ 
      path: 'test-results/authenticated-flow-page.png', 
      fullPage: true 
    });
    
    // Step 3: Test Brief Input
    console.log('📝 Testing brief input with RedBaez AIRWAVE 2.0 brief...');
    
    const briefInput = page.locator('textarea, input[type="text"]:not([type="file"])').first();
    if (await briefInput.count() > 0) {
      console.log('📄 Entering RedBaez brief...');
      await briefInput.fill(REDBAEZ_BRIEF);
      await page.waitForTimeout(2000);
      
      // Take screenshot with brief entered
      await page.screenshot({ 
        path: 'test-results/brief-entered.png', 
        fullPage: true 
      });
      
      // Step 4: Submit Brief for Processing
      const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit"), button:has-text("Process"), button:has-text("Create")').first();
      
      if (await submitButton.count() > 0) {
        console.log('🚀 Submitting RedBaez brief for AI processing...');
        await submitButton.click();
        
        // Wait for AI processing (longer timeout for real processing)
        console.log('⏳ Waiting for AI processing...');
        await page.waitForTimeout(10000);
        
        // Step 5: Analyze AI-Generated Results
        console.log('🧠 Analyzing AI-generated motivations and content...');
        
        const pageContent = await page.textContent('body');
        
        // Check for contextual motivations specific to RedBaez brief
        const contextualAnalysis = {
          'creative_scalability': pageContent?.toLowerCase().includes('scalability') || pageContent?.toLowerCase().includes('scale'),
          'ai_powered': pageContent?.toLowerCase().includes('ai') || pageContent?.toLowerCase().includes('artificial intelligence'),
          'digital_marketing': pageContent?.toLowerCase().includes('digital') || pageContent?.toLowerCase().includes('marketing'),
          'agencies': pageContent?.toLowerCase().includes('agenc') || pageContent?.toLowerCase().includes('creative team'),
          'meta_platforms': pageContent?.toLowerCase().includes('meta') || pageContent?.toLowerCase().includes('facebook'),
          'redbaez_brand': pageContent?.toLowerCase().includes('redbaez'),
          'airwave_product': pageContent?.toLowerCase().includes('airwave'),
          'target_audience': pageContent?.toLowerCase().includes('cmo') || pageContent?.toLowerCase().includes('creative director'),
          'ecommerce': pageContent?.toLowerCase().includes('ecommerce') || pageContent?.toLowerCase().includes('retail'),
          'automation': pageContent?.toLowerCase().includes('automat') || pageContent?.toLowerCase().includes('efficient')
        };
        
        console.log('🎯 Contextual AI Analysis Results:');
        Object.entries(contextualAnalysis).forEach(([element, found]) => {
          console.log(`  ${element}: ${found ? '✅ Found' : '❌ Missing'}`);
        });
        
        // Count UI elements
        const uiElements = {
          motivations: await page.locator('[data-testid*="motivation"], .motivation, h2:has-text("Motivation"), h3:has-text("Motivation")').count(),
          copyVariations: await page.locator('[data-testid*="copy"], .copy, h2:has-text("Copy"), h3:has-text("Copy")').count(),
          selectableOptions: await page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').count(),
          generateButtons: await page.locator('button:has-text("Generate"), button:has-text("Create")').count()
        };
        
        console.log('🔍 Generated UI Elements:');
        Object.entries(uiElements).forEach(([element, count]) => {
          console.log(`  ${element}: ${count} elements`);
        });
        
        // Take screenshot of AI results
        await page.screenshot({ 
          path: 'test-results/ai-generated-results.png', 
          fullPage: true 
        });
        
        // Step 6: Test Motivation Selection and Copy Generation
        if (uiElements.selectableOptions > 0) {
          console.log('🎯 Testing motivation selection...');
          
          const firstMotivation = page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').first();
          await firstMotivation.click();
          await page.waitForTimeout(2000);
          
          console.log('✅ Motivation selected');
          
          // Test copy generation
          const generateCopyButton = page.locator('button:has-text("Generate Copy"), button:has-text("Create Copy"), button:has-text("Generate")').first();
          if (await generateCopyButton.count() > 0) {
            console.log('🚀 Generating copy for selected motivation...');
            await generateCopyButton.click();
            await page.waitForTimeout(8000);
            
            // Check for copy generation
            const updatedContent = await page.textContent('body');
            const copyGenerated = updatedContent !== pageContent;
            
            console.log(`📝 Copy generation: ${copyGenerated ? '✅ Success' : '❌ No change detected'}`);
            
            // Analyze generated copy quality
            if (copyGenerated) {
              const copyQuality = {
                'mentions_airwave': updatedContent?.toLowerCase().includes('airwave'),
                'mentions_scalability': updatedContent?.toLowerCase().includes('scale'),
                'mentions_ai': updatedContent?.toLowerCase().includes('ai'),
                'mentions_agencies': updatedContent?.toLowerCase().includes('agenc'),
                'call_to_action': updatedContent?.toLowerCase().includes('discover') || updatedContent?.toLowerCase().includes('transform')
              };
              
              console.log('📝 Copy Quality Analysis:');
              Object.entries(copyQuality).forEach(([quality, found]) => {
                console.log(`  ${quality}: ${found ? '✅ Found' : '❌ Missing'}`);
              });
            }
            
            // Take final screenshot
            await page.screenshot({ 
              path: 'test-results/final-workflow-results.png', 
              fullPage: true 
            });
          }
        }
        
        // Step 7: Calculate Success Metrics
        const contextualScore = Object.values(contextualAnalysis).filter(Boolean).length;
        const totalContextualChecks = Object.keys(contextualAnalysis).length;
        const contextualPercentage = (contextualScore / totalContextualChecks) * 100;
        
        const hasMotivations = uiElements.motivations > 0;
        const hasCopy = uiElements.copyVariations > 0;
        const hasInteractivity = uiElements.selectableOptions > 0;
        
        console.log('\n📊 RedBaez AIRWAVE Workflow Results:');
        console.log('=' .repeat(50));
        console.log(`🎯 Contextual Relevance: ${contextualPercentage.toFixed(1)}% (${contextualScore}/${totalContextualChecks})`);
        console.log(`🧠 Motivations Generated: ${hasMotivations ? '✅ Yes' : '❌ No'} (${uiElements.motivations} found)`);
        console.log(`📝 Copy Variations: ${hasCopy ? '✅ Yes' : '❌ No'} (${uiElements.copyVariations} found)`);
        console.log(`🎮 Interactive Elements: ${hasInteractivity ? '✅ Yes' : '❌ No'} (${uiElements.selectableOptions} found)`);
        console.log(`🔧 Workflow Completion: ${hasMotivations && hasInteractivity ? '✅ Functional' : '⚠️ Partial'}`);
        
        // Assertions for test success
        expect(contextualPercentage).toBeGreaterThan(40); // At least 40% contextual relevance
        expect(hasMotivations || hasCopy).toBe(true); // Some content generated
        
        console.log('✅ RedBaez AIRWAVE workflow test completed successfully!');
        
      } else {
        console.log('❌ No submit button found for brief processing');
      }
    } else {
      console.log('❌ No brief input field found');
    }
  });

  test('Test Strategy Page with Authentication', async ({ page }) => {
    console.log('🧠 Testing Strategy Page with Authentication...');
    
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    
    // Navigate to strategy page
    await page.goto('https://airwave-complete.netlify.app/strategy');
    await page.waitForTimeout(2000);
    
    console.log(`📍 Strategy page URL: ${page.url()}`);
    
    // Take screenshot of authenticated strategy page
    await page.screenshot({ 
      path: 'test-results/authenticated-strategy-page.png', 
      fullPage: true 
    });
    
    // Test strategy page elements
    const strategyElements = {
      title: await page.title(),
      navigation: await page.locator('nav, .navbar').count(),
      createButton: await page.locator('button:has-text("Create"), button:has-text("New")').count(),
      strategyList: await page.locator('.strategy, .card, .list-item').count(),
      forms: await page.locator('form').count()
    };
    
    console.log('🔍 Authenticated Strategy Page Elements:');
    Object.entries(strategyElements).forEach(([element, value]) => {
      console.log(`  ${element}: ${typeof value === 'string' ? value : value + ' elements'}`);
    });
    
    console.log('✅ Strategy page authentication test completed');
  });

  test('Test Campaign Matrix with Authentication', async ({ page }) => {
    console.log('📊 Testing Campaign Matrix with Authentication...');
    
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    
    // Navigate to matrix page
    await page.goto('https://airwave-complete.netlify.app/matrix');
    await page.waitForTimeout(2000);
    
    console.log(`📍 Matrix page URL: ${page.url()}`);
    
    // Take screenshot of authenticated matrix page
    await page.screenshot({ 
      path: 'test-results/authenticated-matrix-page.png', 
      fullPage: true 
    });
    
    // Test matrix page elements
    const matrixElements = {
      title: await page.title(),
      navigation: await page.locator('nav, .navbar').count(),
      matrixContainer: await page.locator('.matrix, .grid, table').count(),
      createButton: await page.locator('button:has-text("Create"), button:has-text("New")').count(),
      campaigns: await page.locator('.campaign, .matrix-cell').count()
    };
    
    console.log('🔍 Authenticated Matrix Page Elements:');
    Object.entries(matrixElements).forEach(([element, value]) => {
      console.log(`  ${element}: ${typeof value === 'string' ? value : value + ' elements'}`);
    });
    
    console.log('✅ Matrix page authentication test completed');
  });
});
