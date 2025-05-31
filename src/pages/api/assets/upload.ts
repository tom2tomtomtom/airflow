import { getErrorMessage } from '@/utils/errorUtils';
import { NextApiRequest, NextApiResponse } from 'next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface UploadResponse {
  success: boolean;
  assets?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
    storage_path: string;
  }>;
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>
): Promise<void> {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get user from headers (set by middleware)
    const userId = req.headers['x-user-id'] as string;
    const clientId = req.headers['x-client-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Parse the multipart form data
    const form = formidable({
      maxFileSize: 100 * 1024 * 1024, // 100MB
      maxFiles: 10,
    });

    const [fields, files] = await form.parse(req);
    const fileArray = Array.isArray(files.files) ? files.files : [files.files].filter(Boolean);
    
    if (!fileArray.length) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    const uploadedAssets = [];

    for (const file of fileArray) {
      if (!file) continue;

      try {
        // Read file content
        const fileContent = fs.readFileSync(file.filepath);
        
        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const ext = path.extname(file.originalFilename || '');
        const filename = `${timestamp}_${randomId}${ext}`;
        const storagePath = `${userId}/${filename}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(storagePath, fileContent, {
            contentType: file.mimetype || 'application/octet-stream',
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('assets')
          .getPublicUrl(storagePath);

        // Determine asset type
        let assetType = 'other';
        if (file.mimetype?.startsWith('image/')) assetType = 'image';
        else if (file.mimetype?.startsWith('video/')) assetType = 'video';
        else if (file.mimetype?.startsWith('audio/')) assetType = 'audio';
        else if (file.mimetype?.includes('text')) assetType = 'text';

        // Save asset metadata to database
        const { data: assetData, error: dbError } = await supabase
          .from('assets')
          .insert({
            name: file.originalFilename || filename,
            type: assetType,
            mime_type: file.mimetype || 'application/octet-stream',
            file_size: file.size,
            file_url: urlData.publicUrl,
            client_id: clientId || null,
            created_by: userId,
            metadata: {
              original_filename: file.originalFilename,
              uploaded_at: new Date().toISOString(),
              storage_path: storagePath
            }
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Try to clean up uploaded file
          await supabase.storage.from('assets').remove([storagePath]);
          continue;
        }

        uploadedAssets.push({
          id: assetData.id,
          name: assetData.name,
          type: assetData.type,
          size: assetData.file_size,
          url: assetData.file_url,
          storage_path: storagePath,
        });

      } catch (error) {
    const message = getErrorMessage(error);
        console.error('Error processing file:', file.originalFilename, error);
        continue;
      } finally {
        // Clean up temporary file
        try {
          fs.unlinkSync(file.filepath);
        } catch (cleanupError) {
          console.warn('Failed to cleanup temp file:', cleanupError);
        }
      }
    }

    if (uploadedAssets.length === 0) {
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to upload any files' 
      });
    }

    return res.status(200).json({
      success: true,
      assets: uploadedAssets,
      message: `Successfully uploaded ${uploadedAssets.length} file(s)`
    });

  } catch (error) {
    const message = getErrorMessage(error);
    console.error('Upload API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}