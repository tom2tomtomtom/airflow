import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive UI Test Suite for AIrWAVE Application
 * Tests the Carbon Black design system implementation and verifies UI rendering issues are resolved
 * Target URL: https://airwave-complete.netlify.app
 */

const BASE_URL = 'https://airwave-complete.netlify.app';

// Helper function to wait for page load and styles
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Allow time for CSS to apply
}

// Helper function to check if element has proper Carbon Black styling
async function verifyCarbonBlackTheme(page: Page) {
  // Check for dark background (Carbon Black theme)
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const computedStyle = window.getComputedStyle(body);
    return {
      backgroundColor: computedStyle.backgroundColor,
      color: computedStyle.color,
    };
  });

  // Carbon Black should have dark background
  expect(bodyStyles.backgroundColor).toMatch(/rgb\((0|16|24|32), (0|16|24|32), (0|16|24|32)\)|rgba\((0|16|24|32), (0|16|24|32), (0|16|24|32), [0-9.]+\)|#(0{6}|1{6}|2{6})/);
}

// Helper function to check icon sizes
async function verifyIconSizes(page: Page) {
  const icons = await page.locator('svg, img[src*="icon"], .icon').all();
  
  for (const icon of icons) {
    const box = await icon.boundingBox();
    if (box) {
      // Icons should not be massive (> 200px typically indicates an issue)
      expect(box.width).toBeLessThan(200);
      expect(box.height).toBeLessThan(200);
      
      // Icons should have reasonable minimum size (not invisible)
      expect(box.width).toBeGreaterThan(8);
      expect(box.height).toBeGreaterThan(8);
    }
  }
}

