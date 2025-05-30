import { Page, expect } from '@playwright/test';
import * as path from 'path';

export class FileHelper {
  constructor(private page: Page) {}

  async uploadFile(filePath: string, inputSelector: string = '[data-testid="file-input"]') {
    const fullPath = path.resolve(filePath);
    
    // Set up file chooser listener
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    
    // Click the file input or upload button
    await this.page.click(inputSelector);
    
    // Handle the file chooser
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(fullPath);
  }

  async uploadMultipleFiles(filePaths: string[], inputSelector: string = '[data-testid="file-input"]') {
    const fullPaths = filePaths.map(filePath => path.resolve(filePath));
    
    // Set up file chooser listener
    const fileChooserPromise = this.page.waitForEvent('filechooser');
    
    // Click the file input or upload button
    await this.page.click(inputSelector);
    
    // Handle the file chooser
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(fullPaths);
  }

  async dragAndDropFile(filePath: string, dropZoneSelector: string = '[data-testid="drop-zone"]') {
    const fullPath = path.resolve(filePath);
    
    // Read file as buffer
    const fs = require('fs');
    const buffer = fs.readFileSync(fullPath);
    
    // Create a data transfer object
    const dataTransfer = await this.page.evaluateHandle((buffer, fileName) => {
      const dt = new DataTransfer();
      const file = new File([new Uint8Array(buffer)], fileName, {
        type: 'application/octet-stream'
      });
      dt.items.add(file);
      return dt;
    }, Array.from(buffer), path.basename(fullPath));

    // Dispatch drop event
    await this.page.dispatchEvent(dropZoneSelector, 'drop', { dataTransfer });
  }

  async waitForUploadComplete(timeout: number = 30000) {
    // Wait for upload progress to complete
    await this.page.waitForSelector('[data-testid="upload-complete"]', { timeout });
  }

  async verifyFileUploaded(fileName: string) {
    // Verify file appears in the file list
    await expect(this.page.locator(`[data-testid="file-item"]:has-text("${fileName}")`)).toBeVisible();
  }

  async deleteFile(fileName: string) {
    // Find the file and click delete
    const fileItem = this.page.locator(`[data-testid="file-item"]:has-text("${fileName}")`);
    await fileItem.locator('[data-testid="delete-button"]').click();
    
    // Confirm deletion if modal appears
    const confirmButton = this.page.locator('[data-testid="confirm-delete"]');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Verify file is removed
    await expect(fileItem).not.toBeVisible();
  }

  async createTestAssets() {
    const testAssetsDir = path.join(__dirname, '../test-assets');
    const fs = require('fs');
    
    // Create test assets directory if it doesn't exist
    if (!fs.existsSync(testAssetsDir)) {
      fs.mkdirSync(testAssetsDir, { recursive: true });
    }

    // Create sample test files
    const testFiles = [
      { name: 'test-image.jpg', content: 'fake-image-content' },
      { name: 'test-video.mp4', content: 'fake-video-content' },
      { name: 'test-audio.mp3', content: 'fake-audio-content' },
      { name: 'test-document.pdf', content: 'fake-pdf-content' },
      { name: 'test-text.txt', content: 'This is a test text file for E2E testing.' }
    ];

    for (const file of testFiles) {
      const filePath = path.join(testAssetsDir, file.name);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, file.content);
      }
    }

    return testFiles.map(file => path.join(testAssetsDir, file.name));
  }
}