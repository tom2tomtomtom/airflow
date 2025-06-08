const { test, expect } = require('@playwright/test');

// UX Review Configuration
const UX_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  pages: [
    {
      name: 'Strategy Page',
      url: '/strategic-content',
      key: 'strategy'
    },
    {
      name: 'Generate Page', 
      url: '/generate-enhanced',
      key: 'generate'
    },
    {
      name: 'Dashboard',
      url: '/dashboard', 
      key: 'dashboard'
    },
    {
      name: 'Login',
      url: '/login',
      key: 'login'
    }
  ]
};

test.describe('AIrWAVE UX Review - Fixed Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for all operations
    test.setTimeout(60000);
    
    // Navigate to base URL first
    await page.goto(UX_CONFIG.baseURL, { waitUntil: 'networkidle' });
  });

  for (const pageConfig of UX_CONFIG.pages) {
    test(`UX Review: ${pageConfig.name}`, async ({ page }) => {
      console.log(`\n🔍 REVIEWING: ${pageConfig.name} (${pageConfig.url})`);
      
      try {
        // Navigate to page
        await page.goto(`${UX_CONFIG.baseURL}${pageConfig.url}`, { 
          waitUntil: 'networkidle',
          timeout: UX_CONFIG.timeout 
        });

        // 1. CONSOLE ERRORS CHECK
        const consoleLogs = [];
        const consoleErrors = [];
        
        page.on('console', msg => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
          consoleLogs.push(`${msg.type()}: ${msg.text()}`);
        });

        // Wait for page to stabilize
        await page.waitForTimeout(3000);

        // 2. SCREENSHOT
        await page.screenshot({ 
          path: `ux-review-${pageConfig.key}.png`,
          fullPage: true 
        });

        // 3. PERFORMANCE METRICS
        const performanceMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0];
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
        });

        // 4. ACCESSIBILITY CHECK
        const accessibilityIssues = await page.evaluate(() => {
          const issues = [];
          
          // Check for missing alt text
          const images = document.querySelectorAll('img:not([alt])');
          if (images.length > 0) {
            issues.push(`${images.length} images missing alt text`);
          }
          
          // Check for missing labels
          const inputs = document.querySelectorAll('input:not([aria-label]):not([id])');
          if (inputs.length > 0) {
            issues.push(`${inputs.length} inputs missing labels`);
          }
          
          // Check for proper heading hierarchy
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          if (headings.length === 0) {
            issues.push('No heading structure found');
          }
          
          return issues;
        });

        // 5. LAYOUT STABILITY CHECK
        const layoutMetrics = await page.evaluate(() => {
          return {
            scrollHeight: document.documentElement.scrollHeight,
            clientHeight: document.documentElement.clientHeight,
            hasOverflow: document.documentElement.scrollHeight > document.documentElement.clientHeight
          };
        });

        // 6. INTERACTIVE ELEMENTS CHECK
        const interactiveElements = await page.evaluate(() => {
          const buttons = document.querySelectorAll('button');
          const links = document.querySelectorAll('a[href]');
          const inputs = document.querySelectorAll('input, textarea, select');
          
          return {
            buttons: buttons.length,
            links: links.length,
            inputs: inputs.length,
            totalInteractive: buttons.length + links.length + inputs.length
          };
        });

        // 7. LOADING STATES CHECK
        const loadingElements = await page.evaluate(() => {
          const spinners = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="progress"]');
          const placeholders = document.querySelectorAll('[class*="placeholder"], [class*="skeleton"]');
          
          return {
            loadingSpinners: spinners.length,
            placeholders: placeholders.length
          };
        });

        // 8. ERROR STATES CHECK
        const errorElements = await page.evaluate(() => {
          const errors = document.querySelectorAll('[class*="error"], [role="alert"]');
          const warnings = document.querySelectorAll('[class*="warning"]');
          
          return {
            errorMessages: errors.length,
            warnings: warnings.length
          };
        });

        // 9. NETWORK REQUESTS CHECK
        const networkErrors = [];
        page.on('response', response => {
          if (!response.ok() && response.status() >= 400) {
            networkErrors.push(`${response.status()} - ${response.url()}`);
          }
        });

        // Wait a bit more for any delayed requests
        await page.waitForTimeout(2000);

        // 10. GENERATE UX REPORT
        const uxReport = {
          page: pageConfig.name,
          url: pageConfig.url,
          timestamp: new Date().toISOString(),
          performance: performanceMetrics,
          console: {
            totalLogs: consoleLogs.length,
            errors: consoleErrors.length,
            errorDetails: consoleErrors.slice(0, 5) // First 5 errors
          },
          accessibility: {
            issues: accessibilityIssues.length,
            details: accessibilityIssues
          },
          layout: layoutMetrics,
          interactions: interactiveElements,
          loadingStates: loadingElements,
          errorStates: errorElements,
          network: {
            failedRequests: networkErrors.length,
            details: networkErrors.slice(0, 5) // First 5 network errors
          }
        };

        // 11. PRINT DETAILED REPORT
        console.log(`\n📊 UX REPORT for ${pageConfig.name}:`);
        console.log(`⏱️  Performance:`);
        console.log(`   - DOM Ready: ${performanceMetrics.domContentLoaded}ms`);
        console.log(`   - Load Complete: ${performanceMetrics.loadComplete}ms`);
        console.log(`   - First Paint: ${performanceMetrics.firstPaint}ms`);
        
        console.log(`\n🚨 Console Issues:`);
        console.log(`   - Total Logs: ${consoleLogs.length}`);
        console.log(`   - Errors: ${consoleErrors.length}`);
        if (consoleErrors.length > 0) {
          console.log(`   - Error Details: ${consoleErrors.slice(0, 3).join(', ')}`);
        }
        
        console.log(`\n♿ Accessibility:`);
        console.log(`   - Issues Found: ${accessibilityIssues.length}`);
        if (accessibilityIssues.length > 0) {
          console.log(`   - Details: ${accessibilityIssues.join(', ')}`);
        }
        
        console.log(`\n🎯 Interactions:`);
        console.log(`   - Buttons: ${interactiveElements.buttons}`);
        console.log(`   - Links: ${interactiveElements.links}`);
        console.log(`   - Form Elements: ${interactiveElements.inputs}`);
        
        console.log(`\n🌐 Network:`);
        console.log(`   - Failed Requests: ${networkErrors.length}`);
        if (networkErrors.length > 0) {
          console.log(`   - Failed URLs: ${networkErrors.slice(0, 3).join(', ')}`);
        }
        
        console.log(`\n📱 Layout:`);
        console.log(`   - Has Scroll: ${layoutMetrics.hasOverflow}`);
        console.log(`   - Page Height: ${layoutMetrics.scrollHeight}px`);

        // 12. UX SCORE CALCULATION
        let uxScore = 100;
        
        // Deduct for console errors
        uxScore -= Math.min(consoleErrors.length * 5, 20);
        
        // Deduct for accessibility issues  
        uxScore -= Math.min(accessibilityIssues.length * 10, 30);
        
        // Deduct for network errors
        uxScore -= Math.min(networkErrors.length * 3, 15);
        
        // Deduct for slow performance
        if (performanceMetrics.domContentLoaded > 3000) uxScore -= 10;
        if (performanceMetrics.loadComplete > 5000) uxScore -= 10;
        
        console.log(`\n🏆 UX SCORE: ${Math.max(uxScore, 0)}/100`);
        
        if (uxScore >= 80) {
          console.log(`✅ EXCELLENT UX - Ready for production`);
        } else if (uxScore >= 60) {
          console.log(`⚠️  GOOD UX - Minor improvements needed`);
        } else {
          console.log(`🚨 POOR UX - Significant issues need attention`);
        }

        console.log(`\n${'='.repeat(60)}\n`);

        // Assert that critical UX metrics pass
        expect(consoleErrors.length).toBeLessThan(5); // Less than 5 console errors
        expect(networkErrors.length).toBeLessThan(3); // Less than 3 network errors
        expect(performanceMetrics.domContentLoaded).toBeLessThan(5000); // DOM ready in under 5s
        
      } catch (error) {
        console.error(`❌ UX Review failed for ${pageConfig.name}:`, error.message);
        
        // Take error screenshot
        await page.screenshot({ 
          path: `ux-review-error-${pageConfig.key}.png`,
          fullPage: true 
        });
        
        throw error;
      }
    });
  }

  test('Cross-Page Navigation UX', async ({ page }) => {
    console.log(`\n🔄 TESTING: Cross-Page Navigation UX`);
    
    const navigationFlow = [
      '/login',
      '/dashboard', 
      '/strategic-content',
      '/generate-enhanced',
      '/dashboard'
    ];
    
    let navigationTimes = [];
    
    for (let i = 0; i < navigationFlow.length; i++) {
      const startTime = Date.now();
      
      try {
        await page.goto(`${UX_CONFIG.baseURL}${navigationFlow[i]}`, {
          waitUntil: 'networkidle',
          timeout: UX_CONFIG.timeout
        });
        
        const endTime = Date.now();
        const navigationTime = endTime - startTime;
        navigationTimes.push(navigationTime);
        
        console.log(`   ${navigationFlow[i]}: ${navigationTime}ms`);
        
        // Wait for page to stabilize
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.error(`❌ Navigation failed to ${navigationFlow[i]}:`, error.message);
        navigationTimes.push(999999); // Mark as failed
      }
    }
    
    const avgNavigationTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length;
    console.log(`\n📊 Average Navigation Time: ${avgNavigationTime.toFixed(0)}ms`);
    
    if (avgNavigationTime < 2000) {
      console.log(`✅ FAST navigation - Excellent UX`);
    } else if (avgNavigationTime < 4000) {
      console.log(`⚠️  MODERATE navigation - Acceptable UX`);  
    } else {
      console.log(`🚨 SLOW navigation - Poor UX`);
    }
    
    // Assert navigation performance
    expect(avgNavigationTime).toBeLessThan(5000); // Average under 5 seconds
  });
});