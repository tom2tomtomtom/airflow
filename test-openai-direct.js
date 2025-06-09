// Simple test to verify OpenAI API is working
const FormData = require('form-data');
const fs = require('fs');

async function testOpenAIDirectly() {
  console.log('🧪 Testing OpenAI parsing API directly...');
  
  try {
    // Create form data with the text file
    const formData = new FormData();
    const briefContent = fs.readFileSync('/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt');
    
    // Create a mock file object
    formData.append('file', briefContent, {
      filename: 'test-airwave-brief.txt',
      contentType: 'text/plain'
    });

    console.log('📤 Sending request to parse-brief API...');
    
    const response = await fetch('http://localhost:3000/api/flow/parse-brief', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type, let FormData set it with boundary
        ...formData.getHeaders()
      }
    });

    console.log(`📥 Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ OpenAI parsing successful!');
      console.log('\n📋 PARSED RESULTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Title: "${result.data.title}"`);
      console.log(`Industry: "${result.data.industry}"`);
      console.log(`Objective: "${result.data.objective.substring(0, 100)}..."`);
      console.log(`Target Audience: "${result.data.targetAudience.substring(0, 100)}..."`);
      console.log(`Value Proposition: "${result.data.valueProposition.substring(0, 100)}..."`);
      console.log(`Key Messages: [${result.data.keyMessages.length} messages]`);
      result.data.keyMessages.forEach((msg, i) => {
        console.log(`  ${i + 1}. "${msg.substring(0, 60)}..."`);
      });
      console.log(`Platforms: [${result.data.platforms.join(', ')}]`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.error('❌ API returned error:', result.message);
    }

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testOpenAIDirectly().catch(console.error);