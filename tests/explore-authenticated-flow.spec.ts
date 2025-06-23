import { test, expect } from '@playwright/test';

/**
 * Explore Authenticated Flow Interface
 * Discovers the correct way to use the flow interface with authentication
 */

const CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password-123'
};

test.describe('Explore Authenticated Flow Interface', () => {
  
  // Helper function to login
  async function login(page: any) {
    console.log('🔐 Logging in...');
    
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

  test('Explore Flow Interface and Find Brief Input Method', async ({ page }) => {
    console.log('🔍 Exploring Flow Interface to Find Brief Input Method...');
    
    // Login first
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    
    console.log('✅ Successfully logged in');
    
    // Navigate to flow page
    await page.goto('https://airwave-complete.netlify.app/flow');
    await page.waitForTimeout(3000);
    
    console.log(`📍 Flow page URL: ${page.url()}`);
    
    // Take comprehensive screenshot
    await page.screenshot({ 
      path: 'test-results/flow-interface-exploration.png', 
      fullPage: true 
    });
    
    // Explore all interactive elements
    console.log('🔍 Exploring all interactive elements...');
    
    const allElements = {
      buttons: await page.locator('button').all(),
      inputs: await page.locator('input').all(),
      textareas: await page.locator('textarea').all(),
      links: await page.locator('a').all(),
      forms: await page.locator('form').all(),
      fileInputs: await page.locator('input[type="file"]').all(),
      clickableElements: await page.locator('[role="button"], .clickable, .btn').all()
    };
    
    console.log('📊 Interactive Elements Found:');
    Object.entries(allElements).forEach(([type, elements]) => {
      console.log(`  ${type}: ${elements.length} elements`);
    });
    
    // Analyze buttons
    console.log('\n🔘 Button Analysis:');
    for (let i = 0; i < Math.min(allElements.buttons.length, 10); i++) {
      const button = allElements.buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      const isEnabled = await button.isEnabled();
      
      if (text && text.trim()) {
        console.log(`  Button ${i + 1}: "${text.trim()}" (visible: ${isVisible}, enabled: ${isEnabled})`);
      }
    }
    
    // Analyze inputs
    console.log('\n📝 Input Analysis:');
    for (let i = 0; i < Math.min(allElements.inputs.length, 10); i++) {
      const input = allElements.inputs[i];
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const readonly = await input.getAttribute('readonly');
      const isVisible = await input.isVisible();
      
      console.log(`  Input ${i + 1}: type="${type}", placeholder="${placeholder}", readonly="${readonly !== null}", visible: ${isVisible}`);
    }
    
    // Analyze textareas
    console.log('\n📄 Textarea Analysis:');
    for (let i = 0; i < allElements.textareas.length; i++) {
      const textarea = allElements.textareas[i];
      const placeholder = await textarea.getAttribute('placeholder');
      const readonly = await textarea.getAttribute('readonly');
      const isVisible = await textarea.isVisible();
      
      console.log(`  Textarea ${i + 1}: placeholder="${placeholder}", readonly="${readonly !== null}", visible: ${isVisible}`);
    }
    
    // Look for workflow initiation buttons
    console.log('\n🚀 Looking for workflow initiation...');
    
    const workflowButtons = [
      'button:has-text("Start")',
      'button:has-text("Begin")',
      'button:has-text("Create")',
      'button:has-text("New")',
      'button:has-text("Upload")',
      'button:has-text("Generate")',
      'button:has-text("Add")',
      'button:has-text("+")',
      '[data-testid*="create"]',
      '[data-testid*="start"]',
      '[data-testid*="new"]'
    ];
    
    for (const selector of workflowButtons) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`  Found ${elements} elements matching: ${selector}`);
        
        // Try clicking the first one
        const element = page.locator(selector).first();
        const text = await element.textContent();
        const isVisible = await element.isVisible();
        
        if (isVisible) {
          console.log(`  🎯 Trying to click: "${text}"`);
          await element.click();
          await page.waitForTimeout(2000);
          
          // Take screenshot after click
          await page.screenshot({ 
            path: `test-results/after-click-${selector.replace(/[^a-zA-Z0-9]/g, '_')}.png`, 
            fullPage: true 
          });
          
          // Check if interface changed
          const newUrl = page.url();
          console.log(`  📍 After click URL: ${newUrl}`);
          
          // Look for new elements
          const newInputs = await page.locator('textarea:not([readonly]), input[type="text"]:not([readonly])').count();
          const newFileInputs = await page.locator('input[type="file"]').count();
          
          console.log(`  📝 New editable inputs: ${newInputs}`);
          console.log(`  📁 File inputs: ${newFileInputs}`);
          
          if (newInputs > 0 || newFileInputs > 0) {
            console.log('  ✅ Found potential brief input method!');
            
            // Test the new input
            const editableInput = page.locator('textarea:not([readonly]), input[type="text"]:not([readonly])').first();
            if (await editableInput.count() > 0) {
              console.log('  🧪 Testing brief input...');
              await editableInput.fill('Test brief for RedBaez AIRWAVE 2.0');
              await page.waitForTimeout(1000);
              
              // Take screenshot with test input
              await page.screenshot({ 
                path: 'test-results/test-brief-input.png', 
                fullPage: true 
              });
              
              console.log('  ✅ Brief input successful!');
            }
            
            break; // Found working method
          }
        }
      }
    }
    
    // Check for file upload areas
    console.log('\n📁 Checking for file upload areas...');
    
    const uploadAreas = [
      '.upload-area',
      '.dropzone',
      '[data-testid*="upload"]',
      '.file-upload',
      'input[type="file"]'
    ];
    
    for (const selector of uploadAreas) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        console.log(`  Found ${elements} upload areas: ${selector}`);
      }
    }
    
    // Look for navigation or workflow steps
    console.log('\n🧭 Checking for workflow navigation...');
    
    const workflowSteps = await page.locator('.step, .workflow-step, .stepper, [data-testid*="step"]').count();
    const breadcrumbs = await page.locator('.breadcrumb, nav[aria-label*="breadcrumb"]').count();
    const tabs = await page.locator('.tab, [role="tab"], .MuiTab-root').count();
    
    console.log(`  Workflow steps: ${workflowSteps}`);
    console.log(`  Breadcrumbs: ${breadcrumbs}`);
    console.log(`  Tabs: ${tabs}`);
    
    // Check page content for clues
    const pageContent = await page.textContent('body');
    const hasFlowContent = pageContent?.toLowerCase().includes('brief') || 
                          pageContent?.toLowerCase().includes('upload') ||
                          pageContent?.toLowerCase().includes('create');
    
    console.log(`\n📄 Page contains flow-related content: ${hasFlowContent}`);
    
    console.log('✅ Flow interface exploration completed');
  });

  test('Explore Dashboard and Navigation', async ({ page }) => {
    console.log('🏠 Exploring Dashboard and Navigation...');
    
    const loginSuccess = await login(page);
    expect(loginSuccess).toBe(true);
    
    // Stay on dashboard first
    console.log(`📍 Dashboard URL: ${page.url()}`);
    
    // Take dashboard screenshot
    await page.screenshot({ 
      path: 'test-results/dashboard-exploration.png', 
      fullPage: true 
    });
    
    // Explore dashboard elements
    const dashboardElements = {
      title: await page.title(),
      navigation: await page.locator('nav a, .navbar a').all(),
      cards: await page.locator('.card, .dashboard-card').count(),
      buttons: await page.locator('button').count(),
      quickActions: await page.locator('.quick-action, .action-button').count()
    };
    
    console.log('🏠 Dashboard Elements:');
    console.log(`  Title: ${dashboardElements.title}`);
    console.log(`  Navigation links: ${dashboardElements.navigation.length}`);
    console.log(`  Cards: ${dashboardElements.cards}`);
    console.log(`  Buttons: ${dashboardElements.buttons}`);
    console.log(`  Quick actions: ${dashboardElements.quickActions}`);
    
    // Analyze navigation links
    console.log('\n🧭 Navigation Links:');
    for (let i = 0; i < Math.min(dashboardElements.navigation.length, 10); i++) {
      const link = dashboardElements.navigation[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      
      if (text && text.trim()) {
        console.log(`  ${text.trim()} → ${href}`);
      }
    }
    
    console.log('✅ Dashboard exploration completed');
  });
});
