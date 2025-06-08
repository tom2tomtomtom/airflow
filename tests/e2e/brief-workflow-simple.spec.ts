import { test, expect } from '@playwright/test';

test.describe('Brief Workflow Simple Test', () => {
  test('should test brief workflow without login', async ({ page }) => {
    console.log('=== Starting Simple Brief Workflow Test ===');
    
    // Navigate directly to flow page
    await page.goto('http://localhost:3001/flow');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'debug-flow-initial.png', fullPage: true });
    console.log('Initial page loaded');
    
    // Look for any workflow or brief related elements
    const workflowElements = await page.locator('*').filter({ hasText: /brief|workflow|upload/i }).all();
    console.log(`Found ${workflowElements.length} workflow-related elements`);
    
    // Check if we need to login
    if (await page.locator('input[type="email"]').isVisible()) {
      console.log('Login required, filling credentials...');
      await page.fill('input[type="email"]', 'tomh@redbaez.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Look for brief workflow triggers
    const briefButtons = await page.locator('button, [role="button"]').filter({ hasText: /brief|upload|workflow/i }).all();
    console.log(`Found ${briefButtons.length} brief-related buttons`);
    
    if (briefButtons.length > 0) {
      console.log('Clicking brief workflow button...');
      await briefButtons[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'debug-after-brief-click.png', fullPage: true });
    }
    
    // Check for dialog/modal
    const dialog = page.locator('[role="dialog"], .MuiDialog-root');
    const isDialogVisible = await dialog.isVisible();
    console.log(`Dialog visible: ${isDialogVisible}`);
    
    if (isDialogVisible) {
      await page.screenshot({ path: 'debug-dialog-open.png', fullPage: true });
      
      // Look for upload area
      const uploadArea = page.locator('[class*="dropzone"], input[type="file"]');
      const hasUploadArea = await uploadArea.isVisible();
      console.log(`Upload area visible: ${hasUploadArea}`);
      
      if (hasUploadArea) {
        console.log('Upload area found - workflow is accessible');
        
        // Look for any text that might be jumbled
        const dialogContent = await dialog.textContent();
        if (dialogContent) {
          const hasJumbledText = dialogContent.includes('[object') || dialogContent.includes('undefined') || dialogContent.includes('Object Object');
          console.log(`Has jumbled text in dialog: ${hasJumbledText}`);
          
          if (hasJumbledText) {
            console.log('🚨 ISSUE: Jumbled text detected in dialog');
            console.log('Problematic content:', dialogContent.substring(0, 200));
          }
        }
      }
    }
    
    console.log('=== Simple Test Complete ===');
  });

  test('should test API endpoints directly', async ({ request }) => {
    console.log('=== Testing API Endpoints ===');
    
    // Test brief parsing API with simple text
    const testBriefContent = `
Redbaez Airwave Brief
Objective: Create engaging social media content for insurance products
Target Audience: Young professionals aged 25-40
Key Messages: 
- Affordable insurance solutions
- Quick and easy application process  
- Comprehensive coverage options
Platforms: Instagram, Facebook, LinkedIn
Budget: $50,000
Timeline: 3 months
Product: Life Insurance
Value Proposition: Protecting what matters most at an affordable price
Industry: Insurance
Brand Guidelines: Use modern, trustworthy tone with bright colors
Requirements: Mobile-first design, accessibility compliance
Competitors: Lemonade, Progressive, Geico
`;
    
    // Create form data
    const formData = new FormData();
    const blob = new Blob([testBriefContent], { type: 'text/plain' });
    formData.append('file', blob, 'test-brief.txt');
    
    try {
      const response = await fetch('http://localhost:3001/api/flow/parse-brief', {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      console.log('Parse Brief API Response Status:', response.status);
      console.log('Parse Brief API Result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        console.log('✅ Brief parsing successful');
        
        // Check for data structure issues
        const briefData = result.data;
        const issues = [];
        
        // Check for object-to-string conversion issues
        if (typeof briefData.targetAudience === 'object') {
          issues.push('targetAudience is object instead of string');
        }
        if (typeof briefData.valueProposition === 'object') {
          issues.push('valueProposition is object instead of string');
        }
        if (typeof briefData.product === 'object') {
          issues.push('product is object instead of string');
        }
        
        // Check for undefined/null values that might display as [object Object]
        Object.keys(briefData).forEach(key => {
          const value = briefData[key];
          if (value === null || value === undefined) {
            issues.push(`${key} is null/undefined`);
          }
          if (typeof value === 'string' && (value.includes('[object') || value.includes('Object'))) {
            issues.push(`${key} contains object reference: ${value}`);
          }
        });
        
        if (issues.length > 0) {
          console.log('🚨 DATA STRUCTURE ISSUES FOUND:');
          issues.forEach(issue => console.log(`- ${issue}`));
        } else {
          console.log('✅ No data structure issues detected');
        }
        
        // Test motivations generation
        try {
          const motivationsResponse = await fetch('http://localhost:3001/api/flow/generate-motivations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ briefData: result.data }),
          });
          
          const motivationsResult = await motivationsResponse.json();
          console.log('Motivations API Status:', motivationsResponse.status);
          console.log('Motivations API Result:', JSON.stringify(motivationsResult, null, 2));
          
          if (motivationsResult.success) {
            console.log('✅ Motivations generation successful');
          } else {
            console.log('❌ Motivations generation failed:', motivationsResult.message);
          }
          
        } catch (error) {
          console.log('❌ Motivations API Error:', error);
        }
        
      } else {
        console.log('❌ Brief parsing failed:', result.message);
      }
      
    } catch (error) {
      console.log('❌ Parse Brief API Error:', error);
    }
    
    console.log('=== API Testing Complete ===');
  });
});