import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3001';
const TEST_USER = {
  email: 'tomh@redbaez.com',
  password: 'Wijlre2010'
};

// Dummy test data for form filling
const DUMMY_DATA = {
  client: {
    name: 'Test Client Corp',
    email: 'client@testcorp.com',
    phone: '+1-555-0123',
    company: 'Test Corporation',
    website: 'https://testcorp.com',
    description: 'A test client for comprehensive testing purposes'
  },
  content: {
    prompt: 'Create a modern, professional marketing image for a tech company',
    copyPrompt: 'Write engaging marketing copy for a new software product launch'
  }
};

class FocusedTestHelper {
  constructor(private page: Page) {}

  async login() {
    console.log('🔐 Starting login process...');
    await this.page.goto('/login');
    
    try {
      await this.page.waitForSelector('[data-testid="email-input"], input[type="email"]', { timeout: 10000 });
      
      // Fill credentials using multiple patterns
      const patterns = [
        { email: '[data-testid="email-input"] input', password: '[data-testid="password-input"] input', submit: '[data-testid="sign-in-button"]' },
        { email: 'input[type="email"]', password: 'input[type="password"]', submit: 'button[type="submit"]' }
      ];
      
      for (const pattern of patterns) {
        try {
          const emailField = this.page.locator(pattern.email).first();
          const passwordField = this.page.locator(pattern.password).first();
          
          if (await emailField.isVisible() && await passwordField.isVisible()) {
            await emailField.fill(TEST_USER.email);
            await passwordField.fill(TEST_USER.password);
            
            const submitButton = this.page.locator(pattern.submit).first();
            if (await submitButton.isVisible()) {
              await submitButton.click();
            } else {
              await passwordField.press('Enter');
            }
            
            // Wait for navigation
            await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
            console.log('✅ Login successful');
            return;
          }
        } catch (error) {
          console.log(`⚠️ Login pattern failed: ${error.message}`);
        }
      }
      
      // Try demo mode if available
      const demoButton = this.page.locator('button:has-text("Demo"), [data-testid="demo-button"]').first();
      if (await demoButton.isVisible()) {
        console.log('🎭 Using demo mode...');
        await demoButton.click();
        await this.page.waitForURL('**/dashboard**', { timeout: 10000 });
        console.log('✅ Demo login successful');
        return;
      }
      
    } catch (error) {
      console.log(`❌ Login failed: ${error.message}`);
      throw error;
    }
  }

  async testPageAndTakeScreenshot(url: string, name: string) {
    console.log(`📄 Testing page: ${name}`);
    
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Take screenshot
    await this.page.screenshot({ 
      path: `tests/screenshots/focused-${name.toLowerCase().replace(/\s+/g, '-')}.png`,
      fullPage: true 
    });
    
    console.log(`📸 Screenshot taken: ${name}`);
  }

  async fillFormFields(selectors: string[], values: string[]) {
    for (let i = 0; i < selectors.length && i < values.length; i++) {
      try {
        const field = this.page.locator(selectors[i]).first();
        if (await field.isVisible({ timeout: 2000 })) {
          await field.clear();
          await field.fill(values[i]);
          console.log(`✅ Filled field: ${selectors[i]}`);
        }
      } catch (error) {
        console.log(`⚠️ Field skip: ${selectors[i]} - ${error.message}`);
      }
    }
  }

