const fs = require('fs');

async function testAPI() {
  console.log('🧪 Quick API test...');
  
  try {
    const formData = new FormData();
    const fileContent = fs.readFileSync('/Users/thomasdowuona-hyde/AIRWAVE_0525_CODEX/test-airwave-brief.txt');
    
    const blob = new Blob([fileContent], { type: 'text/plain' });
    formData.append('file', blob, 'test-brief.txt');

    console.log('📤 Sending request...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch('http://localhost:3000/api/flow/parse-brief', {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log(`📥 Response status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Success!', result.success ? 'Parsed correctly' : 'Failed');
      if (result.success && result.data) {
        console.log(`📋 Title: ${result.data.title}`);
        console.log(`🎯 Objective: ${result.data.objective.substring(0, 80)}...`);
        console.log(`👥 Audience: ${result.data.targetAudience.substring(0, 80)}...`);
      }
    } else {
      const error = await response.text();
      console.log('❌ Error:', error);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ Request timed out after 15 seconds');
    } else {
      console.error('🚨 Test failed:', error.message);
    }
  }
}

testAPI().catch(console.error);