import { test, expect } from './fixtures/test-fixtures';

test.describe('Video Rendering Workflow', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to campaigns with an existing matrix
    await authenticatedPage.goto('/campaigns/test-campaign/matrix');
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test.describe('Render Initiation', () => {
    test('should initiate video render for campaign matrix', async ({ authenticatedPage, wsHelper }) => {
      // Ensure matrix has required assets
      await expect(authenticatedPage.locator('[data-testid="assigned-asset"]')).toHaveCount.greaterThan(0);
      
      // Start render process
      await authenticatedPage.click('[data-testid="start-render-button"]');
      
      // Should show render configuration options
      await expect(authenticatedPage.locator('[data-testid="render-config"]')).toBeVisible();
      
      // Select render settings
      await authenticatedPage.selectOption('[data-testid="quality-select"]', 'HD');
      await authenticatedPage.selectOption('[data-testid="format-select"]', 'MP4');
      
      // Confirm render
      await authenticatedPage.click('[data-testid="confirm-render"]');
      
      // Should show render started confirmation
      await expect(authenticatedPage.locator('[data-testid="render-started"]')).toBeVisible();
      
      // Should navigate to render status page
      await expect(authenticatedPage).toHaveURL(/.*\/renders\/.*/);
      
      await authenticatedPage.screenshot({ path: 'test-results/render-initiated.png' });
    });

    test('should validate matrix before rendering', async ({ authenticatedPage }) => {
      // Try to render with incomplete matrix
      await authenticatedPage.click('[data-testid="start-render-button"]');
      
      // Should show validation errors if matrix is incomplete
      const hasErrors = await authenticatedPage.locator('[data-testid="validation-error"]').isVisible();
      
      if (hasErrors) {
        // Should prevent render until fixed
        await expect(authenticatedPage.locator('[data-testid="confirm-render"]')).toBeDisabled();
        await authenticatedPage.screenshot({ path: 'test-results/render-validation-error.png' });
      } else {
        // Matrix is valid, render should proceed
        await expect(authenticatedPage.locator('[data-testid="confirm-render"]')).toBeEnabled();
        await authenticatedPage.screenshot({ path: 'test-results/render-validation-success.png' });
      }
    });
  });

  test.describe('Real-time Progress Updates', () => {
    test('should show WebSocket progress updates', async ({ authenticatedPage, wsHelper }) => {
      // Setup WebSocket listeners
      await wsHelper.setupWebSocketListeners();
      
      // Start a render
      await authenticatedPage.click('[data-testid="start-render-button"]');
      await authenticatedPage.click('[data-testid="confirm-render"]');
      
      // Wait for WebSocket connection
      await wsHelper.waitForConnection();
      
      // Should show initial progress
      await expect(authenticatedPage.locator('[data-testid="render-progress"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="progress-bar"]')).toBeVisible();
      
      // Wait for progress updates
      await wsHelper.waitForMessage('render_progress');
      
      // Progress should update
      await expect(authenticatedPage.locator('[data-testid="progress-percentage"]')).not.toHaveText('0%');
      
      await authenticatedPage.screenshot({ path: 'test-results/render-progress.png' });
    });

    test('should handle progress milestones', async ({ authenticatedPage, wsHelper }) => {
      await wsHelper.setupWebSocketListeners();
      
      // Start render and wait for milestones
      await authenticatedPage.click('[data-testid="start-render-button"]');
      await authenticatedPage.click('[data-testid="confirm-render"]');
      
      // Check for different progress stages
      const milestones = [
        { progress: 25, stage: 'Processing Assets' },
        { progress: 50, stage: 'Rendering Video' },
        { progress: 75, stage: 'Finalizing' },
        { progress: 100, stage: 'Complete' }
      ];
      
      for (const milestone of milestones) {
        await wsHelper.waitForRenderProgress(milestone.progress);
        
        // Should show current stage
        await expect(authenticatedPage.locator('[data-testid="current-stage"]')).toContainText(milestone.stage);
        
        await authenticatedPage.screenshot({ path: `test-results/render-milestone-${milestone.progress}.png` });
      }
    });
  });

  test.describe('Render Status Tracking', () => {
    test('should display render queue and status', async ({ authenticatedPage }) => {
      // Navigate to renders page
      await authenticatedPage.goto('/renders');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Should show render list
      await expect(authenticatedPage.locator('[data-testid="render-list"]')).toBeVisible();
      
      // Should show render status for each item
      await expect(authenticatedPage.locator('[data-testid="render-status"]')).toHaveCount.greaterThan(0);
      
      // Should show different status types
      const statusTypes = ['pending', 'processing', 'completed', 'failed'];
      for (const status of statusTypes) {
        const statusElements = authenticatedPage.locator(`[data-testid="render-status"][data-status="${status}"]`);
        if (await statusElements.count() > 0) {
          await expect(statusElements.first()).toBeVisible();
        }
      }
      
      await authenticatedPage.screenshot({ path: 'test-results/render-status-list.png' });
    });

    test('should show detailed render information', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/renders');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Click on a render item
      await authenticatedPage.click('[data-testid="render-item"]');
      
      // Should show render details
      await expect(authenticatedPage.locator('[data-testid="render-details"]')).toBeVisible();
      
      // Should show render metadata
      await expect(authenticatedPage.locator('[data-testid="render-duration"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="render-resolution"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="render-format"]')).toBeVisible();
      
      // Should show asset list used in render
      await expect(authenticatedPage.locator('[data-testid="render-assets"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/render-details.png' });
    });
  });

  test.describe('Render Completion', () => {
    test('should handle successful render completion', async ({ authenticatedPage, wsHelper }) => {
      await wsHelper.setupWebSocketListeners();
      
      // Start render
      await authenticatedPage.click('[data-testid="start-render-button"]');
      await authenticatedPage.click('[data-testid="confirm-render"]');
      
      // Wait for completion
      await wsHelper.waitForRenderComplete();
      
      // Should show completion notification
      await expect(authenticatedPage.locator('[data-testid="render-complete-notification"]')).toBeVisible();
      
      // Should show download button
      await expect(authenticatedPage.locator('[data-testid="download-render"]')).toBeVisible();
      
      // Should show preview option
      await expect(authenticatedPage.locator('[data-testid="preview-render"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/render-complete.png' });
    });

    test('should allow render download', async ({ authenticatedPage }) => {
      // Navigate to completed render
      await authenticatedPage.goto('/renders/completed-render-id');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Set up download handling
      const downloadPromise = authenticatedPage.waitForEvent('download');
      
      // Click download button
      await authenticatedPage.click('[data-testid="download-render"]');
      
      // Should start download
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/.*\.(mp4|mov|avi)$/);
      
      await authenticatedPage.screenshot({ path: 'test-results/render-download.png' });
    });

    test('should handle render preview', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/renders/completed-render-id');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Click preview button
      await authenticatedPage.click('[data-testid="preview-render"]');
      
      // Should show video player
      await expect(authenticatedPage.locator('[data-testid="video-player"]')).toBeVisible();
      
      // Should have video controls
      await expect(authenticatedPage.locator('[data-testid="play-button"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="volume-control"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="fullscreen-button"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/render-preview.png' });
    });
  });

  test.describe('Error Handling', () => {
    test('should handle render failures gracefully', async ({ authenticatedPage, wsHelper }) => {
      await wsHelper.setupWebSocketListeners();
      
      // This would simulate a render failure scenario
      // In a real test, you might trigger this with invalid assets or settings
      
      // Start render
      await authenticatedPage.click('[data-testid="start-render-button"]');
      await authenticatedPage.click('[data-testid="confirm-render"]');
      
      // Simulate or wait for error
      await wsHelper.waitForMessage('render_error');
      
      // Should show error notification
      await expect(authenticatedPage.locator('[data-testid="render-error-notification"]')).toBeVisible();
      
      // Should show error details
      await expect(authenticatedPage.locator('[data-testid="error-message"]')).toBeVisible();
      
      // Should offer retry option
      await expect(authenticatedPage.locator('[data-testid="retry-render-button"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/render-error.png' });
    });

    test('should support render retry mechanism', async ({ authenticatedPage }) => {
      // Navigate to failed render
      await authenticatedPage.goto('/renders/failed-render-id');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Should show retry button
      await expect(authenticatedPage.locator('[data-testid="retry-render-button"]')).toBeVisible();
      
      // Click retry
      await authenticatedPage.click('[data-testid="retry-render-button"]');
      
      // Should restart render process
      await expect(authenticatedPage.locator('[data-testid="render-progress"]')).toBeVisible();
      
      // Status should change from failed to processing
      await expect(authenticatedPage.locator('[data-testid="render-status"]')).toHaveAttribute('data-status', 'processing');
      
      await authenticatedPage.screenshot({ path: 'test-results/render-retry.png' });
    });
  });

  test.describe('Batch Rendering', () => {
    test('should support multiple render requests', async ({ authenticatedPage }) => {
      // Navigate to campaigns page
      await authenticatedPage.goto('/campaigns');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Select multiple campaigns for batch render
      await authenticatedPage.check('[data-testid="campaign-checkbox"]');
      
      // Should show batch render option
      await expect(authenticatedPage.locator('[data-testid="batch-render-button"]')).toBeVisible();
      
      // Click batch render
      await authenticatedPage.click('[data-testid="batch-render-button"]');
      
      // Should show batch render configuration
      await expect(authenticatedPage.locator('[data-testid="batch-render-config"]')).toBeVisible();
      
      // Configure batch settings
      await authenticatedPage.selectOption('[data-testid="batch-quality"]', 'HD');
      await authenticatedPage.click('[data-testid="start-batch-render"]');
      
      // Should show batch progress
      await expect(authenticatedPage.locator('[data-testid="batch-progress"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/batch-render.png' });
    });
  });
});