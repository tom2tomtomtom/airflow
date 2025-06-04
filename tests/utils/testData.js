// Comprehensive test data generators for AIrWAVE platform testing

const { faker } = require('@faker-js/faker');

// User data generator
function generateUser(overrides = {}) {
  return {
    email: faker.internet.email().toLowerCase(),
    password: 'Test@1234!',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.company.name(),
    role: faker.helpers.arrayElement(['admin', 'user', 'designer', 'manager']),
    phone: faker.phone.number(),
    ...overrides
  };
}

// Client data generator
function generateClient(overrides = {}) {
  const industries = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Entertainment', 'Food & Beverage', 'Travel'];
  const brandColors = [
    { primary: '#FF6B35', secondary: '#4ECDC4' },
    { primary: '#2E86AB', secondary: '#A23B72' },
    { primary: '#7209B7', secondary: '#F72585' },
    { primary: '#00B4D8', secondary: '#0077B6' }
  ];
  
  return {
    name: faker.company.name(),
    industry: faker.helpers.arrayElement(industries),
    description: faker.company.catchPhrase(),
    website: faker.internet.url(),
    logoUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(10)}/200/200`,
    brandColors: faker.helpers.arrayElement(brandColors),
    contactName: faker.person.fullName(),
    contactEmail: faker.internet.email().toLowerCase(),
    contactPhone: faker.phone.number(),
    ...overrides
  };
}

// Brief data generator
function generateBrief(overrides = {}) {
  const objectives = [
    'Increase brand awareness',
    'Drive sales conversions',
    'Launch new product line',
    'Improve customer engagement',
    'Expand market share'
  ];
  
  const audiences = [
    'Millennials (25-40) interested in sustainable living',
    'Business professionals seeking productivity tools',
    'Parents looking for educational resources',
    'Tech-savvy early adopters',
    'Health-conscious consumers'
  ];
  
  return {
    title: `${faker.commerce.productAdjective()} ${faker.commerce.product()} Campaign`,
    productDescription: faker.commerce.productDescription(),
    targetAudience: faker.helpers.arrayElement(audiences),
    objectives: faker.helpers.arrayElements(objectives, { min: 2, max: 3 }),
    keyMessaging: faker.helpers.arrayElements([
      'Innovation meets simplicity',
      'Transform your daily routine',
      'Sustainable solutions for modern life',
      'Empowering your success',
      'Quality you can trust'
    ], { min: 2, max: 3 }),
    budget: faker.helpers.arrayElement(['$10k-25k', '$25k-50k', '$50k-100k', '$100k+']),
    timeline: faker.helpers.arrayElement(['2 weeks', '1 month', '2 months', '3 months']),
    channels: faker.helpers.arrayElements(['Social Media', 'Email', 'Display Ads', 'Video', 'Print'], { min: 2, max: 4 }),
    ...overrides
  };
}

// Campaign data generator
function generateCampaign(overrides = {}) {
  const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter', 'YouTube', 'TikTok'];
  
  return {
    name: `${faker.commerce.productAdjective()} ${faker.date.month()} Campaign`,
    description: faker.marketing.catchPhrase(),
    objectives: faker.helpers.arrayElements([
      'Brand Awareness',
      'Lead Generation',
      'Sales Conversion',
      'Customer Retention',
      'Product Launch'
    ], { min: 1, max: 3 }),
    platforms: faker.helpers.arrayElements(platforms, { min: 2, max: 4 }),
    startDate: faker.date.future(),
    endDate: faker.date.future({ years: 1 }),
    status: faker.helpers.arrayElement(['draft', 'active', 'scheduled', 'completed']),
    ...overrides
  };
}

// Asset metadata generator
function generateAsset(type = 'image', overrides = {}) {
  const assetTypes = {
    image: {
      fileName: `${faker.word.adjective()}-${faker.word.noun()}.jpg`,
      mimeType: faker.helpers.arrayElement(['image/jpeg', 'image/png', 'image/webp']),
      size: faker.number.int({ min: 100000, max: 5000000 }),
      dimensions: { 
        width: faker.helpers.arrayElement([1920, 1080, 1200, 800]), 
        height: faker.helpers.arrayElement([1080, 1920, 800, 600]) 
      },
      tags: faker.helpers.arrayElements(['hero', 'banner', 'product', 'lifestyle', 'background'], { min: 1, max: 3 })
    },
    video: {
      fileName: `${faker.word.adjective()}-${faker.word.noun()}.mp4`,
      mimeType: 'video/mp4',
      size: faker.number.int({ min: 5000000, max: 50000000 }),
      duration: faker.number.int({ min: 5, max: 120 }),
      dimensions: { width: 1920, height: 1080 },
      tags: faker.helpers.arrayElements(['promo', 'tutorial', 'social', 'commercial'], { min: 1, max: 2 })
    },
    audio: {
      fileName: `${faker.word.adjective()}-${faker.word.noun()}.mp3`,
      mimeType: 'audio/mp3',
      size: faker.number.int({ min: 1000000, max: 10000000 }),
      duration: faker.number.int({ min: 30, max: 180 }),
      tags: faker.helpers.arrayElements(['voiceover', 'music', 'sfx', 'podcast'], { min: 1, max: 2 })
    },
    document: {
      fileName: `${faker.word.adjective()}-${faker.word.noun()}.pdf`,
      mimeType: 'application/pdf',
      size: faker.number.int({ min: 50000, max: 2000000 }),
      pages: faker.number.int({ min: 1, max: 20 }),
      tags: faker.helpers.arrayElements(['brief', 'report', 'guide', 'presentation'], { min: 1, max: 2 })
    }
  };
  
  const baseAsset = {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    uploadedAt: faker.date.recent(),
    uploadedBy: faker.person.fullName(),
    favorite: faker.datatype.boolean(),
    ...assetTypes[type],
    ...overrides
  };
  
  return baseAsset;
}

// Copy variation generator
function generateCopyVariation(motivation, overrides = {}) {
  const tones = ['professional', 'casual', 'inspirational', 'urgent', 'friendly'];
  const styles = ['direct', 'storytelling', 'question-based', 'statistic-led', 'emotional'];
  
  const templates = {
    professional: {
      direct: `Discover ${faker.company.catchPhrase()}. ${faker.commerce.productDescription()}. Start your journey today.`,
      storytelling: `Every ${faker.commerce.department()} professional knows the challenge. That's why we created ${faker.commerce.productName()} - ${faker.company.catchPhrase()}.`,
      'question-based': `Looking for ${faker.commerce.productAdjective()} solutions? ${faker.commerce.productName()} delivers ${faker.company.catchPhrase()}.`
    },
    casual: {
      direct: `Hey! Check out ${faker.commerce.productName()} - ${faker.company.buzzPhrase()}. You'll love it!`,
      storytelling: `We get it. ${faker.hacker.phrase()}. That's why ${faker.commerce.productName()} is here to help.`,
      'question-based': `Tired of ${faker.commerce.productAdjective()} problems? ${faker.commerce.productName()} has your back!`
    },
    inspirational: {
      direct: `Transform your ${faker.commerce.department()} with ${faker.commerce.productName()}. ${faker.company.catchPhrase()}.`,
      storytelling: `Imagine a world where ${faker.company.buzzPhrase()}. With ${faker.commerce.productName()}, that world is here.`,
      'question-based': `Ready to ${faker.company.buzzVerb()} your potential? ${faker.commerce.productName()} empowers your success.`
    }
  };
  
  const tone = faker.helpers.arrayElement(tones);
  const style = faker.helpers.arrayElement(styles);
  
  return {
    id: faker.string.uuid(),
    motivationId: motivation.id,
    text: templates[tone]?.[style] || faker.marketing.buzzPhrase(),
    tone,
    style,
    platform: faker.helpers.arrayElement(['instagram', 'facebook', 'linkedin', 'twitter', 'email']),
    characterCount: faker.number.int({ min: 50, max: 280 }),
    selected: faker.datatype.boolean(),
    score: faker.number.float({ min: 0.7, max: 1.0, precision: 0.01 }),
    ...overrides
  };
}

