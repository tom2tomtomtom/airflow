require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function seedData() {
  console.log('Starting data seed...');

  try {
    // 1. Create test user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@airwave.com',
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        full_name: 'Demo User'
      }
    });

    if (authError) throw authError;
    console.log('✓ Created demo user');

    const userId = authData.user.id;

    // 2. Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: 'demo@airwave.com',
        full_name: 'Demo User',
        role: 'admin'
      });

    if (profileError) throw profileError;
    console.log('✓ Created user profile');

    // 3. Create sample clients
    const clients = [
      {
        name: 'TechStart Inc',
        slug: 'techstart-inc',
        industry: 'Technology',
        description: 'Innovative tech startup focused on AI solutions',
        website: 'https://techstart.example.com',
        primary_color: '#3a86ff',
        secondary_color: '#8338ec',
        created_by: userId,
        social_media: {
          instagram: '@techstart',
          twitter: '@techstartai',
          linkedin: 'techstart-inc'
        },
        brand_guidelines: {
          voiceTone: 'Professional, innovative, approachable',
          targetAudience: 'Tech professionals, early adopters',
          keyMessages: [
            'AI-powered solutions for modern businesses',
            'Innovation meets simplicity',
            'Your partner in digital transformation'
          ]
        }
      },
      {
        name: 'EcoLife Products',
        slug: 'ecolife-products',
        industry: 'Retail',
        description: 'Sustainable products for conscious consumers',
        website: 'https://ecolife.example.com',
        primary_color: '#06d6a0',
        secondary_color: '#ffbe0b',
        created_by: userId,
        social_media: {
          instagram: '@ecolifeproducts',
          facebook: 'ecolifeproducts',
          pinterest: 'ecolife'
        },
        brand_guidelines: {
          voiceTone: 'Friendly, educational, passionate',
          targetAudience: 'Environmentally conscious consumers',
          keyMessages: [
            'Sustainable living made simple',
            'Every choice matters',
            'Join the eco revolution'
          ]
        }
      }
    ];

    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .insert(clients)
      .select();

    if (clientsError) throw clientsError;
    console.log('✓ Created sample clients');

    // 4. Create contacts for each client
    const contacts = [];
    clientsData.forEach(client => {
      contacts.push({
        client_id: client.id,
        name: 'John Smith',
        role: 'Marketing Director',
        email: `john@${client.slug}.com`,
        phone: '+1 (555) 123-4567',
        is_primary: true
      });
    });

    const { error: contactsError } = await supabase
      .from('client_contacts')
      .insert(contacts);

    if (contactsError) throw contactsError;
    console.log('✓ Created client contacts');

    // 5. Create sample templates
    const templates = [
      {
        name: 'Instagram Story - Product Feature',
        platform: 'instagram',
        aspect_ratio: '9:16',
        dimensions: '1080x1920',
        description: 'Eye-catching story template for product features',
        category: 'Product',
        content_type: 'story',
        created_by: userId,
        is_public: true,
        dynamic_fields: [
          {
            id: 'headline',
            name: 'Headline',
            type: 'text',
            required: true,
            constraints: { maxLength: 50 }
          },
          {
            id: 'product_image',
            name: 'Product Image',
            type: 'image',
            required: true
          },
          {
            id: 'cta_text',
            name: 'Call to Action',
            type: 'text',
            required: true,
            constraints: { maxLength: 20 }
          }
        ]
      },
      {
        name: 'Facebook Ad - Carousel',
        platform: 'facebook',
        aspect_ratio: '1:1',
        dimensions: '1080x1080',
        description: 'Multi-product carousel ad template',
        category: 'Advertisement',
        content_type: 'ad',
        created_by: userId,
        is_public: true,
        dynamic_fields: [
          {
            id: 'headline',
            name: 'Ad Headline',
            type: 'text',
            required: true,
            constraints: { maxLength: 40 }
          },
          {
            id: 'description',
            name: 'Ad Description',
            type: 'text',
            required: true,
            constraints: { maxLength: 125 }
          }
        ]
      }
    ];

    const { error: templatesError } = await supabase
      .from('templates')
      .insert(templates);

    if (templatesError) throw templatesError;
    console.log('✓ Created sample templates');

    console.log('\n✅ Data seeding completed successfully!');
    console.log('\nYou can now log in with:');
    console.log('Email: demo@airwave.com');
    console.log('Password: demo123456');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
