import { getErrorMessage } from '@/utils/errorUtils';
import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting AIRWAVE E2E Test Suite Global Teardown');
  
  // Launch browser for cleanup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Load authentication state if it exists
    const authStatePath = 'tests/auth-state.json';
    if (fs.existsSync(authStatePath)) {
      await page.context().addInitScript(() => {
        // Restore authentication state
      });
    }
    
    // Navigate to application
    await page.goto('http://localhost:3000');
    
    // Clean up test data
    console.log('🗑️ Cleaning up test data...');
    
    try {
      // Delete test clients created during E2E tests
      const clientsResponse = await page.request.get('/api/clients?search=E2E Test');
      if (clientsResponse.ok()) {
        const clients = await clientsResponse.json();
        if (clients.data && Array.isArray(clients.data)) {
          for (const client of clients.data) {
            if (client.name.includes('E2E Test') || client.name.includes('Test Client')) {
              await page.request.delete(`/api/clients/${client.id}`);
              console.log(`✅ Deleted test client: ${client.name}`);
            }
          }
        }
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.log('ℹ️ Could not clean up test clients:', error.message);
    }
    
    try {
      // Delete test campaigns created during E2E tests
      const campaignsResponse = await page.request.get('/api/campaigns?search=E2E Test');
      if (campaignsResponse.ok()) {
        const campaigns = await campaignsResponse.json();
        if (campaigns.data && Array.isArray(campaigns.data)) {
          for (const campaign of campaigns.data) {
            if (campaign.name.includes('E2E Test') || campaign.name.includes('Test Campaign')) {
              await page.request.delete(`/api/campaigns/${campaign.id}`);
              console.log(`✅ Deleted test campaign: ${campaign.name}`);
            }
          }
        }
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.log('ℹ️ Could not clean up test campaigns:', error.message);
    }
    
    try {
      // Delete test assets created during E2E tests
      const assetsResponse = await page.request.get('/api/assets?search=E2E Test');
      if (assetsResponse.ok()) {
        const assets = await assetsResponse.json();
        if (assets.data && Array.isArray(assets.data)) {
          for (const asset of assets.data) {
            if (asset.name.includes('E2E Test') || asset.name.includes('Test Asset')) {
              await page.request.delete(`/api/assets/${asset.id}`);
              console.log(`✅ Deleted test asset: ${asset.name}`);
            }
          }
        }
      }
    } catch (error) {
    const message = getErrorMessage(error);
      console.log('ℹ️ Could not clean up test assets:', error.message);
    }
    
    // Clear browser storage
    console.log('🧽 Clearing browser storage...');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Clear cookies
    await page.context().clearCookies();
    
    console.log('✅ Browser storage cleared');
    
    // Clean up auth state file
    if (fs.existsSync(authStatePath)) {
      fs.unlinkSync(authStatePath);
      console.log('✅ Authentication state file removed');
    }
    
    // Generate test report summary
    console.log('📊 Generating test report summary...');
    const testResultsDir = 'test-results';
    if (fs.existsSync(testResultsDir)) {
      const files = fs.readdirSync(testResultsDir);
      console.log(`📁 Test artifacts generated: ${files.length} files`);
      
      // Log test results summary
      const resultsFile = path.join(testResultsDir, 'results.json');
      if (fs.existsSync(resultsFile)) {
        try {
          const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
          console.log('📈 Test Results Summary:');
          console.log(`   Total Tests: ${results.stats?.total || 'N/A'}`);
          console.log(`   Passed: ${results.stats?.passed || 'N/A'}`);
          console.log(`   Failed: ${results.stats?.failed || 'N/A'}`);
          console.log(`   Skipped: ${results.stats?.skipped || 'N/A'}`);
        } catch (error) {
    const message = getErrorMessage(error);
          console.log('ℹ️ Could not parse test results file');
        }
      }
    }
    
    console.log('🎉 Global teardown completed successfully');
    
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Global teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  } finally {
    await browser.close();
  }
}

export default globalTeardown;
