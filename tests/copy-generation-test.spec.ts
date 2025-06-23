import { getErrorMessage } from '@/utils/errorUtils';
import { test } from '@playwright/test';

test.describe('Copy Generation Fix Test', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the flow page
    await page.goto('http://localhost:3000/flow');
  });

  test('should test copy generation without 504 timeout', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    try {
      // Look for the workflow dialog or flow interface
      const workflowButton = page.locator('button:has-text("Start Workflow"), button:has-text("Upload Brief"), .workflow-upload');
      if (await workflowButton.count() > 0) {
        await workflowButton.first().click();
      }
      
      // Wait for any upload interface
      await page.waitForTimeout(2000);
      
      // Try to find file input or drag and drop area
      const fileInput = page.locator('input[type="file"], [data-testid="file-upload"], .drag-drop-zone');
      if (await fileInput.count() > 0) {
        // Create a test file content
        const testBriefContent = `
Product Launch Campaign Brief

Objective: Launch our new eco-friendly water bottle to environmentally conscious consumers
Target Audience: Health-conscious millennials and Gen Z (ages 22-40) who prioritize sustainability
Key Messages: 
- 100% recycled materials
- Keeps drinks cold for 24 hours
- Stylish, minimalist design
- Carbon-neutral shipping
Platforms: Instagram, Facebook, TikTok
Budget: $50,000
Timeline: 3 months
Industry: Consumer Goods
        `;
        
        // Try to upload or input the brief
        if (await page.locator('input[type="file"]').count() > 0) {
          // If there's a file input, create a temporary file
          const tempFile = 'test-brief.txt';
          await page.setInputFiles('input[type="file"]', {
            name: tempFile,
            mimeType: 'text/plain',
            buffer: Buffer.from(testBriefContent)
          });
        } else {
          // Try to find textarea or text input
          const textInput = page.locator('textarea, input[type="text"]').first();
          if (await textInput.count() > 0) {
            await textInput.fill(testBriefContent);
          }
        }
        
        // Look for upload/proceed button
        const proceedButton = page.locator('button:has-text("Upload"), button:has-text("Proceed"), button:has-text("Next"), button:has-text("Continue")');
        if (await proceedButton.count() > 0) {
          await proceedButton.first().click();
          console.log('✅ Successfully uploaded brief');
        }
        
        // Wait for brief processing
        await page.waitForTimeout(3000);
        
        // Look for motivations selection
        const motivationItems = page.locator('[data-testid="motivation-item"], .motivation-card, .motivation-option');
        if (await motivationItems.count() > 0) {
          console.log(`Found ${await motivationItems.count()} motivations`);
          
          // Select first 6 motivations
          const motivationsToSelect = Math.min(6, await motivationItems.count());
          for (let i = 0; i < motivationsToSelect; i++) {
            await motivationItems.nth(i).click();
          }
          console.log(`✅ Selected ${motivationsToSelect} motivations`);
          
          // Look for copy generation button
          const generateButton = page.locator('button:has-text("Generate Copy"), button:has-text("Create Copy"), button:has-text("Generate"), button:has-text("Next")');
          if (await generateButton.count() > 0) {
            console.log('🚀 Starting copy generation...');
            
            // Monitor network requests for the copy generation API
            const copyGenerationPromise = page.waitForResponse(
              response => response.url().includes('/api/flow/generate-copy') && response.status() < 400,
              { timeout: 30000 }
            );
            
            await generateButton.first().click();
            
            try {
              const response = await copyGenerationPromise;
              console.log(`✅ Copy generation API responded with status: ${response.status()}`);
              
              if (response.status() === 200) {
                const responseData = await response.json();
                console.log(`✅ Generated ${responseData.data?.length || 0} copy variations`);
                
                // Wait for copy results to appear in UI
                await page.waitForTimeout(2000);
                
                // Look for copy results
                const copyResults = page.locator('.copy-variation, .copy-result, .generated-copy, [data-testid="copy-item"]');
                if (await copyResults.count() > 0) {
                  console.log(`✅ Found ${await copyResults.count()} copy variations in UI`);
                } else {
                  console.log('⚠️ Copy generated but not visible in UI yet');
                }
              }
              
            } catch (error) {
    const message = getErrorMessage(error);
              console.error('❌ Copy generation failed:', error);
              throw error;
            }
          } else {
            console.log('⚠️ No copy generation button found');
          }
        } else {
          console.log('⚠️ No motivations found for selection');
        }
      } else {
        console.log('⚠️ No file upload interface found');
      }
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.error('Test error:', error);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'copy-generation-test-error.png', fullPage: true });
      throw error;
    }
  });
  
  test('should verify assets page loads correctly', async ({ page }) => {
    // Navigate to assets page
    await page.goto('http://localhost:3000/assets');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if page loaded without errors
    const pageTitle = await page.locator('h1, h2, h3').first().textContent();
    console.log(`✅ Assets page loaded with title: ${pageTitle}`);
    
    // Look for asset-related elements
    const assetElements = page.locator('.asset-card, .asset-item, [data-testid="asset"]');
    const assetCount = await assetElements.count();
    console.log(`Found ${assetCount} asset elements`);
    
    // Check for upload functionality
    const uploadButton = page.locator('button:has-text("Upload"), button:has-text("Add Asset"), .upload-button');
    if (await uploadButton.count() > 0) {
      console.log('✅ Upload functionality found on assets page');
    }
    
    // Take screenshot
    await page.screenshot({ path: 'assets-page-test.png', fullPage: true });
  });
});