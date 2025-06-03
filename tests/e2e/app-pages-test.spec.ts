import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Airwave Application Pages Test', () => {
  test.setTimeout(120000); // Set timeout to 2 minutes for the entire test
  const baseUrl = 'http://localhost:3001';
  const credentials = {
    email: 'tomh@redbaez.com',
    password: 'Wijlre2010'
  };

  test.beforeEach(async ({ page }) => {
    // Set up console error listener
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Attach console errors to the page for later access
    (page as any).consoleErrors = consoleErrors;
  });

  test('Login and test all main application pages', async ({ page }) => {
    // Navigate to login page
    await page.goto(`${baseUrl}/login`);
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of login page
    await page.screenshot({ 
      path: 'screenshots/01-login-page.png',
      fullPage: true 
    });
    
    // Perform login
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    // Test Dashboard
    console.log('Testing Dashboard...');
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow time for data to load
    
    await page.screenshot({ 
      path: 'screenshots/02-dashboard.png',
      fullPage: true 
    });
    
    const dashboardErrors = (page as any).consoleErrors;
    console.log('Dashboard console errors:', dashboardErrors.length > 0 ? dashboardErrors : 'None');
    
    // Check for key dashboard elements
    const dashboardChecks = {
      hasHeader: await page.locator('header').isVisible(),
      hasSidebar: await page.locator('aside, nav').isVisible(),
      hasContent: await page.locator('main').isVisible(),
      hasClientData: await page.locator('text=/client|campaign|content/i').isVisible()
    };
    console.log('Dashboard UI checks:', dashboardChecks);
    
    // Test Campaigns
    console.log('Testing Campaigns...');
    await page.goto(`${baseUrl}/campaigns`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/03-campaigns.png',
      fullPage: true 
    });
    
    const campaignErrors = (page as any).consoleErrors;
    console.log('Campaigns console errors:', campaignErrors.length > 0 ? campaignErrors : 'None');
    
    // Test Content Library
    console.log('Testing Content Library...');
    await page.goto(`${baseUrl}/content`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/04-content-library.png',
      fullPage: true 
    });
    
    const contentErrors = (page as any).consoleErrors;
    console.log('Content Library console errors:', contentErrors.length > 0 ? contentErrors : 'None');
    
    // Test Analytics
    console.log('Testing Analytics...');
    await page.goto(`${baseUrl}/analytics`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/05-analytics.png',
      fullPage: true 
    });
    
    const analyticsErrors = (page as any).consoleErrors;
    console.log('Analytics console errors:', analyticsErrors.length > 0 ? analyticsErrors : 'None');
    
    // Test AI Tools
    console.log('Testing AI Tools...');
    await page.goto(`${baseUrl}/ai-tools`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'screenshots/06-ai-tools.png',
      fullPage: true 
    });
    
    const aiToolsErrors = (page as any).consoleErrors;
    console.log('AI Tools console errors:', aiToolsErrors.length > 0 ? aiToolsErrors : 'None');
    
    // Summary
    console.log('\n=== Test Summary ===');
    console.log('All pages tested and screenshots captured in screenshots/ directory');
    console.log('Total console errors found:', (page as any).consoleErrors.length);
  });
});