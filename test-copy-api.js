/**
 * Direct API test for copy generation to verify 504 timeout fix
 */

const fetch = require('node-fetch');

async function testCopyGenerationAPI() {
  console.log('🧪 Testing Copy Generation API...');
  
  const testData = {
    motivations: [
      {
        id: "motivation_1",
        title: "Emotional Connection",
        description: "Create emotional bonds with your audience through storytelling",
        score: 85,
        reasoning: "High emotional engagement drives brand loyalty",
        targetEmotions: ["joy", "trust", "excitement"],
        platforms: ["Instagram", "Facebook"]
      },
      {
        id: "motivation_2", 
        title: "Social Proof",
        description: "Leverage testimonials and user-generated content",
        score: 78,
        reasoning: "Social validation increases conversion rates",
        targetEmotions: ["trust", "belonging"],
        platforms: ["Facebook", "LinkedIn"]
      },
      {
        id: "motivation_3",
        title: "Innovation",
        description: "Highlight cutting-edge features and technology",
        score: 82,
        reasoning: "Innovation appeals to early adopters",
        targetEmotions: ["excitement", "curiosity"],
        platforms: ["TikTok", "Instagram"]
      },
      {
        id: "motivation_4",
        title: "Community Building",
        description: "Foster sense of belonging and shared values",
        score: 75,
        reasoning: "Community drives long-term engagement",
        targetEmotions: ["belonging", "pride"],
        platforms: ["Facebook", "LinkedIn"]
      },
      {
        id: "motivation_5",
        title: "Problem Solution",
        description: "Address specific pain points directly",
        score: 88,
        reasoning: "Problem-solving messaging converts well",
        targetEmotions: ["relief", "confidence"],
        platforms: ["LinkedIn", "Facebook"]
      },
      {
        id: "motivation_6",
        title: "Aspirational Lifestyle",
        description: "Show the ideal lifestyle customers can achieve",
        score: 80,
        reasoning: "Aspirational content drives desire",
        targetEmotions: ["aspiration", "excitement"],
        platforms: ["Instagram", "TikTok"]
      }
    ],
    briefData: {
      title: "Eco-Friendly Water Bottle Launch",
      objective: "Launch our new sustainable water bottle to environmentally conscious consumers",
      targetAudience: "Health-conscious millennials and Gen Z (ages 22-40) who prioritize sustainability",
      keyMessages: [
        "100% recycled materials",
        "Keeps drinks cold for 24 hours", 
        "Stylish, minimalist design",
        "Carbon-neutral shipping"
      ],
      platforms: ["Instagram", "Facebook", "TikTok"],
      budget: "$50,000",
      timeline: "3 months",
      product: "Eco-friendly insulated water bottle",
      valueProposition: "Sustainable hydration without compromising on style or performance",
      industry: "Consumer Goods",
      brandGuidelines: "Modern, clean, eco-conscious messaging with authentic tone"
    }
  };

  try {
    const startTime = Date.now();
    console.log('⏱️ Starting API request...');
    
    const response = await fetch('http://localhost:3000/api/flow/generate-copy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ API responded in ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.status === 504) {
      console.error('❌ STILL GETTING 504 TIMEOUT ERROR');
      return false;
    }
    
    if (response.status === 200) {
      const result = await response.json();
      console.log('✅ SUCCESS: Copy generation completed without timeout');
      console.log(`📝 Generated ${result.data?.length || 0} copy variations`);
      
      if (result.data && result.data.length > 0) {
        console.log('\n📋 Sample generated copy:');
        result.data.slice(0, 3).forEach((copy, i) => {
          console.log(`${i + 1}. ${copy.text} (${copy.platform} - ${copy.motivation})`);
        });
      }
      
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ API Error (${response.status}):`, errorText);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    
    if (error.code === 'ECONNRESET' || error.message.includes('timeout')) {
      console.error('💥 TIMEOUT ERROR - The 504 issue may still exist');
    }
    
    return false;
  }
}

// Run the test
testCopyGenerationAPI()
  .then(success => {
    console.log('\n🏁 Test completed');
    if (success) {
      console.log('✅ Copy generation API is working correctly!');
      console.log('🎯 The 504 timeout issue has been FIXED');
    } else {
      console.log('❌ Copy generation API still has issues');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });