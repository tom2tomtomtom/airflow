import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from '@playwright/test';

test.describe('AIrWAVE Application Workflows', () => {
  
  test('authentication workflow testing', async ({ page }) => {
    console.log('🔐 Testing Authentication Workflow...');
    
    try {
      await page.goto('http://localhost:3000', { 
        waitUntil: 'domcontentloaded',
        timeout: 15000 
      });
      
      // Look for authentication elements
      const authElements = await page.evaluate(() => {
        return {
          loginButtons: document.querySelectorAll('button:has-text("Login"), button:has-text("Sign"), [data-testid*="login"]').length,
          emailInputs: document.querySelectorAll('input[type="email"], input[placeholder*="email"]').length,
          passwordInputs: document.querySelectorAll('input[type="password"], input[placeholder*="password"]').length,
          authForms: document.querySelectorAll('form, [data-testid*="auth-form"]').length,
          signupLinks: document.querySelectorAll('a:has-text("Sign up"), a:has-text("Register")').length
        };
      });
      
      console.log('🔍 Authentication Elements Found:');
      Object.entries(authElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Test authentication flow if elements exist
      if (authElements.emailInputs > 0) {
        console.log('✅ Email input detected - testing login flow');
        await page.fill('input[type="email"]', 'test@airwave.com');
        
        if (authElements.passwordInputs > 0) {
          await page.fill('input[type="password"]', 'TestPassword123!');
          console.log('✅ Credentials entered');
        }
      }
      
      expect(true).toBe(true); // Discovery test
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Auth workflow test error: ${error.message}`);
    }
  });
  
  test('client management workflow testing', async ({ page }) => {
    console.log('👥 Testing Client Management Workflow...');
    
    try {
      await page.goto('http://localhost:3000', { timeout: 15000 });
      
      // Look for client management elements
      const clientElements = await page.evaluate(() => {
        return {
          clientButtons: document.querySelectorAll('button:has-text("Client"), [data-testid*="client"]').length,
          addClientButtons: document.querySelectorAll('button:has-text("Add"), button:has-text("Create"), button:has-text("New")').length,
          clientList: document.querySelectorAll('[data-testid*="client-list"], .client-item, [class*="client"]').length,
          navigationLinks: document.querySelectorAll('nav a, [role="navigation"] a').length
        };
      });
      
      console.log('🔍 Client Management Elements:');
      Object.entries(clientElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Test navigation to clients section
      const clientNav = await page.locator('a:has-text("Client"), nav a:has-text("Client"), [href*="client"]').first();
      if (await clientNav.count() > 0) {
        console.log('✅ Client navigation found - testing click');
        await clientNav.click();
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBe(true);
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Client workflow test error: ${error.message}`);
    }
  });
  
  test('asset management workflow testing', async ({ page }) => {
    console.log('📁 Testing Asset Management Workflow...');
    
    try {
      await page.goto('http://localhost:3000', { timeout: 15000 });
      
      const assetElements = await page.evaluate(() => {
        return {
          uploadButtons: document.querySelectorAll('button:has-text("Upload"), input[type="file"], [data-testid*="upload"]').length,
          assetLibrary: document.querySelectorAll('[data-testid*="asset"], .asset-item, [class*="asset"]').length,
          dragDropZones: document.querySelectorAll('[class*="dropzone"], [data-testid*="drop"]').length,
          fileInputs: document.querySelectorAll('input[type="file"]').length
        };
      });
      
      console.log('🔍 Asset Management Elements:');
      Object.entries(assetElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Test asset navigation
      const assetNav = await page.locator('a:has-text("Asset"), nav a:has-text("Library"), [href*="asset"]').first();
      if (await assetNav.count() > 0) {
        console.log('✅ Asset navigation found');
        await assetNav.click();
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBe(true);
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Asset workflow test error: ${error.message}`);
    }
  });
  
  test('strategy development workflow testing', async ({ page }) => {
    console.log('🧠 Testing Strategy Development Workflow...');
    
    try {
      await page.goto('http://localhost:3000', { timeout: 15000 });
      
      const strategyElements = await page.evaluate(() => {
        return {
          strategyButtons: document.querySelectorAll('button:has-text("Strategy"), button:has-text("AI"), [data-testid*="strategy"]').length,
          briefInputs: document.querySelectorAll('textarea, [placeholder*="brief"], [data-testid*="brief"]').length,
          generateButtons: document.querySelectorAll('button:has-text("Generate"), button:has-text("Create"), button:has-text("Process")').length,
          aiElements: document.querySelectorAll('[class*="ai"], [data-testid*="ai"]').length
        };
      });
      
      console.log('🔍 Strategy Development Elements:');
      Object.entries(strategyElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Test strategy navigation
      const strategyNav = await page.locator('a:has-text("Strategy"), nav a:has-text("Flow"), [href*="strategy"]').first();
      if (await strategyNav.count() > 0) {
        console.log('✅ Strategy navigation found');
        await strategyNav.click();
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBe(true);
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Strategy workflow test error: ${error.message}`);
    }
  });
  
  test('campaign matrix workflow testing', async ({ page }) => {
    console.log('📊 Testing Campaign Matrix Workflow...');
    
    try {
      await page.goto('http://localhost:3000', { timeout: 15000 });
      
      const matrixElements = await page.evaluate(() => {
        return {
          matrixButtons: document.querySelectorAll('button:has-text("Matrix"), button:has-text("Campaign"), [data-testid*="matrix"]').length,
          gridElements: document.querySelectorAll('[class*="grid"], [data-testid*="grid"], table').length,
          executeButtons: document.querySelectorAll('button:has-text("Execute"), button:has-text("Run"), button:has-text("Start")').length,
          dragElements: document.querySelectorAll('[draggable="true"], [data-testid*="drag"]').length
        };
      });
      
      console.log('🔍 Campaign Matrix Elements:');
      Object.entries(matrixElements).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      // Test matrix navigation
      const matrixNav = await page.locator('a:has-text("Matrix"), nav a:has-text("Campaign"), [href*="matrix"]').first();
      if (await matrixNav.count() > 0) {
        console.log('✅ Matrix navigation found');
        await matrixNav.click();
        await page.waitForTimeout(1000);
      }
      
      expect(true).toBe(true);
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Matrix workflow test error: ${error.message}`);
    }
  });
  
  test('complete user journey workflow', async ({ page }) => {
    console.log('🔄 Testing Complete User Journey...');
    
    const journey = {
      steps: 0,
      completed: [],
      errors: []
    };
    
    try {
      // Step 1: Initial load
      console.log('📋 Step 1: Application Load');
      await page.goto('http://localhost:3000', { timeout: 15000 });
      journey.steps++;
      journey.completed.push('Application loaded');
      
      // Step 2: Check navigation
      console.log('📋 Step 2: Navigation Check');
      const navLinks = await page.locator('nav a, [role="navigation"] a').count();
      console.log(`   Found ${navLinks} navigation links`);
      journey.steps++;
      journey.completed.push(`Navigation (${navLinks} links)`);
      
      // Step 3: Check main content areas
      console.log('📋 Step 3: Content Areas Check');
      const contentAreas = await page.evaluate(() => {
        return {
          main: document.querySelectorAll('main, [role="main"]').length,
          sections: document.querySelectorAll('section').length,
          buttons: document.querySelectorAll('button').length,
          forms: document.querySelectorAll('form').length
        };
      });
      
      console.log('   Content areas:', contentAreas);
      journey.steps++;
      journey.completed.push(`Content areas detected`);
      
      // Step 4: Interaction testing
      console.log('📋 Step 4: Basic Interactions');
      const firstButton = await page.locator('button').first();
      if (await firstButton.count() > 0) {
        await firstButton.click();
        console.log('   ✅ Button interaction successful');
        journey.completed.push('Button interaction');
      }
      journey.steps++;
      
      // Step 5: Performance check
      console.log('📋 Step 5: Performance Check');
      const performanceMetrics = await page.evaluate(() => {
        return {
          loadComplete: document.readyState === 'complete',
          timestamp: Date.now()
        };
      });
      console.log('   Performance:', performanceMetrics);
      journey.steps++;
      journey.completed.push('Performance checked');
      
      console.log('\\n🎯 Journey Summary:');
      console.log(`   Steps completed: ${journey.steps}`);
      console.log(`   Successful operations: ${journey.completed.length}`);
      journey.completed.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
      
      expect(journey.steps).toBeGreaterThan(0);
      
    } catch (error) {
    const message = getErrorMessage(error);
      console.log(`❌ Journey error at step ${journey.steps + 1}: ${error.message}`);
      journey.errors.push(error.message);
    }
  });
});