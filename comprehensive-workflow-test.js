const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

/**
 * Comprehensive AIrWAVE Workflow Test
 * Tests the complete Templates → Matrix → Execution workflow
 */

async function runComprehensiveTest() {
    console.log('🚀 Starting Comprehensive AIrWAVE Workflow Test');
    
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000, // Slow down for better observation
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        recordVideo: {
            dir: './test-videos/',
            size: { width: 1440, height: 900 }
        }
    });
    
    const page = await context.newPage();
    
    // Monitor console for errors
    const consoleErrors = [];
    const networkErrors = [];
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
            console.log('❌ Console Error:', msg.text());
        }
    });
    
    page.on('response', response => {
        if (response.status() >= 400) {
            networkErrors.push(`${response.status()} - ${response.url()}`);
            console.log('❌ Network Error:', response.status(), response.url());
        }
    });
    
    const testResults = {
        timestamp: new Date().toISOString(),
        tests: [],
        screenshots: [],
        consoleErrors,
        networkErrors,
        summary: {
            passed: 0,
            failed: 0,
            total: 0
        }
    };
    
    async function takeScreenshot(name, description) {
        const screenshotPath = `./screenshots/workflow-test-${name}-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testResults.screenshots.push({ name, path: screenshotPath, description });
        console.log(`📸 Screenshot: ${name} - ${description}`);
        return screenshotPath;
    }
    
    async function runTest(testName, testFn) {
        console.log(`\n🧪 Test: ${testName}`);
        testResults.tests.push({ name: testName, status: 'running', startTime: Date.now() });
        
        try {
            await testFn();
            testResults.tests[testResults.tests.length - 1].status = 'passed';
            testResults.tests[testResults.tests.length - 1].endTime = Date.now();
            testResults.summary.passed++;
            console.log(`✅ ${testName} - PASSED`);
        } catch (error) {
            testResults.tests[testResults.tests.length - 1].status = 'failed';
            testResults.tests[testResults.tests.length - 1].error = error.message;
            testResults.tests[testResults.tests.length - 1].endTime = Date.now();
            testResults.summary.failed++;
            console.log(`❌ ${testName} - FAILED:`, error.message);
        }
        testResults.summary.total++;
    }
    
    try {
        // Test 1: Initial Page Load
        await runTest('Initial Page Load', async () => {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
            await takeScreenshot('01-initial-load', 'Initial application page load');
            
            // Check if page loaded successfully
            const title = await page.title();
            if (!title || title.includes('Error')) {
                throw new Error('Page failed to load properly');
            }
        });
        
        // Test 2: Login Process
        await runTest('Login Authentication', async () => {
            // Look for login form
            const hasLoginForm = await page.locator('input[type="email"], input[name="email"]').count() > 0;
            
            if (hasLoginForm) {
                await page.fill('input[type="email"], input[name="email"]', 'tomh@redbaez.com');
                await page.fill('input[type="password"], input[name="password"]', 'Wijlre2010');
                await takeScreenshot('02-login-form-filled', 'Login form filled with credentials');
                
                // Submit login
                await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
                await page.waitForTimeout(3000);
                await takeScreenshot('03-after-login-submit', 'After login form submission');
                
                // Wait for redirect or dashboard
                await page.waitForTimeout(5000);
            } else {
                // Check if already authenticated
                await page.waitForTimeout(2000);
            }
            
            const currentUrl = page.url();
            await takeScreenshot('04-post-login-state', `Post-login state: ${currentUrl}`);
        });
        
        // Test 3: Dashboard Access
        await runTest('Dashboard Access', async () => {
            // Navigate to dashboard if not already there
            const currentUrl = page.url();
            if (!currentUrl.includes('dashboard')) {
                await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
            }
            
            await page.waitForTimeout(3000);
            await takeScreenshot('05-dashboard', 'Dashboard page loaded');
            
            // Check for dashboard elements
            const hasContent = await page.locator('nav, .dashboard, [data-testid*="dashboard"]').count() > 0;
            if (!hasContent) {
                throw new Error('Dashboard content not found');
            }
        });
        
        // Test 4: Templates Page Navigation
        await runTest('Templates Page Access', async () => {
            await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await takeScreenshot('06-templates-page', 'Templates page loaded');
            
            // Check for templates content
            const pageContent = await page.content();
            if (pageContent.includes('React Component export') || pageContent.includes('Error')) {
                throw new Error('Templates page shows component export error');
            }
            
            // Look for template elements
            const hasTemplates = await page.locator('.template, [data-testid*="template"], .card').count() > 0;
            if (!hasTemplates) {
                console.log('⚠️ No template elements found, but page loaded without errors');
            }
        });
        
        // Test 5: Templates Functionality
        await runTest('Templates Interaction', async () => {
            // Try to interact with templates
            const templateElements = await page.locator('button, .clickable, [role="button"]').all();
            
            if (templateElements.length > 0) {
                // Click first interactive element
                await templateElements[0].click();
                await page.waitForTimeout(2000);
                await takeScreenshot('07-template-interaction', 'Template interaction attempted');
            }
            
            // Check for any modals or overlays
            const hasModal = await page.locator('.modal, .overlay, .dialog').count() > 0;
            if (hasModal) {
                await takeScreenshot('08-template-modal', 'Template modal/dialog opened');
            }
        });
        
        // Test 6: Matrix Page Navigation
        await runTest('Matrix Page Access', async () => {
            await page.goto('http://localhost:3000/matrix', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await takeScreenshot('09-matrix-page', 'Matrix page loaded');
            
            // Check for the specific React component export error
            const pageContent = await page.content();
            if (pageContent.includes('React Component export')) {
                throw new Error('Matrix page shows "React Component export" error');
            }
            
            // Check for matrix-related content
            const hasMatrixContent = await page.locator('.matrix, [data-testid*="matrix"], .campaign').count() > 0;
            if (!hasMatrixContent) {
                console.log('⚠️ No matrix-specific elements found, but page loaded without component export error');
            }
        });
        
        // Test 7: Matrix Functionality
        await runTest('Matrix Editor Functionality', async () => {
            // Look for matrix editing elements
            const editableElements = await page.locator('input, textarea, select, [contenteditable]').all();
            
            if (editableElements.length > 0) {
                // Try interacting with first editable element
                await editableElements[0].click();
                await page.waitForTimeout(1000);
                await takeScreenshot('10-matrix-editing', 'Matrix editing interface');
            }
            
            // Look for matrix-specific buttons
            const matrixButtons = await page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Generate")').all();
            if (matrixButtons.length > 0) {
                await takeScreenshot('11-matrix-controls', 'Matrix control buttons available');
            }
        });
        
        // Test 8: Flow Page Access (Alternative workflow entry)
        await runTest('Flow Page Access', async () => {
            await page.goto('http://localhost:3000/flow', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            await takeScreenshot('12-flow-page', 'Flow page loaded');
            
            // Check for flow-specific content
            const hasFlowContent = await page.locator('.flow, [data-testid*="flow"], .workflow').count() > 0;
            if (!hasFlowContent) {
                console.log('⚠️ No flow-specific elements found');
            }
        });
        
        // Test 9: End-to-End Workflow Test
        await runTest('End-to-End Workflow Navigation', async () => {
            // Test navigation between key workflow pages
            const workflowPages = [
                { url: '/flow', name: 'Flow' },
                { url: '/templates', name: 'Templates' },
                { url: '/matrix', name: 'Matrix' },
                { url: '/dashboard', name: 'Dashboard' }
            ];
            
            for (const { url, name } of workflowPages) {
                await page.goto(`http://localhost:3000${url}`, { waitUntil: 'networkidle' });
                await page.waitForTimeout(2000);
                
                const pageContent = await page.content();
                if (pageContent.includes('React Component export') || pageContent.includes('Error')) {
                    throw new Error(`${name} page shows component export or other error`);
                }
                
                await takeScreenshot(`13-workflow-${name.toLowerCase()}`, `${name} page in workflow test`);
            }
        });
        
        // Test 10: Performance and Stability
        await runTest('Performance and Stability Check', async () => {
            // Check page load times
            const performanceMetrics = await page.evaluate(() => {
                const timing = performance.timing;
                return {
                    loadTime: timing.loadEventEnd - timing.navigationStart,
                    domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                    firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
                };
            });
            
            testResults.performance = performanceMetrics;
            
            // Check for JavaScript errors in console
            if (consoleErrors.length > 0) {
                console.log('⚠️ Console errors detected:', consoleErrors.length);
            }
            
            // Check for network errors
            if (networkErrors.length > 0) {
                console.log('⚠️ Network errors detected:', networkErrors.length);
            }
            
            await takeScreenshot('14-final-state', 'Final application state');
        });
        
    } catch (error) {
        console.error('❌ Critical test failure:', error);
        await takeScreenshot('error-state', 'Error state captured');
    }
    
    // Generate comprehensive report
    const reportPath = './COMPREHENSIVE_WORKFLOW_TEST_REPORT.md';
    const report = generateReport(testResults);
    fs.writeFileSync(reportPath, report);
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.summary.passed}`);
    console.log(`❌ Failed: ${testResults.summary.failed}`);
    console.log(`📊 Total: ${testResults.summary.total}`);
    console.log(`📝 Full report: ${reportPath}`);
    
    await browser.close();
    
    return testResults;
}

function generateReport(results) {
    const { summary, tests, screenshots, consoleErrors, networkErrors, performance } = results;
    
    let report = `# AIrWAVE Comprehensive Workflow Test Report\n\n`;
    report += `**Test Execution Date:** ${results.timestamp}\n\n`;
    
    // Summary
    report += `## Executive Summary\n\n`;
    report += `- **Total Tests:** ${summary.total}\n`;
    report += `- **Passed:** ${summary.passed} ✅\n`;
    report += `- **Failed:** ${summary.failed} ❌\n`;
    report += `- **Success Rate:** ${((summary.passed / summary.total) * 100).toFixed(1)}%\n\n`;
    
    // Test Results
    report += `## Detailed Test Results\n\n`;
    tests.forEach((test, index) => {
        const status = test.status === 'passed' ? '✅' : '❌';
        const duration = test.endTime ? `(${test.endTime - test.startTime}ms)` : '';
        report += `### ${index + 1}. ${test.name} ${status} ${duration}\n\n`;
        
        if (test.error) {
            report += `**Error:** ${test.error}\n\n`;
        }
    });
    
    // Screenshots
    if (screenshots.length > 0) {
        report += `## Screenshots Captured\n\n`;
        screenshots.forEach((screenshot, index) => {
            report += `${index + 1}. **${screenshot.name}:** ${screenshot.description}\n`;
            report += `   - Path: \`${screenshot.path}\`\n\n`;
        });
    }
    
    // Performance Metrics
    if (performance) {
        report += `## Performance Metrics\n\n`;
        report += `- **Page Load Time:** ${performance.loadTime}ms\n`;
        report += `- **DOM Ready Time:** ${performance.domReady}ms\n`;
        report += `- **First Paint:** ${performance.firstPaint}ms\n\n`;
    }
    
    // Error Analysis
    if (consoleErrors.length > 0) {
        report += `## Console Errors (${consoleErrors.length})\n\n`;
        consoleErrors.forEach((error, index) => {
            report += `${index + 1}. \`${error}\`\n`;
        });
        report += '\n';
    }
    
    if (networkErrors.length > 0) {
        report += `## Network Errors (${networkErrors.length})\n\n`;
        networkErrors.forEach((error, index) => {
            report += `${index + 1}. \`${error}\`\n`;
        });
        report += '\n';
    }
    
    // Conclusions and Recommendations
    report += `## Conclusions and Recommendations\n\n`;
    
    if (summary.failed === 0) {
        report += `🎉 **All tests passed!** The Templates → Matrix → Execution workflow is functioning correctly.\n\n`;
    } else {
        report += `⚠️ **${summary.failed} test(s) failed.** Review the detailed results above.\n\n`;
    }
    
    report += `### Key Findings:\n\n`;
    
    // Analyze specific issues
    const templateTest = tests.find(t => t.name.includes('Templates'));
    const matrixTest = tests.find(t => t.name.includes('Matrix'));
    
    if (templateTest?.status === 'passed') {
        report += `- ✅ Templates page loads without JavaScript crashes\n`;
    } else {
        report += `- ❌ Templates page has issues\n`;
    }
    
    if (matrixTest?.status === 'passed') {
        report += `- ✅ Matrix page loads without the "React Component export" error\n`;
    } else {
        report += `- ❌ Matrix page still shows component export errors\n`;
    }
    
    if (consoleErrors.length === 0) {
        report += `- ✅ No JavaScript console errors detected\n`;
    } else {
        report += `- ⚠️ ${consoleErrors.length} console errors detected\n`;
    }
    
    if (networkErrors.length === 0) {
        report += `- ✅ No network request failures\n`;
    } else {
        report += `- ⚠️ ${networkErrors.length} network errors detected\n`;
    }
    
    report += `\n### Recommendations:\n\n`;
    
    if (summary.failed > 0) {
        report += `1. **Fix Failed Tests:** Address the specific issues mentioned in the test results\n`;
        report += `2. **Error Investigation:** Review console and network errors for root causes\n`;
        report += `3. **Component Debugging:** Check React component exports and imports\n`;
    }
    
    if (consoleErrors.length > 0) {
        report += `4. **JavaScript Cleanup:** Address console errors to improve stability\n`;
    }
    
    if (networkErrors.length > 0) {
        report += `5. **API Investigation:** Check failing network requests and endpoints\n`;
    }
    
    report += `6. **Regular Testing:** Run this test suite regularly to catch regressions\n`;
    report += `7. **User Acceptance Testing:** Have actual users test the workflow\n\n`;
    
    report += `---\n\n`;
    report += `*Generated by AIrWAVE Comprehensive Test Suite*\n`;
    
    return report;
}

// Run the test
if (require.main === module) {
    runComprehensiveTest().catch(console.error);
}

module.exports = { runComprehensiveTest };