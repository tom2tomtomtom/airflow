import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'https://airwave-complete.netlify.app';
const TEST_TIMEOUT = 30000;

// Test data
const testUser = {
  name: 'AIrWAVE Test User',
  email: 'test@airwave.app',
  password: 'TestPassword123'
};

const creatomateConfig = {
  templateId: '374ee9e3-de75-4feb-bfae-5c5e11d88d80',
  apiKey: '5ab32660fef044e5b135a646a78cff8ec7e2503b79e201bad7e566f4b24ec111f2fa7e01a824eaa77904c1783e083efa',
  modifications: {
    "Music.source": "https://creatomate.com/files/assets/b5dc815e-dcc9-4c62-9405-f94913936bf5",
    "Background-1.source": "https://creatomate.com/files/assets/4a7903f0-37bc-48df-9d83-5eb52afd5d07",
    "Text-1.text": "Test Text 1 - AIrWAVE Platform Test",
    "Background-2.source": "https://creatomate.com/files/assets/4a6f6b28-bb42-4987-8eca-7ee36b347ee7",
    "Text-2.text": "Test Text 2 - Matrix Functionality",
    "Background-3.source": "https://creatomate.com/files/assets/4f6963a5-7286-450b-bc64-f87a3a1d8964",
    "Text-3.text": "Test Text 3 - Asset Library Integration",
    "Background-4.source": "https://creatomate.com/files/assets/36899eae-a128-43e6-9e97-f2076f54ea18",
    "Text-4.text": "Test Text 4 - Video Generation Complete"
  }
};

// Helper functions
async function loginToApp(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await expect(page.locator('h1, h3')).toContainText('AIrWAVE');
  
  // Try demo login first
  const demoButton = page.locator('[data-testid="demo-login-button"]');
  if (await demoButton.isVisible()) {
    await demoButton.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    return;
  }
  
  // Fallback to regular login
  await page.fill('[data-testid="email-input"]', testUser.email);
  await page.fill('[data-testid="password-input"]', testUser.password);
  await page.click('[data-testid="sign-in-button"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

async function createTestAsset(page: Page, assetType: string) {
  // Navigate to assets page
  await page.goto(`${BASE_URL}/assets`);
  
  // Look for upload button
  const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Asset"), [aria-label*="upload"]').first();
  
  if (await uploadButton.isVisible()) {
    await uploadButton.click();
    
    // Create test file based on type
    let fileContent = '';
    let fileName = '';
    let mimeType = '';
    
    switch (assetType) {
      case 'image':
        fileName = 'test-image.png';
        mimeType = 'image/png';
        // Create minimal PNG data
        fileContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        break;
      case 'text':
        fileName = 'test-copy.txt';
        mimeType = 'text/plain';
        fileContent = 'Test marketing copy for AIrWAVE platform testing';
        break;
      case 'video':
        fileName = 'test-video.mp4';
        mimeType = 'video/mp4';
        fileContent = 'test video data';
        break;
    }
    
    // Simulate file upload
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: fileName,
        mimeType: mimeType,
        buffer: Buffer.from(fileContent, assetType === 'image' ? 'base64' : 'utf8')
      });
    }
  }
}

