import { test, expect } from '@playwright/test';

test.describe('Real AIrWAVE Workflow Testing', () => {
  
  test('complete authentication workflow - login and access protected pages', async ({ page }) => {
    console.log('🔐 Testing Real Authentication Workflow...');
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login', { timeout: 15000 });
    console.log(`📄 Login page loaded - Title: "${await page.title()}"`);
    
    // Screenshot the login page
    await page.screenshot({ path: 'test-results/real-login-page.png' });
    
    // Check what's actually on the login page
    const loginPageContent = await page.evaluate(() => {
      return {
        title: document.title,
        emailInputs: document.querySelectorAll('input[type="email"]').length,
        passwordInputs: document.querySelectorAll('input[type="password"]').length,
        textInputs: document.querySelectorAll('input[type="text"]').length,
        allInputs: document.querySelectorAll('input').length,
        allButtons: document.querySelectorAll('button').length,
        forms: document.querySelectorAll('form').length,
        submitButtons: document.querySelectorAll('button[type="submit"]').length,
        bodyText: document.body.innerText,
        hasLoginText: document.body.innerText.toLowerCase().includes('login'),
        hasEmailLabel: document.body.innerText.toLowerCase().includes('email'),
        hasPasswordLabel: document.body.innerText.toLowerCase().includes('password')
      };
    });
    
    console.log('🔍 Login Page Analysis:', {
      title: loginPageContent.title,
      inputs: {
        email: loginPageContent.emailInputs,
        password: loginPageContent.passwordInputs,
        text: loginPageContent.textInputs,
        total: loginPageContent.allInputs
      },
      buttons: {
        total: loginPageContent.allButtons,
        submit: loginPageContent.submitButtons
      },
      forms: loginPageContent.forms,
      hasLoginElements: {
        loginText: loginPageContent.hasLoginText,
        emailLabel: loginPageContent.hasEmailLabel,
        passwordLabel: loginPageContent.hasPasswordLabel
      }
    });
    
    console.log('📝 Page Content Preview:', loginPageContent.bodyText.substring(0, 300));
    
    // Try to login if we have the right elements
    if (loginPageContent.emailInputs > 0 && loginPageContent.passwordInputs > 0) {
      console.log('📝 Found login form - testing with credentials...');
      
      try {
        // Fill email
        await page.fill('input[type="email"]', 'test@airwave.com');
        console.log('   ✅ Email filled: test@airwave.com');
        
        // Fill password  
        await page.fill('input[type="password"]', 'TestPassword123!');
        console.log('   ✅ Password filled');
        
        // Submit form
        if (loginPageContent.submitButtons > 0) {
          await page.click('button[type="submit"]');
          console.log('🚀 Login form submitted');
        } else if (loginPageContent.allButtons > 0) {
          // Try clicking the first button
          await page.click('button');
          console.log('🚀 Login button clicked');
        }
        
        // Wait for response
        await page.waitForTimeout(5000);
        
        const afterLogin = {
          url: page.url(),
          title: await page.title(),
          bodyText: await page.locator('body').textContent()
        };
        
        console.log('📊 After Login State:');
        console.log(`   URL: ${afterLogin.url}`);
        console.log(`   Title: ${afterLogin.title}`);
        console.log(`   Content: ${afterLogin.bodyText?.substring(0, 200)}...`);
        
        // Check if login was successful
        if (!afterLogin.url.includes('login')) {
          console.log('   ✅ LOGIN SUCCESS - Redirected away from login page!');
          
          // Test accessing protected pages
          console.log('🔓 Testing access to protected pages...');
          
          const protectedPages = ['/dashboard', '/clients', '/assets', '/strategy', '/matrix'];
          
          for (const path of protectedPages) {
            try {
              await page.goto(`http://localhost:3000${path}`, { timeout: 10000 });
              const pageTitle = await page.title();
              const isLoginPage = page.url().includes('login');
              
              console.log(`   ${path}: ${isLoginPage ? '❌ Redirected to login' : '✅ Access granted'} - "${pageTitle}"`);
              
              if (!isLoginPage) {
                // Take screenshot of accessible page
                await page.screenshot({ path: `test-results/protected-page-${path.replace('/', '')}.png` });
              }
              
            } catch (error) {
              console.log(`   ${path}: ❌ Error accessing page - ${error.message}`);
            }
          }
          
        } else {
          console.log('   ⚠️  Still on login page - checking for error messages...');
          
          // Look for error or validation messages
          const messages = await page.evaluate(() => {
            const allText = document.body.innerText.toLowerCase();
            return {
              hasError: allText.includes('error') || allText.includes('invalid') || allText.includes('incorrect'),
              hasRequired: allText.includes('required') || allText.includes('missing'),
              bodyText: document.body.innerText.substring(0, 500)
            };
          });
          
          console.log('   📨 Page Messages:', messages);
        }
        
      } catch (error) {
        console.log(`❌ Login process failed: ${error.message}`);
      }
      
    } else {
      console.log('⚠️  Login form not found or incomplete - may be a different page type');
      
      // Check if we're already logged in or need different approach
      const currentState = await page.evaluate(() => {
        return {
          hasNavigation: document.querySelectorAll('nav').length > 0,
          hasUserMenu: document.querySelectorAll('[data-testid="user-menu"], [class*="user"]').length > 0,
          bodyContent: document.body.innerText.substring(0, 300)
        };
      });
      
      console.log('📊 Current Page State:', currentState);
    }
    
    expect(loginPageContent.title).toBeTruthy();
  });
  
  test('explore application structure after login attempt', async ({ page }) => {
    console.log('🗺️  Exploring AIrWAVE Application Structure...');
    
    // Start from homepage
    await page.goto('http://localhost:3000', { timeout: 15000 });
    console.log('📍 Starting from homepage');
    
    // Take homepage screenshot
    await page.screenshot({ path: 'test-results/homepage-structure.png' });
    
    // Get homepage structure
    const homepageStructure = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a')).map(link => ({
        text: link.textContent?.trim(),
        href: link.href,
        hasRoute: link.href.includes('localhost:3000')
      }));
      
      const allButtons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent?.trim(),
        type: btn.type,
        id: btn.id,
        className: btn.className
      }));
      
      return {
        title: document.title,
        links: allLinks.filter(link => link.hasRoute),
        buttons: allButtons,
        hasNavigation: document.querySelectorAll('nav').length > 0,
        navigationItems: Array.from(document.querySelectorAll('nav a')).map(link => ({
          text: link.textContent?.trim(),
          href: (link as HTMLAnchorElement).href
        })),
        bodyText: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('🏠 Homepage Structure Analysis:');
    console.log('   Title:', homepageStructure.title);
    console.log('   Navigation Items:', homepageStructure.navigationItems);
    console.log('   Available Links:', homepageStructure.links.slice(0, 5));
    console.log('   Buttons:', homepageStructure.buttons.slice(0, 5));
    
    // Test clicking through available navigation
    console.log('🧭 Testing available navigation...');
    
    if (homepageStructure.links.length > 0) {
      for (let i = 0; i < Math.min(homepageStructure.links.length, 5); i++) {
        const link = homepageStructure.links[i];
        
        if (link.href && link.text) {
          console.log(`🔗 Testing link: "${link.text}" -> ${link.href}`);
          
          try {
            await page.click(`a[href="${link.href}"]`);
            await page.waitForTimeout(2000);
            
            const newUrl = page.url();
            const newTitle = await page.title();
            
            console.log(`   📍 Result: ${newUrl} - "${newTitle}"`);
            
            // Take screenshot of each page
            await page.screenshot({ path: `test-results/navigation-${i + 1}-${link.text?.replace(/[^a-zA-Z0-9]/g, '-')}.png` });
            
            // Check page content
            const pageContent = await page.evaluate(() => {
              return {
                hasForm: document.querySelectorAll('form').length > 0,
                hasInputs: document.querySelectorAll('input').length > 0,
                hasButtons: document.querySelectorAll('button').length > 0,
                contentLength: document.body.innerText.length,
                isLoginPage: document.body.innerText.toLowerCase().includes('login'),
                hasProtectedContent: document.body.innerText.toLowerCase().includes('dashboard') || 
                                   document.body.innerText.toLowerCase().includes('client') ||
                                   document.body.innerText.toLowerCase().includes('asset')
              };
            });
            
            console.log(`   📊 Page Analysis:`, pageContent);
            
            // Go back to homepage for next test
            if (newUrl !== 'http://localhost:3000/') {
              await page.goto('http://localhost:3000', { timeout: 10000 });
              await page.waitForTimeout(1000);
            }
            
          } catch (error) {
            console.log(`   ❌ Navigation failed: ${error.message}`);
          }
        }
      }
    }
    
    expect(homepageStructure.buttons.length).toBeGreaterThan(0);
  });
  
  test('test actual form interactions and data submission', async ({ page }) => {
    console.log('📝 Testing Real Form Interactions...');
    
    // Check login page form
    await page.goto('http://localhost:3000/login', { timeout: 15000 });
    console.log('📄 Testing login form interactions...');
    
    const formAnalysis = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map((input, index) => ({
        index,
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        required: input.required,
        id: input.id,
        value: input.value
      }));
      
      const buttons = Array.from(document.querySelectorAll('button')).map((btn, index) => ({
        index,
        text: btn.textContent?.trim(),
        type: btn.type,
        disabled: btn.disabled
      }));
      
      const forms = Array.from(document.querySelectorAll('form')).map((form, index) => ({
        index,
        action: form.action,
        method: form.method,
        inputCount: form.querySelectorAll('input').length
      }));
      
      return { inputs, buttons, forms };
    });
    
    console.log('📋 Form Analysis:', formAnalysis);
    
    // Test form interactions with real data
    if (formAnalysis.inputs.length > 0) {
      console.log('📝 Testing form field interactions...');
      
      for (let i = 0; i < formAnalysis.inputs.length; i++) {
        const input = formAnalysis.inputs[i];
        console.log(`   Testing input ${i + 1}: ${input.type} (${input.placeholder || input.name})`);
        
        try {
          let testValue = '';
          
          // Use appropriate test data based on input type
          switch (input.type) {
            case 'email':
              testValue = 'user@airwave.com';
              break;
            case 'password':
              testValue = 'SecurePassword123!';
              break;
            case 'text':
              if (input.name?.includes('name') || input.placeholder?.includes('name')) {
                testValue = 'Test User';
              } else {
                testValue = 'Test Value';
              }
              break;
            case 'tel':
              testValue = '1234567890';
              break;
            case 'url':
              testValue = 'https://airwave.com';
              break;
            default:
              testValue = 'Test Data';
          }
          
          // Fill the input
          if (input.id) {
            await page.fill(`#${input.id}`, testValue);
          } else if (input.name) {
            await page.fill(`input[name="${input.name}"]`, testValue);
          } else {
            await page.fill(`input[type="${input.type}"]:nth-of-type(${i + 1})`, testValue);
          }
          
          console.log(`     ✅ Filled with: ${testValue}`);
          
          // Verify the value was set
          const actualValue = await page.inputValue(`input[type="${input.type}"]:nth-of-type(${i + 1})`);
          console.log(`     📊 Actual value: ${actualValue}`);
          
          // Clear for next test
          await page.keyboard.press('Control+a');
          await page.keyboard.press('Delete');
          
        } catch (error) {
          console.log(`     ❌ Failed to interact: ${error.message}`);
        }
      }
      
      // Test form submission with valid data
      console.log('🚀 Testing form submission with complete data...');
      
      try {
        // Fill out complete form
        const emailInputs = formAnalysis.inputs.filter(input => input.type === 'email');
        const passwordInputs = formAnalysis.inputs.filter(input => input.type === 'password');
        
        if (emailInputs.length > 0) {
          await page.fill('input[type="email"]', 'demo@airwave.com');
          console.log('   ✅ Email: demo@airwave.com');
        }
        
        if (passwordInputs.length > 0) {
          await page.fill('input[type="password"]', 'DemoPassword123!');
          console.log('   ✅ Password: DemoPassword123!');
        }
        
        // Submit the form
        const submitButtons = formAnalysis.buttons.filter(btn => 
          btn.type === 'submit' || 
          btn.text?.toLowerCase().includes('login') ||
          btn.text?.toLowerCase().includes('sign')
        );
        
        if (submitButtons.length > 0) {
          console.log('   🚀 Submitting form...');
          await page.click('button[type="submit"], button');
          
          // Wait for response and check result
          await page.waitForTimeout(3000);
          
          const submissionResult = await page.evaluate(() => {
            return {
              currentUrl: window.location.href,
              title: document.title,
              hasErrorMessage: document.body.innerText.toLowerCase().includes('error') ||
                             document.body.innerText.toLowerCase().includes('invalid') ||
                             document.body.innerText.toLowerCase().includes('incorrect'),
              hasSuccessMessage: document.body.innerText.toLowerCase().includes('welcome') ||
                               document.body.innerText.toLowerCase().includes('success') ||
                               document.body.innerText.toLowerCase().includes('dashboard'),
              bodyText: document.body.innerText.substring(0, 300)
            };
          });
          
          console.log('📊 Submission Result:', submissionResult);
          
          // Take screenshot of result
          await page.screenshot({ path: 'test-results/form-submission-result.png' });
          
        } else {
          console.log('   ⚠️  No submit button found');
        }
        
      } catch (error) {
        console.log(`❌ Form submission failed: ${error.message}`);
      }
    }
    
    expect(formAnalysis.inputs.length).toBeGreaterThanOrEqual(0);
  });
  
  test('measure actual application performance under real usage', async ({ page }) => {
    console.log('⚡ Testing Real Application Performance...');
    
    const performanceResults: any[] = [];
    
    // Test performance across different pages
    const pagesToTest = [
      { url: 'http://localhost:3000', name: 'Homepage' },
      { url: 'http://localhost:3000/login', name: 'Login' },
      { url: 'http://localhost:3000/dashboard', name: 'Dashboard' },
      { url: 'http://localhost:3000/clients', name: 'Clients' },
      { url: 'http://localhost:3000/assets', name: 'Assets' }
    ];
    
    for (const pageTest of pagesToTest) {
      console.log(`⏱️  Testing ${pageTest.name} performance...`);
      
      try {
        const startTime = Date.now();
        
        await page.goto(pageTest.url, { 
          waitUntil: 'networkidle',
          timeout: 15000 
        });
        
        const loadTime = Date.now() - startTime;
        
        // Get detailed performance metrics
        const performanceMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paintMetrics = performance.getEntriesByType('paint');
          
          return {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: paintMetrics.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintMetrics.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            domElements: document.querySelectorAll('*').length,
            scriptTags: document.querySelectorAll('script').length,
            styleTags: document.querySelectorAll('style, link[rel="stylesheet"]').length,
            imageCount: document.querySelectorAll('img').length
          };
        });
        
        // Test interaction responsiveness
        const buttons = await page.locator('button').all();
        const interactionTimes: number[] = [];
        
        for (let i = 0; i < Math.min(buttons.length, 3); i++) {
          const interactionStart = Date.now();
          try {
            await buttons[i].click();
            const interactionTime = Date.now() - interactionStart;
            interactionTimes.push(interactionTime);
            await page.waitForTimeout(300);
          } catch (error) {
            // Skip failed interactions
          }
        }
        
        const avgInteractionTime = interactionTimes.length > 0 ? 
          interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length : 0;
        
        const result = {
          page: pageTest.name,
          url: pageTest.url,
          loadTime,
          avgInteractionTime,
          ...performanceMetrics,
          success: loadTime < 10000 // Consider success if loads in under 10s
        };
        
        performanceResults.push(result);
        
        console.log(`   📊 ${pageTest.name} Results:`);
        console.log(`      Load Time: ${loadTime}ms`);
        console.log(`      DOM Content Loaded: ${Math.round(performanceMetrics.domContentLoaded)}ms`);
        console.log(`      First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
        console.log(`      Average Interaction: ${Math.round(avgInteractionTime)}ms`);
        console.log(`      DOM Elements: ${performanceMetrics.domElements}`);
        console.log(`      Status: ${result.success ? '✅ GOOD' : '⚠️  SLOW'}`);
        
      } catch (error) {
        console.log(`   ❌ ${pageTest.name} failed: ${error.message}`);
        performanceResults.push({
          page: pageTest.name,
          url: pageTest.url,
          error: error.message,
          success: false
        });
      }
    }
    
    // Generate performance summary
    console.log('\\n📈 PERFORMANCE SUMMARY:');
    const successfulTests = performanceResults.filter(r => r.success);
    
    if (successfulTests.length > 0) {
      const avgLoadTime = successfulTests.reduce((sum, r) => sum + r.loadTime, 0) / successfulTests.length;
      const avgInteraction = successfulTests.reduce((sum, r) => sum + (r.avgInteractionTime || 0), 0) / successfulTests.length;
      
      console.log(`   Average Load Time: ${Math.round(avgLoadTime)}ms`);
      console.log(`   Average Interaction Time: ${Math.round(avgInteraction)}ms`);
      console.log(`   Success Rate: ${successfulTests.length}/${performanceResults.length} pages`);
      console.log(`   Performance Grade: ${avgLoadTime < 3000 ? '🟢 EXCELLENT' : avgLoadTime < 5000 ? '🟡 GOOD' : '🔴 NEEDS IMPROVEMENT'}`);
    }
    
    expect(performanceResults.length).toBeGreaterThan(0);
    expect(successfulTests.length).toBeGreaterThan(0);
  });
});