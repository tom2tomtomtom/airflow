/**
 * Comprehensive UX Testing Suite for AIRWAVE
 * Tests all user journeys with real API calls and RedBaez brief content
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  timeout: 30000,
  redbaezBrief: `RedBaez Creative Brief - Digital Marketing Campaign

OBJECTIVE:
Increase brand awareness and drive engagement for RedBaez's new AI-powered marketing automation platform among small to medium-sized businesses.

TARGET AUDIENCE:
Small to medium-sized business owners and marketing managers aged 25-45 who are tech-savvy but time-constrained. They value efficiency, ROI, and innovative solutions that can help them compete with larger companies. Primary demographics include entrepreneurs, marketing directors, and business development professionals in the technology, e-commerce, and professional services sectors.

KEY MESSAGES:
- Automate your marketing workflows and save 10+ hours per week
- AI-powered insights that deliver 3x better campaign performance
- Affordable enterprise-level marketing tools for growing businesses
- Seamless integration with existing tools and platforms
- Data-driven decision making made simple and actionable

PLATFORMS:
LinkedIn, Instagram, Facebook, YouTube, Google Ads

PRODUCT:
RedBaez AI Marketing Automation Platform - A comprehensive suite of AI-powered marketing tools including automated email campaigns, social media scheduling, lead scoring, customer segmentation, and performance analytics.

VALUE PROPOSITION:
RedBaez democratizes enterprise-level marketing automation for small and medium businesses, providing AI-powered tools that were previously only available to large corporations. Our platform delivers measurable ROI through intelligent automation, predictive analytics, and seamless integrations.

INDUSTRY:
Marketing Technology (MarTech), Software as a Service (SaaS)

BUDGET:
$50,000 for initial 3-month campaign

TIMELINE:
Launch in Q1 2024, run for 3 months with performance optimization

BRAND GUIDELINES:
Professional yet approachable tone, emphasis on innovation and results, use of data and metrics to support claims, focus on empowerment and growth.

REQUIREMENTS:
- Video testimonials from existing customers
- Case studies showing measurable results
- Interactive demos and free trial offers
- A/B testing for all creative variations
- Performance tracking and weekly optimization

COMPETITORS:
HubSpot, Mailchimp, ActiveCampaign, Marketo, Pardot`,
};

// Helper functions
class TestHelper {
  static async takeScreenshot(page: Page, name: string) {
    const screenshotPath = path.join('test-results', 'screenshots', `${name}-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
  }

  static async waitForPageLoad(page: Page, timeout = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
    await page.waitForTimeout(500); // Additional small delay for JS to settle
  }

  static async loginUser(page: Page, email = 'test@example.com', password = 'TestPass123') {
    await page.goto('/login');
    await this.waitForPageLoad(page);

    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="sign-in-button"]');

    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    await this.waitForPageLoad(page);
  }

  static async checkForLayoutIssues(page: Page) {
    // Check for overlapping elements
    const overlappingElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const issues = [];

      for (let i = 0; i < elements.length; i++) {
        const elem = elements[i] as HTMLElement;
        const rect = elem.getBoundingClientRect();

        // Skip if element is not visible or has no content
        if (
          rect.width === 0 ||
          rect.height === 0 ||
          getComputedStyle(elem).display === 'none' ||
          getComputedStyle(elem).visibility === 'hidden'
        )
          continue;

        // Check for common layout issues
        if (rect.width > window.innerWidth) {
          issues.push(`Element exceeds viewport width: ${elem.tagName}.${elem.className}`);
        }

        // Check for text overflow
        if (elem.scrollWidth > elem.clientWidth && elem.innerText?.length > 0) {
          issues.push(`Text overflow detected: ${elem.tagName}.${elem.className}`);
        }
      }

      return issues;
    });

    return overlappingElements;
  }

  static async generateTestImage(page: Page): Promise<string> {
    // Create a simple test image using Canvas API
    const imageDataUrl = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 300;
      const ctx = canvas.getContext('2d')!;

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 300);
      gradient.addColorStop(0, '#FF6B6B');
      gradient.addColorStop(1, '#4ECDC4');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 300);

      // Add text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AIRWAVE Test Asset', 200, 150);
      ctx.font = '16px Arial';
      ctx.fillText('Generated for testing', 200, 180);

      return canvas.toDataURL();
    });

    return imageDataUrl;
  }
}

test.describe('AIRWAVE Comprehensive UX Testing', () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      permissions: ['clipboard-read', 'clipboard-write'],
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.describe('Authentication & Access Control', () => {
    test('should display login page without layout issues', async () => {
      await page.goto('/login');
      await TestHelper.waitForPageLoad(page);

      // Check for layout issues
      const layoutIssues = await TestHelper.checkForLayoutIssues(page);
      console.log('Layout issues found:', layoutIssues);

      // Take screenshot
      await TestHelper.takeScreenshot(page, 'login-page-layout');

      // Verify main elements are visible and positioned correctly
      await expect(page.locator('h1')).toContainText('AIrFLOW');
      await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
      await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();

      // Check for text overlapping (specific to reported issue)
      const textOverlapIssues = await page.evaluate(() => {
        const textElements = Array.from(
          document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, label')
        );
        const issues = [];

        for (const elem of textElements) {
          const rect = elem.getBoundingClientRect();
          const style = getComputedStyle(elem);

          // Check if text is clipped or overflowing
          if (elem.scrollHeight > elem.clientHeight && style.overflow === 'hidden') {
            issues.push(`Text clipping detected: ${elem.textContent?.slice(0, 50)}...`);
          }
        }

        return issues;
      });

      expect(textOverlapIssues.length, `Text overlap issues: ${textOverlapIssues.join(', ')}`).toBe(
        0
      );
    });

    test('should handle responsive design correctly', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/login');
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'login-mobile');

      const mobileLayoutIssues = await TestHelper.checkForLayoutIssues(page);
      expect(
        mobileLayoutIssues.length,
        `Mobile layout issues: ${mobileLayoutIssues.join(', ')}`
      ).toBeLessThan(3);

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'login-tablet');

      // Reset to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      await TestHelper.waitForPageLoad(page);
    });

    test('should authenticate user successfully', async () => {
      await TestHelper.loginUser(page);

      // Verify we're on dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('h1, h2')).toContainText(['Dashboard', 'Welcome']);
    });
  });

  test.describe('Global Search Functionality', () => {
    test.beforeEach(async () => {
      if (!page.url().includes('/dashboard')) {
        await TestHelper.loginUser(page);
      }
    });

    test('should open global search with keyboard shortcut', async () => {
      await page.keyboard.press('Control+k');

      // Wait for search modal to appear
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

      await TestHelper.takeScreenshot(page, 'global-search-opened');
    });

    test('should perform real API search and display results', async () => {
      await page.keyboard.press('Control+k');
      await page.fill('input[placeholder*="Search"]', 'flow');

      // Wait for search results
      await page.waitForTimeout(500);

      // Check if search results are displayed
      const results = page.locator('[role="dialog"] li, [role="dialog"] .search-result');
      await expect(results.first()).toBeVisible({ timeout: 5000 });

      await TestHelper.takeScreenshot(page, 'search-results');

      // Test keyboard navigation
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      // Should navigate to selected result
      await TestHelper.waitForPageLoad(page);
    });

    test('should show quick actions when search is empty', async () => {
      await page.keyboard.press('Control+k');

      // Check for quick actions
      await expect(page.locator('text=Quick Actions')).toBeVisible();
      await expect(page.locator('text=Start New Flow')).toBeVisible();

      await TestHelper.takeScreenshot(page, 'search-quick-actions');
    });
  });

  test.describe('Flow Workflow with Real RedBaez Brief', () => {
    test.beforeEach(async () => {
      if (!page.url().includes('/dashboard')) {
        await TestHelper.loginUser(page);
      }
    });

    test('should complete full content generation workflow', async () => {
      // Navigate to flow page
      await page.goto('/flow');
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'flow-page-initial');

      // Start workflow
      await page.click('button:has-text("Start Flow")');
      await page.waitForTimeout(1000);

      // Check if workflow modal/component opened
      const workflowElement = page
        .locator('[data-testid*="workflow"], .workflow-container, [class*="workflow"]')
        .first();
      await expect(workflowElement).toBeVisible({ timeout: 10000 });

      await TestHelper.takeScreenshot(page, 'workflow-opened');

      // Test brief upload step
      const briefInput = page.locator('textarea, input[type="file"], .brief-input').first();

      if (await briefInput.isVisible()) {
        // If it's a text area, input the RedBaez brief
        if (await briefInput.evaluate(el => el.tagName.toLowerCase() === 'textarea')) {
          await briefInput.fill(TEST_CONFIG.redbaezBrief);
          await TestHelper.takeScreenshot(page, 'brief-entered');

          // Submit brief
          const submitButton = page
            .locator(
              'button:has-text("Submit"), button:has-text("Next"), button:has-text("Generate")'
            )
            .first();
          await submitButton.click();

          // Wait for AI processing
          await expect(
            page.locator('text=Processing, text=Generating, [data-testid*="loading"]')
          ).toBeVisible({ timeout: 3000 });
          await TestHelper.takeScreenshot(page, 'ai-processing');

          // Wait for results (allow up to 30 seconds for AI processing)
          await expect(
            page.locator('text=Processing, text=Generating, [data-testid*="loading"]')
          ).toBeHidden({ timeout: 30000 });
          await TestHelper.takeScreenshot(page, 'ai-results');
        }
      }
    });

    test('should test mobile workflow interface', async () => {
      // Switch to mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/flow');
      await TestHelper.waitForPageLoad(page);

      await TestHelper.takeScreenshot(page, 'flow-mobile');

      // Start workflow
      await page.click('button:has-text("Start Flow")');
      await page.waitForTimeout(1000);

      // Check if mobile workflow activated
      const mobileWorkflow = page.locator('.mobile-workflow, [data-testid*="mobile"]').first();

      if (await mobileWorkflow.isVisible()) {
        await TestHelper.takeScreenshot(page, 'mobile-workflow-active');

        // Test swipe gestures (simulate touch events)
        const workflowContainer = mobileWorkflow;
        const bbox = await workflowContainer.boundingBox();

        if (bbox) {
          // Simulate swipe right
          await page.mouse.move(bbox.x + 50, bbox.y + bbox.height / 2);
          await page.mouse.down();
          await page.mouse.move(bbox.x + bbox.width - 50, bbox.y + bbox.height / 2);
          await page.mouse.up();

          await page.waitForTimeout(500);
          await TestHelper.takeScreenshot(page, 'mobile-workflow-swiped');
        }
      }

      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });

  test.describe('Asset Management & Image Generation', () => {
    test.beforeEach(async () => {
      if (!page.url().includes('/dashboard')) {
        await TestHelper.loginUser(page);
      }
    });

    test('should test asset upload workflow', async () => {
      await page.goto('/assets');
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'assets-page');

      // Look for upload button or area
      const uploadButton = page
        .locator('button:has-text("Upload"), input[type="file"], .upload-area')
        .first();

      if (await uploadButton.isVisible()) {
        // Generate test image
        const testImageDataUrl = await TestHelper.generateTestImage(page);

        // If it's a file input, we'll simulate file upload
        if (await uploadButton.evaluate(el => el.tagName.toLowerCase() === 'input')) {
          // Create a test file
          const buffer = Buffer.from(testImageDataUrl.split(',')[1], 'base64');
          await uploadButton.setInputFiles({
            name: 'test-image.png',
            mimeType: 'image/png',
            buffer: buffer,
          });

          await TestHelper.takeScreenshot(page, 'asset-uploaded');
        }
      }
    });

    test('should test asset organization and search', async () => {
      await page.goto('/assets');
      await TestHelper.waitForPageLoad(page);

      // Test asset search if available
      const searchInput = page
        .locator('input[placeholder*="Search"], input[placeholder*="search"]')
        .first();

      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        await TestHelper.takeScreenshot(page, 'assets-search');
      }

      // Test asset grid layout
      const layoutIssues = await TestHelper.checkForLayoutIssues(page);
      expect(
        layoutIssues.length,
        `Asset page layout issues: ${layoutIssues.join(', ')}`
      ).toBeLessThan(5);
    });
  });

  test.describe('Client Management Workflow', () => {
    test.beforeEach(async () => {
      if (!page.url().includes('/dashboard')) {
        await TestHelper.loginUser(page);
      }
    });

    test('should create and manage client account', async () => {
      await page.goto('/clients');
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'clients-page');

      // Look for create client button
      const createButton = page
        .locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")')
        .first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(1000);

        // Fill client creation form if modal/form appears
        const clientNameInput = page
          .locator('input[name*="name"], input[placeholder*="name"]')
          .first();

        if (await clientNameInput.isVisible()) {
          await clientNameInput.fill('RedBaez Test Client');

          const emailInput = page.locator('input[type="email"], input[name*="email"]').first();
          if (await emailInput.isVisible()) {
            await emailInput.fill('contact@redbaez.com');
          }

          const descriptionInput = page.locator('textarea, input[name*="description"]').first();
          if (await descriptionInput.isVisible()) {
            await descriptionInput.fill('AI-powered marketing automation platform for SMBs');
          }

          await TestHelper.takeScreenshot(page, 'client-form-filled');

          // Submit form
          const submitButton = page
            .locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")')
            .first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
            await page.waitForTimeout(2000);
            await TestHelper.takeScreenshot(page, 'client-created');
          }
        }
      }
    });

    test('should test client switching functionality', async () => {
      await page.goto('/dashboard');
      await TestHelper.waitForPageLoad(page);

      // Look for client selector
      const clientSelector = page
        .locator('[data-testid*="client"], .client-selector, button:has-text("Select Client")')
        .first();

      if (await clientSelector.isVisible()) {
        await clientSelector.click();
        await page.waitForTimeout(500);
        await TestHelper.takeScreenshot(page, 'client-selector-opened');

        // Select a client if options are available
        const clientOption = page.locator('[role="option"], .client-option').first();
        if (await clientOption.isVisible()) {
          await clientOption.click();
          await page.waitForTimeout(1000);
          await TestHelper.takeScreenshot(page, 'client-selected');
        }
      }
    });
  });

  test.describe('Campaign Matrix & Organization', () => {
    test.beforeEach(async () => {
      if (!page.url().includes('/dashboard')) {
        await TestHelper.loginUser(page);
      }
    });

    test('should test campaign matrix interface', async () => {
      await page.goto('/matrix');
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'matrix-page');

      // Check for matrix grid
      const matrixGrid = page
        .locator('.matrix-grid, .campaign-grid, [data-testid*="matrix"]')
        .first();

      if (await matrixGrid.isVisible()) {
        // Test matrix interactions
        const matrixCells = page.locator('.matrix-cell, .campaign-item');
        const cellCount = await matrixCells.count();

        if (cellCount > 0) {
          // Click first cell
          await matrixCells.first().click();
          await page.waitForTimeout(500);
          await TestHelper.takeScreenshot(page, 'matrix-cell-selected');
        }
      }

      // Test responsive matrix layout
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await TestHelper.waitForPageLoad(page);
      await TestHelper.takeScreenshot(page, 'matrix-tablet');

      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });

  test.describe('Performance & Accessibility Testing', () => {
    test('should meet performance benchmarks', async () => {
      // Test Core Web Vitals
      const metrics = await page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            const lcp = entries.find(entry => entry.entryType === 'largest-contentful-paint');
            const fid = entries.find(entry => entry.entryType === 'first-input');
            const cls = entries.find(entry => entry.entryType === 'layout-shift');

            resolve({
              lcp: lcp?.startTime,
              fid: fid?.processingStart,
              cls: cls?.value,
            });
          }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

          // Fallback after 5 seconds
          setTimeout(() => resolve({}), 5000);
        });
      });

      console.log('Performance metrics:', metrics);
    });

    test('should be accessible with screen readers', async () => {
      await page.goto('/login');
      await TestHelper.waitForPageLoad(page);

      // Check for accessibility attributes
      const accessibilityIssues = await page.evaluate(() => {
        const issues = [];

        // Check for missing alt text on images
        const images = document.querySelectorAll('img');
        images.forEach((img, index) => {
          if (!img.alt && !img.getAttribute('aria-label')) {
            issues.push(`Image ${index} missing alt text`);
          }
        });

        // Check for form labels
        const inputs = document.querySelectorAll('input');
        inputs.forEach((input, index) => {
          const hasLabel =
            document.querySelector(`label[for="${input.id}"]`) ||
            input.getAttribute('aria-label') ||
            input.getAttribute('aria-labelledby');
          if (!hasLabel) {
            issues.push(`Input ${index} missing label`);
          }
        });

        // Check for button text
        const buttons = document.querySelectorAll('button');
        buttons.forEach((button, index) => {
          if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
            issues.push(`Button ${index} missing accessible text`);
          }
        });

        return issues;
      });

      console.log('Accessibility issues:', accessibilityIssues);
      expect(
        accessibilityIssues.length,
        `Accessibility issues: ${accessibilityIssues.join(', ')}`
      ).toBeLessThan(5);
    });

    test('should handle keyboard navigation', async () => {
      await page.goto('/login');
      await TestHelper.waitForPageLoad(page);

      // Test tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);

      // Continue tabbing through elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }

      await TestHelper.takeScreenshot(page, 'keyboard-navigation');
    });
  });

  test.describe('Error Handling & Edge Cases', () => {
    test('should handle network failures gracefully', async () => {
      // Simulate network failure
      await page.route('**/api/**', route => route.abort());

      await page.goto('/dashboard');
      await TestHelper.waitForPageLoad(page);

      // Check for error handling
      const errorMessage = page.locator('text=Error, text=Failed, [role="alert"]').first();
      await expect(errorMessage).toBeVisible({ timeout: 5000 });

      await TestHelper.takeScreenshot(page, 'network-error-handling');

      // Clear network block
      await page.unroute('**/api/**');
    });

    test('should handle invalid file uploads', async () => {
      await TestHelper.loginUser(page);
      await page.goto('/assets');
      await TestHelper.waitForPageLoad(page);

      // Try to upload invalid file type
      const fileInput = page.locator('input[type="file"]').first();

      if (await fileInput.isVisible()) {
        // Create invalid file
        const invalidFile = Buffer.from('Invalid file content');
        await fileInput.setInputFiles({
          name: 'invalid.xyz',
          mimeType: 'application/unknown',
          buffer: invalidFile,
        });

        // Should show error message
        await expect(page.locator('text=Invalid, text=Error, [role="alert"]')).toBeVisible({
          timeout: 5000,
        });
        await TestHelper.takeScreenshot(page, 'invalid-file-error');
      }
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('should work correctly in different browsers', async () => {
      // This test runs with the current browser context
      await page.goto('/login');
      await TestHelper.waitForPageLoad(page);

      // Test browser-specific features
      const browserFeatures = await page.evaluate(() => {
        return {
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          fetch: typeof fetch !== 'undefined',
          webgl: !!document.createElement('canvas').getContext('webgl'),
          serviceWorker: 'serviceWorker' in navigator,
        };
      });

      console.log('Browser features:', browserFeatures);

      // Essential features should be available
      expect(browserFeatures.localStorage).toBe(true);
      expect(browserFeatures.fetch).toBe(true);
    });
  });
});

// Export test helper for reuse
export { TestHelper, TEST_CONFIG };
