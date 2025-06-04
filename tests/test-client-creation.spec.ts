import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test('Test client creation end-to-end workflow', async ({ page }) => {
  console.log('🎯 Testing Client Creation Workflow...');
  
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
  await page.waitForTimeout(2000);
  console.log('✅ On create client page');
  
  // 3. Fill out the form step by step
  console.log('📝 Filling out client creation form...');
  
  // Step 1: Basic Information
  console.log('📋 Step 1: Basic Information');
  await page.waitForSelector('input[name="name"], input[id="name"]', { timeout: 5000 });
  
  // Try different selectors for the name field
  const nameField = await page.locator('input[name="name"], input[id="name"], input[placeholder*="name"], input[placeholder*="Name"]').first();
  if (await nameField.count() > 0) {
    await nameField.fill('Test Client Ltd');
    console.log('✅ Filled client name');
  } else {
    console.log('❌ Could not find name field');
  }
  
  // Try to find industry field
  const industryField = await page.locator('select[name="industry"], select[id="industry"], input[name="industry"]').first();
  if (await industryField.count() > 0) {
    await industryField.fill('Technology');
    console.log('✅ Filled industry');
  } else {
    console.log('❌ Could not find industry field');
  }
  
  // Take screenshot of Step 1
  await page.screenshot({ path: 'test-results/client-creation-step1.png' });
  
  // Look for Next button
  const nextButton = await page.locator('button:has-text("Next"), button:has-text("Continue"), button[type="submit"]').first();
  if (await nextButton.count() > 0) {
    await nextButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Proceeded to next step');
  } else {
    console.log('❌ Could not find Next button on Step 1');
  }
  
  // Step 2: Branding (optional)
  console.log('🎨 Step 2: Branding');
  await page.waitForTimeout(1000);
  
  // Skip branding for now, look for Next button
  const nextButton2 = await page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  if (await nextButton2.count() > 0) {
    await nextButton2.click();
    await page.waitForTimeout(1000);
    console.log('✅ Skipped branding step');
  } else {
    console.log('❌ Could not find Next button on Step 2');
  }
  
  // Step 3: Contacts (optional)
  console.log('👥 Step 3: Contacts');
  await page.waitForTimeout(1000);
  
  // Skip contacts for now, look for Next button
  const nextButton3 = await page.locator('button:has-text("Next"), button:has-text("Continue")').first();
  if (await nextButton3.count() > 0) {
    await nextButton3.click();
    await page.waitForTimeout(1000);
    console.log('✅ Skipped contacts step');
  } else {
    console.log('❌ Could not find Next button on Step 3');
  }
  
  // Step 4: Brand Guidelines
  console.log('📋 Step 4: Brand Guidelines');
  await page.waitForTimeout(1000);
  
  // Try to fill brand guidelines
  const voiceToneField = await page.locator('textarea[name*="voice"], textarea[name*="tone"], textarea[placeholder*="voice"], textarea[placeholder*="tone"]').first();
  if (await voiceToneField.count() > 0) {
    await voiceToneField.fill('Professional and friendly tone');
    console.log('✅ Filled voice tone');
  }
  
  const targetAudienceField = await page.locator('textarea[name*="audience"], textarea[name*="target"], textarea[placeholder*="audience"]').first();
  if (await targetAudienceField.count() > 0) {
    await targetAudienceField.fill('Tech professionals and businesses');
    console.log('✅ Filled target audience');
  }
  
  // Take screenshot of final step
  await page.screenshot({ path: 'test-results/client-creation-step4.png' });
  
  // 4. Submit the form
  console.log('🚀 Submitting form...');
  const submitButton = await page.locator('button:has-text("Create"), button:has-text("Submit"), button[type="submit"]').first();
  if (await submitButton.count() > 0) {
    // Listen for API response
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/clients') && response.request().method() === 'POST'
    );
    
    await submitButton.click();
    console.log('✅ Clicked submit button');
    
    try {
      const response = await responsePromise;
      const responseData = await response.json();
      console.log('📡 API Response Status:', response.status());
      console.log('📡 API Response:', JSON.stringify(responseData, null, 2));
      
      if (response.status() === 200 || response.status() === 201) {
        console.log('🎉 Client creation successful!');
        
        // Wait for redirect or success message
        await page.waitForTimeout(3000);
        
        // Check if we're redirected to clients page or see success message
        const currentUrl = page.url();
        console.log('📍 After submission URL:', currentUrl);
        
        if (currentUrl.includes('/clients') && !currentUrl.includes('/create-client')) {
          console.log('✅ Successfully redirected to clients page');
        }
        
      } else {
        console.log('❌ Client creation failed with status:', response.status());
      }
    } catch (error) {
      console.log('❌ Error waiting for API response:', error.message);
    }
  } else {
    console.log('❌ Could not find submit button');
  }
  
  // Take final screenshot
  await page.screenshot({ path: 'test-results/client-creation-final.png' });
  
  console.log('🎯 Client creation test complete');
});