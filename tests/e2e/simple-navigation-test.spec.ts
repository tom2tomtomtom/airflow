import { test, expect } from '@playwright/test';

test.describe('Simple Navigation Tests', () => {
  test('Home page loads', async ({ page }) => {
    console.log('🏠 Testing home page load...');
    
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'screenshots/home-page.png',
      fullPage: true 
    });
    
    console.log('✅ Home page loaded successfully');
  });

  test('Test Dashboard Navigation', async ({ page }) => {
    console.log('📊 Testing dashboard navigation...');
    
    await page.goto('/dashboard', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await page.screenshot({ 
      path: 'screenshots/dashboard.png',
      fullPage: true 
    });
    
    console.log('✅ Dashboard loaded successfully');
  });

  test('Test Flow Page', async ({ page }) => {
    console.log('🔄 Testing flow page...');
    
    await page.goto('/flow', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await page.screenshot({ 
      path: 'screenshots/flow-page.png',
      fullPage: true 
    });
    
    // Look for key elements
    const textAreas = await page.locator('textarea').count();
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    
    console.log(`Found ${textAreas} text areas, ${buttons} buttons, ${inputs} inputs`);
    
    console.log('✅ Flow page loaded successfully');
  });

  test('Test Assets Page', async ({ page }) => {
    console.log('📁 Testing assets page...');
    
    await page.goto('/assets', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    await page.screenshot({ 
      path: 'screenshots/assets-page.png',
      fullPage: true 
    });
    
    // Check for common asset page elements
    const uploadElements = await page.locator('button:has-text("Upload"), input[type="file"], .upload').count();
    const assetCards = await page.locator('.asset, .card, .grid-item').count();
    
    console.log(`Found ${uploadElements} upload elements, ${assetCards} asset cards`);
    
    console.log('✅ Assets page loaded successfully');
  });

  test('Test All Navigation Links', async ({ page }) => {
    console.log('🧭 Testing all navigation links...');
    
    await page.goto('/', { timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // List of pages to test
    const pages = [
      '/dashboard',
      '/clients', 
      '/flow',
      '/strategic-content',
      '/matrix',
      '/assets',
      '/campaigns',
      '/templates',
      '/analytics',
      '/ai-tools'
    ];
    
    for (const pagePath of pages) {
      try {
        console.log(`Testing ${pagePath}...`);
        
        await page.goto(pagePath, { timeout: 30000 });
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        
        // Take screenshot
        const screenshotName = pagePath.replace('/', '').replace('/', '-') || 'home';
        await page.screenshot({ 
          path: `screenshots/nav-${screenshotName}.png`,
          fullPage: false 
        });
        
        console.log(`✅ ${pagePath} loaded successfully`);
        
      } catch (error) {
        console.log(`❌ ${pagePath} failed: ${error.message}`);
        
        // Take error screenshot
        const screenshotName = pagePath.replace('/', '').replace('/', '-') || 'home';
        await page.screenshot({ 
          path: `screenshots/error-${screenshotName}.png`,
          fullPage: false 
        });
      }
    }
    
    console.log('✅ Navigation test completed');
  });
});