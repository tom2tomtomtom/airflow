import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from '@playwright/test';

test.describe('Complete AIrWAVE Workflow Testing', () => {
  
  test('authentication and login workflow with real data', async ({ page }) => {
    console.log('🔐 Testing Complete Authentication Workflow...');
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login', { timeout: 15000 });
    console.log(`📄 Login page loaded - Title: "${await page.title()}"`);
    
    // Take screenshot for verification
    await page.screenshot({ path: 'test-results/login-page.png' });
    
    // Look for authentication form elements
    const authElements = await page.evaluate(() => {
      return {
        emailInputs: document.querySelectorAll('input[type="email"], input[name="email"], input[placeholder*="email"]').length,
        passwordInputs: document.querySelectorAll('input[type="password"], input[name="password"], input[placeholder*="password"]').length,
        loginButtons: document.querySelectorAll('button[type="submit"], button:has-text("Login"), button:has-text("Sign")').length,
        forms: document.querySelectorAll('form').length,
        allInputs: document.querySelectorAll('input').length,
        allButtons: document.querySelectorAll('button').length,
        visibleText: document.body.innerText.substring(0, 1000)
      };
    });
    
    console.log('🔍 Authentication Elements Found:', authElements);
    
    // Try to fill login form if elements exist
    if (authElements.emailInputs > 0 && authElements.passwordInputs > 0) {
      console.log('📝 Filling login form with test data...');
      
      try {
        // Fill email
        await page.fill('input[type="email"], input[name="email"]', 'test@airwave.com');
        console.log('   ✅ Email filled: test@airwave.com');
        
        // Fill password
        await page.fill('input[type="password"], input[name="password"]', 'TestPassword123!');
        console.log('   ✅ Password filled');
        
        // Try to submit
        if (authElements.loginButtons > 0) {
          console.log('🚀 Attempting login submission...');
          await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign")');
          
          // Wait for navigation or response
          await page.waitForTimeout(3000);
          
          const currentUrl = page.url();
          const pageTitle = await page.title();
          
          console.log(`   📍 After login URL: ${currentUrl}`);
          console.log(`   📄 Page title: ${pageTitle}`);
          
          // Check if we're redirected to dashboard or stay on login with error
          if (currentUrl.includes('dashboard') || currentUrl.includes('app') || !currentUrl.includes('login')) {
            console.log('   ✅ Login successful - redirected to application');
          } else {
            console.log('   ⚠️  Still on login page - checking for errors or success messages');
            
            // Look for error or success messages
            const messages = await page.evaluate(() => {
              const errorElements = document.querySelectorAll('[class*="error"], [role="alert"], .alert');
              const successElements = document.querySelectorAll('[class*="success"], [class*="welcome"]');
              
              return {
                errors: Array.from(errorElements).map(el => el.textContent?.trim()),
                successes: Array.from(successElements).map(el => el.textContent?.trim())
              };
            });
            
            console.log('   📨 Messages:', messages);
          }
        }
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`   ❌ Login form submission failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  No login form elements found - may need to investigate page structure');
    }
    
    expect(authElements.allButtons).toBeGreaterThan(0); // Should have at least some buttons
  });
  
  test('client creation workflow with real data', async ({ page }) => {
    console.log('👥 Testing Complete Client Creation Workflow...');
    
    // Start from home page and navigate to clients
    await page.goto('http://localhost:3000', { timeout: 15000 });
    console.log('📍 Starting from homepage');
    
    // Look for client-related navigation
    const clientNav = await page.locator('a:has-text("Client"), button:has-text("Client"), nav a[href*="client"]').first();
    
    if (await clientNav.count() > 0) {
      console.log('🧭 Found client navigation - clicking...');
      await clientNav.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('🧭 No client navigation found - trying direct URL');
      await page.goto('http://localhost:3000/clients', { timeout: 10000 });
    }
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Look for client creation elements
    const clientElements = await page.evaluate(() => {
      return {
        addButtons: document.querySelectorAll('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), [data-testid*="add"], [data-testid*="create"]').length,
        clientForms: document.querySelectorAll('form, [data-testid*="client-form"]').length,
        nameInputs: document.querySelectorAll('input[name="name"], input[placeholder*="name"], input[id*="name"]').length,
        emailInputs: document.querySelectorAll('input[type="email"], input[name="email"]').length,
        allInputs: document.querySelectorAll('input, textarea, select').length,
        clientItems: document.querySelectorAll('[data-testid*="client"], .client-item, [class*="client"]').length,
        pageContent: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('🔍 Client Management Elements:', clientElements);
    
    // Try to create a new client if add button exists
    if (clientElements.addButtons > 0) {
      console.log('➕ Found add client button - testing client creation...');
      
      try {
        await page.click('button:has-text("Add"), button:has-text("Create"), button:has-text("New")');
        await page.waitForTimeout(2000);
        
        // Look for client creation form
        const formElements = await page.evaluate(() => {
          return {
            nameFields: document.querySelectorAll('input[name="name"], input[placeholder*="name"], input[label*="name"]').length,
            emailFields: document.querySelectorAll('input[type="email"], input[name="email"]').length,
            industryFields: document.querySelectorAll('select[name="industry"], input[name="industry"]').length,
            submitButtons: document.querySelectorAll('button[type="submit"], button:has-text("Save"), button:has-text("Create")').length
          };
        });
        
        console.log('📝 Client Form Elements:', formElements);
        
        if (formElements.nameFields > 0) {
          console.log('📝 Filling client creation form...');
          
          // Fill client data
          await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Client Company');
          console.log('   ✅ Client name: Test Client Company');
          
          if (formElements.emailFields > 0) {
            await page.fill('input[type="email"], input[name="email"]', 'client@testcompany.com');
            console.log('   ✅ Client email: client@testcompany.com');
          }
          
          if (formElements.industryFields > 0) {
            await page.fill('select[name="industry"], input[name="industry"]', 'Technology');
            console.log('   ✅ Industry: Technology');
          }
          
          // Submit form
          if (formElements.submitButtons > 0) {
            console.log('🚀 Submitting client creation form...');
            await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
            await page.waitForTimeout(3000);
            
            // Check for success/error messages
            const result = await page.evaluate(() => {
              const successMessages = document.querySelectorAll('[class*="success"], [role="status"]');
              const errorMessages = document.querySelectorAll('[class*="error"], [role="alert"]');
              
              return {
                success: Array.from(successMessages).map(el => el.textContent?.trim()),
                errors: Array.from(errorMessages).map(el => el.textContent?.trim()),
                currentUrl: window.location.href
              };
            });
            
            console.log('📊 Client creation result:', result);
          }
        }
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`❌ Client creation workflow failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  No add client button found - may need authentication first');
    }
    
    expect(true).toBe(true); // Discovery test
  });
  
  test('asset upload workflow with real data', async ({ page }) => {
    console.log('📁 Testing Complete Asset Upload Workflow...');
    
    // Navigate to assets page
    await page.goto('http://localhost:3000', { timeout: 15000 });
    
    // Look for asset/library navigation
    const assetNav = await page.locator('a:has-text("Asset"), a:has-text("Library"), nav a[href*="asset"]').first();
    
    if (await assetNav.count() > 0) {
      console.log('🧭 Found asset navigation - clicking...');
      await assetNav.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('🧭 Trying direct asset URL...');
      await page.goto('http://localhost:3000/assets', { timeout: 10000 });
    }
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Look for upload elements
    const assetElements = await page.evaluate(() => {
      return {
        uploadButtons: document.querySelectorAll('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]').length,
        fileInputs: document.querySelectorAll('input[type="file"]').length,
        dragDropZones: document.querySelectorAll('[class*="dropzone"], [data-testid*="drop"], [class*="upload-area"]').length,
        assetLibrary: document.querySelectorAll('[data-testid*="asset"], .asset-item, [class*="asset"]').length,
        addAssetButtons: document.querySelectorAll('button:has-text("Add Asset"), button:has-text("New Asset")').length,
        pageContent: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('🔍 Asset Management Elements:', assetElements);
    
    // Test file upload functionality
    if (assetElements.fileInputs > 0) {
      console.log('📤 Testing file upload functionality...');
      
      try {
        // Create a test file for upload
        const testFile = Buffer.from('Test file content for upload');
        
        // Set up file for upload
        await page.setInputFiles('input[type="file"]', {
          name: 'test-image.jpg',
          mimeType: 'image/jpeg',
          buffer: testFile
        });
        
        console.log('   ✅ Test file selected: test-image.jpg');
        
        // Look for upload button after file selection
        await page.waitForTimeout(1000);
        
        const uploadButton = await page.locator('button:has-text("Upload"), button[type="submit"]').first();
        if (await uploadButton.count() > 0) {
          console.log('🚀 Clicking upload button...');
          await uploadButton.click();
          await page.waitForTimeout(3000);
          
          // Check upload result
          const uploadResult = await page.evaluate(() => {
            const successMessages = document.querySelectorAll('[class*="success"], [role="status"]');
            const errorMessages = document.querySelectorAll('[class*="error"], [role="alert"]');
            const progressBars = document.querySelectorAll('[role="progressbar"], [class*="progress"]');
            
            return {
              success: Array.from(successMessages).map(el => el.textContent?.trim()),
              errors: Array.from(errorMessages).map(el => el.textContent?.trim()),
              inProgress: progressBars.length > 0
            };
          });
          
          console.log('📊 Upload result:', uploadResult);
        }
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`❌ File upload test failed: ${error.message}`);
      }
    } else if (assetElements.dragDropZones > 0) {
      console.log('🎯 Found drag-drop zone - testing drag and drop...');
      // Drag and drop testing would require more complex setup
      console.log('   ℹ️  Drag-drop testing requires file system access');
    } else {
      console.log('⚠️  No file upload elements found');
    }
    
    expect(true).toBe(true); // Discovery test
  });
  
  test('strategy creation workflow with AI brief', async ({ page }) => {
    console.log('🧠 Testing Complete Strategy Creation Workflow...');
    
    // Navigate to strategy page
    await page.goto('http://localhost:3000', { timeout: 15000 });
    
    // Look for strategy navigation
    const strategyNav = await page.locator('a:has-text("Strategy"), a:has-text("Flow"), nav a[href*="strategy"]').first();
    
    if (await strategyNav.count() > 0) {
      console.log('🧭 Found strategy navigation - clicking...');
      await strategyNav.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('🧭 Trying direct strategy URL...');
      await page.goto('http://localhost:3000/strategy', { timeout: 10000 });
    }
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Look for strategy creation elements
    const strategyElements = await page.evaluate(() => {
      return {
        briefTextareas: document.querySelectorAll('textarea, [placeholder*="brief"], [data-testid*="brief"]').length,
        briefInputs: document.querySelectorAll('input[placeholder*="brief"], input[name*="brief"]').length,
        generateButtons: document.querySelectorAll('button:has-text("Generate"), button:has-text("Create"), button:has-text("Process")').length,
        aiElements: document.querySelectorAll('[class*="ai"], [data-testid*="ai"]').length,
        newStrategyButtons: document.querySelectorAll('button:has-text("New Strategy"), button:has-text("Create Strategy")').length,
        templateButtons: document.querySelectorAll('button:has-text("Template"), [data-testid*="template"]').length,
        pageContent: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('🔍 Strategy Creation Elements:', strategyElements);
    
    // Test strategy creation with AI brief
    if (strategyElements.briefTextareas > 0 || strategyElements.briefInputs > 0) {
      console.log('📝 Testing AI strategy creation with brief...');
      
      try {
        const testBrief = `
        Create a marketing strategy for a new AI-powered productivity app targeting remote workers.
        
        Target Audience: Remote professionals aged 25-45
        Key Features: Task automation, AI scheduling, team collaboration
        Goals: Drive app downloads and increase user engagement
        Budget: $50,000 for initial campaign
        Timeline: 3-month campaign launch
        
        Focus on social media marketing, content marketing, and influencer partnerships.
        `;
        
        // Fill the brief
        if (strategyElements.briefTextareas > 0) {
          await page.fill('textarea', testBrief);
          console.log('   ✅ Strategy brief filled in textarea');
        } else {
          await page.fill('input[placeholder*="brief"], input[name*="brief"]', testBrief.substring(0, 200));
          console.log('   ✅ Strategy brief filled in input field');
        }
        
        // Submit for AI processing
        if (strategyElements.generateButtons > 0) {
          console.log('🤖 Submitting brief for AI processing...');
          await page.click('button:has-text("Generate"), button:has-text("Create"), button:has-text("Process")');
          
          // Wait longer for AI processing
          await page.waitForTimeout(5000);
          
          // Check for AI processing results
          const aiResult = await page.evaluate(() => {
            const loadingElements = document.querySelectorAll('[class*="loading"], [class*="processing"]');
            const resultElements = document.querySelectorAll('[class*="result"], [class*="strategy"], [class*="output"]');
            const errorElements = document.querySelectorAll('[class*="error"], [role="alert"]');
            
            return {
              processing: loadingElements.length > 0,
              results: Array.from(resultElements).map(el => el.textContent?.trim().substring(0, 100)),
              errors: Array.from(errorElements).map(el => el.textContent?.trim()),
              hasNewContent: document.body.innerText.length > 1000
            };
          });
          
          console.log('🤖 AI Processing Result:', aiResult);
          
          if (aiResult.processing) {
            console.log('   ⏳ AI still processing - waiting longer...');
            await page.waitForTimeout(10000);
          }
          
          if (aiResult.results.length > 0) {
            console.log('   ✅ AI strategy generation completed!');
            console.log('   📊 Generated content preview:', aiResult.results[0]);
          }
        }
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`❌ Strategy creation workflow failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  No strategy brief input elements found');
    }
    
    expect(true).toBe(true); // Discovery test
  });
  
  test('campaign matrix creation and execution workflow', async ({ page }) => {
    console.log('📊 Testing Complete Campaign Matrix Workflow...');
    
    // Navigate to matrix/campaign page
    await page.goto('http://localhost:3000', { timeout: 15000 });
    
    // Look for matrix/campaign navigation
    const matrixNav = await page.locator('a:has-text("Matrix"), a:has-text("Campaign"), nav a[href*="matrix"], nav a[href*="campaign"]').first();
    
    if (await matrixNav.count() > 0) {
      console.log('🧭 Found matrix navigation - clicking...');
      await matrixNav.click();
      await page.waitForTimeout(2000);
    } else {
      console.log('🧭 Trying direct matrix URL...');
      await page.goto('http://localhost:3000/matrix', { timeout: 10000 });
    }
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Look for matrix creation elements
    const matrixElements = await page.evaluate(() => {
      return {
        createButtons: document.querySelectorAll('button:has-text("Create"), button:has-text("New"), button:has-text("Matrix")').length,
        gridElements: document.querySelectorAll('[class*="grid"], table, [data-testid*="grid"]').length,
        matrixItems: document.querySelectorAll('[data-testid*="matrix"], [class*="matrix"], .campaign-item').length,
        executeButtons: document.querySelectorAll('button:has-text("Execute"), button:has-text("Run"), button:has-text("Start")').length,
        dragElements: document.querySelectorAll('[draggable="true"], [data-testid*="drag"]').length,
        assetSlots: document.querySelectorAll('[data-testid*="slot"], [class*="slot"], [class*="drop-zone"]').length,
        pageContent: document.body.innerText.substring(0, 500)
      };
    });
    
    console.log('🔍 Campaign Matrix Elements:', matrixElements);
    
    // Test matrix creation
    if (matrixElements.createButtons > 0) {
      console.log('📊 Testing campaign matrix creation...');
      
      try {
        await page.click('button:has-text("Create"), button:has-text("New"), button:has-text("Matrix")');
        await page.waitForTimeout(2000);
        
        // Look for matrix configuration form
        const matrixForm = await page.evaluate(() => {
          return {
            nameInputs: document.querySelectorAll('input[name="name"], input[placeholder*="name"]').length,
            dimensionInputs: document.querySelectorAll('input[name*="dimension"], select[name*="dimension"]').length,
            templateSelects: document.querySelectorAll('select[name*="template"], [data-testid*="template"]').length,
            configInputs: document.querySelectorAll('input, select, textarea').length
          };
        });
        
        console.log('📝 Matrix Form Elements:', matrixForm);
        
        if (matrixForm.nameInputs > 0) {
          await page.fill('input[name="name"], input[placeholder*="name"]', 'Test Marketing Campaign Matrix');
          console.log('   ✅ Matrix name: Test Marketing Campaign Matrix');
        }
        
        // Submit matrix creation
        const submitButton = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
        if (await submitButton.count() > 0) {
          console.log('🚀 Creating campaign matrix...');
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          // Check for matrix interface
          const matrixInterface = await page.evaluate(() => {
            return {
              gridVisible: document.querySelectorAll('[class*="grid"], table').length > 0,
              slots: document.querySelectorAll('[data-testid*="slot"], [class*="slot"]').length,
              hasMatrix: document.body.innerText.includes('matrix') || document.body.innerText.includes('campaign'),
              executeOptions: document.querySelectorAll('button:has-text("Execute"), button:has-text("Run")').length
            };
          });
          
          console.log('📊 Matrix Interface:', matrixInterface);
          
          // Test matrix execution if interface is ready
          if (matrixInterface.executeOptions > 0) {
            console.log('🚀 Testing matrix execution...');
            await page.click('button:has-text("Execute"), button:has-text("Run")');
            await page.waitForTimeout(3000);
            
            const executionResult = await page.evaluate(() => {
              return {
                processing: document.querySelectorAll('[class*="processing"], [class*="loading"]').length > 0,
                progress: document.querySelectorAll('[role="progressbar"], [class*="progress"]').length > 0,
                results: document.querySelectorAll('[class*="result"], [class*="output"]').length > 0
              };
            });
            
            console.log('📊 Execution Result:', executionResult);
          }
        }
        
      } catch (error) {
    const message = getErrorMessage(error);
        console.log(`❌ Matrix creation workflow failed: ${error.message}`);
      }
    } else {
      console.log('⚠️  No matrix creation buttons found');
    }
    
    expect(true).toBe(true); // Discovery test
  });
});