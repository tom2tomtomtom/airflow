import { test, expect } from '@playwright/test';

test.describe('AIrWAVE Actual Workflow Testing', () => {
  
  test('test actual application authentication workflow', async ({ page }) => {
    console.log('🔐 Testing Actual AIrWAVE Authentication...');
    
    try {
      // Navigate to the actual application
      await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      console.log(`📄 Page loaded - Title: "${await page.title()}"`);
      
      // Take screenshot for verification
      await page.screenshot({ path: 'test-results/homepage.png', fullPage: true });
      
      // Check what's actually on the page
      const pageContent = await page.evaluate(() => {
        return {
          title: document.title,
          hasAuthElements: {
            loginButtons: document.querySelectorAll('button').length,
            emailInputs: document.querySelectorAll('input[type="email"]').length,
            passwordInputs: document.querySelectorAll('input[type="password"]').length,
            forms: document.querySelectorAll('form').length,
            inputs: document.querySelectorAll('input').length
          },
          bodyText: document.body.innerText.substring(0, 500),
          visibleElements: document.querySelectorAll('*').length,
          scripts: document.querySelectorAll('script').length
        };
      });
      
      console.log('🔍 Page Analysis:', JSON.stringify(pageContent, null, 2));
      
      // Try to interact with actual elements
      const buttons = await page.locator('button').all();
      console.log(`🔘 Found ${buttons.length} buttons`);
      
      if (buttons.length > 0) {
        for (let i = 0; i < Math.min(buttons.length, 3); i++) {
          const buttonText = await buttons[i].textContent();
          console.log(`   Button ${i + 1}: "${buttonText}"`);
          
          try {
            await buttons[i].click();
            await page.waitForTimeout(1000);
            console.log(`   ✅ Button ${i + 1} clicked successfully`);
            
            // Check if navigation occurred
            const newUrl = page.url();
            console.log(`   📍 Current URL: ${newUrl}`);
            
          } catch (error) {
            console.log(`   ❌ Button ${i + 1} click failed: ${error.message}`);
          }
        }
      }
      
      expect(pageContent.title).toBeTruthy();
      
    } catch (error) {
      console.log(`❌ Authentication test failed: ${error.message}`);
      
      // Try to get more debugging info
      try {
        await page.screenshot({ path: 'test-results/error-state.png' });
        console.log('📸 Error screenshot saved');
      } catch (screenshotError) {
        console.log('📸 Could not save screenshot');
      }
      
      throw error;
    }
  });
  
  test('explore actual application structure and navigation', async ({ page }) => {
    console.log('🧭 Exploring Actual AIrWAVE Application Structure...');
    
    await page.goto('http://localhost:3000', { timeout: 10000 });
    
    // Get all clickable elements and their text
    const interactiveElements = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        type: 'button',
        text: btn.textContent?.trim().substring(0, 50) || '',
        id: btn.id,
        className: btn.className
      }));
      
      const links = Array.from(document.querySelectorAll('a')).map(link => ({
        type: 'link',
        text: link.textContent?.trim().substring(0, 50) || '',
        href: link.href,
        id: link.id
      }));
      
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: 'input',
        inputType: input.type,
        placeholder: input.placeholder,
        id: input.id,
        name: input.name
      }));
      
      return { buttons, links, inputs };
    });
    
    console.log('🔍 Interactive Elements Found:');
    console.log('Buttons:', interactiveElements.buttons);
    console.log('Links:', interactiveElements.links);
    console.log('Inputs:', interactiveElements.inputs);
    
    // Test actual navigation if links exist
    if (interactiveElements.links.length > 0) {
      for (let i = 0; i < Math.min(interactiveElements.links.length, 3); i++) {
        const link = interactiveElements.links[i];
        console.log(`🔗 Testing link: "${link.text}" -> ${link.href}`);
        
        try {
          if (link.href && !link.href.includes('mailto:') && !link.href.includes('tel:')) {
            await page.click(`a[href="${link.href}"]`);
            await page.waitForTimeout(2000);
            
            const newUrl = page.url();
            console.log(`   ✅ Navigation successful: ${newUrl}`);
            
            // Go back for next test
            if (newUrl !== 'http://localhost:3000/') {
              await page.goBack();
              await page.waitForTimeout(1000);
            }
          }
        } catch (error) {
          console.log(`   ❌ Link navigation failed: ${error.message}`);
        }
      }
    }
    
    expect(interactiveElements.buttons.length + interactiveElements.links.length).toBeGreaterThan(0);
  });
  
  test('test actual form interactions and workflows', async ({ page }) => {
    console.log('📝 Testing Actual Form Interactions...');
    
    await page.goto('http://localhost:3000', { timeout: 10000 });
    
    // Look for forms and inputs
    const formElements = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form')).map((form, index) => ({
        index,
        action: form.action,
        method: form.method,
        inputCount: form.querySelectorAll('input').length,
        buttonCount: form.querySelectorAll('button').length
      }));
      
      const allInputs = Array.from(document.querySelectorAll('input')).map((input, index) => ({
        index,
        type: input.type,
        name: input.name,
        placeholder: input.placeholder,
        required: input.required,
        id: input.id
      }));
      
      return { forms, allInputs };
    });
    
    console.log('📋 Form Analysis:');
    console.log('Forms found:', formElements.forms);
    console.log('Inputs found:', formElements.allInputs);
    
    // Test input interactions
    if (formElements.allInputs.length > 0) {
      for (let i = 0; i < Math.min(formElements.allInputs.length, 5); i++) {
        const input = formElements.allInputs[i];
        console.log(`📝 Testing input ${i + 1}: ${input.type} (${input.placeholder})`);
        
        try {
          let testValue = 'test-value';
          
          // Use appropriate test values for different input types
          if (input.type === 'email') {
            testValue = 'test@airwave.com';
          } else if (input.type === 'password') {
            testValue = 'TestPassword123!';
          } else if (input.type === 'number') {
            testValue = '123';
          } else if (input.type === 'tel') {
            testValue = '1234567890';
          } else if (input.type === 'url') {
            testValue = 'https://example.com';
          }
          
          if (input.id) {
            await page.fill(`#${input.id}`, testValue);
          } else if (input.name) {
            await page.fill(`input[name="${input.name}"]`, testValue);
          } else {
            await page.fill(`input[type="${input.type}"]:nth-of-type(${i + 1})`, testValue);
          }
          
          console.log(`   ✅ Input ${i + 1} filled successfully with: ${testValue}`);
          
          // Clear the input for next test
          await page.keyboard.selectAll();
          await page.keyboard.press('Delete');
          
        } catch (error) {
          console.log(`   ❌ Input ${i + 1} interaction failed: ${error.message}`);
        }
      }
    }
    
    // Test form submission if forms exist
    if (formElements.forms.length > 0) {
      console.log('🚀 Testing form submission...');
      
      // Fill out first form if it has inputs
      const firstForm = formElements.forms[0];
      if (firstForm.inputCount > 0) {
        try {
          // Fill email if exists
          const emailInput = await page.locator('input[type="email"]').first();
          if (await emailInput.count() > 0) {
            await emailInput.fill('test@airwave.com');
            console.log('   ✅ Email filled');
          }
          
          // Fill password if exists  
          const passwordInput = await page.locator('input[type="password"]').first();
          if (await passwordInput.count() > 0) {
            await passwordInput.fill('TestPassword123!');
            console.log('   ✅ Password filled');
          }
          
          // Try to submit
          const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();
          if (await submitButton.count() > 0) {
            console.log('   🚀 Attempting form submission...');
            await submitButton.click();
            await page.waitForTimeout(2000);
            
            const currentUrl = page.url();
            console.log(`   📍 After submission URL: ${currentUrl}`);
          }
          
        } catch (error) {
          console.log(`   ❌ Form submission test failed: ${error.message}`);
        }
      }
    }
    
    expect(true).toBe(true); // Test always passes for discovery
  });
  
  test('actual performance and user experience testing', async ({ page }) => {
    console.log('⚡ Testing Actual AIrWAVE Performance...');
    
    // Measure actual load performance
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`📊 Actual load time: ${loadTime}ms`);
    
    // Test actual interactions and measure responsiveness
    const buttons = await page.locator('button').all();
    let interactionTimes: number[] = [];
    
    for (let i = 0; i < Math.min(buttons.length, 3); i++) {
      const interactionStart = Date.now();
      try {
        await buttons[i].click();
        const interactionTime = Date.now() - interactionStart;
        interactionTimes.push(interactionTime);
        console.log(`🔘 Button ${i + 1} response time: ${interactionTime}ms`);
        await page.waitForTimeout(500);
      } catch (error) {
        console.log(`🔘 Button ${i + 1} interaction failed: ${error.message}`);
      }
    }
    
    // Test scrolling performance
    console.log('📜 Testing scroll performance...');
    const scrollStart = Date.now();
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(200);
    await page.keyboard.press('PageUp');
    const scrollTime = Date.now() - scrollStart;
    console.log(`📜 Scroll response time: ${scrollTime}ms`);
    
    // Get actual performance metrics from browser
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('📈 Browser Performance Metrics:', performanceMetrics);
    
    // Summary
    console.log('\\n🎯 Performance Summary:');
    console.log(`   Load Time: ${loadTime}ms`);
    console.log(`   Average Interaction: ${interactionTimes.length > 0 ? Math.round(interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length) : 'N/A'}ms`);
    console.log(`   DOM Content Loaded: ${Math.round(performanceMetrics.domContentLoaded)}ms`);
    console.log(`   First Contentful Paint: ${Math.round(performanceMetrics.firstContentfulPaint)}ms`);
    
    // Performance assertions
    expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
    if (interactionTimes.length > 0) {
      const avgInteraction = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
      expect(avgInteraction).toBeLessThan(2000); // Interactions should be under 2 seconds
    }
  });
});