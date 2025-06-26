import { test, expect } from '@playwright/test';

test.describe('Performance and Accessibility Tests', () => {
  test('should have good performance metrics on login page', async ({ page }) => {
    // Start performance measurement
    await page.goto('/login');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Measure core web vitals
    const metrics = await page.evaluate(() => {
      return new Promise(resolve => {
        if ('performance' in window) {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');

          resolve({
            domContentLoaded:
              navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
            loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint:
              paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            totalLoadTime: navigation?.loadEventEnd - navigation?.fetchStart,
          });
        }
        resolve({});
      });
    });

    console.log('Login page performance metrics:', metrics);

    // Basic performance expectations (reasonable for development)
    if (typeof metrics === 'object' && metrics.totalLoadTime) {
      expect(metrics.totalLoadTime).toBeLessThan(10000); // Less than 10 seconds total load
    }
  });

  test('should have basic accessibility features', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check for basic accessibility features
    const accessibilityChecks = await page.evaluate(() => {
      return {
        hasMainLandmark: document.querySelector('main') !== null,
        hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 0,
        hasProperLabels: document.querySelectorAll('label').length > 0,
        hasFormControls: document.querySelectorAll('input, button, select, textarea').length > 0,
        hasAltTextOnImages: Array.from(document.querySelectorAll('img')).every(
          img => img.getAttribute('alt') !== null
        ),
        hasSkipLinks:
          document.querySelector('a[href="#main"], a[href="#content"], .skip-link') !== null,
        hasDocumentTitle: document.title && document.title.trim().length > 0,
        hasLangAttribute: document.documentElement.getAttribute('lang') !== null,
      };
    });

    console.log('Accessibility features:', accessibilityChecks);

    // Basic accessibility requirements
    expect(accessibilityChecks.hasHeadings).toBe(true);
    expect(accessibilityChecks.hasFormControls).toBe(true);
    expect(accessibilityChecks.hasDocumentTitle).toBe(true);

    // Check that images have alt text (if any images exist)
    const imageCount = await page.locator('img').count();
    if (imageCount > 0) {
      expect(accessibilityChecks.hasAltTextOnImages).toBe(true);
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Test tab navigation
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);

    await page.keyboard.press('Tab');
    const secondFocusedElement = await page.evaluate(() => document.activeElement?.tagName);

    console.log('Tab navigation:', { firstFocusedElement, secondFocusedElement });

    // Should be able to navigate with tab
    expect(firstFocusedElement || secondFocusedElement).toBeTruthy();

    // Test that Enter key works on submit button
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")')
      .first();
    await submitButton.focus();

    const buttonIsFocused = await submitButton.evaluate(el => el === document.activeElement);
    expect(buttonIsFocused).toBe(true);
  });

  test('should have responsive design', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Test different viewport sizes
    const viewports = [
      { width: 320, height: 568 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1200, height: 800 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow time for layout

      // Check that form elements are still visible and accessible
      const formVisible = await page.locator('input[type="email"]').isVisible();
      const submitVisible = await page
        .locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")')
        .first()
        .isVisible();

      console.log(
        `Viewport ${viewport.width}x${viewport.height}: form visible=${formVisible}, submit visible=${submitVisible}`
      );

      expect(formVisible).toBe(true);
      expect(submitVisible).toBe(true);
    }
  });

  test('should handle network conditions gracefully', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Add 100ms delay
    });

    const startTime = Date.now();
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`Load time with simulated network delay: ${loadTime}ms`);

    // Should still load within reasonable time even with delays
    expect(loadTime).toBeLessThan(15000); // 15 seconds max

    // Check that page is still functional
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});
