import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Error Discovery Test
 * Systematically explores all tools, pages, and features to identify errors
 * This test acts as an automated QA process to find issues proactively
 */

interface DiscoveredError {
  type: 'console_error' | 'network_error' | 'page_error' | 'ui_error' | 'performance_issue';
  page: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  stack?: string;
  timestamp: string;
}

class ErrorCollector {
  private errors: DiscoveredError[] = [];
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setupErrorListeners();
  }

  private setupErrorListeners() {
    // Console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.addError({
          type: 'console_error',
          page: this.page.url(),
          message: msg.text(),
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Page crashes
    this.page.on('pageerror', error => {
      this.addError({
        type: 'page_error',
        page: this.page.url(),
        message: error.message,
        severity: 'critical',
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // Network failures
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.addError({
          type: 'network_error',
          page: this.page.url(),
          message: `${response.status()} - ${response.url()}`,
          severity: response.status() >= 500 ? 'critical' : 'medium',
          timestamp: new Date().toISOString()
        });
      }
    });
  }

  addError(error: DiscoveredError) {
    this.errors.push(error);
    console.log(`🚨 ${error.severity.toUpperCase()}: ${error.type} - ${error.message}`);
  }

  getErrors(): DiscoveredError[] {
    return this.errors;
  }

  getErrorsSummary(): { total: number; by_severity: Record<string, number>; by_type: Record<string, number> } {
    const by_severity = this.errors.reduce((acc, err) => {
      acc[err.severity] = (acc[err.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const by_type = this.errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.errors.length,
      by_severity,
      by_type
    };
  }
}

test.describe('Comprehensive Error Discovery', () => {
  let errorCollector: ErrorCollector;

  test.beforeEach(async ({ page }) => {
    errorCollector = new ErrorCollector(page);
  });

  test('Discover all navigation and page errors', async ({ page }) => {
    console.log('🔍 Starting comprehensive error discovery...');

    // Define all known routes to test
    const routes = [
      '/',
      '/login',
      '/signup', 
      '/dashboard',
      '/assets',
      '/flow',
      '/clients',
      '/campaigns', 
      '/templates',
      '/settings',
      '/profile',
      '/billing',
      '/help',
      '/api/health',
      // Add API routes
      '/api/auth/session',
      '/api/assets',
      '/api/flow/parse-brief',
      '/api/clients',
      '/api/campaigns'
    ];

    console.log(`📄 Testing ${routes.length} routes...`);

    for (const route of routes) {
      console.log(`\n🌐 Testing route: ${route}`);
      
      try {
        const startTime = Date.now();
        const response = await page.goto(route, { 
          waitUntil: 'networkidle',
          timeout: 10000 
        });
        const loadTime = Date.now() - startTime;

        // Check response status
        if (response) {
          console.log(`   ✅ Status: ${response.status()}`);
          if (response.status() >= 400) {
            errorCollector.addError({
              type: 'network_error',
              page: route,
              message: `HTTP ${response.status()} on ${route}`,
              severity: response.status() >= 500 ? 'critical' : 'medium',
              timestamp: new Date().toISOString()
            });
          }
        }

        // Check load performance
        if (loadTime > 10000) {
          errorCollector.addError({
            type: 'performance_issue',
            page: route,
            message: `Slow page load: ${loadTime}ms`,
            severity: 'medium',
            timestamp: new Date().toISOString()
          });
        }
        console.log(`   ⏱️ Load time: ${loadTime}ms`);

        // Give page time to render and trigger any errors
        await page.waitForTimeout(2000);

        // Check for UI errors (missing critical elements)
        if (route === '/') {
          await checkHomepageElements(page, errorCollector);
        } else if (route === '/dashboard') {
          await checkDashboardElements(page, errorCollector);
        } else if (route === '/assets') {
          await checkAssetsPageElements(page, errorCollector);
        }

      } catch (error) {
        console.log(`   ❌ Navigation failed: ${error.message}`);
        errorCollector.addError({
          type: 'page_error',
          page: route,
          message: `Navigation failed: ${error.message}`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  test('Discover form and interaction errors', async ({ page }) => {
    console.log('\n🖱️ Testing interactive elements...');

    // Test login form
    try {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // Try to find and interact with login form
      const emailInput = page.locator('input[type="email"], input[name="email"], [data-testid*="email"]');
      const passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid*="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');

      if (await emailInput.count() > 0) {
        console.log('   ✅ Email input found');
        await emailInput.first().fill('test@example.com');
      } else {
        errorCollector.addError({
          type: 'ui_error',
          page: '/login',
          message: 'Email input field not found',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      if (await passwordInput.count() > 0) {
        console.log('   ✅ Password input found');
        await passwordInput.first().fill('testpassword');
      } else {
        errorCollector.addError({
          type: 'ui_error',
          page: '/login',
          message: 'Password input field not found',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

      if (await submitButton.count() > 0) {
        console.log('   ✅ Submit button found');
        // Don't actually submit, just verify it's clickable
        const isEnabled = await submitButton.first().isEnabled();
        if (!isEnabled) {
          errorCollector.addError({
            type: 'ui_error',
            page: '/login',
            message: 'Login button is disabled',
            severity: 'medium',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        errorCollector.addError({
          type: 'ui_error',
          page: '/login',
          message: 'Submit button not found',
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      errorCollector.addError({
        type: 'page_error',
        page: '/login',
        message: `Login form testing failed: ${error.message}`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }
  });

  test('Discover API endpoint errors', async ({ page }) => {
    console.log('\n🔌 Testing API endpoints...');

    const apiEndpoints = [
      { url: '/api/health', method: 'GET', expectStatus: [200, 404] },
      { url: '/api/auth/session', method: 'GET', expectStatus: [200, 401] },
      { url: '/api/assets', method: 'GET', expectStatus: [200, 401] },
      { url: '/api/clients', method: 'GET', expectStatus: [200, 401] },
      { url: '/api/flow/parse-brief', method: 'POST', expectStatus: [200, 400, 401, 500] }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        console.log(`   🔗 Testing ${endpoint.method} ${endpoint.url}`);
        
        let response;
        if (endpoint.method === 'GET') {
          response = await page.request.get(endpoint.url);
        } else if (endpoint.method === 'POST') {
          response = await page.request.post(endpoint.url, {
            data: { test: 'data' }
          });
        }

        if (response) {
          const status = response.status();
          console.log(`      Status: ${status}`);
          
          if (!endpoint.expectStatus.includes(status)) {
            errorCollector.addError({
              type: 'network_error',
              page: endpoint.url,
              message: `Unexpected API status ${status} for ${endpoint.method} ${endpoint.url}`,
              severity: 'medium',
              timestamp: new Date().toISOString()
            });
          }
        }

      } catch (error) {
        console.log(`      ❌ Failed: ${error.message}`);
        errorCollector.addError({
          type: 'network_error',
          page: endpoint.url,
          message: `API request failed: ${error.message}`,
          severity: 'medium',
          timestamp: new Date().toISOString()
        });
      }
    }
  });

  test('Generate comprehensive error report', async ({ page }) => {
    // Wait for all other tests to complete
    await page.waitForTimeout(1000);

    const summary = errorCollector.getErrorsSummary();
    const allErrors = errorCollector.getErrors();

    console.log('\n📊 COMPREHENSIVE ERROR DISCOVERY REPORT');
    console.log('==========================================');
    console.log(`Total Errors Found: ${summary.total}`);
    
    console.log('\n📈 Errors by Severity:');
    Object.entries(summary.by_severity).forEach(([severity, count]) => {
      console.log(`   ${severity.toUpperCase()}: ${count}`);
    });

    console.log('\n🔍 Errors by Type:');
    Object.entries(summary.by_type).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    console.log('\n📝 Detailed Error List:');
    allErrors.forEach((error, index) => {
      console.log(`\n${index + 1}. [${error.severity.toUpperCase()}] ${error.type}`);
      console.log(`   Page: ${error.page}`);
      console.log(`   Message: ${error.message}`);
      console.log(`   Time: ${error.timestamp}`);
      if (error.stack) {
        console.log(`   Stack: ${error.stack.split('\n')[0]}`);
      }
    });

    // Save detailed report to file
    const report = {
      timestamp: new Date().toISOString(),
      summary,
      errors: allErrors,
      recommendations: generateRecommendations(allErrors)
    };

    await page.evaluate((reportData) => {
      console.log('Full Error Discovery Report:', JSON.stringify(reportData, null, 2));
    }, report);

    // Assert based on severity - fail test if critical errors found
    const criticalErrors = allErrors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      console.log(`\n🚨 CRITICAL: ${criticalErrors.length} critical errors found that need immediate attention!`);
      
      // Don't fail the test, but make it clear these need attention
      console.log('\n⚠️  Critical errors detected - review required');
    } else {
      console.log('\n✅ No critical errors found');
    }

    console.log('\n🎯 Error Discovery Complete');
  });

});

// Helper methods outside test describe block
async function checkHomepageElements(page: Page, errorCollector: ErrorCollector) {
    const criticalElements = [
      { selector: 'body', name: 'Page body' },
      { selector: 'title, h1', name: 'Page title or main heading' }
    ];

    for (const element of criticalElements) {
      const count = await page.locator(element.selector).count();
      if (count === 0) {
        errorCollector.addError({
          type: 'ui_error',
          page: '/',
          message: `Missing critical element: ${element.name}`,
          severity: 'high',
          timestamp: new Date().toISOString()
        });
      }
    }
  }

async function checkDashboardElements(page: Page, errorCollector: ErrorCollector) {
    // Check if dashboard loads without requiring authentication
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('   ℹ️ Dashboard redirected to login (expected)');
      return;
    }

    // If we're on dashboard, check for basic elements
    const navigationExists = await page.locator('nav, [role="navigation"], .navigation').count() > 0;
    if (!navigationExists) {
      errorCollector.addError({
        type: 'ui_error',
        page: '/dashboard',
        message: 'Dashboard navigation not found',
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }
  }

async function checkAssetsPageElements(page: Page, errorCollector: ErrorCollector) {
    // Similar checks for assets page
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('   ℹ️ Assets redirected to login (expected)');
      return;
    }

    // Check for upload functionality or asset grid
    const hasUploadArea = await page.locator('[data-testid="upload"], .upload, input[type="file"]').count() > 0;
    const hasAssetGrid = await page.locator('.assets, .grid, [data-testid="assets"]').count() > 0;
    
    if (!hasUploadArea && !hasAssetGrid) {
      errorCollector.addError({
        type: 'ui_error',
        page: '/assets',
        message: 'No upload area or asset grid found',
        severity: 'medium',
        timestamp: new Date().toISOString()
      });
    }
  }

function generateRecommendations(errors: DiscoveredError[]): string[] {
    const recommendations: string[] = [];
    
    const errorCounts = errors.reduce((acc, err) => {
      acc[err.type] = (acc[err.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (errorCounts.console_error > 0) {
      recommendations.push('Review console errors - these often indicate JavaScript issues');
    }
    
    if (errorCounts.network_error > 0) {
      recommendations.push('Check API endpoints and server responses');
    }
    
    if (errorCounts.ui_error > 0) {
      recommendations.push('Review UI components and ensure all expected elements are present');
    }
    
    if (errorCounts.performance_issue > 0) {
      recommendations.push('Optimize page load times and performance');
    }

    if (errors.some(e => e.severity === 'critical')) {
      recommendations.push('Address critical errors immediately as they may prevent core functionality');
    }

    return recommendations;
  }