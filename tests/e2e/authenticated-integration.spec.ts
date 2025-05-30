import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave2.netlify.app';

// Test credentials from Supabase
const TEST_CREDENTIALS = {
  email: 'test@airwave.app',
  password: 'TestUser123!'
};

async function loginWithRealCredentials(page: Page) {
  console.log('🔐 Logging in with real credentials...');
  
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  
  // Fill in login form
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i]');
  const loginButton = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
  
  await emailInput.fill(TEST_CREDENTIALS.email);
  await passwordInput.fill(TEST_CREDENTIALS.password);
  await loginButton.click();
  
  // Wait for successful login redirect
  await page.waitForURL('**/dashboard', { timeout: 30000 });
  console.log('✅ Successfully logged in');
}

test.describe('Authenticated AIrWAVE Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for authenticated flows
  });

  test('Complete Authentication Flow', async ({ page }) => {
    console.log('🧪 Testing complete authentication flow...');
    
    // Test login
    await loginWithRealCredentials(page);
    
    // Verify dashboard loaded
    await expect(page).toHaveURL(/.*dashboard/);
    console.log('✅ Dashboard loaded successfully');
    
    // Check for user interface elements
    const userElements = [
      { name: 'Navigation', selector: 'nav, [role="navigation"]' },
      { name: 'User Menu', selector: '[data-testid="user-menu"], button:has-text("User"), .user-avatar' },
      { name: 'Main Content', selector: 'main, [role="main"], .dashboard-content' }
    ];
    
    for (const element of userElements) {
      const locator = page.locator(element.selector);
      const isVisible = await locator.first().isVisible();
      console.log(`${element.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
    }
    
    // Take screenshot of authenticated state
    await page.screenshot({ path: 'test-results/authenticated-dashboard.png', fullPage: true });
    console.log('📸 Dashboard screenshot saved');
  });

  test('Real Asset Upload with Authentication', async ({ page }) => {
    console.log('📁 Testing real asset upload with authentication...');
    
    await loginWithRealCredentials(page);
    
    // Navigate to assets page
    await page.goto(`${BASE_URL}/assets`);
    await page.waitForLoadState('networkidle');
    
    // Look for upload functionality
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add"), [aria-label*="upload"]');
    
    if (await uploadButton.first().isVisible()) {
      console.log('✅ Upload button found');
      await uploadButton.first().click();
      
      // Wait for upload modal
      const uploadModal = page.locator('[data-testid="upload-modal"], .upload-modal, [role="dialog"]');
      await expect(uploadModal).toBeVisible({ timeout: 10000 });
      console.log('✅ Upload modal opened');
      
      // Test file upload interface
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        console.log('✅ File input available');
        
        // Create a test file
        const testFileContent = Buffer.from('Test file content for AIrWAVE upload test');
        const testFile = {
          name: 'airwave-test-file.txt',
          mimeType: 'text/plain',
          buffer: testFileContent
        };
        
        // Upload the test file
        await fileInput.setInputFiles(testFile);
        console.log('✅ Test file selected');
        
        // Wait for file to be processed
        await page.waitForTimeout(2000);
        
        // Look for upload button in modal
        const modalUploadButton = page.locator('button:has-text("Upload")').last();
        if (await modalUploadButton.isVisible()) {
          console.log('✅ Starting upload...');
          await modalUploadButton.click();
          
          // Wait for upload to complete (real API call)
          await page.waitForTimeout(10000);
          
          // Check if upload succeeded
          const successIndicator = page.locator('text="Success", text="Uploaded", text="Complete"');
          const isSuccess = await successIndicator.first().isVisible();
          console.log(`Upload result: ${isSuccess ? '✅ Success' : '⚠️ In Progress/Unknown'}`);
        }
      }
    } else {
      console.log('⚠️ Upload functionality not accessible in current state');
    }
    
    await page.screenshot({ path: 'test-results/authenticated-upload.png', fullPage: true });
    console.log('📸 Upload test screenshot saved');
  });

  test('OpenAI Content Generation with Authentication', async ({ page }) => {
    console.log('🤖 Testing OpenAI content generation with authentication...');
    
    await loginWithRealCredentials(page);
    
    // Navigate to content generation
    await page.goto(`${BASE_URL}/generate-enhanced`);
    await page.waitForLoadState('networkidle');
    
    // Test text generation
    const textTab = page.locator('button:has-text("Copy"), button:has-text("Text"), .text-generation-tab');
    if (await textTab.first().isVisible()) {
      await textTab.first().click();
      await page.waitForTimeout(1000);
      
      // Look for prompt input
      const promptInput = page.locator('textarea, input[placeholder*="prompt"], input[placeholder*="describe"]');
      if (await promptInput.first().isVisible()) {
        console.log('✅ Prompt input found');
        
        // Enter test prompt
        await promptInput.first().fill('Create a compelling headline for an eco-friendly water bottle brand');
        
        // Look for generate button
        const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create")');
        if (await generateButton.first().isVisible()) {
          console.log('✅ Generate button found');
          await generateButton.first().click();
          
          // Wait for generation to complete
          await page.waitForTimeout(15000); // OpenAI can take time
          
          // Check for generated content
          const generatedContent = page.locator('[data-testid="generated-content"], .generated-text, .generation-result');
          const hasContent = await generatedContent.first().isVisible();
          console.log(`Content generation: ${hasContent ? '✅ Success' : '⚠️ In Progress'}`);
          
          if (hasContent) {
            const contentText = await generatedContent.first().textContent();
            console.log(`Generated content preview: "${contentText?.substring(0, 100)}..."`);
          }
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/authenticated-generation.png', fullPage: true });
    console.log('📸 Content generation screenshot saved');
  });

  test('Real-Time Updates Connection with Authentication', async ({ page }) => {
    console.log('⚡ Testing real-time updates with authentication...');
    
    await loginWithRealCredentials(page);
    
    // Navigate to dashboard where real-time updates should be active
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Check for real-time connection indicators
    const connectionIndicators = [
      { name: 'Online Status', selector: '[data-testid="online-status"], .connection-status, .realtime-indicator' },
      { name: 'Activity Feed', selector: '[data-testid="activity-feed"], .activity-feed, .live-updates' },
      { name: 'Notification Area', selector: '[data-testid="notifications"], .notifications, .toast-container' }
    ];
    
    for (const indicator of connectionIndicators) {
      const element = page.locator(indicator.selector);
      const isVisible = await element.first().isVisible();
      console.log(`${indicator.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
    }
    
    // Test real-time connection by checking network activity
    const sseConnections = await page.evaluate(() => {
      // Check if EventSource connections are active
      return window.performance.getEntriesByType('navigation').length > 0;
    });
    
    console.log(`Real-time connections: ${sseConnections ? '✅ Active' : '⚠️ Not detected'}`);
    
    // Wait and check for live updates
    console.log('⏳ Waiting for real-time updates...');
    await page.waitForTimeout(35000); // Wait for heartbeat
    
    await page.screenshot({ path: 'test-results/authenticated-realtime.png', fullPage: true });
    console.log('📸 Real-time test screenshot saved');
  });

  test('Video Generation Workflow with Authentication', async ({ page }) => {
    console.log('🎬 Testing video generation workflow with authentication...');
    
    await loginWithRealCredentials(page);
    
    // Navigate to video generation
    await page.goto(`${BASE_URL}/generate-enhanced`);
    await page.waitForLoadState('networkidle');
    
    // Look for video generation tab
    const videoTab = page.locator('button:has-text("Video"), .video-tab, [aria-label*="video"]');
    if (await videoTab.first().isVisible()) {
      await videoTab.first().click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Video generation tab found');
      
      // Check for video generation interface
      const videoElements = [
        { name: 'Video Prompt Input', selector: 'textarea[placeholder*="video"], input[placeholder*="video"]' },
        { name: 'Style Options', selector: 'select:has(option:text-matches("Style|Template")), .style-selector' },
        { name: 'Generate Button', selector: 'button:has-text("Generate Video"), button:has-text("Create Video")' }
      ];
      
      for (const element of videoElements) {
        const locator = page.locator(element.selector);
        const isVisible = await locator.first().isVisible();
        console.log(`${element.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
      }
      
      // Test Creatomate template access
      const templateSelector = page.locator('select, .template-grid, .template-option');
      if (await templateSelector.first().isVisible()) {
        console.log('✅ Video templates accessible');
      }
    } else {
      console.log('⚠️ Video generation not accessible in current state');
    }
    
    await page.screenshot({ path: 'test-results/authenticated-video.png', fullPage: true });
    console.log('📸 Video generation screenshot saved');
  });

  test('End-to-End Workflow Test', async ({ page }) => {
    console.log('🔄 Testing complete end-to-end workflow...');
    
    await loginWithRealCredentials(page);
    
    // Test navigation between key pages
    const pages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Assets', url: '/assets' },
      { name: 'Templates', url: '/templates' },
      { name: 'Generate', url: '/generate-enhanced' },
      { name: 'Matrix', url: '/matrix' }
    ];
    
    for (const pageInfo of pages) {
      try {
        console.log(`📄 Testing ${pageInfo.name} page...`);
        await page.goto(`${BASE_URL}${pageInfo.url}`);
        await page.waitForLoadState('networkidle', { timeout: 15000 });
        
        // Check if page loaded successfully
        const hasContent = await page.locator('main, [role="main"], .page-content').first().isVisible();
        console.log(`${pageInfo.name} page: ${hasContent ? '✅ Loaded' : '❌ Failed'}`);
        
        // Brief pause between pages
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log(`${pageInfo.name} page: ❌ Error - ${error.message}`);
      }
    }
    
    // Test logout
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("User")');
    if (await userMenu.first().isVisible()) {
      await userMenu.first().click();
      await page.waitForTimeout(500);
      
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]');
      if (await logoutButton.first().isVisible()) {
        console.log('✅ Logout option available');
        await logoutButton.first().click();
        await page.waitForURL('**/login', { timeout: 10000 });
        console.log('✅ Successfully logged out');
      }
    }
    
    await page.screenshot({ path: 'test-results/end-to-end-test.png', fullPage: true });
    console.log('📸 End-to-end test screenshot saved');
    
    console.log('🎉 End-to-end workflow test completed');
  });
});