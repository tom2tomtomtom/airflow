/**
 * Manual Flow Test
 * Simple test to validate the complete AIRWAVE workflow manually
 */

const CREDENTIALS = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password-123'
};

const REDBAEZ_BRIEF = `Creative Brief: Launching AIrWAVE 2.0 by Redbaez

Brand: Redbaez
Project Title: AIrWAVE 2.0 Global Launch: Scale Creative, Unleash Impact

Objective: Position AIrWAVE 2.0 as the game-changing tool for brands and agencies worldwide, enabling them to create high-performing, scalable ad executions tailored to customer motivations at lightning speed.

Target Audience:
1. Primary: Digital marketers, creative agencies, and in-house teams in the ecommerce and retail sectors.
2. Secondary: Tech-savvy entrepreneurs and SMEs looking to leverage AI for competitive advantage.

Key Features:
- Sentiment and Theme Analysis
- Customer Motivation Mapping  
- Ad Variations at Scale
- AI-Powered Content Creation
- Multi-Platform Support

Key Messages:
1. The Hook: "The future of creative scalability is here: AIrWAVE 2.0."
2. Value Proposition: Create. Test. Iterate. At Scale.
3. Call to Action: "Discover how AIrWAVE 2.0 can transform your ad strategy today."`;

async function testCompleteWorkflow() {
  console.log('🎯 Starting Manual Flow Test...');
  
  try {
    // Step 1: Test API directly
    console.log('📁 Step 1: Testing file upload API...');
    
    // Create form data with the brief
    const formData = new FormData();
    const briefBlob = new Blob([REDBAEZ_BRIEF], { type: 'text/plain' });
    formData.append('file', briefBlob, 'redbaez-brief.txt');
    
    // Test the parse-brief API
    const parseResponse = await fetch('https://airwave-complete.netlify.app/api/flow/parse-brief', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    const parseResult = await parseResponse.json();
    console.log('📊 Parse API Result:', parseResult);
    
    if (parseResult.success) {
      console.log('✅ Brief parsing successful!');
      console.log('📄 Parsed brief data:', {
        title: parseResult.data.title,
        objective: parseResult.data.objective.substring(0, 100) + '...',
        targetAudience: parseResult.data.targetAudience.substring(0, 100) + '...',
        platforms: parseResult.data.platforms
      });
      
      // Step 2: Test motivation generation
      console.log('\n🧠 Step 2: Testing motivation generation...');
      
      const motivationResponse = await fetch('https://airwave-complete.netlify.app/api/flow/generate-motivations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ briefData: parseResult.data }),
        credentials: 'include'
      });
      
      const motivationResult = await motivationResponse.json();
      console.log('🎯 Motivation API Result:', motivationResult);
      
      if (motivationResult.success) {
        console.log('✅ Motivation generation successful!');
        console.log(`📋 Generated ${motivationResult.data.length} motivations:`);
        
        motivationResult.data.slice(0, 3).forEach((motivation, index) => {
          console.log(`  ${index + 1}. ${motivation.title} (Score: ${motivation.score}%)`);
          console.log(`     ${motivation.description.substring(0, 80)}...`);
        });
        
        // Step 3: Test copy generation
        console.log('\n📝 Step 3: Testing copy generation...');
        
        // Select first 3 motivations for copy generation
        const selectedMotivations = motivationResult.data.slice(0, 3).map(m => ({
          ...m,
          selected: true
        }));
        
        const copyResponse = await fetch('https://airwave-complete.netlify.app/api/flow/generate-copy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            motivations: selectedMotivations, 
            briefData: parseResult.data 
          }),
          credentials: 'include'
        });
        
        const copyResult = await copyResponse.json();
        console.log('📝 Copy API Result:', copyResult);
        
        if (copyResult.success) {
          console.log('✅ Copy generation successful!');
          console.log(`📄 Generated ${copyResult.data.length} copy variations:`);
          
          copyResult.data.slice(0, 2).forEach((copy, index) => {
            console.log(`  ${index + 1}. ${copy.platform} - ${copy.format}`);
            console.log(`     Headline: ${copy.headline.substring(0, 60)}...`);
            console.log(`     Body: ${copy.body.substring(0, 80)}...`);
          });
          
          console.log('\n🎉 COMPLETE WORKFLOW TEST SUCCESSFUL!');
          console.log('=' .repeat(50));
          console.log('✅ Brief Upload & Parsing: SUCCESS');
          console.log('✅ Motivation Generation: SUCCESS');
          console.log('✅ Copy Generation: SUCCESS');
          console.log('🎯 All APIs are working correctly!');
          
        } else {
          console.log('❌ Copy generation failed:', copyResult.message);
        }
        
      } else {
        console.log('❌ Motivation generation failed:', motivationResult.message);
      }
      
    } else {
      console.log('❌ Brief parsing failed:', parseResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCompleteWorkflow();
