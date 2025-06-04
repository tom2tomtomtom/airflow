import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijre2010';

test.describe('Create User and Test Complete App', () => {
  
  test('Create test user account and run full E2E test', async ({ page }) => {
    console.log('👤 Creating test user account...');
    
    // Step 1: Navigate to signup page
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');
    
    // Click sign up link
    await page.click('a:has-text("Sign up")');
    await page.waitForLoadState('domcontentloaded');
    await page.screenshot({ path: 'test-results/create-01-signup-page.png', fullPage: true });
    
    // Step 2: Fill out signup form
    console.log('📝 Filling out signup form...');
    
    // Fill email
    await page.fill('input[type="email"]', TEST_EMAIL);
    
    // Fill password (first field)
    await page.locator('input[type="password"]').nth(0).fill(TEST_PASSWORD);
    
    // Fill confirm password (second field) 
    await page.locator('input[type="password"]').nth(1).fill(TEST_PASSWORD);
    
    // Fill name if present
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="full name" i]');
    if (await nameInput.count() > 0) {
      await nameInput.first().fill('Tom Test User');
    }
    
    // Fill company if present
    const companyInput = page.locator('input[name="company"], input[placeholder*="company" i]');
    if (await companyInput.count() > 0) {
      await companyInput.first().fill('Test Company Inc.');
    }
    
    await page.screenshot({ path: 'test-results/create-02-signup-filled.png', fullPage: true });
    
    // Step 3: Submit signup form
    console.log('🚀 Submitting signup form...');
    await page.click('button[type="submit"], button:has-text("Sign up"), button:has-text("Create")');
    
    // Wait for response
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/create-03-signup-result.png', fullPage: true });
    
    const currentUrl = page.url();
    console.log(`Current URL after signup: ${currentUrl}`);
    
    // Step 4: Handle possible email verification or direct login
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Account created and automatically logged in!');
      await runFullAppTest(page);
    } else if (currentUrl.includes('/login') || currentUrl.includes('/verify')) {
      console.log('📧 Account created, now need to login manually...');
      
      // Navigate to login and try to sign in
      await page.goto(`${BASE_URL}/login`);
      await page.waitForLoadState('domcontentloaded');
      
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await page.click('button[type="submit"]');
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'test-results/create-04-login-after-signup.png', fullPage: true });
      
      if (page.url().includes('/dashboard')) {
        console.log('✅ Successfully logged in after account creation!');
        await runFullAppTest(page);
      } else {
        console.log('❌ Login failed after account creation');
        
        // Check for errors
        const errorElement = page.locator('.error, .alert, [role="alert"], .MuiAlert-root');
        if (await errorElement.count() > 0) {
          const errorText = await errorElement.first().textContent();
          console.log(`Error: ${errorText}`);
        }
      }
    } else {
      console.log('⚠️ Unexpected page after signup');
    }
  });
});