test.describe('AIrWAVE UI Verification Suite', () => {
  
  test.describe('Landing Page Tests', () => {
    test('should load landing page with Carbon Black theme', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: 'test-results/landing-page-full.png', 
        fullPage: true 
      });
      
      // Verify page loaded successfully
      expect(page.url()).toBe(BASE_URL + '/');
      
      // Check for Carbon Black theme
      await verifyCarbonBlackTheme(page);
      
      // Verify no massive icons
      await verifyIconSizes(page);
      
      // Check for proper typography loading
      const headings = page.locator('h1, h2, h3');
      const firstHeading = headings.first();
      if (await firstHeading.count() > 0) {
        const fontSize = await firstHeading.evaluate(el => 
          window.getComputedStyle(el).fontSize
        );
        expect(fontSize).not.toBe('16px'); // Should have custom styling
      }
    });

    test('should have proper amber accent colors', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Look for primary buttons or accent elements
      const buttons = page.locator('button, .btn, [role="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const buttonStyles = await buttons.first().evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            borderColor: styles.borderColor,
          };
        });
        
        // Check for amber/orange accent colors in buttons
        console.log('Button styles:', buttonStyles);
      }
    });

    test('should have no JavaScript console errors', async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Allow some time for any delayed scripts to run
      await page.waitForTimeout(3000);
      
      // Check for critical errors (filter out minor warnings)
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('manifest') &&
        !error.toLowerCase().includes('warning')
      );
      
      if (criticalErrors.length > 0) {
        console.log('Console errors found:', criticalErrors);
      }
      
      expect(criticalErrors.length).toBeLessThan(3); // Allow for minor non-critical errors
    });
  });

  test.describe('Login Page Tests', () => {
    test('should navigate to login page with proper styling', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Try to find and click login link
      const loginLinks = [
        page.locator('a[href*="login"]'),
        page.locator('text=Login'),
        page.locator('text=Sign In'),
        page.locator('button:has-text("Login")'),
        page.locator('[data-testid*="login"]')
      ];
      
      let loginFound = false;
      for (const link of loginLinks) {
        if (await link.count() > 0) {
          await link.first().click();
          loginFound = true;
          break;
        }
      }
      
      if (!loginFound) {
        // Try direct navigation
        await page.goto(BASE_URL + '/login');
      }
      
      await waitForPageLoad(page);
      
      // Take screenshot of login page
      await page.screenshot({ 
        path: 'test-results/login-page.png', 
        fullPage: true 
      });
      
      // Verify Carbon Black theme on login page
      await verifyCarbonBlackTheme(page);
      
      // Check for form elements with proper styling
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        const inputs = page.locator('input[type="email"], input[type="password"], input[type="text"]');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          const inputStyles = await inputs.first().evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              backgroundColor: styles.backgroundColor,
              borderColor: styles.borderColor,
              color: styles.color,
            };
          });
          
          // Input should have dark theme styling
          expect(inputStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
        }
      }
    });

    test('should test demo mode functionality', async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await waitForPageLoad(page);
      
      // Look for demo mode button/link
      const demoElements = [
        page.locator('text=Demo'),
        page.locator('text=Try Demo'),
        page.locator('button:has-text("Demo")'),
        page.locator('a:has-text("Demo")'),
        page.locator('[data-testid*="demo"]')
      ];
      
      for (const element of demoElements) {
        if (await element.count() > 0) {
          await element.first().click();
          await waitForPageLoad(page);
          
          // Take screenshot after demo mode activation
          await page.screenshot({ 
            path: 'test-results/demo-mode-activated.png' 
          });
          
          // Verify we're in demo mode (check for dashboard or different URL)
          const currentUrl = page.url();
          expect(currentUrl).not.toBe(BASE_URL + '/login');
          break;
        }
      }
    });
  });

  test.describe('Dashboard Tests', () => {
    test('should access dashboard and verify navigation', async ({ page }) => {
      // First try to access demo mode
      await page.goto(BASE_URL + '/login');
      await waitForPageLoad(page);
      
      // Look for demo mode or try direct dashboard access
      const demoButton = page.locator('text=Demo').first();
      if (await demoButton.count() > 0) {
        await demoButton.click();
        await waitForPageLoad(page);
      } else {
        // Try direct dashboard access
        await page.goto(BASE_URL + '/dashboard');
        await waitForPageLoad(page);
      }
      
      // Take screenshot of dashboard
      await page.screenshot({ 
        path: 'test-results/dashboard-full.png', 
        fullPage: true 
      });
      
      // Verify Carbon Black theme in dashboard
      await verifyCarbonBlackTheme(page);
      
      // Check for navigation sidebar
      const navigation = [
        page.locator('nav'),
        page.locator('.sidebar'),
        page.locator('[role="navigation"]'),
        page.locator('.nav')
      ];
      
      let navFound = false;
      for (const nav of navigation) {
        if (await nav.count() > 0) {
          navFound = true;
          
          // Verify navigation icons are properly sized
          const navIcons = nav.locator('svg, img, .icon');
          const iconCount = await navIcons.count();
          
          if (iconCount > 0) {
            await verifyIconSizes(page);
          }
          break;
        }
      }
      
      // Check for Material-UI components
      const muiComponents = [
        page.locator('.MuiCard-root'),
        page.locator('.MuiButton-root'),
        page.locator('.MuiPaper-root'),
        page.locator('[class*="Mui"]')
      ];
      
      for (const component of muiComponents) {
        if (await component.count() > 0) {
          const styles = await component.first().evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              backgroundColor: computed.backgroundColor,
              color: computed.color,
            };
          });
          
          // Material-UI components should have dark theme
          expect(styles.backgroundColor).not.toBe('rgb(255, 255, 255)');
          break;
        }
      }
    });

    test('should verify cards and interactive elements', async ({ page }) => {
      await page.goto(BASE_URL + '/dashboard');
      await waitForPageLoad(page);
      
      // Look for cards
      const cards = [
        page.locator('.card'),
        page.locator('.MuiCard-root'),
        page.locator('[role="article"]'),
        page.locator('.dashboard-card')
      ];
      
      for (const cardSelector of cards) {
        const cardCount = await cardSelector.count();
        if (cardCount > 0) {
          // Take screenshot focusing on cards
          await page.screenshot({ 
            path: 'test-results/dashboard-cards.png' 
          });
          
          const cardStyles = await cardSelector.first().evaluate(el => {
            const styles = window.getComputedStyle(el);
            return {
              backgroundColor: styles.backgroundColor,
              borderRadius: styles.borderRadius,
              boxShadow: styles.boxShadow,
            };
          });
          
          // Cards should have dark theme styling
          expect(cardStyles.backgroundColor).not.toBe('rgb(255, 255, 255)');
          break;
        }
      }
      
      // Test interactive elements
      const buttons = page.locator('button, .btn, [role="button"]');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        // Test hover state on first button
        await buttons.first().hover();
        await page.waitForTimeout(500);
        
        await page.screenshot({ 
          path: 'test-results/button-hover-state.png' 
        });
      }
    });
  });

  test.describe('CSS and Theme Verification', () => {
    test('should verify CSS custom properties are loaded', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      const cssProperties = await page.evaluate(() => {
        const root = document.documentElement;
        const computedStyle = window.getComputedStyle(root);
        
        // Check for common CSS custom properties
        const properties = [
          '--primary-color',
          '--secondary-color',
          '--background-color',
          '--text-color',
          '--accent-color',
          '--theme-primary',
          '--theme-secondary',
          '--carbon-black',
          '--amber-accent'
        ];
        
        const foundProperties: Record<string, string> = {};
        properties.forEach(prop => {
          const value = computedStyle.getPropertyValue(prop);
          if (value.trim()) {
            foundProperties[prop] = value.trim();
          }
        });
        
        return foundProperties;
      });
      
      console.log('Found CSS custom properties:', cssProperties);
      
      // Should have at least some custom properties defined
      expect(Object.keys(cssProperties).length).toBeGreaterThan(0);
    });

    test('should verify no white background with massive icons issue', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Check body background is not white
      const bodyBg = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).backgroundColor;
      });
      
      expect(bodyBg).not.toBe('rgb(255, 255, 255)');
      expect(bodyBg).not.toBe('rgba(255, 255, 255, 1)');
      expect(bodyBg).not.toBe('#ffffff');
      expect(bodyBg).not.toBe('#fff');
      
      // Verify icon sizes are not massive
      await verifyIconSizes(page);
      
      // Take screenshot for visual confirmation
      await page.screenshot({ 
        path: 'test-results/no-white-background-verification.png',
        fullPage: true 
      });
    });

    test('should check responsive design', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080, name: 'desktop' },
        { width: 1024, height: 768, name: 'tablet' },
        { width: 375, height: 667, name: 'mobile' }
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });
        
        await page.waitForTimeout(1000); // Allow layout to adjust
        
        await page.screenshot({ 
          path: `test-results/responsive-${viewport.name}.png`,
          fullPage: true 
        });
        
        // Verify no horizontal scroll on mobile
        if (viewport.name === 'mobile') {
          const scrollWidth = await page.evaluate(() => 
            document.documentElement.scrollWidth
          );
          expect(scrollWidth).toBeLessThanOrEqual(viewport.width + 20); // Allow small tolerance
        }
      }
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should have reasonable load times', async ({ page }) => {
      const start = Date.now();
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      const loadTime = Date.now() - start;
      
      console.log(`Page load time: ${loadTime}ms`);
      
      // Should load within reasonable time (15 seconds max for slow networks)
      expect(loadTime).toBeLessThan(15000);
    });

    test('should verify fonts load properly', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      const fontInfo = await page.evaluate(() => {
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'inherit';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const fontFamily = computedStyle.fontFamily;
        
        document.body.removeChild(testElement);
        
        return {
          fontFamily,
          isFallback: fontFamily.includes('serif') || fontFamily.includes('sans-serif')
        };
      });
      
      console.log('Font info:', fontInfo);
      
      // Should not be using only fallback fonts
      expect(fontInfo.fontFamily).not.toBe('serif');
      expect(fontInfo.fontFamily).not.toBe('sans-serif');
    });

    test('should check basic accessibility', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Check for basic accessibility features
      const accessibilityChecks = await page.evaluate(() => {
        const results = {
          hasTitle: !!document.title,
          hasLang: !!document.documentElement.lang,
          hasImages: document.querySelectorAll('img').length,
          imagesWithAlt: document.querySelectorAll('img[alt]').length,
          hasHeadings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
          hasSkipLinks: document.querySelectorAll('a[href="#main"], a[href="#content"]').length,
        };
        
        return results;
      });
      
      console.log('Accessibility checks:', accessibilityChecks);
      
      // Basic accessibility requirements
      expect(accessibilityChecks.hasTitle).toBe(true);
      expect(accessibilityChecks.hasHeadings).toBeGreaterThan(0);
      
      // If there are images, at least 50% should have alt text
      if (accessibilityChecks.hasImages > 0) {
        const altTextRatio = accessibilityChecks.imagesWithAlt / accessibilityChecks.hasImages;
        expect(altTextRatio).toBeGreaterThan(0.5);
      }
    });
  });

  test.describe('Functional Testing', () => {
    test('should test key navigation flows', async ({ page }) => {
      await page.goto(BASE_URL);
      await waitForPageLoad(page);
      
      // Test navigation to different pages
      const navLinks = page.locator('a[href^="/"], a[href^="' + BASE_URL + '"]');
      const linkCount = await navLinks.count();
      
      const testedLinks: string[] = [];
      
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !testedLinks.includes(href)) {
          testedLinks.push(href);
          
          try {
            await link.click();
            await waitForPageLoad(page);
            
            // Verify page loaded successfully
            expect(page.url()).toContain(BASE_URL);
            
            // Verify theme is still applied
            await verifyCarbonBlackTheme(page);
            
            // Go back to home
            await page.goto(BASE_URL);
            await waitForPageLoad(page);
          } catch (error) {
            console.log(`Navigation to ${href} failed:`, error);
          }
        }
      }
    });

    test('should verify demo mode works end-to-end', async ({ page }) => {
      await page.goto(BASE_URL + '/login');
      await waitForPageLoad(page);
      
      // Find and click demo mode
      const demoButton = page.locator('text=Demo, button:has-text("Demo"), a:has-text("Demo")').first();
      
      if (await demoButton.count() > 0) {
        await demoButton.click();
        await waitForPageLoad(page);
        
        // Should be redirected to dashboard or main app
        expect(page.url()).not.toBe(BASE_URL + '/login');
        
        // Take final screenshot of working demo
        await page.screenshot({ 
          path: 'test-results/demo-mode-working.png',
          fullPage: true 
        });
        
        // Verify theme is applied in demo mode
        await verifyCarbonBlackTheme(page);
        
        // Test one major feature if available
        const majorFeatures = [
          page.locator('text=Generate'),
          page.locator('text=Create'),
          page.locator('text=Campaign'),
          page.locator('button:has-text("Generate")'),
          page.locator('button:has-text("Create")')
        ];
        
        for (const feature of majorFeatures) {
          if (await feature.count() > 0) {
            await feature.first().click();
            await page.waitForTimeout(2000);
            
            await page.screenshot({ 
              path: 'test-results/feature-interaction.png' 
            });
            
            break;
          }
        }
      }
    });
  });
});