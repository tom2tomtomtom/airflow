/**
 * AIrWAVE Storage Bucket Setup Script
 * 
 * This script helps you set up the storage bucket in Supabase.
 * Since bucket creation requires Dashboard access, this script
 * provides the exact configuration you need.
 */

const bucketConfig = {
  name: 'assets',
  public: true,
  allowedMimeTypes: [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'image/x-icon',
    
    // Videos
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-ms-wmv',
    'video/x-flv',
    'video/webm',
    'video/x-matroska',
    'video/x-m4v',
    
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/aac',
    'audio/ogg',
    'audio/flac',
    'audio/x-m4a',
    
    // Documents
    'text/plain',
    'text/csv',
    'text/markdown',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf'
  ],
  fileSizeLimit: 104857600, // 100MB in bytes
  corsRules: [
    {
      "origin": ["*"],
      "methods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "headers": ["*"],
      "maxAge": 3600
    }
  ]
};

console.log(`
========================================
AIrWAVE Storage Bucket Setup Instructions
========================================

1. Go to your Supabase Dashboard
2. Navigate to Storage section
3. Click "New bucket"
4. Use these settings:

   Name: ${bucketConfig.name}
   Public: ${bucketConfig.public ? 'Yes (Enable)' : 'No'}
   File size limit: ${bucketConfig.fileSizeLimit / 1024 / 1024}MB
   Allowed MIME types: Custom list (see below)

5. After creating the bucket, click on it and go to "Policies"
6. Add these RLS policies:

   POLICY: "Allow authenticated users to upload"
   Operation: INSERT
   Target roles: authenticated
   WITH CHECK: true

   POLICY: "Allow authenticated users to update their own uploads"
   Operation: UPDATE
   Target roles: authenticated
   USING: (auth.uid() = owner)
   WITH CHECK: (auth.uid() = owner)

   POLICY: "Allow public to view"
   Operation: SELECT
   Target roles: anon, authenticated
   USING: true

   POLICY: "Allow users to delete their own uploads"
   Operation: DELETE
   Target roles: authenticated
   USING: (auth.uid() = owner)

7. Configure CORS (in bucket settings):
`);

console.log('   CORS Configuration (paste this JSON):');
console.log(JSON.stringify(bucketConfig.corsRules, null, 2));

console.log(`
8. Allowed MIME types (add these one by one):`);
bucketConfig.allowedMimeTypes.forEach(type => {
  console.log(`   - ${type}`);
});

console.log(`
========================================
SQL to verify bucket (run after creation):
========================================

SELECT * FROM storage.buckets WHERE name = 'assets';

========================================
`);
