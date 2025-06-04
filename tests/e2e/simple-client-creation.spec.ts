import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'tomh@redbaez.com';
const TEST_PASSWORD = 'Wijlre2010';

test.describe('Simple Client Creation', () => {
  test('should create a client step by step', async ({ page }) => {
    console.log('🚀 Starting simple client creation test...');

    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    console.log('✅ Login successful');

    // Check session state before navigating to clients
    const sessionBefore = await page.evaluate(() => {
      return {
        localStorage: localStorage.getItem('airwave_user'),
        cookies: document.cookie
      };
    });
    console.log('🔍 Session before /clients:', {
      hasLocalStorage: !!sessionBefore.localStorage,
      hasCookies: sessionBefore.cookies.includes('supabase') || sessionBefore.cookies.includes('airwave')
    });

    // Navigate to clients page
    await page.goto('/clients');
    await page.waitForTimeout(3000); // Give it time to load
    
    // Check current URL to see if we were redirected
    const currentUrl = page.url();
    console.log('📍 Current URL after /clients navigation:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      console.log('❌ Redirected to login - session lost');
      
      // Check session state after redirect
      const sessionAfter = await page.evaluate(() => {
        return {
          localStorage: localStorage.getItem('airwave_user'),
          cookies: document.cookie
        };
      });
      console.log('🔍 Session after redirect:', {
        hasLocalStorage: !!sessionAfter.localStorage,
        hasCookies: sessionAfter.cookies.includes('supabase') || sessionAfter.cookies.includes('airwave')
      });
      
      await page.screenshot({ path: 'test-results/redirected-to-login.png' });
      throw new Error('Session lost - redirected to login when accessing /clients');
    }

    console.log('✅ Successfully stayed on clients page');

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/clients-page-loaded.png' });

    // Look for Add Client button
    const addClientButton = page.locator('button:has-text("Add Client"), button:has-text("Create Client"), button:has-text("New Client")').first();
    
    // Wait for button to be visible
    try {
      await addClientButton.waitFor({ state: 'visible', timeout: 10000 });
      console.log('✅ Found Add Client button');
    } catch (error) {
      console.log('❌ Could not find Add Client button');
      
      // Check what buttons are actually on the page
      const allButtons = await page.locator('button').all();
      const buttonTexts = await Promise.all(allButtons.map(async (btn) => {
        try {
          return await btn.textContent();
        } catch {
          return 'Could not read text';
        }
      }));
      console.log('🔍 Available buttons:', buttonTexts);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'test-results/clients-page-no-button.png' });
      throw error;
    }

    // Click the Add Client button
    await addClientButton.click();
    console.log('✅ Clicked Add Client button');

    // Wait for navigation to create client page
    try {
      await page.waitForURL('/create-client', { timeout: 10000 });
      console.log('✅ Navigated to create-client page');
    } catch (error) {
      console.log('❌ Did not navigate to create-client page');
      console.log('📍 Current URL:', page.url());
      await page.screenshot({ path: 'test-results/after-click-add-client.png' });
      throw error;
    }

    // Take screenshot of the create client form
    await page.screenshot({ path: 'test-results/create-client-form.png' });

    // Step 1: Fill basic information
    console.log('📝 Filling Step 1: Basic Information...');
    
    // Fill client name
    const nameInput = page.locator('input[placeholder*="client name"], input[name="name"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill('Test Client Company ' + Date.now());
    console.log('✅ Filled client name');

    // Handle industry dropdown
    const industryDropdown = page.locator('[data-testid="industry-select"], .MuiSelect-root', page.locator('label:has-text("Industry")').locator('+ *')).first();
    await industryDropdown.click();
    await page.waitForTimeout(500);
    
    // Select Technology option
    const technologyOption = page.locator('li:has-text("Technology"), [data-value="Technology"]').first();
    await technologyOption.click();
    console.log('✅ Selected Technology industry');

    // Click Next button
    const nextButton = page.locator('button:has-text("Next")').first();
    await nextButton.waitFor({ state: 'visible' });
    await nextButton.click();
    console.log('✅ Proceeded to Step 2');

    // Step 2: Skip brand & design
    await page.waitForTimeout(1000);
    const nextButton2 = page.locator('button:has-text("Next")').first();
    await nextButton2.click();
    console.log('✅ Skipped Step 2');

    // Step 3: Skip contacts
    await page.waitForTimeout(1000);
    const nextButton3 = page.locator('button:has-text("Next")').first();
    await nextButton3.click();
    console.log('✅ Skipped Step 3');

    // Step 4: Fill all required brand guidelines fields
    await page.waitForTimeout(1000);
    
    // Fill voice & tone (likely required)
    const voiceSelect = page.locator('[data-testid="voice-tone-select"], label:has-text("Voice") + *, label:has-text("Tone") + *').first();
    if (await voiceSelect.isVisible()) {
      await voiceSelect.click();
      await page.waitForTimeout(500);
      const professionalOption = page.locator('li:has-text("Professional"), li:has-text("Friendly"), li:has-text("Casual")').first();
      await professionalOption.click();
      console.log('✅ Selected voice & tone');
    }
    
    // Fill target audience (if required)
    const audienceTextarea = page.locator('textarea[placeholder*="target audience"], textarea[name="targetAudience"]').first();
    if (await audienceTextarea.isVisible()) {
      await audienceTextarea.fill('Business professionals and technology enthusiasts');
      console.log('✅ Filled target audience');
    }

    // Check if Create Client button is enabled
    await page.waitForTimeout(1000);
    const createButton = page.locator('button:has-text("Create Client")').first();
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    
    const isEnabled = await createButton.isEnabled();
    console.log('🔍 Create Client button enabled:', isEnabled);
    
    if (!isEnabled) {
      // Take screenshot to debug what's missing
      await page.screenshot({ path: 'test-results/create-button-disabled.png' });
      
      // Check for validation errors or required fields
      const errorMessages = await page.locator('[role="alert"], .error, .required').all();
      for (const error of errorMessages) {
        const text = await error.textContent();
        console.log('⚠️ Validation error:', text);
      }
      
      // Try to find all required fields on the current step
      const requiredFields = await page.locator('input[required], textarea[required], [aria-required="true"]').all();
      console.log('📋 Required fields found:', requiredFields.length);
      
      for (const field of requiredFields) {
        const value = await field.inputValue();
        const placeholder = await field.getAttribute('placeholder');
        console.log(`📝 Required field: ${placeholder || 'unknown'} = "${value}"`);
      }
    }

    await createButton.click();
    console.log('✅ Clicked Create Client button');

    // Wait for redirect or success
    try {
      await page.waitForURL('/clients', { timeout: 10000 });
      console.log('✅ Client created successfully - redirected to clients list');
      
      await page.screenshot({ path: 'test-results/client-created-success.png' });
    } catch (error) {
      console.log('❌ Did not redirect to clients list after creation');
      console.log('📍 Current URL:', page.url());
      await page.screenshot({ path: 'test-results/client-creation-failed.png' });
      throw error;
    }

    console.log('🎉 Client creation test completed successfully!');
  });
});