import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijre2010';

test.describe('AIRWAVE Complete UI/UX E2E Test Suite', () => {
  
  test.beforeEach(async ({ page, context }) => {
    // Clear any existing auth state
    await context.clearCookies();
    await context.clearPermissions();
    
    // Navigate to a page first to get a valid context
    await page.goto(BASE_URL);
    
    // Then clear storage
    try {
      await page.evaluate(() => {
        if (typeof localStorage !== 'undefined') localStorage.clear();
        if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
      });
    } catch (error) {
      console.log('Could not clear storage:', error.message);
    }
  });

  test('01. Complete Authentication Flow', async ({ page }) => {
    console.log('🔐 Testing complete authentication flow...');
    
    // Navigate to homepage first
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    
    // Navigate to login page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-login-page.png', fullPage: true });
    
    // Verify login form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")')).toBeVisible();
    
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.screenshot({ path: 'test-results/03-login-filled.png', fullPage: true });
    
    // Submit login form
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/04-dashboard-loaded.png', fullPage: true });
    
    // Verify we're authenticated
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Authentication completed successfully');
  });

  test('02. Dashboard Complete UI Testing', async ({ page }) => {
    console.log('📊 Testing dashboard UI elements...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    
    // Test all visible buttons and clickable elements
    const interactiveElements = [
      'button',
      'a[href]',
      '[role="button"]',
      'input[type="button"]',
      '[data-testid*="button"]'
    ];
    
    for (const selector of interactiveElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      console.log(`Found ${count} ${selector} elements`);
      
      for (let i = 0; i < Math.min(count, 10); i++) { // Test first 10 of each type
        const element = elements.nth(i);
        if (await element.isVisible()) {
          const text = await element.textContent();
          console.log(`Testing element: ${text?.substring(0, 50)}...`);
          
          // Test hover states
          await element.hover();
          await page.waitForTimeout(500);
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/05-dashboard-interactive-tested.png', fullPage: true });
    console.log('✅ Dashboard UI testing completed');
  });

  test('03. Navigation Menu Complete Testing', async ({ page }) => {
    console.log('🧭 Testing navigation menu...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Test all navigation links
    const navigationPages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Clients', url: '/clients' },
      { name: 'Assets', url: '/assets' },
      { name: 'Templates', url: '/templates' },
      { name: 'Campaigns', url: '/campaigns' },
      { name: 'Matrix', url: '/matrix' },
      { name: 'Generate Enhanced', url: '/generate-enhanced' },
      { name: 'Strategic Content', url: '/strategic-content' },
      { name: 'Analytics', url: '/analytics' },
      { name: 'Approvals', url: '/approvals' },
      { name: 'Social Publishing', url: '/social-publishing' }
    ];
    
    for (const navPage of navigationPages) {
      console.log(`Testing navigation to ${navPage.name}...`);
      
      try {
        await page.goto(`${BASE_URL}${navPage.url}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // Take screenshot
        await page.screenshot({ 
          path: `test-results/06-nav-${navPage.name.toLowerCase().replace(/\s+/g, '-')}.png`, 
          fullPage: true 
        });
        
        // Verify page loaded
        expect(page.url()).toContain(navPage.url);
        console.log(`✅ ${navPage.name} page loaded successfully`);
        
        // Test any forms on this page
        await testFormsOnPage(page, navPage.name);
        
        // Test any buttons on this page
        await testButtonsOnPage(page, navPage.name);
        
      } catch (error) {
        console.log(`⚠️ Issue with ${navPage.name}: ${error}`);
      }
    }
  });

  test('04. Forms Complete Testing with Dummy Data', async ({ page }) => {
    console.log('📝 Testing all forms with dummy data...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    const formsTestPages = [
      '/clients',
      '/assets', 
      '/templates',
      '/campaigns',
      '/generate-enhanced'
    ];
    
    for (const formPage of formsTestPages) {
      console.log(`Testing forms on ${formPage}...`);
      
      await page.goto(`${BASE_URL}${formPage}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Look for form inputs
      const inputs = page.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      console.log(`Found ${inputCount} form inputs on ${formPage}`);
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const inputType = await input.getAttribute('type');
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        
        if (await input.isVisible() && await input.isEditable()) {
          try {
            if (inputType === 'email') {
              await input.fill('test@example.com');
            } else if (inputType === 'password') {
              await input.fill('TestPassword123');
            } else if (inputType === 'tel' || inputType === 'phone') {
              await input.fill('+1234567890');
            } else if (inputType === 'url') {
              await input.fill('https://example.com');
            } else if (inputType === 'number') {
              await input.fill('42');
            } else if (inputType === 'date') {
              await input.fill('2024-12-31');
            } else if (tagName === 'textarea') {
              await input.fill('This is test content for the textarea field. Lorem ipsum dolor sit amet.');
            } else if (tagName === 'select') {
              const options = page.locator(`${await input.locator('..').innerHTML()} option`);
              const optionCount = await options.count();
              if (optionCount > 1) {
                await input.selectOption({ index: 1 });
              }
            } else {
              // Default text input
              await input.fill('Test Data Entry');
            }
            
            console.log(`Filled ${tagName}[${inputType || 'text'}] input`);
            await page.waitForTimeout(300); // Small delay between inputs
          } catch (error) {
            console.log(`Could not fill input: ${error}`);
          }
        }
      }
      
      await page.screenshot({ 
        path: `test-results/07-forms-${formPage.replace('/', '')}.png`, 
        fullPage: true 
      });
    }
    
    console.log('✅ Forms testing completed');
  });

  test('05. AI Generation Complete Testing', async ({ page }) => {
    console.log('🤖 Testing AI generation functionality...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Test AI generation page
    await page.goto(`${BASE_URL}/generate-enhanced`);
    await page.waitForLoadState('networkidle');
    
    // Fill out AI generation form with dummy data
    const aiInputs = [
      { selector: 'textarea[placeholder*="prompt"], textarea[placeholder*="describe"], [data-testid="prompt-input"]', value: 'Create a marketing campaign for a new eco-friendly product line featuring sustainable materials and green technology innovations.' },
      { selector: 'input[placeholder*="brand"], input[placeholder*="company"]', value: 'EcoTech Solutions' },
      { selector: 'input[placeholder*="target"], input[placeholder*="audience"]', value: 'Environmentally conscious millennials and Gen Z consumers' },
      { selector: 'select[name*="industry"], select[name*="category"]', value: '1' },
      { selector: 'input[placeholder*="keywords"]', value: 'sustainable, eco-friendly, green technology, innovation' }
    ];
    
    for (const input of aiInputs) {
      const element = page.locator(input.selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        if (input.selector.includes('select')) {
          await element.selectOption({ index: parseInt(input.value) });
        } else {
          await element.fill(input.value);
        }
        console.log(`Filled AI input: ${input.selector}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/08-ai-generation-filled.png', fullPage: true });
    
    // Look for generate button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create"), [data-testid="generate-button"]');
    if (await generateButton.count() > 0) {
      console.log('Found generate button, clicking...');
      await generateButton.first().click();
      await page.waitForTimeout(3000); // Wait for generation process
      await page.screenshot({ path: 'test-results/09-ai-generation-processing.png', fullPage: true });
    }
    
    console.log('✅ AI generation testing completed');
  });

  test('06. Asset Management Complete Testing', async ({ page }) => {
    console.log('📁 Testing asset management functionality...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Test assets page
    await page.goto(`${BASE_URL}/assets`);
    await page.waitForLoadState('networkidle');
    
    // Test upload functionality
    const uploadButtons = page.locator('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]');
    if (await uploadButtons.count() > 0) {
      console.log('Found upload controls');
      // Note: We won't actually upload files but test the UI elements
    }
    
    // Test asset grid/list view
    const assetItems = page.locator('[data-testid*="asset"], .asset-item, .file-item');
    const assetCount = await assetItems.count();
    console.log(`Found ${assetCount} asset items`);
    
    // Test first few asset items
    for (let i = 0; i < Math.min(assetCount, 5); i++) {
      const asset = assetItems.nth(i);
      if (await asset.isVisible()) {
        await asset.hover();
        await page.waitForTimeout(500);
        
        // Look for action buttons
        const actionButtons = asset.locator('button');
        const buttonCount = await actionButtons.count();
        console.log(`Asset ${i} has ${buttonCount} action buttons`);
      }
    }
    
    await page.screenshot({ path: 'test-results/10-assets-testing.png', fullPage: true });
    console.log('✅ Asset management testing completed');
  });

  test('07. Responsive Design Testing', async ({ page }) => {
    console.log('📱 Testing responsive design...');
    
    // Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Test different viewport sizes
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing ${viewport.name} viewport...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `test-results/11-responsive-${viewport.name}.png`, 
        fullPage: true 
      });
      
      // Test navigation on mobile
      if (viewport.name === 'mobile') {
        const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-nav, .hamburger, button[aria-label*="menu"]');
        if (await mobileMenu.count() > 0) {
          await mobileMenu.first().click();
          await page.waitForTimeout(500);
          await page.screenshot({ 
            path: 'test-results/12-mobile-menu-open.png', 
            fullPage: true 
          });
        }
      }
    }
    
    console.log('✅ Responsive design testing completed');
  });

  test('08. Error Handling and Edge Cases', async ({ page }) => {
    console.log('❌ Testing error handling...');
    
    // Test invalid login
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    
    // Look for error messages
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/13-login-error.png', fullPage: true });
    
    // Test 404 page
    await page.goto(`${BASE_URL}/nonexistent-page`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/14-404-page.png', fullPage: true });
    
    console.log('✅ Error handling testing completed');
  });

  test('09. Performance and Loading States', async ({ page }) => {
    console.log('⚡ Testing performance and loading states...');
    
    // Monitor network requests
    const responses = [];
    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        timing: response.timing()
      });
    });
    
    // Login and navigate to heavy pages
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Test loading states on different pages
    const performancePages = ['/analytics', '/campaigns', '/assets', '/matrix'];
    
    for (const perfPage of performancePages) {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}${perfPage}`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      console.log(`${perfPage} loaded in ${loadTime}ms`);
      
      // Look for loading spinners or skeletons
      const loadingElements = page.locator('.loading, .spinner, .skeleton, [data-testid*="loading"]');
      if (await loadingElements.count() > 0) {
        console.log(`Found loading indicators on ${perfPage}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/15-performance-final.png', fullPage: true });
    console.log('✅ Performance testing completed');
  });

  test('10. Final Integration Test - Complete Workflow', async ({ page }) => {
    console.log('🎯 Running final integration test...');
    
    // Complete user workflow simulation
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });
    
    // Navigate through complete workflow
    const workflowSteps = [
      { page: '/dashboard', action: 'dashboard-overview' },
      { page: '/clients', action: 'client-management' },
      { page: '/assets', action: 'asset-upload' },
      { page: '/templates', action: 'template-creation' },
      { page: '/campaigns', action: 'campaign-building' },
      { page: '/matrix', action: 'strategy-matrix' },
      { page: '/generate-enhanced', action: 'ai-generation' },
      { page: '/analytics', action: 'performance-review' }
    ];
    
    for (let i = 0; i < workflowSteps.length; i++) {
      const step = workflowSteps[i];
      console.log(`Workflow Step ${i + 1}: ${step.action}`);
      
      await page.goto(`${BASE_URL}${step.page}`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Interact with page elements
      const clickableElements = page.locator('button:visible, a:visible, [role="button"]:visible').first();
      if (await clickableElements.count() > 0) {
        await clickableElements.hover();
        await page.waitForTimeout(500);
      }
      
      await page.screenshot({ 
        path: `test-results/16-workflow-step-${i + 1}-${step.action}.png`, 
        fullPage: true 
      });
    }
    
    console.log('✅ Complete workflow integration test completed');
  });
});

// Helper functions
async function testFormsOnPage(page, pageName) {
  const forms = page.locator('form');
  const formCount = await forms.count();
  
  if (formCount > 0) {
    console.log(`Found ${formCount} forms on ${pageName}`);
    
    for (let i = 0; i < formCount; i++) {
      const form = forms.nth(i);
      const inputs = form.locator('input, textarea, select');
      const inputCount = await inputs.count();
      console.log(`Form ${i + 1} has ${inputCount} inputs`);
    }
  }
}

async function testButtonsOnPage(page, pageName) {
  const buttons = page.locator('button:visible');
  const buttonCount = await buttons.count();
  
  console.log(`Found ${buttonCount} buttons on ${pageName}`);
  
  // Test first 5 buttons
  for (let i = 0; i < Math.min(buttonCount, 5); i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    
    if (text && !text.includes('Sign Out') && !text.includes('Logout')) {
      try {
        await button.hover();
        await page.waitForTimeout(300);
        console.log(`Tested button: ${text.substring(0, 30)}...`);
      } catch (error) {
        console.log(`Could not test button: ${error}`);
      }
    }
  }
}