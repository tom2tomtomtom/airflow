import { test, expect } from '@playwright/test';

test.describe('Detailed Workflow Analysis', () => {
  test('Examine UnifiedBriefWorkflow Dialog Content', async ({ page }) => {
    console.log('🔍 Starting detailed workflow analysis...');
    
    await page.goto('/flow', { timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    
    // Take initial screenshot
    await page.screenshot({ 
      path: 'screenshots/workflow-1-initial.png',
      fullPage: true 
    });
    
    console.log('📄 Flow page loaded');
    
    // Look for dialog/modal elements
    console.log('\n=== DIALOG/MODAL ANALYSIS ===');
    const dialogs = await page.locator('[role="dialog"], .MuiDialog-root, .dialog').count();
    const modals = await page.locator('[role="modal"], .modal, .MuiModal-root').count();
    const overlays = await page.locator('.overlay, .backdrop, .MuiBackdrop-root').count();
    
    console.log(`Dialogs: ${dialogs}`);
    console.log(`Modals: ${modals}`);
    console.log(`Overlays: ${overlays}`);
    
    // Check if workflow dialog is open
    if (dialogs > 0 || modals > 0) {
      console.log('✅ Found dialog/modal - examining content...');
      
      // Take screenshot of dialog area
      const dialogElement = page.locator('[role="dialog"], .MuiDialog-root').first();
      if (await dialogElement.isVisible()) {
        await dialogElement.screenshot({ 
          path: 'screenshots/workflow-2-dialog.png' 
        });
        
        // Get dialog content
        const dialogContent = await dialogElement.textContent();
        console.log(`Dialog content preview: ${dialogContent?.substring(0, 300)}...`);
        
        // Look for specific workflow elements within dialog
        await analyzeWorkflowContent(page, dialogElement);
      }
    } else {
      console.log('❌ No dialogs/modals found - workflow might be inline');
      
      // Look for inline workflow content
      await analyzeWorkflowContent(page, page.locator('body'));
    }
    
    // Check for any hidden elements that might contain workflow
    console.log('\n=== HIDDEN CONTENT CHECK ===');
    const allElements = await page.locator('*').count();
    console.log(`Total elements on page: ${allElements}`);
    
    // Look for elements with display:none or hidden attributes
    const hiddenElements = await page.locator('[style*="display: none"], [hidden]').count();
    console.log(`Hidden elements: ${hiddenElements}`);
    
    // Look for workflow-specific CSS classes
    const workflowClasses = [
      '.workflow',
      '.brief-workflow',
      '.unified-workflow',
      '.stepper',
      '.step-content',
      '.MuiStepper-root'
    ];
    
    for (const className of workflowClasses) {
      const visible = await page.locator(`${className}:visible`).count();
      const hidden = await page.locator(`${className}:hidden`).count();
      const total = await page.locator(className).count();
      
      if (total > 0) {
        console.log(`${className}: ${total} total (${visible} visible, ${hidden} hidden)`);
      }
    }
    
    console.log('\n✅ Detailed workflow analysis completed');
  });
  
  async function analyzeWorkflowContent(page: any, container: any) {
    console.log('\n=== WORKFLOW CONTENT ANALYSIS ===');
    
    // 1. STEP INDICATORS
    console.log('📍 Step indicators:');
    const steppers = await container.locator('.MuiStepper-root, .stepper, .step-indicator').count();
    const steps = await container.locator('.MuiStep-root, .step, [role="tab"]').count();
    console.log(`Steppers: ${steppers}, Steps: ${steps}`);
    
    if (steps > 0) {
      const stepElements = await container.locator('.MuiStep-root, .step, [role="tab"]').all();
      for (let i = 0; i < Math.min(stepElements.length, 5); i++) {
        const stepText = await stepElements[i].textContent();
        const isActive = await stepElements[i].getAttribute('aria-selected') === 'true' ||
                         await stepElements[i].locator('.active, .Mui-active').count() > 0;
        console.log(`  Step ${i + 1}: "${stepText?.trim()}" (active: ${isActive})`);
      }
    }
    
    // 2. FILE UPLOAD SECTION
    console.log('\n📁 File upload section:');
    const fileInputs = await container.locator('input[type="file"]').count();
    const dropzones = await container.locator('.dropzone, [data-testid*="drop"]').count();
    const uploadButtons = await container.locator('button:has-text("Upload"), button:has-text("Choose")').count();
    
    console.log(`File inputs: ${fileInputs}`);
    console.log(`Dropzones: ${dropzones}`);
    console.log(`Upload buttons: ${uploadButtons}`);
    
    // 3. TEXT INPUT AREAS
    console.log('\n📝 Text input areas:');
    const textareas = await container.locator('textarea').count();
    const contentEditables = await container.locator('[contenteditable="true"]').count();
    const textInputs = await container.locator('input[type="text"]').count();
    
    console.log(`Textareas: ${textareas}`);
    console.log(`Content editables: ${contentEditables}`);
    console.log(`Text inputs: ${textInputs}`);
    
    // Check placeholder text to identify purpose
    if (textareas > 0) {
      const firstTextarea = container.locator('textarea').first();
      const placeholder = await firstTextarea.getAttribute('placeholder');
      console.log(`First textarea placeholder: "${placeholder}"`);
    }
    
    // 4. PARSED BRIEF DISPLAY
    console.log('\n📋 Parsed brief display:');
    const briefSections = await container.locator('.brief-section, .parsed-brief, .brief-content').count();
    const infoCards = await container.locator('.card, .panel, .section').count();
    
    console.log(`Brief sections: ${briefSections}`);
    console.log(`Info cards: ${infoCards}`);
    
    // Look for specific brief fields
    const briefFields = ['Brand', 'Objective', 'Target Audience', 'Platform', 'Tone'];
    for (const field of briefFields) {
      const fieldCount = await container.locator(`:has-text("${field}")`).count();
      if (fieldCount > 0) {
        console.log(`  Found field: ${field}`);
      }
    }
    
    // 5. MOTIVATIONS SECTION
    console.log('\n🎯 Motivations section:');
    const motivationCards = await container.locator('.motivation, .strategy-card, .motivation-card').count();
    const motivationButtons = await container.locator('button:has-text("motivation"), button:has-text("strategy")').count();
    
    console.log(`Motivation cards: ${motivationCards}`);
    console.log(`Motivation buttons: ${motivationButtons}`);
    
    // 6. COPY GENERATION SECTION
    console.log('\n✍️ Copy generation section:');
    const copyCards = await container.locator('.copy-card, .content-card, .generated-copy').count();
    const copyButtons = await container.locator('button:has-text("copy"), button:has-text("generate")').count();
    
    console.log(`Copy cards: ${copyCards}`);
    console.log(`Copy buttons: ${copyButtons}`);
    
    // 7. ACTION BUTTONS
    console.log('\n🔘 Action buttons:');
    const allButtons = await container.locator('button').all();
    console.log(`Total buttons in workflow: ${allButtons.length}`);
    
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const button = allButtons[i];
      const text = await button.textContent();
      const visible = await button.isVisible();
      const enabled = await button.isEnabled();
      
      if (text?.trim()) {
        console.log(`  Button: "${text.trim()}" (visible: ${visible}, enabled: ${enabled})`);
      }
    }
    
    // 8. CURRENT STEP CONTENT
    console.log('\n📄 Current step content:');
    const activeContent = await container.locator('.active-step, .current-step, [aria-selected="true"]').count();
    console.log(`Active step content areas: ${activeContent}`);
    
    if (activeContent > 0) {
      const currentContent = await container.locator('.active-step, .current-step, [aria-selected="true"]').first().textContent();
      console.log(`Current step preview: ${currentContent?.substring(0, 200)}...`);
    }
    
    // Take screenshot of the current state
    await page.screenshot({ 
      path: 'screenshots/workflow-3-content-analysis.png',
      fullPage: true 
    });
  }
});