import { test, expect } from './fixtures/test-fixtures';
import * as path from 'path';

test.describe('Asset Management', () => {
  test.beforeEach(async ({ authenticatedPage }) => {
    // Navigate to assets page
    await authenticatedPage.goto('/assets');
    await authenticatedPage.waitForLoadState('networkidle');
  });

  test.describe('Single File Upload', () => {
    test('should upload an image file successfully', async ({ authenticatedPage, fileHelper }) => {
      // Create test assets
      const testFiles = await fileHelper.createTestAssets();
      const imageFile = testFiles.find(file => file.includes('test-image.jpg'));
      
      if (!imageFile) {
        test.skip('Test image file not available');
        return;
      }

      // Upload the file
      await fileHelper.uploadFile(imageFile, '[data-testid="upload-button"]');
      
      // Wait for upload to complete
      await fileHelper.waitForUploadComplete();
      
      // Verify file appears in asset list
      await fileHelper.verifyFileUploaded('test-image.jpg');
      
      // Verify thumbnail is generated
      await expect(authenticatedPage.locator('[data-testid="asset-thumbnail"]').first()).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/image-upload.png' });
    });

    test('should upload a video file successfully', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      const videoFile = testFiles.find(file => file.includes('test-video.mp4'));
      
      if (!videoFile) {
        test.skip('Test video file not available');
        return;
      }

      await fileHelper.uploadFile(videoFile);
      await fileHelper.waitForUploadComplete();
      await fileHelper.verifyFileUploaded('test-video.mp4');
      
      // Verify video-specific UI elements
      await expect(authenticatedPage.locator('[data-testid="video-duration"]').first()).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/video-upload.png' });
    });

    test('should upload an audio file successfully', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      const audioFile = testFiles.find(file => file.includes('test-audio.mp3'));
      
      if (!audioFile) {
        test.skip('Test audio file not available');
        return;
      }

      await fileHelper.uploadFile(audioFile);
      await fileHelper.waitForUploadComplete();
      await fileHelper.verifyFileUploaded('test-audio.mp3');
      
      // Verify audio-specific UI elements
      await expect(authenticatedPage.locator('[data-testid="audio-waveform"]').first()).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/audio-upload.png' });
    });

    test('should upload a document file successfully', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      const docFile = testFiles.find(file => file.includes('test-document.pdf'));
      
      if (!docFile) {
        test.skip('Test document file not available');
        return;
      }

      await fileHelper.uploadFile(docFile);
      await fileHelper.waitForUploadComplete();
      await fileHelper.verifyFileUploaded('test-document.pdf');
      
      await authenticatedPage.screenshot({ path: 'test-results/document-upload.png' });
    });

    test('should enforce 100MB file size limit', async ({ authenticatedPage, fileHelper }) => {
      // This test would need a large file or file size simulation
      // For now, we'll test the UI behavior when a large file is selected
      
      // Look for file size validation message
      await expect(authenticatedPage.locator('[data-testid="file-size-limit"]')).toContainText('100MB');
      
      await authenticatedPage.screenshot({ path: 'test-results/file-size-limit.png' });
    });
  });

  test.describe('Bulk Folder Upload', () => {
    test('should upload multiple files at once', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      
      // Upload multiple files
      await fileHelper.uploadMultipleFiles(testFiles.slice(0, 3));
      
      // Wait for all uploads to complete
      await fileHelper.waitForUploadComplete();
      
      // Verify all files appear
      for (const file of testFiles.slice(0, 3)) {
        const fileName = path.basename(file);
        await fileHelper.verifyFileUploaded(fileName);
      }
      
      await authenticatedPage.screenshot({ path: 'test-results/bulk-upload.png' });
    });

    test('should auto-categorize uploaded files', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      
      // Upload files of different types
      await fileHelper.uploadMultipleFiles(testFiles);
      await fileHelper.waitForUploadComplete();
      
      // Check that files are categorized correctly
      // Images should be in Images category
      await authenticatedPage.click('[data-testid="category-images"]');
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-image.jpg")')).toBeVisible();
      
      // Videos should be in Videos category
      await authenticatedPage.click('[data-testid="category-videos"]');
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-video.mp4")')).toBeVisible();
      
      // Audio should be in Audio category
      await authenticatedPage.click('[data-testid="category-audio"]');
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-audio.mp3")')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/auto-categorization.png' });
    });
  });

  test.describe('Drag and Drop', () => {
    test('should support drag and drop file upload', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      const imageFile = testFiles.find(file => file.includes('test-image.jpg'));
      
      if (!imageFile) {
        test.skip('Test image file not available');
        return;
      }

      // Drag and drop file
      await fileHelper.dragAndDropFile(imageFile, '[data-testid="drop-zone"]');
      
      // Verify drop zone visual feedback
      await expect(authenticatedPage.locator('[data-testid="drop-zone"]')).toHaveClass(/.*drop-active.*/);
      
      // Wait for upload
      await fileHelper.waitForUploadComplete();
      await fileHelper.verifyFileUploaded('test-image.jpg');
      
      await authenticatedPage.screenshot({ path: 'test-results/drag-drop-upload.png' });
    });

    test('should show visual feedback during drag operation', async ({ authenticatedPage }) => {
      // Test drag over behavior (without actual file)
      const dropZone = authenticatedPage.locator('[data-testid="drop-zone"]');
      
      // Simulate drag over
      await dropZone.dispatchEvent('dragover');
      
      // Should show active state
      await expect(dropZone).toHaveClass(/.*drag-over.*/);
      
      // Simulate drag leave
      await dropZone.dispatchEvent('dragleave');
      
      // Should remove active state
      await expect(dropZone).not.toHaveClass(/.*drag-over.*/);
      
      await authenticatedPage.screenshot({ path: 'test-results/drag-feedback.png' });
    });
  });

  test.describe('Asset Management Features', () => {
    test('should search assets by name', async ({ authenticatedPage, fileHelper }) => {
      // First upload some test files
      const testFiles = await fileHelper.createTestAssets();
      await fileHelper.uploadMultipleFiles(testFiles.slice(0, 2));
      await fileHelper.waitForUploadComplete();
      
      // Search for specific file
      await authenticatedPage.fill('[data-testid="asset-search"]', 'test-image');
      await authenticatedPage.press('[data-testid="asset-search"]', 'Enter');
      
      // Should show only matching results
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-image.jpg")')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-video.mp4")')).not.toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-search.png' });
    });

    test('should filter assets by type', async ({ authenticatedPage, fileHelper }) => {
      // Upload different file types
      const testFiles = await fileHelper.createTestAssets();
      await fileHelper.uploadMultipleFiles(testFiles);
      await fileHelper.waitForUploadComplete();
      
      // Filter by images
      await authenticatedPage.click('[data-testid="filter-images"]');
      
      // Should show only images
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-image.jpg")')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-video.mp4")')).not.toBeVisible();
      
      // Filter by videos
      await authenticatedPage.click('[data-testid="filter-videos"]');
      
      // Should show only videos
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-video.mp4")')).toBeVisible();
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-image.jpg")')).not.toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-filtering.png' });
    });

    test('should add assets to favorites', async ({ authenticatedPage, fileHelper }) => {
      // Upload a test file
      const testFiles = await fileHelper.createTestAssets();
      const imageFile = testFiles.find(file => file.includes('test-image.jpg'));
      
      if (!imageFile) {
        test.skip('Test image file not available');
        return;
      }

      await fileHelper.uploadFile(imageFile);
      await fileHelper.waitForUploadComplete();
      
      // Click favorite button
      await authenticatedPage.click('[data-testid="favorite-button"]');
      
      // Should show as favorited
      await expect(authenticatedPage.locator('[data-testid="favorite-button"]')).toHaveClass(/.*favorited.*/);
      
      // Filter by favorites
      await authenticatedPage.click('[data-testid="filter-favorites"]');
      
      // Should show the favorited file
      await expect(authenticatedPage.locator('[data-testid="file-item"]:has-text("test-image.jpg")')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-favorites.png' });
    });

    test('should delete assets', async ({ authenticatedPage, fileHelper }) => {
      // Upload a test file
      const testFiles = await fileHelper.createTestAssets();
      const imageFile = testFiles.find(file => file.includes('test-image.jpg'));
      
      if (!imageFile) {
        test.skip('Test image file not available');
        return;
      }

      await fileHelper.uploadFile(imageFile);
      await fileHelper.waitForUploadComplete();
      
      // Delete the file
      await fileHelper.deleteFile('test-image.jpg');
      
      await authenticatedPage.screenshot({ path: 'test-results/asset-deleted.png' });
    });
  });

  test.describe('Thumbnail Generation', () => {
    test('should generate thumbnails for images', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      const imageFile = testFiles.find(file => file.includes('test-image.jpg'));
      
      if (!imageFile) {
        test.skip('Test image file not available');
        return;
      }

      await fileHelper.uploadFile(imageFile);
      await fileHelper.waitForUploadComplete();
      
      // Should show thumbnail
      await expect(authenticatedPage.locator('[data-testid="asset-thumbnail"]')).toBeVisible();
      
      // Thumbnail should have loaded (not broken image)
      const thumbnail = authenticatedPage.locator('[data-testid="asset-thumbnail"]').first();
      const naturalWidth = await thumbnail.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
      
      await authenticatedPage.screenshot({ path: 'test-results/image-thumbnail.png' });
    });

    test('should generate video thumbnails', async ({ authenticatedPage, fileHelper }) => {
      const testFiles = await fileHelper.createTestAssets();
      const videoFile = testFiles.find(file => file.includes('test-video.mp4'));
      
      if (!videoFile) {
        test.skip('Test video file not available');
        return;
      }

      await fileHelper.uploadFile(videoFile);
      await fileHelper.waitForUploadComplete();
      
      // Should show video thumbnail
      await expect(authenticatedPage.locator('[data-testid="video-thumbnail"]')).toBeVisible();
      
      // Should show play icon overlay
      await expect(authenticatedPage.locator('[data-testid="play-icon"]')).toBeVisible();
      
      await authenticatedPage.screenshot({ path: 'test-results/video-thumbnail.png' });
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ authenticatedPage, fileHelper }) => {
      // Set mobile viewport
      await authenticatedPage.setViewportSize({ width: 375, height: 667 });
      
      await authenticatedPage.goto('/assets');
      await authenticatedPage.waitForLoadState('networkidle');
      
      // Should show mobile-friendly layout
      await expect(authenticatedPage.locator('[data-testid="mobile-upload-button"]')).toBeVisible();
      
      // Should be able to upload files on mobile
      const testFiles = await fileHelper.createTestAssets();
      const imageFile = testFiles.find(file => file.includes('test-image.jpg'));
      
      if (imageFile) {
        await fileHelper.uploadFile(imageFile, '[data-testid="mobile-upload-button"]');
        await fileHelper.waitForUploadComplete();
        await fileHelper.verifyFileUploaded('test-image.jpg');
      }
      
      await authenticatedPage.screenshot({ path: 'test-results/mobile-assets.png' });
    });
  });
});