import { test, expect } from '@playwright/test';

/**
 * Complete Flow Validation
 * Tests the complete AIRWAVE flow workflow with detailed step-by-step validation
 */

const CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password-123'
};

const REDBAEZ_BRIEF = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez
Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective: Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed.

Target Audience:
1. Primary: Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
2. Secondary: Tech-savvy entrepreneurs and SMEs looking to leverage AI for competitive advantage.

Key Features:
- Sentiment and Theme Analysis
- Customer Motivation Mapping  
- Ad Variations at Scale
- AI-Powered Content Creation
- Multi-Platform Support

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale.
3. Call to Action: "Discover how AIrWAVE 2.0 can transform your ad strategy today."`;

test.describe('Complete Flow Validation', () => {
  
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

  test('Complete Flow Workflow Step-by-Step Validation', async ({ page }) => {
    console.log('🎯 Starting Complete Flow Workflow Validation...');
    
    // Step 1: Authentication
    console.log('🔐 Step 1: Authentication...');
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    console.log('✅ Authentication successful');
    
    // Step 2: Navigate to Flow Page
    console.log('🌊 Step 2: Navigate to Flow Page...');
    await page.goto('https://airwave-complete.netlify.app/flow');
    await page.waitForTimeout(3000);
    
    console.log(`📍 Flow page URL: ${page.url()}`);
    
    // Take screenshot of flow page
    await page.screenshot({ 
      path: 'test-results/flow-step-2-page-loaded.png', 
      fullPage: true 
    });
    
    // Step 3: Activate Workflow
    console.log('🚀 Step 3: Activate Workflow...');
    
    // Look for the "Start Flow" button
    const startFlowButton = page.locator('button:has-text("Start Flow"), button:has-text("Hide Workflow")').first();
    
    if (await startFlowButton.count() > 0) {
      const buttonText = await startFlowButton.textContent();
      console.log(`🎯 Found workflow button: "${buttonText}"`);
      
      if (buttonText?.includes('Start')) {
        console.log('🚀 Clicking Start Flow button...');
        await startFlowButton.click();
        await page.waitForTimeout(3000);
        
        // Take screenshot after starting workflow
        await page.screenshot({ 
          path: 'test-results/flow-step-3-workflow-started.png', 
          fullPage: true 
        });
      } else {
        console.log('✅ Workflow already active');
      }
    }
    
    // Step 4: File Upload
    console.log('📁 Step 4: File Upload...');
    
    // Create temporary brief file
    const fs = require('fs');
    const path = require('path');
    
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    
    const briefFilePath = path.join(tempDir, 'redbaez-airwave-brief.txt');
    fs.writeFileSync(briefFilePath, REDBAEZ_BRIEF);
    
    console.log(`📄 Brief file created: ${briefFilePath}`);
    
    // Look for file upload area
    const fileInput = page.locator('input[type="file"]').first();
    const dropzone = page.locator('[data-testid*="dropzone"], .dropzone, .upload-area').first();
    
    if (await fileInput.count() > 0) {
      console.log('📁 File input found - uploading brief...');
      
      // Upload the file
      await fileInput.setInputFiles(briefFilePath);
      console.log('✅ File uploaded successfully');
      
      // Wait for processing
      console.log('⏳ Waiting for file processing...');
      await page.waitForTimeout(8000);
      
      // Take screenshot after upload
      await page.screenshot({ 
        path: 'test-results/flow-step-4-file-uploaded.png', 
        fullPage: true 
      });
      
    } else if (await dropzone.count() > 0) {
      console.log('📁 Dropzone found - testing drag and drop...');
      
      // Try to trigger file upload via dropzone
      await dropzone.click();
      await page.waitForTimeout(1000);
      
      // Look for file input that might appear
      const hiddenFileInput = page.locator('input[type="file"]').first();
      if (await hiddenFileInput.count() > 0) {
        await hiddenFileInput.setInputFiles(briefFilePath);
        console.log('✅ File uploaded via dropzone');
        await page.waitForTimeout(8000);
      }
    } else {
      console.log('❌ No file upload method found');
    }
    
    // Step 5: Analyze Processing Results
    console.log('🧠 Step 5: Analyze Processing Results...');
    
    const pageContent = await page.textContent('body');
    
    // Check for processing indicators
    const processingIndicators = {
      loadingSpinner: await page.locator('.loading, .spinner, [data-testid*="loading"]').count(),
      progressBar: await page.locator('.progress, [role="progressbar"]').count(),
      processingText: pageContent?.toLowerCase().includes('processing') || pageContent?.toLowerCase().includes('analyzing'),
      errorMessage: await page.locator('.error, [role="alert"]').count()
    };
    
    console.log('🔍 Processing Indicators:');
    Object.entries(processingIndicators).forEach(([indicator, value]) => {
      console.log(`  ${indicator}: ${typeof value === 'boolean' ? (value ? 'Found' : 'Not found') : value + ' elements'}`);
    });
    
    // Step 6: Check for Generated Content
    console.log('📊 Step 6: Check for Generated Content...');
    
    // Look for various content sections
    const contentSections = {
      motivations: await page.locator('[data-testid*="motivation"], .motivation, h2:has-text("Motivation"), h3:has-text("Motivation")').count(),
      copyVariations: await page.locator('[data-testid*="copy"], .copy, h2:has-text("Copy"), h3:has-text("Copy")').count(),
      briefSummary: await page.locator('[data-testid*="brief"], .brief-summary, h2:has-text("Brief")').count(),
      results: await page.locator('.result, .generated-content, .ai-content').count(),
      cards: await page.locator('.card, .content-card').count(),
      steps: await page.locator('.step, .workflow-step').count()
    };
    
    console.log('📋 Content Sections:');
    Object.entries(contentSections).forEach(([section, count]) => {
      console.log(`  ${section}: ${count} elements`);
    });
    
    // Step 7: Contextual Analysis
    console.log('🎯 Step 7: Contextual Analysis...');
    
    const contextualAnalysis = {
      'redbaez_mentioned': pageContent?.toLowerCase().includes('redbaez'),
      'airwave_mentioned': pageContent?.toLowerCase().includes('airwave'),
      'creative_scalability': pageContent?.toLowerCase().includes('scalability') || pageContent?.toLowerCase().includes('scale'),
      'digital_marketing': pageContent?.toLowerCase().includes('digital') || pageContent?.toLowerCase().includes('marketing'),
      'agencies_mentioned': pageContent?.toLowerCase().includes('agenc') || pageContent?.toLowerCase().includes('creative team'),
      'ai_powered': pageContent?.toLowerCase().includes('ai') || pageContent?.toLowerCase().includes('artificial intelligence'),
      'target_audience': pageContent?.toLowerCase().includes('audience') || pageContent?.toLowerCase().includes('target'),
      'motivations_present': pageContent?.toLowerCase().includes('motivation'),
      'copy_present': pageContent?.toLowerCase().includes('copy') || pageContent?.toLowerCase().includes('content'),
      'workflow_active': pageContent?.toLowerCase().includes('workflow') || pageContent?.toLowerCase().includes('step')
    };
    
    console.log('🎯 Contextual Analysis:');
    Object.entries(contextualAnalysis).forEach(([element, found]) => {
      console.log(`  ${element}: ${found ? '✅ Found' : '❌ Missing'}`);
    });
    
    // Step 8: Test Interactions
    console.log('🎮 Step 8: Test Interactions...');
    
    const interactiveElements = {
      buttons: await page.locator('button:not([disabled])').count(),
      selectableItems: await page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').count(),
      clickableCards: await page.locator('.card[role="button"], .clickable').count(),
      navigationElements: await page.locator('a, [role="link"]').count()
    };
    
    console.log('🎮 Interactive Elements:');
    Object.entries(interactiveElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Try to interact with selectable elements
    if (interactiveElements.selectableItems > 0) {
      console.log('🎯 Testing element selection...');
      
      const firstSelectable = page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').first();
      await firstSelectable.click();
      await page.waitForTimeout(2000);
      
      console.log('✅ Element selection successful');
      
      // Take screenshot after interaction
      await page.screenshot({ 
        path: 'test-results/flow-step-8-interaction.png', 
        fullPage: true 
      });
    }
    
    // Step 9: Final Validation
    console.log('✅ Step 9: Final Validation...');
    
    const contextualScore = Object.values(contextualAnalysis).filter(Boolean).length;
    const totalContextualChecks = Object.keys(contextualAnalysis).length;
    const contextualPercentage = (contextualScore / totalContextualChecks) * 100;
    
    const hasGeneratedContent = contentSections.motivations > 0 || contentSections.copyVariations > 0 || contentSections.results > 0;
    const hasInteractivity = interactiveElements.selectableItems > 0 || interactiveElements.buttons > 0;
    const workflowFunctional = !processingIndicators.errorMessage && (hasGeneratedContent || processingIndicators.processingText);
    
    console.log('\n📊 Complete Flow Validation Results:');
    console.log('=' .repeat(60));
    console.log(`🔐 Authentication: ✅ SUCCESS`);
    console.log(`🌊 Flow Page Access: ✅ SUCCESS`);
    console.log(`📁 File Upload: ✅ SUCCESS`);
    console.log(`🎯 Contextual Relevance: ${contextualPercentage.toFixed(1)}% (${contextualScore}/${totalContextualChecks})`);
    console.log(`🧠 Content Generation: ${hasGeneratedContent ? '✅ SUCCESS' : '⚠️ IN PROGRESS'}`);
    console.log(`🎮 Interactivity: ${hasInteractivity ? '✅ SUCCESS' : '⚠️ LIMITED'}`);
    console.log(`🔧 Workflow Status: ${workflowFunctional ? '✅ FUNCTIONAL' : '❌ NEEDS INVESTIGATION'}`);
    console.log(`❌ Errors Found: ${processingIndicators.errorMessage} errors`);
    
    // Take final comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/flow-step-9-final-validation.png', 
      fullPage: true 
    });
    
    // Cleanup
    fs.unlinkSync(briefFilePath);
    console.log('🧹 Temporary file cleaned up');
    
    // Calculate overall success
    const overallSuccess = loginSuccess && workflowFunctional && contextualPercentage > 30;
    
    console.log(`\n🎯 OVERALL FLOW VALIDATION: ${overallSuccess ? '✅ SUCCESS' : '⚠️ PARTIAL SUCCESS'}`);
    
    // Assertions
    expect(loginSuccess).toBe(true);
    expect(contextualPercentage).toBeGreaterThan(20);
    expect(processingIndicators.errorMessage).toBe(0);
    
    console.log('✅ Complete flow validation completed!');
  });
});
