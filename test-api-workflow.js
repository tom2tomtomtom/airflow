const fs = require('fs');
const path = require('path');

async function testBriefAPI() {
  console.log('=== Testing Brief API Directly ===');
  
  // Test content
  const testBriefContent = `
Redbaez Airwave Brief
Objective: Create engaging social media content for insurance products that drives awareness and conversions
Target Audience: Young professionals aged 25-40 interested in comprehensive insurance coverage
Key Messages: 
- Affordable insurance solutions that fit your budget
- Quick and easy application process in under 10 minutes
- Comprehensive coverage options for every life stage
- 24/7 customer support when you need it most
Platforms: Instagram, Facebook, LinkedIn, YouTube
Budget: $50,000
Timeline: 3 months campaign duration
Product: Life Insurance, Auto Insurance, Home Insurance
Service: Online insurance application, Claims processing, Customer support
Value Proposition: Protecting what matters most at an affordable price with industry-leading customer service
Industry: Insurance and Financial Services
Brand Guidelines: Use modern, trustworthy tone with bright colors and friendly imagery
Requirements: Mobile-first design, accessibility compliance, multilingual support
Competitors: Lemonade, Progressive, Geico, State Farm
`;
  
  try {
    // Create form data
    const formData = new FormData();
    const blob = new Blob([testBriefContent], { type: 'text/plain' });
    formData.append('file', blob, 'test-brief.txt');
    
    console.log('1. Testing parse-brief API...');
    const response = await fetch('http://localhost:3001/api/flow/parse-brief', {
      method: 'POST',
      body: formData,
    });
    
    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.log('❌ Brief parsing failed:', result.message);
      return;
    }
    
    console.log('✅ Brief parsing successful');
    
    // Analyze the parsed data for issues
    const briefData = result.data;
    console.log('\n2. Analyzing parsed data for UI issues...');
    
    const issues = [];
    
    // Check each field for potential UI display issues
    Object.keys(briefData).forEach(key => {
      const value = briefData[key];
      
      // Check for object-to-string conversion
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        issues.push(`🚨 ${key}: Is object instead of string - will display as [object Object]`);
      }
      
      // Check for stringified objects
      if (typeof value === 'string' && (value.includes('[object') || value.includes('{"'))) {
        issues.push(`🚨 ${key}: Contains stringified object - ${value.substring(0, 50)}...`);
      }
      
      // Check for null/undefined
      if (value === null || value === undefined) {
        issues.push(`⚠️ ${key}: Is null/undefined - may display as "null" or "undefined"`);
      }
      
      // Check arrays
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            issues.push(`🚨 ${key}[${index}]: Array contains object - will display as [object Object]`);
          }
        });
      }
    });
    
    if (issues.length > 0) {
      console.log('\n🚨 FOUND ISSUES THAT CAUSE JUMBLED UI:');
      issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log('✅ No data structure issues found');
    }
    
    // Test motivations generation
    console.log('\n3. Testing motivations generation...');
    const motivationsResponse = await fetch('http://localhost:3001/api/flow/generate-motivations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ briefData: briefData }),
    });
    
    const motivationsResult = await motivationsResponse.json();
    console.log('Motivations Status:', motivationsResponse.status);
    
    if (motivationsResult.success) {
      console.log('✅ Motivations generated:', motivationsResult.data.length, 'items');
      
      // Check motivations data structure
      motivationsResult.data.forEach((motivation, index) => {
        if (typeof motivation !== 'object' || !motivation.title || !motivation.description) {
          console.log(`🚨 Motivation ${index}: Invalid structure`);
        }
      });
    } else {
      console.log('❌ Motivations failed:', motivationsResult.message);
    }
    
  } catch (error) {
    console.log('❌ API Test Error:', error.message);
  }
  
  console.log('\n=== API Test Complete ===');
}

// Run the test
testBriefAPI();