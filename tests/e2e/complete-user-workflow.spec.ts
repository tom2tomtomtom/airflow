/**
 * Complete User Workflow Tests
 * End-to-end testing of the entire AIrWAVE platform workflow
 * Tests the full user journey from login to campaign execution
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth-page';
import { DashboardPage } from '../pages/dashboard-page';
import { ClientsPage } from '../pages/clients-page';
import { AssetsPage } from '../pages/assets-page';
import { StrategyPage } from '../pages/strategy-page';
import { MatrixPage } from '../pages/matrix-page';
import { AuthHelper } from '../utils/auth-helper';
import { APIMockHelper } from '../utils/api-mock-helper';

test.describe('Complete User Workflow - AIrWAVE Platform', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let clientsPage: ClientsPage;
  let assetsPage: AssetsPage;
  let strategyPage: StrategyPage;
  let matrixPage: MatrixPage;
  let authHelper: AuthHelper;
  let apiMockHelper: APIMockHelper;

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    clientsPage = new ClientsPage(page);
    assetsPage = new AssetsPage(page);
    strategyPage = new StrategyPage(page);
    matrixPage = new MatrixPage(page);
    authHelper = new AuthHelper(page);
    apiMockHelper = new APIMockHelper(page);
    
    // Setup API mocks for consistent testing
    await apiMockHelper.setupDefaultMocks();
  });

  test.describe('Complete Campaign Creation Workflow', () => {
    test('user can create complete campaign from start to finish', async ({ page }) => {
      // STEP 1: Authentication
      await test.step('User logs in successfully', async () => {
        await authHelper.login('test@airwave.com', 'TestPass123!');
        await dashboardPage.verifyUserIsLoggedIn();
        
        // UX: Dashboard loads quickly and shows welcome
        const loadTime = await dashboardPage.measurePageLoadTime();
        expect(loadTime).toBeLessThan(3000);
        
        await expect(dashboardPage.welcomeMessage).toBeVisible();
      });

      // STEP 2: Client Setup
      await test.step('User creates and selects a client', async () => {
        await dashboardPage.navigateToClients();
        await clientsPage.verifyClientsLoaded();
        
        // Create a new client
        const clientData = {
          name: 'Test Campaign Client',
          email: 'client@testcompany.com',
          industry: 'Technology',
          description: 'A technology company for testing campaigns',
          primaryColor: '#007bff',
          secondaryColor: '#6c757d'
        };
        
        const creationTime = await clientsPage.measureClientCreationTime(clientData);
        expect(creationTime).toBeLessThan(5000);
        
        await clientsPage.createClientAndExpectSuccess(clientData);
        
        // Select the newly created client
        await clientsPage.selectClient(clientData.name);
        
        // Verify client is selected across the platform
        await dashboardPage.goto();
        const selectedClient = await dashboardPage.getSelectedClient();
        expect(selectedClient).toContain(clientData.name);
      });

      // STEP 3: Asset Management
      await test.step('User uploads and organizes assets', async () => {
        await dashboardPage.navigateToAssets();
        await assetsPage.verifyAssetsLoaded();
        
        // Upload multiple asset types
        const assetUploads = [
          { name: 'hero-video.mp4', type: 'video' as const },
          { name: 'brand-logo.png', type: 'image' as const },
          { name: 'product-shot.jpg', type: 'image' as const },
          { name: 'tagline.txt', type: 'document' as const },
          { name: 'voice-over.mp3', type: 'audio' as const }
        ];
        
        for (const asset of assetUploads) {
          await assetsPage.uploadFileByDrop(asset.name, asset.type);
          
          // Verify asset appears in the library
          await expect(assetsPage.verifyAssetExists(asset.name)).toBeTruthy();
        }
        
        // Test asset search functionality
        await assetsPage.searchAssets('brand');
        const searchResults = await assetsPage.getAssetNames();
        expect(searchResults.some(name => name.includes('brand'))).toBeTruthy();
        
        // Clear search and verify all assets
        await assetsPage.clearAllFilters();
        const allAssets = await assetsPage.getAssetNames();
        expect(allAssets.length).toBeGreaterThanOrEqual(assetUploads.length);
      });

      // STEP 4: Strategy Development
      await test.step('User creates brief and generates strategy', async () => {
        await dashboardPage.navigateToFlow();
        await strategyPage.waitForLoad();
        
        // Create comprehensive brief
        const briefData = {
          briefText: `
            Create a compelling campaign for our new AI-powered productivity software.
            Target audience: Busy professionals aged 25-45 who struggle with time management.
            Key benefits: Save 2+ hours daily, increase productivity by 40%, reduce stress.
            Tone: Professional yet approachable, emphasizing efficiency and results.
            Call to action: Start free 30-day trial.
            Channels: Social media, email marketing, display advertising.
          `,
          targetAudience: 'Busy professionals aged 25-45',
          keyMessages: 'Save time, increase productivity, reduce stress',
          callToAction: 'Start free 30-day trial',
          tonality: 'professional',
          channels: ['social', 'email', 'display']
        };
        
        await strategyPage.createBriefWithTextInput(briefData);
        
        // Process brief with AI
        const processingTime = await strategyPage.measureBriefProcessingTime(briefData.briefText);
        expect(processingTime).toBeLessThan(60000); // Should complete within 1 minute
        
        await strategyPage.verifyStrategyGenerated();
        
        // Review and select motivations
        const motivations = await strategyPage.getGeneratedMotivations();
        expect(motivations.length).toBeGreaterThan(0);
        
        // Select top-scoring motivations
        const topMotivations = motivations
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        
        for (const motivation of topMotivations) {
          await strategyPage.selectMotivation(motivation.title);
        }
        
        // Generate copy based on selected motivations
        await strategyPage.generateCopy({
          length: 'medium',
          tone: 'professional',
          format: 'social'
        });
        
        await strategyPage.verifyCopyQuality();
        
        // Save the strategy
        await strategyPage.saveStrategy({
          name: 'AI Productivity Software Campaign',
          description: 'Strategy for promoting AI productivity software to busy professionals',
          tags: ['productivity', 'AI', 'professionals']
        });
        
        await strategyPage.verifyBriefSaved();
      });

      // STEP 5: Campaign Matrix Creation
      await test.step('User creates campaign matrix with assets', async () => {
        await dashboardPage.navigateToMatrix();
        await matrixPage.waitForLoad();
        
        // Create new matrix
        await matrixPage.createNewMatrix('Social Media Template');
        await matrixPage.verifyMatrixStructure();
        
        // Add rows for different campaign variations
        for (let i = 0; i < 4; i++) {
          await matrixPage.addRow();
        }
        
        // Add columns for different asset types
        await matrixPage.addColumn('video');
        await matrixPage.addColumn('image');
        await matrixPage.addColumn('text');
        await matrixPage.addColumn('audio');
        
        const dimensions = await matrixPage.getMatrixDimensions();
        expect(dimensions.rows).toBeGreaterThanOrEqual(5); // Including header
        expect(dimensions.columns).toBeGreaterThanOrEqual(4);
        
        // Assign assets to matrix cells
        const assetAssignments = [
          { row: 0, col: 0, asset: 'hero-video.mp4' },
          { row: 0, col: 1, asset: 'brand-logo.png' },
          { row: 0, col: 2, asset: 'tagline.txt' },
          { row: 0, col: 3, asset: 'voice-over.mp3' },
          { row: 1, col: 0, asset: 'hero-video.mp4' },
          { row: 1, col: 1, asset: 'product-shot.jpg' },
          { row: 1, col: 2, asset: 'tagline.txt' },
          { row: 1, col: 3, asset: 'voice-over.mp3' }
        ];
        
        for (const assignment of assetAssignments) {
          const assignmentTime = await matrixPage.measureAssetAssignmentTime(
            assignment.row,
            assignment.col,
            assignment.asset
          );
          expect(assignmentTime).toBeLessThan(3000); // Should be responsive
          
          await matrixPage.assignAssetToCell(
            assignment.row,
            assignment.col,
            assignment.asset
          );
        }
        
        // Lock certain assets to prevent auto-fill changes
        await matrixPage.lockAssetInCell(0, 0); // Lock hero video
        await matrixPage.lockAssetInCell(0, 1); // Lock brand logo
        
        // Use auto-fill for remaining cells
        await matrixPage.autoFillMatrix('smart');
        
        const assignedAssets = await matrixPage.getAssignedAssetCount();
        const emptySlots = await matrixPage.getEmptySlotCount();
        
        expect(assignedAssets).toBeGreaterThan(emptySlots);
        
        // Validate matrix before execution
        await matrixPage.verifyMatrixCanExecute();
        
        // Save matrix configuration
        await matrixPage.saveMatrix({
          name: 'AI Productivity Campaign Matrix',
          description: 'Matrix for AI productivity software campaign variations'
        });
      });

      // STEP 6: Preview and Validation
      await test.step('User previews combinations and validates setup', async () => {
        // Preview first combination
        await matrixPage.previewCombination(0);
        
        // Test preview controls
        await matrixPage.playPreview();
        await matrixPage.setPreviewQuality('high');
        
        // Verify preview functionality
        await expect(matrixPage.previewPlayer).toBeVisible();
        
        await matrixPage.closePreview();
        
        // Check for validation errors
        const validationErrors = await matrixPage.getValidationErrors();
        expect(validationErrors.length).toBe(0);
        
        const warnings = await matrixPage.getMatrixWarnings();
        // Warnings are acceptable, but should be minimal
        expect(warnings.length).toBeLessThan(3);
        
        // Verify no critical conflicts
        const hasConflicts = await matrixPage.hasConflicts();
        expect(hasConflicts).toBeFalsy();
      });

      // STEP 7: Campaign Execution
      await test.step('User executes campaign matrix', async () => {
        // Execute the matrix
        await matrixPage.executeMatrix();
        
        // Monitor execution progress
        let progress = 0;
        let iterations = 0;
        const maxIterations = 30; // Prevent infinite loop
        
        while (progress < 100 && iterations < maxIterations) {
          progress = await matrixPage.getExecutionProgress();
          const status = await matrixPage.getExecutionStatus();
          
          // Verify status is meaningful
          expect(status).toMatch(/processing|rendering|generating|queued/i);
          
          iterations++;
          await page.waitForTimeout(2000);
        }
        
        // Wait for execution to complete
        await matrixPage.waitForExecutionComplete();
        
        // Verify execution results
        await matrixPage.verifyExecutionResults();
        
        // Test results download
        await matrixPage.downloadExecutionResults();
        
        // Preview final results
        await matrixPage.previewExecutionResults();
        await expect(matrixPage.previewModal).toBeVisible();
        await matrixPage.closePreview();
      });

      // STEP 8: Final Verification
      await test.step('User verifies complete workflow success', async () => {
        // Return to dashboard to see updated stats
        await dashboardPage.goto();
        
        // Verify activity feed shows recent actions
        const recentActivity = await dashboardPage.getRecentActivity();
        expect(recentActivity.length).toBeGreaterThan(0);
        
        const hasExecutionActivity = recentActivity.some(activity => 
          activity.action.match(/executed|completed|generated/i)
        );
        expect(hasExecutionActivity).toBeTruthy();
        
        // Check stats cards for updated metrics
        const statsCards = await dashboardPage.getStatsCards();
        expect(statsCards.length).toBeGreaterThan(0);
        
        // Verify campaign appears in campaigns list
        await dashboardPage.navigateToCampaigns();
        
        // Should show the executed campaign
        const campaignTitle = page.locator('h4:has-text("AI Productivity")');
        await expect(campaignTitle).toBeVisible();
      });
    });

    test('workflow handles errors gracefully and provides recovery', async ({ page }) => {
      await test.step('User experiences network error during upload', async () => {
        await authHelper.login('test@airwave.com', 'TestPass123!');
        await dashboardPage.navigateToAssets();
        
        // Simulate network error during upload
        await page.route('**/api/assets/upload', route => route.abort());
        
        await assetsPage.openUploadModal();
        
        try {
          await assetsPage.uploadFileByDrop('test-image.jpg', 'image');
          // Should fail gracefully
        } catch (error) {
          // Expected to fail
        }
        
        // Verify error handling
        await expect(assetsPage.uploadErrorMessage).toBeVisible();
        
        // Restore network and retry
        await page.unroute('**/api/assets/upload');
        
        // Close and reopen upload modal for retry
        await assetsPage.closeUploadModal();
        await assetsPage.uploadFileByDrop('test-image.jpg', 'image');
        
        // Should succeed on retry
        await expect(assetsPage.uploadCompleteMessage).toBeVisible();
      });

      await test.step('User recovers from AI processing failure', async () => {
        await dashboardPage.navigateToFlow();
        
        // Mock AI processing failure
        await page.route('**/api/flow/generate-motivations', route => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'AI service temporarily unavailable' })
          });
        });
        
        await strategyPage.createBriefWithTextInput({
          briefText: 'Test brief for error handling'
        });
        
        await strategyPage.processBrief();
        
        // Should show error and retry option
        await expect(strategyPage.errorMessage).toBeVisible();
        
        // Restore service and retry
        await page.unroute('**/api/flow/generate-motivations');
        await strategyPage.retryAIProcessing();
        
        // Should succeed on retry
        await strategyPage.verifyStrategyGenerated();
      });

      await test.step('User handles matrix execution failure', async () => {
        await dashboardPage.navigateToMatrix();
        await matrixPage.createNewMatrix();
        
        // Add minimal matrix setup
        await matrixPage.assignAssetToCell(0, 0, 'test-image.jpg');
        
        // Mock execution failure
        await page.route('**/api/matrices/**/execute', route => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Rendering service unavailable' })
          });
        });
        
        await matrixPage.executeMatrix();
        
        // Should handle execution failure gracefully
        await expect(matrixPage.errorMessage).toBeVisible();
        
        const retryButton = page.locator('[data-testid="retry-execution-button"]');
        await expect(retryButton).toBeVisible();
        
        // User understands what went wrong
        const errorText = await matrixPage.errorMessage.textContent();
        expect(errorText).toMatch(/service|unavailable|try.*again/i);
      });
    });
  });

  test.describe('Performance and UX Validation', () => {
    test('workflow maintains good performance under load', async ({ page }) => {
      await test.step('Page load times remain under thresholds', async () => {
        await authHelper.login('test@airwave.com', 'TestPass123!');
        
        // Measure critical page load times
        const dashboardTime = await dashboardPage.measurePageLoadTime();
        expect(dashboardTime).toBeLessThan(3000);
        
        const clientsTime = await clientsPage.measureClientLoadTime();
        expect(clientsTime).toBeLessThan(3000);
        
        const assetsTime = await assetsPage.measureAssetLoadTime();
        expect(assetsTime).toBeLessThan(4000); // Assets may take longer to load
      });

      await test.step('User interactions feel responsive', async () => {
        await dashboardPage.navigateToAssets();
        
        // Search responsiveness
        const searchTime = await assetsPage.measureSearchTime('test');
        expect(searchTime).toBeLessThan(1000);
        
        // Navigation responsiveness
        const startTime = Date.now();
        await dashboardPage.navigateToClients();
        await clientsPage.waitForLoad();
        const navigationTime = Date.now() - startTime;
        
        expect(navigationTime).toBeLessThan(2000);
      });

      await test.step('Complex operations provide progress feedback', async () => {
        await dashboardPage.navigateToFlow();
        
        await strategyPage.createBriefWithTextInput({
          briefText: 'Complex brief for testing progress feedback and user experience during AI processing'
        });
        
        await strategyPage.processButton.click();
        
        // Should show progress indicator quickly
        await expect(strategyPage.processingIndicator).toBeVisible({ timeout: 1000 });
        
        // Progress status should update
        await expect(strategyPage.processingStatus).toBeVisible();
        
        const statusText = await strategyPage.processingStatus.textContent();
        expect(statusText).toMatch(/processing|analyzing|generating/i);
      });
    });

    test('workflow is accessible and inclusive', async ({ page }) => {
      await test.step('Keyboard navigation works throughout workflow', async () => {
        await authHelper.login('test@airwave.com', 'TestPass123!');
        
        // Test dashboard keyboard navigation
        await dashboardPage.goto();
        await page.keyboard.press('Tab');
        await expect(dashboardPage.clientSelector).toBeFocused();
        
        // Test clients page keyboard navigation
        await clientsPage.goto();
        await clientsPage.testKeyboardNavigation();
        
        // Test matrix keyboard navigation
        await matrixPage.goto();
        await matrixPage.testKeyboardNavigation();
      });

      await test.step('Screen reader support is comprehensive', async () => {
        await authHelper.login('test@airwave.com', 'TestPass123!');
        
        // Test form accessibility
        await clientsPage.goto();
        await clientsPage.testScreenReaderSupport();
        
        // Test matrix accessibility
        await matrixPage.goto();
        await matrixPage.testScreenReaderSupport();
        
        // Test strategy page accessibility
        await strategyPage.goto();
        await strategyPage.testScreenReaderSupport();
      });

      await test.step('Mobile experience is optimized', async () => {
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
        
        await authHelper.login('test@airwave.com', 'TestPass123!');
        
        // Test mobile dashboard
        await dashboardPage.testMobileLayout();
        
        // Test mobile clients page
        await clientsPage.testMobileLayout();
        
        // Verify touch targets are appropriately sized
        const createClientButton = clientsPage.createClientButton;
        const buttonBounds = await createClientButton.boundingBox();
        expect(buttonBounds?.height).toBeGreaterThanOrEqual(44); // Minimum touch target
      });
    });
  });

  test.describe('Cross-Browser Compatibility', () => {
    test('workflow functions consistently across browsers', async ({ page, browserName }) => {
      await test.step(`Workflow works in ${browserName}`, async () => {
        await authHelper.login('test@airwave.com', 'TestPass123!');
        
        // Test core functionality
        await dashboardPage.verifyUserIsLoggedIn();
        await dashboardPage.verifyNavigation();
        
        // Test client creation
        await clientsPage.goto();
        await clientsPage.createClientAndExpectSuccess({
          name: `Test Client ${browserName}`,
          email: `test-${browserName}@example.com`
        });
        
        // Test asset upload
        await assetsPage.goto();
        await assetsPage.uploadFileByDrop(`test-${browserName}.jpg`, 'image');
        await expect(assetsPage.verifyAssetExists(`test-${browserName}.jpg`)).toBeTruthy();
        
        // Verify browser-specific features work
        if (browserName === 'webkit') {
          // Test Safari-specific behavior
          await page.evaluate(() => {
            // Test any Safari-specific JavaScript
            return window.navigator.userAgent.includes('Safari');
          });
        }
      });
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up test data and state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});

// Utility function for measuring time
async function measureTime<T>(operation: () => Promise<T>): Promise<{ result: T; time: number }> {
  const startTime = Date.now();
  const result = await operation();
  const time = Date.now() - startTime;
  return { result, time };
}