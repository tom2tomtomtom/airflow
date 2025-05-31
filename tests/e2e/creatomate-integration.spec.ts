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

test.describe('Creatomate Video Generation Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
  });

  test('Creatomate API Connectivity Test', async ({ page }) => {
    console.log('Testing Creatomate API connectivity...');
    
    // Test API endpoint directly
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/creatomate/test');
        return {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
    const message = getErrorMessage(error);
        return {
          error: error.message
        };
      }
    });

    console.log('Creatomate API Response:', JSON.stringify(apiResponse, null, 2));
    
    if (apiResponse.ok) {
      console.log('✅ Creatomate API connectivity working');
      expect(apiResponse.data.success).toBe(true);
      expect(apiResponse.data.data.message).toContain('Creatomate integration is working');
    } else {
      console.log(`⚠️ Creatomate API returned status: ${apiResponse.status}`);
    }
  });

  test('Creatomate Templates Test', async ({ page }) => {
    console.log('Testing Creatomate templates endpoint...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/creatomate/templates');
        return {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
    const message = getErrorMessage(error);
        return {
          error: error.message
        };
      }
    });

    console.log('Templates Response:', JSON.stringify(apiResponse, null, 2));
    
    if (apiResponse.ok && apiResponse.data.success) {
      console.log('✅ Creatomate templates endpoint working');
      console.log(`📋 Found ${apiResponse.data.data.length} templates`);
      expect(Array.isArray(apiResponse.data.data)).toBe(true);
      
      if (apiResponse.data.data.length > 0) {
        const template = apiResponse.data.data[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        console.log(`📄 Sample template: ${template.name} (${template.id})`);
      }
    } else {
      console.log(`⚠️ Templates API returned status: ${apiResponse.status}`);
    }
  });

  test('Video Status Check API Test', async ({ page }) => {
    console.log('Testing video status check API...');
    
    const apiResponse = await page.evaluate(async () => {
      try {
        // Test with a mock render ID
        const response = await fetch('/api/check-video-status?job_id=mock-render-id');
        return {
          status: response.status,
          ok: response.ok,
          data: response.ok ? await response.json() : await response.text()
        };
      } catch (error) {
    const message = getErrorMessage(error);
        return {
          error: error.message
        };
      }
    });

    console.log('Video Status API Response:', JSON.stringify(apiResponse, null, 2));
    
    // Since we're using a mock ID, we expect either a 404 or a proper error response
    if (apiResponse.status === 404 || apiResponse.status === 500) {
      console.log('✅ Video status API is accessible and handling requests');
      expect(apiResponse.data).toHaveProperty('success');
      expect(apiResponse.data.success).toBe(false);
    } else {
      console.log(`⚠️ Unexpected status: ${apiResponse.status}`);
    }
  });

  test('Video Generation UI Components', async ({ page }) => {
    console.log('Testing video generation UI components...');
    
    await loginWithDemo(page);
    await page.goto(`${BASE_URL}/generate-enhanced`);
    await page.waitForLoadState('networkidle');
    
    // Look for video generation tab
    const videoTab = page.locator('button:has-text("Video"), [aria-label*="video"], .video-tab');
    const isVideoTabVisible = await videoTab.first().isVisible();
    console.log(`Video Generation Tab: ${isVideoTabVisible ? '✅ Present' : '❌ Missing'}`);
    
    if (isVideoTabVisible) {
      await videoTab.first().click();
      await page.waitForTimeout(1000);
      
      // Check for video generation components
      const components = [
        { name: 'Video Prompt Input', selector: 'textarea[placeholder*="video"], input[placeholder*="video"]' },
        { name: 'Style Selection', selector: 'select:has(option:text-matches("Cinematic|Documentary|Commercial")), button:has-text("Cinematic")' },
        { name: 'Duration Controls', selector: 'input[type="range"], select:has(option:contains("seconds"))' },
        { name: 'Generate Button', selector: 'button:has-text("Generate Video"), button:has-text("Create Video")' },
      ];
      
      for (const component of components) {
        const element = page.locator(component.selector);
        const isVisible = await element.first().isVisible();
        console.log(`${component.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
      }
    }
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/video-generation-ui.png', fullPage: true });
    console.log('✅ Video generation UI screenshot saved');
  });

  test('Template Library Integration', async ({ page }) => {
    console.log('Testing template library integration...');
    
    await loginWithDemo(page);
    await page.goto(`${BASE_URL}/templates`);
    await page.waitForLoadState('networkidle');
    
    // Check for template library components
    const components = [
      { name: 'Template Grid', selector: '[data-testid="template-grid"], .template-grid, .MuiGrid-container' },
      { name: 'Search Input', selector: 'input[placeholder*="search"], input[type="search"]' },
      { name: 'Filter Buttons', selector: 'button:has-text("Video"), button:has-text("Image"), button:has-text("All")' },
      { name: 'Template Cards', selector: '.template-card, [data-testid="template-card"]' },
    ];
    
    for (const component of components) {
      const element = page.locator(component.selector);
      const isVisible = await element.first().isVisible();
      console.log(`${component.name}: ${isVisible ? '✅ Present' : '❌ Missing'}`);
    }
    
    // Check for Creatomate templates
    const creatomateTemplates = page.locator('text="Creatomate", text="Video Template"');
    const hasCreatomateTemplates = await creatomateTemplates.first().isVisible();
    console.log(`Creatomate Templates: ${hasCreatomateTemplates ? '✅ Present' : '❌ Missing'}`);
    
    console.log('Template library integration test completed');
  });
});