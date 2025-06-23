/**
 * Login Page Layout Test - Quick validation of UI fixes
 */

import { test, expect } from '@playwright/test';

test.describe('Login Page Layout Validation', () => {
  test('should display login page without text overlapping issues', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/login-layout-fixed.png', fullPage: true });

    // Verify main elements are visible
    await expect(page.locator('h1')).toContainText('AIrFLOW');
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();

    // Check for text overlapping issues
    const layoutIssues = await page.evaluate(() => {
      const issues = [];
      const textElements = document.querySelectorAll(
        'p, span, h1, h2, h3, h4, h5, h6, label, .MuiTypography-root'
      );

      for (const elem of textElements) {
        const rect = elem.getBoundingClientRect();
        const style = getComputedStyle(elem);

        // Check if text is clipped or overflowing
        if (elem.scrollHeight > elem.clientHeight + 2 && style.overflow !== 'visible') {
          issues.push(`Text clipping in: ${elem.textContent?.slice(0, 30)}...`);
        }

        // Check if text exceeds container width
        if (elem.scrollWidth > elem.clientWidth + 2) {
          issues.push(`Text overflow in: ${elem.textContent?.slice(0, 30)}...`);
        }
      }

      return issues;
    });

    console.log('Layout issues found:', layoutIssues);
    expect(layoutIssues.length, `Layout issues: ${layoutIssues.join(', ')}`).toBe(0);

    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/login-mobile-fixed.png', fullPage: true });

    // Verify mobile layout
    const mobileIssues = await page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');

      for (const elem of elements) {
        const rect = elem.getBoundingClientRect();
        if (rect.width > window.innerWidth + 5) {
          issues.push(`Element exceeds viewport: ${elem.tagName}.${elem.className}`);
        }
      }

      return issues;
    });

    expect(mobileIssues.length, `Mobile layout issues: ${mobileIssues.join(', ')}`).toBeLessThan(3);
  });
});
