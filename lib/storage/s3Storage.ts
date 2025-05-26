import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Upload } from '@aws-sdk/lib-storage';
import crypto from 'crypto';
import { Readable } from 'stream';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET!;
const CDN_DOMAIN = process.env.CDN_DOMAIN;

export interface UploadOptions {
  key?: string;
  contentType: string;
  metadata?: Record<string, string>;
  cacheControl?: string;
  onProgress?: (progress: number) => void;
}

export interface StorageFile {
  key: string;
  url: string;
  cdnUrl?: string;
  size: number;
  contentType: string;
  lastModified: Date;
  metadata?: Record<string, string>;
}

// Generate a unique key for file storage
function generateFileKey(filename: string, clientId: string, folder: string = 'assets'): string {
  const timestamp = Date.now();
  const hash = crypto.createHash('md5').update(`${filename}${timestamp}`).digest('hex').substring(0, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${clientId}/${folder}/${timestamp}-${hash}-${sanitizedFilename}`;
}

// Upload file to S3 with progress tracking
export async function uploadFile(
  file: Buffer | Readable | Blob,
  filename: string,
  clientId: string,
  options: UploadOptions
): Promise<StorageFile> {
  const key = options.key || generateFileKey(filename, clientId);
  
  try {
    // Use multipart upload for better reliability and progress tracking
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: options.contentType,
        CacheControl: options.cacheControl || 'public, max-age=31536000',
        Metadata: {
          clientId,
          originalFilename: filename,
          ...options.metadata,
        },
      },
    });
    
    // Track upload progress
    if (options.onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentage = Math.round((progress.loaded / progress.total) * 100);
          options.onProgress!(percentage);
        }
      });
    }
    
    await upload.done();
    
    // Get file info
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const headResponse = await s3Client.send(headCommand);
    
    return {
      key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      cdnUrl: CDN_DOMAIN ? `https://${CDN_DOMAIN}/${key}` : undefined,
      size: headResponse.ContentLength || 0,
      contentType: headResponse.ContentType || options.contentType,
      lastModified: headResponse.LastModified || new Date(),
      metadata: headResponse.Metadata,
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
}

// Generate presigned URL for direct upload from browser
export async function generateUploadUrl(
  filename: string,
  clientId: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
): Promise<{ uploadUrl: string; key: string }> {
  const key = generateFileKey(filename, clientId);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      clientId,
      originalFilename: filename,
    },
  });
  
  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  
  return { uploadUrl, key };
}

// Generate presigned URL for file download
export async function generateDownloadUrl(
  key: string,
  expiresIn: number = 3600,
  downloadFilename?: string
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ...(downloadFilename && {
      ResponseContentDisposition: `attachment; filename="${downloadFilename}"`,
    }),
  });
  
  return getSignedUrl(s3Client, command, { expiresIn });
}

// Delete file from S3
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

// Delete multiple files
export async function deleteFiles(keys: string[]): Promise<void> {
  // S3 doesn't have a bulk delete in the SDK, so we'll use Promise.all
  // In production, you might want to use the DeleteObjects command
  await Promise.all(keys.map(key => deleteFile(key)));
}

// List files for a client
export async function listFiles(
  clientId: string,
  prefix?: string,
  maxKeys: number = 1000
): Promise<StorageFile[]> {
  try {
    const fullPrefix = prefix ? `${clientId}/${prefix}` : `${clientId}/`;
    
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: fullPrefix,
      MaxKeys: maxKeys,
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Contents) {
      return [];
    }
    
    return response.Contents.map(object => ({
      key: object.Key!,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`,
      cdnUrl: CDN_DOMAIN ? `https://${CDN_DOMAIN}/${object.Key}` : undefined,
      size: object.Size || 0,
      contentType: 'application/octet-stream', // S3 list doesn't return content type
      lastModified: object.LastModified || new Date(),
    }));
  } catch (error) {
    console.error('S3 list error:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

// Check if file exists
export async function fileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Get file metadata
export async function getFileMetadata(key: string): Promise<StorageFile | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    
    return {
      key,
      url: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      cdnUrl: CDN_DOMAIN ? `https://${CDN_DOMAIN}/${key}` : undefined,
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata,
    };
  } catch (error) {
    if (error.name === 'NotFound') {
      return null;
    }
    throw error;
  }
}

// Storage utility class for easier usage
export class S3Storage {
  private clientId: string;
  
  constructor(clientId: string) {
    this.clientId = clientId;
  }
  
  async upload(file: Buffer | Readable | Blob, filename: string, options: UploadOptions) {
    return uploadFile(file, filename, this.clientId, options);
  }
  
  async generateUploadUrl(filename: string, contentType: string, expiresIn?: number) {
    return generateUploadUrl(filename, this.clientId, contentType, expiresIn);
  }
  
  async delete(key: string) {
    return deleteFile(key);
  }
  
  async list(prefix?: string, maxKeys?: number) {
    return listFiles(this.clientId, prefix, maxKeys);
  }
  
  async exists(key: string) {
    return fileExists(key);
  }
  
  async getMetadata(key: string) {
    return getFileMetadata(key);
  }
}

export default S3Storage;
