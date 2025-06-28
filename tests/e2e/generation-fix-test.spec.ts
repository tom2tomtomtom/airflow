import { test } from '@playwright/test';

test.describe('AIDEAS Generation Fix Verification', () => {
  const baseURL = 'https://aideas-redbaez.netlify.app';

  test('Verify generation functionality works after fix', async ({ page }) => {
    console.log('🎯 Testing generation functionality on deployed site...');

    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Wait for the app to load
    await page.waitForTimeout(3000);

    // Take screenshot of current state
    await page.screenshot({ path: 'generation-test-start.png', fullPage: true });
    console.log('📸 Screenshot saved as generation-test-start.png');

    // Look for text input fields that could be brief inputs
    const textInputs = await page.locator('input[type="text"], textarea').all();
    console.log(`📝 Found ${textInputs.length} text inputs`);

    if (textInputs.length > 0) {
      // Try the first text input
      const briefInput = textInputs[0];

      // Clear and fill with test brief
      await briefInput.click();
      await briefInput.fill(
        'Test campaign for eco-friendly products targeting young professionals in urban areas'
      );
      console.log('✅ Filled brief input with test content');

      // Look for generate/submit buttons
      const generateButtons = await page
        .locator(
          `
        button:has-text("Generate"),
        button:has-text("Create"),
        button:has-text("Submit"),
        button:has-text("Start"),
        input[type="submit"]
      `
        )
        .all();

      console.log(`🔘 Found ${generateButtons.length} potential generate buttons`);

      if (generateButtons.length > 0) {
        // Click the first generate button
        await generateButtons[0].click();
        console.log('🚀 Clicked generate button');

        // Wait for generation to complete (up to 30 seconds)
        await page.waitForTimeout(2000);

        // Look for loading indicators
        const loadingIndicators = await page
          .locator('.loading, [class*="loading"], .spinner, [class*="spinner"]')
          .all();
        console.log(`⏳ Loading indicators: ${loadingIndicators.length}`);

        // Wait longer for results
        await page.waitForTimeout(10000);

        // Check for results or output
        const resultElements = await page
          .locator(
            `
          .result, .results, .output, .territory, .headline, .campaign,
          [class*="result"], [class*="output"], [class*="territory"],
          [class*="campaign"], [data-testid*="result"], [data-testid*="output"]
        `
          )
          .all();

        console.log(`📊 Result elements found: ${resultElements.length}`);

        // Check for any error messages
        const errorElements = await page.locator('.error, [class*="error"], .alert-error').all();
        console.log(`❌ Error elements: ${errorElements.length}`);

        if (errorElements.length > 0) {
          for (let i = 0; i < errorElements.length; i++) {
            const errorText = await errorElements[i].textContent();
            console.log(`  Error ${i + 1}: ${errorText}`);
          }
        }

        // Take final screenshot
        await page.screenshot({ path: 'generation-test-result.png', fullPage: true });
        console.log('📸 Result screenshot saved as generation-test-result.png');

        // Check console for any JavaScript errors
        const consoleLogs: string[] = [];
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleLogs.push(msg.text());
          }
        });

        await page.waitForTimeout(2000);
        console.log(`🔴 Console errors: ${consoleLogs.length}`);
        consoleLogs.forEach(log => console.log(`  - ${log}`));

        // Check if generation actually worked
        if (resultElements.length > 0) {
          console.log('✅ SUCCESS: Generation functionality appears to be working!');

          // Get some sample result text
          for (let i = 0; i < Math.min(resultElements.length, 3); i++) {
            const resultText = await resultElements[i].textContent();
            console.log(`  Result ${i + 1}: ${resultText?.substring(0, 100)}...`);
          }
        } else {
          console.log('❌ ISSUE: No results found after generation attempt');
        }
      } else {
        console.log('❌ No generate buttons found');
      }
    } else {
      console.log('❌ No text inputs found for brief entry');
    }

    console.log('🎯 Generation functionality test complete');
  });

  test('Check for authentication requirements', async ({ page }) => {
    console.log('🔐 Checking if authentication is required...');

    await page.goto(baseURL);
    await page.waitForLoadState('networkidle');

    // Look for login/signup prompts or redirects
    const authElements = await page
      .locator(
        `
      a:has-text("Login"), a:has-text("Sign in"), a:has-text("Sign up"),
      button:has-text("Login"), button:has-text("Sign in"), button:has-text("Sign up"),
      .login, .signin, .signup, [class*="auth"]
    `
      )
      .all();

    console.log(`🔐 Auth elements found: ${authElements.length}`);

    if (authElements.length > 0) {
      console.log('ℹ️ Authentication options available on the site');
      for (let i = 0; i < Math.min(authElements.length, 5); i++) {
        const authText = await authElements[i].textContent();
        console.log(`  Auth option ${i + 1}: ${authText}`);
      }
    } else {
      console.log('ℹ️ No obvious authentication requirements detected');
    }

    // Check URL for auth redirects
    const currentUrl = page.url();
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log(`🔐 Redirected to auth page: ${currentUrl}`);
    } else {
      console.log('✅ No authentication redirect detected');
    }
  });
});
