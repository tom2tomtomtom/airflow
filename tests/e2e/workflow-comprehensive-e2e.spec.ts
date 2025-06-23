/**
 * Comprehensive End-to-End Workflow Tests
 * Tests complete user journeys from onboarding to campaign execution
 * Validates business logic, user experience, and system integration
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

test.describe('Comprehensive Workflow E2E Tests', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;
  let clientsPage: ClientsPage;
  let assetsPage: AssetsPage;
  let strategyPage: StrategyPage;
  let matrixPage: MatrixPage;
  let authHelper: AuthHelper;
  let apiMockHelper: APIMockHelper;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
    clientsPage = new ClientsPage(page);
    assetsPage = new AssetsPage(page);
    strategyPage = new StrategyPage(page);
    matrixPage = new MatrixPage(page);
    authHelper = new AuthHelper(page);
    apiMockHelper = new APIMockHelper(page);
    
    await apiMockHelper.setupDefaultMocks();
  });

  test.describe('New User Onboarding Journey', () => {
    test('complete new user onboarding flow', async ({ page }) => {
      await test.step('User signs up and completes profile', async () => {
        // Sign up process
        await authPage.gotoSignup();
        await authPage.signupAndExpectSuccess(
          'New AIRwave User',
          'newuser@airwave.com',
          'SecurePassword123!'
        );

        // Verify successful signup and automatic login
        await page.waitForURL('**/dashboard');
        await dashboardPage.verifyUserIsLoggedIn();

        // Check for onboarding flow initiation
        const onboardingModal = page.locator('[data-testid="onboarding-modal"]');
        const hasOnboarding = await onboardingModal.isVisible({ timeout: 3000 });

        if (hasOnboarding) {
          // Complete onboarding steps
          await dashboardPage.completeOnboardingFlow({
            role: 'Marketing Manager',
            company: 'Test Company',
            teamSize: '5-10',
            goals: ['Increase brand awareness', 'Generate leads'],
          });
        }

        // Verify dashboard is accessible and functional
        await expect(dashboardPage.welcomeMessage).toBeVisible();
        await dashboardPage.verifyNavigationElements();
      });

      await test.step('User creates first client', async () => {
        await dashboardPage.navigateToClients();
        
        // Should show empty state with guidance
        const emptyState = page.locator('[data-testid="clients-empty-state"]');
        const hasEmptyState = await emptyState.isVisible({ timeout: 3000 });

        if (hasEmptyState) {
          const emptyStateText = await emptyState.textContent();
          expect(emptyStateText).toMatch(/first.*client|get.*started|create.*client/i);
        }

        // Create first client with guided experience
        const clientData = {
          name: 'My First Client',
          industry: 'Technology',
          description: 'A technology startup focused on AI solutions',
          email: 'contact@firstclient.com',
          brandColor: '#007bff',
          secondaryColor: '#6c757d',
        };

        await clientsPage.createClientWithGuidance(clientData);
        await clientsPage.verifyClientCreated(clientData.name);

        // Should automatically select the new client
        const selectedClient = await dashboardPage.getSelectedClient();
        expect(selectedClient).toContain(clientData.name);
      });

      await test.step('User explores asset management', async () => {
        await dashboardPage.navigateToAssets();

        // Should show asset management introduction
        const assetIntro = page.locator('[data-testid="assets-intro"]');
        const hasIntro = await assetIntro.isVisible({ timeout: 3000 });

        if (hasIntro) {
          await assetsPage.dismissIntroduction();
        }

        // Upload sample assets with guidance
        const sampleAssets = [
          { name: 'company-logo.png', type: 'image' as const },
          { name: 'brand-video.mp4', type: 'video' as const },
          { name: 'voice-over.mp3', type: 'audio' as const },
        ];

        for (const asset of sampleAssets) {
          await assetsPage.uploadAssetWithTooltips(asset.name, asset.type);
          await assetsPage.verifyAssetUploadSuccess(asset.name);
        }

        // Verify asset organization features
        await assetsPage.testAssetTagging();
        await assetsPage.testAssetSearch();
      });

      await test.step('User creates first strategy', async () => {
        await dashboardPage.navigateToFlow();

        // Should show strategy creation guidance
        const strategyGuide = page.locator('[data-testid="strategy-guide"]');
        const hasGuide = await strategyGuide.isVisible({ timeout: 3000 });

        if (hasGuide) {
          await strategyPage.followGuidedTour();
        }

        // Create strategy with step-by-step guidance
        const briefData = {
          briefText: `
            Create an engaging marketing campaign for our AI-powered project management tool.
            Target busy professionals who struggle with team coordination and project tracking.
            Key benefits: 40% faster project completion, real-time collaboration, automated reporting.
            Tone: Professional yet approachable, emphasizing efficiency and teamwork.
            Call to action: Start 14-day free trial.
          `,
          targetAudience: 'Busy project managers and team leads',
          keyMessages: 'Streamline projects, enhance collaboration, save time',
          callToAction: 'Start 14-day free trial',
        };

        await strategyPage.createGuidedStrategy(briefData);
        await strategyPage.verifyStrategyCreation();

        // Test AI-powered features
        await strategyPage.testMotivationGeneration();
        await strategyPage.testCopyGeneration();
        await strategyPage.verifyCopyQuality();
      });
    });
  });

  test.describe('Advanced Campaign Creation Workflows', () => {
    test('multi-client campaign management', async ({ page }) => {
      await authHelper.login('test@airwave.com', 'TestPass123!');

      await test.step('Setup multiple clients', async () => {
        const clients = [
          { name: 'TechCorp Inc', industry: 'Technology', color: '#007bff' },
          { name: 'HealthPlus', industry: 'Healthcare', color: '#28a745' },
          { name: 'EduLearn', industry: 'Education', color: '#ffc107' },
        ];

        for (const client of clients) {
          await dashboardPage.navigateToClients();
          await clientsPage.createClient({
            ...client,
            email: `contact@${client.name.toLowerCase().replace(/\s+/g, '')}.com`,
            description: `${client.industry} company for testing multi-client workflows`,
          });
        }

        // Verify all clients are created
        await clientsPage.verifyClientCount(clients.length + 1); // +1 for any existing test client
      });

      await test.step('Create client-specific asset libraries', async () => {
        const clientAssets = [
          { client: 'TechCorp Inc', assets: ['tech-logo.png', 'tech-video.mp4'] },
          { client: 'HealthPlus', assets: ['health-logo.png', 'health-brochure.pdf'] },
          { client: 'EduLearn', assets: ['edu-logo.png', 'edu-presentation.pptx'] },
        ];

        for (const { client, assets } of clientAssets) {
          // Switch to client
          await dashboardPage.selectClient(client);
          await dashboardPage.navigateToAssets();

          // Upload client-specific assets
          for (const assetName of assets) {
            const assetType = assetName.endsWith('.mp4') ? 'video' :
                            assetName.endsWith('.pdf') ? 'document' :
                            assetName.endsWith('.pptx') ? 'document' : 'image';
            
            await assetsPage.uploadFileByDrop(assetName, assetType);
            await assetsPage.tagAsset(assetName, [client, 'brand', 'official']);
          }

          // Verify client-specific asset isolation
          await assetsPage.verifyAssetCount(assets.length);
        }
      });

      await test.step('Create parallel campaigns for different clients', async () => {
        const campaigns = [
          {
            client: 'TechCorp Inc',
            strategy: 'B2B software solution targeting enterprise clients',
            tone: 'professional',
            audience: 'IT decision makers',
          },
          {
            client: 'HealthPlus',
            strategy: 'Patient-centric healthcare services promotion',
            tone: 'caring',
            audience: 'patients and families',
          },
        ];

        for (const campaign of campaigns) {
          await dashboardPage.selectClient(campaign.client);
          await dashboardPage.navigateToFlow();

          await strategyPage.createBriefWithTextInput({
            briefText: campaign.strategy,
            targetAudience: campaign.audience,
            tonality: campaign.tone,
          });

          await strategyPage.processBrief();
          await strategyPage.verifyStrategyGenerated();

          // Save campaign with client-specific naming
          await strategyPage.saveStrategy({
            name: `${campaign.client} Campaign 2024`,
            description: `Campaign strategy for ${campaign.client}`,
            tags: [campaign.client, 'active', '2024'],
          });
        }
      });

      await test.step('Verify cross-client data isolation', async () => {
        // Switch between clients and verify data isolation
        await dashboardPage.selectClient('TechCorp Inc');
        await dashboardPage.navigateToAssets();
        
        const techAssets = await assetsPage.getAssetNames();
        expect(techAssets.every(name => name.includes('tech'))).toBeTruthy();

        await dashboardPage.selectClient('HealthPlus');
        await dashboardPage.navigateToAssets();
        
        const healthAssets = await assetsPage.getAssetNames();
        expect(healthAssets.every(name => name.includes('health'))).toBeTruthy();
        
        // Verify no cross-contamination
        expect(healthAssets.some(name => name.includes('tech'))).toBeFalsy();
      });
    });

    test('complex matrix creation and execution workflow', async ({ page }) => {
      await authHelper.login('test@airwave.com', 'TestPass123!');

      await test.step('Setup campaign foundation', async () => {
        // Create client and upload diverse assets
        await dashboardPage.navigateToClients();
        await clientsPage.createClient({
          name: 'Matrix Test Client',
          industry: 'Marketing',
          description: 'Client for testing complex matrix workflows',
          email: 'matrix@test.com',
        });

        await dashboardPage.navigateToAssets();
        
        // Upload varied asset types
        const matrixAssets = [
          { name: 'hero-video-1.mp4', type: 'video' as const, tags: ['hero', 'primary'] },
          { name: 'hero-video-2.mp4', type: 'video' as const, tags: ['hero', 'secondary'] },
          { name: 'background-music-1.mp3', type: 'audio' as const, tags: ['background', 'upbeat'] },
          { name: 'background-music-2.mp3', type: 'audio' as const, tags: ['background', 'calm'] },
          { name: 'logo-main.png', type: 'image' as const, tags: ['logo', 'primary'] },
          { name: 'logo-alt.png', type: 'image' as const, tags: ['logo', 'secondary'] },
          { name: 'copy-version-1.txt', type: 'document' as const, tags: ['copy', 'urgent'] },
          { name: 'copy-version-2.txt', type: 'document' as const, tags: ['copy', 'casual'] },
        ];

        for (const asset of matrixAssets) {
          await assetsPage.uploadFileByDrop(asset.name, asset.type);
          await assetsPage.tagAsset(asset.name, asset.tags);
        }
      });

      await test.step('Create comprehensive strategy', async () => {
        await dashboardPage.navigateToFlow();

        const comprehensiveBrief = {
          briefText: `
            Create a multi-variant social media campaign for our new productivity app.
            We need different versions for various platforms (Instagram, LinkedIn, TikTok).
            Target audiences: Young professionals (Instagram/TikTok) and business executives (LinkedIn).
            Test different messaging approaches: urgency-driven vs. benefit-focused.
            Include multiple video formats: square (1:1), vertical (9:16), and horizontal (16:9).
            Incorporate A/B testing for different call-to-actions and visual styles.
          `,
          targetAudience: 'Young professionals and business executives',
          channels: ['Instagram', 'LinkedIn', 'TikTok'],
          goals: ['Brand awareness', 'App downloads', 'User engagement'],
        };

        await strategyPage.createComprehensiveBrief(comprehensiveBrief);
        await strategyPage.generateMultipleMotivations();
        await strategyPage.selectVariedMotivations(4); // Select diverse motivations
        await strategyPage.generateVariedCopy({
          variants: 3,
          lengths: ['short', 'medium', 'long'],
          tones: ['urgent', 'casual', 'professional'],
        });
      });

      await test.step('Build complex matrix configuration', async () => {
        await dashboardPage.navigateToMatrix();
        await matrixPage.createNewMatrix('Multi-Platform Campaign Matrix');

        // Create dimensional matrix
        const dimensions = {
          platforms: ['Instagram', 'LinkedIn', 'TikTok'],
          audiences: ['Young Professionals', 'Executives'],
          tones: ['Urgent', 'Casual', 'Professional'],
          formats: ['Square', 'Vertical', 'Horizontal'],
        };

        // Build matrix rows for each combination
        for (const platform of dimensions.platforms) {
          for (const audience of dimensions.audiences) {
            for (const tone of dimensions.tones) {
              await matrixPage.addRow();
              await matrixPage.configureRow({
                platform,
                audience,
                tone,
                name: `${platform}_${audience}_${tone}`,
              });
            }
          }
        }

        // Configure columns for different asset types
        await matrixPage.addColumn('video');
        await matrixPage.addColumn('audio');
        await matrixPage.addColumn('image');
        await matrixPage.addColumn('copy');

        // Verify matrix dimensions
        const matrixSize = await matrixPage.getMatrixDimensions();
        expect(matrixSize.rows).toBe(dimensions.platforms.length * dimensions.audiences.length * dimensions.tones.length);
        expect(matrixSize.columns).toBe(4);
      });

      await test.step('Implement intelligent asset assignment', async () => {
        // Use smart assignment based on tags and context
        await matrixPage.enableSmartAssignment();
        
        // Configure assignment rules
        await matrixPage.setAssignmentRules({
          video: {
            'Instagram': 'hero-video-1.mp4',
            'LinkedIn': 'hero-video-2.mp4',
            'TikTok': 'hero-video-1.mp4',
          },
          audio: {
            'Urgent': 'background-music-1.mp3',
            'Casual': 'background-music-2.mp3',
            'Professional': 'background-music-1.mp3',
          },
          image: {
            'Young Professionals': 'logo-alt.png',
            'Executives': 'logo-main.png',
          },
          copy: {
            'Urgent': 'copy-version-1.txt',
            'Casual': 'copy-version-2.txt',
            'Professional': 'copy-version-1.txt',
          },
        });

        // Execute smart assignment
        await matrixPage.executeSmartAssignment();
        
        // Verify assignments are logical
        await matrixPage.verifyAssignmentLogic();
        
        // Fine-tune specific cells
        await matrixPage.manuallyAdjustCells([
          { row: 0, col: 0, asset: 'hero-video-2.mp4' }, // Override for special case
          { row: 1, col: 2, asset: 'logo-alt.png' },      // A/B test variation
        ]);
      });

      await test.step('Validate and execute matrix', async () => {
        // Run comprehensive validation
        await matrixPage.runMatrixValidation();
        
        const validationResults = await matrixPage.getValidationResults();
        expect(validationResults.errors).toHaveLength(0);
        expect(validationResults.warnings).toBeLessThan(5); // Some warnings acceptable
        
        // Preview sample combinations
        const previewCombinations = [0, 5, 10, 15]; // Sample different combinations
        for (const combination of previewCombinations) {
          await matrixPage.previewCombination(combination);
          await matrixPage.verifyPreviewQuality();
          await matrixPage.closePreview();
        }

        // Execute matrix with monitoring
        await matrixPage.executeMatrixWithMonitoring();
        
        // Monitor progress and handle any issues
        let progress = 0;
        let iterations = 0;
        const maxIterations = 60; // 2 minutes max

        while (progress < 100 && iterations < maxIterations) {
          progress = await matrixPage.getExecutionProgress();
          const status = await matrixPage.getExecutionStatus();
          
          // Log progress for debugging
          console.log(`Matrix execution progress: ${progress}% - Status: ${status}`);
          
          // Handle any errors that occur during execution
          const hasErrors = await matrixPage.hasExecutionErrors();
          if (hasErrors) {
            const errors = await matrixPage.getExecutionErrors();
            console.warn('Execution errors detected:', errors);
            
            // Attempt to resolve common issues
            await matrixPage.resolveExecutionErrors();
          }
          
          iterations++;
          await page.waitForTimeout(2000);
        }

        // Verify successful completion
        expect(progress).toBe(100);
        await matrixPage.verifyExecutionResults();
        
        // Download and verify results
        await matrixPage.downloadExecutionResults();
        await matrixPage.verifyResultsQuality();
      });
    });
  });

  test.describe('Error Handling and Recovery Workflows', () => {
    test('graceful handling of system errors during workflow', async ({ page }) => {
      await authHelper.login('test@airwave.com', 'TestPass123!');

      await test.step('Simulate API failures during critical operations', async () => {
        // Start normal workflow
        await dashboardPage.navigateToFlow();
        await strategyPage.createBriefWithTextInput({
          briefText: 'Test brief for error handling scenarios',
        });

        // Simulate API failure during AI processing
        await page.route('**/api/flow/generate-motivations', route => {
          route.fulfill({
            status: 503,
            body: JSON.stringify({ error: 'Service temporarily unavailable' }),
          });
        });

        await strategyPage.processBrief();

        // Should show user-friendly error with retry option
        await expect(strategyPage.errorMessage).toBeVisible({ timeout: 10000 });
        
        const errorText = await strategyPage.errorMessage.textContent();
        expect(errorText).toMatch(/temporarily.*unavailable|service.*issue|try.*again/i);
        
        // Verify retry mechanism
        const retryButton = page.locator('[data-testid="retry-button"]');
        await expect(retryButton).toBeVisible();

        // Restore service and retry
        await page.unroute('**/api/flow/generate-motivations');
        await retryButton.click();

        // Should complete successfully on retry
        await strategyPage.verifyStrategyGenerated();
      });

      await test.step('Handle network connectivity issues', async () => {
        await dashboardPage.navigateToAssets();

        // Simulate network failure during file upload
        await page.setOffline(true);

        await assetsPage.openUploadModal();
        await assetsPage.uploadFileByDrop('test-image.jpg', 'image');

        // Should detect offline state and queue for retry
        const offlineIndicator = page.locator('[data-testid="offline-indicator"]');
        const uploadQueue = page.locator('[data-testid="upload-queue"]');

        const hasOfflineHandling = await offlineIndicator.isVisible({ timeout: 5000 }) ||
                                  await uploadQueue.isVisible({ timeout: 5000 });

        if (hasOfflineHandling) {
          // Restore connectivity
          await page.setOffline(false);

          // Should automatically retry queued operations
          const retrySuccess = page.locator('[data-testid="upload-success"]');
          await expect(retrySuccess).toBeVisible({ timeout: 10000 });
        } else {
          // Manual error handling
          await page.setOffline(false);
          await assetsPage.retryFailedUploads();
        }
      });

      await test.step('Recover from data corruption scenarios', async () => {
        await dashboardPage.navigateToMatrix();
        await matrixPage.createNewMatrix('Error Recovery Test');

        // Simulate data corruption during matrix save
        await page.route('**/api/matrices/*', route => {
          if (route.request().method() === 'PUT') {
            route.fulfill({
              status: 422,
              body: JSON.stringify({ error: 'Data validation failed' }),
            });
          } else {
            route.continue();
          }
        });

        await matrixPage.addRow();
        await matrixPage.saveMatrix({ name: 'Test Matrix' });

        // Should detect save failure and offer recovery options
        const errorDialog = page.locator('[data-testid="save-error-dialog"]');
        await expect(errorDialog).toBeVisible({ timeout: 5000 });

        // Should offer options: retry, save as draft, or restore previous
        const recoverOptions = page.locator('[data-testid="recovery-options"]');
        await expect(recoverOptions).toBeVisible();

        // Test save as draft option
        const saveDraftButton = page.locator('[data-testid="save-draft-button"]');
        if (await saveDraftButton.isVisible()) {
          await saveDraftButton.click();
          
          // Should save as draft successfully
          const draftSaved = page.locator('[data-testid="draft-saved-message"]');
          await expect(draftSaved).toBeVisible({ timeout: 5000 });
        }

        // Restore normal operation
        await page.unroute('**/api/matrices/*');
      });
    });

    test('data recovery and session persistence', async ({ page }) => {
      await authHelper.login('test@airwave.com', 'TestPass123!');

      await test.step('Test autosave functionality', async () => {
        await dashboardPage.navigateToFlow();
        
        // Start creating a strategy
        const briefData = {
          briefText: 'Comprehensive brief for testing autosave functionality...',
          targetAudience: 'Test audience',
          keyMessages: 'Key messages for testing',
        };

        await strategyPage.fillBriefForm(briefData);

        // Wait for autosave to trigger
        await page.waitForTimeout(3000);

        // Verify autosave indicator
        const autosaveIndicator = page.locator('[data-testid="autosave-indicator"]');
        const hasAutosave = await autosaveIndicator.isVisible({ timeout: 2000 });

        if (hasAutosave) {
          const saveStatus = await autosaveIndicator.textContent();
          expect(saveStatus).toMatch(/saved|draft|auto.*save/i);
        }

        // Refresh page to test persistence
        await page.reload();

        // Should restore form data
        const restoredText = await strategyPage.getBriefText();
        expect(restoredText).toContain(briefData.briefText);
      });

      await test.step('Test session restoration after browser crash', async () => {
        // Simulate browser crash by closing and reopening
        const currentUrl = page.url();
        
        // Save session state
        const sessionData = await page.evaluate(() => ({
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage },
        }));

        // Navigate away and back (simulating crash/restore)
        await page.goto('about:blank');
        await page.goto(currentUrl);

        // Should restore session and show recovery message
        const sessionRecovery = page.locator('[data-testid="session-recovery"]');
        const hasRecovery = await sessionRecovery.isVisible({ timeout: 5000 });

        if (hasRecovery) {
          const recoveryButton = page.locator('[data-testid="restore-session-button"]');
          await recoveryButton.click();
          
          // Should restore previous state
          await dashboardPage.verifyUserIsLoggedIn();
        }
      });
    });
  });

  test.describe('Performance and Scalability Workflows', () => {
    test('handles large-scale operations efficiently', async ({ page }) => {
      await authHelper.login('test@airwave.com', 'TestPass123!');

      await test.step('Large asset library management', async () => {
        await dashboardPage.navigateToAssets();

        // Upload multiple assets rapidly
        const assetCount = 20;
        const uploadPromises = [];

        for (let i = 0; i < assetCount; i++) {
          const assetName = `bulk-asset-${i}.jpg`;
          uploadPromises.push(assetsPage.uploadFileByDrop(assetName, 'image'));
          
          // Stagger uploads to avoid overwhelming the system
          if (i % 5 === 0) {
            await Promise.all(uploadPromises.splice(0, 5));
            await page.waitForTimeout(1000);
          }
        }

        // Wait for remaining uploads
        await Promise.all(uploadPromises);

        // Verify all assets uploaded successfully
        const uploadedAssets = await assetsPage.getAssetCount();
        expect(uploadedAssets).toBeGreaterThanOrEqual(assetCount);

        // Test search performance with large dataset
        const searchStartTime = Date.now();
        await assetsPage.searchAssets('bulk');
        const searchEndTime = Date.now();
        
        expect(searchEndTime - searchStartTime).toBeLessThan(2000); // Should be responsive

        // Test pagination performance
        await assetsPage.testPaginationPerformance();
      });

      await test.step('Large matrix execution performance', async () => {
        await dashboardPage.navigateToMatrix();
        await matrixPage.createNewMatrix('Performance Test Matrix');

        // Create large matrix (100+ combinations)
        const rowCount = 25;
        const columnCount = 4;

        for (let i = 0; i < rowCount; i++) {
          await matrixPage.addRow();
        }

        for (let i = 0; i < columnCount; i++) {
          await matrixPage.addColumn(['video', 'image', 'audio', 'text'][i]);
        }

        // Assign assets efficiently
        const assignmentStartTime = Date.now();
        await matrixPage.bulkAssignAssets();
        const assignmentEndTime = Date.now();

        expect(assignmentEndTime - assignmentStartTime).toBeLessThan(10000); // Under 10 seconds

        // Test matrix validation performance
        const validationStartTime = Date.now();
        await matrixPage.runMatrixValidation();
        const validationEndTime = Date.now();

        expect(validationEndTime - validationStartTime).toBeLessThan(5000); // Under 5 seconds

        // Monitor memory usage during large operations
        const memoryUsage = await page.evaluate(() => (performance as any).memory?.usedJSHeapSize);
        if (memoryUsage) {
          console.log(`Memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)} MB`);
          expect(memoryUsage).toBeLessThan(100 * 1024 * 1024); // Under 100MB
        }
      });
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any test state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });
});