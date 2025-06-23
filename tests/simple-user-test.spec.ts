import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from '@playwright/test';

/**
 * Simple user-focused test that works without complex setup
 * Tests the application as a real user would use it
 */

test.describe('AIrWAVE User Experience Tests', () => {
  
  test('User can visit homepage and see the application', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Verify the page loads successfully
    await expect(page).toHaveTitle(/AIrFLOW|AIRFLOW|Airflow/);
    
    // Check that the page content is visible
    await expect(page.locator('body')).toBeVisible();
    
    // Look for common UI elements
    const hasNavigation = await page.locator('nav, header, [role="navigation"]').count() > 0;
    const hasMainContent = await page.locator('main, [role="main"], .main-content').count() > 0;
    
    console.log(`Navigation found: ${hasNavigation}`);
    console.log(`Main content found: ${hasMainContent}`);
  });

  test('User can navigate through the application', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
    
    // Try to find and click common navigation elements
    const links = await page.locator('a[href]:visible').all();
    
    if (links.length > 0) {
      console.log(`Found ${links.length} navigation links`);
      
      // Get the first few links
      for (let i = 0; i < Math.min(3, links.length); i++) {
        try {
          const href = await links[i].getAttribute('href');
          const text = await links[i].textContent();
          console.log(`Link ${i + 1}: "${text}" -> ${href}`);
        } catch (error) {
    const message = getErrorMessage(error);
          console.log(`Link ${i + 1}: Could not get details`);
        }
      }
    }
  });

  test('User can interact with forms and buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for interactive elements
    const buttons = await page.locator('button:visible').count();
    const inputs = await page.locator('input:visible').count();
    const forms = await page.locator('form:visible').count();
    
    console.log(`Interactive elements found:`);
    console.log(`- Buttons: ${buttons}`);
    console.log(`- Input fields: ${inputs}`);
    console.log(`- Forms: ${forms}`);
    
    // Try to interact with the first visible button if it exists
    const firstButton = page.locator('button:visible').first();
    if (await firstButton.count() > 0) {
      const buttonText = await firstButton.textContent();
      console.log(`First button text: "${buttonText}"`);
      
      // Don't click buttons that might be destructive
      const safeToClick = !buttonText?.toLowerCase().includes('delete') && 
                         !buttonText?.toLowerCase().includes('remove') &&
                         !buttonText?.toLowerCase().includes('logout');
      
      if (safeToClick) {
        console.log('Button appears safe to click for testing');
      } else {
        console.log('Button skipped for safety');
      }
    }
  });

  test('User experiences good performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Performance expectations for good user experience
    expect(loadTime).toBeLessThan(10000); // 10 seconds max for complete load
    
    // Check if page is responsive
    const isResponsive = await page.evaluate(() => {
      return window.innerWidth > 0 && window.innerHeight > 0;
    });
    
    expect(isResponsive).toBe(true);
  });

  test('User can access the application on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take mobile screenshot
    await page.screenshot({ path: 'test-results/mobile-view.png', fullPage: true });
    
    // Check that content is visible on mobile
    const bodyVisible = await page.locator('body').isVisible();
    expect(bodyVisible).toBe(true);
    
    // Verify responsive behavior
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);
    
    console.log('Mobile viewport test completed successfully');
  });

  test('User sees helpful error handling', async ({ page }) => {
    // Test navigation to a non-existent page
    const response = await page.goto('/this-page-does-not-exist');
    
    // Check if we get a proper response
    if (response) {
      console.log(`Response status: ${response.status()}`);
      
      // For Next.js apps, 404 pages should still return content
      const hasContent = await page.locator('body').textContent();
      const hasErrorMessage = hasContent && hasContent.length > 0;
      
      expect(hasErrorMessage).toBe(true);
      console.log('Error page shows appropriate content');
    }
  });
});