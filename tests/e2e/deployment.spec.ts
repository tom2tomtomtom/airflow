import { test, expect } from '@playwright/test';

const BASE_URL = 'https://airwave-complete.netlify.app';

test.describe('AIrWAVE Deployment Tests', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/AIrWAVE/);
    
    // Check for main navigation elements
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for login/signup buttons or dashboard link
    const hasAuthButtons = await page.locator('[href="/login"], [href="/signup"], [href="/dashboard"]').count() > 0;
    expect(hasAuthButtons).toBeTruthy();
  });

  test('Login page is accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Check page loads
    await expect(page).toHaveTitle(/Login|AIrWAVE/);
    
    // Check for login form elements
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')).toBeVisible();
  });

  test('API health endpoint is working', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  test('API system status is accessible', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/system/status`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('timestamp');
  });

  test('Navigation menu works correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Try to access different sections
    const navigationTests = [
      { path: '/dashboard', expectedTitle: /Dashboard|AIrWAVE/ },
      { path: '/campaigns', expectedTitle: /Campaigns|AIrWAVE/ },
      { path: '/analytics', expectedTitle: /Analytics|AIrWAVE/ },
      { path: '/templates', expectedTitle: /Templates|AIrWAVE/ },
    ];

    for (const navTest of navigationTests) {
      await page.goto(`${BASE_URL}${navTest.path}`);
      
      // The page might redirect to login if not authenticated, that's expected
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('/login');
      const isOnTargetPage = currentUrl.includes(navTest.path);
      
      // Either we're on the target page or redirected to login (both are valid)
      expect(isOnTargetPage || isOnLoginPage).toBeTruthy();
      
      // If we're on the target page, check the title
      if (isOnTargetPage) {
        await expect(page).toHaveTitle(navTest.expectedTitle);
      }
    }
  });

  test('Static assets load correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check that CSS is loaded (no broken styles)
    const bodyBackground = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    // Should not be the default browser white (indicates CSS loaded)
    expect(bodyBackground).not.toBe('rgba(0, 0, 0, 0)');
    
    // Check for any 404 errors in network
    const failedRequests: string[] = [];
    page.on('requestfailed', (request) => {
      failedRequests.push(request.url());
    });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Should have minimal failed requests (some external resources might fail, that's ok)
    expect(failedRequests.length).toBeLessThan(5);
  });

  test('Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // Check that the page is responsive
    const bodyWidth = await page.locator('body').evaluate(el => el.clientWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
    
    // Check that navigation adapts to mobile (hamburger menu, etc.)
    const hasResponsiveNav = await page.locator(
      '[aria-label*="menu"], .hamburger, .mobile-menu, button:has-text("Menu")'
    ).count() > 0;
    
    // Either has responsive nav or nav is hidden/simplified
    const navIsVisible = await page.locator('nav').isVisible();
    expect(hasResponsiveNav || !navIsVisible).toBeTruthy();
  });

  test('Error pages are handled gracefully', async ({ page }) => {
    // Test 404 page
    await page.goto(`${BASE_URL}/non-existent-page-12345`);
    
    // Should either show a 404 page or redirect gracefully
    const has404Content = await page.locator(':has-text("404"), :has-text("Not Found"), :has-text("Page not found")').count() > 0;
    const isRedirected = !page.url().includes('non-existent-page-12345');
    
    expect(has404Content || isRedirected).toBeTruthy();
  });

  test('New API endpoints are accessible', async ({ request }) => {
    // Test the new execution monitoring API
    const executionsResponse = await request.get(`${BASE_URL}/api/executions`);
    // Should be 401 (unauthorized) or 200 (if somehow authenticated)
    expect([200, 401, 403]).toContain(executionsResponse.status());

    // Test the new approvals API
    const approvalsResponse = await request.get(`${BASE_URL}/api/approvals`);
    expect([200, 401, 403]).toContain(approvalsResponse.status());

    // Test copy assets API
    const copyAssetsResponse = await request.get(`${BASE_URL}/api/copy-assets`);
    expect([200, 401, 403]).toContain(copyAssetsResponse.status());

    // Test campaigns API
    const campaignsResponse = await request.get(`${BASE_URL}/api/campaigns`);
    expect([200, 401, 403]).toContain(campaignsResponse.status());
  });

  test('Core pages load without JavaScript errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const pagesToTest = [
      '/',
      '/login',
      '/signup', 
      '/dashboard',
      '/campaigns',
      '/templates',
      '/analytics'
    ];

    for (const pagePath of pagesToTest) {
      await page.goto(`${BASE_URL}${pagePath}`);
      await page.waitForLoadState('domcontentloaded');
      
      // Wait a bit for any async errors
      await page.waitForTimeout(1000);
    }

    // Filter out common non-critical errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') &&
      !error.includes('google') &&
      !error.includes('gtag') &&
      !error.includes('analytics') &&
      !error.includes('external')
    );

    // Should have minimal critical console errors
    expect(criticalErrors.length).toBeLessThan(3);
  });

  test('Performance is acceptable', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Measure load time
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time (10 seconds for cold start)
    expect(loadTime).toBeLessThan(10000);
    
    // Check Core Web Vitals if available
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
            if (entry.name === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
          });
          resolve(metrics);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        
        // Resolve after timeout if no metrics available
        setTimeout(() => resolve({}), 2000);
      });
    });

    console.log('Performance metrics:', performanceMetrics);
  });
});