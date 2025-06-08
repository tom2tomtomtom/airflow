const { chromium } = require('playwright');

const UX_CONFIG = {
  baseURL: 'http://localhost:3000',
  timeout: 30000,
  pages: [
    { name: 'Login', url: '/login', key: 'login' },
    { name: 'Dashboard', url: '/dashboard', key: 'dashboard' },
    { name: 'Strategy Page', url: '/strategic-content', key: 'strategy' },
    { name: 'Generate Page', url: '/generate-enhanced', key: 'generate' }
  ]
};

async function runUXReview() {
  console.log('🚀 Starting AIrWAVE UX Review...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Collect all console messages
  const allLogs = [];
  page.on('console', msg => {
    allLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Collect network failures
  const networkFailures = [];
  page.on('response', response => {
    if (!response.ok() && response.status() >= 400) {
      networkFailures.push({
        status: response.status(),
        url: response.url(),
        statusText: response.statusText()
      });
    }
  });

  for (const pageConfig of UX_CONFIG.pages) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🔍 REVIEWING: ${pageConfig.name} (${pageConfig.url})`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const startTime = Date.now();
      
      // Navigate to page
      await page.goto(`${UX_CONFIG.baseURL}${pageConfig.url}`, { 
        waitUntil: 'networkidle',
        timeout: UX_CONFIG.timeout 
      });

      const navigationTime = Date.now() - startTime;
      
      // Wait for page to stabilize
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({ 
        path: `ux-review-${pageConfig.key}.png`,
        fullPage: true 
      });

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart) || 0,
          loadComplete: Math.round(navigation?.loadEventEnd - navigation?.loadEventStart) || 0,
          firstPaint: Math.round(paintEntries.find(e => e.name === 'first-paint')?.startTime) || 0,
          firstContentfulPaint: Math.round(paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime) || 0,
          documentHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight
        };
      });

      // Check for accessibility issues
      const accessibilityCheck = await page.evaluate(() => {
        const issues = [];
        
        // Missing alt text
        const imgsWithoutAlt = document.querySelectorAll('img:not([alt])');
        if (imgsWithoutAlt.length > 0) {
          issues.push(`${imgsWithoutAlt.length} images missing alt text`);
        }
        
        // Missing form labels
        const inputsWithoutLabels = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
        const unlabeledInputs = Array.from(inputsWithoutLabels).filter(input => {
          const id = input.id;
          return !id || !document.querySelector(`label[for="${id}"]`);
        });
        if (unlabeledInputs.length > 0) {
          issues.push(`${unlabeledInputs.length} inputs missing labels`);
        }
        
        // Check heading structure
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        if (headings.length === 0) {
          issues.push('No heading structure found');
        }
        
        // Check for focus indicators
        const focusableElements = document.querySelectorAll('button, a, input, textarea, select');
        
        return {
          issues,
          elementCounts: {
            headings: headings.length,
            focusableElements: focusableElements.length,
            buttons: document.querySelectorAll('button').length,
            links: document.querySelectorAll('a[href]').length,
            forms: document.querySelectorAll('form').length
          }
        };
      });

      // Check for loading/error states
      const uiStates = await page.evaluate(() => {
        return {
          loadingElements: document.querySelectorAll('[class*="loading"], [class*="spinner"], .MuiCircularProgress-root').length,
          errorElements: document.querySelectorAll('[class*="error"], [role="alert"], .MuiAlert-standardError').length,
          emptyStates: document.querySelectorAll('[class*="empty"], [class*="no-data"]').length
        };
      });

      // Filter console logs for this page
      const pageConsoleErrors = allLogs.filter(log => 
        log.type === 'error' && 
        log.location.url.includes(pageConfig.url)
      );

      const pageNetworkFailures = networkFailures.filter(failure =>
        failure.url.includes(pageConfig.url) || failure.url.includes('localhost:3000')
      );

      // Calculate UX Score
      let uxScore = 100;
      
      // Performance penalties
      if (navigationTime > 3000) uxScore -= 10;
      if (metrics.domContentLoaded > 2000) uxScore -= 10;
      if (metrics.firstContentfulPaint > 1500) uxScore -= 5;
      
      // Error penalties
      uxScore -= Math.min(pageConsoleErrors.length * 5, 25);
      uxScore -= Math.min(pageNetworkFailures.length * 8, 25);
      
      // Accessibility penalties
      uxScore -= Math.min(accessibilityCheck.issues.length * 10, 20);
      
      // UI state penalties
      if (uiStates.errorElements > 0) uxScore -= 15;

      // Print detailed report
      console.log(`\n📊 PERFORMANCE METRICS:`);
      console.log(`   Navigation Time: ${navigationTime}ms`);
      console.log(`   DOM Content Loaded: ${metrics.domContentLoaded}ms`);
      console.log(`   Load Complete: ${metrics.loadComplete}ms`);
      console.log(`   First Paint: ${metrics.firstPaint}ms`);
      console.log(`   First Contentful Paint: ${metrics.firstContentfulPaint}ms`);

      console.log(`\n🚨 CONSOLE ISSUES:`);
      console.log(`   Console Errors: ${pageConsoleErrors.length}`);
      if (pageConsoleErrors.length > 0) {
        pageConsoleErrors.slice(0, 3).forEach(error => {
          console.log(`   - ${error.text.substring(0, 100)}...`);
        });
      }

      console.log(`\n🌐 NETWORK ISSUES:`);
      console.log(`   Failed Requests: ${pageNetworkFailures.length}`);
      if (pageNetworkFailures.length > 0) {
        pageNetworkFailures.slice(0, 3).forEach(failure => {
          console.log(`   - ${failure.status} ${failure.url.substring(0, 80)}...`);
        });
      }

      console.log(`\n♿ ACCESSIBILITY:`);
      console.log(`   Issues Found: ${accessibilityCheck.issues.length}`);
      accessibilityCheck.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });

      console.log(`\n🎯 UI ELEMENTS:`);
      console.log(`   Headings: ${accessibilityCheck.elementCounts.headings}`);
      console.log(`   Buttons: ${accessibilityCheck.elementCounts.buttons}`);
      console.log(`   Links: ${accessibilityCheck.elementCounts.links}`);
      console.log(`   Forms: ${accessibilityCheck.elementCounts.forms}`);
      console.log(`   Focusable Elements: ${accessibilityCheck.elementCounts.focusableElements}`);

      console.log(`\n🎨 UI STATES:`);
      console.log(`   Loading Elements: ${uiStates.loadingElements}`);
      console.log(`   Error Elements: ${uiStates.errorElements}`);
      console.log(`   Empty States: ${uiStates.emptyStates}`);

      console.log(`\n📱 LAYOUT:`);
      console.log(`   Page Height: ${metrics.documentHeight}px`);
      console.log(`   Viewport Height: ${metrics.viewportHeight}px`);
      console.log(`   Scrollable: ${metrics.documentHeight > metrics.viewportHeight ? 'Yes' : 'No'}`);

      // Final UX Score
      const finalScore = Math.max(Math.round(uxScore), 0);
      console.log(`\n🏆 UX SCORE: ${finalScore}/100`);
      
      if (finalScore >= 85) {
        console.log(`✅ EXCELLENT UX - Production ready!`);
      } else if (finalScore >= 70) {
        console.log(`🟡 GOOD UX - Minor improvements recommended`);
      } else if (finalScore >= 50) {
        console.log(`🟠 FAIR UX - Several issues need attention`);
      } else {
        console.log(`🔴 POOR UX - Significant problems found`);
      }

      // Page-specific recommendations
      console.log(`\n💡 RECOMMENDATIONS:`);
      if (navigationTime > 3000) {
        console.log(`   - Optimize page load time (currently ${navigationTime}ms)`);
      }
      if (pageConsoleErrors.length > 0) {
        console.log(`   - Fix ${pageConsoleErrors.length} console errors`);
      }
      if (pageNetworkFailures.length > 0) {
        console.log(`   - Resolve ${pageNetworkFailures.length} network failures`);
      }
      if (accessibilityCheck.issues.length > 0) {
        console.log(`   - Address accessibility issues: ${accessibilityCheck.issues.join(', ')}`);
      }
      if (uiStates.errorElements > 0) {
        console.log(`   - Remove or fix error state elements`);
      }
      if (accessibilityCheck.elementCounts.headings === 0) {
        console.log(`   - Add proper heading structure for screen readers`);
      }

    } catch (error) {
      console.error(`❌ UX Review failed for ${pageConfig.name}:`);
      console.error(`   Error: ${error.message}`);
      
      await page.screenshot({ 
        path: `ux-review-error-${pageConfig.key}.png`,
        fullPage: true 
      });
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 OVERALL UX SUMMARY`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Total Console Errors: ${allLogs.filter(log => log.type === 'error').length}`);
  console.log(`Total Network Failures: ${networkFailures.length}`);
  console.log(`Screenshots saved: ux-review-*.png`);
  console.log(`\n🎯 Focus Areas for ${new Date().toLocaleDateString()}:`);
  
  if (allLogs.filter(log => log.type === 'error').length > 0) {
    console.log(`   1. Fix console errors across all pages`);
  }
  if (networkFailures.length > 0) {
    console.log(`   2. Resolve network request failures`);  
  }
  console.log(`   3. Test brand guidelines upload functionality`);
  console.log(`   4. Verify generate page performance improvements`);
  console.log(`   5. Ensure strategy page UI components work properly`);

  await browser.close();
  console.log(`\n✅ UX Review completed!`);
}

// Check if server is running, then run review
const { spawn } = require('child_process');

console.log('🔧 Checking if development server is running...');

const checkServer = require('http').get('http://localhost:3000', (res) => {
  console.log('✅ Server is running, starting UX review...\n');
  runUXReview().catch(console.error);
}).on('error', (err) => {
  console.log('🚀 Starting development server...');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: false
  });
  
  serverProcess.stdout.on('data', (data) => {
    if (data.toString().includes('Ready in')) {
      console.log('✅ Server ready, starting UX review...\n');
      setTimeout(() => {
        runUXReview().then(() => {
          serverProcess.kill();
        }).catch(console.error);
      }, 2000);
    }
  });
  
  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });
});

checkServer.end();