// Matrix data generator
function generateMatrixData(campaign, assets) {
  const platforms = ['Instagram Feed', 'Instagram Story', 'Facebook Feed', 'LinkedIn', 'Twitter'];
  const formats = ['Square (1:1)', 'Vertical (9:16)', 'Horizontal (16:9)', 'Portrait (4:5)'];
  
  const rows = [];
  for (let i = 0; i < faker.number.int({ min: 3, max: 8 }); i++) {
    const row = {
      id: faker.string.uuid(),
      platform: faker.helpers.arrayElement(platforms),
      format: faker.helpers.arrayElement(formats),
      cells: {}
    };
    
    // Generate cells for different asset types
    const assetTypes = ['image', 'video', 'copy', 'audio'];
    assetTypes.forEach(type => {
      const relevantAssets = assets.filter(a => {
        if (type === 'image') return a.mimeType?.includes('image');
        if (type === 'video') return a.mimeType?.includes('video');
        if (type === 'copy') return a.type === 'copy';
        if (type === 'audio') return a.mimeType?.includes('audio');
        return false;
      });
      
      row.cells[type] = {
        asset: faker.helpers.arrayElement(relevantAssets) || null,
        locked: faker.datatype.boolean({ probability: 0.2 })
      };
    });
    
    rows.push(row);
  }
  
  return {
    campaignId: campaign.id,
    rows,
    totalCombinations: rows.length * 4, // Simplified calculation
    generatedAt: new Date()
  };
}

