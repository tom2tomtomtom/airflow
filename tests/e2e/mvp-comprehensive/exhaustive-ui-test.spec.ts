import { test, expect } from '@playwright/test';

test.describe('Exhaustive UI Test - Every Button and Field', () => {
  test('Test every UI element', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for exhaustive testing
    
    console.log('🔍 EXHAUSTIVE UI TEST - Testing Every Button and Field\n');
    
    const testedElements = {
      buttons: [],
      inputs: [],
      selects: [],
      checkboxes: [],
      links: [],
      errors: []
    };

    // Helper function to safely click elements
    async function safeClick(selector: string, description: string) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          testedElements.buttons.push(`✅ ${description}`);
          await page.waitForTimeout(500);
          return true;
        } else {
          testedElements.buttons.push(`❌ ${description} - Not found`);
          return false;
        }
      } catch (e) {
        testedElements.errors.push(`Error clicking ${description}: ${e.message}`);
        return false;
      }
    }

    // Helper function to test inputs
    async function testInput(selector: string, testValue: string, description: string) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 })) {
          await element.fill(testValue);
          const value = await element.inputValue();
          if (value === testValue) {
            testedElements.inputs.push(`✅ ${description} - Works`);
          } else {
            testedElements.inputs.push(`⚠️ ${description} - Value not retained`);
          }
          return true;
        } else {
          testedElements.inputs.push(`❌ ${description} - Not found`);
          return false;
        }
      } catch (e) {
        testedElements.errors.push(`Error testing input ${description}: ${e.message}`);
        return false;
      }
    }

    // === LOGIN PAGE ===
    console.log('=== TESTING LOGIN PAGE ===');
    await page.goto('http://localhost:3003/login');
    
    // Test all inputs on login page
    await testInput('[data-testid="email-input"] input', 'test@example.com', 'Login Email Input');
    await testInput('[data-testid="password-input"] input', 'TestPassword123!', 'Login Password Input');
    
    // Test all buttons on login page
    const passwordToggle = page.locator('[data-testid="password-visibility-toggle"], button[aria-label*="password"]');
    if (await passwordToggle.isVisible({ timeout: 1000 })) {
      await safeClick('[data-testid="password-visibility-toggle"]', 'Password Visibility Toggle');
    }
    
    // Check for forgot password link
    await safeClick('a:has-text("Forgot Password"), text=/forgot.*password/i', 'Forgot Password Link');
    
    // Check for sign up link
    await safeClick('a:has-text("Sign up"), a:has-text("Register"), text=/don.*have.*account/i', 'Sign Up Link');
    
    // Check for remember me checkbox
    const rememberMe = page.locator('input[type="checkbox"]').first();
    if (await rememberMe.isVisible({ timeout: 1000 })) {
      await rememberMe.check();
      testedElements.checkboxes.push('✅ Remember Me Checkbox');
    } else {
      testedElements.checkboxes.push('❌ Remember Me Checkbox - Not found');
    }
    
    // Now login for real
    await page.fill('[data-testid="email-input"] input', 'tomh@redbaez.com');
    await page.fill('[data-testid="password-input"] input', 'Wijlre2010');
    await page.click('[data-testid="sign-in-button"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // === DASHBOARD ===
    console.log('\n=== TESTING DASHBOARD ===');
    
    // Test all visible buttons on dashboard
    const dashboardButtons = await page.locator('button:visible').all();
    console.log(`Found ${dashboardButtons.length} buttons on dashboard`);
    
    for (let i = 0; i < dashboardButtons.length; i++) {
      const buttonText = await dashboardButtons[i].textContent();
      if (buttonText && buttonText.trim()) {
        console.log(`Testing button: ${buttonText.trim()}`);
        try {
          await dashboardButtons[i].click();
          testedElements.buttons.push(`✅ Dashboard: ${buttonText.trim()}`);
          await page.waitForTimeout(500);
          
          // Check if modal opened
          const modal = page.locator('[role="dialog"], .MuiModal-root');
          if (await modal.isVisible()) {
            console.log('  Modal opened, closing...');
            // Try to close modal
            const closeButton = modal.locator('button[aria-label*="close"], button:has-text("Cancel"), button:has-text("Close")').first();
            if (await closeButton.isVisible()) {
              await closeButton.click();
              await page.waitForTimeout(500);
            } else {
              // Press escape
              await page.keyboard.press('Escape');
              await page.waitForTimeout(500);
            }
          }
          
          // Go back to dashboard if navigated away
          if (!page.url().includes('dashboard')) {
            await page.goto('http://localhost:3003/dashboard');
            await page.waitForTimeout(1000);
          }
        } catch (e) {
          testedElements.errors.push(`Error clicking dashboard button ${buttonText}: ${e.message}`);
        }
      }
    }
    
    // Test Quick Action cards
    const quickActionCards = await page.locator('.MuiCard-root button, [data-testid*="quick-action"]').all();
    for (const card of quickActionCards) {
      const cardText = await card.textContent();
      if (cardText) {
        await safeClick(card, `Quick Action: ${cardText.trim()}`);
        
        // Navigate back if we left dashboard
        if (!page.url().includes('dashboard')) {
          await page.goto('http://localhost:3003/dashboard');
          await page.waitForTimeout(1000);
        }
      }
    }
    
    // === CLIENTS PAGE ===
    console.log('\n=== TESTING CLIENTS PAGE ===');
    await page.goto('http://localhost:3003/clients');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('clients')) {
      // Test create/add buttons
      await safeClick('button:has-text("Create"), button:has-text("Add"), button:has-text("New Client")', 'Create Client Button');
      
      // If create form opened, test all fields
      if (page.url().includes('create-client') || await page.locator('[role="dialog"]').isVisible()) {
        console.log('Testing client creation form...');
        
        await testInput('input[name="name"], input[placeholder*="name"]', 'Test Client Name', 'Client Name');
        await testInput('input[name="industry"], input[placeholder*="industry"]', 'Technology', 'Client Industry');
        await testInput('input[name="website"], input[placeholder*="website"]', 'https://example.com', 'Client Website');
        await testInput('textarea[name="description"], textarea[placeholder*="description"]', 'Test client description', 'Client Description');
        await testInput('input[name="contactName"], input[placeholder*="contact"]', 'John Doe', 'Contact Name');
        await testInput('input[name="contactEmail"], input[type="email"]', 'john@example.com', 'Contact Email');
        await testInput('input[name="contactPhone"], input[type="tel"]', '+1234567890', 'Contact Phone');
        
        // Test color pickers
        const colorInputs = await page.locator('input[type="color"]').all();
        for (let i = 0; i < colorInputs.length; i++) {
          await colorInputs[i].fill('#FF6B35');
          testedElements.inputs.push(`✅ Color Picker ${i + 1}`);
        }
        
        // Cancel or close
        await safeClick('button:has-text("Cancel"), button:has-text("Close")', 'Cancel Client Creation');
      }
      
      // Test search
      await testInput('input[placeholder*="Search"], input[type="search"]', 'test search', 'Client Search');
      
      // Test filters
      await safeClick('button:has-text("Filter"), button[aria-label*="filter"]', 'Client Filter Button');
      
      // Test view toggle
      await safeClick('button[aria-label*="grid"], button[aria-label*="list"]', 'View Toggle');
      
      // Test client cards
      const clientCards = await page.locator('.MuiCard-root, [data-testid*="client-card"]').all();
      if (clientCards.length > 0) {
        console.log(`Found ${clientCards.length} client cards`);
        // Test first client card buttons
        const firstCard = clientCards[0];
        const cardButtons = await firstCard.locator('button').all();
        for (const btn of cardButtons) {
          const btnText = await btn.textContent();
          if (btnText) {
            await safeClick(btn, `Client Card: ${btnText.trim()}`);
          }
        }
      }
    }
    
    // === ASSETS PAGE ===
    console.log('\n=== TESTING ASSETS PAGE ===');
    await page.goto('http://localhost:3003/assets');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('assets')) {
      // Test upload button
      await safeClick('button:has-text("Upload"), button:has-text("Add")', 'Upload Asset Button');
      
      // Test search
      await testInput('input[placeholder*="Search"], input[type="search"]', 'test asset', 'Asset Search');
      
      // Test filter buttons
      const filterButtons = ['Images', 'Videos', 'Audio', 'Documents', 'All'];
      for (const filter of filterButtons) {
        await safeClick(`button:has-text("${filter}")`, `Asset Filter: ${filter}`);
      }
      
      // Test sort dropdown
      await safeClick('button:has-text("Sort"), [aria-label*="sort"]', 'Asset Sort Dropdown');
      
      // Test asset cards
      const assetCards = await page.locator('.MuiCard-root, [data-testid*="asset"]').all();
      if (assetCards.length > 0) {
        const firstAsset = assetCards[0];
        await safeClick(firstAsset.locator('button[aria-label*="favorite"]'), 'Asset Favorite Button');
        await safeClick(firstAsset.locator('button[aria-label*="download"]'), 'Asset Download Button');
        await safeClick(firstAsset.locator('button[aria-label*="delete"]'), 'Asset Delete Button');
      }
    }
    
    // === GENERATE PAGE ===
    console.log('\n=== TESTING GENERATE PAGE ===');
    await page.goto('http://localhost:3003/generate-enhanced');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('generate')) {
      // Test all tabs
      const tabs = await page.locator('[role="tab"]').all();
      console.log(`Found ${tabs.length} tabs`);
      
      for (const tab of tabs) {
        const tabText = await tab.textContent();
        if (tabText) {
          await tab.click();
          testedElements.buttons.push(`✅ Tab: ${tabText.trim()}`);
          await page.waitForTimeout(1000);
          
          // Test inputs in each tab
          const textareas = await page.locator('textarea:visible').all();
          for (let i = 0; i < textareas.length; i++) {
            const placeholder = await textareas[i].getAttribute('placeholder');
            await testInput(textareas[i], 'Test content for ' + placeholder, `Textarea: ${placeholder || 'Tab textarea ' + i}`);
          }
          
          // Test buttons in each tab
          const tabButtons = await page.locator('button:visible').all();
          for (const btn of tabButtons) {
            const btnText = await btn.textContent();
            if (btnText && !btnText.includes('tab')) {
              await safeClick(btn, `Generate Tab Button: ${btnText.trim()}`);
            }
          }
        }
      }
    }
    
    // === CAMPAIGNS PAGE ===
    console.log('\n=== TESTING CAMPAIGNS PAGE ===');
    await page.goto('http://localhost:3003/campaigns');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('campaigns')) {
      await safeClick('button:has-text("Create"), button:has-text("New Campaign")', 'Create Campaign Button');
      
      // Test campaign cards
      const campaignCards = await page.locator('.MuiCard-root, [data-testid*="campaign"]').all();
      if (campaignCards.length > 0) {
        const firstCampaign = campaignCards[0];
        await safeClick(firstCampaign.locator('button:has-text("Edit")'), 'Edit Campaign');
        await safeClick(firstCampaign.locator('button:has-text("View")'), 'View Campaign');
        await safeClick(firstCampaign.locator('button[aria-label*="delete"]'), 'Delete Campaign');
      }
    }
    
    // === MATRIX PAGE ===
    console.log('\n=== TESTING MATRIX PAGE ===');
    await page.goto('http://localhost:3003/matrix');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('matrix')) {
      await safeClick('button:has-text("Add Row"), button:has-text("Add Platform")', 'Add Matrix Row');
      await safeClick('button:has-text("Generate"), button:has-text("Create Combinations")', 'Generate Combinations');
      
      // Test matrix cells
      const matrixCells = await page.locator('td button, .matrix-cell button').all();
      if (matrixCells.length > 0) {
        console.log(`Found ${matrixCells.length} matrix cell buttons`);
        // Test first few cells
        for (let i = 0; i < Math.min(5, matrixCells.length); i++) {
          await safeClick(matrixCells[i], `Matrix Cell ${i + 1}`);
        }
      }
    }
    
    // === NAVIGATION MENU ===
    console.log('\n=== TESTING NAVIGATION MENU ===');
    
    // Test all nav links
    const navLinks = await page.locator('nav a, nav button').all();
    for (const link of navLinks) {
      const linkText = await link.textContent();
      if (linkText) {
        await safeClick(link, `Nav Link: ${linkText.trim()}`);
        await page.waitForTimeout(500);
      }
    }
    
    // === USER MENU ===
    console.log('\n=== TESTING USER MENU ===');
    
    const userAvatar = page.locator('.MuiAvatar-root, [data-testid="user-menu"]').first();
    if (await userAvatar.isVisible()) {
      await userAvatar.click();
      testedElements.buttons.push('✅ User Avatar/Menu');
      await page.waitForTimeout(500);
      
      // Test menu items
      const menuItems = await page.locator('[role="menuitem"]').all();
      for (const item of menuItems) {
        const itemText = await item.textContent();
        if (itemText) {
          console.log(`Testing menu item: ${itemText}`);
          testedElements.links.push(`Menu Item: ${itemText.trim()}`);
        }
      }
    }
    
    // === GENERATE FINAL REPORT ===
    console.log('\n\n=== EXHAUSTIVE UI TEST REPORT ===\n');
    
    console.log(`BUTTONS TESTED: ${testedElements.buttons.length}`);
    testedElements.buttons.forEach(b => console.log(b));
    
    console.log(`\nINPUTS TESTED: ${testedElements.inputs.length}`);
    testedElements.inputs.forEach(i => console.log(i));
    
    console.log(`\nCHECKBOXES TESTED: ${testedElements.checkboxes.length}`);
    testedElements.checkboxes.forEach(c => console.log(c));
    
    console.log(`\nLINKS TESTED: ${testedElements.links.length}`);
    testedElements.links.forEach(l => console.log(l));
    
    if (testedElements.errors.length > 0) {
      console.log(`\nERRORS ENCOUNTERED: ${testedElements.errors.length}`);
      testedElements.errors.forEach(e => console.log(`❌ ${e}`));
    }
    
    const totalTested = testedElements.buttons.length + testedElements.inputs.length + 
                       testedElements.checkboxes.length + testedElements.links.length;
    const successful = [...testedElements.buttons, ...testedElements.inputs, ...testedElements.checkboxes]
                       .filter(item => item.includes('✅')).length;
    
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total UI Elements Tested: ${totalTested}`);
    console.log(`Successful Interactions: ${successful}`);
    console.log(`Failed/Missing Elements: ${totalTested - successful}`);
    console.log(`Errors: ${testedElements.errors.length}`);
    console.log(`Success Rate: ${Math.round(successful / totalTested * 100)}%`);
  });
});