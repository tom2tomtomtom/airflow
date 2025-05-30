const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupStorageBucket() {
  console.log('🗄️ Setting up AIrWAVE Storage Bucket...');
  
  try {
    // Check if assets bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    const assetsBucket = buckets.find(bucket => bucket.name === 'assets');
    
    if (assetsBucket) {
      console.log('✅ Assets bucket already exists');
    } else {
      // Create assets bucket
      console.log('📦 Creating assets bucket...');
      const { data, error } = await supabase.storage.createBucket('assets', {
        public: true
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error);
        return;
      }
      
      console.log('✅ Assets bucket created successfully');
    }
    
    // Set up storage policies
    console.log('🔒 Setting up storage policies...');
    
    const policies = [
      {
        name: 'Allow authenticated uploads',
        sql: `
          CREATE POLICY "Allow authenticated uploads" ON storage.objects 
          FOR INSERT WITH CHECK (
            bucket_id = 'assets' AND 
            auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Allow public downloads',
        sql: `
          CREATE POLICY "Allow public downloads" ON storage.objects 
          FOR SELECT USING (bucket_id = 'assets');
        `
      },
      {
        name: 'Allow authenticated deletes',
        sql: `
          CREATE POLICY "Allow authenticated deletes" ON storage.objects 
          FOR DELETE USING (
            bucket_id = 'assets' AND 
            auth.uid()::text = owner
          );
        `
      }
    ];
    
    for (const policy of policies) {
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️ Policy "${policy.name}":`, error.message);
        } else {
          console.log(`✅ Policy "${policy.name}" configured`);
        }
      } catch (err) {
        console.log(`ℹ️ Policy "${policy.name}" may already exist`);
      }
    }
    
    console.log('🎉 Storage setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupStorageBucket();