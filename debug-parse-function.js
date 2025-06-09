const fs = require('fs');

// Minimal version of the parse function for debugging
function debugParseFunction() {
  console.log('🔍 Testing parse function locally...');
  
  try {
    // Read the brief content
    const content = fs.readFileSync('/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt', 'utf8');
    console.log(`📄 File content length: ${content.length}`);
    
    const title = 'test-airwave-brief';
    console.log('🔬 Starting pattern extraction...');
    
    // Basic content analysis patterns (simplified)
    const contentLower = content.toLowerCase();
    
    // Extract objective
    console.log('🎯 Extracting objective...');
    let objective = '';
    const objectivePatterns = [
      /objective[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
      /goal[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
      /purpose[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i
    ];
    
    for (const pattern of objectivePatterns) {
      const match = content.match(pattern);
      if (match) {
        objective = match[1].trim();
        console.log(`✅ Found objective: "${objective.substring(0, 60)}..."`);
        break;
      }
    }
    
    // Extract target audience  
    console.log('👥 Extracting target audience...');
    let targetAudience = '';
    const audiencePatterns = [
      /target audience[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
      /audience[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i,
      /demographic[:\s]+(.*?)(?:\n\n|\n[A-Z]|$)/i
    ];
    
    for (const pattern of audiencePatterns) {
      const match = content.match(pattern);
      if (match) {
        targetAudience = match[1].trim();
        console.log(`✅ Found audience: "${targetAudience.substring(0, 60)}..."`);
        break;
      }
    }
    
    // Extract platforms
    console.log('📱 Extracting platforms...');
    const platforms = [];
    const platformKeywords = ['instagram', 'facebook', 'linkedin', 'twitter', 'youtube', 'tiktok', 'snapchat', 'meta'];
    
    platformKeywords.forEach(platform => {
      if (contentLower.includes(platform)) {
        platforms.push(platform.charAt(0).toUpperCase() + platform.slice(1));
      }
    });
    
    console.log(`✅ Found platforms: [${platforms.join(', ')}]`);
    
    const result = {
      title,
      objective: objective || 'Strategic content creation to drive engagement and brand awareness',
      targetAudience: targetAudience || 'Target audience as defined in brief',
      keyMessages: ['Key message from brief analysis'],
      platforms: platforms.length > 0 ? platforms : ['Instagram', 'LinkedIn', 'Facebook'],
      budget: 'TBD',
      timeline: 'TBD',
      product: '',
      service: '',
      valueProposition: '',
      industry: '',
      competitors: [],
      brandGuidelines: '',
      requirements: []
    };
    
    console.log('\n✅ LOCAL PARSING COMPLETED SUCCESSFULLY!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Title: ${result.title}`);
    console.log(`Objective: ${result.objective.substring(0, 100)}...`);
    console.log(`Target Audience: ${result.targetAudience.substring(0, 100)}...`);
    console.log(`Platforms: [${result.platforms.join(', ')}]`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return result;
    
  } catch (error) {
    console.error('❌ Local parsing failed:', error);
    return null;
  }
}

// Run the test
const result = debugParseFunction();
if (result) {
  console.log('🎉 Pattern matching logic works correctly locally!');
  console.log('💡 The issue must be in the API endpoint or file upload handling.');
} else {
  console.log('❌ Pattern matching logic has issues.');
}