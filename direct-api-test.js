const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const testData = require('./test-data.js');

async function directAPITest() {
  console.log('🚀 Direct API Test - Testing Generation Endpoints with Real Data\n');
  
  const apiResults = [];
  
  async function testAPI(endpoint, method, data, description) {
    console.log(`🔄 Testing ${description}...`);
    console.log(`📡 ${method} http://localhost:3000${endpoint}`);
    
    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Try with a mock authorization header
          'Authorization': 'Bearer test-token-123',
          'x-test-mode': 'true'
        },
        body: JSON.stringify(data)
      });
      
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }
      
      const result = {
        endpoint,
        method,
        status: response.status,
        description,
        data: responseData,
        success: response.status >= 200 && response.status < 300,
        timestamp: new Date().toISOString()
      };
      
      apiResults.push(result);
      
      if (result.success) {
        console.log(`✅ ${description} - Status: ${response.status}`);
        console.log(`📊 Response preview:`, JSON.stringify(responseData).substring(0, 100) + '...');
      } else {
        console.log(`❌ ${description} - Status: ${response.status}`);
        console.log(`🔍 Error:`, responseData);
      }
      
      return result;
      
    } catch (error) {
      console.log(`❌ ${description} - Error: ${error.message}`);
      const result = {
        endpoint,
        method,
        status: 0,
        description,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      };
      apiResults.push(result);
      return result;
    }
  }

  // Test 1: Strategy Generation API
  console.log('📋 TESTING STRATEGY GENERATION API');
  
  const strategyPayload = {
    brief_id: 'test-brief-1',
    client_id: 'test-client-1', 
    brief_content: testData.briefs[0].content,
    target_audience: testData.briefs[0].target_audience,
    campaign_objectives: testData.briefs[0].campaign_objectives,
    regenerate: false
  };
  
  await testAPI('/api/strategy-generate', 'POST', strategyPayload, 'Strategy Generation');

  // Test 2: Copy Generation API  
  console.log('\n📝 TESTING COPY GENERATION API');
  
  const copyPayload = {
    client_id: 'test-client-1',
    motivation_ids: ['test-motivation-1', 'test-motivation-2'],
    platforms: testData.copyParameters[0].platforms,
    tone: testData.copyParameters[0].tone,
    style: testData.copyParameters[0].style,
    variations_per_platform: 3,
    target_audience: testData.briefs[0].target_audience,
    campaign_objectives: testData.briefs[0].campaign_objectives
  };
  
  await testAPI('/api/copy-generate', 'POST', copyPayload, 'Copy Generation');

  // Test 3: AI Generation API
  console.log('\n🤖 TESTING AI GENERATION API');
  
  const aiPayloads = [
    {
      prompt: testData.briefs[0].content,
      type: 'text',
      parameters: {
        purpose: 'strategic_motivations',
        format: 'structured',
        count: 6
      },
      clientId: 'test-client-1'
    },
    {
      prompt: testData.imagePrompts[0].prompt,
      type: 'image',
      parameters: {
        style: testData.imagePrompts[0].style,
        aspectRatio: testData.imagePrompts[0].aspectRatio,
        count: 2
      },
      clientId: 'test-client-1'  
    },
    {
      prompt: testData.videoPrompts[0].prompt,
      type: 'video',
      parameters: {
        duration: testData.videoPrompts[0].duration,
        style: testData.videoPrompts[0].style,
        resolution: testData.videoPrompts[0].resolution
      },
      clientId: 'test-client-1'
    }
  ];
  
  for (let i = 0; i < aiPayloads.length; i++) {
    await testAPI('/api/ai/generate', 'POST', aiPayloads[i], `AI Generation ${i+1} (${aiPayloads[i].type})`);
  }

  // Test 4: Other Generation APIs
  console.log('\n🎨 TESTING OTHER GENERATION APIS');
  
  await testAPI('/api/dalle', 'POST', {
    prompt: testData.imagePrompts[0].prompt,
    style: testData.imagePrompts[0].style,
    size: '1024x1024'
  }, 'DALLE Image Generation');
  
  await testAPI('/api/content-generate', 'POST', {
    brief: testData.briefs[1].content,
    type: 'social_media',
    platforms: ['Instagram', 'LinkedIn']
  }, 'Content Generation');

  // Test 5: Brief Upload API
  console.log('\n📄 TESTING BRIEF APIS');
  
  await testAPI('/api/brief-upload', 'POST', {
    title: testData.briefs[0].title,
    content: testData.briefs[0].content,
    clientId: 'test-client-1'
  }, 'Brief Upload');

  // Generate comprehensive report
  const successfulAPIs = apiResults.filter(r => r.success);
  const failedAPIs = apiResults.filter(r => !r.success);
  
  const report = {
    testType: 'Direct API Test with Real Data',
    timestamp: new Date().toISOString(),
    testData: {
      briefsUsed: testData.briefs.length,
      imagePromptsUsed: testData.imagePrompts.length,
      videoPromptsUsed: testData.videoPrompts.length,
      voiceScriptsUsed: testData.voiceScripts.length,
      totalDataPoints: testData.briefs.length + testData.imagePrompts.length + testData.videoPrompts.length + testData.voiceScripts.length
    },
    summary: {
      totalAPIsHit: apiResults.length,
      successfulAPIs: successfulAPIs.length,
      failedAPIs: failedAPIs.length,
      successRate: `${((successfulAPIs.length / apiResults.length) * 100).toFixed(1)}%`
    },
    apiResults,
    recommendations: []
  };

  // Add recommendations
  if (successfulAPIs.length > 0) {
    report.recommendations.push(`✅ ${successfulAPIs.length} APIs responded successfully with real data`);
  }
  
  if (failedAPIs.length > 0) {
    const authErrors = failedAPIs.filter(r => r.status === 401 || r.status === 403);
    const notFoundErrors = failedAPIs.filter(r => r.status === 404);
    
    if (authErrors.length > 0) {
      report.recommendations.push(`🔒 ${authErrors.length} APIs failed due to authentication - need proper auth setup`);
    }
    
    if (notFoundErrors.length > 0) {
      report.recommendations.push(`🔍 ${notFoundErrors.length} APIs not found - check endpoint URLs`);
    }
  }

  // Save results
  require('fs').writeFileSync('./DIRECT_API_TEST_REPORT.json', JSON.stringify(report, null, 2));
  
  console.log('\n🎊 DIRECT API TEST COMPLETE');
  console.log(`📊 APIs Tested: ${apiResults.length}`);
  console.log(`✅ Successful: ${successfulAPIs.length}`);
  console.log(`❌ Failed: ${failedAPIs.length}`);
  console.log(`🎯 Success Rate: ${report.summary.successRate}`);
  console.log('📄 Full report saved to DIRECT_API_TEST_REPORT.json');
  
  if (successfulAPIs.length > 0) {
    console.log('\n🎉 SUCCESSFUL API RESPONSES:');
    successfulAPIs.forEach(api => {
      console.log(`✅ ${api.description} - ${api.method} ${api.endpoint} - Status: ${api.status}`);
    });
  }
  
  if (failedAPIs.length > 0) {
    console.log('\n❌ FAILED API CALLS:');
    failedAPIs.forEach(api => {
      console.log(`❌ ${api.description} - ${api.method} ${api.endpoint} - Status: ${api.status}`);
    });
  }
  
  return report;
}

directAPITest();