import { getErrorMessage } from '@/utils/errorUtils';
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

test.describe('Flow UI Comprehensive Inspection', () => {
  test('Inspect Brief Parsing, Motivations, and Copy Flow', async ({ page }) => {
    console.log('🔍 Starting comprehensive flow UI inspection...');
    
    // Navigate to flow page
    await page.goto('/flow', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    await page.screenshot({ 
      path: 'screenshots/flow-ui-1-initial.png',
      fullPage: true 
    });
    
    console.log('📄 Flow page loaded, analyzing workflow structure...');
    
    // Look for the workflow container
    const workflowContainer = page.locator('.workflow, [data-testid*="workflow"], .brief-workflow, .unified-workflow');
    const hasWorkflow = await workflowContainer.count() > 0;
    
    if (hasWorkflow) {
      console.log('✅ Found workflow container');
      
      // Look for step indicators or navigation
      const stepIndicators = await page.locator('.step, .tab, .stepper, [role="tab"], .step-indicator').count();
      console.log(`Found ${stepIndicators} step indicators`);
      
      // Look for current step content
      const currentStepContent = await page.locator('.active-step, .current-step, [aria-selected="true"]').count();
      console.log(`Found ${currentStepContent} active step content areas`);
    }
    
    // 1. BRIEF UPLOAD SECTION
    console.log('📝 === EXAMINING BRIEF UPLOAD SECTION ===');
    
    // Look for file upload areas
    const fileInputs = await page.locator('input[type="file"]').count();
    console.log(`Found ${fileInputs} file input elements`);
    
    // Look for text input areas for brief content
    const textAreas = await page.locator('textarea, [contenteditable="true"]').all();
    console.log(`Found ${textAreas.length} text input areas`);
    
    let briefInput = null;
    
    // Try to find brief input area with various selectors
    const briefSelectors = [
      'textarea[placeholder*="brief" i]',
      'textarea[placeholder*="paste" i]',
      '[contenteditable="true"]',
      'textarea',
      'input[type="text"][placeholder*="brief" i]',
      '[data-testid*="brief"]',
      '.brief-input',
      '.brief-textarea'
    ];
    
    for (const selector of briefSelectors) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 2000 })) {
        briefInput = element;
        console.log(`✅ Found brief input using selector: ${selector}`);
        
        // Take screenshot of input area
        await element.screenshot({ path: 'screenshots/flow-ui-2-brief-input.png' });
        break;
      }
    }
    
    if (briefInput) {
      console.log('📝 Testing brief input...');
      
      try {
        // Clear any existing content and fill with RedBaez brief
        await briefInput.clear();
        await briefInput.fill(REDBAEZ_BRIEF);
        
        await page.screenshot({ 
          path: 'screenshots/flow-ui-3-brief-filled.png',
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
          'button:has-text("Analyze")',
          'button[type="submit"]',
          '.submit-btn',
          '.parse-btn',
          '.continue-btn'
        ];
        
        let submitButton = null;
        for (const buttonSelector of submitButtons) {
          const button = page.locator(buttonSelector).first();
          if (await button.isVisible({ timeout: 2000 })) {
            submitButton = button;
            console.log(`🔘 Found submit button: ${buttonSelector}`);
            break;
          }
        }
        
        if (submitButton) {
          console.log('🚀 Clicking submit/parse button...');
          await submitButton.click();
          
          // Wait for processing
          await page.waitForTimeout(3000);
          
          await page.screenshot({ 
            path: 'screenshots/flow-ui-4-after-submit.png',
            fullPage: true 
          });
          
          // Look for loading indicators
          const loadingElements = await page.locator('.loading, .spinner, .processing, [role="progressbar"]').count();
          console.log(`Found ${loadingElements} loading indicators`);
          
          // Wait for results to appear
          await page.waitForTimeout(5000);
          
        } else {
          console.log('❌ No submit button found');
        }
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`❌ Error filling brief: ${error.message}`);
      }
    } else {
      console.log('❌ No brief input area found');
    }
    
    // 2. PARSED BRIEF INFORMATION SECTION
    console.log('📋 === EXAMINING PARSED BRIEF SECTION ===');
    
    await page.screenshot({ 
      path: 'screenshots/flow-ui-5-parsed-brief-check.png',
      fullPage: true 
    });
    
    // Look for parsed brief display
    const parsedBriefSelectors = [
      '.parsed-brief',
      '.brief-summary',
      '.brief-analysis',
      '[data-testid*="parsed"]',
      '.analysis-result',
      '.brief-content',
      '.extracted-info'
    ];
    
    let foundParsedContent = false;
    for (const selector of parsedBriefSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`✅ Found parsed brief content: ${selector} (${elements} elements)`);
        foundParsedContent = true;
        
        // Take screenshot of parsed content
        await page.locator(selector).first().screenshot({ 
          path: 'screenshots/flow-ui-6-parsed-content.png' 
        });
      }
    }
    
    // Look for specific parsed information fields
    const infoFields = [
      'Brand',
      'Project Title',
      'Objective',
      'Target Audience',
      'Key Messages',
      'Platform',
      'Tone'
    ];
    
    for (const field of infoFields) {
      const fieldElements = await page.locator(`text="${field}"`).count();
      if (fieldElements > 0) {
        console.log(`✅ Found parsed field: ${field}`);
      }
    }
    
    if (!foundParsedContent) {
      console.log('❌ No parsed brief content found');
      
      // Look for any text containing RedBaez or AIrWAVE
      const redbaezText = await page.locator('text="Redbaez"').count();
      const airwaveText = await page.locator('text="AIrWAVE"').count();
      console.log(`Found ${redbaezText} mentions of "Redbaez", ${airwaveText} mentions of "AIrWAVE"`);
    }
    
    // 3. MOTIVATIONS SECTION
    console.log('🎯 === EXAMINING MOTIVATIONS SECTION ===');
    
    // Look for motivations display
    const motivationSelectors = [
      '.motivation',
      '.motivations',
      '.strategic-motivation',
      '[data-testid*="motivation"]',
      '.motivation-card',
      '.motivation-item',
      '.strategy-card'
    ];
    
    let foundMotivations = false;
    for (const selector of motivationSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`✅ Found motivations: ${selector} (${elements} elements)`);
        foundMotivations = true;
        
        // Take screenshot of motivations
        await page.locator(selector).first().screenshot({ 
          path: 'screenshots/flow-ui-7-motivations.png' 
        });
        
        // Try to get text content of first motivation
        try {
          const firstMotivationText = await page.locator(selector).first().textContent();
          console.log(`First motivation preview: ${firstMotivationText?.substring(0, 100)}...`);
        } catch (error) {
    const message = getErrorMessage(error);
          console.log('Could not read motivation text');
        }
      }
    }
    
    if (!foundMotivations) {
      console.log('❌ No motivations found');
      
      // Look for alternative motivation indicators
      const altMotivationText = await page.locator(':has-text("motivation")').count();
      const strategyText = await page.locator(':has-text("strategy")').count();
      console.log(`Found ${altMotivationText} elements with "motivation" text, ${strategyText} with "strategy" text`);
    }
    
    // 4. COPY GENERATION SECTION
    console.log('✍️ === EXAMINING COPY GENERATION SECTION ===');
    
    // Look for copy/content generation area
    const copySelectors = [
      '.copy',
      '.content',
      '.generated-copy',
      '.copy-generation',
      '[data-testid*="copy"]',
      '.copy-content',
      '.generated-content',
      '.copy-result',
      '.content-result'
    ];
    
    let foundCopy = false;
    for (const selector of copySelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`✅ Found copy content: ${selector} (${elements} elements)`);
        foundCopy = true;
        
        // Take screenshot of copy content
        await page.locator(selector).first().screenshot({ 
          path: 'screenshots/flow-ui-8-copy-content.png' 
        });
      }
    }
    
    if (!foundCopy) {
      console.log('❌ No copy generation content found');
      
      // Look for alternative copy indicators
      const altCopyText = await page.locator(':has-text("copy")').count();
      const contentText = await page.locator(':has-text("content")').count();
      console.log(`Found ${altCopyText} elements with "copy" text, ${contentText} with "content" text`);
    }
    
    // 5. OVERALL UI STRUCTURE ANALYSIS
    console.log('🔍 === OVERALL UI STRUCTURE ANALYSIS ===');
    
    // Take final full page screenshot
    await page.screenshot({ 
      path: 'screenshots/flow-ui-9-final-state.png',
      fullPage: true 
    });
    
    // Analyze overall structure
    const cards = await page.locator('.card, .panel, .section').count();
    const headers = await page.locator('h1, h2, h3, h4').count();
    const buttons = await page.locator('button').count();
    const forms = await page.locator('form').count();
    
    console.log(`\n📊 UI Structure Summary:`);
    console.log(`- Cards/Panels: ${cards}`);
    console.log(`- Headers: ${headers}`);
    console.log(`- Buttons: ${buttons}`);
    console.log(`- Forms: ${forms}`);
    
    // Look for navigation/progress indicators
    const navElements = await page.locator('.nav, .navigation, .breadcrumb, .steps, .progress').count();
    console.log(`- Navigation elements: ${navElements}`);
    
    // Check for error messages
    const errors = await page.locator('.error, .alert-error, [role="alert"]').count();
    console.log(`- Error messages: ${errors}`);
    
    if (errors > 0) {
      const firstError = await page.locator('.error, .alert-error, [role="alert"]').first().textContent();
      console.log(`First error: ${firstError}`);
    }
    
    // Check for success indicators
    const success = await page.locator('.success, .alert-success, .complete').count();
    console.log(`- Success indicators: ${success}`);
    
    console.log('\n🏁 Flow UI inspection completed');
    
    // Summary of findings
    console.log('\n📋 === INSPECTION SUMMARY ===');
    console.log(`Brief Input: ${briefInput ? '✅ Found' : '❌ Not Found'}`);
    console.log(`Parsed Brief: ${foundParsedContent ? '✅ Found' : '❌ Not Found'}`);
    console.log(`Motivations: ${foundMotivations ? '✅ Found' : '❌ Not Found'}`);
    console.log(`Copy Content: ${foundCopy ? '✅ Found' : '❌ Not Found'}`);
  });

  test('Test Workflow Step Navigation', async ({ page }) => {
    console.log('🧭 Testing workflow step navigation...');
    
    await page.goto('/flow', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    // Look for step navigation elements
    const stepButtons = await page.locator('button, .tab, [role="tab"]').all();
    console.log(`Found ${stepButtons.length} potential navigation elements`);
    
    // Try to identify and click through steps
    for (let i = 0; i < Math.min(stepButtons.length, 10); i++) {
      try {
        const button = stepButtons[i];
        const text = await button.textContent();
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        
        console.log(`Button ${i}: "${text}" (visible: ${isVisible}, enabled: ${isEnabled})`);
        
        if (isVisible && isEnabled && text && 
            (text.toLowerCase().includes('step') || 
             text.toLowerCase().includes('brief') || 
             text.toLowerCase().includes('motivation') || 
             text.toLowerCase().includes('copy') ||
             text.toLowerCase().includes('next') ||
             text.toLowerCase().includes('continue'))) {
          
          console.log(`🔘 Clicking navigation element: "${text}"`);
          
          await page.screenshot({ 
            path: `screenshots/step-nav-${i}-before.png`,
            fullPage: true 
          });
          
          await button.click();
          await page.waitForTimeout(2000);
          
          await page.screenshot({ 
            path: `screenshots/step-nav-${i}-after.png`,
            fullPage: true 
          });
        }
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`Error with button ${i}: ${error.message}`);
      }
    }
    
    console.log('✅ Step navigation test completed');
  });
});