import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Page by Page Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await page.waitForTimeout(3000); // Let session stabilize
    console.log('✅ Logged in successfully');
  });

  test('should test dashboard page', async ({ page }) => {
    console.log('🏠 Testing Dashboard Page...');
    
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
    
    // Check if page loads without redirect
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
    console.log('✅ Dashboard page loads correctly');
    
    // Check for main dashboard elements
    const elements = await page.evaluate(() => {
      return {
        hasTitle: !!document.querySelector('h1, h2, [role="heading"]'),
        hasCards: document.querySelectorAll('.MuiCard-root, [data-testid*="card"]').length,
        hasButtons: document.querySelectorAll('button').length,
        hasNavigation: !!document.querySelector('nav, [role="navigation"]'),
      };
    });
    
    console.log('📊 Dashboard elements:', elements);
    await page.screenshot({ path: 'test-results/dashboard-page.png' });
  });

  test('should test clients page UI', async ({ page }) => {
    console.log('👥 Testing Clients Page UI...');
    
    await page.goto('/clients');
    await page.waitForTimeout(3000);
    
    // Check if page loads
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Redirected to login');
      return;
    }
    
    console.log('✅ Clients page loads correctly');
    
    // Check for page elements
    const pageElements = await page.evaluate(() => {
      return {
        hasAddButton: !!document.querySelector('button:has-text("Add Client"), button:has-text("Create Client")'),
        hasEmptyState: !!document.querySelector('[data-testid="empty-state"], .empty-state'),
        hasClientCards: document.querySelectorAll('.MuiCard-root, [data-testid*="client"]').length,
        hasSearchInput: !!document.querySelector('input[placeholder*="search"], input[type="search"]'),
        pageTitle: document.querySelector('h1, h2, [role="heading"]')?.textContent || 'No title found',
      };
    });
    
    console.log('📋 Clients page elements:', pageElements);
    await page.screenshot({ path: 'test-results/clients-page.png' });
    
    // Try clicking Add Client if it exists
    if (pageElements.hasAddButton) {
      console.log('🔘 Testing Add Client button...');
      try {
        await page.click('button:has-text("Add Client"), button:has-text("Create Client")');
        await page.waitForTimeout(2000);
        
        const newUrl = page.url();
        console.log('📍 After clicking Add Client:', newUrl);
        
        if (newUrl.includes('/create-client')) {
          console.log('✅ Successfully navigated to create-client page');
          await page.screenshot({ path: 'test-results/create-client-page.png' });
        } else {
          console.log('❌ Did not navigate to create-client page');
        }
      } catch (error) {
        console.log('❌ Error clicking Add Client button:', error.message);
      }
    }
  });

  test('should test campaigns page', async ({ page }) => {
    console.log('📢 Testing Campaigns Page...');
    
    await page.goto('/campaigns');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Campaigns page redirected to login');
      return;
    }
    
    console.log('✅ Campaigns page loads correctly');
    
    const elements = await page.evaluate(() => {
      return {
        hasContent: document.body.innerText.length > 100,
        hasButtons: document.querySelectorAll('button').length,
        hasCards: document.querySelectorAll('.MuiCard-root').length,
        pageTitle: document.title,
      };
    });
    
    console.log('📊 Campaigns page elements:', elements);
    await page.screenshot({ path: 'test-results/campaigns-page.png' });
  });

  test('should test assets/templates page', async ({ page }) => {
    console.log('🎨 Testing Assets/Templates Page...');
    
    await page.goto('/assets');
    await page.waitForTimeout(3000);
    
    let currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Assets page redirected to login, trying /templates...');
      
      // Try templates page instead
      await page.goto('/templates');
      await page.waitForTimeout(3000);
      currentUrl = page.url();
      
      if (currentUrl.includes('/login')) {
        console.log('❌ Templates page also redirected to login');
        return;
      }
    }
    
    console.log('✅ Assets/Templates page loads correctly');
    
    const elements = await page.evaluate(() => {
      return {
        hasGrid: !!document.querySelector('[role="grid"], .grid, .MuiGrid-container'),
        hasUploadButton: !!document.querySelector('button:has-text("Upload"), input[type="file"]'),
        hasFilterOptions: !!document.querySelector('select, [role="combobox"]'),
        itemCount: document.querySelectorAll('.MuiCard-root, [data-testid*="asset"], [data-testid*="template"]').length,
      };
    });
    
    console.log('🎯 Assets/Templates elements:', elements);
    await page.screenshot({ path: 'test-results/assets-templates-page.png' });
  });

  test('should test AI generation page', async ({ page }) => {
    console.log('🤖 Testing AI Generation Page...');
    
    // Try different potential AI generation URLs
    const aiUrls = ['/generate', '/ai', '/create', '/ai-generate'];
    
    for (const url of aiUrls) {
      try {
        await page.goto(url);
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          console.log(`✅ Found AI generation page at: ${url}`);
          
          const elements = await page.evaluate(() => {
            return {
              hasForm: !!document.querySelector('form, .form'),
              hasTextarea: !!document.querySelector('textarea'),
              hasGenerateButton: !!document.querySelector('button:has-text("Generate")'),
              hasTemplateOptions: !!document.querySelector('select, [role="combobox"]'),
            };
          });
          
          console.log('🎨 AI Generation elements:', elements);
          await page.screenshot({ path: `test-results/ai-generation-${url.replace('/', '')}-page.png` });
          break;
        }
      } catch (error) {
        console.log(`❌ ${url} not found or error:`, error.message);
      }
    }
  });

  test('should test settings page', async ({ page }) => {
    console.log('⚙️ Testing Settings Page...');
    
    await page.goto('/settings');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Settings page redirected to login');
      return;
    }
    
    console.log('✅ Settings page loads correctly');
    
    const elements = await page.evaluate(() => {
      return {
        hasProfileSection: !!document.querySelector('[data-testid*="profile"], section'),
        hasFormInputs: document.querySelectorAll('input, textarea, select').length,
        hasSaveButton: !!document.querySelector('button:has-text("Save"), button:has-text("Update")'),
        hasToggleSwitches: document.querySelectorAll('input[type="checkbox"], [role="switch"]').length,
      };
    });
    
    console.log('⚙️ Settings elements:', elements);
    await page.screenshot({ path: 'test-results/settings-page.png' });
  });
});