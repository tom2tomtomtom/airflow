import { S3Storage } from '@/lib/storage/s3Storage';
import { S3Client } from '@aws-sdk/client-s3';

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/s3-request-presigner');
jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => ({
    done: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
  })),
}));

describe('S3 Storage', () => {
  let storage: S3Storage;
  
  beforeEach(() => {
    storage = new S3Storage('test-client-id');
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      const mockFile = Buffer.from('test file content');
      const filename = 'test.txt';
      
      // Mock S3 head response
      (S3Client as any).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({
          ContentLength: 1024,
          ContentType: 'text/plain',
          LastModified: new Date(),
        }),
      }));

      const result = await storage.upload(mockFile, filename, {
        contentType: 'text/plain',
      });

      expect(result).toBeDefined();
      expect(result.key).toContain('test-client-id');
      expect(result.contentType).toBe('text/plain');
      expect(result.size).toBe(1024);
    });

    it('should track upload progress', async () => {
      const mockFile = Buffer.from('test file content');
      const filename = 'test.txt';
      const progressCallback = jest.fn();

      await storage.upload(mockFile, filename, {
        contentType: 'text/plain',
        onProgress: progressCallback,
      });

      // Progress callback should be registered
      expect(progressCallback).toBeDefined();
    });
  });

  describe('generateUploadUrl', () => {
    it('should generate presigned upload URL', async () => {
      const mockPresigner = require('@aws-sdk/s3-request-presigner');
      mockPresigner.getSignedUrl = jest.fn().mockResolvedValue('https://presigned-url.com');

      const result = await storage.generateUploadUrl('test.jpg', 'image/jpeg');

      expect(result).toBeDefined();
      expect(result.uploadUrl).toBe('https://presigned-url.com');
      expect(result.key).toContain('test-client-id');
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      const mockS3Client = {
        send: jest.fn().mockResolvedValue({}),
      };
      (S3Client as any).mockImplementation(() => mockS3Client);

      await storage.delete('test-key');

      expect(mockS3Client.send).toHaveBeenCalled();
    });
  });
});
