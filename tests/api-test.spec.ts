import { getErrorMessage } from '@/utils/errorUtils';
import { test } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const testCredentialsPath = path.join(process.cwd(), 'test-credentials.json');
const testCredentials = JSON.parse(fs.readFileSync(testCredentialsPath, 'utf8'));
console.log('✅ Test credentials loaded');

test.describe('API Test', () => {
  test('Test parse-brief API endpoint directly', async ({ page }) => {
    console.log('🚀 Testing API endpoint directly...');
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Login
    console.log('🔑 Logging in...');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    console.log('✅ Logged in successfully');
    
    // Create test file
    const testContent = `AIRWAVE Test Brief

Campaign Objective:
Create comprehensive social media campaign for product launch.

Target Audience:
Tech-savvy millennials (25-35)

Key Messages:
- Innovation and cutting-edge technology
- User-friendly design
- Competitive pricing

Platforms:
- Instagram
- LinkedIn
- Twitter

Budget:
$50,000 total campaign budget

Timeline:
Pre-launch: 2 weeks
Launch week: 1 week
Post-launch: 1 month
`;
    
    const tempFilePath = path.join(process.cwd(), 'temp-api-test.txt');
    fs.writeFileSync(tempFilePath, testContent);
    
    try {
      // Test API endpoint directly using page.evaluate with fetch
      console.log('🌐 Testing API endpoint...');
      
      const apiResult = await page.evaluate(async (fileContent) => {
        try {
          // Create a File object
          const file = new File([fileContent], 'test-brief.txt', { type: 'text/plain' });
          
          // Create FormData
          const formData = new FormData();
          formData.append('file', file);
          
          console.log('📤 Sending API request...');
          const response = await fetch('/api/flow/parse-brief', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          });
          
          console.log('📥 API response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API returned ${response.status}: ${errorText}`);
          }
          
          const result = await response.json();
          console.log('✅ API response received:', result);
          return result;
          
        } catch (error) {
    const message = getErrorMessage(error);
          console.error('❌ API error:', error);
          return { error: error.message };
        }
      }, testContent);
      
      console.log('🎯 API Test Result:', JSON.stringify(apiResult, null, 2));
      
      if (apiResult.error) {
        console.log('❌ API test failed:', apiResult.error);
      } else if (apiResult.success) {
        console.log('✅ API test passed!');
        console.log('📄 Parsed brief data:', JSON.stringify(apiResult.data, null, 2));
      } else {
        console.log('⚠️ API returned unexpected response');
      }
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('🧹 Cleaned up temp file');
      }
    }
  });
  
  test('Test workflow component initialization without file upload', async ({ page }) => {
    console.log('🚀 Testing workflow component initialization...');
    
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
    await page.waitForTimeout(5000); // Give more time for component to load
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Check if workflow dialog is visible
    const workflowDialog = page.locator('[role="dialog"]');
    const isVisible = await workflowDialog.isVisible();
    console.log(`💬 Workflow dialog visible: ${isVisible}`);
    
    // Check component initialization
    console.log('🔍 Checking component initialization...');
    
    // Wait for component to fully initialize
    await page.waitForTimeout(3000);
    
    const componentState = await page.evaluate(() => {
      // Check if the component has initialized properly
      const workflowState = sessionStorage.getItem('airwave_unified_workflow_state');
      const hasFileInput = document.querySelector('input[type="file"]') !== null;
      const hasDialog = document.querySelector('[role="dialog"]') !== null;
      
      return {
        hasState: !!workflowState,
        state: workflowState ? JSON.parse(workflowState) : null,
        hasFileInput,
        hasDialog,
        url: window.location.href
      };
    });
    
    console.log('📊 Component State Check:');
    console.log(`   Has State: ${componentState.hasState}`);
    console.log(`   Has File Input: ${componentState.hasFileInput}`);
    console.log(`   Has Dialog: ${componentState.hasDialog}`);
    console.log(`   Current URL: ${componentState.url}`);
    
    if (componentState.state) {
      console.log(`   Active Step: ${componentState.state.activeStep}`);
      console.log(`   Brief Confirmed: ${componentState.state.briefConfirmed}`);
      console.log(`   Show Brief Review: ${componentState.state.showBriefReview}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/component-initialization.png', fullPage: true });
    
    // Test basic component interaction
    console.log('🎯 Testing basic component interaction...');
    
    if (componentState.hasFileInput) {
      console.log('✅ File input found - component properly initialized');
    } else {
      console.log('❌ File input not found - component may not be initialized');
    }
    
    // Check for any console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('🚨 Console errors detected:');
      consoleErrors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No console errors detected');
    }
    
    console.log('='.repeat(80));
    console.log('🎯 COMPONENT INITIALIZATION TEST COMPLETE');
    console.log('='.repeat(80));
  });
});
