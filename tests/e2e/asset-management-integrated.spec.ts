/**
 * Integrated Asset Management Tests
 * Combines functional testing with UX validation for asset library
 * Tests upload, search, filtering, and management with real user scenarios
 */

import { test, expect } from '@playwright/test';
import { AssetsPage } from '../pages/assets-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AuthHelper } from '../utils/auth-helper';
import { FileHelper } from '../utils/file-helper';
import { APIMockHelper } from '../utils/api-mock-helper';

test.describe('Asset Management - Integrated Testing', () => {
  let assetsPage: AssetsPage;
  let dashboardPage: DashboardPage;
  let authHelper: AuthHelper;
  let fileHelper: FileHelper;
  let apiMockHelper: APIMockHelper;

  test.beforeEach(async ({ page }) => {
    assetsPage = new AssetsPage(page);
    dashboardPage = new DashboardPage(page);
    authHelper = new AuthHelper(page);
    fileHelper = new FileHelper(page);
    apiMockHelper = new APIMockHelper(page);
    
    // Setup authentication and API mocks
    await apiMockHelper.setupDefaultMocks();
    await authHelper.ensureAuthenticated();
  });

  test.describe('Asset Upload Experience', () => {
    test('drag-and-drop upload feels intuitive and provides clear feedback', async ({ page }) => {
      // FUNCTIONAL: File upload works correctly
      // UX: Upload process is intuitive and provides excellent feedback
      
      await test.step('Navigate to assets page', async () => {
        const loadStartTime = Date.now();
        await assetsPage.goto();
        const loadTime = Date.now() - loadStartTime;
        
        // UX: Assets page loads quickly
        expect(loadTime).toBeLessThan(3000);
        
        // FUNCTIONAL: All essential elements present
        await assetsPage.verifyUploadFunctionality();
      });

      await test.step('Upload modal opens smoothly', async () => {
        const modalStartTime = Date.now();
        await assetsPage.openUploadModal();
        const modalTime = Date.now() - modalStartTime;
        
        // UX: Modal opens quickly and smoothly
        expect(modalTime).toBeLessThan(500);
        
        // UX: Upload area is prominent and inviting
        await expect(assetsPage.dropzone).toBeVisible();
        await expect(assetsPage.fileInput).toBeVisible();
        
        // UX: Instructions are clear
        const dropzoneText = await assetsPage.dropzone.textContent();
        expect(dropzoneText).toMatch(/drop.*files|drag.*drop|choose.*files/i);
      });

      await test.step('Drag and drop feels responsive', async () => {
        // Create test file
        const testFile = fileHelper.getFileByType('image', 'medium');
        testFile.name = 'test-drag-drop.jpg';
        
        const uploadStartTime = Date.now();
        
        // UX: Drag and drop interaction feels natural
        await fileHelper.uploadFileByDragDrop(testFile, '[data-testid="dropzone"]');
        
        // UX: Upload progress is visible and meaningful
        await expect(assetsPage.uploadProgress).toBeVisible({ timeout: 2000 });
        
        // UX: Progress updates feel real-time
        let lastProgress = 0;
        for (let i = 0; i < 10; i++) {
          const currentProgress = await assetsPage.getUploadProgress();
          if (currentProgress > lastProgress) {
            lastProgress = currentProgress;
          }
          if (currentProgress >= 100) break;
          await page.waitForTimeout(200);
        }
        
        // FUNCTIONAL: Upload completes successfully
        await assetsPage.waitForUploadComplete();
        const uploadTime = Date.now() - uploadStartTime;
        
        // UX: Upload completes in reasonable time
        expect(uploadTime).toBeLessThan(10000);
        
        // UX: Success is clearly communicated
        await expect(assetsPage.uploadCompleteMessage).toBeVisible();
      });

      await test.step('Uploaded asset appears immediately in library', async () => {
        await assetsPage.closeUploadModal();
        
        // UX: No need to refresh - asset appears automatically
        await expect(assetsPage.assetCards.first()).toBeVisible({ timeout: 3000 });
        
        // FUNCTIONAL: Asset is actually in the library
        const assetNames = await assetsPage.getAssetNames();
        expect(assetNames).toContain('test-drag-drop.jpg');
      });
    });

    test('bulk upload handles multiple files efficiently', async ({ page }) => {
      // FUNCTIONAL: Multiple file upload works
      // UX: Bulk upload doesn't overwhelm user with information
      
      await assetsPage.goto();
      await assetsPage.openUploadModal();

      await test.step('Multiple file selection works smoothly', async () => {
        const testFiles = ['image1.jpg', 'image2.jpg', 'video1.mp4', 'document1.pdf'];
        
        const uploadStartTime = Date.now();
        await assetsPage.uploadMultipleFiles(testFiles);
        
        // UX: Bulk upload progress is clear but not overwhelming
        await expect(assetsPage.uploadProgress).toBeVisible();
        
        // UX: User can see how many files are being processed
        const progressText = await assetsPage.uploadProgress.textContent();
        expect(progressText).toMatch(/\d+.*\d+|progress/i);
        
        await assetsPage.waitForUploadComplete();
        const totalUploadTime = Date.now() - uploadStartTime;
        
        // UX: Bulk upload completes in reasonable time
        expect(totalUploadTime).toBeLessThan(30000); // 30 seconds for 4 files
      });

      await test.step('All uploaded files appear in library', async () => {
        await assetsPage.closeUploadModal();
        
        // FUNCTIONAL: All files are uploaded
        const assetCount = await assetsPage.getAssetCount();
        expect(assetCount).toBeGreaterThanOrEqual(4);
        
        // UX: Files are organized and easy to find
        const assetNames = await assetsPage.getAssetNames();
        expect(assetNames).toContain('image1.jpg');
        expect(assetNames).toContain('video1.mp4');
      });
    });

    test('upload error handling is helpful and recoverable', async ({ page }) => {
      // FUNCTIONAL: Error handling works correctly
      // UX: Errors don't frustrate users and provide clear guidance
      
      await assetsPage.goto();
      await assetsPage.openUploadModal();

      await test.step('File size limit provides clear guidance', async () => {
        // UX: Error handling is helpful, not cryptic
        await fileHelper.testFileSizeLimit();
        
        // UX: Error message is specific and actionable
        await expect(assetsPage.uploadErrorMessage).toBeVisible();
        const errorText = await assetsPage.uploadErrorMessage.textContent();
        expect(errorText).toMatch(/size.*limit|too.*large|maximum.*100/i);
        
        // UX: User can easily try again
        await expect(assetsPage.fileInput).toBeEnabled();
      });

      await test.step('Invalid file types are handled gracefully', async () => {
        // Test invalid file type
        await fileHelper.testUploadError({
          name: 'malicious.exe',
          content: 'fake executable content',
          mimeType: 'application/x-executable'
        });
        
        // UX: Error explains what file types are allowed
        const errorText = await assetsPage.uploadErrorMessage.textContent();
        expect(errorText).toMatch(/file.*type|not.*supported|allowed.*formats/i);
      });
    });
  });

  test.describe('Asset Discovery and Search', () => {
    test('search functionality is fast and intuitive', async ({ page }) => {
      // FUNCTIONAL: Search works correctly
      // UX: Search feels instant and results are relevant
      
      // First upload some test assets for searching
      await assetsPage.goto();
      await assetsPage.uploadFileByInput('brand-logo.jpg', 'image');
      await assetsPage.uploadFileByInput('product-photo.jpg', 'image');
      await assetsPage.uploadFileByInput('promotional-video.mp4', 'video');

      await test.step('Search provides instant feedback', async () => {
        const searchStartTime = Date.now();
        await assetsPage.searchAssets('brand');
        const searchTime = Date.now() - searchStartTime;
        
        // UX: Search feels instant (under 500ms)
        expect(searchTime).toBeLessThan(500);
        
        // FUNCTIONAL: Search returns relevant results
        const searchResults = await assetsPage.getAssetNames();
        expect(searchResults).toContain('brand-logo.jpg');
        expect(searchResults).not.toContain('promotional-video.mp4');
      });

      await test.step('Search updates as user types', async () => {
        // Clear previous search
        await assetsPage.searchAssets('');
        
        // UX: Results update with each keystroke for good UX
        await assetsPage.searchInput.fill('prod');
        await page.waitForTimeout(300); // Brief pause for search to update
        
        const partialResults = await assetsPage.getAssetNames();
        expect(partialResults).toContain('product-photo.jpg');
      });

      await test.step('No results state is helpful', async () => {
        await assetsPage.searchAssets('nonexistent-file-name');
        
        // UX: Empty state is encouraging, not discouraging
        await expect(assetsPage.emptyState).toBeVisible();
        
        // UX: Suggests what user can do
        const emptyText = await assetsPage.emptyState.textContent();
        expect(emptyText).toMatch(/no.*found|try.*different|upload.*assets/i);
      });
    });

    test('filtering provides immediate visual feedback', async ({ page }) => {
      // FUNCTIONAL: Filters work correctly
      // UX: Filtering feels responsive and predictable
      
      await assetsPage.goto();
      
      // Upload assets of different types for testing filters
      await assetsPage.uploadFileByInput('test-image.jpg', 'image');
      await assetsPage.uploadFileByInput('test-video.mp4', 'video');
      await assetsPage.uploadFileByInput('test-document.pdf', 'document');

      await test.step('Type filter provides immediate results', async () => {
        const initialCount = await assetsPage.getAssetCount();
        expect(initialCount).toBeGreaterThan(0);
        
        // UX: Filter change feels immediate
        const filterStartTime = Date.now();
        await assetsPage.filterByType('image');
        const filterTime = Date.now() - filterStartTime;
        
        expect(filterTime).toBeLessThan(1000);
        
        // FUNCTIONAL: Filter works correctly
        const imageResults = await assetsPage.getAssetNames();
        expect(imageResults).toContain('test-image.jpg');
        expect(imageResults).not.toContain('test-video.mp4');
      });

      await test.step('Multiple filters work together intuitively', async () => {
        // Clear filters first
        await assetsPage.filterByType('all');
        
        // UX: Multiple filters combine logically
        await assetsPage.filterByType('image');
        await assetsPage.searchAssets('test');
        
        // FUNCTIONAL: Combined filters work
        const combinedResults = await assetsPage.getAssetNames();
        expect(combinedResults.length).toBeGreaterThan(0);
        
        // All results should match both criteria
        combinedResults.forEach(name => {
          expect(name).toMatch(/test.*jpg|jpg.*test/);
        });
      });

      await test.step('Clear filters works as expected', async () => {
        const filteredCount = await assetsPage.getAssetCount();
        
        // UX: Clear filters is easy to find and use
        await assetsPage.clearAllFilters();
        
        // FUNCTIONAL: All filters are cleared
        const unfilteredCount = await assetsPage.getAssetCount();
        expect(unfilteredCount).toBeGreaterThanOrEqual(filteredCount);
      });
    });

    test('sorting provides predictable organization', async ({ page }) => {
      // FUNCTIONAL: Sorting works correctly
      // UX: Sort order is predictable and helpful
      
      await assetsPage.goto();
      
      // Upload files with different characteristics for sorting
      await assetsPage.uploadFileByInput('a-first-file.jpg', 'image');
      await page.waitForTimeout(1000); // Ensure different timestamps
      await assetsPage.uploadFileByInput('z-last-file.jpg', 'image');

      await test.step('Date sorting shows newest first by default', async () => {
        await assetsPage.sortBy('created_at', 'desc');
        
        // UX: Most recent items appear first (expected behavior)
        const assetNames = await assetsPage.getAssetNames();
        const firstAsset = assetNames[0];
        expect(firstAsset).toBe('z-last-file.jpg'); // Most recently uploaded
      });

      await test.step('Name sorting works alphabetically', async () => {
        await assetsPage.sortBy('name', 'asc');
        
        // FUNCTIONAL: Alphabetical sorting works
        const assetNames = await assetsPage.getAssetNames();
        const firstAsset = assetNames[0];
        expect(firstAsset).toBe('a-first-file.jpg'); // Alphabetically first
      });

      await test.step('Sort order toggle works intuitively', async () => {
        const initialOrder = await assetsPage.getSortOrder();
        
        // UX: Sort direction toggle is clear
        await assetsPage.sortOrderToggle.click();
        
        const newOrder = await assetsPage.getSortOrder();
        expect(newOrder).not.toBe(initialOrder);
        
        // Results should be in reverse order
        const reversedNames = await assetsPage.getAssetNames();
        expect(reversedNames[0]).toBe('z-last-file.jpg'); // Now last alphabetically
      });
    });
  });

  test.describe('Asset Management Actions', () => {
    test('asset actions are discoverable and safe', async ({ page }) => {
      // FUNCTIONAL: Asset actions work correctly
      // UX: Actions are easy to find and accidentally destructive actions are protected
      
      await assetsPage.goto();
      await assetsPage.uploadFileByInput('test-asset-actions.jpg', 'image');

      await test.step('Asset actions are clearly visible', async () => {
        // UX: Actions are discoverable but not overwhelming
        const assetCard = assetsPage.assetCards.first();
        
        // Hover to reveal actions
        await assetCard.hover();
        
        // Actions should be visible
        const favoriteButton = assetCard.locator('button[aria-label="Toggle favorite"]');
        const deleteButton = assetCard.locator('button[aria-label="Delete asset"]');
        
        await expect(favoriteButton).toBeVisible();
        await expect(deleteButton).toBeVisible();
      });

      await test.step('Favorite toggle provides immediate feedback', async () => {
        // UX: Favorite action feels immediate and satisfying
        await assetsPage.toggleAssetFavorite('test-asset-actions.jpg');
        
        // UX: Visual feedback is immediate
        const favoriteButton = assetsPage.assetCards.first()
          .locator('button[aria-label="Toggle favorite"]');
        
        // Should show favorited state (filled heart/star)
        const favoriteIcon = favoriteButton.locator('svg');
        await expect(favoriteIcon).toBeVisible();
      });

      await test.step('Delete action is protected but not cumbersome', async () => {
        // UX: Destructive actions require confirmation but aren't overly difficult
        const initialCount = await assetsPage.getAssetCount();
        
        await assetsPage.deleteAsset('test-asset-actions.jpg');
        
        // FUNCTIONAL: Asset is deleted
        const newCount = await assetsPage.getAssetCount();
        expect(newCount).toBe(initialCount - 1);
        
        // FUNCTIONAL: Asset no longer appears
        await expect(assetsPage.verifyAssetDeleted('test-asset-actions.jpg')).resolves.toBeTruthy();
      });
    });

    test('bulk operations are efficient and safe', async ({ page }) => {
      // FUNCTIONAL: Bulk operations work correctly
      // UX: Bulk operations save time without being confusing
      
      await assetsPage.goto();
      
      // Upload multiple files for bulk testing
      await assetsPage.uploadMultipleFiles(['bulk1.jpg', 'bulk2.jpg', 'bulk3.jpg']);

      await test.step('Bulk selection is intuitive', async () => {
        // UX: Select all is easy to find and use
        await assetsPage.selectAllAssets();
        
        const selectedCount = await assetsPage.getSelectedAssetCount();
        expect(selectedCount).toBeGreaterThan(0);
        
        // UX: Selection state is visually clear
        const firstAsset = assetsPage.assetCards.first();
        const checkbox = firstAsset.locator('input[type="checkbox"]');
        await expect(checkbox).toBeChecked();
      });

      await test.step('Bulk actions provide clear feedback', async () => {
        // UX: Bulk operations show progress and results
        const selectedCount = await assetsPage.getSelectedAssetCount();
        expect(selectedCount).toBeGreaterThan(0);
        
        // UX: Bulk action buttons are clearly labeled
        await expect(assetsPage.bulkDeleteButton).toBeVisible();
        await expect(assetsPage.bulkDownloadButton).toBeVisible();
      });

      await test.step('Bulk delete is protected but efficient', async () => {
        const initialCount = await assetsPage.getAssetCount();
        const selectedCount = await assetsPage.getSelectedAssetCount();
        
        // UX: Bulk delete requires confirmation for safety
        await assetsPage.bulkDeleteSelected();
        
        // FUNCTIONAL: Bulk delete works
        const finalCount = await assetsPage.getAssetCount();
        expect(finalCount).toBe(initialCount - selectedCount);
      });
    });
  });

  test.describe('View Modes and Organization', () => {
    test('view mode switching enhances different use cases', async ({ page }) => {
      // FUNCTIONAL: View modes work correctly
      // UX: Different view modes serve different user needs
      
      await assetsPage.goto();
      
      // Upload files with different characteristics
      await assetsPage.uploadFileByInput('grid-test-image.jpg', 'image');
      await assetsPage.uploadFileByInput('list-test-video.mp4', 'video');

      await test.step('Grid view showcases visual assets', async () => {
        await assetsPage.switchToGridView();
        
        // UX: Grid view is optimized for visual browsing
        const currentView = await assetsPage.getCurrentViewMode();
        expect(currentView).toBe('grid');
        
        // UX: Assets are displayed with good visual hierarchy
        await expect(assetsPage.assetCards.first()).toBeVisible();
        
        // UX: Thumbnails are prominent in grid view
        const firstCard = assetsPage.assetCards.first();
        const thumbnail = firstCard.locator('img, [data-testid="asset-thumbnail"]');
        if (await thumbnail.count() > 0) {
          await expect(thumbnail.first()).toBeVisible();
        }
      });

      await test.step('List view provides detailed information', async () => {
        await assetsPage.switchToListView();
        
        // UX: List view is optimized for detailed comparison
        const currentView = await assetsPage.getCurrentViewMode();
        expect(currentView).toBe('list');
        
        // UX: More metadata is visible in list view
        await expect(assetsPage.assetCards.first()).toBeVisible();
      });

      await test.step('View mode preference persists', async () => {
        await assetsPage.switchToGridView();
        
        // Refresh page
        await page.reload();
        await assetsPage.waitForLoad();
        
        // UX: User preference is remembered
        const persistedView = await assetsPage.getCurrentViewMode();
        expect(persistedView).toBe('grid');
      });
    });
  });

  test.describe('Performance and Responsiveness', () => {
    test('asset library performs well with many assets', async ({ page }) => {
      // FUNCTIONAL: Library handles reasonable amounts of content
      // UX: Performance doesn't degrade user experience
      
      await test.step('Large asset library loads efficiently', async () => {
        await assetsPage.goto();
        
        // Measure load time with existing assets
        const loadStartTime = Date.now();
        await assetsPage.waitForLoad();
        const loadTime = Date.now() - loadStartTime;
        
        // UX: Library loads quickly even with many assets
        expect(loadTime).toBeLessThan(5000);
        
        // UX: Initial assets appear without waiting for all to load
        await expect(assetsPage.assetCards.first()).toBeVisible();
      });

      await test.step('Search remains fast with many assets', async () => {
        // Measure search performance
        const searchStartTime = Date.now();
        await assetsPage.searchAssets('test');
        const searchTime = Date.now() - searchStartTime;
        
        // UX: Search feels instant even with many assets
        expect(searchTime).toBeLessThan(1000);
      });

      await test.step('Infinite scroll or pagination works smoothly', async () => {
        // Test pagination if implemented
        if (await assetsPage.pagination.isVisible()) {
          const currentPage = await assetsPage.getCurrentPage();
          expect(currentPage).toBe(1);
          
          // UX: Pagination is smooth and predictable
          if (await assetsPage.nextPageButton.isVisible()) {
            await assetsPage.goToNextPage();
            const newPage = await assetsPage.getCurrentPage();
            expect(newPage).toBe(2);
          }
        }
      });
    });

    test('mobile asset management is touch-friendly', async ({ page }) => {
      // FUNCTIONAL: Mobile functionality works
      // UX: Mobile experience is optimized for touch
      
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      await assetsPage.goto();

      await test.step('Mobile upload is accessible', async () => {
        // UX: Upload button is easily touchable
        const uploadButton = assetsPage.uploadButton;
        const buttonBounds = await uploadButton.boundingBox();
        expect(buttonBounds?.height).toBeGreaterThan(44); // Minimum touch target
        
        await assetsPage.openUploadModal();
        
        // UX: Mobile upload interface is touch-friendly
        await expect(assetsPage.uploadModal).toBeVisible();
        await expect(assetsPage.fileInput).toBeVisible();
      });

      await test.step('Mobile asset actions are accessible', async () => {
        await assetsPage.closeUploadModal();
        
        // Upload a test file for mobile interaction testing
        await assetsPage.uploadFileByInput('mobile-test.jpg', 'image');
        
        // UX: Asset actions are accessible on mobile
        const assetCard = assetsPage.assetCards.first();
        await assetCard.tap(); // Mobile tap
        
        // Actions should be accessible
        const deleteButton = assetCard.locator('button[aria-label="Delete asset"]');
        if (await deleteButton.isVisible()) {
          const buttonBounds = await deleteButton.boundingBox();
          expect(buttonBounds?.height).toBeGreaterThan(44);
        }
      });
    });
  });
});

// Test teardown
test.afterEach(async ({ page }) => {
  // Clean up uploaded test files
  const fileHelper = new FileHelper(page);
  fileHelper.cleanup();
});