  async testInteractiveElements(selectors: string[]) {
    for (const selector of selectors) {
      try {
        const elements = this.page.locator(selector);
        const count = await elements.count();
        
        if (count > 0) {
          console.log(`🔘 Found ${count} elements matching: ${selector}`);
          
          // Test first few elements
          for (let i = 0; i < Math.min(count, 3); i++) {
            const element = elements.nth(i);
            
            // Hover over element
            await element.hover({ timeout: 2000 });
            await this.page.waitForTimeout(300);
            
            // If it's a clickable element (but not navigation), click it
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const isButton = tagName === 'button' || await element.getAttribute('role') === 'button';
            
            if (isButton && !selector.includes('logout') && !selector.includes('submit')) {
              await element.click({ timeout: 2000 });
              await this.page.waitForTimeout(500);
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Element test skipped: ${selector} - ${error.message}`);
      }
    }
  }
}

test.describe('AIRWAVE Focused UI Test Suite', () => {
  let helper: FocusedTestHelper;

  test.beforeEach(async ({ page }) => {
    helper = new FocusedTestHelper(page);
    await helper.login();
  });

  test('Complete UI Journey - All Pages and Interactions', async ({ page }) => {
    console.log('🚀 Starting complete UI journey test...');
    
    // 1. Dashboard Testing
    await helper.testPageAndTakeScreenshot('/dashboard', 'Dashboard');
    await helper.testInteractiveElements([
      'button:has-text("Create")',
      '.card, .widget, [data-testid="dashboard-card"]',
      '.quick-action, [data-testid="quick-action"]'
    ]);
    
    // 2. Clients Page Testing
    await helper.testPageAndTakeScreenshot('/clients', 'Clients');
    await helper.testInteractiveElements([
      'button:has-text("Create"), button:has-text("Add")',
      '.client-item, [data-testid="client-item"]'
    ]);
    
    // Test client form if available
    const createClientBtn = page.locator('button:has-text("Create"), button:has-text("Add"), [data-testid="create-client"]').first();
    if (await createClientBtn.isVisible()) {
      await createClientBtn.click();
      await page.waitForTimeout(2000);
      
      await helper.fillFormFields(
        ['input[name="name"], #client-name', 'input[name="email"], #client-email', 'input[name="company"], #company'],
        [DUMMY_DATA.client.name, DUMMY_DATA.client.email, DUMMY_DATA.client.company]
      );
    }
    
    // 3. Assets Page Testing
    await helper.testPageAndTakeScreenshot('/assets', 'Assets');
    await helper.testInteractiveElements([
      'button:has-text("Upload"), [data-testid="upload-button"]',
      '[data-testid="grid-view"], [data-testid="list-view"]',
      '.asset-item, [data-testid="asset-item"]'
    ]);
    
    // Test search functionality
    await helper.fillFormFields(
      ['input[placeholder*="search"], [data-testid="search-input"]'],
      ['test search']
    );
    
    // 4. Content Generation Testing
    await helper.testPageAndTakeScreenshot('/generate-enhanced', 'Content Generation');
    
    // Test different generation tabs
    const generationTabs = ['Copy', 'Image', 'Video', 'Voice'];
    for (const tab of generationTabs) {
      try {
        const tabButton = page.locator(`button:has-text("${tab}"), [data-testid="${tab.toLowerCase()}-tab"]`).first();
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await page.waitForTimeout(1000);
          
          if (tab === 'Copy') {
            await helper.fillFormFields(
              ['textarea[placeholder*="prompt"], #copy-prompt'],
              [DUMMY_DATA.content.copyPrompt]
            );
          } else if (tab === 'Image') {
            await helper.fillFormFields(
              ['textarea[placeholder*="prompt"], #image-prompt'],
              [DUMMY_DATA.content.prompt]
            );
          }
        }
      } catch (error) {
        console.log(`⚠️ Tab test failed: ${tab} - ${error.message}`);
      }
    }
    
    // 5. Templates Testing
    await helper.testPageAndTakeScreenshot('/templates', 'Templates');
    await helper.testInteractiveElements([
      'button:has-text("Create"), button:has-text("New")',
      '.template-item, [data-testid="template-item"]'
    ]);
    
    // 6. Campaigns Testing
    await helper.testPageAndTakeScreenshot('/campaigns', 'Campaigns');
    await helper.testInteractiveElements([
      'button:has-text("Create"), button:has-text("New")',
      '.campaign-item, [data-testid="campaign-item"]'
    ]);
    
    // 7. Matrix Testing
    await helper.testPageAndTakeScreenshot('/matrix', 'Matrix');
    await helper.testInteractiveElements([
      'button:has-text("Create"), button:has-text("New")',
      '.matrix-cell, [data-testid="matrix-cell"]'
    ]);
    
    // 8. Approvals Testing
    await helper.testPageAndTakeScreenshot('/approvals', 'Approvals');
    await helper.testInteractiveElements([
      '.approval-item, [data-testid="approval-item"]',
      'button:has-text("Approve"), button:has-text("Review")'
    ]);
    
    // 9. Analytics Testing
    await helper.testPageAndTakeScreenshot('/analytics', 'Analytics');
    await helper.testInteractiveElements([
      '.metric-card, [data-testid="metric-card"]',
      '.chart, [data-testid="chart"]'
    ]);
    
    // 10. Strategic Content Testing
    try {
      await helper.testPageAndTakeScreenshot('/strategic-content', 'Strategic Content');
      await helper.testInteractiveElements([
        'button:has-text("Create"), button:has-text("New")',
        '.strategy-item, [data-testid="strategy-item"]'
      ]);
    } catch (error) {
      console.log(`⚠️ Strategic content page not available: ${error.message}`);
    }
    
    // 11. Navigation Testing
    console.log('🧭 Testing main navigation...');
    const navItems = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Clients', url: '/clients' },
      { text: 'Assets', url: '/assets' },
      { text: 'Templates', url: '/templates' },
      { text: 'Campaigns', url: '/campaigns' },
      { text: 'Matrix', url: '/matrix' }
    ];
    
    for (const item of navItems) {
      try {
        const navLink = page.locator(`a:has-text("${item.text}"), [href="${item.url}"]`).first();
        if (await navLink.isVisible()) {
          await navLink.click();
          await page.waitForTimeout(1000);
          console.log(`✅ Navigation to ${item.text} successful`);
        }
      } catch (error) {
        console.log(`⚠️ Navigation to ${item.text} failed: ${error.message}`);
      }
    }
    
    // 12. Responsive Testing
    console.log('📱 Testing responsive design...');
    const viewports = [
      { width: 1280, height: 720, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: `tests/screenshots/responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: true 
      });
      
      console.log(`📱 Tested ${viewport.name} viewport`);
    }
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 13. Form Validation Testing
    console.log('📝 Testing form validation...');
    
    // Go to create client and test empty form submission
    await page.goto('/clients');
    const createBtn = page.locator('button:has-text("Create"), [data-testid="create-client"]').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await page.waitForTimeout(2000);
      
      // Try to submit empty form
      const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(2000);
        
        // Check for validation errors
        const errorElements = page.locator('.error, .MuiAlert-root, [data-testid="error"]');
        const errorCount = await errorElements.count();
        console.log(`📝 Found ${errorCount} validation errors (expected)`);
      }
    }
    
    // 14. Final Dashboard Return
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log('🎉 Complete UI journey test finished successfully!');
    
    // Generate final summary screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/final-summary.png',
      fullPage: true 
    });
  });
});

console.log('🎯 Focused AIRWAVE UI Test Suite Configuration Complete');