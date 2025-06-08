// Realistic test data for generation functions

const testData = {
  // Client test data
  clients: [
    {
      id: 'test-client-1',
      name: 'TechFlow Solutions',
      industry: 'Technology',
      description: 'B2B SaaS platform for workflow automation'
    },
    {
      id: 'test-client-2', 
      name: 'GreenWave Fitness',
      industry: 'Health & Wellness',
      description: 'Sustainable fitness equipment and wellness programs'
    }
  ],

  // Brief test data for strategy generation
  briefs: [
    {
      id: 'brief-1',
      title: 'Q4 Product Launch Campaign',
      content: `Launch our revolutionary AI-powered project management tool targeting software development teams and startup founders. 
      
      Key objectives:
      - Generate 10,000 beta signups in first month
      - Build brand awareness in dev community  
      - Position as must-have tool for agile teams
      - Drive 500+ paid conversions from trial
      
      Target audience: Software developers, project managers, startup founders, tech leads at companies 10-500 employees.
      
      Key messaging: "Turn chaos into clarity. Our AI learns your team's patterns and optimizes workflows automatically."
      
      USPs: 
      - AI-powered task prioritization
      - Seamless GitHub/Slack integration
      - Real-time team analytics
      - 50% faster project delivery proven
      
      Budget: $250K digital marketing spend
      Timeline: 12-week campaign launching January 2025`,
      
      target_audience: 'Software developers, project managers, startup founders, tech leads aged 25-45',
      campaign_objectives: 'Generate 10K beta signups, build dev community awareness, drive 500+ paid conversions'
    },
    
    {
      id: 'brief-2',
      title: 'Fitness Equipment Rebranding',
      content: `Rebrand and launch our new line of eco-friendly fitness equipment targeting environmentally conscious fitness enthusiasts.
      
      Key objectives:
      - Establish brand as leader in sustainable fitness
      - Target 5,000 pre-orders for new product line
      - Build community of eco-fitness advocates
      - 25% market share increase in premium segment
      
      Target audience: Environmentally conscious fitness enthusiasts, home gym owners, wellness coaches, aged 28-50, household income $75K+.
      
      Key messaging: "Fitness for you, kindness for the planet. Premium equipment made from 90% recycled materials."
      
      USPs:
      - 90% recycled materials construction
      - Carbon-neutral shipping
      - Lifetime durability guarantee  
      - Modular design saves space
      
      Budget: $180K omnichannel campaign
      Timeline: 8-week pre-launch + 12-week launch campaign`,
      
      target_audience: 'Eco-conscious fitness enthusiasts, home gym owners, wellness coaches aged 28-50',
      campaign_objectives: '5K pre-orders, establish sustainable fitness leadership, 25% premium market share increase'
    }
  ],

  // Image generation test prompts
  imagePrompts: [
    {
      prompt: 'Professional software developer working late at night with multiple monitors showing code, modern office environment, productivity focused, clean aesthetic',
      style: 'photorealistic',
      aspectRatio: '16:9'
    },
    {
      prompt: 'Diverse team of fitness enthusiasts using eco-friendly gym equipment in bright modern home gym, natural lighting, sustainable materials visible',
      style: 'lifestyle',
      aspectRatio: '1:1'
    },
    {
      prompt: 'Minimalist dashboard interface showing project analytics and AI insights, clean UI design, professional blue and white color scheme',
      style: 'digital',
      aspectRatio: '16:9'
    }
  ],

  // Video generation test prompts
  videoPrompts: [
    {
      prompt: 'Dynamic showcase of AI project management tool interface with smooth transitions between features, professional voiceover explaining key benefits',
      duration: 30,
      style: 'product demo',
      resolution: '1080p'
    },
    {
      prompt: 'Time-lapse of someone assembling modular fitness equipment made from recycled materials, focusing on sustainability and quality',
      duration: 15,
      style: 'lifestyle',
      resolution: '1080p'
    }
  ],

  // Voice generation test scripts
  voiceScripts: [
    {
      text: "Transform your development workflow with AI that learns how your team works. Say goodbye to endless meetings and hello to 50% faster project delivery. Try our beta free for 30 days.",
      voice: 'professional-male',
      language: 'en-US',
      tone: 'confident'
    },
    {
      text: "Fitness that feels good inside and out. Our new eco-friendly equipment is made from 90% recycled materials without compromising on quality. Pre-order now and join the sustainable fitness revolution.",
      voice: 'friendly-female', 
      language: 'en-US',
      tone: 'inspiring'
    }
  ],

  // Copy generation test parameters
  copyParameters: [
    {
      platforms: ['LinkedIn', 'Twitter', 'Facebook'],
      tone: 'professional',
      style: 'direct',
      length: 'medium',
      includeHashtags: true,
      includeEmojis: false
    },
    {
      platforms: ['Instagram', 'TikTok', 'Facebook'],
      tone: 'friendly', 
      style: 'engaging',
      length: 'short',
      includeHashtags: true,
      includeEmojis: true
    }
  ],

  // Expected motivation categories for testing
  expectedMotivations: [
    'Efficiency & Productivity',
    'Professional Growth', 
    'Problem Solving',
    'Innovation & Technology',
    'Team Collaboration',
    'Environmental Responsibility',
    'Health & Wellness',
    'Quality & Durability',
    'Cost Savings',
    'Social Proof',
    'Urgency & Scarcity',
    'Trust & Credibility'
  ]
};

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = testData;
}

// Make available globally for browser tests
if (typeof window !== 'undefined') {
  window.testData = testData;
}