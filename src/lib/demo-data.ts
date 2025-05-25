import type { Client, Asset, Template, Campaign, Matrix } from '@/types/models';

// Demo Clients
export const demoClients: Client[] = [
  {
    id: 'client-1',
    name: 'TechCorp Solutions',
    industry: 'Technology',
    logo: 'https://ui-avatars.com/api/?name=TechCorp&background=2196F3&color=fff&size=200',
    primaryColor: '#2196F3',
    secondaryColor: '#FF9800',
    description: 'Leading technology solutions provider specializing in cloud infrastructure and AI.',
    website: 'https://techcorp.example.com',
    socialMedia: {
      instagram: '@techcorp',
      linkedin: 'techcorp-solutions',
      twitter: '@techcorp',
    },
    contacts: [
      {
        id: 'contact-1',
        name: 'Sarah Johnson',
        role: 'Marketing Director',
        email: 'sarah.johnson@techcorp.com',
        phone: '+1 555-0123',
        isActive: true,
      },
    ],
    brandGuidelines: {
      voiceTone: 'Professional, innovative, and approachable',
      targetAudience: 'B2B technology decision makers',
      keyMessages: [
        'Cutting-edge innovation',
        'Reliable cloud solutions',
        'Expert support team',
      ],
      colors: {
        primary: '#2196F3',
        secondary: '#FF9800',
        accent: '#4CAF50',
        background: '#F5F5F5',
        text: '#333333',
      },
      typography: {
        headingFont: 'Roboto',
        bodyFont: 'Open Sans',
      },
    },
    tenantId: 'tenant-1',
    isActive: true,
    dateCreated: '2024-01-15T10:00:00Z',
    lastModified: '2024-12-01T15:30:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
  {
    id: 'client-2',
    name: 'Eco Green Foods',
    industry: 'Food & Beverage',
    logo: 'https://ui-avatars.com/api/?name=Eco+Green&background=4CAF50&color=fff&size=200',
    primaryColor: '#4CAF50',
    secondaryColor: '#8BC34A',
    description: 'Sustainable organic food products for health-conscious consumers.',
    website: 'https://ecogreen.example.com',
    socialMedia: {
      instagram: '@ecogreenfoods',
      facebook: 'ecogreenfoods',
      youtube: 'ecogreenfoods',
    },
    contacts: [
      {
        id: 'contact-2',
        name: 'Michael Chen',
        role: 'Brand Manager',
        email: 'michael.chen@ecogreen.com',
        isActive: true,
      },
    ],
    brandGuidelines: {
      voiceTone: 'Fresh, friendly, and health-conscious',
      targetAudience: 'Health-conscious consumers aged 25-45',
      keyMessages: [
        '100% organic ingredients',
        'Sustainable farming practices',
        'Healthy lifestyle choice',
      ],
      colors: {
        primary: '#4CAF50',
        secondary: '#8BC34A',
        accent: '#FFC107',
        background: '#FFFFFF',
        text: '#2E7D32',
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Lato',
      },
    },
    tenantId: 'tenant-1',
    isActive: true,
    dateCreated: '2024-02-20T11:00:00Z',
    lastModified: '2024-11-15T14:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
];

// Demo Assets with working placeholder images
export const demoAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Product Hero Image',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    clientId: 'client-1',
    tags: ['hero', 'product', 'homepage'],
    status: 'active',
    permissions: {
      public: false,
      userIds: ['user-1'],
      roleIds: ['admin', 'editor'],
    },
    metadata: {
      fileSize: '2.5MB',
      dimensions: '1920x1080',
      format: 'JPEG',
      width: 1920,
      height: 1080,
      mimeType: 'image/jpeg',
      aiGenerated: false,
    },
    dateCreated: '2024-03-01T09:00:00Z',
    lastModified: '2024-03-01T09:00:00Z',
    createdBy: 'user-1',
    version: 1,
  },
  {
    id: 'asset-2',
    name: 'AI Generated Office Space',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=400&fit=crop',
    clientId: 'client-1',
    tags: ['office', 'workspace', 'ai-generated'],
    status: 'active',
    permissions: {
      public: false,
      userIds: ['user-1'],
      roleIds: ['admin', 'editor'],
    },
    metadata: {
      fileSize: '1.8MB',
      dimensions: '1024x1024',
      format: 'PNG',
      width: 1024,
      height: 1024,
      mimeType: 'image/png',
      aiGenerated: true,
      aiPrompt: 'Modern office space with natural lighting, minimalist design, plants',
    },
    dateCreated: '2024-11-20T14:30:00Z',
    lastModified: '2024-11-20T14:30:00Z',
    createdBy: 'user-1',
    version: 1,
  },
  {
    id: 'asset-3',
    name: 'Organic Salad Bowl',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    clientId: 'client-2',
    tags: ['food', 'organic', 'healthy'],
    status: 'active',
    permissions: {
      public: false,
      userIds: ['user-1'],
      roleIds: ['admin', 'editor'],
    },
    metadata: {
      fileSize: '3.2MB',
      dimensions: '2000x1500',
      format: 'JPEG',
      width: 2000,
      height: 1500,
      mimeType: 'image/jpeg',
      aiGenerated: false,
    },
    dateCreated: '2024-04-10T11:00:00Z',
    lastModified: '2024-04-10T11:00:00Z',
    createdBy: 'user-1',
    version: 1,
  },
];

