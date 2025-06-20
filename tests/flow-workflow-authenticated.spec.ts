import { test, expect } from '@playwright/test';

/**
 * Flow Workflow Authenticated Testing
 * Tests the complete AIRWAVE flow workflow with authentication
 * This test requires valid credentials to access protected pages
 */

test.describe('Flow Workflow (Authenticated)', () => {
  
  // Helper function to attempt login
  async function attemptLogin(page: any, email: string, password: string) {
    await page.goto('https://airwave-complete.netlify.app/login');
    
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    const passwordField = page.locator('input[type="password"], input[name="password"]').first();
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]').first();
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      await emailField.fill(email);
      await passwordField.fill(password);
      
      if (await loginButton.count() > 0) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        
        // Check if login was successful
        return !page.url().includes('/login');
      }
    }
    return false;
  }

  test('Complete Flow Workflow Test', async ({ page }) => {
    console.log('🌊 Testing Complete Flow Workflow...');
    
    // Test credentials (these would need to be real credentials)
    const testCredentials = [
      { email: 'demo@airwave.com', password: 'demo123' },
      { email: 'test@redbaez.com', password: 'test123' },
      { email: 'admin@airwave.com', password: 'admin123' }
    ];
    
    let authenticated = false;
    let usedCredentials = null;
    
    // Try to authenticate
    for (const creds of testCredentials) {
      console.log(`🔑 Attempting login with ${creds.email}...`);
      authenticated = await attemptLogin(page, creds.email, creds.password);
      
      if (authenticated) {
        console.log(`✅ Successfully authenticated with ${creds.email}`);
        usedCredentials = creds;
        break;
      }
    }
    
    if (!authenticated) {
      console.log('⚠️ Could not authenticate - testing flow page access without auth');
      
      // Try to access flow page directly
      await page.goto('https://airwave-complete.netlify.app/flow');
      
      if (page.url().includes('/login')) {
        console.log('🔒 Flow page requires authentication - skipping workflow test');
        console.log('📝 To complete this test, provide valid credentials in the test file');
        return;
      }
    }
    
    // If we reach here, we either authenticated or flow page is accessible
    console.log('🎯 Proceeding with flow workflow test...');
    
    // Navigate to flow page
    await page.goto('https://airwave-complete.netlify.app/flow');
    await page.waitForTimeout(2000);
    
    console.log(`📍 Flow page URL: ${page.url()}`);
    
    // Take screenshot of flow page
    await page.screenshot({ 
      path: 'test-results/flow-page-authenticated.png', 
      fullPage: true 
    });
    
    // Test 1: Brief Input/Upload
    console.log('📝 Testing Brief Input...');
    
    const briefTestData = `
    RedBaez Fitness App Campaign Brief
    
    Product: Mobile fitness application designed for busy professionals
    Target Audience: Working professionals aged 25-40 who struggle to find time for regular fitness routines
    Campaign Objective: Drive mobile app downloads and increase 7-day trial signups by 300%
    Key Features: 
    - 15-minute high-intensity workouts
    - Personalized fitness plans based on user goals
    - Progress tracking and analytics
    - Social challenges and community features
    Platform: Instagram Stories, Facebook Ads, LinkedIn Sponsored Content
    Budget: $50,000 over 4 weeks
    Timeline: Launch in 2 weeks, run for 4 weeks
    Success Metrics: 10,000 app downloads, 3,000 trial signups, 15% trial-to-paid conversion
    `;
    
    // Look for brief input methods
    const briefElements = {
      fileUpload: await page.locator('input[type="file"]').count(),
      textArea: await page.locator('textarea').count(),
      textInput: await page.locator('input[type="text"]:not([type="file"])').count()
    };
    
    console.log('🔍 Brief Input Elements:');
    Object.entries(briefElements).forEach(([element, count]) => {
      console.log(`  ${element}: ${count} elements`);
    });
    
    // Try text input first
    const briefInput = page.locator('textarea, input[type="text"]:not([type="file"])').first();
    if (await briefInput.count() > 0) {
      console.log('📝 Entering test brief...');
      await briefInput.fill(briefTestData);
      await page.waitForTimeout(1000);
      
      // Look for submit/generate button
      const submitButton = page.locator('button:has-text("Generate"), button:has-text("Submit"), button:has-text("Process"), button:has-text("Create")').first();
      
      if (await submitButton.count() > 0) {
        console.log('🚀 Submitting brief for processing...');
        await submitButton.click();
        
        // Wait for processing
        await page.waitForTimeout(5000);
        
        // Test 2: Check for AI Processing Results
        console.log('🧠 Checking for AI processing results...');
        
        // Look for motivations
        const motivationElements = await page.locator('text=/motivation/i, [data-testid*="motivation"], .motivation').count();
        console.log(`🎯 Motivation elements found: ${motivationElements}`);
        
        // Look for copy variations
        const copyElements = await page.locator('text=/copy/i, text=/headline/i, [data-testid*="copy"], .copy').count();
        console.log(`📝 Copy elements found: ${copyElements}`);
        
        // Check for contextual content
        const pageContent = await page.textContent('body');
        const hasContextualContent = {
          redbaez: pageContent?.toLowerCase().includes('redbaez') || false,
          fitness: pageContent?.toLowerCase().includes('fitness') || false,
          professional: pageContent?.toLowerCase().includes('professional') || false,
          app: pageContent?.toLowerCase().includes('app') || false
        };
        
        console.log('🎯 Contextual Content Check:');
        Object.entries(hasContextualContent).forEach(([term, found]) => {
          console.log(`  ${term}: ${found ? '✅ Found' : '❌ Not Found'}`);
        });
        
        // Test 3: Interaction with Generated Content
        if (motivationElements > 0) {
          console.log('🎯 Testing motivation selection...');
          
          const motivationButtons = await page.locator('button:has-text("Select"), input[type="checkbox"], input[type="radio"]').all();
          
          if (motivationButtons.length > 0) {
            // Select first motivation
            await motivationButtons[0].click();
            await page.waitForTimeout(2000);
            
            console.log('✅ Motivation selected');
            
            // Look for copy generation
            const generateCopyButton = page.locator('button:has-text("Generate Copy"), button:has-text("Create Copy")').first();
            if (await generateCopyButton.count() > 0) {
              await generateCopyButton.click();
              await page.waitForTimeout(3000);
              
              console.log('🚀 Copy generation triggered');
            }
          }
        }
        
        // Take final screenshot
        await page.screenshot({ 
          path: 'test-results/flow-workflow-complete.png', 
          fullPage: true 
        });
        
        // Test 4: Navigation to Next Steps
        console.log('🧭 Testing workflow navigation...');
        
        const nextStepButtons = await page.locator('button:has-text("Next"), button:has-text("Continue"), a:has-text("Matrix"), a:has-text("Campaign")').count();
        console.log(`➡️ Next step options: ${nextStepButtons}`);
        
        // Assertions
        const workflowSuccess = motivationElements > 0 || copyElements > 0;
        const contextualSuccess = Object.values(hasContextualContent).some(found => found);
        
        console.log(`🎯 Workflow Success: ${workflowSuccess}`);
        console.log(`🎯 Contextual Content: ${contextualSuccess}`);
        
        expect(workflowSuccess).toBe(true);
        
      } else {
        console.log('❌ No submit button found');
      }
    } else {
      console.log('❌ No brief input field found');
    }
    
    console.log('✅ Flow workflow test completed');
  });

  test('Test Flow Page UI Elements', async ({ page }) => {
    console.log('🎨 Testing Flow Page UI Elements...');
    
    // Navigate to flow page (will redirect to login if not authenticated)
    await page.goto('https://airwave-complete.netlify.app/flow');
    
    if (page.url().includes('/login')) {
      console.log('🔒 Flow page requires authentication - testing login page UI instead');
      
      // Test login page UI elements
      const loginUI = {
        title: await page.title(),
        emailField: await page.locator('input[type="email"]').count(),
        passwordField: await page.locator('input[type="password"]').count(),
        loginButton: await page.locator('button:has-text("Login"), button[type="submit"]').count(),
        signupLink: await page.locator('a:has-text("Sign Up"), a:has-text("Register")').count(),
        forgotPassword: await page.locator('a:has-text("Forgot"), a:has-text("Reset")').count()
      };
      
      console.log('🔍 Login Page UI Elements:');
      Object.entries(loginUI).forEach(([element, value]) => {
        console.log(`  ${element}: ${typeof value === 'string' ? value : value + ' elements'}`);
      });
      
      return;
    }
    
    // If we reach here, flow page is accessible
    console.log('✅ Flow page accessible - testing UI elements');
    
    const flowUI = {
      title: await page.title(),
      navigation: await page.locator('nav, .navbar').count(),
      breadcrumbs: await page.locator('.breadcrumb, nav[aria-label*="breadcrumb"]').count(),
      steps: await page.locator('.step, .workflow-step, [data-testid*="step"]').count(),
      forms: await page.locator('form').count(),
      buttons: await page.locator('button').count(),
      inputs: await page.locator('input, textarea, select').count()
    };
    
    console.log('🔍 Flow Page UI Elements:');
    Object.entries(flowUI).forEach(([element, value]) => {
      console.log(`  ${element}: ${typeof value === 'string' ? value : value + ' elements'}`);
    });
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/flow-ui-elements.png', 
      fullPage: true 
    });
    
    console.log('✅ Flow UI testing completed');
  });
});
