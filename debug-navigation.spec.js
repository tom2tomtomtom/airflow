const { test, expect } = require('@playwright/test');

test.describe('Navigation Debug Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log(`CONSOLE ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', error => console.log(`PAGE ERROR: ${error.message}`));
    page.on('requestfailed', request => console.log(`FAILED REQUEST: ${request.url()} - ${request.failure()?.errorText}`));
  });

  test('Debug Flow navigation - double click issue', async ({ page }) => {
    console.log('Starting Flow navigation debug test...');
    
    // Go to dashboard first
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    console.log('Dashboard loaded');

    // Take screenshot of dashboard
    await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });
    
    // First click on Flow
    console.log('First click on Flow navigation...');
    const startTime = Date.now();
    
    await page.click('text=Flow');
    await page.waitForLoadState('networkidle');
    
    const firstClickTime = Date.now() - startTime;
    console.log(`First click took: ${firstClickTime}ms`);
    console.log(`Current URL after first click: ${page.url()}`);
    
    // Take screenshot after first click
    await page.screenshot({ path: 'debug-first-flow-click.png', fullPage: true });
    
    // Check if we're back on dashboard or on flow page
    const currentPath = new URL(page.url()).pathname;
    console.log(`Current path: ${currentPath}`);
    
    if (currentPath === '/dashboard') {
      console.log('ISSUE CONFIRMED: First click returned to dashboard');
      
      // Second click on Flow
      console.log('Second click on Flow navigation...');
      const secondStartTime = Date.now();
      
      await page.click('text=Flow');
      await page.waitForLoadState('networkidle');
      
      const secondClickTime = Date.now() - secondStartTime;
      console.log(`Second click took: ${secondClickTime}ms`);
      console.log(`Current URL after second click: ${page.url()}`);
      
      // Take screenshot after second click
      await page.screenshot({ path: 'debug-second-flow-click.png', fullPage: true });
    } else if (currentPath === '/flow') {
      console.log('SUCCESS: First click went to Flow page correctly');
    } else {
      console.log(`UNEXPECTED: Went to ${currentPath}`);
    }

    // Test other navigation items
    const navItems = ['Clients', 'Campaigns', 'Assets', 'Matrix', 'Templates'];
    
    for (const navItem of navItems) {
      console.log(`\nTesting ${navItem} navigation...`);
      const navStartTime = Date.now();
      
      try {
        await page.click(`text=${navItem}`);
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        const navTime = Date.now() - navStartTime;
        console.log(`${navItem} navigation took: ${navTime}ms`);
        console.log(`${navItem} URL: ${page.url()}`);
        
        // Take screenshot
        await page.screenshot({ path: `debug-${navItem.toLowerCase()}-page.png`, fullPage: true });
        
      } catch (error) {
        console.log(`ERROR navigating to ${navItem}: ${error.message}`);
        await page.screenshot({ path: `debug-${navItem.toLowerCase()}-error.png`, fullPage: true });
      }
    }
  });

  test('Measure page load performance', async ({ page }) => {
    console.log('Starting performance measurement...');
    
    const pages = [
      '/dashboard',
      '/flow', 
      '/clients',
      '/campaigns',
      '/assets',
      '/matrix',
      '/templates'
    ];

    for (const pagePath of pages) {
      console.log(`\nTesting performance for ${pagePath}...`);
      
      const startTime = Date.now();
      await page.goto(`http://localhost:3000${pagePath}`);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      console.log(`${pagePath} load time: ${loadTime}ms`);
      
      // Check for JavaScript errors
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      
      // Wait a bit more to catch any delayed errors
      await page.waitForTimeout(2000);
      
      if (errors.length > 0) {
        console.log(`JavaScript errors on ${pagePath}:`, errors);
      }
      
      // Take performance screenshot
      await page.screenshot({ path: `perf-${pagePath.replace('/', '')}.png`, fullPage: true });
    }
  });

  test('Check for JavaScript errors and console warnings', async ({ page }) => {
    console.log('Checking for JavaScript errors...');
    
    const errors = [];
    const warnings = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      } else if (msg.type() === 'warning') {
        warnings.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(`Page Error: ${error.message}`);
    });
    
    // Test key pages
    const testPages = ['/dashboard', '/flow', '/clients', '/campaigns'];
    
    for (const pagePath of testPages) {
      console.log(`Checking errors on ${pagePath}...`);
      await page.goto(`http://localhost:3000${pagePath}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Let page settle
    }
    
    console.log(`Total errors found: ${errors.length}`);
    console.log(`Total warnings found: ${warnings.length}`);
    
    if (errors.length > 0) {
      console.log('\nJavaScript Errors:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log('\nJavaScript Warnings:');
      warnings.slice(0, 10).forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }
  });
});