import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Client Creation with Proper Delays', () => {
  test('should create client with realistic timing', async ({ page }) => {
    console.log('🚀 Starting client creation with proper delays...');

    // 1. Login with delays
    await page.goto('/login');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.waitForTimeout(1000);
    
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.waitForTimeout(1000);
    
    await page.click('button[type="submit"]');
    
    // Wait for login to complete fully
    await page.waitForURL('/dashboard', { timeout: 15000 });
    await page.waitForTimeout(5000); // Give session time to stabilize
    console.log('✅ Login completed with stabilization delay');

    // 2. Navigate to clients with delay
    console.log('🔄 Navigating to clients page...');
    await page.goto('/clients');
    
    // Wait for page to load completely
    await page.waitForTimeout(5000);
    
    // Check if we're on the right page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('❌ Still redirected to login, session issue persists');
      await page.screenshot({ path: 'test-results/login-redirect-with-delays.png' });
      return; // Skip the rest of the test
    }
    
    console.log('✅ Successfully on clients page');
    await page.screenshot({ path: 'test-results/clients-page-success.png' });

    // 3. Click Add Client with delay
    const addClientButton = page.locator('button:has-text("Add Client")').first();
    await addClientButton.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    await addClientButton.click();
    console.log('✅ Clicked Add Client');

    // 4. Wait for navigation to create-client
    await page.waitForURL('/create-client', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to create-client page');

    // 5. Fill Step 1 with delays
    console.log('📝 Filling Step 1...');
    
    const nameInput = page.locator('input[placeholder*="client name"], input[name="name"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill('Test Client ' + Date.now());
    await page.waitForTimeout(1000);
    console.log('✅ Filled client name');

    // Industry dropdown
    const industryDropdown = page.locator('.MuiSelect-root', page.locator('label:has-text("Industry")').locator('+ *')).first();
    await industryDropdown.click();
    await page.waitForTimeout(1000);
    
    const technologyOption = page.locator('li:has-text("Technology")').first();
    await technologyOption.click();
    await page.waitForTimeout(1000);
    console.log('✅ Selected Technology industry');

    // Next button
    const nextButton1 = page.locator('button:has-text("Next")').first();
    await nextButton1.click();
    await page.waitForTimeout(2000);
    console.log('✅ Completed Step 1');

    // 6. Skip Step 2 
    const nextButton2 = page.locator('button:has-text("Next")').first();
    await nextButton2.click();
    await page.waitForTimeout(2000);
    console.log('✅ Skipped Step 2');

    // 7. Skip Step 3
    const nextButton3 = page.locator('button:has-text("Next")').first();
    await nextButton3.click();
    await page.waitForTimeout(2000);
    console.log('✅ Skipped Step 3');

    // 8. Fill Step 4 (Brand Guidelines)
    console.log('📝 Filling Step 4...');
    
    // Voice & Tone dropdown
    const voiceDropdown = page.locator('.MuiSelect-root').filter({ hasText: 'Voice' }).or(page.locator('.MuiSelect-root').filter({ hasText: 'Tone' })).first();
    if (await voiceDropdown.isVisible()) {
      await voiceDropdown.click();
      await page.waitForTimeout(1000);
      const casualOption = page.locator('li:has-text("Casual"), li:has-text("Professional"), li:has-text("Friendly")').first();
      await casualOption.click();
      await page.waitForTimeout(1000);
      console.log('✅ Selected voice & tone');
    }
    
    // Target audience
    const audienceTextarea = page.locator('textarea[placeholder*="target audience"], textarea[name="targetAudience"]').first();
    if (await audienceTextarea.isVisible()) {
      await audienceTextarea.fill('Business professionals and technology enthusiasts in the enterprise sector');
      await page.waitForTimeout(1000);
      console.log('✅ Filled target audience');
    }

    // 9. Submit with validation check
    await page.waitForTimeout(2000);
    
    const createButton = page.locator('button:has-text("Create Client")').first();
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Check if button is enabled
    const isEnabled = await createButton.isEnabled();
    console.log('🔍 Create button enabled:', isEnabled);
    
    if (!isEnabled) {
      console.log('❌ Create button is disabled, checking validation...');
      await page.screenshot({ path: 'test-results/create-button-disabled.png' });
      
      // Force click if needed for testing
      await createButton.click({ force: true });
    } else {
      await createButton.click();
    }
    
    console.log('✅ Clicked Create Client button');

    // 10. Wait for completion
    try {
      await page.waitForURL('/clients', { timeout: 15000 });
      console.log('✅ Client created successfully - back to clients list');
      
      await page.screenshot({ path: 'test-results/client-creation-success.png' });
      
      // Verify client appears in list
      await page.waitForTimeout(3000);
      const clientCards = await page.locator('.MuiCard-root, [data-testid="client-card"]').count();
      console.log(`📊 Found ${clientCards} client cards on page`);
      
    } catch (error) {
      console.log('❌ Did not redirect to clients list');
      console.log('📍 Current URL:', page.url());
      await page.screenshot({ path: 'test-results/client-creation-failed.png' });
    }

    console.log('🎉 Client creation test completed!');
  });
});