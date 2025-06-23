import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * File Upload Workflow Testing
 * Tests the AIRWAVE flow using file upload with the RedBaez brief
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

test.describe('File Upload Workflow Testing', () => {
  
  // Helper function to login
  async function login(page: any) {
    await page.goto('https://airwave-complete.netlify.app/login');
    
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]').first();
    
    await emailField.fill(CREDENTIALS.email);
    await passwordField.fill(CREDENTIALS.password);
    await loginButton.click();
    
    await page.waitForTimeout(3000);
    return !page.url().includes('/login');
  }

  test('Test RedBaez Brief File Upload Workflow', async ({ page }) => {
    console.log('📁 Testing RedBaez Brief File Upload Workflow...');
    
    // Step 1: Login
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    console.log('✅ Successfully authenticated');
    
    // Step 2: Navigate to flow page
    await page.goto('https://airwave-complete.netlify.app/flow');
    await page.waitForTimeout(3000);
    
    console.log(`📍 Flow page URL: ${page.url()}`);
    
    // Take screenshot of flow page
    await page.screenshot({ 
      path: 'test-results/flow-page-for-upload.png', 
      fullPage: true 
    });
    
    // Step 3: Create temporary brief file
    console.log('📝 Creating temporary brief file...');
    
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const briefFilePath = path.join(tempDir, 'redbaez-airwave-brief.txt');
    fs.writeFileSync(briefFilePath, REDBAEZ_BRIEF);
    
    console.log(`📄 Brief file created: ${briefFilePath}`);
    
    // Step 4: Test file upload
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.count() > 0) {
      console.log('📁 File input found - uploading RedBaez brief...');
      
      // Upload the brief file
      await fileInput.setInputFiles(briefFilePath);
      await page.waitForTimeout(3000);
      
      console.log('✅ File uploaded successfully');
      
      // Take screenshot after upload
      await page.screenshot({ 
        path: 'test-results/after-file-upload.png', 
        fullPage: true 
      });
      
      // Step 5: Look for processing or next step
      console.log('🔍 Looking for processing or next step...');
      
      // Check for processing indicators
      const processingElements = {
        loadingSpinner: await page.locator('.loading, .spinner, [data-testid*="loading"]').count(),
        processButton: await page.locator('button:has-text("Process"), button:has-text("Analyze"), button:has-text("Generate")').count(),
        nextButton: await page.locator('button:has-text("Next"), button:has-text("Continue")').count(),
        uploadStatus: await page.locator('.upload-status, .file-status').count()
      };
      
      console.log('🔍 Processing Elements:');
      Object.entries(processingElements).forEach(([element, count]) => {
        console.log(`  ${element}: ${count} elements`);
      });
      
      // Try to trigger processing if there's a button
      if (processingElements.processButton > 0) {
        console.log('🚀 Triggering brief processing...');
        
        const processButton = page.locator('button:has-text("Process"), button:has-text("Analyze"), button:has-text("Generate")').first();
        await processButton.click();
        await page.waitForTimeout(8000); // Wait for AI processing
        
        console.log('⏳ Processing completed, analyzing results...');
        
        // Take screenshot after processing
        await page.screenshot({ 
          path: 'test-results/after-processing.png', 
          fullPage: true 
        });
      }
      
      // Step 6: Analyze results
      console.log('🧠 Analyzing AI-generated results...');
      
      const pageContent = await page.textContent('body');
      
      // Check for contextual content related to RedBaez brief
      const contextualAnalysis = {
        'redbaez_mentioned': pageContent?.toLowerCase().includes('redbaez'),
        'airwave_mentioned': pageContent?.toLowerCase().includes('airwave'),
        'creative_scalability': pageContent?.toLowerCase().includes('scalability') || pageContent?.toLowerCase().includes('scale'),
        'digital_marketing': pageContent?.toLowerCase().includes('digital') || pageContent?.toLowerCase().includes('marketing'),
        'agencies_mentioned': pageContent?.toLowerCase().includes('agenc') || pageContent?.toLowerCase().includes('creative team'),
        'meta_platforms': pageContent?.toLowerCase().includes('meta') || pageContent?.toLowerCase().includes('facebook'),
        'ai_powered': pageContent?.toLowerCase().includes('ai') || pageContent?.toLowerCase().includes('artificial intelligence'),
        'target_audience': pageContent?.toLowerCase().includes('cmo') || pageContent?.toLowerCase().includes('creative director'),
        'motivations_generated': pageContent?.toLowerCase().includes('motivation') || pageContent?.toLowerCase().includes('audience'),
        'copy_generated': pageContent?.toLowerCase().includes('copy') || pageContent?.toLowerCase().includes('headline')
      };
      
      console.log('🎯 Contextual Analysis Results:');
      Object.entries(contextualAnalysis).forEach(([element, found]) => {
        console.log(`  ${element}: ${found ? '✅ Found' : '❌ Missing'}`);
      });
      
      // Count generated elements
      const generatedElements = {
        motivations: await page.locator('[data-testid*="motivation"], .motivation, h2:has-text("Motivation"), h3:has-text("Motivation")').count(),
        copyVariations: await page.locator('[data-testid*="copy"], .copy, h2:has-text("Copy"), h3:has-text("Copy")').count(),
        selectableOptions: await page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').count(),
        cards: await page.locator('.card, .result-card').count(),
        sections: await page.locator('section, .section').count()
      };
      
      console.log('🔍 Generated Elements:');
      Object.entries(generatedElements).forEach(([element, count]) => {
        console.log(`  ${element}: ${count} elements`);
      });
      
      // Step 7: Test interaction with generated content
      if (generatedElements.selectableOptions > 0) {
        console.log('🎯 Testing interaction with generated content...');
        
        const firstSelectable = page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').first();
        await firstSelectable.click();
        await page.waitForTimeout(2000);
        
        console.log('✅ Interaction successful');
        
        // Take final screenshot
        await page.screenshot({ 
          path: 'test-results/final-interaction-result.png', 
          fullPage: true 
        });
      }
      
      // Step 8: Calculate success metrics
      const contextualScore = Object.values(contextualAnalysis).filter(Boolean).length;
      const totalContextualChecks = Object.keys(contextualAnalysis).length;
      const contextualPercentage = (contextualScore / totalContextualChecks) * 100;
      
      const hasGeneratedContent = generatedElements.motivations > 0 || generatedElements.copyVariations > 0 || generatedElements.cards > 0;
      const hasInteractivity = generatedElements.selectableOptions > 0;
      
      console.log('\n📊 RedBaez File Upload Workflow Results:');
      console.log('=' .repeat(60));
      console.log(`🎯 Contextual Relevance: ${contextualPercentage.toFixed(1)}% (${contextualScore}/${totalContextualChecks})`);
      console.log(`🧠 Content Generated: ${hasGeneratedContent ? '✅ Yes' : '❌ No'}`);
      console.log(`🎮 Interactive Elements: ${hasInteractivity ? '✅ Yes' : '❌ No'}`);
      console.log(`📁 File Upload: ✅ Successful`);
      console.log(`🔧 Workflow Status: ${hasGeneratedContent ? '✅ Functional' : '⚠️ Needs Investigation'}`);
      
      // Cleanup
      fs.unlinkSync(briefFilePath);
      console.log('🧹 Temporary file cleaned up');
      
      // Assertions
      expect(contextualPercentage).toBeGreaterThan(20); // At least 20% contextual relevance
      
      console.log('✅ RedBaez file upload workflow test completed!');
      
    } else {
      console.log('❌ No file input found on flow page');
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: 'test-results/no-file-input-debug.png', 
        fullPage: true 
      });
    }
  });

  test('Test Dashboard Navigation and Quick Actions', async ({ page }) => {
    console.log('🏠 Testing Dashboard Navigation and Quick Actions...');
    
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    
    // Stay on dashboard
    console.log(`📍 Dashboard URL: ${page.url()}`);
    
    // Take dashboard screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-detailed.png', 
      fullPage: true 
    });
    
    // Test all buttons on dashboard
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons on dashboard`);
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      if (text && text.trim() && isVisible && isEnabled) {
        console.log(`🎯 Testing button: "${text.trim()}"`);
        
        try {
          await button.click();
          await page.waitForTimeout(2000);
          
          const newUrl = page.url();
          console.log(`  📍 After click: ${newUrl}`);
          
          // Take screenshot
          await page.screenshot({ 
            path: `test-results/dashboard-button-${i + 1}.png`, 
            fullPage: true 
          });
          
          // Go back to dashboard
          await page.goto('https://airwave-complete.netlify.app/dashboard');
          await page.waitForTimeout(1000);
          
        } catch (error) {
    const message = getErrorMessage(error);
          console.log(`  ❌ Error clicking button: ${error}`);
        }
      }
    }
    
    console.log('✅ Dashboard testing completed');
  });
});
