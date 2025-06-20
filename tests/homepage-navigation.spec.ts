import { test, expect } from '@playwright/test';

/**
 * Homepage & Navigation Testing
 * Tests homepage functionality, navigation, and public page elements
 */

test.describe('Homepage & Navigation', () => {
  
  test('Test Homepage Loading and Core Elements', async ({ page }) => {
    console.log('🏠 Testing Homepage Loading and Core Elements...');
    
    // Navigate to homepage
    await page.goto('https://airwave-complete.netlify.app/', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot of homepage
    await page.screenshot({ 
      path: 'test-results/homepage-loaded.png', 
      fullPage: true 
    });
    
    // Check page title and meta information
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Check core homepage elements
    const homepageElements = {
      navigation: await page.locator('nav, .navbar, header nav').count(),
      logo: await page.locator('img[alt*="logo" i], .logo, [data-testid*="logo"]').count(),
      heroSection: await page.locator('.hero, .banner, h1').count(),
      ctaButtons: await page.locator('button:has-text("Get Started"), button:has-text("Try"), a:has-text("Start")').count(),
      loginLink: await page.locator('a:has-text("Login"), a:has-text("Sign In")').count(),
      signupLink: await page.locator('a:has-text("Sign Up"), a:has-text("Register")').count()
    };
    
    console.log('🔍 Homepage Elements Found:');
    Object.entries(homepageElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Test main navigation links
    const navLinks = await page.locator('nav a, .navbar a, header a').all();
    console.log(`🧭 Found ${navLinks.length} navigation links`);
    
    const navigationItems = [];
    for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
      const link = navLinks[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      if (text && text.trim()) {
        navigationItems.push({ text: text.trim(), href });
        console.log(`  📎 ${text.trim()} → ${href}`);
      }
    }
    
    // Test hero section content
    const heroText = await page.locator('h1, .hero h1, .banner h1').first().textContent();
    if (heroText) {
      console.log(`🎯 Hero text: "${heroText.trim()}"`);
    }
    
    // Test CTA functionality
    const ctaButton = page.locator('button:has-text("Get Started"), button:has-text("Try"), a:has-text("Start")').first();
    if (await ctaButton.count() > 0) {
      console.log('🎯 Testing CTA button...');
      await ctaButton.click();
      await page.waitForTimeout(2000);
      
      const afterClickUrl = page.url();
      console.log(`📍 After CTA click: ${afterClickUrl}`);
      
      // Take screenshot after CTA click
      await page.screenshot({ 
        path: 'test-results/homepage-after-cta.png', 
        fullPage: true 
      });
    }
    
    // Basic assertions
    expect(title).toBeTruthy();
    expect(homepageElements.navigation).toBeGreaterThan(0);
    
    console.log('✅ Homepage testing completed');
  });

  test('Test Navigation Menu Functionality', async ({ page }) => {
    console.log('🧭 Testing Navigation Menu Functionality...');
    
    await page.goto('https://airwave-complete.netlify.app/', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    // Test mobile menu toggle if present
    const mobileMenuToggle = page.locator('button[aria-label*="menu" i], .hamburger, .menu-toggle').first();
    if (await mobileMenuToggle.count() > 0) {
      console.log('📱 Testing mobile menu toggle...');
      await mobileMenuToggle.click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ 
        path: 'test-results/mobile-menu-open.png', 
        fullPage: true 
      });
    }
    
    // Test navigation links that should work
    const workingNavLinks = [
      { text: 'Home', expectedUrl: '/' },
      { text: 'Login', expectedUrl: '/login' },
      { text: 'Sign Up', expectedUrl: '/signup' }
    ];
    
    for (const navItem of workingNavLinks) {
      console.log(`🔍 Testing navigation to ${navItem.text}...`);
      
      const navLink = page.locator(`nav a:has-text("${navItem.text}"), .navbar a:has-text("${navItem.text}")`).first();
      if (await navLink.count() > 0) {
        await navLink.click();
        await page.waitForTimeout(2000);
        
        const currentUrl = page.url();
        const isCorrectPage = currentUrl.includes(navItem.expectedUrl);
        
        console.log(`  ${navItem.text}: ${isCorrectPage ? '✅ Working' : '❌ Not Working'} (${currentUrl})`);
        
        // Go back to homepage for next test
        await page.goto('https://airwave-complete.netlify.app/');
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('✅ Navigation menu testing completed');
  });

  test('Test Page Performance and Loading', async ({ page }) => {
    console.log('⚡ Testing Page Performance and Loading...');
    
    // Measure page load time
    const startTime = Date.now();
    
    await page.goto('https://airwave-complete.netlify.app/', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Page load time: ${loadTime}ms`);
    
    // Check for loading states
    const loadingElements = await page.locator('.loading, .spinner, [data-testid*="loading"]').count();
    console.log(`⏳ Loading indicators found: ${loadingElements}`);
    
    // Check for error messages
    const errorElements = await page.locator('.error, .alert-error, [role="alert"]').count();
    console.log(`❌ Error messages found: ${errorElements}`);
    
    // Test image loading
    const images = await page.locator('img').all();
    console.log(`🖼️ Total images found: ${images.length}`);
    
    let loadedImages = 0;
    for (const img of images.slice(0, 5)) { // Test first 5 images
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight !== 0);
      if (isLoaded) loadedImages++;
    }
    
    console.log(`✅ Images loaded: ${loadedImages}/${Math.min(images.length, 5)}`);
    
    // Test JavaScript functionality
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Trigger some interactions to test JS
    await page.click('body'); // Simple click to trigger any JS
    await page.waitForTimeout(1000);
    
    console.log(`🐛 JavaScript errors: ${jsErrors.length}`);
    if (jsErrors.length > 0) {
      jsErrors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    // Performance assertions
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    expect(errorElements).toBe(0); // Should have no visible errors
    
    console.log('✅ Performance testing completed');
  });

  test('Test Responsive Design Elements', async ({ page }) => {
    console.log('📱 Testing Responsive Design Elements...');
    
    // Test different viewport sizes
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 Testing ${viewport.name} viewport (${viewport.width}x${viewport.height})...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://airwave-complete.netlify.app/', { 
        timeout: 30000,
        waitUntil: 'networkidle' 
      });
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/homepage-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
      
      // Check if navigation is responsive
      const navVisible = await page.locator('nav, .navbar').isVisible();
      const mobileMenuExists = await page.locator('button[aria-label*="menu" i], .hamburger').count() > 0;
      
      console.log(`  Navigation visible: ${navVisible}`);
      console.log(`  Mobile menu available: ${mobileMenuExists}`);
      
      // Check if content is properly sized
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;
      const hasHorizontalScroll = bodyWidth > viewportWidth;
      
      console.log(`  Horizontal scroll needed: ${hasHorizontalScroll}`);
      
      if (viewport.name === 'Mobile' && !mobileMenuExists && navVisible) {
        console.log('  ⚠️ Mobile navigation might need improvement');
      }
    }
    
    console.log('✅ Responsive design testing completed');
  });
});