// Strategic motivation generator
function generateMotivation(overrides = {}) {
  const titles = [
    'Emotional Connection',
    'Functional Benefits',
    'Social Proof',
    'Urgency & Scarcity',
    'Value Proposition',
    'Brand Trust',
    'Innovation Story',
    'Customer Success'
  ];
  
  const descriptions = {
    'Emotional Connection': 'Build deep emotional resonance with your target audience through storytelling and relatable experiences.',
    'Functional Benefits': 'Highlight the practical advantages and problem-solving capabilities of your product or service.',
    'Social Proof': 'Leverage testimonials, reviews, and endorsements to build credibility and trust.',
    'Urgency & Scarcity': 'Create compelling reasons to act now through limited-time offers or exclusive access.',
    'Value Proposition': 'Clearly communicate the unique value and ROI your solution provides.',
    'Brand Trust': 'Establish authority and reliability through expertise, heritage, and consistent delivery.',
    'Innovation Story': 'Showcase cutting-edge features and forward-thinking approach to stand out from competitors.',
    'Customer Success': 'Feature real customer stories and transformations to inspire prospects.'
  };
  
  const title = faker.helpers.arrayElement(titles);
  
  return {
    id: faker.string.uuid(),
    title,
    description: descriptions[title],
    relevanceScore: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
    selected: faker.datatype.boolean({ probability: 0.6 }),
    aiGenerated: true,
    customFeedback: null,
    ...overrides
  };
}

// Generate a complete test dataset
function generateCompleteTestData() {
  // Generate users
  const users = Array.from({ length: 5 }, () => generateUser());
  
  // Generate clients
  const clients = Array.from({ length: 10 }, () => generateClient());
  
  // Generate briefs for each client
  const briefs = clients.flatMap(client => 
    Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => 
      generateBrief({ clientId: client.id })
    )
  );
  
  // Generate campaigns
  const campaigns = clients.flatMap(client =>
    Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
      generateCampaign({ clientId: client.id })
    )
  );
  
  // Generate assets
  const assets = Array.from({ length: 50 }, () => {
    const type = faker.helpers.arrayElement(['image', 'video', 'audio', 'document']);
    return generateAsset(type);
  });
  
  // Generate motivations
  const motivations = Array.from({ length: 8 }, () => generateMotivation());
  
  // Generate copy variations for selected motivations
  const copyVariations = motivations
    .filter(m => m.selected)
    .flatMap(motivation =>
      Array.from({ length: faker.number.int({ min: 3, max: 5 }) }, () =>
        generateCopyVariation(motivation)
      )
    );
  
  // Generate matrix data for campaigns
  const matrixData = campaigns.map(campaign =>
    generateMatrixData(campaign, assets)
  );
  
  return {
    users,
    clients,
    briefs,
    campaigns,
    assets,
    motivations,
    copyVariations,
    matrixData
  };
}

module.exports = {
  generateUser,
  generateClient,
  generateBrief,
  generateCampaign,
  generateAsset,
  generateCopyVariation,
  generateMatrixData,
  generateMotivation,
  generateCompleteTestData
};