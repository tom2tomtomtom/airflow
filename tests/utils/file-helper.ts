import { getErrorMessage } from '@/utils/errorUtils';
/**
 * File upload and management helper for AIrWAVE testing
 * Handles file creation, upload testing, and asset management
 */

import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface TestFile {
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  buffer: Buffer;
  mimeType: string;
}

export class FileHelper {
  private page: Page;
  private fixturesDir: string;

  constructor(page: Page) {
    this.page = page;
    this.fixturesDir = path.join(process.cwd(), 'tests/fixtures/files');
    this.ensureFixturesDir();
  }

  private ensureFixturesDir(): void {
    if (!fs.existsSync(this.fixturesDir)) {
      fs.mkdirSync(this.fixturesDir, { recursive: true });
    }
  }

  // Create test files of different types and sizes
  createTestFiles(): TestFile[] {
    const files: TestFile[] = [];

    // Small image (1KB)
    files.push(this.createTestImage('small-image.jpg', 1024));
    
    // Medium image (1MB)
    files.push(this.createTestImage('medium-image.jpg', 1024 * 1024));
    
    // Large image (10MB)
    files.push(this.createTestImage('large-image.jpg', 10 * 1024 * 1024));
    
    // Video file (5MB)
    files.push(this.createTestVideo('test-video.mp4', 5 * 1024 * 1024));
    
    // Audio file (2MB)
    files.push(this.createTestAudio('test-audio.mp3', 2 * 1024 * 1024));
    
    // Document file (500KB)
    files.push(this.createTestDocument('test-document.pdf', 500 * 1024));
    
    // Very large file (100MB) for stress testing
    files.push(this.createTestImage('stress-test.jpg', 100 * 1024 * 1024));

    return files;
  }

  private createTestImage(name: string, size: number): TestFile {
    // Create a simple test image buffer
    const buffer = Buffer.alloc(size);
    
    // Fill with JPEG-like header for basic validation
    buffer.write('\xFF\xD8\xFF\xE0', 0, 'binary');
    buffer.write('JFIF', 6);
    
    return {
      name,
      type: 'image',
      size,
      buffer,
      mimeType: 'image/jpeg'
    };
  }

  private createTestVideo(name: string, size: number): TestFile {
    const buffer = Buffer.alloc(size);
    
    // MP4 file signature
    buffer.write('\x00\x00\x00\x20\x66\x74\x79\x70', 0, 'binary');
    
    return {
      name,
      type: 'video', 
      size,
      buffer,
      mimeType: 'video/mp4'
    };
  }

  private createTestAudio(name: string, size: number): TestFile {
    const buffer = Buffer.alloc(size);
    
    // MP3 file signature
    buffer.write('ID3', 0);
    
    return {
      name,
      type: 'audio',
      size,
      buffer,
      mimeType: 'audio/mpeg'
    };
  }

  private createTestDocument(name: string, size: number): TestFile {
    const buffer = Buffer.alloc(size);
    
    // PDF file signature
    buffer.write('%PDF-1.4', 0);
    
    return {
      name,
      type: 'document',
      size,
      buffer,
      mimeType: 'application/pdf'
    };
  }

  // Save test file to disk for Playwright upload
  saveTestFile(file: TestFile): string {
    const filePath = path.join(this.fixturesDir, file.name);
    fs.writeFileSync(filePath, file.buffer);
    return filePath;
  }

  // Upload single file through drag and drop
  async uploadFileByDragDrop(file: TestFile, dropZoneSelector: string): Promise<void> {
    const filePath = this.saveTestFile(file);
    
    // Create file input programmatically for drag and drop simulation
    await this.page.evaluate(({ selector, fileName, fileContent, mimeType }) => {
      const dropZone = document.querySelector(selector);
      if (!dropZone) {
        throw new Error(`Drop zone not found: ${selector}`);
      }

      // Create file and data transfer objects
      const dataTransfer = new DataTransfer();
      const file = new File([fileContent], fileName, { type: mimeType });
      dataTransfer.items.add(file);

      // Simulate drag and drop events
      const dragEnterEvent = new DragEvent('dragenter', {
        dataTransfer,
        bubbles: true
      });
      
      const dragOverEvent = new DragEvent('dragover', {
        dataTransfer,
        bubbles: true
      });
      
      const dropEvent = new DragEvent('drop', {
        dataTransfer,
        bubbles: true
      });

      dropZone.dispatchEvent(dragEnterEvent);
      dropZone.dispatchEvent(dragOverEvent);
      dropZone.dispatchEvent(dropEvent);
    }, {
      selector: dropZoneSelector,
      fileName: file.name,
      fileContent: file.buffer,
      mimeType: file.mimeType
    });
  }