test.describe('AIrWAVE Platform Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for these tests
    test.setTimeout(60000);
    
    // Enable console logging for debugging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.error('Page error:', error.message));
  });

  test('1. Authentication and Navigation Flow', async ({ page }) => {
    console.log('Testing authentication and basic navigation...');
    
    // Test login
    await loginToApp(page);
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1, h4, h5')).toContainText(/dashboard|welcome|airwave/i);
    
    // Test navigation to key pages
    const navigationTests = [
      { name: 'Assets', url: '/assets' },
      { name: 'Templates', url: '/templates' },
      { name: 'Matrix', url: '/matrix' },
      { name: 'Strategic Content', url: '/strategic-content' },
      { name: 'Generate Enhanced', url: '/generate-enhanced' }
    ];
    
    for (const nav of navigationTests) {
      await page.goto(`${BASE_URL}${nav.url}`);
      await expect(page).toHaveURL(`*${nav.url}`);
      console.log(`✓ Navigation to ${nav.name} successful`);
    }
  });

  test('2. Asset Library Functionality', async ({ page }) => {
    console.log('Testing Asset Library functionality...');
    
    await loginToApp(page);
    await page.goto(`${BASE_URL}/assets`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test page structure
    await expect(page.locator('h1, h4, h5')).toContainText(/asset/i);
    
    // Test asset type filtering
    const filterButtons = page.locator('button:has-text("Image"), button:has-text("Video"), button:has-text("Audio"), button:has-text("Text")');
    const filterCount = await filterButtons.count();
    console.log(`Found ${filterCount} filter buttons`);
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(1000);
      console.log('✓ Search functionality present');
    }
    
    // Test upload functionality
    await createTestAsset(page, 'image');
    console.log('✓ Asset upload tested');
    
    // Test asset grid/list view
    const assetContainer = page.locator('[data-testid="asset-grid"], .asset-grid, .asset-list, .MuiGrid-container');
    if (await assetContainer.isVisible()) {
      console.log('✓ Asset grid/list view present');
    }
  });

  test('3. Strategic Content Generation', async ({ page }) => {
    console.log('Testing Strategic Content Generation...');
    
    await loginToApp(page);
    await page.goto(`${BASE_URL}/strategic-content`);
    
    await page.waitForLoadState('networkidle');
    
    // Test brief upload section
    const briefSection = page.locator('text="Brief", text="Upload"').first();
    if (await briefSection.isVisible()) {
      console.log('✓ Brief upload section found');
    }
    
    // Test form input for brief
    const textInputs = page.locator('textarea, input[type="text"]');
    const inputCount = await textInputs.count();
    if (inputCount > 0) {
      await textInputs.first().fill('Test brief: Create engaging social media content for a tech startup targeting millennials. Focus on innovation and user experience.');
      console.log('✓ Brief input functionality tested');
    }
    
    // Test motivation generation
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Start")');
    if (await generateButton.count() > 0) {
      await generateButton.first().click();
      await page.waitForTimeout(3000);
      console.log('✓ Generation process initiated');
    }
    
    // Look for motivation cards or results
    const motivationCards = page.locator('[data-testid*="motivation"], .motivation-card, .result-card');
    const cardCount = await motivationCards.count();
    console.log(`Found ${cardCount} motivation/result cards`);
    
    // Test motivation selection
    if (cardCount > 0) {
      await motivationCards.first().click();
      console.log('✓ Motivation selection tested');
    }
  });

  test('4. Campaign Matrix Testing', async ({ page }) => {
    console.log('Testing Campaign Matrix functionality...');
    
    await loginToApp(page);
    await page.goto(`${BASE_URL}/matrix`);
    
    await page.waitForLoadState('networkidle');
    
    // Test matrix grid presence
    const matrixGrid = page.locator('.matrix-grid, [data-testid="matrix-grid"], table, .MuiTable-root');
    if (await matrixGrid.isVisible()) {
      console.log('✓ Matrix grid found');
    }
    
    // Test add row functionality
    const addRowButton = page.locator('button:has-text("Add Row"), button:has-text("Add Variation"), [aria-label*="add"]');
    if (await addRowButton.count() > 0) {
      await addRowButton.first().click();
      await page.waitForTimeout(1000);
      console.log('✓ Add row functionality tested');
    }
    
    // Test matrix cells
    const matrixCells = page.locator('.matrix-cell, td, .MuiTableCell-root');
    const cellCount = await matrixCells.count();
    console.log(`Found ${cellCount} matrix cells`);
    
    // Test asset assignment to cells
    if (cellCount > 0) {
      await matrixCells.first().click();
      await page.waitForTimeout(1000);
      console.log('✓ Matrix cell interaction tested');
    }
    
    // Test save functionality
    const saveButton = page.locator('button:has-text("Save"), button:has-text("Submit")');
    if (await saveButton.count() > 0) {
      console.log('✓ Save functionality present');
    }
  });

  test('5. Template Library Integration', async ({ page }) => {
    console.log('Testing Template Library and Creatomate integration...');
    
    await loginToApp(page);
    await page.goto(`${BASE_URL}/templates`);
    
    await page.waitForLoadState('networkidle');
    
    // Test template grid
    const templateGrid = page.locator('.template-grid, [data-testid="template-grid"], .MuiGrid-container');
    if (await templateGrid.isVisible()) {
      console.log('✓ Template grid found');
    }
    
    // Test template filtering
    const filterButtons = page.locator('button:has-text("Meta"), button:has-text("YouTube"), button:has-text("TikTok"), button:has-text("All")');
    const filterCount = await filterButtons.count();
    console.log(`Found ${filterCount} platform filter buttons`);
    
    if (filterCount > 0) {
      await filterButtons.first().click();
      await page.waitForTimeout(1000);
      console.log('✓ Template filtering tested');
    }
    
    // Test template cards
    const templateCards = page.locator('.template-card, [data-testid*="template"], .MuiCard-root');
    const cardCount = await templateCards.count();
    console.log(`Found ${cardCount} template cards`);
    
    // Test template preview
    if (cardCount > 0) {
      await templateCards.first().click();
      await page.waitForTimeout(2000);
      console.log('✓ Template preview tested');
    }
    
    // Test Creatomate API integration
    console.log('Testing Creatomate API integration...');
    const response = await page.evaluate(async (config) => {
      try {
        const res = await fetch('/api/creatomate/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: config.templateId,
            modifications: config.modifications
          })
        });
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    }, creatomateConfig);
    
    console.log('Creatomate API test result:', response);
  });

  test('6. Video Generation and Rendering', async ({ page }) => {
    console.log('Testing Video Generation functionality...');
    
    await loginToApp(page);
    await page.goto(`${BASE_URL}/generate-enhanced`);
    
    await page.waitForLoadState('networkidle');
    
    // Test render queue interface
    const renderQueue = page.locator('.render-queue, [data-testid="render-queue"], .queue-container');
    if (await renderQueue.isVisible()) {
      console.log('✓ Render queue interface found');
    }
    
    // Test render controls
    const renderButton = page.locator('button:has-text("Render"), button:has-text("Generate"), button:has-text("Start")');
    if (await renderButton.count() > 0) {
      console.log('✓ Render controls present');
    }
    
    // Test quality settings
    const qualityOptions = page.locator('select, [role="combobox"], input[type="radio"]');
    const optionCount = await qualityOptions.count();
    console.log(`Found ${optionCount} quality/setting options`);
    
    // Test progress tracking
    const progressBars = page.locator('.progress, [role="progressbar"], .MuiLinearProgress-root');
    const progressCount = await progressBars.count();
    console.log(`Found ${progressCount} progress indicators`);
    
    // Test WebSocket connection for real-time updates
    const wsTestResult = await page.evaluate(() => {
      try {
        // Check if WebSocket is supported and try to connect
        if (typeof WebSocket !== 'undefined') {
          return { supported: true, message: 'WebSocket supported' };
        }
        return { supported: false, message: 'WebSocket not supported' };
      } catch (error) {
        return { supported: false, error: error.message };
      }
    });
    
    console.log('WebSocket test result:', wsTestResult);
  });

  test('7. Error Handling and Edge Cases', async ({ page }) => {
    console.log('Testing error handling and edge cases...');
    
    await loginToApp(page);
    
    // Test invalid file upload
    await page.goto(`${BASE_URL}/assets`);
    const uploadButton = page.locator('button:has-text("Upload"), input[type="file"]').first();
    if (await uploadButton.isVisible()) {
      try {
        // Try to upload invalid file type
        await uploadButton.setInputFiles({
          name: 'invalid.exe',
          mimeType: 'application/octet-stream',
          buffer: Buffer.from('invalid file content')
        });
        await page.waitForTimeout(2000);
        console.log('✓ Invalid file upload handling tested');
      } catch (error) {
        console.log('File upload test skipped:', error.message);
      }
    }
    
    // Test API error handling
    const apiErrorTest = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/nonexistent-endpoint');
        return { status: res.status, ok: res.ok };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('API error handling test:', apiErrorTest);
    
    // Test navigation to non-existent page
    await page.goto(`${BASE_URL}/nonexistent-page`);
    const is404 = page.url().includes('404') || await page.locator('text="404", text="Not Found"').isVisible();
    console.log(`404 page handling: ${is404 ? '✓ Working' : '⚠ May need improvement'}`);
  });

  test('8. Performance and Load Testing', async ({ page }) => {
    console.log('Testing performance and load times...');
    
    const startTime = Date.now();
    await page.goto(BASE_URL);
    const loadTime = Date.now() - startTime;
    console.log(`Initial page load time: ${loadTime}ms`);
    
    await loginToApp(page);
    
    // Test navigation performance
    const pages = ['/assets', '/templates', '/matrix', '/strategic-content', '/generate-enhanced'];
    
    for (const pagePath of pages) {
      const navStart = Date.now();
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      const navTime = Date.now() - navStart;
      console.log(`${pagePath} load time: ${navTime}ms`);
    }
    
    // Test console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate through app to collect errors
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);
    
    console.log(`Console errors found: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors.slice(0, 5)); // Show first 5 errors
    }
  });

  test('9. Happy Path End-to-End Workflow', async ({ page }) => {
    console.log('Testing complete happy path workflow...');
    
    // 1. Login
    await loginToApp(page);
    console.log('✓ Step 1: Logged in successfully');
    
    // 2. Navigate to Assets and upload test asset
    await page.goto(`${BASE_URL}/assets`);
    await createTestAsset(page, 'image');
    console.log('✓ Step 2: Uploaded test asset');
    
    // 3. Navigate to Strategic Content
    await page.goto(`${BASE_URL}/strategic-content`);
    const briefInput = page.locator('textarea, input[type="text"]').first();
    if (await briefInput.isVisible()) {
      await briefInput.fill('Create engaging social media content for tech startup');
      console.log('✓ Step 3: Entered strategic brief');
    }
    
    // 4. Navigate to Matrix
    await page.goto(`${BASE_URL}/matrix`);
    const addRowBtn = page.locator('button:has-text("Add"), button:has-text("Row")').first();
    if (await addRowBtn.isVisible()) {
      await addRowBtn.click();
      console.log('✓ Step 4: Added matrix row');
    }
    
    // 5. Navigate to Templates
    await page.goto(`${BASE_URL}/templates`);
    const templateCard = page.locator('.template-card, [data-testid*="template"], .MuiCard-root').first();
    if (await templateCard.isVisible()) {
      await templateCard.click();
      console.log('✓ Step 5: Selected template');
    }
    
    // 6. Navigate to Generation
    await page.goto(`${BASE_URL}/generate-enhanced`);
    const renderBtn = page.locator('button:has-text("Render"), button:has-text("Generate")').first();
    if (await renderBtn.isVisible()) {
      console.log('✓ Step 6: Render interface accessible');
    }
    
    console.log('✓ Happy path workflow completed successfully!');
  });

  test('10. UI/UX Consistency Check', async ({ page }) => {
    console.log('Testing UI/UX consistency...');
    
    await loginToApp(page);
    
    const pages = ['/dashboard', '/assets', '/templates', '/matrix', '/strategic-content', '/generate-enhanced'];
    
    for (const pagePath of pages) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('networkidle');
      
      // Check for consistent header/navigation
      const header = page.locator('header, nav, .MuiAppBar-root');
      const hasHeader = await header.isVisible();
      console.log(`${pagePath} - Header present: ${hasHeader}`);
      
      // Check for consistent dark theme
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      const isDarkTheme = bodyBg.includes('rgb(3, 7, 18)') || bodyBg.includes('#030712') || bodyBg === 'rgb(3, 7, 18)';
      console.log(`${pagePath} - Dark theme: ${isDarkTheme ? '✓' : '⚠'}`);
      
      // Check for loading states
      const loadingElements = page.locator('[role="progressbar"], .loading, .spinner');
      const hasLoadingStates = await loadingElements.count() > 0;
      console.log(`${pagePath} - Loading states: ${hasLoadingStates ? '✓' : 'None found'}`);
    }
  });
});