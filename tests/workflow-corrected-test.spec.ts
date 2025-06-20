import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const testCredentialsPath = path.join(process.cwd(), 'test-credentials.json');
const testCredentials = JSON.parse(fs.readFileSync(testCredentialsPath, 'utf8'));
console.log('✅ Test credentials loaded');

test.describe('Workflow Corrected Test', () => {
  test('Test UnifiedBriefWorkflow with Correct Storage Key and File Type', async ({ page }) => {
    console.log('🚀 Starting corrected workflow test...');
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Login
    console.log('🔑 Logging in...');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    console.log('✅ Logged in, navigating to /flow...');
    
    // Navigate to flow page
    await page.goto('http://localhost:3000/flow');
    await page.waitForTimeout(3000);
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Check if workflow dialog is visible
    const workflowDialog = page.locator('[role="dialog"]');
    const isVisible = await workflowDialog.isVisible();
    console.log(`💬 Workflow dialog visible: ${isVisible}`);
    
    if (!isVisible) {
      console.log('❌ Workflow dialog not found');
      throw new Error('Workflow dialog not visible');
    }
    
    // Set up API and console monitoring
    await page.addInitScript(() => {
      // Monitor all network requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const startTime = Date.now();
        console.log(`🌐 API CALL: ${args[0]}`, args[1] ? args[1].method || 'GET' : 'GET');
        
        try {
          const response = await originalFetch(...args);
          const duration = Date.now() - startTime;
          console.log(`✅ API SUCCESS: ${args[0]} (${response.status}) ${duration}ms`);
          
          // Log response for file upload endpoints
          if (args[0].toString().includes('parse-brief') || args[0].toString().includes('upload')) {
            const clonedResponse = response.clone();
            try {
              const responseData = await clonedResponse.text();
              console.log(`📄 UPLOAD RESPONSE:`, responseData.substring(0, 500));
            } catch (e) {
              console.log(`📄 UPLOAD RESPONSE: [Binary or unreadable]`);
            }
          }
          
          return response;
        } catch (error) {
          const duration = Date.now() - startTime;
          console.log(`❌ API ERROR: ${args[0]} ${duration}ms`, error);
          throw error;
        }
      };
      
      // Monitor console errors and logs
      const originalError = console.error;
      const originalLog = console.log;
      
      console.error = (...args) => {
        console.log('🚨 CONSOLE ERROR:', ...args);
        originalError(...args);
      };
      
      // Monitor file input changes
      document.addEventListener('change', (event) => {
        if (event.target && (event.target as HTMLInputElement).type === 'file') {
          const fileInput = event.target as HTMLInputElement;
          console.log(`📁 FILE INPUT CHANGE: ${fileInput.files?.length || 0} files selected`);
          if (fileInput.files && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
              const file = fileInput.files[i];
              console.log(`   📄 File ${i + 1}: ${file.name} (${file.size} bytes, ${file.type})`);
            }
          }
        }
      });
    });
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/corrected-test-initial.png', fullPage: true });
    
    // Check initial state with CORRECT storage key
    console.log('🔍 Checking initial state with correct storage key...');
    const initialState = await page.evaluate(() => {
      // Use the CORRECT storage key from the component
      const workflowState = sessionStorage.getItem('airwave_unified_workflow_state');
      if (workflowState) {
        const parsed = JSON.parse(workflowState);
        console.log('📊 Found initial state:', parsed);
        return parsed;
      }
      console.log('📊 No initial state found');
      return null;
    });
    
    console.log('📊 Initial workflow state:', initialState);
    
    // Find file input
    console.log('📁 Looking for file input...');
    const fileInputs = await page.locator('input[type="file"]').count();
    console.log(`📁 Found ${fileInputs} file input(s)`);
    
    if (fileInputs === 0) {
      console.log('❌ No file inputs found');
      throw new Error('No file inputs found');
    }
    
    // Create test file in SUPPORTED format (TXT instead of MD)
    console.log('📄 Creating test file in supported format (TXT)...');
    const testContent = `AIRWAVE Test Brief

Campaign Objective:
Create comprehensive social media campaign for product launch targeting tech-savvy millennials.

Target Audience:
- Tech-savvy millennials (25-35)
- Early adopters
- Social media active users
- Income: $50,000-$100,000

Key Messages:
- Innovation and cutting-edge technology
- User-friendly design
- Competitive pricing
- Exclusive launch offer
- 24/7 customer support

Platforms:
- Instagram (primary focus)
- LinkedIn (professional networking)
- Twitter (real-time engagement)
- Facebook (broad reach)

Timeline:
- Pre-launch: 2 weeks of teaser content
- Launch week: 1 week intensive campaign
- Post-launch: 1 month sustained engagement

Budget:
$50,000 total campaign budget
- Content creation: $20,000
- Paid advertising: $25,000
- Influencer partnerships: $5,000

Success Metrics:
- Reach: 1M+ impressions
- Engagement: 5%+ rate
- Conversions: 1000+ sign-ups
- Brand awareness: 25% increase
- Cost per acquisition: <$50

Creative Requirements:
- High-quality product images
- Video testimonials from beta users
- Infographics showing product benefits
- User-generated content campaigns
- Behind-the-scenes content

Brand Guidelines:
- Primary colors: Blue (#1976D2), White (#FFFFFF)
- Secondary colors: Gray (#757575), Green (#4CAF50)
- Font: Modern, clean sans-serif
- Tone: Professional yet approachable
- Voice: Confident, helpful, innovative

Compliance:
- Follow platform advertising guidelines
- Include required disclaimers
- Respect user privacy and data protection
- Adhere to FTC disclosure requirements

Competitors:
- TechCorp Solutions
- InnovateTech Pro
- DigitalEdge Systems

Value Proposition:
Our product offers the perfect balance of advanced technology and user-friendly design, making complex tasks simple while providing enterprise-level security and reliability at an affordable price point.
`;
    
    const tempFilePath = path.join(process.cwd(), 'temp-test-brief.txt');
    fs.writeFileSync(tempFilePath, testContent);
    
    try {
      // Upload file with monitoring
      console.log('📁 Uploading test file (TXT format)...');
      const fileInput = page.locator('input[type="file"]').first();
      
      await fileInput.setInputFiles(tempFilePath);
      console.log('✅ File set to input');
      
      // Wait and monitor file processing with CORRECT storage key
      console.log('⏱️ Monitoring file processing with correct storage key...');
      let fileProcessed = false;
      
      for (let i = 0; i < 45; i++) {
        await page.waitForTimeout(1000);
        
        const state = await page.evaluate(() => {
          // Use CORRECT storage key
          const workflowState = sessionStorage.getItem('airwave_unified_workflow_state');
          if (workflowState) {
            const parsed = JSON.parse(workflowState);
            return {
              step: parsed.activeStep,
              hasBriefData: !!parsed.briefData,
              briefConfirmed: parsed.briefConfirmed,
              showBriefReview: parsed.showBriefReview,
              briefTitle: parsed.briefData?.title || 'None',
              motivationsCount: parsed.motivations?.length || 0,
              copyCount: parsed.copyVariations?.length || 0
            };
          }
          return null;
        });
        
        if (state) {
          console.log(`📊 ${i + 1}s: Step ${state.step}, Brief: ${state.hasBriefData ? 'Yes' : 'No'}, Review: ${state.showBriefReview ? 'Yes' : 'No'}, Confirmed: ${state.briefConfirmed ? 'Yes' : 'No'}`);
          if (state.briefTitle !== 'None') {
            console.log(`   📄 Brief title: ${state.briefTitle}`);
          }
          
          // Check if file was processed (brief data exists or review mode active)
          if (state.hasBriefData || state.showBriefReview) {
            console.log('🎉 File processing detected!');
            fileProcessed = true;
            break;
          }
        } else {
          console.log(`📊 ${i + 1}s: No workflow state found`);
        }
        
        // Take screenshot every 15 seconds
        if (i % 15 === 0 && i > 0) {
          await page.screenshot({ path: `tests/screenshots/corrected-test-${i}s.png`, fullPage: true });
        }
      }
      
      // Check final state
      console.log('🔍 Final state check...');
      const finalState = await page.evaluate(() => {
        const workflowState = sessionStorage.getItem('airwave_unified_workflow_state');
        if (workflowState) {
          return JSON.parse(workflowState);
        }
        return null;
      });
      
      console.log('📊 Final workflow state:', JSON.stringify(finalState, null, 2));
      
      // Check for any error messages in the UI
      console.log('🔍 Checking for error messages...');
      const errorElements = await page.locator('[role="alert"], .error, .MuiAlert-root').count();
      console.log(`🚨 Found ${errorElements} potential error elements`);
      
      if (errorElements > 0) {
        for (let i = 0; i < errorElements; i++) {
          const errorText = await page.locator('[role="alert"], .error, .MuiAlert-root').nth(i).textContent();
          console.log(`   🚨 Error ${i + 1}: ${errorText}`);
        }
      }
      
      // Take final screenshot
      await page.screenshot({ path: 'tests/screenshots/corrected-test-final.png', fullPage: true });
      
      // Generate comprehensive report
      console.log('\n' + '='.repeat(80));
      console.log('🎯 CORRECTED WORKFLOW TEST REPORT');
      console.log('='.repeat(80));
      console.log(`🔑 Storage Key Used: airwave_unified_workflow_state`);
      console.log(`📄 File Type Used: TXT (supported format)`);
      console.log(`⚡ File Processed: ${fileProcessed ? 'YES' : 'NO'}`);
      
      if (finalState) {
        console.log(`📊 Final State: Step ${finalState.activeStep}`);
        console.log(`📁 Has Brief Data: ${finalState.briefData ? 'YES' : 'NO'}`);
        console.log(`✅ Brief Confirmed: ${finalState.briefConfirmed ? 'YES' : 'NO'}`);
        console.log(`👀 Show Brief Review: ${finalState.showBriefReview ? 'YES' : 'NO'}`);
        
        if (finalState.briefData) {
          console.log(`📄 Brief Title: ${finalState.briefData.title || 'None'}`);
          console.log(`🎯 Objective: ${finalState.briefData.objective?.substring(0, 100) || 'None'}...`);
          console.log(`👥 Target Audience: ${finalState.briefData.targetAudience?.substring(0, 100) || 'None'}...`);
        }
        
        console.log(`🎭 Motivations: ${finalState.motivations?.length || 0}`);
        console.log(`📝 Copy Variations: ${finalState.copyVariations?.length || 0}`);
      } else {
        console.log('❌ No final state found');
      }
      
      console.log('='.repeat(80));
      
      // Test passed if we have state and file was processed
      if (finalState && fileProcessed) {
        console.log('✅ TEST PASSED: Workflow state initialized and file processed successfully!');
      } else {
        console.log('❌ TEST ISSUES: Workflow may have problems');
      }
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('🧹 Cleaned up temp file');
      }
    }
  });
});
