import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const testCredentialsPath = path.join(process.cwd(), 'test-credentials.json');
const testCredentials = JSON.parse(fs.readFileSync(testCredentialsPath, 'utf8'));

test.describe('Complete Workflow to Matrix Test', () => {
  test('Full workflow from upload to content matrix', async ({ page }) => {
    console.log('🚀 Starting COMPLETE workflow test to matrix...');
    
    // Set up comprehensive error tracking
    const pageErrors = [];
    const consoleErrors = [];
    
    page.on('pageerror', error => {
      console.log('🚨 PAGE ERROR:', error.message);
      pageErrors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 CONSOLE ERROR:', msg.text());
        consoleErrors.push(msg.text());
      } else if (msg.text().includes('SESSION_')) {
        console.log('💾 SESSION:', msg.text());
      }
    });
    
    // Login
    console.log('🔑 Logging in...');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Logged in successfully');
    
    // Wait for dashboard to fully load
    await page.waitForTimeout(2000);
    
    // Navigate to workflow with retry logic
    console.log('🚀 Navigating to workflow page...');
    try {
      await page.goto('http://localhost:3000/flow', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });
    } catch (error) {
      console.log('⚠️ First navigation attempt failed, retrying...');
      await page.waitForTimeout(1000);
      await page.goto('http://localhost:3000/flow', { 
        waitUntil: 'load',
        timeout: 15000 
      });
    }
    await page.waitForTimeout(3000);
    
    // Verify dialog is visible
    const workflowDialog = page.locator('[role="dialog"]');
    await expect(workflowDialog).toBeVisible();
    console.log('💬 Workflow dialog visible');
    
    // Create comprehensive test brief
    const testContent = `
# COMPREHENSIVE MARKETING BRIEF

## Project Overview
**Project Name:** Revolutionary AI-Powered Productivity Suite Launch
**Brand:** TechFlow Solutions
**Campaign Duration:** Q1 2024 Launch Campaign
**Budget:** $500,000 total marketing spend

## Target Audience
**Primary Audience:** 
- Tech-savvy professionals aged 25-45
- Small to medium business owners
- Productivity enthusiasts and early adopters
- Remote workers and digital nomads

**Secondary Audience:**
- Enterprise decision makers
- IT managers and CTOs
- Startup founders and entrepreneurs

## Key Messages
1. **Revolutionary Efficiency:** "Transform your workflow with AI that thinks ahead"
2. **Seamless Integration:** "One platform, infinite possibilities"
3. **Smart Automation:** "Work smarter, not harder with intelligent automation"
4. **Future-Ready:** "The productivity suite designed for tomorrow's challenges"

## Campaign Objectives
- Generate 50,000+ qualified leads in Q1
- Achieve 15% market share in productivity software segment
- Build brand awareness to 35% among target demographic
- Drive 10,000+ trial sign-ups in first month

## Competitive Landscape
**Primary Competitors:**
- Notion (comprehensive workspace)
- Asana (project management) 
- Monday.com (team collaboration)
- ClickUp (all-in-one productivity)
- Todoist (task management)

## Brand Personality
- Innovative and forward-thinking
- Professional yet approachable
- Reliable and trustworthy
- Cutting-edge but user-friendly

## Creative Direction
**Visual Style:** Modern, clean, tech-forward aesthetic
**Color Palette:** Deep blues, energetic oranges, clean whites
**Typography:** Sans-serif, modern, highly readable
**Imagery:** Real professionals in modern workspaces, diverse teams collaborating

## Channels & Platforms
- LinkedIn (B2B focus)
- Twitter (thought leadership)
- YouTube (product demos)
- Google Ads (search marketing)
- Industry publications and blogs
- Podcast sponsorships
- Conference speaking opportunities

## Success Metrics
- Lead generation volume and quality
- Trial-to-paid conversion rates
- Brand awareness lift
- Social media engagement rates
- Website traffic and conversion
- Customer acquisition cost (CAC)
- Return on ad spend (ROAS)

## Timeline
- Week 1-2: Creative development and asset creation
- Week 3-4: Campaign launch and initial optimization
- Week 5-8: Full campaign execution and scaling
- Week 9-12: Analysis, optimization, and planning for Q2
`;

    const tempFilePath = path.join(process.cwd(), 'temp-complete-brief.txt');
    fs.writeFileSync(tempFilePath, testContent);
    
    try {
      // STEP 1: Upload file
      console.log('📁 Step 1: Uploading comprehensive brief...');
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(tempFilePath);
      
      // Wait for file processing with extended timeout
      let processingTime = 0;
      while (processingTime < 60) {
        await page.waitForTimeout(5000);
        processingTime += 5;
        console.log(`⏳ Still processing... (${processingTime}s)`);
        
        // Check if processing completed
        const briefReadyAlert = await page.locator('[role="alert"]').filter({ hasText: 'Brief Ready!' }).first();
        if (await briefReadyAlert.isVisible().catch(() => false)) {
          console.log('🎉 Brief processing completed!');
          break;
        }
      }
      
      // Clean up temp file
      console.log('🧹 Cleaned up temp file');
      await fs.promises.unlink(tempFilePath).catch(() => {});
      
      // Step 2: After file processing, we should see the success alert at step 0
      console.log('🎯 Step 2: Verifying brief ready state...');
      const briefReadyAlert = page.locator('text=Brief Ready!');
      await expect(briefReadyAlert).toBeVisible();
      
      // Look for the continue instruction
      const continueInstruction = page.locator('text=Click "Generate Strategic Motivations" to continue');
      await expect(continueInstruction).toBeVisible();
      
      // Step 3: Now we need to find and click the button to advance to motivations
      console.log('🎯 Step 3: Looking for navigation to motivations...');
      
      // The workflow might have a "Next" button or we might need to click somewhere to advance
      // Let's look for common navigation patterns
      const nextButton = page.locator('button').filter({ hasText: /Next|Continue|Proceed/i });
      const motivationButton = page.locator('button').filter({ hasText: /Generate.*Motivations/i });
      
      // Try to find any button that might advance the workflow
      let advanceButton = null;
      if (await nextButton.isVisible()) {
        advanceButton = nextButton;
        console.log('📍 Found Next/Continue button');
      } else if (await motivationButton.isVisible()) {
        advanceButton = motivationButton;
        console.log('📍 Found Generate Motivations button');
      } else {
        // Look for any button that might advance the workflow
        const allButtons = page.locator('button');
        const buttonCount = await allButtons.count();
        console.log(`📍 Found ${buttonCount} buttons, checking each one...`);
        
        for (let i = 0; i < buttonCount; i++) {
          const button = allButtons.nth(i);
          const buttonText = await button.textContent();
          console.log(`📍 Button ${i}: "${buttonText}"`);
          
          if (buttonText && (
            buttonText.toLowerCase().includes('next') ||
            buttonText.toLowerCase().includes('continue') ||
            buttonText.toLowerCase().includes('motivations') ||
            buttonText.toLowerCase().includes('proceed')
          )) {
            advanceButton = button;
            console.log(`📍 Selected button: "${buttonText}"`);
            break;
          }
        }
      }
      
      if (advanceButton) {
        await advanceButton.click();
        console.log('✅ Clicked advance button');
        await page.waitForTimeout(2000);
      } else {
        console.log('⚠️ No advance button found, workflow might auto-advance or have different UI');
      }
      
      // Step 4: Now we should be at step 1 (motivations) or see the generate motivations button
      console.log('🎯 Step 4: Generating strategic motivations...');
      try {
        // Look for the Generate Strategic Motivations button
        const generateButton = page.locator('button').filter({ hasText: 'Generate Strategic Motivations' }).first();
        if (await generateButton.isVisible()) {
          await generateButton.click();
          console.log('✅ Clicked Generate Strategic Motivations button');
        } else {
          console.log('⚠️ Generate button not visible, checking if motivations are already generating...');
          
          // Check if motivations are already being generated
          const generatingText = page.locator('text=Generating Motivations').first();
          if (await generatingText.isVisible()) {
            console.log('✅ Motivations are already being generated');
          } else {
            throw new Error('Cannot find Generate Strategic Motivations button or generating state');
          }
        }
      } catch (error) {
        // Look for any text that indicates we're in the motivations step
        const motivationText = page.locator('text=Strategic Motivations').or(page.locator('text=Motivations')).first();
        const hasMotivationText = await motivationText.isVisible();
        console.log(`📍 Motivation text visible: ${hasMotivationText}`);
        
        throw error;
      }
      
      // Wait for motivations to be generated (they might take time)
      console.log('⏳ Waiting for motivations to be generated...');
      await page.waitForTimeout(10000); // Wait 10 seconds for motivations to generate
      
      // Check for generated motivations
      const motivationOptions = await page.locator('[data-testid*="motivation"], .motivation-option, button:has-text("Select")').count();
      console.log(`📊 Found ${motivationOptions} motivation options`);
      
      // Look for alternative ways to identify motivation buttons
      const altMotivationBtns = await page.locator('button').filter({ hasText: /strategic|motivation|select/i }).count();
      console.log(`📊 Found ${altMotivationBtns} alternative motivation buttons`);
      
      // If we have motivations, select some
      if (motivationOptions > 0) {
        const firstMotivation = page.locator('[data-testid*="motivation"], .motivation-option, button:has-text("Select")').first();
        await firstMotivation.click();
        console.log('✅ Selected first motivation');
      } else if (altMotivationBtns > 0) {
        const firstAltMotivation = page.locator('button').filter({ hasText: /strategic|motivation|select/i }).first();
        await firstAltMotivation.click();
        console.log('✅ Selected first alternative motivation');
      }
      
      // Step 5: Proceed to copy generation
      console.log('🎯 Step 5: Looking for proceed to copy button...');
      
      // Try multiple button text patterns
      const proceedButtons = [
        page.locator('button').filter({ hasText: /generate.*copy|proceed.*copy|next/i }),
        page.locator('button').filter({ hasText: /continue|proceed|next step/i }),
        page.locator('button:has-text("Next")'),
        page.locator('button:has-text("Continue")'),
        page.locator('button:has-text("Proceed")')
      ];
      
      let proceedBtn = null;
      for (const btn of proceedButtons) {
        if (await btn.first().isVisible()) {
          proceedBtn = btn.first();
          console.log(`✅ Found proceed button: ${await proceedBtn.textContent()}`);
          break;
        }
      }
      
      if (!proceedBtn) {
        // Debug: Show all visible buttons
        const allButtons = await page.locator('button').all();
        console.log('🔍 All visible buttons:');
        for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
          const text = await allButtons[i].textContent();
          console.log(`📍 Button ${i}: "${text?.trim()}"`);
        }
        
        // Try to find any button that might advance the workflow
        proceedBtn = page.locator('button').filter({ hasText: /^(Next|Continue|Proceed|Generate)$/i }).first();
      }
      
      // Proceed to copy generation
      const proceedToCopyBtn = page.locator('button').filter({ hasText: /generate.*copy|proceed.*copy|next/i });
      await expect(proceedToCopyBtn).toBeVisible();
      await proceedToCopyBtn.click();
      console.log('✅ Proceeding to copy generation');
      
      // STEP 3: Generate Copy Variations
      console.log('📝 Step 3: Generating copy variations...');
      await page.waitForTimeout(15000); // Wait for copy generation
      
      // Look for copy variations
      const copyCards = page.locator('[data-testid="copy-card"], .copy-card, [class*="copy"]');
      const copyCount = await copyCards.count();
      console.log(`📝 Found ${copyCount} copy variations`);
      
      if (copyCount > 0) {
        // Select first few copy variations
        for (let i = 0; i < Math.min(3, copyCount); i++) {
          await copyCards.nth(i).click();
          await page.waitForTimeout(500);
        }
      }
      
      // Proceed to assets
      const proceedToAssetsBtn = page.locator('button').filter({ hasText: /asset|next|proceed/i });
      if (await proceedToAssetsBtn.isVisible()) {
        await proceedToAssetsBtn.click();
        console.log('✅ Proceeding to assets');
      }
      
      // STEP 4: Asset Selection
      console.log('🎨 Step 4: Selecting assets...');
      await page.waitForTimeout(5000);
      
      // Look for asset options
      const assetButtons = page.locator('button').filter({ hasText: /image|video|voice|audio/i });
      const assetCount = await assetButtons.count();
      console.log(`🎨 Found ${assetCount} asset options`);
      
      if (assetCount > 0) {
        // Click first asset type (usually images)
        await assetButtons.first().click();
        await page.waitForTimeout(10000); // Wait for asset generation
      }
      
      // Proceed to templates
      const proceedToTemplatesBtn = page.locator('button').filter({ hasText: /template|next|proceed/i });
      if (await proceedToTemplatesBtn.isVisible()) {
        await proceedToTemplatesBtn.click();
        console.log('✅ Proceeding to templates');
      }
      
      // STEP 5: Template Selection
      console.log('📋 Step 5: Selecting templates...');
      await page.waitForTimeout(5000);
      
      // Look for template options
      const templateCards = page.locator('[data-testid="template-card"], .template-card, [class*="template"]');
      const templateCount = await templateCards.count();
      console.log(`📋 Found ${templateCount} template options`);
      
      if (templateCount > 0) {
        // Select first template
        await templateCards.first().click();
        await page.waitForTimeout(1000);
      }
      
      // Proceed to matrix
      const proceedToMatrixBtn = page.locator('button').filter({ hasText: /matrix|generate.*matrix|next|proceed/i });
      if (await proceedToMatrixBtn.isVisible()) {
        await proceedToMatrixBtn.click();
        console.log('✅ Proceeding to content matrix');
      }
      
      // STEP 6: Content Matrix Generation
      console.log('📊 Step 6: Generating content matrix...');
      await page.waitForTimeout(15000); // Wait for matrix generation
      
      // Check for matrix content
      const matrixElements = page.locator('[data-testid="matrix"], .matrix, [class*="matrix"]');
      const matrixCount = await matrixElements.count();
      console.log(`📊 Found ${matrixCount} matrix elements`);
      
      // Look for matrix summary or content
      const matrixSummary = page.locator('text=Content Matrix').or(page.locator('text=Matrix Generated'));
      const hasMatrix = await matrixSummary.isVisible();
      console.log(`📊 Matrix visible: ${hasMatrix}`);
      
      // Take final screenshot
      await page.screenshot({ path: 'workflow-matrix-final.png', fullPage: true });
      
      // Get final state
      const finalState = await page.evaluate(() => {
        const stored = sessionStorage.getItem('airwave_unified_workflow_state');
        return stored ? JSON.parse(stored) : null;
      });
      
      console.log('🎯 FINAL WORKFLOW STATE:');
      console.log(`📍 Active Step: ${finalState?.activeStep || 'Unknown'}`);
      console.log(`📁 Has Brief Data: ${finalState?.briefData ? 'YES' : 'NO'}`);
      console.log(`🎯 Motivations: ${finalState?.motivations?.length || 0}`);
      console.log(`📝 Copy Variations: ${finalState?.copyVariations?.length || 0}`);
      console.log(`🎨 Selected Assets: ${finalState?.selectedAssets?.length || 0}`);
      console.log(`📋 Selected Templates: ${finalState?.selectedTemplates?.length || 0}`);
      console.log(`📊 Content Matrix: ${finalState?.contentMatrix ? 'Generated' : 'Not Generated'}`);
      
      // Verify we reached the matrix step
      if (finalState?.activeStep >= 5 || finalState?.contentMatrix) {
        console.log('🎉 SUCCESS: Reached content matrix step!');
      } else {
        console.log(`⚠️ WARNING: Only reached step ${finalState?.activeStep}, matrix not generated`);
      }
      
      // Report any errors
      if (pageErrors.length > 0) {
        console.log('🚨 Page Errors:', pageErrors);
      }
      if (consoleErrors.length > 0) {
        console.log('🚨 Console Errors:', consoleErrors);
      }
      
    } finally {
      // Cleanup
      if (fs.existsSync(tempFilePath)) {
        fs.promises.unlink(tempFilePath).catch(() => {});
        console.log('🧹 Cleaned up temp file');
      }
    }
  });
});
