#!/usr/bin/env node

/**
 * AIrWAVE Database Seeder - Add Fake Client Data
 * This script adds realistic fake data to test all functionality
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Fake data
const FAKE_CLIENTS = [
  {
    name: 'TechFlow Solutions',
    slug: 'techflow-solutions',
    industry: 'Technology',
    description: 'Leading software development company specializing in AI and automation solutions for enterprise clients.',
    website: 'https://techflow-solutions.com',
    logo_url: 'https://via.placeholder.com/200x200/1976d2/ffffff?text=TF',
    primary_color: '#1976d2',
    secondary_color: '#ffc107',
    social_media: {
      twitter: '@techflowsolutions',
      linkedin: 'techflow-solutions',
      facebook: 'techflowsolutions',
      instagram: '@techflow_solutions'
    },
    brand_guidelines: {
      voiceTone: 'Professional, innovative, and approachable. We speak with confidence about technology while remaining accessible to non-technical audiences.',
      targetAudience: 'Enterprise decision-makers, CTOs, IT directors, and business leaders looking to modernize their operations.',
      keyMessages: [
        'Transform your business with cutting-edge AI solutions',
        'Automation that scales with your growth',
        'Enterprise-grade security and reliability',
        'Expert guidance from concept to deployment'
      ],
      brandPersonality: ['Innovative', 'Reliable', 'Expert', 'Forward-thinking'],
      contentThemes: ['Digital Transformation', 'AI Innovation', 'Business Automation', 'Technology Leadership']
    },
    is_active: true
  },
  {
    name: 'GreenEarth Organics',
    slug: 'greenearth-organics',
    industry: 'Food & Beverage',
    description: 'Sustainable organic food producer committed to environmental responsibility and healthy living.',
    website: 'https://greenearth-organics.com',
    logo_url: 'https://via.placeholder.com/200x200/4caf50/ffffff?text=GE',
    primary_color: '#4caf50',
    secondary_color: '#ff9800',
    social_media: {
      twitter: '@greenearth_org',
      linkedin: 'greenearth-organics',
      facebook: 'greenearthorganics',
      instagram: '@greenearth_organics'
    },
    brand_guidelines: {
      voiceTone: 'Warm, authentic, and passionate about sustainability. We communicate with care about both people and the planet.',
      targetAudience: 'Health-conscious consumers, environmentally aware families, and organic food enthusiasts.',
      keyMessages: [
        'Pure, organic nutrition for your family',
        'Sustainably grown, responsibly sourced',
        'Supporting local farmers and communities',
        'Taste the difference that care makes'
      ],
      brandPersonality: ['Authentic', 'Caring', 'Sustainable', 'Natural'],
      contentThemes: ['Organic Living', 'Sustainability', 'Healthy Recipes', 'Farm-to-Table']
    },
    is_active: true
  },
  {
    name: 'UrbanFit Studios',
    slug: 'urbanfit-studios',
    industry: 'Health & Wellness',
    description: 'Modern fitness studio chain offering personalized training and wellness programs in urban environments.',
    website: 'https://urbanfit-studios.com',
    logo_url: 'https://via.placeholder.com/200x200/e91e63/ffffff?text=UF',
    primary_color: '#e91e63',
    secondary_color: '#00bcd4',
    social_media: {
      twitter: '@urbanfitstudios',
      linkedin: 'urbanfit-studios',
      facebook: 'urbanfitstudios',
      instagram: '@urbanfit_studios'
    },
    brand_guidelines: {
      voiceTone: 'Energetic, motivating, and supportive. We inspire action while building a welcoming community.',
      targetAudience: 'Urban professionals, fitness enthusiasts, and individuals starting their wellness journey.',
      keyMessages: [
        'Your fitness journey starts here',
        'Community-driven wellness programs',
        'Expert trainers, personalized approach',
        'Fit your workout into your lifestyle'
      ],
      brandPersonality: ['Energetic', 'Supportive', 'Professional', 'Inclusive'],
      contentThemes: ['Fitness Training', 'Wellness Tips', 'Community Success', 'Healthy Lifestyle']
    },
    is_active: true
  }
];

const FAKE_CONTACTS = [
  // TechFlow Solutions contacts
  {
    name: 'Sarah Chen',
    role: 'Chief Marketing Officer',
    email: 'sarah.chen@techflow-solutions.com',
    phone: '+1 (555) 123-4567',
    is_primary: true,
    is_active: true
  },
  {
    name: 'Mike Rodriguez',
    role: 'VP of Product Marketing',
    email: 'mike.rodriguez@techflow-solutions.com',
    phone: '+1 (555) 123-4568',
    is_primary: false,
    is_active: true
  },
  // GreenEarth Organics contacts
  {
    name: 'Emma Thompson',
    role: 'Brand Manager',
    email: 'emma.thompson@greenearth-organics.com',
    phone: '+1 (555) 234-5678',
    is_primary: true,
    is_active: true
  },
  {
    name: 'David Park',
    role: 'Marketing Director',
    email: 'david.park@greenearth-organics.com',
    phone: '+1 (555) 234-5679',
    is_primary: false,
    is_active: true
  },
  // UrbanFit Studios contacts
  {
    name: 'Jessica Miller',
    role: 'Marketing Manager',
    email: 'jessica.miller@urbanfit-studios.com',
    phone: '+1 (555) 345-6789',
    is_primary: true,
    is_active: true
  },
  {
    name: 'Alex Johnson',
    role: 'Community Outreach Manager',
    email: 'alex.johnson@urbanfit-studios.com',
    phone: '+1 (555) 345-6790',
    is_primary: false,
    is_active: true
  }
];

const FAKE_CAMPAIGNS = [
  {
    name: 'AI Innovation Summit 2024',
    description: 'Comprehensive campaign for our annual AI summit, featuring thought leadership content and event promotion.',
    objective: 'Generate 500+ qualified leads and establish TechFlow as an AI thought leader',
    target_audience: 'Enterprise CTOs, IT Directors, and Technology Leaders',
    budget: 75000,
    status: 'active',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    platforms: ['LinkedIn', 'Twitter', 'Google Ads', 'Email'],
    is_active: true
  },
  {
    name: 'Organic Harvest Festival',
    description: 'Seasonal campaign promoting our new organic product line with farm-to-table messaging.',
    objective: 'Increase brand awareness by 25% and drive 30% sales growth for new product line',
    target_audience: 'Health-conscious families, organic food enthusiasts aged 25-55',
    budget: 45000,
    status: 'planning',
    start_date: '2024-04-15',
    end_date: '2024-07-15',
    platforms: ['Instagram', 'Facebook', 'Pinterest', 'Email'],
    is_active: true
  },
  {
    name: 'New Year New You',
    description: 'Motivational fitness campaign targeting New Year resolution makers with special membership offers.',
    objective: 'Acquire 200 new members and increase class attendance by 40%',
    target_audience: 'Urban professionals aged 25-45 interested in starting fitness journey',
    budget: 35000,
    status: 'completed',
    start_date: '2024-01-01',
    end_date: '2024-02-29',
    platforms: ['Instagram', 'TikTok', 'Google Ads', 'Local Radio'],
    is_active: true
  }
];

async function seedDatabase() {
  console.log('🌱 Starting AIrWAVE database seeding...');
  console.log('=====================================');

  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('count(*)', { count: 'exact', head: true });

    if (testError) {
      throw new Error(`Connection failed: ${testError.message}`);
    }
    console.log('✅ Connected to Supabase successfully');

    // Clear existing fake data (optional)
    console.log('🧹 Cleaning up existing fake data...');
    await supabase.from('campaigns').delete().in('name', FAKE_CAMPAIGNS.map(c => c.name));
    await supabase.from('client_contacts').delete().in('email', FAKE_CONTACTS.map(c => c.email));
    await supabase.from('clients').delete().in('slug', FAKE_CLIENTS.map(c => c.slug));

    // Create fake clients
    console.log('👥 Creating fake clients...');
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .insert(FAKE_CLIENTS)
      .select();

    if (clientsError) {
      throw new Error(`Failed to create clients: ${clientsError.message}`);
    }

    console.log(`✅ Created ${clients.length} clients:`);
    clients.forEach(client => {
      console.log(`   - ${client.name} (${client.industry})`);
    });

    // Create fake contacts
    console.log('📞 Creating fake contacts...');
    const contactsWithClientIds = FAKE_CONTACTS.map((contact, index) => ({
      ...contact,
      client_id: clients[Math.floor(index / 2)].id // 2 contacts per client
    }));

    const { data: contacts, error: contactsError } = await supabase
      .from('client_contacts')
      .insert(contactsWithClientIds)
      .select();

    if (contactsError) {
      throw new Error(`Failed to create contacts: ${contactsError.message}`);
    }

    console.log(`✅ Created ${contacts.length} contacts`);

    // Create fake campaigns
    console.log('📈 Creating fake campaigns...');
    const campaignsWithClientIds = FAKE_CAMPAIGNS.map((campaign, index) => ({
      ...campaign,
      client_id: clients[index].id
    }));

    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .insert(campaignsWithClientIds)
      .select();

    if (campaignsError) {
      throw new Error(`Failed to create campaigns: ${campaignsError.message}`);
    }

    console.log(`✅ Created ${campaigns.length} campaigns:`);
    campaigns.forEach(campaign => {
      console.log(`   - ${campaign.name} (${campaign.status})`);
    });

    // Create some fake assets
    console.log('🖼️ Creating fake assets...');
    const FAKE_ASSETS = [
      {
        name: 'AI Summit Hero Image',
        description: 'Main hero image for AI Innovation Summit landing page',
        file_path: 'https://via.placeholder.com/1200x600/1976d2/ffffff?text=AI+Summit+2024',
        file_size: 245760,
        file_type: 'image/png',
        category: 'hero-images',
        tags: ['ai', 'summit', 'hero', 'technology'],
        client_id: clients[0].id,
        is_active: true
      },
      {
        name: 'Organic Vegetables Photo',
        description: 'High-quality photo of fresh organic vegetables for social media',
        file_path: 'https://via.placeholder.com/800x600/4caf50/ffffff?text=Fresh+Organic+Vegetables',
        file_size: 187520,
        file_type: 'image/jpeg',
        category: 'product-photos',
        tags: ['organic', 'vegetables', 'fresh', 'healthy'],
        client_id: clients[1].id,
        is_active: true
      },
      {
        name: 'Fitness Class Action Shot',
        description: 'Dynamic photo of fitness class in session for website banner',
        file_path: 'https://via.placeholder.com/1000x667/e91e63/ffffff?text=Fitness+Class+Action',
        file_size: 312400,
        file_type: 'image/jpeg',
        category: 'lifestyle-photos',
        tags: ['fitness', 'class', 'action', 'workout'],
        client_id: clients[2].id,
        is_active: true
      }
    ];

    const { data: assets, error: assetsError } = await supabase
      .from('assets')
      .insert(FAKE_ASSETS)
      .select();

    if (assetsError) {
      console.warn(`⚠️ Could not create assets: ${assetsError.message}`);
    } else {
      console.log(`✅ Created ${assets.length} assets`);
    }

    console.log('');
    console.log('🎉 Database seeding completed successfully!');
    console.log('=====================================');
    console.log('');
    console.log('📋 Summary:');
    console.log(`   • ${clients.length} fake clients created`);
    console.log(`   • ${contacts.length} fake contacts created`);
    console.log(`   • ${campaigns.length} fake campaigns created`);
    console.log(`   • ${assets?.length || 0} fake assets created`);
    console.log('');
    console.log('🚀 You can now test all AIrWAVE functionality:');
    console.log('   • Client management (/clients)');
    console.log('   • Campaign creation (/campaigns)');
    console.log('   • Asset management (/assets)');
    console.log('   • Template system (/templates)');
    console.log('   • AI content generation (/generate)');
    console.log('');
    console.log('💡 Login and navigate to different sections to see the data!');

  } catch (error) {
    console.error('💥 Seeding failed:', error.message);
    console.error('');
    console.error('🔍 Troubleshooting:');
    console.error('   • Check your .env.local file has correct Supabase credentials');
    console.error('   • Ensure SUPABASE_SERVICE_ROLE_KEY is set (not just anon key)');
    console.error('   • Verify your Supabase database tables exist');
    console.error('   • Check Row Level Security (RLS) policies if enabled');
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
