const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runInteractiveUXTest() {
  const browser = await chromium.launch({ 
    headless: false, // Show browser for visual verification
    slowMo: 1000 // Slow down for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: './test-videos/' }
  });
  
  const page = await context.newPage();
  
  // Enhanced error tracking
  const errors = [];
  const interactions = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push({
        type: 'console',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    }
  });
  
  page.on('pageerror', error => {
    errors.push({
      type: 'page',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  });

  async function logInteraction(action, element, result = 'success') {
    interactions.push({
      action,
      element,
      result,
      timestamp: new Date().toISOString(),
      url: page.url()
    });
    console.log(`✅ ${action}: ${element} - ${result}`);
  }

  async function testPage(url, pageName, testActions) {
    console.log(`\n🔍 Testing ${pageName} - ${url}`);
    
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      
      // Take initial screenshot
      await page.screenshot({ 
        path: `./screenshots/${pageName}-initial.png`,
        fullPage: true 
      });
      
      // Run specific test actions for this page
      await testActions();
      
      // Take final screenshot
      await page.screenshot({ 
        path: `./screenshots/${pageName}-final.png`,
        fullPage: true 
      });
      
    } catch (error) {
      errors.push({
        type: 'navigation',
        message: `Failed to test ${pageName}: ${error.message}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  try {
    // Test 1: Login Page Interactions
    await testPage('http://localhost:3000/login', 'login', async () => {
      // Test email input
      const emailInput = await page.locator('input[type="email"], input[name="email"], #email');
      if (await emailInput.count() > 0) {
        await emailInput.fill('test@example.com');
        await logInteraction('Fill email input', 'email field');
      }
      
      // Test password input
      const passwordInput = await page.locator('input[type="password"], input[name="password"], #password');
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('testpassword123');
        await logInteraction('Fill password input', 'password field');
      }
      
      // Test login button (don't actually submit)
      const loginBtn = await page.locator('button:has-text("Login"), button:has-text("Sign In"), input[type="submit"]');
      if (await loginBtn.count() > 0) {
        await loginBtn.hover();
        await logInteraction('Hover login button', 'login button');
      }
      
      // Test any toggle switches or checkboxes
      const toggles = await page.locator('input[type="checkbox"], .toggle, .switch');
      if (await toggles.count() > 0) {
        await toggles.first().click();
        await logInteraction('Click toggle/checkbox', 'first toggle');
      }
    });

    // Test 2: Dashboard Interactions
    await testPage('http://localhost:3000/dashboard', 'dashboard', async () => {
      // Test navigation menu items
      const navItems = await page.locator('nav a, .nav-item, .menu-item');
      if (await navItems.count() > 0) {
        for (let i = 0; i < Math.min(3, await navItems.count()); i++) {
          const item = navItems.nth(i);
          await item.hover();
          await logInteraction(`Hover nav item ${i+1}`, await item.textContent() || 'nav item');
        }
      }
      
      // Test any cards or buttons
      const buttons = await page.locator('button:not([disabled])');
      if (await buttons.count() > 0) {
        for (let i = 0; i < Math.min(3, await buttons.count()); i++) {
          const btn = buttons.nth(i);
          const text = await btn.textContent() || `button-${i+1}`;
          await btn.hover();
          await logInteraction(`Hover button ${i+1}`, text);
        }
      }
      
      // Test tabs if present
      const tabs = await page.locator('[role="tab"], .tab, .tab-item');
      if (await tabs.count() > 0) {
        await tabs.first().click();
        await page.waitForTimeout(1000);
        await logInteraction('Click tab', 'first tab');
      }
    });

    // Test 3: Strategy Page Interactions
    await testPage('http://localhost:3000/strategy', 'strategy', async () => {
      // Test form inputs
      const textInputs = await page.locator('input[type="text"], textarea');
      if (await textInputs.count() > 0) {
        for (let i = 0; i < Math.min(2, await textInputs.count()); i++) {
          const input = textInputs.nth(i);
          await input.fill(`Test input ${i+1}`);
          await logInteraction(`Fill input ${i+1}`, 'text input');
        }
      }
      
      // Test dropdowns/selects
      const selects = await page.locator('select, .dropdown, .select');
      if (await selects.count() > 0) {
        const select = selects.first();
        await select.click();
        await page.waitForTimeout(500);
        await logInteraction('Click dropdown', 'first dropdown');
      }
      
      // Test any strategy-specific buttons
      const strategyBtns = await page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Save")');
      if (await strategyBtns.count() > 0) {
        await strategyBtns.first().hover();
        await logInteraction('Hover strategy button', await strategyBtns.first().textContent());
      }
    });

    // Test 4: Generate Page Interactions
    await testPage('http://localhost:3000/generate', 'generate', async () => {
      // Test file upload areas
      const fileInputs = await page.locator('input[type="file"]');
      if (await fileInputs.count() > 0) {
        await logInteraction('Found file input', 'file upload field');
      }
      
      // Test drag and drop areas
      const dropZones = await page.locator('.dropzone, .file-upload, .drag-drop');
      if (await dropZones.count() > 0) {
        await dropZones.first().hover();
        await logInteraction('Hover drop zone', 'file drop area');
      }
      
      // Test generate buttons
      const generateBtns = await page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Process")');
      if (await generateBtns.count() > 0) {
        await generateBtns.first().hover();
        await logInteraction('Hover generate button', await generateBtns.first().textContent());
      }
      
      // Test any modals or popups by looking for trigger buttons
      const modalTriggers = await page.locator('button:has-text("Upload"), button:has-text("Browse"), .modal-trigger');
      if (await modalTriggers.count() > 0) {
        const trigger = modalTriggers.first();
        await trigger.click();
        await page.waitForTimeout(1000);
        
        // Check if modal opened
        const modal = await page.locator('.modal, .dialog, .popup');
        if (await modal.count() > 0) {
          await logInteraction('Open modal', 'modal dialog');
          
          // Try to close modal
          const closeBtn = await page.locator('.modal .close, .modal [aria-label="Close"], button:has-text("Cancel")');
          if (await closeBtn.count() > 0) {
            await closeBtn.click();
            await logInteraction('Close modal', 'close button');
          }
        }
      }
    });

    // Test 5: Brand Guidelines Upload Flow (if accessible)
    try {
      await testPage('http://localhost:3000/brand-guidelines', 'brand-guidelines', async () => {
        // Test file upload for brand guidelines
        const fileInput = await page.locator('input[type="file"]');
        if (await fileInput.count() > 0) {
          // Create a test file
          const testFilePath = path.join(process.cwd(), 'test-brand-guide.txt');
          fs.writeFileSync(testFilePath, 'Test brand guidelines content');
          
          await fileInput.setInputFiles(testFilePath);
          await logInteraction('Upload test file', 'brand guidelines upload');
          
          // Clean up
          fs.unlinkSync(testFilePath);
        }
        
        // Test any brand guideline form fields
        const brandInputs = await page.locator('input[name*="brand"], input[name*="color"], input[name*="logo"]');
        if (await brandInputs.count() > 0) {
          await brandInputs.first().fill('Test Brand Value');
          await logInteraction('Fill brand input', 'brand field');
        }
      });
    } catch (err) {
      console.log('Brand guidelines page not accessible, skipping...');
    }

  } catch (error) {
    errors.push({
      type: 'test',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  await browser.close();

  // Generate comprehensive report
  const report = {
    testType: 'Interactive UX Test',
    timestamp: new Date().toISOString(),
    summary: {
      totalInteractions: interactions.length,
      successfulInteractions: interactions.filter(i => i.result === 'success').length,
      totalErrors: errors.length,
      pagesTestedCount: 5
    },
    interactions,
    errors,
    recommendations: []
  };

  // Add recommendations based on findings
  if (errors.length === 0) {
    report.recommendations.push('✅ Excellent: No errors found during interactive testing');
  } else {
    report.recommendations.push(`⚠️ Found ${errors.length} errors that need attention`);
  }

  if (interactions.length > 10) {
    report.recommendations.push('✅ Good: Rich interactive elements found and tested');
  } else {
    report.recommendations.push('ℹ️ Limited interactive elements detected - consider UX enhancement');
  }

  // Save results
  fs.writeFileSync('./INTERACTIVE_UX_REPORT.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎉 INTERACTIVE UX TEST COMPLETE');
  console.log(`📊 Results: ${interactions.length} interactions, ${errors.length} errors`);
  console.log('📄 Full report saved to INTERACTIVE_UX_REPORT.json');
  
  return report;
}

// Create directories
if (!fs.existsSync('./screenshots')) fs.mkdirSync('./screenshots');
if (!fs.existsSync('./test-videos')) fs.mkdirSync('./test-videos');

runInteractiveUXTest().catch(console.error);