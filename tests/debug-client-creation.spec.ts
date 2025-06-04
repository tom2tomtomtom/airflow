import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'testpassword';

test('Debug client creation form', async ({ page }) => {
  // Login first
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 10000 });

  // Navigate to clients page
  await page.goto('/clients');
  await page.waitForLoadState('networkidle');

  // Take screenshot of clients page
  await page.screenshot({ path: 'debug-clients-page.png', fullPage: true });

  // Click create client button
  const createButton = page.locator('button:has-text("Create Client"), button:has-text("Add Client"), button:has-text("New Client")').first();
  await createButton.click();
  
  // Check current URL
  console.log('Current URL after clicking Add Client:', page.url());
  
  // Wait for navigation or modal
  await page.waitForTimeout(2000);
  
  // Check URL again
  console.log('URL after waiting:', page.url());
  
  // Take screenshot of form
  await page.screenshot({ path: 'debug-create-form.png', fullPage: true });

  // Debug: Print all button texts on the page
  const buttons = page.locator('button');
  const buttonCount = await buttons.count();
  console.log(`Found ${buttonCount} buttons:`);
  
  for (let i = 0; i < buttonCount; i++) {
    const buttonText = await buttons.nth(i).textContent();
    const buttonType = await buttons.nth(i).getAttribute('type');
    const buttonDisabled = await buttons.nth(i).isDisabled();
    console.log(`Button ${i}: "${buttonText}" (type: ${buttonType}, disabled: ${buttonDisabled})`);
  }

  // Debug: Print all input fields
  const inputs = page.locator('input');
  const inputCount = await inputs.count();
  console.log(`Found ${inputCount} inputs:`);
  
  for (let i = 0; i < inputCount; i++) {
    const inputName = await inputs.nth(i).getAttribute('name');
    const inputType = await inputs.nth(i).getAttribute('type');
    const inputPlaceholder = await inputs.nth(i).getAttribute('placeholder');
    const inputValue = await inputs.nth(i).inputValue();
    console.log(`Input ${i}: name="${inputName}", type="${inputType}", placeholder="${inputPlaceholder}", value="${inputValue}"`);
  }

  // Fill in minimal required fields
  await page.fill('input[name="name"]', 'Test Client Company');
  
  // Try to find and select industry
  const industrySelect = page.locator('select[name="industry"], div[role="button"]:has-text("Industry")');
  if (await industrySelect.count() > 0) {
    await industrySelect.click();
    // Wait for dropdown and select first option
    await page.waitForTimeout(1000);
    const firstOption = page.locator('li[role="option"], [role="menuitem"]').first();
    if (await firstOption.count() > 0) {
      await firstOption.click();
    }
  }

  // Take screenshot after filling form
  await page.screenshot({ path: 'debug-form-filled.png', fullPage: true });

  // Check for Next button (since it's a stepper)
  const nextButton = page.locator('button:has-text("Next")');
  if (await nextButton.count() > 0) {
    console.log('Found Next button');
    await nextButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'debug-step2.png', fullPage: true });
  }
});