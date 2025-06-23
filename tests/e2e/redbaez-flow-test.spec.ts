import { test } from '@playwright/test';

const REDBAEZ_BRIEF = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez
Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective: Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed.

Target Audience:
Primary: Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
Mid-to-senior decision-makers (CMOs, creative directors, media planners).

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale.

Platform: Meta platforms will be at the core of the launch strategy.

Tone: Conversational, inspiring, and confident.`;

test.describe('RedBaez Flow End-to-End Test', () => {
  test('Complete RedBaez Brief Flow', async ({ page }) => {
    console.log('🚀 Starting RedBaez brief flow test...');
    
    // Navigate to flow page
    await page.goto('/flow', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await page.screenshot({ 
      path: 'screenshots/redbaez-1-flow-initial.png',
      fullPage: true 
    });
    
    console.log('📄 Flow page loaded, analyzing page structure...');
    
    // Analyze page structure
    const pageContent = await page.content();
    console.log('Page title:', await page.title());
    
    // Look for all possible input elements
    const allInputs = await page.locator('input, textarea, [contenteditable]').all();
    console.log(`Found ${allInputs.length} input elements`);
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      const tagName = await input.evaluate(el => el.tagName);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const className = await input.getAttribute('class');
      
      console.log(`Input ${i}: ${tagName}${type ? `[${type}]` : ''} placeholder="${placeholder}" class="${className}"`);
    }
    
    // Look for buttons
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons`);
    
    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const className = await button.getAttribute('class');
      
      console.log(`Button ${i}: "${text}" class="${className}"`);
    }
    
    // Try to find brief input area
    const briefInputSelectors = [
      'textarea',
      'input[type="text"]', 
      'input[placeholder*="brief"]',
      'textarea[placeholder*="brief"]',
      '[data-testid*="brief"]',
      '.brief-input',
      '[contenteditable="true"]'
    ];
    
    let briefInput = null;
    for (const selector of briefInputSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        briefInput = element;
        console.log(`✅ Found brief input using selector: ${selector}`);
        break;
      }
    }
    
    if (briefInput) {
      console.log('📝 Filling in RedBaez brief...');
      await briefInput.fill(REDBAEZ_BRIEF);
      
      await page.screenshot({ 
        path: 'screenshots/redbaez-2-brief-filled.png',
        fullPage: true 
      });
      
      console.log('✅ Brief filled successfully');
      
      // Look for submit/parse button
      const submitButtons = [
        'button:has-text("Parse")',
        'button:has-text("Submit")',
        'button:has-text("Upload")',
        'button:has-text("Process")',
        'button:has-text("Continue")',
        'button:has-text("Next")',
        'button[type="submit"]'
      ];
      
      for (const buttonSelector of submitButtons) {
        const button = page.locator(buttonSelector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`🔘 Clicking submit button: ${buttonSelector}`);
          await button.click();
          
          // Wait for processing
          await page.waitForTimeout(5000);
          await page.waitForLoadState('networkidle', { timeout: 30000 });
          
          await page.screenshot({ 
            path: 'screenshots/redbaez-3-after-submit.png',
            fullPage: true 
          });
          
          console.log('✅ Submit button clicked, waiting for results...');
          break;
        }
      }
      
      // Check for motivations or next step
      await page.waitForTimeout(3000);
      
      const motivationElements = await page.locator('.motivation, .card, .result').count();
      console.log(`Found ${motivationElements} potential motivation/result elements`);
      
      if (motivationElements > 0) {
        console.log('✅ Motivations or results appeared');
        
        await page.screenshot({ 
          path: 'screenshots/redbaez-4-results.png',
          fullPage: true 
        });
        
        // Try to interact with results
        const firstResult = page.locator('.motivation, .card, .result').first();
        if (await firstResult.isVisible()) {
          await firstResult.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: 'screenshots/redbaez-5-interaction.png',
            fullPage: true 
          });
        }
      }
      
    } else {
      console.log('❌ No brief input found on flow page');
      
      // Check if we need to navigate differently
      const links = await page.locator('a').all();
      console.log('Available links on page:');
      for (const link of links.slice(0, 10)) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        console.log(`Link: "${text}" href="${href}"`);
      }
    }
    
    console.log('🏁 RedBaez flow test completed');
  });

  test('Analyze Flow Page Structure', async ({ page }) => {
    console.log('🔍 Analyzing flow page structure in detail...');
    
    await page.goto('/flow', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Get page HTML structure for analysis
    const pageHTML = await page.content();
    
    // Look for forms
    const forms = await page.locator('form').count();
    console.log(`Found ${forms} forms`);
    
    // Look for file upload capabilities
    const fileInputs = await page.locator('input[type="file"]').count();
    console.log(`Found ${fileInputs} file inputs`);
    
    // Look for text areas
    const textAreas = await page.locator('textarea').count();
    console.log(`Found ${textAreas} text areas`);
    
    // Look for dropzones
    const dropzones = await page.locator('.dropzone, [data-testid*="drop"], .upload-area').count();
    console.log(`Found ${dropzones} potential dropzones`);
    
    // Check page title and headings
    const title = await page.title();
    const h1s = await page.locator('h1').count();
    const h2s = await page.locator('h2').count();
    
    console.log(`Page title: "${title}"`);
    console.log(`Found ${h1s} h1 headings, ${h2s} h2 headings`);
    
    if (h1s > 0) {
      const firstH1 = await page.locator('h1').first().textContent();
      console.log(`First H1: "${firstH1}"`);
    }
    
    // Look for any error messages or warnings
    const errors = await page.locator('.error, .alert, .warning, [role="alert"]').count();
    console.log(`Found ${errors} error/alert elements`);
    
    if (errors > 0) {
      const firstError = await page.locator('.error, .alert, .warning, [role="alert"]').first().textContent();
      console.log(`First error message: "${firstError}"`);
    }
    
    await page.screenshot({ 
      path: 'screenshots/flow-structure-analysis.png',
      fullPage: true 
    });
    
    console.log('✅ Flow page structure analysis completed');
  });
});