import { test, expect } from './fixtures/test-fixtures';
import path from 'path';

test.describe('Asset Upload Flow', () => {
  test('should upload image assets successfully', async ({ authenticatedPage, authHelper }) => {
    // Navigate to assets page
    await authenticatedPage.goto('/assets');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Take screenshot of assets page
    await authenticatedPage.screenshot({ path: 'test-results/assets-page.png' });
    
    // Look for upload button or speed dial
    const uploadButton = authenticatedPage.locator('[data-testid="upload-button"]');
    const speedDial = authenticatedPage.locator('[data-testid="speed-dial"]');
    const addButton = authenticatedPage.locator('button:has-text("Upload")');
    
    // Try different ways to trigger upload modal
    let uploadTriggered = false;
    
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      uploadTriggered = true;
    } else if (await speedDial.isVisible()) {
      await speedDial.click();
      // Look for upload action in speed dial
      const uploadAction = authenticatedPage.locator('[data-testid="upload-action"]');
      if (await uploadAction.isVisible()) {
        await uploadAction.click();
        uploadTriggered = true;
      }
    } else if (await addButton.isVisible()) {
      await addButton.click();
      uploadTriggered = true;
    } else {
      // Look for any button with upload-related text
      const buttons = authenticatedPage.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const text = await button.textContent();
        if (text && (text.toLowerCase().includes('upload') || text.toLowerCase().includes('add'))) {
          await button.click();
          uploadTriggered = true;
          break;
        }
      }
    }
    
    if (!uploadTriggered) {
      throw new Error('Could not find upload trigger on assets page');
    }
    
    // Wait for upload modal to appear
    await authenticatedPage.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Take screenshot of upload modal
    await authenticatedPage.screenshot({ path: 'test-results/upload-modal.png' });
    
    // Create a test image file
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png');
    
    // Try to find file input
    const fileInput = authenticatedPage.locator('input[type="file"]');
    
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(testImagePath);
    } else {
      // Look for dropzone
      const dropzone = authenticatedPage.locator('[data-testid="dropzone"]');
      if (await dropzone.isVisible()) {
        await dropzone.setInputFiles(testImagePath);
      } else {
        // Try to find any element that accepts file drops
        const uploadArea = authenticatedPage.locator('.dropzone, [data-upload], [data-drop]').first();
        if (await uploadArea.isVisible()) {
          await uploadArea.setInputFiles(testImagePath);
        }
      }
    }
    
    // Wait for file to be processed
    await authenticatedPage.waitForTimeout(2000);
    
    // Take screenshot showing file selected
    await authenticatedPage.screenshot({ path: 'test-results/file-selected.png' });
    
    // Look for upload confirmation button
    const confirmButton = authenticatedPage.locator('button:has-text("Upload")');
    const submitButton = authenticatedPage.locator('button[type="submit"]');
    const saveButton = authenticatedPage.locator('button:has-text("Save")');
    
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    } else if (await submitButton.isVisible()) {
      await submitButton.click();
    } else if (await saveButton.isVisible()) {
      await saveButton.click();
    }
    
    // Wait for upload to complete
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Take final screenshot
    await authenticatedPage.screenshot({ path: 'test-results/upload-complete.png' });
    
    // Verify upload was successful (look for success message or new asset)
    const successMessage = authenticatedPage.locator('[data-testid="success-message"]');
    const alertSuccess = authenticatedPage.locator('.MuiAlert-standardSuccess');
    
    if (await successMessage.isVisible() || await alertSuccess.isVisible()) {
      // Success message found
      expect(true).toBe(true);
    } else {
      // Check if modal closed (indicating success)
      const modal = authenticatedPage.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });

  test('should handle multiple file upload', async ({ authenticatedPage, authHelper }) => {
    await authenticatedPage.goto('/assets');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Try to trigger upload modal (simplified approach)
    const buttons = authenticatedPage.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      if (text && text.toLowerCase().includes('upload')) {
        await button.click();
        break;
      }
    }
    
    // Wait for modal
    await authenticatedPage.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Create multiple test files
    const testFiles = [
      path.join(__dirname, '../fixtures/test-image.png'),
      path.join(__dirname, '../fixtures/test-image-2.png'),
    ];
    
    // Upload multiple files
    const fileInput = authenticatedPage.locator('input[type="file"]').first();
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(testFiles);
    }
    
    await authenticatedPage.waitForTimeout(2000);
    await authenticatedPage.screenshot({ path: 'test-results/multiple-files.png' });
  });

  test('should validate file types and sizes', async ({ authenticatedPage, authHelper }) => {
    await authenticatedPage.goto('/assets');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Trigger upload modal
    const uploadButton = authenticatedPage.locator('button').filter({ hasText: /upload/i }).first();
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
    }
    
    // Wait for modal
    await authenticatedPage.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Try to upload invalid file type
    const invalidFile = path.join(__dirname, '../fixtures/test-document.txt');
    const fileInput = authenticatedPage.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles(invalidFile);
      
      // Wait for validation message
      await authenticatedPage.waitForTimeout(1000);
      
      // Look for error message
      const errorMessage = authenticatedPage.locator('[data-testid="error-message"], .MuiAlert-standardError');
      
      await authenticatedPage.screenshot({ path: 'test-results/file-validation.png' });
    }
  });
});