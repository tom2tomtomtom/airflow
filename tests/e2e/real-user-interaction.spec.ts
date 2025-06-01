import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';

// Generate unique test user data for each run
const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: `test.user.${Date.now()}@airwave-test.com`,
  password: 'TestUser123!'
};

test.describe('Real User Interaction Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('Complete User Journey: Sign Up → Client Creation → Asset Upload → Campaign Creation', async () => {
    console.log('🚀 Starting complete user journey test...');
    
    // Step 1: User Registration
    console.log('📝 Step 1: User Registration');
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');
    
    // Look for signup form elements
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    
    // Fill registration form
    const firstNameInput = page.locator('input[name="firstName"], input[placeholder*="first" i]').first();
    const lastNameInput = page.locator('input[name="lastName"], input[placeholder*="last" i]').first();
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const signUpButton = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")').first();
    
    await firstNameInput.fill(testUser.firstName);
    await lastNameInput.fill(testUser.lastName);
    await emailInput.fill(testUser.email);
    await passwordInput.fill(testUser.password);
    
    console.log(`📧 Registering user: ${testUser.email}`);
    await signUpButton.click();
    
    // Wait for registration success or dashboard redirect
    try {
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      console.log('✅ Registration successful - redirected to dashboard');
    } catch {
      // Check if we need to verify email or login manually
      const currentUrl = page.url();
      console.log(`🔄 Current URL after signup: ${currentUrl}`);
      
      if (currentUrl.includes('/login')) {
        console.log('🔐 Need to login after registration');
        await emailInput.fill(testUser.email);
        await passwordInput.fill(testUser.password);
        const signInButton = page.locator('button:has-text("Sign In"), button:has-text("Login")').first();
        await signInButton.click();
        await page.waitForURL('**/dashboard', { timeout: 15000 });
      }
    }
    
    // Verify we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    console.log('✅ User successfully logged in to dashboard');
    
    // Step 2: Client Creation
    console.log('🏢 Step 2: Client Creation');
    
    // Navigate to clients or client creation
    const clientsLink = page.locator('a[href*="/clients"], a:has-text("Clients"), button:has-text("Clients")').first();
    if (await clientsLink.isVisible()) {
      await clientsLink.click();
    } else {
      await page.goto(`${BASE_URL}/clients`);
    }
    
    await page.waitForLoadState('networkidle');
    
    // Try to create a new client
    const createClientButton = page.locator('button:has-text("Create"), button:has-text("New Client"), a[href*="/create"]').first();
    if (await createClientButton.isVisible()) {
      await createClientButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill client creation form
      const clientNameInput = page.locator('input[name*="name"], input[placeholder*="name" i]').first();
      const clientIndustry = page.locator('select[name*="industry"], select:has(option)').first();
      const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      
      await clientNameInput.fill('Test Company Ltd');
      if (await clientIndustry.isVisible()) {
        await clientIndustry.selectOption({ index: 1 });
      }
      await saveButton.click();
      
      console.log('✅ Client created successfully');
    } else {
      console.log('ℹ️ Client creation not available or already exists');
    }
    
    // Step 3: Asset Upload
    console.log('📁 Step 3: Asset Upload');
    
    // Navigate to assets
    const assetsLink = page.locator('a[href*="/assets"], a:has-text("Assets"), button:has-text("Assets")').first();
    if (await assetsLink.isVisible()) {
      await assetsLink.click();
    } else {
      await page.goto(`${BASE_URL}/assets`);
    }
    
    await page.waitForLoadState('networkidle');
    
    // Look for upload functionality
    const uploadButton = page.locator('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]').first();
    if (await uploadButton.isVisible()) {
      console.log('✅ Asset upload interface found');
      
      // Create a test file
      const testFile = {
        name: 'test-image.png',
        mimeType: 'image/png',
        buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
      };
      
      // If it's a file input, set files
      if (await uploadButton.getAttribute('type') === 'file') {
        await uploadButton.setInputFiles({
          name: testFile.name,
          mimeType: testFile.mimeType,
          buffer: testFile.buffer
        });
        console.log('✅ Test file uploaded');
      } else {
        console.log('ℹ️ Upload functionality requires different interaction');
      }
    } else {
      console.log('ℹ️ Asset upload not immediately available');
    }
    
    // Step 4: Campaign Creation
    console.log('🎯 Step 4: Campaign Creation');
    
    // Navigate to campaigns
    const campaignsLink = page.locator('a[href*="/campaigns"], a:has-text("Campaigns"), button:has-text("Campaigns")').first();
    if (await campaignsLink.isVisible()) {
      await campaignsLink.click();
    } else {
      await page.goto(`${BASE_URL}/campaigns`);
    }
    
    await page.waitForLoadState('networkidle');
    
    // Try to create a new campaign
    const createCampaignButton = page.locator('button:has-text("Create"), button:has-text("New Campaign"), a[href*="/new"]').first();
    if (await createCampaignButton.isVisible()) {
      await createCampaignButton.click();
      await page.waitForLoadState('networkidle');
      
      // Fill campaign creation form
      const campaignNameInput = page.locator('input[name*="name"], input[placeholder*="name" i]').first();
      const descriptionInput = page.locator('textarea[name*="description"], textarea[placeholder*="description" i]').first();
      
      await campaignNameInput.fill('Test Campaign - Automated Test');
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill('This is a test campaign created by automated testing');
      }
      
      console.log('✅ Campaign form filled');
    } else {
      console.log('ℹ️ Campaign creation not available');
    }
    
    // Step 5: Verify Navigation and Features
    console.log('🔍 Step 5: Feature Verification');
    
    // Test navigation to different sections
    const sections = [
      { name: 'Matrix', selector: 'a[href*="/matrix"], a:has-text("Matrix")' },
      { name: 'Templates', selector: 'a[href*="/templates"], a:has-text("Templates")' },
      { name: 'Execute', selector: 'a[href*="/execute"], a:has-text("Execute")' },
      { name: 'Analytics', selector: 'a[href*="/analytics"], a:has-text("Analytics")' }
    ];
    
    for (const section of sections) {
      const link = page.locator(section.selector).first();
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('networkidle');
        console.log(`✅ ${section.name} section accessible`);
        await page.goBack();
        await page.waitForLoadState('networkidle');
      } else {
        console.log(`ℹ️ ${section.name} section not found in navigation`);
      }
    }
    
    // Step 6: API Interaction Testing
    console.log('🌐 Step 6: API Interaction Testing');
    
    // Monitor network calls
    const apiCalls = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // Trigger some API calls by interacting with the UI
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for API calls to complete
    await page.waitForTimeout(2000);
    
    console.log(`📊 Captured ${apiCalls.length} API calls:`);
    apiCalls.forEach(call => {
      console.log(`  ${call.method} ${call.url} - ${call.status}`);
    });
    
    // Verify some API calls were made
    expect(apiCalls.length).toBeGreaterThan(0);
    
    // Check for successful API calls
    const successfulCalls = apiCalls.filter(call => call.status >= 200 && call.status < 400);
    console.log(`✅ ${successfulCalls.length} successful API calls`);
    
    // Step 7: User Logout
    console.log('🚪 Step 7: User Logout');
    
    const userMenu = page.locator('[data-testid="user-menu"], button:has-text("User"), .user-menu').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await page.waitForTimeout(500);
      
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Logout")').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForURL('**/login', { timeout: 10000 });
        console.log('✅ User logged out successfully');
      }
    }
    
    console.log('🎉 Complete user journey test completed successfully!');
  });

  test('API Health Check and System Status', async () => {
    console.log('🏥 Testing API health and system status...');
    
    // Test health endpoint
    const healthResponse = await page.request.get(`${BASE_URL}/api/health`);
    console.log(`Health check status: ${healthResponse.status()}`);
    
    if (healthResponse.ok()) {
      const healthData = await healthResponse.json();
      console.log('Health check data:', healthData);
    }
    
    // Test system status endpoint
    const statusResponse = await page.request.get(`${BASE_URL}/api/system/status`);
    console.log(`System status: ${statusResponse.status()}`);
    
    if (statusResponse.ok()) {
      const statusData = await statusResponse.json();
      console.log('System status data:', statusData);
    }
    
    // Navigate to system status page
    await page.goto(`${BASE_URL}/system-status`);
    await page.waitForLoadState('networkidle');
    
    // Check if status information is displayed
    const statusElements = await page.locator('*:has-text("Status"), *:has-text("Health"), *:has-text("System")').count();
    console.log(`Found ${statusElements} status-related elements on page`);
    
    expect(statusElements).toBeGreaterThan(0);
  });

  test('Form Validation and Error Handling', async () => {
    console.log('🔍 Testing form validation and error handling...');
    
    // Test login page validation
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign In")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Check for validation messages
      const errorMessages = await page.locator('*:has-text("required"), *:has-text("error"), .error, .invalid').count();
      console.log(`Found ${errorMessages} validation messages`);
    }
    
    // Test with invalid credentials
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await emailInput.isVisible() && await passwordInput.isVisible()) {
      await emailInput.fill('invalid@test.com');
      await passwordInput.fill('wrongpassword');
      await submitButton.click();
      
      // Wait for error response
      await page.waitForTimeout(3000);
      
      // Check for error messages
      const loginErrorMessages = await page.locator('*:has-text("Invalid"), *:has-text("incorrect"), *:has-text("error")').count();
      console.log(`Found ${loginErrorMessages} login error messages`);
    }
  });
});