// Demo Templates with working placeholder images
export const demoTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Instagram Post - Product Feature',
    platform: 'Instagram',
    aspectRatio: '1:1',
    description: 'Eye-catching product feature post for Instagram feed',
    thumbnail: 'https://via.placeholder.com/400x400/2196F3/FFFFFF?text=Instagram+Template',
    category: 'Social Media',
    industry: 'Technology',
    contentType: 'Product',
    dimensions: '1080x1080',
    recommendedUsage: 'Product launches, feature highlights',
    usageCount: 45,
    performance: {
      views: 15000,
      engagement: 1200,
      conversion: 150,
      score: 8.5,
    },
    dynamicFields: [
      {
        id: 'field-1',
        name: 'headline',
        type: 'text',
        required: true,
        description: 'Main headline text',
        defaultValue: 'Introducing',
        constraints: {
          maxLength: 50,
        },
      },
      {
        id: 'field-2',
        name: 'productImage',
        type: 'image',
        required: true,
        description: 'Product image',
      },
    ],
    isCreatomate: false,
    clientId: 'client-1',
    dateCreated: '2024-01-20T10:00:00Z',
    lastModified: '2024-01-20T10:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
  {
    id: 'template-2',
    name: 'Facebook Ad - Carousel',
    platform: 'Facebook',
    aspectRatio: '16:9',
    description: 'Multi-product carousel ad for Facebook',
    thumbnail: 'https://via.placeholder.com/600x315/4CAF50/FFFFFF?text=Facebook+Carousel',
    category: 'Social Media',
    industry: 'E-commerce',
    contentType: 'Advertisement',
    dimensions: '1200x628',
    recommendedUsage: 'Product collections, seasonal campaigns',
    usageCount: 32,
    performance: {
      views: 25000,
      engagement: 2100,
      conversion: 320,
      score: 9.2,
    },
    dynamicFields: [
      {
        id: 'field-3',
        name: 'title',
        type: 'text',
        required: true,
        description: 'Ad title',
        defaultValue: 'Shop Now',
        constraints: {
          maxLength: 40,
        },
      },
    ],
    isCreatomate: true,
    creatomateId: 'creat-template-1',
    clientId: 'client-2',
    dateCreated: '2024-02-15T11:00:00Z',
    lastModified: '2024-02-15T11:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
];

