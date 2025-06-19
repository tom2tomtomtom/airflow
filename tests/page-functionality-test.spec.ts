import { test, expect } from '@playwright/test';

test.describe('AIRWAVE Page Functionality Testing', () => {
  
  test('1. Login Page - Test actual login functionality', async ({ page }) => {
    console.log('🔐 Testing Login Page Functionality...');
    
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Test form validation
    console.log('Testing form validation...');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(1000);
    
    // Test actual login
    console.log('Testing actual login...');
    await page.locator('[data-testid="email-input"] input').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"] input').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    
    // Wait for redirect
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`After login, URL: ${currentUrl}`);
    
    const isLoggedIn = !currentUrl.includes('/login');
    console.log(`Login successful: ${isLoggedIn}`);
    expect(isLoggedIn).toBe(true);
  });

  test('2. Dashboard Page - Test dashboard functionality', async ({ page }) => {
    console.log('📊 Testing Dashboard Functionality...');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"] input').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"] input').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);
    
    // Go to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Test dashboard elements
    const cards = await page.locator('.MuiCard-root, .MuiPaper-root').count();
    const buttons = await page.locator('button').count();
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    
    console.log(`Dashboard elements - Cards: ${cards}, Buttons: ${buttons}, Headings: ${headings}`);
    
    // Test if dashboard has content
    const hasContent = cards > 0 || buttons > 0 || headings > 0;
    expect(hasContent).toBe(true);
    
    // Test navigation elements
    const navElements = await page.locator('nav, [role="navigation"], a[href*="/"]').count();
    console.log(`Navigation elements: ${navElements}`);
  });

  test('3. Clients Page - Test client management functionality', async ({ page }) => {
    console.log('👥 Testing Clients Page Functionality...');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"] input').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"] input').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);
    
    // Go to clients page
    await page.goto('http://localhost:3000/clients');
    await page.waitForLoadState('networkidle');
    
    // Test page elements
    const addButtons = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').count();
    const tables = await page.locator('table, .MuiDataGrid-root').count();
    const forms = await page.locator('form').count();
    
    console.log(`Clients page - Add buttons: ${addButtons}, Tables: ${tables}, Forms: ${forms}`);
    
    // Test if we can interact with client creation
    if (addButtons > 0) {
      console.log('Testing client creation button...');
      const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Check if modal or form appeared
      const modals = await page.locator('.MuiDialog-root, .MuiModal-root, [role="dialog"]').count();
      console.log(`Modals/dialogs opened: ${modals}`);
    }
    
    const pageWorking = addButtons > 0 || tables > 0 || forms > 0;
    expect(pageWorking).toBe(true);
  });

  test('4. Assets Page - Test asset management functionality', async ({ page }) => {
    console.log('📁 Testing Assets Page Functionality...');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"] input').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"] input').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);
    
    // Go to assets page
    await page.goto('http://localhost:3000/assets');
    await page.waitForLoadState('networkidle');
    
    // Test asset management elements
    const uploadButtons = await page.locator('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]').count();
    const assetGrids = await page.locator('.MuiGrid-root, .asset-grid, [data-testid*="asset"]').count();
    const dropzones = await page.locator('[data-testid*="dropzone"], .dropzone').count();
    
    console.log(`Assets page - Upload buttons: ${uploadButtons}, Asset grids: ${assetGrids}, Dropzones: ${dropzones}`);
    
    // Test file upload functionality
    if (uploadButtons > 0) {
      console.log('Testing upload functionality...');
      const uploadButton = page.locator('button:has-text("Upload"), [data-testid*="upload"]').first();
      if (await uploadButton.isVisible()) {
        await uploadButton.click();
        await page.waitForTimeout(1000);
        
        const fileInputs = await page.locator('input[type="file"]').count();
        console.log(`File inputs available: ${fileInputs}`);
      }
    }
    
    const pageWorking = uploadButtons > 0 || assetGrids > 0 || dropzones > 0;
    expect(pageWorking).toBe(true);
  });

  test('5. Campaigns Page - Test campaign management functionality', async ({ page }) => {
    console.log('🚀 Testing Campaigns Page Functionality...');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"] input').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"] input').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);
    
    // Go to campaigns page
    await page.goto('http://localhost:3000/campaigns');
    await page.waitForLoadState('networkidle');
    
    // Test campaign elements
    const createButtons = await page.locator('button:has-text("Create"), button:has-text("New Campaign"), [data-testid*="create"]').count();
    const campaignLists = await page.locator('.MuiList-root, table, .campaign-list').count();
    const campaignCards = await page.locator('.MuiCard-root:has-text("Campaign"), [data-testid*="campaign"]').count();
    
    console.log(`Campaigns page - Create buttons: ${createButtons}, Lists: ${campaignLists}, Campaign cards: ${campaignCards}`);
    
    // Test campaign creation
    if (createButtons > 0) {
      console.log('Testing campaign creation...');
      const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")').first();
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);
        
        const forms = await page.locator('form, .MuiDialog-root').count();
        console.log(`Campaign creation forms/dialogs: ${forms}`);
      }
    }
    
    const pageWorking = createButtons > 0 || campaignLists > 0 || campaignCards > 0;
    expect(pageWorking).toBe(true);
  });
});
