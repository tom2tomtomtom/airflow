const puppeteer = require('puppeteer');

async function testWorkflowFixes() {
  console.log('=== Testing Workflow Fixes ===');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to flow page
    console.log('1. Navigating to flow page...');
    await page.goto('http://localhost:3001/flow');
    await page.waitForLoadState('networkidle');
    
    // Look for workflow button
    console.log('2. Looking for workflow button...');
    const workflowButton = await page.waitForSelector('button:has-text("Start Flow")', { timeout: 10000 });
    
    if (workflowButton) {
      console.log('3. Found Start Flow button, clicking...');
      await workflowButton.click();
      
      // Wait for dialog to open
      await page.waitForTimeout(2000);
      
      // Check if dialog opened
      const dialog = await page.$('[role="dialog"]');
      if (dialog) {
        console.log('✅ Dialog opened successfully');
        
        // Take screenshot
        await page.screenshot({ path: 'workflow-dialog-open.png', fullPage: true });
        
        // Look for upload area
        const uploadArea = await page.$('[class*="dropzone"]');
        if (uploadArea) {
          console.log('✅ Upload area found');
          
          // Test file upload by creating a test file
          const testContent = `
Test Brief for Workflow
Objective: Test the brief workflow functionality
Target Audience: Testing audience
Key Messages: Test message 1, Test message 2
Platforms: Instagram, Facebook
Budget: $10,000
Timeline: 2 weeks
Product: Test Product
Value Proposition: Test value proposition
Industry: Testing
`;
          
          // Create a file input and upload
          await page.evaluate((content) => {
            const blob = new Blob([content], { type: 'text/plain' });
            const file = new File([blob], 'test-brief.txt', { type: 'text/plain' });
            
            // Create a data transfer
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            
            // Find the dropzone and trigger drop event
            const dropzone = document.querySelector('[class*="dropzone"]');
            if (dropzone) {
              const event = new DragEvent('drop', {
                dataTransfer: dataTransfer
              });
              dropzone.dispatchEvent(event);
            }
          }, testContent);
          
          console.log('4. File upload simulated, waiting for processing...');
          await page.waitForTimeout(5000);
          
          // Take screenshot after upload
          await page.screenshot({ path: 'workflow-after-upload.png', fullPage: true });
          
          // Look for brief review interface
          const reviewInterface = await page.$('text=Review & Edit Brief Content');
          if (reviewInterface) {
            console.log('✅ Brief review interface found');
            
            // Check for any jumbled text
            const pageContent = await page.textContent('body');
            const hasJumbledText = pageContent.includes('[object Object]') || 
                                 pageContent.includes('undefined') || 
                                 pageContent.includes('[object');
            
            if (hasJumbledText) {
              console.log('🚨 Still found jumbled text in UI');
              
              // Look for specific problematic elements
              const problemElements = await page.$$eval('*', (elements) => {
                return elements
                  .filter(el => el.textContent && (
                    el.textContent.includes('[object') || 
                    el.textContent.includes('undefined')
                  ))
                  .map(el => ({
                    tag: el.tagName,
                    text: el.textContent.substring(0, 100)
                  }));
              });
              
              console.log('Problematic elements:', problemElements);
            } else {
              console.log('✅ No jumbled text detected');
            }
            
            // Look for continue/proceed button
            const continueButton = await page.$('button:has-text("Confirm")');
            if (continueButton) {
              console.log('5. Found continue button, testing navigation...');
              
              // Get current step indicator
              const beforeClick = await page.textContent('.MuiStepper-root');
              console.log('Before click - stepper state:', beforeClick);
              
              // Click continue
              await continueButton.click();
              await page.waitForTimeout(3000);
              
              // Check if we moved to next step
              const afterClick = await page.textContent('.MuiStepper-root');
              console.log('After click - stepper state:', afterClick);
              
              // Look for motivations section
              const motivationsSection = await page.$('text=Generate Strategic Motivations');
              if (motivationsSection) {
                console.log('✅ Successfully navigated to motivations step');
                
                // Take screenshot of motivations step
                await page.screenshot({ path: 'workflow-motivations-step.png', fullPage: true });
                
                // Test motivation generation
                const generateButton = await page.$('button:has-text("Generate Strategic Motivations")');
                if (generateButton) {
                  console.log('6. Testing motivation generation...');
                  await generateButton.click();
                  await page.waitForTimeout(10000); // Wait for AI generation
                  
                  // Check if motivations were generated
                  const motivationCards = await page.$$('.MuiCard-root');
                  if (motivationCards.length > 0) {
                    console.log(`✅ Generated ${motivationCards.length} motivation cards`);
                  } else {
                    console.log('❌ No motivation cards found');
                  }
                  
                  // Take final screenshot
                  await page.screenshot({ path: 'workflow-motivations-generated.png', fullPage: true });
                }
              } else {
                console.log('❌ Did not navigate to motivations step - workflow reset issue still exists');
              }
            } else {
              console.log('❌ Continue button not found');
            }
          } else {
            console.log('❌ Brief review interface not found');
          }
        } else {
          console.log('❌ Upload area not found');
        }
      } else {
        console.log('❌ Dialog did not open');
      }
    } else {
      console.log('❌ Start Flow button not found');
    }
    
  } catch (error) {
    console.log('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log('=== Workflow Test Complete ===');
}

// Only run if called directly
if (require.main === module) {
  testWorkflowFixes();
}

module.exports = { testWorkflowFixes };