// Demo Campaigns
export const demoCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: 'Spring Product Launch 2024',
    description: 'Launch campaign for new cloud infrastructure product line',
    clientId: 'client-1',
    status: 'active',
    schedule: {
      startDate: '2024-03-01T00:00:00Z',
      endDate: '2024-04-30T23:59:59Z',
      timezone: 'America/New_York',
      frequency: 'daily',
    },
    budget: {
      total: 50000,
      spent: 32500,
      currency: 'USD',
    },
    targeting: {
      platforms: ['Instagram', 'LinkedIn', 'Facebook'],
      demographics: {
        ageRanges: ['25-34', '35-44', '45-54'],
        genders: ['all'],
      },
      locations: {
        countries: ['US', 'CA'],
        regions: ['California', 'New York', 'Texas'],
      },
      interests: ['Technology', 'Cloud Computing', 'AI'],
    },
    content: [],
    tags: ['product-launch', 'spring-2024', 'cloud'],
    objective: 'Drive awareness and signups for new cloud platform',
    dateCreated: '2024-02-15T10:00:00Z',
    lastModified: '2024-03-15T14:30:00Z',
    createdBy: 'user-1',
    version: 2,
    metadata: {},
  },
  {
    id: 'campaign-2',
    name: 'Healthy Summer Recipe Series',
    description: 'Content series featuring summer recipes with organic ingredients',
    clientId: 'client-2',
    status: 'draft',
    targeting: {
      platforms: ['Instagram', 'YouTube', 'TikTok'],
      demographics: {
        ageRanges: ['18-24', '25-34', '35-44'],
        genders: ['all'],
      },
      interests: ['Healthy Eating', 'Cooking', 'Organic Food'],
    },
    content: [],
    tags: ['recipes', 'summer', 'organic'],
    objective: 'Increase brand engagement and drive product sales',
    dateCreated: '2024-04-01T09:00:00Z',
    lastModified: '2024-04-05T11:00:00Z',
    createdBy: 'user-1',
    version: 1,
    metadata: {},
  },
];

// Demo Matrix
export const demoMatrices: Matrix[] = [
  {
    id: 'matrix-1',
    name: 'Product Launch Social Media Matrix',
    description: 'Content variations for product launch across social platforms',
    clientId: 'client-1',
    templateId: 'template-1',
    status: 'approved',
    variations: [
      { id: 'var-1', name: 'Version A', isActive: true, isDefault: true },
      { id: 'var-2', name: 'Version B', isActive: true },
      { id: 'var-3', name: 'Version C', isActive: true },
    ],
    combinations: [
      {
        id: 'combo-1',
        name: 'A - Primary',
        variationIds: ['var-1'],
        isSelected: true,
        performanceScore: 8.5,
      },
      {
        id: 'combo-2',
        name: 'B - Alternative',
        variationIds: ['var-2'],
        isSelected: true,
        performanceScore: 7.8,
      },
    ],
    fieldAssignments: {
      'field-1': {
        status: 'completed',
        content: [
          { id: 'content-1', variationId: 'var-1', content: 'Introducing CloudPro X' },
          { id: 'content-2', variationId: 'var-2', content: 'Next-Gen Cloud Solution' },
          { id: 'content-3', variationId: 'var-3', content: 'Transform Your Infrastructure' },
        ],
      },
      'field-2': {
        status: 'completed',
        assets: [
          { variationId: 'var-1', assetId: 'asset-1' },
          { variationId: 'var-2', assetId: 'asset-2' },
        ],
      },
    },
    approvalStatus: {
      status: 'approved',
      approvedBy: 'user-1',
      approvalDate: '2024-02-28T16:00:00Z',
      comments: 'Looks great! Ready for launch.',
    },
    dateCreated: '2024-02-20T10:00:00Z',
    lastModified: '2024-02-28T16:00:00Z',
    createdBy: 'user-1',
    version: 3,
    metadata: {},
  },
];

// Helper function to check if we're in demo mode
export const isDemoMode = (): boolean => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || 
         (!process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NODE_ENV === 'development');
};

// Demo data getters with simulated async behavior
export const getDemoClients = async (): Promise<Client[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  return demoClients;
};

export const getDemoAssets = async (clientId?: string): Promise<Asset[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (clientId) {
    return demoAssets.filter(asset => asset.clientId === clientId);
  }
  return demoAssets;
};

export const getDemoTemplates = async (): Promise<Template[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  return demoTemplates;
};

export const getDemoCampaigns = async (clientId?: string): Promise<Campaign[]> => {
  await new Promise(resolve => setTimeout(resolve, 350));
  if (clientId) {
    return demoCampaigns.filter(campaign => campaign.clientId === clientId);
  }
  return demoCampaigns;
};

export const getDemoMatrices = async (clientId?: string): Promise<Matrix[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  if (clientId) {
    return demoMatrices.filter(matrix => matrix.clientId === clientId);
  }
  return demoMatrices;
};