  // Upload file through file input
  async uploadFileByInput(file: TestFile, inputSelector: string): Promise<void> {
    const filePath = this.saveTestFile(file);
    
    await this.page.setInputFiles(inputSelector, filePath);
  }

  // Upload multiple files
  async uploadMultipleFiles(files: TestFile[], inputSelector: string): Promise<void> {
    const filePaths = files.map(file => this.saveTestFile(file));
    
    await this.page.setInputFiles(inputSelector, filePaths);
  }

  // Test bulk folder upload
  async uploadFolder(folderName: string, files: TestFile[]): Promise<void> {
    // Create folder structure
    const folderPath = path.join(this.fixturesDir, folderName);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Save files in folder
    const filePaths = files.map(file => {
      const filePath = path.join(folderPath, file.name);
      fs.writeFileSync(filePath, file.buffer);
      return filePath;
    });

    // Simulate folder upload (browser limitation - use multiple files)
    await this.page.setInputFiles('[data-testid="file-input"]', filePaths);
  }

  // Monitor upload progress
  async waitForUploadProgress(expectedFiles: number, timeoutMs: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      // Check for upload progress indicators
      const progressBars = await this.page.locator('[data-testid="upload-progress"]').count();
      const completedUploads = await this.page.locator('[data-testid="upload-complete"]').count();
      
      if (completedUploads >= expectedFiles) {
        return;
      }
      
      await this.page.waitForTimeout(500);
    }
    
    throw new Error(`Upload progress timeout after ${timeoutMs}ms`);
  }

  // Verify upload completion
  async verifyUploadComplete(fileName: string): Promise<boolean> {
    try {
      // Check if file appears in asset list
      await this.page.waitForSelector(`[data-testid="asset-card"]:has-text("${fileName}")`, {
        timeout: 10000
      });
      return true;
    } catch (error) {
    const message = getErrorMessage(error);
      return false;
    }
  }

  // Test upload error handling
  async testUploadError(invalidFile: { name: string; content: string; mimeType: string }): Promise<void> {
    // Create invalid file
    const filePath = path.join(this.fixturesDir, invalidFile.name);
    fs.writeFileSync(filePath, invalidFile.content);
    
    // Attempt upload
    await this.page.setInputFiles('[data-testid="file-input"]', filePath);
    
    // Wait for error message
    await this.page.waitForSelector('[data-testid="upload-error"]', { timeout: 5000 });
  }

  // Test file size limits
  async testFileSizeLimit(): Promise<void> {
    // Create file larger than 100MB limit
    const oversizedFile = this.createTestImage('oversized.jpg', 150 * 1024 * 1024);
    const filePath = this.saveTestFile(oversizedFile);
    
    await this.page.setInputFiles('[data-testid="file-input"]', filePath);
    
    // Should show size error
    await this.page.waitForSelector('[data-testid="file-size-error"]', { timeout: 5000 });
  }

  // Test concurrent uploads
  async testConcurrentUploads(files: TestFile[]): Promise<void> {
    const uploadPromises = files.map(async (file, index) => {
      const inputSelector = `[data-testid="file-input-${index}"]`;
      await this.uploadFileByInput(file, inputSelector);
    });
    
    // Wait for all uploads to complete
    await Promise.all(uploadPromises);
    
    // Verify all files uploaded
    for (const file of files) {
      await this.verifyUploadComplete(file.name);
    }
  }

  // Performance testing - upload speed measurement
  async measureUploadSpeed(file: TestFile): Promise<{ duration: number; speed: number }> {
    const startTime = Date.now();
    
    await this.uploadFileByInput(file, '[data-testid="file-input"]');
    await this.verifyUploadComplete(file.name);
    
    const duration = Date.now() - startTime;
    const speed = file.size / (duration / 1000); // bytes per second
    
    return { duration, speed };
  }

  // Cleanup test files
  cleanup(): void {
    if (fs.existsSync(this.fixturesDir)) {
      fs.rmSync(this.fixturesDir, { recursive: true, force: true });
    }
  }

  // Get file by type for specific tests
  getFileByType(type: 'image' | 'video' | 'audio' | 'document', size: 'small' | 'medium' | 'large' = 'medium'): TestFile {
    const files = this.createTestFiles();
    
    const typeFiles = files.filter(f => f.type === type);
    
    if (size === 'small') {
      return typeFiles.find(f => f.size < 1024 * 1024) || typeFiles[0];
    } else if (size === 'large') {
      return typeFiles.find(f => f.size > 5 * 1024 * 1024) || typeFiles[typeFiles.length - 1];
    } else {
      return typeFiles.find(f => f.size >= 1024 * 1024 && f.size <= 5 * 1024 * 1024) || typeFiles[0];
    }
  }
}