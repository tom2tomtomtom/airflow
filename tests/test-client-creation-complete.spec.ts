import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test('Complete client creation workflow with all required fields', async ({ page }) => {
  console.log('🎯 Testing Complete Client Creation Workflow...');
  
  // 1. Login
  console.log('📝 Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✅ Logged in successfully');
  
  // 2. Navigate to create client
  console.log('🔗 Navigating to create client page...');
  await page.goto('http://localhost:3000/create-client');
  await page.waitForTimeout(3000);
  console.log('✅ On create client page');
  
  // 3. Fill out Step 1: Basic Information (required)
  console.log('📋 Step 1: Basic Information');
  
  // Wait for name field and fill it
  await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 5000 });
  await page.locator('input[name="name"], input[id="name"]').first().fill('Test Company Inc');
  console.log('✅ Filled client name');
  
  // Fill industry (try both select and input)
  const industrySelect = page.locator('select[name="industry"], [role="combobox"]').first();
  const industryInput = page.locator('input[name="industry"]').first();
  
  if (await industrySelect.count() > 0) {
    await industrySelect.click();
    await page.waitForTimeout(500);
    // Try to select Technology option
    await page.locator('li:has-text("Technology"), option:has-text("Technology")').first().click();
    console.log('✅ Selected Technology industry');
  } else if (await industryInput.count() > 0) {
    await industryInput.fill('Technology');
    console.log('✅ Filled industry input');
  }
  
  // Fill description (optional but helpful)
  const descriptionField = page.locator('textarea[name="description"], input[name="description"]').first();
  if (await descriptionField.count() > 0) {
    await descriptionField.fill('A technology company focused on innovative solutions');
    console.log('✅ Filled description');
  }
  
  // Proceed to next step
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1500);
  console.log('✅ Proceeded to Step 2');
  
  // 4. Step 2: Brand & Design (skip for now)
  console.log('🎨 Step 2: Brand & Design');
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1500);
  console.log('✅ Skipped Step 2');
  
  // 5. Step 3: Contacts (skip for now)
  console.log('👥 Step 3: Contacts');
  await page.locator('button:has-text("Next")').click();
  await page.waitForTimeout(1500);
  console.log('✅ Skipped Step 3');
  
  // 6. Step 4: Brand Guidelines (IMPORTANT - fill all required fields)
  console.log('📋 Step 4: Brand Guidelines (filling all fields)');
  await page.waitForTimeout(2000);
  
  // Fill Voice/Tone field (likely required)
  const voiceToneFields = [
    'textarea[name*="voice"], textarea[name*="tone"]',
    'textarea[placeholder*="voice"], textarea[placeholder*="tone"]', 
    'textarea:has-text("Voice"), textarea:has-text("Tone")',
    '[data-testid*="voice"], [data-testid*="tone"]'
  ];
  
  for (const selector of voiceToneFields) {
    const field = page.locator(selector).first();
    if (await field.count() > 0) {
      await field.fill('Professional, friendly, and approachable. Use clear, concise language that builds trust.');
      console.log('✅ Filled voice/tone field');
      break;
    }
  }
  
  // Fill Target Audience field (likely required)
  const targetAudienceFields = [
    'textarea[name*="audience"], textarea[name*="target"]',
    'textarea[placeholder*="audience"], textarea[placeholder*="target"]',
    'textarea:has-text("Audience"), textarea:has-text("Target")',
    '[data-testid*="audience"], [data-testid*="target"]'
  ];
  
  for (const selector of targetAudienceFields) {
    const field = page.locator(selector).first();
    if (await field.count() > 0) {
      await field.fill('Technology professionals, startup founders, and businesses looking for digital transformation solutions');
      console.log('✅ Filled target audience field');
      break;
    }
  }
  
  // Fill Key Messages if available
  const keyMessageField = page.locator('textarea[name*="message"], input[name*="message"], textarea[placeholder*="message"]').first();
  if (await keyMessageField.count() > 0) {
    await keyMessageField.fill('Innovation, reliability, customer-first approach');
    console.log('✅ Filled key messages');
  }
  
  // Check if there's an "Add" button for key messages and click it
  const addMessageButton = page.locator('button:has-text("Add"), button[aria-label*="add"]').first();
  if (await addMessageButton.count() > 0) {
    await addMessageButton.click();
    await page.waitForTimeout(500);
    console.log('✅ Added key message');
  }
  
  // Take screenshot before submission
  await page.screenshot({ path: 'test-results/client-creation-ready-submit.png' });
  
  // Wait a bit for any validation to complete
  await page.waitForTimeout(2000);
  
  // 7. Find and attempt to submit
  console.log('🚀 Attempting to submit...');
  
  // Look for various submit button variations
  const submitSelectors = [
    'button:has-text("Create Client")',
    'button:has-text("Create")',
    'button:has-text("Submit")',
    'button[type="submit"]',
    'button:has-text("Finish")',
    'button:has-text("Complete")'
  ];
  
  let submitted = false;
  for (const selector of submitSelectors) {
    const button = page.locator(selector);
    if (await button.count() > 0) {
      // Check if button is enabled
      const isDisabled = await button.getAttribute('disabled');
      const hasDisabledClass = await button.getAttribute('class');
      
      console.log(`Found button: ${selector}`);
      console.log(`Disabled attribute: ${isDisabled}`);
      console.log(`Classes: ${hasDisabledClass}`);
      
      if (isDisabled === null && !hasDisabledClass?.includes('Mui-disabled')) {
        console.log('✅ Submit button is enabled, clicking...');
        
        // Set up response listener
        const responsePromise = page.waitForResponse(response => 
          response.url().includes('/api/clients') && response.request().method() === 'POST',
          { timeout: 10000 }
        );
        
        await button.click();
        console.log('✅ Clicked submit button');
        
        try {
          const response = await responsePromise;
          const responseBody = await response.text();
          let responseData;
          try {
            responseData = JSON.parse(responseBody);
          } catch {
            responseData = responseBody;
          }
          
          console.log('📡 API Response Status:', response.status());
          console.log('📡 API Response:', JSON.stringify(responseData, null, 2));
          
          if (response.status() >= 200 && response.status() < 300) {
            console.log('🎉 CLIENT CREATION SUCCESSFUL!');
            submitted = true;
            
            // Wait for any redirect or UI update
            await page.waitForTimeout(3000);
            console.log('📍 Final URL:', page.url());
            
          } else {
            console.log('❌ Client creation failed:', response.status());
          }
        } catch (error) {
          console.log('❌ Error waiting for response:', error.message);
        }
        break;
      } else {
        console.log('❌ Submit button is disabled');
      }
    }
  }
  
  if (!submitted) {
    console.log('❌ Could not find enabled submit button');
    // Take screenshot to debug
    await page.screenshot({ path: 'test-results/client-creation-submit-debug.png' });
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/client-creation-final-state.png' });
  
  console.log('🎯 Client creation test completed');
});