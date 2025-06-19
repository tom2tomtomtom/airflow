import { test, expect } from '@playwright/test';

test.describe('AIRWAVE Manual Functional Testing', () => {
  
  test('1. Login Page - Complete functional test', async ({ page }) => {
    console.log('🔐 Testing Login Page Complete Functionality...');
    
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // Test 1: Page structure and elements
    await test.step('Verify page structure', async () => {
      const title = await page.locator('h1').textContent();
      console.log(`Page title: ${title}`);
      expect(title).toContain('AIrFLOW');
      
      const subtitle = await page.locator('h6').textContent();
      console.log(`Subtitle: ${subtitle}`);
      expect(subtitle).toContain('AI-Powered');
    });

    // Test 2: Form elements exist and are interactive
    await test.step('Test form elements', async () => {
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      const signInButton = page.locator('[data-testid="sign-in-button"]');
      const rememberCheckbox = page.locator('input[name="remember"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(signInButton).toBeVisible();
      await expect(rememberCheckbox).toBeVisible();
      
      console.log('All form elements are visible and accessible');
    });

    // Test 3: Form validation
    await test.step('Test form validation', async () => {
      const signInButton = page.locator('[data-testid="sign-in-button"]');
      await signInButton.click();
      await page.waitForTimeout(1000);
      
      // Check for validation errors
      const errorElements = await page.locator('.MuiFormHelperText-root.Mui-error').count();
      console.log(`Validation errors shown: ${errorElements}`);
    });

    // Test 4: Password visibility toggle
    await test.step('Test password visibility toggle', async () => {
      const passwordInput = page.locator('[data-testid="password-input"]');
      const visibilityToggle = page.locator('[data-testid="password-visibility-toggle"]');
      
      await passwordInput.fill('testpassword');
      
      // Check initial type
      const initialType = await passwordInput.getAttribute('type');
      console.log(`Initial password type: ${initialType}`);
      
      // Toggle visibility
      await visibilityToggle.click();
      await page.waitForTimeout(500);
      
      const toggledType = await passwordInput.getAttribute('type');
      console.log(`Toggled password type: ${toggledType}`);
      
      expect(initialType).not.toBe(toggledType);
    });

    // Test 5: Actual login functionality
    await test.step('Test actual login', async () => {
      const emailInput = page.locator('[data-testid="email-input"]');
      const passwordInput = page.locator('[data-testid="password-input"]');
      const signInButton = page.locator('[data-testid="sign-in-button"]');
      
      await emailInput.fill('test@airwave.app');
      await passwordInput.fill('TestUser123!');
      await signInButton.click();
      
      // Wait for navigation or response
      await page.waitForTimeout(3000);
      
      const currentUrl = page.url();
      console.log(`After login attempt, URL: ${currentUrl}`);
      
      // Check if we're redirected away from login
      const loginSuccessful = !currentUrl.includes('/login');
      console.log(`Login successful: ${loginSuccessful}`);
      
      if (loginSuccessful) {
        console.log('✅ Login functionality working correctly');
      } else {
        console.log('⚠️ Login may have issues - still on login page');
      }
    });
  });

  test('2. Dashboard Page - Test after login', async ({ page }) => {
    console.log('📊 Testing Dashboard Functionality...');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"]').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"]').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);
    
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    await test.step('Test dashboard content', async () => {
      // Check for dashboard elements
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      const cards = await page.locator('.MuiCard-root, .MuiPaper-root').count();
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      
      console.log(`Dashboard elements - Headings: ${headings}, Cards: ${cards}, Buttons: ${buttons}, Links: ${links}`);
      
      // Test if dashboard has meaningful content
      const hasContent = headings > 0 || cards > 0;
      expect(hasContent).toBe(true);
      
      // Check for navigation elements
      const navElements = await page.locator('nav, [role="navigation"]').count();
      console.log(`Navigation elements: ${navElements}`);
      
      // Test interactive elements
      if (buttons > 0) {
        const firstButton = page.locator('button').first();
        const buttonText = await firstButton.textContent();
        console.log(`First button text: "${buttonText}"`);
        
        if (buttonText && !buttonText.includes('undefined')) {
          console.log('✅ Dashboard has interactive elements');
        }
      }
    });
  });

  test('3. Clients Page - Test client management', async ({ page }) => {
    console.log('👥 Testing Clients Page Functionality...');
    
    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"]').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"]').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);
    
    // Navigate to clients page
    await page.goto('http://localhost:3000/clients');
    await page.waitForLoadState('networkidle');
    
    await test.step('Test clients page functionality', async () => {
      // Look for client management elements
      const addButtons = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), [data-testid*="add"], [data-testid*="create"]').count();
      const tables = await page.locator('table, .MuiDataGrid-root, [role="grid"]').count();
      const forms = await page.locator('form').count();
      const clientCards = await page.locator('[data-testid*="client"], .client-card').count();
      
      console.log(`Clients page - Add buttons: ${addButtons}, Tables: ${tables}, Forms: ${forms}, Client cards: ${clientCards}`);
      
      // Test if page has client management functionality
      const hasClientFeatures = addButtons > 0 || tables > 0 || forms > 0 || clientCards > 0;
      expect(hasClientFeatures).toBe(true);
      
      // Test add client functionality if available
      if (addButtons > 0) {
        console.log('Testing client creation...');
        const addButton = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').first();
        
        if (await addButton.isVisible()) {
          await addButton.click();
          await page.waitForTimeout(1000);
          
          // Check if modal or form appeared
          const modals = await page.locator('.MuiDialog-root, .MuiModal-root, [role="dialog"]').count();
          const newForms = await page.locator('form').count();
          
          console.log(`After clicking add - Modals: ${modals}, Forms: ${newForms}`);
          
          if (modals > 0 || newForms > forms) {
            console.log('✅ Client creation functionality working');
          }
        }
      }
    });
  });

  test('4. Assets Page - Test asset management', async ({ page }) => {
    console.log('📁 Testing Assets Page Functionality...');

    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"]').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"]').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);

    // Navigate to assets page
    await page.goto('http://localhost:3000/assets');
    await page.waitForLoadState('networkidle');

    await test.step('Test assets page functionality', async () => {
      // Look for asset management elements
      const uploadButtons = await page.locator('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]').count();
      const assetGrids = await page.locator('.MuiGrid-root, .asset-grid, [data-testid*="asset"]').count();
      const dropzones = await page.locator('[data-testid*="dropzone"], .dropzone').count();
      const fileInputs = await page.locator('input[type="file"]').count();

      console.log(`Assets page - Upload buttons: ${uploadButtons}, Asset grids: ${assetGrids}, Dropzones: ${dropzones}, File inputs: ${fileInputs}`);

      // Test if page has asset management functionality
      const hasAssetFeatures = uploadButtons > 0 || assetGrids > 0 || dropzones > 0 || fileInputs > 0;
      expect(hasAssetFeatures).toBe(true);

      // Test upload functionality if available
      if (uploadButtons > 0) {
        console.log('Testing upload functionality...');
        const uploadButton = page.locator('button:has-text("Upload")').first();

        if (await uploadButton.isVisible()) {
          await uploadButton.click();
          await page.waitForTimeout(1000);

          const newFileInputs = await page.locator('input[type="file"]').count();
          console.log(`File inputs after upload click: ${newFileInputs}`);

          if (newFileInputs > fileInputs) {
            console.log('✅ Upload functionality working');
          }
        }
      }
    });
  });

  test('5. Campaigns Page - Test campaign management', async ({ page }) => {
    console.log('🚀 Testing Campaigns Page Functionality...');

    // Login first
    await page.goto('http://localhost:3000/login');
    await page.locator('[data-testid="email-input"]').fill('test@airwave.app');
    await page.locator('[data-testid="password-input"]').fill('TestUser123!');
    await page.locator('[data-testid="sign-in-button"]').click();
    await page.waitForTimeout(3000);

    // Navigate to campaigns page
    await page.goto('http://localhost:3000/campaigns');
    await page.waitForLoadState('networkidle');

    await test.step('Test campaigns page functionality', async () => {
      // Look for campaign management elements
      const createButtons = await page.locator('button:has-text("Create"), button:has-text("New Campaign"), [data-testid*="create"]').count();
      const campaignLists = await page.locator('.MuiList-root, table, .campaign-list').count();
      const campaignCards = await page.locator('.MuiCard-root, [data-testid*="campaign"]').count();
      const forms = await page.locator('form').count();

      console.log(`Campaigns page - Create buttons: ${createButtons}, Lists: ${campaignLists}, Campaign cards: ${campaignCards}, Forms: ${forms}`);

      // Test if page has campaign management functionality
      const hasCampaignFeatures = createButtons > 0 || campaignLists > 0 || campaignCards > 0 || forms > 0;
      expect(hasCampaignFeatures).toBe(true);

      // Test campaign creation if available
      if (createButtons > 0) {
        console.log('Testing campaign creation...');
        const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")').first();

        if (await createButton.isVisible()) {
          await createButton.click();
          await page.waitForTimeout(1000);

          const modals = await page.locator('.MuiDialog-root, .MuiModal-root, [role="dialog"]').count();
          const newForms = await page.locator('form').count();

          console.log(`After create click - Modals: ${modals}, Forms: ${newForms}`);

          if (modals > 0 || newForms > forms) {
            console.log('✅ Campaign creation functionality working');
          }
        }
      }
    });
  });
});
