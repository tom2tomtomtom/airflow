const { chromium } = require('playwright');
const fs = require('fs');

async function testWorkflowDirect() {
  console.log('🧪 Testing workflow component directly...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set up comprehensive console logging
  page.on('console', msg => {
    console.log(`CONSOLE: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    // Navigate to dashboard first (should have mock auth)
    console.log('📍 Navigating to dashboard...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForLoadState('networkidle');
    
    console.log(`Current URL: ${page.url()}`);
    
    // Wait a bit for auth to settle
    await page.waitForTimeout(2000);
    
    // Navigate to Flow
    console.log('📍 Navigating to Flow...');
    await page.goto('http://localhost:3000/flow');
    await page.waitForLoadState('networkidle');
    
    console.log(`Flow page URL: ${page.url()}`);
    
    // Take screenshot of current state
    await page.screenshot({ 
      path: 'flow-page-current.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved');
    
    // Check if we can see the Flow interface
    const pageText = await page.textContent('body');
    console.log('Page contains "Start Flow":', pageText.includes('Start Flow'));
    console.log('Page contains "AI Content":', pageText.includes('AI Content'));
    
    // Look for the Start Flow button
    const startFlowButton = page.locator('text=Start Flow');
    if (await startFlowButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found Start Flow button, clicking...');
      await startFlowButton.click();
      await page.waitForTimeout(2000);
      
      // Look for the workflow dialog
      const dialogTitle = page.locator('text=Brief to Execution Workflow');
      if (await dialogTitle.isVisible({ timeout: 5000 })) {
        console.log('✅ Workflow dialog opened!');
        
        // Look for the upload zone
        const uploadZone = page.locator('[data-testid="upload-zone"], .dropzone, input[type="file"]').first();
        
        if (await uploadZone.isVisible({ timeout: 5000 })) {
          console.log('✅ Found upload zone');
          
          // Path to the brief document
          const briefPath = '/Users/thomasdowuona-hyde/Documents/redbaez airwave brief.docx';
          
          if (fs.existsSync(briefPath)) {
            console.log('📄 Uploading brief document...');
            
            // Try to upload file
            await uploadZone.setInputFiles(briefPath);
            
            console.log('⏳ Waiting for brief processing...');
            
            // Wait for processing and review interface
            const reviewInterface = page.locator('text=Review & Edit Brief Content');
            if (await reviewInterface.isVisible({ timeout: 20000 })) {
              console.log('🎉 SUCCESS! Brief review interface appeared!');
              
              // Take screenshot of success
              await page.screenshot({ 
                path: 'brief-review-success.png',
                fullPage: true 
              });
              
              // Check specific fields
              const fields = [
                'Brief Title',
                'Industry',
                'Objective',
                'Value Proposition',
                'Product/Service Description'
              ];
              
              for (const field of fields) {
                const fieldLabel = page.locator(`label:has-text("${field}")`);
                if (await fieldLabel.isVisible()) {
                  console.log(`✅ Field present: ${field}`);
                  
                  // Get the associated input value
                  const input = fieldLabel.locator('..').locator('input, textarea').first();
                  if (await input.isVisible()) {
                    const value = await input.inputValue();
                    if (value && value.trim()) {
                      console.log(`  📝 "${field}": "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
                    } else {
                      console.log(`  ⚠️ "${field}": (empty)`);
                    }
                  }
                } else {
                  console.log(`❌ Field missing: ${field}`);
                }
              }
              
              // Look for confirm button
              const confirmButton = page.locator('text=Confirm & Generate Motivations');
              if (await confirmButton.isVisible()) {
                console.log('✅ Confirm button is present');
                console.log('🎯 TEST PASSED: Enhanced brief parsing with review interface is working!');
              } else {
                console.log('⚠️ Confirm button not found');
              }
              
            } else {
              console.log('❌ Brief review interface did not appear within timeout');
              
              // Check for error messages
              const errorText = await page.textContent('body');
              if (errorText.includes('error') || errorText.includes('Error')) {
                console.log('Found error text in page:', errorText.substring(0, 200));
              }
            }
            
          } else {
            console.log(`❌ Brief file not found: ${briefPath}`);
          }
          
        } else {
          console.log('❌ Upload zone not found in dialog');
        }
        
      } else {
        console.log('❌ Workflow dialog did not open');
      }
      
    } else {
      console.log('❌ Start Flow button not found');
      
      // Debug what's on the page
      const buttons = await page.locator('button').all();
      console.log('Available buttons:');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text && text.trim()) {
          console.log(`  - "${text.trim()}"`);
        }
      }
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'test-error.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testWorkflowDirect().catch(console.error);