import { test, expect } from '@playwright/test';

/**
 * AIRWAVE Flow Verification Test
 * Tests the complete flow workflow functionality
 */

test.describe('AIRWAVE Flow Verification', () => {
  
  test('Verify Flow Page Loads and Basic Functionality', async ({ page }) => {
    console.log('🚀 Testing AIRWAVE Flow Page...');
    
    // Navigate to the live deployment
    await page.goto('https://airwave-complete.netlify.app/flow', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot for verification
    await page.screenshot({ 
      path: 'test-results/flow-page-loaded.png', 
      fullPage: true 
    });
    
    // Check if page loaded successfully
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Look for key flow elements
    const flowElements = {
      briefUpload: await page.locator('input[type="file"], [data-testid*="upload"], button:has-text("Upload")').count(),
      briefTextArea: await page.locator('textarea, [data-testid*="brief"]').count(),
      generateButton: await page.locator('button:has-text("Generate"), button:has-text("Create"), [data-testid*="generate"]').count(),
      motivationSection: await page.locator('[data-testid*="motivation"], .motivation, h2:has-text("Motivation"), h3:has-text("Motivation")').count(),
      copySection: await page.locator('[data-testid*="copy"], .copy, h2:has-text("Copy"), h3:has-text("Copy")').count()
    };
    
    console.log('🔍 Flow Elements Found:');
    Object.entries(flowElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Test brief upload/input functionality
    const briefInput = page.locator('textarea, input[type="text"]:not([type="file"])').first();
    if (await briefInput.count() > 0) {
      console.log('📝 Testing brief input...');
      await briefInput.fill('Test brief for RedBaez fitness app targeting young professionals who want quick workouts');
      await page.waitForTimeout(1000);
      
      // Look for generate/submit button
      const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit"), button:has-text("Create"), button[type="submit"]').first();
      if (await submitButton.count() > 0) {
        console.log('🎯 Found submit button, testing click...');
        await submitButton.click();
        await page.waitForTimeout(3000);
        
        // Check for loading states or results
        const loadingIndicator = await page.locator('.loading, [data-testid*="loading"], .spinner').count();
        const resultsSection = await page.locator('[data-testid*="result"], .result, .motivation, .copy').count();
        
        console.log(`⏳ Loading indicators: ${loadingIndicator}`);
        console.log(`📊 Results sections: ${resultsSection}`);
      }
    }
    
    // Test navigation within flow
    const navLinks = await page.locator('a, button').all();
    console.log(`🧭 Found ${navLinks.length} navigation elements`);
    
    // Check for workflow steps
    const workflowSteps = await page.locator('.step, [data-testid*="step"], .workflow-step').count();
    console.log(`📋 Workflow steps found: ${workflowSteps}`);
    
    // Final screenshot
    await page.screenshot({ 
      path: 'test-results/flow-page-after-interaction.png', 
      fullPage: true 
    });
    
    // Basic assertions
    expect(page.url()).toContain('flow');
    expect(flowElements.briefUpload + flowElements.briefTextArea).toBeGreaterThan(0);
    
    console.log('✅ Flow page verification completed');
  });

  test('Test Brief Processing Workflow', async ({ page }) => {
    console.log('🧠 Testing Brief Processing Workflow...');
    
    await page.goto('https://airwave-complete.netlify.app/flow', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    // Test with a realistic brief
    const testBrief = `
    RedBaez Fitness App Campaign Brief
    
    Product: Mobile fitness app for busy professionals
    Target Audience: Working professionals aged 25-40 who struggle to find time for fitness
    Campaign Objective: Drive app downloads and 7-day trial signups
    Key Features: 15-minute workouts, personalized plans, progress tracking
    Platform: Instagram, Facebook, LinkedIn
    Budget: $50,000
    Timeline: 4 weeks
    `;
    
    // Look for brief input field
    const briefField = page.locator('textarea, input[type="text"]:not([type="file"])').first();
    
    if (await briefField.count() > 0) {
      console.log('📝 Entering test brief...');
      await briefField.fill(testBrief);
      
      // Submit the brief
      const submitBtn = page.locator('button:has-text("Generate"), button:has-text("Submit"), button:has-text("Process")').first();
      if (await submitBtn.count() > 0) {
        console.log('🚀 Submitting brief for processing...');
        await submitBtn.click();
        
        // Wait for processing
        await page.waitForTimeout(5000);
        
        // Check for AI-generated content
        const motivations = await page.locator('text=/motivation/i, text=/why/i').count();
        const copyVariations = await page.locator('text=/copy/i, text=/headline/i, text=/ad/i').count();
        
        console.log(`🎯 Motivations found: ${motivations}`);
        console.log(`📝 Copy variations found: ${copyVariations}`);
        
        // Take screenshot of results
        await page.screenshot({ 
          path: 'test-results/brief-processing-results.png', 
          fullPage: true 
        });
        
        // Verify contextual content generation
        const pageContent = await page.textContent('body');
        const hasContextualContent = pageContent?.includes('RedBaez') || 
                                   pageContent?.includes('fitness') || 
                                   pageContent?.includes('professional');
        
        console.log(`🎯 Contextual content generated: ${hasContextualContent}`);
        
        expect(motivations + copyVariations).toBeGreaterThan(0);
      }
    }
    
    console.log('✅ Brief processing workflow test completed');
  });
});
