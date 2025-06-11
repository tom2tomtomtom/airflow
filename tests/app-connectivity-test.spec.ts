import { test, expect } from '@playwright/test';

test.describe('AIrWAVE Application Connectivity', () => {
  test('should connect to running application', async ({ page }) => {
    console.log('Testing connection to AIrWAVE application...');
    
    try {
      // Navigate to the application with timeout
      const response = await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      console.log(`✅ Connected to app - Status: ${response?.status()}`);
      
      // Wait for the page to load
      await page.waitForTimeout(2000);
      
      // Get basic page information
      const title = await page.title();
      const url = page.url();
      
      console.log(`📄 Page Title: "${title}"`);
      console.log(`🔗 URL: ${url}`);
      
      // Check for basic React/Next.js structure
      const hasNextContainer = await page.locator('#__next').count() > 0;
      console.log(`⚛️  Next.js container found: ${hasNextContainer}`);
      
      // Look for common UI elements
      const bodyContent = await page.locator('body').textContent();
      const hasContent = bodyContent && bodyContent.trim().length > 0;
      console.log(`📝 Page has content: ${hasContent}`);
      
      // Check for error indicators
      const errorCount = await page.locator('[class*="error"], [data-testid*="error"]').count();
      console.log(`❌ Error elements detected: ${errorCount}`);
      
      if (errorCount > 0) {
        // Get first few error messages for debugging
        const errorTexts = await page.locator('[class*="error"], [data-testid*="error"]').allTextContents();
        console.log(`🔍 Sample errors: ${errorTexts.slice(0, 3).join(', ')}`);
      }
      
      // Test should pass if we can connect
      expect(response?.status()).toBeTruthy();
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      throw error;
    }
  });
  
  test('should identify application type and features', async ({ page }) => {
    await page.goto('http://localhost:3000', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // Look for AIrWAVE-specific elements
    const features = {
      hasAuth: await page.locator('[data-testid*="auth"], [class*="auth"], button:has-text("Login"), button:has-text("Sign"), input[type="email"]').count() > 0,
      hasNavigation: await page.locator('nav, [role="navigation"], [data-testid*="nav"]').count() > 0,
      hasLogo: await page.locator('[alt*="logo"], [class*="logo"], [data-testid*="logo"]').count() > 0,
      hasForm: await page.locator('form, [role="form"]').count() > 0,
      hasButtons: await page.locator('button').count(),
      hasLinks: await page.locator('a').count()
    };
    
    console.log('🔍 Application Features Detected:');
    for (const [feature, value] of Object.entries(features)) {
      console.log(`   ${feature}: ${value}`);
    }
    
    // The app should have basic interactive elements
    expect(features.hasButtons).toBeGreaterThan(0);
  });
});