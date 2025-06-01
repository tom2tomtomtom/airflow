const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test user email
const TEST_EMAIL = 'tomh@redbaez.com';

async function seedTestData() {
  console.log('🌱 Starting test data seeding...');

  try {
    // 1. Find or create test user
    console.log('📧 Looking for test user...');
    const { data: profiles, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', TEST_EMAIL);

    if (userError) {
      console.error('Error fetching user profile:', userError);
      return;
    }

    let user = profiles?.[0];
    if (!user) {
      console.log('👤 Creating test user profile...');
      // For this demo, we'll create a profile with a dummy ID
      // In a real setup, this would be created after Supabase Auth signup
      const dummyUserId = '550e8400-e29b-41d4-a716-446655440000'; // Fixed UUID for testing
      
      const { data: newUser, error: createUserError } = await supabase
        .from('profiles')
        .insert({
          id: dummyUserId,
          email: TEST_EMAIL,
          full_name: 'Tom Hyde',
          role: 'admin',
          company: 'Redbaez Digital',
        })
        .select()
        .single();

      if (createUserError) {
        console.error('Error creating user profile:', createUserError);
        // If user already exists with that ID, try to fetch it
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', dummyUserId)
          .single();
        
        if (existingUser) {
          user = existingUser;
        } else {
          return;
        }
      } else {
        user = newUser;
      }
    }

    console.log(`✅ User found/created: ${user.full_name} (${user.email})`);

    // 2. Create test clients
    console.log('🏢 Creating test clients...');
    
    const testClients = [
      {
        name: 'Redbaez Digital Agency',
        slug: 'redbaez-digital',
        industry: 'Marketing & Advertising',
        description: 'Leading digital marketing agency specializing in AI-powered creative solutions',
        website: 'https://redbaez.com',
        primary_color: '#1976d2',
        secondary_color: '#dc004e',
        social_media: {
          twitter: '@redbaez',
          linkedin: 'redbaez-digital',
          facebook: 'redbaezdigital'
        },
        brand_guidelines: {
          voiceTone: 'Professional, innovative, approachable',
          targetAudience: 'Digital marketers and creative agencies',
          keyMessages: ['Innovation', 'Quality', 'Scalable Solutions']
        },
        is_active: true,
        created_by: user.id,
      },
      {
        name: 'AIrWAVE Platform',
        slug: 'airwave-platform',
        industry: 'Technology',
        description: 'AI-powered creative platform for scalable content generation',
        website: 'https://airwave-complete.netlify.app',
        primary_color: '#9c27b0',
        secondary_color: '#ff5722',
        social_media: {
          twitter: '@airwaveai',
          linkedin: 'airwave-platform'
        },
        brand_guidelines: {
          voiceTone: 'Cutting-edge, efficient, creative',
          targetAudience: 'Tech-savvy marketers and entrepreneurs',
          keyMessages: ['AI-Powered', 'Creative Scalability', 'Efficiency']
        },
        is_active: true,
        created_by: user.id,
      }
    ];

    const createdClients = [];
    for (const clientData of testClients) {
      // Check if client already exists
      const { data: existingClients } = await supabase
        .from('clients')
        .select('*')
        .eq('name', clientData.name);

      if (existingClients && existingClients.length > 0) {
        console.log(`✅ Client already exists: ${clientData.name}`);
        createdClients.push(existingClients[0]);
        continue;
      }

      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (clientError) {
        console.error(`Error creating client ${clientData.name}:`, clientError);
        continue;
      }

      console.log(`✅ Created client: ${client.name}`);
      createdClients.push(client);
    }

    // 3. Client access is managed through created_by relationship
    console.log('✅ Client access managed through created_by relationship');

    // 4. Create sample campaigns
    console.log('📈 Creating sample campaigns...');
    
    if (createdClients.length > 0) {
      const redbaezClient = createdClients.find(c => c.name.includes('Redbaez'));
      
      if (redbaezClient) {
        const campaignData = {
          name: 'AIrWAVE 2.0 Global Launch',
          description: 'Complete campaign for AIrWAVE 2.0 launch across Meta platforms',
          status: 'active',
          client_id: redbaezClient.id,
          start_date: new Date().toISOString().split('T')[0], // Date only
          end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days
          budget: 50000,
          objective: 'Increase brand awareness and generate demo signups',
          targeting: {
            primary: 'Digital marketers, creative agencies',
            demographics: 'Mid-to-senior decision makers',
            interests: ['Marketing technology', 'AI tools', 'Creative automation'],
            platforms: ['Meta', 'LinkedIn', 'Twitter']
          },
          tags: ['launch', 'ai', 'meta', 'awareness'],
          created_by: user.id,
        };

        // Check if campaign exists
        const { data: existingCampaigns } = await supabase
          .from('campaigns')
          .select('*')
          .eq('name', campaignData.name)
          .eq('client_id', redbaezClient.id);

        if (!existingCampaigns || existingCampaigns.length === 0) {
          const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert(campaignData)
            .select()
            .single();

          if (campaignError) {
            console.error('Error creating campaign:', campaignError);
          } else {
            console.log(`✅ Created campaign: ${campaign.name}`);
          }
        } else {
          console.log(`✅ Campaign already exists: ${campaignData.name}`);
        }
      }
    }

    // 5. Create sample assets
    console.log('🎨 Creating sample assets...');
    
    if (createdClients.length > 0) {
      const sampleAssets = [
        {
          name: 'AIrWAVE Logo Primary',
          asset_type: 'image',
          file_name: 'airwave-logo-primary.svg',
          file_path: '/assets/logos/airwave-logo-primary.svg',
          file_size: 15840,
          mime_type: 'image/svg+xml',
          client_id: createdClients[0].id,
          description: 'Primary logo for AIrWAVE platform',
          tags: ['logo', 'brand', 'primary'],
          dimensions: { width: 200, height: 60 },
          metadata: { usage_rights: 'unlimited' },
          ai_generated: false,
          created_by: user.id,
        },
        {
          name: 'Hero Background',
          asset_type: 'image',
          file_name: 'hero-background.jpg',
          file_path: '/assets/backgrounds/hero-background.jpg',
          file_size: 2048000,
          mime_type: 'image/jpeg',
          client_id: createdClients[0].id,
          description: 'Hero section background image',
          tags: ['background', 'hero', 'web'],
          dimensions: { width: 1920, height: 1080 },
          metadata: { usage_rights: 'web_only' },
          ai_generated: false,
          created_by: user.id,
        }
      ];

      for (const assetData of sampleAssets) {
        const { data: existingAssets } = await supabase
          .from('assets')
          .select('*')
          .eq('name', assetData.name)
          .eq('client_id', assetData.client_id);

        if (!existingAssets || existingAssets.length === 0) {
          const { data: asset, error: assetError } = await supabase
            .from('assets')
            .insert(assetData)
            .select()
            .single();

          if (assetError) {
            console.error(`Error creating asset ${assetData.name}:`, assetError);
          } else {
            console.log(`✅ Created asset: ${asset.name}`);
          }
        } else {
          console.log(`✅ Asset already exists: ${assetData.name}`);
        }
      }
    }

    console.log('🎉 Test data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- User: ${user.name} (${user.email})`);
    console.log(`- Clients: ${createdClients.length}`);
    console.log('- Campaigns: 1');
    console.log('- Assets: 2');
    console.log('\n🚀 Ready for testing!');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
}

// Run the seeding script
seedTestData();