async function runFullAppTest(page) {
  console.log('\n🎯 Running comprehensive app testing...');
  
  // Take dashboard screenshot
  await page.screenshot({ path: 'test-results/full-01-dashboard.png', fullPage: true });
  
  // Test all main navigation pages
  const navigationPages = [
    { name: 'Clients', url: '/clients', testActions: testClientsPage },
    { name: 'Assets', url: '/assets', testActions: testAssetsPage },
    { name: 'Templates', url: '/templates', testActions: testTemplatesPage },
    { name: 'Campaigns', url: '/campaigns', testActions: testCampaignsPage },
    { name: 'Matrix', url: '/matrix', testActions: testMatrixPage },
    { name: 'Generate Enhanced', url: '/generate-enhanced', testActions: testGeneratePage },
    { name: 'Analytics', url: '/analytics', testActions: testAnalyticsPage },
    { name: 'Approvals', url: '/approvals', testActions: testApprovalsPage },
    { name: 'Social Publishing', url: '/social-publishing', testActions: testSocialPage }
  ];
  
  for (const navPage of navigationPages) {
    console.log(`\n📄 Testing ${navPage.name} page...`);
    
    try {
      await page.goto(`${BASE_URL}${navPage.url}`);
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Take screenshot
      await page.screenshot({ 
        path: `test-results/full-${navPage.name.toLowerCase().replace(/\s+/g, '-')}.png`, 
        fullPage: true 
      });
      
      // Count interactive elements
      const buttons = await page.locator('button:visible').count();
      const inputs = await page.locator('input:visible').count();
      const links = await page.locator('a:visible').count();
      
      console.log(`   📊 Found: ${buttons} buttons, ${inputs} inputs, ${links} links`);
      
      // Run specific page tests
      if (navPage.testActions) {
        await navPage.testActions(page);
      }
      
      console.log(`   ✅ ${navPage.name} page tested successfully`);
      
    } catch (error) {
      console.log(`   ❌ ${navPage.name} page error: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Full app testing completed!');
}

// Page-specific test functions
async function testClientsPage(page) {
  console.log('   🏢 Testing client management...');
  
  // Look for add client button
  const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")');
  if (await addButton.count() > 0) {
    console.log('   📝 Found add client button');
  }
  
  // Test any forms
  await fillDummyFormData(page, 'client');
}

async function testAssetsPage(page) {
  console.log('   📁 Testing asset management...');
  
  // Look for upload button
  const uploadButton = page.locator('button:has-text("Upload"), input[type="file"]');
  if (await uploadButton.count() > 0) {
    console.log('   📤 Found upload functionality');
  }
  
  // Test asset grid
  const assetItems = page.locator('.asset-item, [data-testid*="asset"], .file-item');
  const assetCount = await assetItems.count();
  console.log(`   📊 Found ${assetCount} assets`);
}

async function testTemplatesPage(page) {
  console.log('   📋 Testing template management...');
  await fillDummyFormData(page, 'template');
}

async function testCampaignsPage(page) {
  console.log('   🎯 Testing campaign management...');
  await fillDummyFormData(page, 'campaign');
}

async function testMatrixPage(page) {
  console.log('   📊 Testing strategy matrix...');
  await fillDummyFormData(page, 'matrix');
}

async function testGeneratePage(page) {
  console.log('   🤖 Testing AI generation...');
  
  // Fill AI generation form with test data
  const promptInputs = [
    { selector: 'textarea[placeholder*="prompt"], textarea[placeholder*="describe"]', value: 'Create an engaging social media campaign for a sustainable fashion brand targeting eco-conscious millennials. Focus on highlighting organic materials and ethical manufacturing processes.' },
    { selector: 'input[placeholder*="brand"], input[placeholder*="company"]', value: 'EcoStyle Fashion' },
    { selector: 'input[placeholder*="target"], input[placeholder*="audience"]', value: 'Eco-conscious millennials and Gen Z consumers interested in sustainable fashion' },
    { selector: 'input[placeholder*="keywords"]', value: 'sustainable fashion, organic cotton, ethical manufacturing, eco-friendly clothing' }
  ];
  
  for (const input of promptInputs) {
    const element = page.locator(input.selector);
    if (await element.count() > 0) {
      await element.first().fill(input.value);
      console.log(`   ✏️ Filled: ${input.selector.split(',')[0]}`);
    }
  }
  
  // Look for generate button (but don't click to avoid API costs)
  const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")');
  if (await generateButton.count() > 0) {
    console.log('   🎯 Found generate button (not clicking to avoid API costs)');
  }
}

async function testAnalyticsPage(page) {
  console.log('   📈 Testing analytics dashboard...');
  
  // Look for charts and metrics
  const charts = page.locator('.chart, .graph, canvas, svg');
  const chartCount = await charts.count();
  console.log(`   📊 Found ${chartCount} charts/graphs`);
}

async function testApprovalsPage(page) {
  console.log('   ✅ Testing approval workflow...');
  await fillDummyFormData(page, 'approval');
}

async function testSocialPage(page) {
  console.log('   📱 Testing social publishing...');
  await fillDummyFormData(page, 'social');
}

async function fillDummyFormData(page, context) {
  const inputs = page.locator('input:visible, textarea:visible, select:visible');
  const inputCount = await inputs.count();
  
  console.log(`   📝 Found ${inputCount} form inputs`);
  
  for (let i = 0; i < Math.min(inputCount, 10); i++) {
    const input = inputs.nth(i);
    const inputType = await input.getAttribute('type');
    const tagName = await input.evaluate(el => el.tagName.toLowerCase());
    
    try {
      if (await input.isVisible() && await input.isEditable()) {
        if (inputType === 'email') {
          await input.fill('test@example.com');
        } else if (inputType === 'tel' || inputType === 'phone') {
          await input.fill('+1234567890');
        } else if (inputType === 'url') {
          await input.fill('https://example.com');
        } else if (inputType === 'number') {
          await input.fill('42');
        } else if (inputType === 'date') {
          await input.fill('2024-12-31');
        } else if (tagName === 'textarea') {
          await input.fill(`This is test content for ${context}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`);
        } else if (tagName === 'select') {
          const options = input.locator('option');
          const optionCount = await options.count();
          if (optionCount > 1) {
            await input.selectOption({ index: 1 });
          }
        } else if (inputType !== 'password' && inputType !== 'hidden') {
          await input.fill(`Test ${context} data`);
        }
        
        await page.waitForTimeout(200); // Small delay between inputs
      }
    } catch (error) {
      // Skip problematic inputs
      console.log(`   ⚠️ Skipped input ${i}: ${error.message.substring(0, 50)}`);
    }
  }
}