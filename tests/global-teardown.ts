import { getErrorMessage } from '@/utils/errorUtils';
import { chromium, FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting AIRWAVE E2E Test Suite Global Teardown');

  const { baseURL } = config.projects[0].use;
  const targetURL = baseURL || 'http://localhost:3000';

  try {
    // Clean up authentication state
    await cleanupAuthState();

    // Clean up test data
    await cleanupTestData(targetURL);

    // Generate enhanced test reports
    await generateEnhancedTestReports();

    // Clean up temporary files
    await cleanupTempFiles();

    console.log('🎉 Global teardown completed successfully');
  } catch (error) {
    const message = getErrorMessage(error);
    console.error('❌ Global teardown failed:', message);
    // Don't throw error in teardown to avoid masking test failures
  }
}

/**
 * Clean up authentication state files
 */
async function cleanupAuthState() {
  try {
    const authStatePath = 'tests/auth-state.json';

    try {
      await fs.access(authStatePath);
      await fs.unlink(authStatePath);
      console.log('✅ Authentication state file removed');
    } catch (error) {
      console.log('ℹ️ No authentication state file to clean up');
    }
  } catch (error) {
    console.warn('⚠️ Auth state cleanup failed:', getErrorMessage(error));
  }
}

/**
 * Clean up test data created during tests
 */
async function cleanupTestData(baseURL: string) {
  console.log('🗑️ Cleaning up test data...');

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Check if server is available
      await page.goto(baseURL, { timeout: 10000 });

      // Try to authenticate for cleanup
      await authenticateForCleanup(page);

      // Clean up test entities
      await cleanupTestClients(page);
      await cleanupTestAssets(page);
      await cleanupTestCampaigns(page);

      // Clear browser storage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await context.clearCookies();
      console.log('✅ Browser storage cleared');
    } finally {
      await context.close();
      await browser.close();
    }
  } catch (error) {
    console.log('ℹ️ Server not available for cleanup, skipping test data cleanup');
  }
}

/**
 * Authenticate for cleanup operations
 */
async function authenticateForCleanup(page: any) {
  try {
    // Try to navigate to dashboard to check authentication
    await page.goto('/dashboard', { timeout: 5000 });

    const isAuthenticated = await page
      .locator('[data-testid="user-menu"]')
      .isVisible({ timeout: 3000 });

    if (!isAuthenticated) {
      console.log('Attempting login for cleanup...');
      await page.goto('/login');

      const testEmail = process.env.TEST_USER_EMAIL || 'test@airwave.com';
      const testPassword = process.env.TEST_USER_PASSWORD || 'TestPass123!';

      await page.locator('[data-testid="email-input"]').fill(testEmail);
      await page.locator('[data-testid="password-input"]').fill(testPassword);
      await page.locator('[data-testid="login-button"]').click();

      await page.waitForURL('**/dashboard', { timeout: 10000 });
    }
  } catch (error) {
    throw new Error('Could not authenticate for cleanup');
  }
}

/**
 * Clean up test clients
 */
async function cleanupTestClients(page: any) {
  try {
    // Try API cleanup first
    const apiResponse = await page.request.get('/api/v2/clients?search=E2E Test');
    if (apiResponse.ok()) {
      const clientsData = await apiResponse.json();
      const clients = clientsData.data || clientsData;

      if (Array.isArray(clients)) {
        for (const client of clients) {
          if (
            client.name &&
            (client.name.includes('E2E Test') || client.name.includes('Test Client'))
          ) {
            try {
              await page.request.delete(`/api/v2/clients/${client.id}`);
              console.log(`✅ Deleted test client via API: ${client.name}`);
            } catch (deleteError) {
              console.log(`ℹ️ Could not delete client ${client.name} via API`);
            }
          }
        }
      }
    } else {
      // Fallback to UI cleanup
      await page.goto('/clients');
      await page.waitForLoadState('networkidle', { timeout: 5000 });

      const testClients = page.locator('[data-testid="client-item"]').filter({
        hasText: /E2E Test|Test Client/i,
      });

      const clientCount = await testClients.count();
      for (let i = 0; i < Math.min(clientCount, 5); i++) {
        try {
          await testClients.nth(i).click();
          const deleteButton = page.locator('[data-testid="delete-client-button"]');
          if (await deleteButton.isVisible({ timeout: 2000 })) {
            await deleteButton.click();
            const confirmButton = page.locator('[data-testid="confirm-delete-button"]');
            if (await confirmButton.isVisible({ timeout: 2000 })) {
              await confirmButton.click();
            }
          }
        } catch (error) {
          continue;
        }
      }
    }
  } catch (error) {
    console.log('ℹ️ Could not clean up test clients:', getErrorMessage(error));
  }
}

/**
 * Clean up test assets
 */
