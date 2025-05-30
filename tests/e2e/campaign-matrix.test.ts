import { test, expect } from './fixtures/test-fixtures';

test.describe('Campaign Matrix System', () => {
  test.beforeEach(async ({ authenticatedPage, fileHelper }) => {
    // Navigate to campaigns page
    await authenticatedPage.goto('/campaigns');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Upload some test assets if needed
    const testFiles = await fileHelper.createTestAssets();
    // We'll assume assets are already uploaded for matrix tests
  });

  test.describe('Matrix Creation', () => {
    test('should create a new campaign matrix', async ({ authenticatedPage }) => {
      // Click create new campaign button
      await authenticatedPage.click('[data-testid="create-campaign-button"]');
      
      // Fill in campaign details
      await authenticatedPage.fill('[data-testid="campaign-name"]', 'Test Campaign Matrix');
      await authenticatedPage.fill('[data-testid="campaign-description"]', 'E2E test campaign for matrix functionality');
      
      // Select campaign format/template
      await authenticatedPage.click('[data-testid="format-selector"]');
      await authenticatedPage.click('[data-testid="format-option-video"]');
      
      // Create the campaign
      await authenticatedPage.click('[data-testid="create-campaign-confirm"]');
      
      // Should redirect to matrix editor
      await expect(authenticatedPage).toHaveURL(/.*\/campaigns\/.*\/matrix/);
      
      // Should show empty matrix grid
      await expect(authenticatedPage.locator('[data-testid="matrix-grid"]')).toBeVisible();
      
      // Should show asset slots
      await expect(authenticatedPage.locator('[data-testid="asset-slot"]')).toHaveCount.greaterThan(0);
      
      await authenticatedPage.screenshot({ path: 'test-results/new-campaign-matrix.png' });
    });

    test('should display matrix template with proper slots', async ({ authenticatedPage }) => {
      // Assuming we're on a matrix page
      await authenticatedPage.goto('/campaigns/new');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Should show different asset slot types
      await expect(authenticatedPage.locator('[data-testid="video-slot"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="image-slot"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="text-slot"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="audio-slot"]')).toBeVisible();
      
      // Each slot should show its type and requirements
      await expect(authenticatedPage.locator('[data-testid="slot-type-label"]')).toHaveCount.greaterThan(0);
      
      await authenticatedPage.screenshot({ path: 'test-results/matrix-template.png' });
    });
  });

  test.describe('Asset Assignment', () => {
    test('should assign assets via drag and drop', async ({ authenticatedPage }) => {
      // Navigate to existing campaign matrix
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Open asset panel
      await authenticatedPage.click('[data-testid="asset-panel-toggle"]');
      
      // Should show available assets
      await expect(authenticatedPage.locator('[data-testid="available-asset"]')).toHaveCount.greaterThan(0);
      
      // Drag asset from panel to slot
      const sourceAsset = authenticatedPage.locator('[data-testid="available-asset"]').first();
      const targetSlot = authenticatedPage.locator('[data-testid="empty-asset-slot"]').first();
      
      await sourceAsset.dragTo(targetSlot);
      
      // Verify asset was assigned
      await expect(targetSlot.locator('[data-testid="assigned-asset"]')).toBeVisible();
      
      // Should show asset preview in slot
      await expect(targetSlot.locator('[data-testid="asset-preview"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-drag-drop.png' });
    });

    test('should assign assets via click selection', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Click on empty asset slot
      await authenticatedPage.click('[data-testid="empty-asset-slot"]');
      
      // Should open asset selector modal
      await expect(authenticatedPage.locator('[data-testid="asset-selector-modal"]')).toBeVisible();
      
      // Filter assets by type if needed
      await authenticatedPage.click('[data-testid="filter-images"]');
      
      // Select an asset
      await authenticatedPage.click('[data-testid="selectable-asset"]');
      
      // Confirm selection
      await authenticatedPage.click('[data-testid="confirm-asset-selection"]');
      
      // Modal should close and asset should be assigned
      await expect(authenticatedPage.locator('[data-testid="asset-selector-modal"]')).not.toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="assigned-asset"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-click-selection.png' });
    });

    test('should replace assigned assets', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Assuming we have an assigned asset
      const assignedSlot = authenticatedPage.locator('[data-testid="asset-slot"]').first();
      
      // Click to replace
      await assignedSlot.click();
      
      // Should open replacement selector
      await expect(authenticatedPage.locator('[data-testid="asset-selector-modal"]')).toBeVisible();
      
      // Select different asset
      await authenticatedPage.click('[data-testid="selectable-asset"]');
      await authenticatedPage.click('[data-testid="confirm-asset-selection"]');
      
      // Asset should be replaced
      await expect(assignedSlot.locator('[data-testid="assigned-asset"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-replacement.png' });
    });

    test('should remove assigned assets', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Hover over assigned asset to show controls
      const assignedSlot = authenticatedPage.locator('[data-testid="asset-slot"]').first();
      await assignedSlot.hover();
      
      // Click remove button
      await assignedSlot.locator('[data-testid="remove-asset-button"]').click();
      
      // Asset should be removed
      await expect(assignedSlot.locator('[data-testid="assigned-asset"]')).not.toBeVisible();
      await expect(assignedSlot.locator('[data-testid="empty-slot-placeholder"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-removal.png' });
    });
  });

  test.describe('Row Operations', () => {
    test('should add new matrix rows', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Count initial rows
      const initialRowCount = await authenticatedPage.locator('[data-testid="matrix-row"]').count();
      
      // Click add row button
      await authenticatedPage.click('[data-testid="add-row-button"]');
      
      // Should have one more row
      await expect(authenticatedPage.locator('[data-testid="matrix-row"]')).toHaveCount(initialRowCount + 1);
      
      // New row should have empty slots
      const newRow = authenticatedPage.locator('[data-testid="matrix-row"]').last();
      await expect(newRow.locator('[data-testid="empty-asset-slot"]')).toHaveCount.greaterThan(0);
      
      await authenticatedPage.screenshot({ path: 'test-results/add-matrix-row.png' });
    });

    test('should duplicate existing rows', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Assign some assets to first row for duplication test
      // (assuming assets are already assigned)
      
      const initialRowCount = await authenticatedPage.locator('[data-testid="matrix-row"]').count();
      
      // Hover over first row to show controls
      const firstRow = authenticatedPage.locator('[data-testid="matrix-row"]').first();
      await firstRow.hover();
      
      // Click duplicate button
      await firstRow.locator('[data-testid="duplicate-row-button"]').click();
      
      // Should have one more row
      await expect(authenticatedPage.locator('[data-testid="matrix-row"]')).toHaveCount(initialRowCount + 1);
      
      // Duplicated row should have same assets
      const duplicatedRow = authenticatedPage.locator('[data-testid="matrix-row"]').nth(1);
      await expect(duplicatedRow.locator('[data-testid="assigned-asset"]')).toHaveCount.greaterThan(0);
      
      await authenticatedPage.screenshot({ path: 'test-results/duplicate-matrix-row.png' });
    });

    test('should lock and unlock rows', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      const firstRow = authenticatedPage.locator('[data-testid="matrix-row"]').first();
      
      // Lock the row
      await firstRow.locator('[data-testid="lock-row-button"]').click();
      
      // Row should show as locked
      await expect(firstRow).toHaveClass(/.*locked.*/);
      await expect(firstRow.locator('[data-testid="lock-icon"]')).toBeVisible();
      
      // Asset slots should not be editable when locked
      await expect(firstRow.locator('[data-testid="asset-slot"]')).toHaveClass(/.*non-editable.*/);
      
      // Unlock the row
      await firstRow.locator('[data-testid="unlock-row-button"]').click();
      
      // Row should no longer be locked
      await expect(firstRow).not.toHaveClass(/.*locked.*/);
      await expect(firstRow.locator('[data-testid="asset-slot"]')).not.toHaveClass(/.*non-editable.*/);
      
      await authenticatedPage.screenshot({ path: 'test-results/row-lock-unlock.png' });
    });

    test('should delete matrix rows', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      const initialRowCount = await authenticatedPage.locator('[data-testid="matrix-row"]').count();
      
      // Skip if only one row (can't delete last row)
      if (initialRowCount <= 1) {
        test.skip('Cannot delete when only one row exists');
        return;
      }
      
      const firstRow = authenticatedPage.locator('[data-testid="matrix-row"]').first();
      await firstRow.hover();
      
      // Click delete button
      await firstRow.locator('[data-testid="delete-row-button"]').click();
      
      // Confirm deletion
      await authenticatedPage.click('[data-testid="confirm-delete-row"]');
      
      // Should have one fewer row
      await expect(authenticatedPage.locator('[data-testid="matrix-row"]')).toHaveCount(initialRowCount - 1);
      
      await authenticatedPage.screenshot({ path: 'test-results/delete-matrix-row.png' });
    });
  });

  test.describe('Automated Combination Generation', () => {
    test('should generate asset combinations automatically', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Open auto-generation panel
      await authenticatedPage.click('[data-testid="auto-generate-button"]');
      
      // Should show generation options
      await expect(authenticatedPage.locator('[data-testid="generation-options"]')).toBeVisible();
      
      // Set generation parameters
      await authenticatedPage.fill('[data-testid="max-combinations"]', '10');
      await authenticatedPage.check('[data-testid="avoid-duplicates"]');
      
      // Start generation
      await authenticatedPage.click('[data-testid="start-generation"]');
      
      // Should show progress
      await expect(authenticatedPage.locator('[data-testid="generation-progress"]')).toBeVisible();
      
      // Wait for generation to complete
      await expect(authenticatedPage.locator('[data-testid="generation-complete"]')).toBeVisible({ timeout: 30000 });
      
      // Should have generated multiple rows
      await expect(authenticatedPage.locator('[data-testid="matrix-row"]')).toHaveCount.greaterThan(1);
      
      await authenticatedPage.screenshot({ path: 'test-results/auto-generation.png' });
    });

    test('should respect locked assets during generation', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Lock first row
      const firstRow = authenticatedPage.locator('[data-testid="matrix-row"]').first();
      await firstRow.locator('[data-testid="lock-row-button"]').click();
      
      // Store locked row assets for comparison
      const lockedAssets = await firstRow.locator('[data-testid="assigned-asset"]').all();
      const lockedAssetIds = await Promise.all(
        lockedAssets.map(asset => asset.getAttribute('data-asset-id'))
      );
      
      // Generate combinations
      await authenticatedPage.click('[data-testid="auto-generate-button"]');
      await authenticatedPage.click('[data-testid="start-generation"]');
      await expect(authenticatedPage.locator('[data-testid="generation-complete"]')).toBeVisible({ timeout: 30000 });
      
      // Verify locked row assets haven't changed
      const currentAssets = await firstRow.locator('[data-testid="assigned-asset"]').all();
      const currentAssetIds = await Promise.all(
        currentAssets.map(asset => asset.getAttribute('data-asset-id'))
      );
      
      expect(currentAssetIds).toEqual(lockedAssetIds);
      
      await authenticatedPage.screenshot({ path: 'test-results/locked-asset-generation.png' });
    });

    test('should allow customization of generation rules', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      await authenticatedPage.click('[data-testid="auto-generate-button"]');
      
      // Should show advanced options
      await authenticatedPage.click('[data-testid="advanced-options"]');
      
      // Test different generation strategies
      await expect(authenticatedPage.locator('[data-testid="strategy-random"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="strategy-systematic"]')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="strategy-balanced"]')).toBeVisible();
      
      // Select systematic strategy
      await authenticatedPage.click('[data-testid="strategy-systematic"]');
      
      // Set constraints
      await authenticatedPage.check('[data-testid="ensure-variety"]');
      await authenticatedPage.fill('[data-testid="min-asset-reuse"]', '2');
      
      await authenticatedPage.screenshot({ path: 'test-results/generation-rules.png' });
    });
  });

  test.describe('Matrix Saving and Loading', () => {
    test('should save matrix changes automatically', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Make a change (assign an asset)
      await authenticatedPage.click('[data-testid="empty-asset-slot"]');
      await authenticatedPage.click('[data-testid="selectable-asset"]');
      await authenticatedPage.click('[data-testid="confirm-asset-selection"]');
      
      // Should show saving indicator
      await expect(authenticatedPage.locator('[data-testid="saving-indicator"]')).toBeVisible();
      
      // Should show saved confirmation
      await expect(authenticatedPage.locator('[data-testid="saved-indicator"]')).toBeVisible({ timeout: 10000 });
      
      await authenticatedPage.screenshot({ path: 'test-results/matrix-auto-save.png' });
    });

    test('should load saved matrix state', async ({ authenticatedPage }) => {
      // Navigate away and back to test loading
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Remember current state
      const assignedAssets = await authenticatedPage.locator('[data-testid="assigned-asset"]').count();
      
      // Navigate away
      await authenticatedPage.goto('/dashboard');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Navigate back
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Should load same state
      await expect(authenticatedPage.locator('[data-testid="assigned-asset"]')).toHaveCount(assignedAssets);
      
      await authenticatedPage.screenshot({ path: 'test-results/matrix-state-loaded.png' });
    });

    test('should handle concurrent editing conflicts', async ({ authenticatedPage }) => {
      // This test would simulate multiple users editing the same matrix
      // For now, we'll test the conflict detection UI
      
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Simulate conflict scenario (this would need backend support)
      await authenticatedPage.evaluate(() => {
        // Simulate a conflict notification
        window.dispatchEvent(new CustomEvent('matrix-conflict', {
          detail: { conflictType: 'concurrent_edit', user: 'other-user@example.com' }
        }));
      });
      
      // Should show conflict notification
      await expect(authenticatedPage.locator('[data-testid="conflict-notification"]')).toBeVisible();
      
      // Should offer resolution options
      await expect(authenticatedPage.locator('[data-testid="resolve-conflict-button"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/matrix-conflict.png' });
    });
  });

  test.describe('Matrix Validation', () => {
    test('should validate required asset slots', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Try to save/proceed with empty required slots
      await authenticatedPage.click('[data-testid="validate-matrix-button"]');
      
      // Should show validation errors
      await expect(authenticatedPage.locator('[data-testid="validation-error"]')).toBeVisible();
      
      // Should highlight empty required slots
      await expect(authenticatedPage.locator('[data-testid="required-slot"].empty')).toHaveClass(/.*error.*/);
      
      await authenticatedPage.screenshot({ path: 'test-results/matrix-validation.png' });
    });

    test('should validate asset compatibility', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/campaigns/test-campaign/matrix');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Try to assign incompatible asset (e.g., video to image slot)
      await authenticatedPage.click('[data-testid="image-slot"]');
      await authenticatedPage.click('[data-testid="filter-videos"]');
      await authenticatedPage.click('[data-testid="video-asset"]');
      
      // Should show compatibility warning
      await expect(authenticatedPage.locator('[data-testid="compatibility-warning"]')).toBeVisible();
      
      // Should not allow assignment
      await expect(authenticatedPage.locator('[data-testid="confirm-asset-selection"]')).toBeDisabled();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-compatibility.png' });
    });
  });
});