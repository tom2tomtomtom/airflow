const { chromium } = require('playwright');

async function runDetailedDiagnostics() {
  console.log('🔍 Running Detailed UX Diagnostics...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const allErrors = [];
  const allNetworkFailures = [];
  const allWarnings = [];

  // Comprehensive console monitoring
  page.on('console', msg => {
    const logData = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location(),
      timestamp: new Date().toISOString()
    };
    
    if (msg.type() === 'error') {
      allErrors.push(logData);
    } else if (msg.type() === 'warning') {
      allWarnings.push(logData);
    }
    
    // Log immediately for debugging
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`🚨 ${msg.type().toUpperCase()}: ${msg.text()}`);
      if (msg.location().url) {
        console.log(`   📍 Location: ${msg.location().url}:${msg.location().lineNumber}`);
      }
    }
  });

  // Network monitoring
  page.on('response', response => {
    if (!response.ok()) {
      const failure = {
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        timestamp: new Date().toISOString()
      };
      allNetworkFailures.push(failure);
      console.log(`🌐 NETWORK FAILURE: ${response.status()} ${response.url()}`);
    }
  });

  page.on('requestfailed', request => {
    const failure = {
      status: 'FAILED',
      statusText: request.failure()?.errorText || 'Unknown error',
      url: request.url(),
      timestamp: new Date().toISOString()
    };
    allNetworkFailures.push(failure);
    console.log(`🌐 REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  const testPages = [
    { name: 'Login', url: '/login' },
    { name: 'Dashboard', url: '/dashboard' },
    { name: 'Strategy', url: '/strategic-content' },
    { name: 'Generate', url: '/generate-enhanced' }
  ];

  for (const testPage of testPages) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🔍 DIAGNOSING: ${testPage.name}`);
    console.log(`${'='.repeat(50)}`);
    
    try {
      await page.goto(`http://localhost:3000${testPage.url}`, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // Wait for any async operations
      await page.waitForTimeout(5000);

      // Check for specific UI issues
      const uiDiagnostics = await page.evaluate(() => {
        const diagnostics = {
          missingAltImages: [],
          unlabeledInputs: [],
          errorElements: [],
          loadingElements: [],
          brokenLinks: []
        };

        // Check images without alt text
        document.querySelectorAll('img:not([alt])').forEach((img, i) => {
          diagnostics.missingAltImages.push({
            src: img.src || 'no-src',
            index: i
          });
        });

        // Check inputs without proper labels
        document.querySelectorAll('input').forEach((input, i) => {
          if (!input.getAttribute('aria-label') && 
              !input.getAttribute('aria-labelledby') && 
              (!input.id || !document.querySelector(`label[for="${input.id}"]`))) {
            diagnostics.unlabeledInputs.push({
              type: input.type,
              name: input.name || 'no-name',
              id: input.id || 'no-id',
              index: i
            });
          }
        });

        // Check for error elements
        document.querySelectorAll('[class*="error"], [role="alert"]').forEach((el, i) => {
          diagnostics.errorElements.push({
            tagName: el.tagName,
            className: el.className,
            text: el.textContent?.substring(0, 100) || 'no-text',
            index: i
          });
        });

        // Check for loading elements
        document.querySelectorAll('[class*="loading"], [class*="spinner"]').forEach((el, i) => {
          diagnostics.loadingElements.push({
            tagName: el.tagName,
            className: el.className,
            index: i
          });
        });

        // Check for broken links
        document.querySelectorAll('a[href]').forEach((link, i) => {
          if (link.href === '' || link.href === '#' || link.href.includes('javascript:')) {
            diagnostics.brokenLinks.push({
              href: link.href,
              text: link.textContent?.substring(0, 50) || 'no-text',
              index: i
            });
          }
        });

        return diagnostics;
      });

      // Report UI diagnostics
      console.log(`\n📊 UI DIAGNOSTICS for ${testPage.name}:`);
      
      if (uiDiagnostics.missingAltImages.length > 0) {
        console.log(`   🖼️  Images missing alt text: ${uiDiagnostics.missingAltImages.length}`);
        uiDiagnostics.missingAltImages.slice(0, 3).forEach(img => {
          console.log(`      - ${img.src}`);
        });
      }

      if (uiDiagnostics.unlabeledInputs.length > 0) {
        console.log(`   📝 Inputs missing labels: ${uiDiagnostics.unlabeledInputs.length}`);
        uiDiagnostics.unlabeledInputs.forEach(input => {
          console.log(`      - ${input.type} input (name: ${input.name}, id: ${input.id})`);
        });
      }

      if (uiDiagnostics.errorElements.length > 0) {
        console.log(`   ❌ Error elements found: ${uiDiagnostics.errorElements.length}`);
        uiDiagnostics.errorElements.forEach(error => {
          console.log(`      - ${error.tagName} (${error.className}): ${error.text}`);
        });
      }

      if (uiDiagnostics.loadingElements.length > 0) {
        console.log(`   ⏳ Loading elements found: ${uiDiagnostics.loadingElements.length}`);
      }

      if (uiDiagnostics.brokenLinks.length > 0) {
        console.log(`   🔗 Broken links found: ${uiDiagnostics.brokenLinks.length}`);
        uiDiagnostics.brokenLinks.forEach(link => {
          console.log(`      - "${link.text}" -> ${link.href}`);
        });
      }

    } catch (error) {
      console.error(`❌ Error diagnosing ${testPage.name}: ${error.message}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 COMPREHENSIVE DIAGNOSTIC SUMMARY`);
  console.log(`${'='.repeat(60)}`);

  console.log(`\n🚨 CONSOLE ERRORS (${allErrors.length} total):`);
  allErrors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error.text}`);
    if (error.location.url) {
      console.log(`      📍 ${error.location.url}:${error.location.lineNumber}`);
    }
  });

  console.log(`\n⚠️  CONSOLE WARNINGS (${allWarnings.length} total):`);
  allWarnings.slice(0, 10).forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning.text}`);
  });

  console.log(`\n🌐 NETWORK FAILURES (${allNetworkFailures.length} total):`);
  allNetworkFailures.forEach((failure, i) => {
    console.log(`   ${i + 1}. ${failure.status} ${failure.statusText}`);
    console.log(`      🔗 ${failure.url}`);
  });

  console.log(`\n🎯 PRIORITY FIXES:`);
  if (allErrors.length > 0) {
    console.log(`   1. 🔥 HIGH: Fix ${allErrors.length} console errors`);
  }
  if (allNetworkFailures.length > 0) {
    console.log(`   2. 🔥 HIGH: Resolve ${allNetworkFailures.length} network failures`);
  }
  console.log(`   3. 🟡 MEDIUM: Improve accessibility labels`);
  console.log(`   4. 🟡 MEDIUM: Remove error state elements from UI`);
  console.log(`   5. 🟢 LOW: Optimize page load times`);

  await browser.close();
  console.log(`\n✅ Detailed diagnostics completed!`);
}

// Run diagnostics
runDetailedDiagnostics().catch(console.error);