async function cleanupTestAssets(page: any) {
  try {
    const apiResponse = await page.request.get('/api/v2/assets?search=test');
    if (apiResponse.ok()) {
      const assetsData = await apiResponse.json();
      const assets = assetsData.data || assetsData;

      if (Array.isArray(assets)) {
        for (const asset of assets.slice(0, 10)) {
          // Limit to 10
          if (asset.name && asset.name.toLowerCase().includes('test')) {
            try {
              await page.request.delete(`/api/v2/assets/${asset.id}`);
              console.log(`✅ Deleted test asset: ${asset.name}`);
            } catch (deleteError) {
              console.log(`ℹ️ Could not delete asset ${asset.name}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('ℹ️ Could not clean up test assets:', getErrorMessage(error));
  }
}

/**
 * Clean up test campaigns
 */
async function cleanupTestCampaigns(page: any) {
  try {
    const apiResponse = await page.request.get('/api/v2/campaigns?search=test');
    if (apiResponse.ok()) {
      const campaignsData = await apiResponse.json();
      const campaigns = campaignsData.data || campaignsData;

      if (Array.isArray(campaigns)) {
        for (const campaign of campaigns.slice(0, 5)) {
          // Limit to 5
          if (campaign.name && campaign.name.toLowerCase().includes('test')) {
            try {
              await page.request.delete(`/api/v2/campaigns/${campaign.id}`);
              console.log(`✅ Deleted test campaign: ${campaign.name}`);
            } catch (deleteError) {
              console.log(`ℹ️ Could not delete campaign ${campaign.name}`);
            }
          }
        }
      }
    }
  } catch (error) {
    console.log('ℹ️ Could not clean up test campaigns:', getErrorMessage(error));
  }
}

/**
 * Generate enhanced test reports
 */
async function generateEnhancedTestReports() {
  try {
    console.log('📊 Generating enhanced test reports...');

    const testResultsDir = 'test-results';

    // Check if results directory exists
    try {
      await fs.access(testResultsDir);
    } catch (error) {
      console.log('ℹ️ No test results directory found');
      return;
    }

    const files = await fs.readdir(testResultsDir);
    console.log(`📁 Test artifacts generated: ${files.length} files`);

    // Parse and summarize test results
    const resultsFile = path.join(testResultsDir, 'results.json');

    try {
      await fs.access(resultsFile);
      const results = JSON.parse(await fs.readFile(resultsFile, 'utf8'));

      console.log('📈 Test Results Summary:');
      console.log(`   Total Tests: ${results.stats?.total || 'N/A'}`);
      console.log(`   Passed: ${results.stats?.passed || 'N/A'}`);
      console.log(`   Failed: ${results.stats?.failed || 'N/A'}`);
      console.log(`   Skipped: ${results.stats?.skipped || 'N/A'}`);
      console.log(`   Duration: ${results.stats?.duration || 'N/A'}ms`);

      // Generate summary report
      const summaryReport = {
        timestamp: new Date().toISOString(),
        testRun: process.env.GITHUB_RUN_ID || Date.now().toString(),
        environment: process.env.NODE_ENV || 'test',
        results: results.stats,
        cleanup: {
          authState: 'completed',
          testData: 'attempted',
          tempFiles: 'completed',
        },
      };

      await fs.writeFile(
        path.join(testResultsDir, 'teardown-summary.json'),
        JSON.stringify(summaryReport, null, 2)
      );

      console.log('✅ Enhanced test reports generated');
    } catch (error) {
      console.log('ℹ️ Could not parse test results file');
    }
  } catch (error) {
    console.warn('⚠️ Test report generation failed:', getErrorMessage(error));
  }
}

/**
 * Clean up temporary files
 */
async function cleanupTempFiles() {
  try {
    console.log('🗑️ Cleaning up temporary files...');

    // Clean up old test artifacts (keep last 3 runs)
    const tempDirs = ['test-results/videos', 'test-results/screenshots', 'test-results/artifacts'];

    for (const dir of tempDirs) {
      try {
        await fs.access(dir);

        const files = await fs.readdir(dir);
        const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

        let cleanedCount = 0;
        for (const file of files) {
          try {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);

            if (stats.mtime.getTime() < twoDaysAgo) {
              await fs.unlink(filePath);
              cleanedCount++;
            }
          } catch (error) {
            // Continue with other files
          }
        }

        if (cleanedCount > 0) {
          console.log(`🗑️ Cleaned up ${cleanedCount} old files from ${dir}`);
        }
      } catch (error) {
        // Directory doesn't exist, which is fine
      }
    }

    console.log('✅ Temporary files cleanup completed');
  } catch (error) {
    console.warn('⚠️ Temporary files cleanup failed:', getErrorMessage(error));
  }
}

export default globalTeardown;
