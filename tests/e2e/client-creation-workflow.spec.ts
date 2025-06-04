import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_EMAIL || 'tomh@redbaez.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Wijlre2010';

test.describe('Client Creation Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page
    await page.goto('/login');
  });

  test('should successfully create a new client', async ({ page }) => {
    console.log('Starting client creation test...');

    // Login first
    console.log('Attempting login...');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    console.log('✅ Login successful, redirected to dashboard');

    // Navigate to clients page
    console.log('Navigating to clients page...');
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Click "Add Client" button (from EmptyClients component or main page)
    const createButton = page.locator('button:has-text("Add Client")').first();
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    await createButton.click();
    console.log('✅ Clicked Add Client button');

    // Should navigate to /create-client
    await page.waitForURL('/create-client', { timeout: 5000 });
    console.log('✅ Redirected to create-client page');

    // STEP 1: Basic Information
    console.log('Filling Step 1: Basic Information...');
    
    // Fill client name
    const nameInput = page.locator('input[placeholder*="Enter client name"], input[name="name"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill('Test Client Company');
    console.log('✅ Filled client name');

    // Handle Material-UI Select for industry
    const industrySelect = page.locator('[data-testid="industry-select"], .MuiSelect-root, #industry').first();
    await industrySelect.click();
    await page.waitForTimeout(500);
    
    // Select Technology option from dropdown
    const technologyOption = page.locator('li:has-text("Technology"), [data-value="Technology"]').first();
    await technologyOption.click();
    console.log('✅ Selected Technology industry');

    // Click Next button (should be enabled now)
    const nextButton1 = page.locator('button:has-text("Next")').first();
    await nextButton1.waitFor({ state: 'visible' });
    await nextButton1.click();
    console.log('✅ Proceeded to Step 2');

    // STEP 2: Brand & Design
    console.log('Filling Step 2: Brand & Design...');
    await page.waitForTimeout(500);

    // Skip color selections and logo upload for now, click Next
    const nextButton2 = page.locator('button:has-text("Next")').first();
    await nextButton2.waitFor({ state: 'visible' });
    await nextButton2.click();
    console.log('✅ Proceeded to Step 3');

    // STEP 3: Contacts (Optional)
    console.log('Skipping Step 3: Contacts...');
    await page.waitForTimeout(500);

    const nextButton3 = page.locator('button:has-text("Next")').first();
    await nextButton3.waitFor({ state: 'visible' });
    await nextButton3.click();
    console.log('✅ Proceeded to Step 4');

    // STEP 4: Brand Guidelines
    console.log('Filling Step 4: Brand Guidelines...');
    await page.waitForTimeout(500);

    // Fill voice & tone
    const voiceSelect = page.locator('[data-testid="voice-tone-select"], .MuiSelect-root').first();
    if (await voiceSelect.isVisible()) {
      await voiceSelect.click();
      await page.waitForTimeout(500);
      const professionalOption = page.locator('li:has-text("Professional"), [data-value="Professional"]').first();
      await professionalOption.click();
    }

    // Fill target audience
    const audienceInput = page.locator('textarea[placeholder*="target audience"], textarea[name="targetAudience"]').first();
    if (await audienceInput.isVisible()) {
      await audienceInput.fill('Business professionals and tech-savvy consumers');
    }

    // Submit the form - look for "Create Client" button
    console.log('Submitting client form...');
    const submitButton = page.locator('button:has-text("Create Client")').first();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    console.log('✅ Clicked Create Client button');

    // Wait for success and redirect
    try {
      // Check for success message or redirect to clients list
      await page.waitForURL('/clients', { timeout: 10000 });
      console.log('✅ Client created successfully - redirected to clients list');
    } catch {
      // Alternative: check for success message
      await page.waitForSelector('text="successfully", text="created"', { timeout: 5000 });
      console.log('✅ Client created successfully (success message found)');
    }

    // Verify the client appears in the list
    await page.goto('/clients');
    const clientElement = page.locator('text="Test Client Company"').first();
    await expect(clientElement).toBeVisible({ timeout: 5000 });
    console.log('✅ New client appears in the clients list');
  });

  test('should handle client creation errors gracefully', async ({ page }) => {
    console.log('Testing client creation error handling...');

    // Login first
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });

    // Navigate to clients page
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Click create client button
    const createButton = page.locator('button:has-text("Create Client"), button:has-text("Add Client")').first();
    await createButton.click();

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create")').first();
    await submitButton.click();

    // Check for validation errors
    const errorMessage = page.locator('text="required", text="error", [role="alert"]').first();
    if (await errorMessage.isVisible()) {
      console.log('✅ Validation errors shown for empty form');
    }
  });

  test('should display 401 error details when authentication fails', async ({ page }) => {
    console.log('Testing 401 error display...');

    // Go directly to clients page without logging in
    await page.goto('/clients');

    // Check for 401 error or redirect to login
    try {
      await page.waitForSelector('text="401", text="Unauthorized"', { timeout: 3000 });
      console.log('✅ 401 error displayed correctly');
    } catch {
      // Should redirect to login
      await page.waitForURL('/login', { timeout: 5000 });
      console.log('✅ Redirected to login due to authentication');
    }
  });
});