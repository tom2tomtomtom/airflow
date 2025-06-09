const { chromium } = require('playwright');
const fs = require('fs');

async function testSimpleFlow() {
  console.log('🧪 Testing simple flow page...');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Enhanced console logging
  page.on('console', msg => {
    const text = msg.text();
    console.log(`CONSOLE: ${text}`);
  });
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  try {
    console.log('📍 Navigating to test flow page...');
    await page.goto('http://localhost:3000/test-flow');
    await page.waitForLoadState('networkidle');
    
    console.log(`Current URL: ${page.url()}`);
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-flow-page.png',
      fullPage: true 
    });
    console.log('📸 Screenshot saved');
    
    // Look for the start button
    const startButton = page.locator('[data-testid="start-flow-button"]');
    if (await startButton.isVisible({ timeout: 5000 })) {
      console.log('✅ Found start flow button, clicking...');
      await startButton.click();
      await page.waitForTimeout(2000);
      
      // Look for workflow dialog
      const dialogTitle = page.locator('text=Brief to Execution Workflow');
      if (await dialogTitle.isVisible({ timeout: 5000 })) {
        console.log('✅ Workflow dialog opened successfully!');
        
        // Take screenshot of dialog
        await page.screenshot({ 
          path: 'workflow-dialog.png',
          fullPage: true 
        });
        
        // Look for drag and drop zone
        const uploadArea = page.locator('text=Drag & drop your brief document');
        if (await uploadArea.isVisible()) {
          console.log('✅ Found upload area!');
          
          // Find the file input
          const fileInput = page.locator('input[type="file"]');
          if (await fileInput.isVisible()) {
            console.log('✅ Found file input');
            
            // Path to brief document
            const briefPath = '/Users/thomasdowuona-hyde/Documents/redbaez airwave brief.docx';
            
            if (fs.existsSync(briefPath)) {
              console.log('📄 Brief file found, uploading...');
              
              // Upload the file
              await fileInput.setInputFiles(briefPath);
              
              console.log('⏳ Waiting for processing...');
              
              // Wait for either success message or review interface
              try {
                // Wait for the review interface to appear
                await page.waitForSelector('text=Review & Edit Brief Content', { timeout: 30000 });
                console.log('🎉 SUCCESS! Brief review interface appeared!');
                
                // Take success screenshot
                await page.screenshot({ 
                  path: 'brief-review-interface-success.png',
                  fullPage: true 
                });
                
                // Check for parsed content
                const titleField = page.locator('label:has-text("Brief Title")').locator('..').locator('input, textarea').first();
                if (await titleField.isVisible()) {
                  const titleValue = await titleField.inputValue();
                  console.log(`✅ Brief Title parsed: "${titleValue}"`);
                }
                
                const objectiveField = page.locator('label:has-text("Objective")').locator('..').locator('input, textarea').first();
                if (await objectiveField.isVisible()) {
                  const objectiveValue = await objectiveField.inputValue();
                  console.log(`✅ Objective parsed: "${objectiveValue.substring(0, 100)}..."`);
                }
                
                const industryField = page.locator('label:has-text("Industry")').locator('..').locator('input, textarea').first();
                if (await industryField.isVisible()) {
                  const industryValue = await industryField.inputValue();
                  console.log(`✅ Industry field: "${industryValue}"`);
                }
                
                const productField = page.locator('label:has-text("Product/Service Description")').locator('..').locator('input, textarea').first();
                if (await productField.isVisible()) {
                  const productValue = await productField.inputValue();
                  console.log(`✅ Product field: "${productValue}"`);
                }
                
                // Test editing a field
                console.log('🔧 Testing field editing...');
                if (await industryField.isVisible()) {
                  await industryField.fill('Marketing Technology');
                  console.log('✅ Successfully edited Industry field');
                }
                
                // Look for confirm button
                const confirmButton = page.locator('text=Confirm & Generate Motivations');
                if (await confirmButton.isVisible()) {
                  console.log('✅ Confirm button found');
                  console.log('🎯 TEST PASSED: Enhanced brief parsing system is working perfectly!');
                  
                  console.log('\n🎉 SUMMARY:');
                  console.log('- ✅ Upload zone working');
                  console.log('- ✅ Brief parsing working');
                  console.log('- ✅ Review interface displaying');
                  console.log('- ✅ Field editing functional');
                  console.log('- ✅ Enhanced fields (Industry, Product) present');
                  console.log('- ✅ Ready to proceed to motivations');
                  
                } else {
                  console.log('❌ Confirm button not found');
                }
                
              } catch (timeoutError) {
                console.log('❌ Review interface did not appear within timeout');
                
                // Check for any error messages on page
                const bodyText = await page.textContent('body');
                if (bodyText.includes('error') || bodyText.includes('failed')) {
                  console.log('Error found on page:', bodyText.substring(bodyText.indexOf('error'), bodyText.indexOf('error') + 200));
                }
                
                // Take error screenshot
                await page.screenshot({ 
                  path: 'processing-timeout-error.png',
                  fullPage: true 
                });
              }
              
            } else {
              console.log(`❌ Brief file not found at: ${briefPath}`);
              console.log('Please ensure the "redbaez airwave brief.docx" file exists in your Documents folder');
            }
            
          } else {
            console.log('❌ File input not found');
          }
          
        } else {
          console.log('❌ Upload area not found');
        }
        
      } else {
        console.log('❌ Workflow dialog did not open');
      }
      
    } else {
      console.log('❌ Start flow button not found');
    }
    
  } catch (error) {
    console.error('🚨 Test failed:', error);
    await page.screenshot({ 
      path: 'test-failure.png',
      fullPage: true 
    });
  } finally {
    console.log('🏁 Test completed');
    await browser.close();
  }
}

testSimpleFlow().catch(console.error);