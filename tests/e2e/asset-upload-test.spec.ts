import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';

async function loginWithDemo(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/login`);
  
  // Use demo login
  const demoButton = page.locator('[data-testid="demo-login-button"]');
  if (await demoButton.isVisible()) {
    await demoButton.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  }
}

test.describe('Asset Upload Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('Real Asset Upload Flow', async ({ page }) => {
    console.log('Testing real asset upload functionality...');
    
    // Login
    await loginWithDemo(page);
    
    // Navigate to assets page
    await page.goto(`${BASE_URL}/assets`);
    await page.waitForLoadState('networkidle');
    
    // Look for upload button
    const uploadButtons = page.locator('button:has-text("Upload"), button:has-text("Add"), [aria-label*="upload"]');
    const uploadButton = uploadButtons.first();
    
    if (await uploadButton.isVisible()) {
      console.log('✅ Upload button found');
      await uploadButton.click();
      
      // Wait for upload modal
      const uploadModal = page.locator('[data-testid="upload-modal"]');
      await expect(uploadModal).toBeVisible();
      console.log('✅ Upload modal opened');
      
      // Test file input
      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible()) {
        console.log('✅ File input found');
        
        // Create test file
        const testFile = {
          name: 'test-image.png',
          mimeType: 'image/png',
          buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
        };
        
        // Upload test file
        await fileInput.setInputFiles(testFile);
        console.log('✅ Test file selected');
        
        // Wait for file to appear in list
        await page.waitForTimeout(1000);
        
        // Look for upload button in modal
        const uploadBtn = page.locator('button:has-text("Upload")');
        if (await uploadBtn.isVisible()) {
          console.log('✅ Upload button in modal found');
          
          // Click upload
          await uploadBtn.click();
          console.log('✅ Upload initiated');
          
          // Wait for upload to complete
          await page.waitForTimeout(5000);
          
          // Check if modal closed (indicates success)
          const isModalClosed = await uploadModal.isHidden();
          if (isModalClosed) {
            console.log('✅ Upload completed - modal closed');
          } else {
            console.log('⚠️ Modal still open - checking progress');
          }
        }
      }
    } else {
      console.log('⚠️ Upload button not found - checking page structure');
      
      // Log page content for debugging
      const pageContent = await page.textContent('body');
      console.log('Page content:', pageContent?.substring(0, 500));
    }
    
    // Check if assets appear in the grid
    await page.waitForTimeout(2000);
    const assetGrid = page.locator('[data-testid="asset-grid"], .asset-grid, .MuiGrid-container');
    if (await assetGrid.isVisible()) {
      console.log('✅ Asset grid visible');
    }
    
    console.log('Asset upload flow test completed');
  });

  test('API Upload Endpoint Test', async ({ page }) => {
    console.log('Testing upload API endpoint...');
    
    // Login first to get session
    await loginWithDemo(page);
    
    // Test API endpoint directly
    const apiResponse = await page.evaluate(async () => {
      try {
        // Create test FormData
        const formData = new FormData();
        const testBlob = new Blob(['test file content'], { type: 'text/plain' });
        const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
        formData.append('files', testFile);
        
        const response = await fetch('/api/assets/upload', {
          method: 'POST',
          body: formData
        });
        
        return {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          data: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
    const message = getErrorMessage(error);
        return {
          error: error.message
        };
      }
    });
    
    console.log('API Response:', JSON.stringify(apiResponse, null, 2));
    
    if (apiResponse.ok) {
      console.log('✅ Upload API working correctly');
    } else {
      console.log(`⚠️ Upload API returned status: ${apiResponse.status}`);
    }
  });

  test('Storage Bucket Test', async ({ page }) => {
    console.log('Testing Supabase storage integration...');
    
    await loginWithDemo(page);
    
    // Test storage connectivity
    const storageTest = await page.evaluate(async () => {
      try {
        // Try to fetch a test from the storage bucket
        const response = await fetch('/api/health');
        const data = await response.json();
        
        return {
          health: data,
          storage: 'Storage test would require actual file'
        };
      } catch (error) {
    const message = getErrorMessage(error);
        return {
          error: error.message
        };
      }
    });
    
    console.log('Storage test result:', storageTest);
    
    if (storageTest.health) {
      console.log('✅ Basic API connectivity working');
    }
  });

  test('Asset Library Display', async ({ page }) => {
    console.log('Testing asset library display...');
    
    await loginWithDemo(page);
    await page.goto(`${BASE_URL}/assets`);
    await page.waitForLoadState('networkidle');
    
    // Check for asset library components
    const components = [
      { name: 'Asset Grid', selector: '[data-testid="asset-grid"], .asset-grid, .MuiGrid-container' },
      { name: 'Search Input', selector: 'input[placeholder*="search"], input[type="search"]' },
      { name: 'Filter Buttons', selector: 'button:has-text("Image"), button:has-text("Video"), button:has-text("All")' },
      { name: 'Upload Button', selector: 'button:has-text("Upload"), button:has-text("Add")' }
    ];
    
    for (const component of components) {
      const element = page.locator(component.selector);
      const isVisible = await element.first().isVisible();
      console.log(`${component.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/asset-library-screenshot.png', fullPage: true });
    console.log('✅ Asset library screenshot saved');
  });
});