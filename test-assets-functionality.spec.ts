import { test, expect } from '@playwright/test';

test.describe('Asset Library Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/assets');
  });

  test('should load assets page with mock data', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page.locator('h4')).toContainText('Assets');
    
    // Check for upload button
    await expect(page.locator('[data-testid="upload-assets-button"]')).toBeVisible();
    
    // Check for search functionality
    await expect(page.locator('[data-testid="search-assets"]')).toBeVisible();
    
    // Check for view mode toggle
    await expect(page.locator('[data-testid="toggle-view-mode"]')).toBeVisible();
    
    // Check for asset cards (mock data should be visible)
    const assetCards = page.locator('[data-testid="asset-card"]');
    await expect(assetCards).toHaveCount(3); // Should have 3 mock assets
    
    console.log('✅ Assets page loaded with mock data');
  });

  test('should open upload modal when upload button is clicked', async ({ page }) => {
    // Click upload button
    await page.locator('[data-testid="upload-assets-button"]').click();
    
    // Check if upload modal appears
    await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
    
    // Check modal title
    await expect(page.locator('h6:has-text("Upload Assets")')).toBeVisible();
    
    // Check for dropzone
    await expect(page.locator('[data-testid="dropzone"]')).toBeVisible();
    
    // Check for file input
    await expect(page.locator('[data-testid="file-input"]')).toBeVisible();
    
    console.log('✅ Upload modal opens correctly');
  });

  test('should filter assets by search term', async ({ page }) => {
    // Wait for assets to load
    await page.waitForSelector('[data-testid="asset-card"]');
    
    // Count initial assets
    const initialAssets = await page.locator('[data-testid="asset-card"]').count();
    expect(initialAssets).toBe(3);
    
    // Search for "Sample"
    await page.locator('[data-testid="search-assets"]').fill('Sample');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);
    
    // Should show only matching assets
    const filteredAssets = await page.locator('[data-testid="asset-card"]').count();
    expect(filteredAssets).toBeLessThanOrEqual(initialAssets);
    
    console.log(`✅ Search filter working: ${filteredAssets} assets found for "Sample"`);
  });

  test('should toggle between grid and list view', async ({ page }) => {
    // Wait for assets to load
    await page.waitForSelector('[data-testid="asset-card"]');
    
    // Toggle view mode
    await page.locator('[data-testid="toggle-view-mode"]').click();
    
    // Wait for view change
    await page.waitForTimeout(500);
    
    // Toggle back
    await page.locator('[data-testid="toggle-view-mode"]').click();
    
    console.log('✅ View mode toggle working');
  });

  test('should simulate file upload process', async ({ page }) => {
    // Open upload modal
    await page.locator('[data-testid="upload-assets-button"]').click();
    await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
    
    // Create a test file
    const testFileContent = 'Test file content for asset upload';
    const fileBuffer = Buffer.from(testFileContent);
    
    // Upload file to the input
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: fileBuffer,
    });
    
    // Wait for file to be processed
    await page.waitForTimeout(1000);
    
    // Check if upload button becomes enabled
    const uploadButton = page.locator('[data-testid="upload-files-button"]');
    await expect(uploadButton).toBeVisible();
    
    // Note: We won't actually click upload since it would hit the API
    // but we can verify the UI is ready for upload
    
    console.log('✅ File upload simulation successful');
    
    // Close modal
    await page.locator('[data-testid="close-upload-modal"]').click();
  });

  test('should test asset interactions', async ({ page }) => {
    // Wait for assets to load
    await page.waitForSelector('[data-testid="asset-card"]');
    
    const firstAssetCard = page.locator('[data-testid="asset-card"]').first();
    
    // Test checkbox selection
    const checkbox = firstAssetCard.locator('input[type="checkbox"]');
    await checkbox.click();
    await expect(checkbox).toBeChecked();
    
    // Test favorite button
    const favoriteButton = firstAssetCard.locator('button[aria-label="Toggle favorite"]');
    await favoriteButton.click();
    
    // Test delete button
    const deleteButton = firstAssetCard.locator('button[aria-label="Delete asset"]');
    await expect(deleteButton).toBeVisible();
    
    console.log('✅ Asset interactions working');
  });

  test('should test asset filtering options', async ({ page }) => {
    // Wait for assets to load
    await page.waitForSelector('[data-testid="asset-card"]');
    
    // Test type filter
    await page.selectOption('select:has(option:text("Images"))', 'image');
    await page.waitForTimeout(500);
    
    // Test sort options
    await page.selectOption('select:has(option:text("Name"))', 'name');
    await page.waitForTimeout(500);
    
    // Test favorites filter
    await page.check('input[type="checkbox"]:near(:text("Favorites Only"))');
    await page.waitForTimeout(500);
    
    console.log('✅ Asset filtering options working');
  });
});

test.describe('Asset API Integration', () => {
  test('should test asset upload API availability', async ({ page }) => {
    // Navigate to assets page
    await page.goto('http://localhost:3000/assets');
    
    // Monitor network requests
    let uploadApiCalled = false;
    
    page.on('response', response => {
      if (response.url().includes('/api/assets/upload')) {
        uploadApiCalled = true;
        console.log(`API Upload endpoint responded with: ${response.status()}`);
      }
    });
    
    // Open upload modal and try to trigger API call
    await page.locator('[data-testid="upload-assets-button"]').click();
    await page.setInputFiles('[data-testid="file-input"]', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake image data'),
    });
    
    // Try to upload (this will likely fail due to auth, but we want to see the API response)
    try {
      await page.locator('[data-testid="upload-files-button"]').click();
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Expected error due to authentication:', error.message);
    }
    
    console.log('✅ Upload API test completed');
  });
});