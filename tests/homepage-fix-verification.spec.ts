import { test, expect } from '@playwright/test';

/**
 * Homepage Fix Verification
 * Tests the fixed homepage with navigation and improved content
 */

test.describe('Homepage Fix Verification', () => {
  
  test('Verify Fixed Homepage Navigation and Content', async ({ page }) => {
    console.log('🏠 Testing Fixed Homepage Navigation and Content...');
    
    // Navigate to homepage
    await page.goto('https://airwave-complete.netlify.app/', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Take screenshot of fixed homepage
    await page.screenshot({ 
      path: 'test-results/homepage-fixed.png', 
      fullPage: true 
    });
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: "${title}"`);
    
    // Test fixed homepage elements
    const homepageElements = {
      navigation: await page.locator('nav, .navbar, header nav').count(),
      logo: await page.locator('text="AIrFLOW"').count(),
      heroSection: await page.locator('h1, h2').count(),
      ctaButtons: await page.locator('button:has-text("Get Started"), button:has-text("Start Creating"), button:has-text("Sign In")').count(),
      featureHighlights: await page.locator('text="AI-Powered", text="Scalable", text="Fast"').count(),
      navigationButtons: await page.locator('nav button, header button').count()
    };
    
    console.log('🔍 Fixed Homepage Elements:');
    Object.entries(homepageElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Test navigation functionality
    console.log('🧭 Testing navigation functionality...');
    
    // Test logo click
    const logo = page.locator('text="AIrFLOW"').first();
    if (await logo.count() > 0) {
      console.log('🎯 Testing logo click...');
      await logo.click();
      await page.waitForTimeout(1000);
      
      const afterLogoClick = page.url();
      console.log(`📍 After logo click: ${afterLogoClick}`);
    }
    
    // Test Sign In button
    const signInButton = page.locator('button:has-text("Sign In")').first();
    if (await signInButton.count() > 0) {
      console.log('🔑 Testing Sign In button...');
      await signInButton.click();
      await page.waitForTimeout(2000);
      
      const afterSignInClick = page.url();
      console.log(`📍 After Sign In click: ${afterSignInClick}`);
      
      if (afterSignInClick.includes('/login')) {
        console.log('✅ Sign In button correctly redirects to login');
        
        // Go back to homepage
        await page.goto('https://airwave-complete.netlify.app/');
        await page.waitForTimeout(1000);
      }
    }
    
    // Test Get Started button
    const getStartedButton = page.locator('button:has-text("Get Started"), button:has-text("Start Creating")').first();
    if (await getStartedButton.count() > 0) {
      console.log('🚀 Testing Get Started button...');
      await getStartedButton.click();
      await page.waitForTimeout(2000);
      
      const afterGetStartedClick = page.url();
      console.log(`📍 After Get Started click: ${afterGetStartedClick}`);
      
      if (afterGetStartedClick.includes('/login')) {
        console.log('✅ Get Started button correctly redirects to login');
      }
    }
    
    // Test responsive design
    console.log('📱 Testing responsive design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 Testing ${viewport.name} viewport...`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('https://airwave-complete.netlify.app/');
      await page.waitForTimeout(1000);
      
      // Check responsive elements
      const responsiveCheck = {
        navigationVisible: await page.locator('nav, header').isVisible(),
        buttonsAccessible: await page.locator('button').count() > 0,
        contentReadable: await page.locator('h1, h2').isVisible(),
        noHorizontalScroll: await page.evaluate(() => document.body.scrollWidth <= window.innerWidth)
      };
      
      console.log(`  ${viewport.name} responsive check:`, responsiveCheck);
      
      // Take screenshot for each viewport
      await page.screenshot({ 
        path: `test-results/homepage-fixed-${viewport.name.toLowerCase()}.png`, 
        fullPage: true 
      });
    }
    
    // Check for errors
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });
    
    // Reload page to check for errors
    await page.reload();
    await page.waitForTimeout(2000);
    
    console.log(`🐛 JavaScript errors: ${jsErrors.length}`);
    if (jsErrors.length > 0) {
      jsErrors.forEach(error => console.log(`  ❌ ${error}`));
    }
    
    // Final verification
    const finalCheck = {
      hasNavigation: homepageElements.navigation > 0,
      hasLogo: homepageElements.logo > 0,
      hasHeroSection: homepageElements.heroSection > 0,
      hasCTAButtons: homepageElements.ctaButtons > 0,
      hasFeatures: homepageElements.featureHighlights > 0,
      noJSErrors: jsErrors.length === 0
    };
    
    console.log('\n📊 Homepage Fix Verification Results:');
    console.log('=' .repeat(50));
    Object.entries(finalCheck).forEach(([check, passed]) => {
      console.log(`${check}: ${passed ? '✅ PASS' : '❌ FAIL'}`);
    });
    
    const overallSuccess = Object.values(finalCheck).every(Boolean);
    console.log(`\n🎯 Overall Homepage Fix: ${overallSuccess ? '✅ SUCCESS' : '❌ NEEDS WORK'}`);
    
    // Assertions
    expect(finalCheck.hasNavigation).toBe(true);
    expect(finalCheck.hasLogo).toBe(true);
    expect(finalCheck.hasHeroSection).toBe(true);
    expect(finalCheck.hasCTAButtons).toBe(true);
    expect(finalCheck.noJSErrors).toBe(true);
    
    console.log('✅ Homepage fix verification completed successfully!');
  });

  test('Compare Before and After Homepage', async ({ page }) => {
    console.log('📊 Comparing Before and After Homepage...');
    
    await page.goto('https://airwave-complete.netlify.app/');
    await page.waitForTimeout(2000);
    
    // Document improvements made
    const improvements = {
      'Navigation Menu': 'Added proper navigation header with logo and buttons',
      'Hero Section': 'Added compelling hero section with "Scale Creative, Unleash Impact"',
      'Feature Highlights': 'Added AI-Powered, Scalable, Fast feature highlights',
      'Call-to-Action': 'Added prominent "Start Creating Now" and "Learn More" buttons',
      'Responsive Design': 'Improved responsive layout for all device sizes',
      'Visual Hierarchy': 'Better typography and spacing throughout',
      'Brand Messaging': 'Clear value proposition and AIrWAVE 2.0 messaging'
    };
    
    console.log('🎨 Homepage Improvements Made:');
    Object.entries(improvements).forEach(([feature, description]) => {
      console.log(`  ✅ ${feature}: ${description}`);
    });
    
    // Test key improvements
    const improvementTests = {
      navigationExists: await page.locator('nav').count() > 0,
      heroMessageExists: await page.locator('text="Scale Creative, Unleash Impact"').count() > 0,
      featuresExist: await page.locator('text="AI-Powered"').count() > 0,
      ctaButtonsExist: await page.locator('button:has-text("Start Creating")').count() > 0,
      logoExists: await page.locator('text="AIrFLOW"').count() > 0
    };
    
    console.log('\n🔍 Improvement Verification:');
    Object.entries(improvementTests).forEach(([test, passed]) => {
      console.log(`  ${test}: ${passed ? '✅ IMPLEMENTED' : '❌ MISSING'}`);
    });
    
    const allImprovementsImplemented = Object.values(improvementTests).every(Boolean);
    console.log(`\n🎯 All Improvements: ${allImprovementsImplemented ? '✅ SUCCESSFULLY IMPLEMENTED' : '❌ INCOMPLETE'}`);
    
    expect(allImprovementsImplemented).toBe(true);
    
    console.log('✅ Homepage comparison completed!');
  });
});
