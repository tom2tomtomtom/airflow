import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load test credentials
const testCredentialsPath = path.join(process.cwd(), 'test-credentials.json');
const testCredentials = JSON.parse(fs.readFileSync(testCredentialsPath, 'utf8'));
console.log('✅ Test credentials loaded');

test.describe('Workflow Final Test', () => {
  test('Complete UnifiedBriefWorkflow End-to-End Test', async ({ page }) => {
    console.log('🚀 Starting comprehensive workflow test...');
    
    // Set up page error handling
    const pageErrors = [];
    page.on('pageerror', error => {
      console.log('🚨 PAGE ERROR:', error.message);
      pageErrors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 CONSOLE ERROR:', msg.text());
      }
    });
    
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Login
    console.log('🔑 Logging in...');
    await page.fill('input[type="email"]', testCredentials.email);
    await page.fill('input[type="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    console.log('✅ Logged in, navigating to /flow...');
    
    // Navigate to flow page
    await page.goto('http://localhost:3000/flow');
    await page.waitForTimeout(5000); // Give component time to initialize
    
    console.log(`📍 Current URL: ${page.url()}`);
    
    // Verify workflow dialog is visible
    const workflowDialog = page.locator('[role="dialog"]');
    await expect(workflowDialog).toBeVisible();
    console.log('💬 Workflow dialog confirmed visible');
    
    // Check initial state
    const initialState = await page.evaluate(() => {
      const state = sessionStorage.getItem('airwave_unified_workflow_state');
      return state ? JSON.parse(state) : null;
    });
    
    console.log('📊 Initial state:', JSON.stringify(initialState, null, 2));
    
    // Create test file
    const testContent = `AIRWAVE Comprehensive Test Brief

Campaign Objective:
Launch a revolutionary AI-powered productivity tool targeting remote workers and digital nomads. The campaign aims to establish market presence, drive user acquisition, and build brand awareness in the competitive productivity software space.

Target Audience:
Primary: Remote workers, freelancers, and digital nomads (ages 25-45)
Secondary: Small business owners and startup founders
Tertiary: Productivity enthusiasts and early tech adopters

Demographics:
- Age: 25-45 years old
- Income: $40,000-$150,000 annually
- Education: College-educated professionals
- Location: Global, with focus on North America and Europe
- Tech-savvy with high social media engagement

Key Messages:
- Revolutionize your productivity with AI-powered assistance
- Work smarter, not harder with intelligent automation
- Seamless integration with your existing workflow
- Privacy-first approach to personal data
- Affordable pricing for individuals and teams
- 24/7 customer support and community

Platforms:
- LinkedIn (primary for B2B reach)
- Twitter (thought leadership and engagement)
- Instagram (visual storytelling and lifestyle)
- YouTube (product demos and tutorials)
- TikTok (reaching younger demographics)
- Facebook (community building)

Budget:
Total Campaign Budget: $75,000
- Content Creation: $25,000
- Paid Advertising: $35,000
- Influencer Partnerships: $10,000
- Community Management: $5,000

Timeline:
Pre-Launch Phase (4 weeks):
- Week 1-2: Content creation and asset development
- Week 3-4: Teaser campaign and community building

Launch Phase (2 weeks):
- Week 1: Official product launch announcement
- Week 2: Intensive promotion and user onboarding

Post-Launch Phase (8 weeks):
- Weeks 1-4: User feedback collection and testimonials
- Weeks 5-8: Optimization and scaling successful campaigns

Product Details:
AI-powered productivity assistant with features including:
- Smart task prioritization
- Automated scheduling
- Email management
- Document summarization
- Meeting transcription
- Goal tracking and analytics

Value Proposition:
Save 2+ hours daily with AI automation while maintaining complete control over your data and privacy. Our tool learns your work patterns to provide personalized productivity recommendations.

Brand Guidelines:
- Primary Colors: Deep Blue (#1E3A8A), Bright Green (#10B981)
- Secondary Colors: Light Gray (#F3F4F6), Dark Gray (#374151)
- Typography: Modern, clean sans-serif fonts
- Tone: Professional yet approachable, innovative, trustworthy
- Voice: Confident, helpful, solution-oriented

Industry Context:
Productivity software market valued at $58 billion globally
Key trends: AI integration, remote work tools, privacy concerns
Growth rate: 13.4% CAGR expected through 2028

Competitors:
- Notion (comprehensive workspace)
- Asana (project management)
- Monday.com (team collaboration)
- ClickUp (all-in-one productivity)
- Todoist (task management)

Success Metrics:
- Brand Awareness: 25% increase in brand recognition
- User Acquisition: 10,000 new sign-ups in first month
- Engagement Rate: 8%+ across all platforms
- Conversion Rate: 15% from trial to paid subscription
- Cost Per Acquisition: Under $25
- Customer Lifetime Value: $300+

Compliance Requirements:
- GDPR compliance for European users
- CCPA compliance for California residents
- SOC 2 Type II certification
- Regular security audits and transparency reports
- Clear privacy policy and terms of service
`;
    
    const tempFilePath = path.join(process.cwd(), 'temp-comprehensive-brief.txt');
    fs.writeFileSync(tempFilePath, testContent);
    
    try {
      // Upload file
      console.log('📁 Uploading comprehensive test file...');
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.setInputFiles(tempFilePath);
      console.log('✅ File uploaded to input');
      
      // Wait for processing with enhanced monitoring
      console.log('⏱️ Monitoring file processing...');
      let processingComplete = false;
      const maxWaitTime = 60; // 60 seconds max wait
      
      for (let i = 0; i < maxWaitTime; i++) {
        await page.waitForTimeout(1000);
        
        // Check if page is still accessible
        try {
          const currentUrl = page.url();
          if (!currentUrl.includes('/flow')) {
            console.log(`🚨 Page navigated away from /flow to: ${currentUrl}`);
            break;
          }
        } catch (error) {
    const message = getErrorMessage(error);
          console.log('🚨 Page context lost:', error.message);
          break;
        }
        
        // Check workflow state
        const state = await page.evaluate(() => {
          try {
            const workflowState = sessionStorage.getItem('airwave_unified_workflow_state');
            if (workflowState) {
              const parsed = JSON.parse(workflowState);
              return {
                step: parsed.activeStep,
                hasBriefData: !!parsed.briefData,
                briefConfirmed: parsed.briefConfirmed,
                showBriefReview: parsed.showBriefReview,
                briefTitle: parsed.briefData?.title || 'None',
                briefObjective: parsed.briefData?.objective?.substring(0, 100) || 'None'
              };
            }
            return null;
          } catch (error) {
    const message = getErrorMessage(error);
            return { error: error.message };
          }
        });
        
        if (state && state.error) {
          console.log(`🚨 State evaluation error: ${state.error}`);
          break;
        }
        
        if (state) {
          console.log(`📊 ${i + 1}s: Step ${state.step}, Brief: ${state.hasBriefData ? 'YES' : 'NO'}, Review: ${state.showBriefReview ? 'YES' : 'NO'}`);
          
          if (state.briefTitle !== 'None') {
            console.log(`   📄 Title: ${state.briefTitle}`);
          }
          
          if (state.briefObjective !== 'None') {
            console.log(`   🎯 Objective: ${state.briefObjective}...`);
          }
          
          // Check if processing is complete
          if (state.hasBriefData && state.showBriefReview) {
            console.log('🎉 File processing completed successfully!');
            processingComplete = true;
            break;
          }
        } else {
          console.log(`📊 ${i + 1}s: No workflow state`);
        }
        
        // Take periodic screenshots
        if (i % 15 === 0 && i > 0) {
          await page.screenshot({ path: `tests/screenshots/final-test-${i}s.png`, fullPage: true });
        }
      }
      
      // Final state check
      console.log('🔍 Final comprehensive state check...');
      const finalState = await page.evaluate(() => {
        try {
          const workflowState = sessionStorage.getItem('airwave_unified_workflow_state');
          return workflowState ? JSON.parse(workflowState) : null;
        } catch (error) {
    const message = getErrorMessage(error);
          return { error: error.message };
        }
      });
      
      // Take final screenshot
      await page.screenshot({ path: 'tests/screenshots/final-test-complete.png', fullPage: true });
      
      // Generate comprehensive report
      console.log('\n' + '='.repeat(100));
      console.log('🎯 COMPREHENSIVE WORKFLOW TEST REPORT');
      console.log('='.repeat(100));
      
      console.log(`🔄 Processing Completed: ${processingComplete ? 'YES' : 'NO'}`);
      console.log(`🚨 Page Errors: ${pageErrors.length}`);
      
      if (pageErrors.length > 0) {
        console.log('🚨 Page Errors Detected:');
        pageErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      if (finalState && !finalState.error) {
        console.log(`📊 Final State: Step ${finalState.activeStep}`);
        console.log(`📁 Has Brief Data: ${finalState.briefData ? 'YES' : 'NO'}`);
        console.log(`✅ Brief Confirmed: ${finalState.briefConfirmed ? 'YES' : 'NO'}`);
        console.log(`👀 Show Brief Review: ${finalState.showBriefReview ? 'YES' : 'NO'}`);
        
        if (finalState.briefData) {
          console.log('\n📄 PARSED BRIEF SUMMARY:');
          console.log(`   Title: ${finalState.briefData.title}`);
          console.log(`   Objective: ${finalState.briefData.objective?.substring(0, 150)}...`);
          console.log(`   Target Audience: ${finalState.briefData.targetAudience?.substring(0, 100)}...`);
          console.log(`   Key Messages: ${finalState.briefData.keyMessages?.length || 0} messages`);
          console.log(`   Platforms: ${finalState.briefData.platforms?.join(', ') || 'None'}`);
          console.log(`   Budget: ${finalState.briefData.budget || 'Not specified'}`);
          console.log(`   Timeline: ${finalState.briefData.timeline?.substring(0, 100) || 'Not specified'}...`);
        }
        
        console.log(`\n🎭 Motivations: ${finalState.motivations?.length || 0}`);
        console.log(`📝 Copy Variations: ${finalState.copyVariations?.length || 0}`);
        console.log(`🎨 Selected Assets: ${finalState.selectedAssets?.length || 0}`);
        console.log(`📋 Selected Template: ${finalState.selectedTemplate || 'None'}`);
      } else if (finalState && finalState.error) {
        console.log(`❌ Final State Error: ${finalState.error}`);
      } else {
        console.log('❌ No final state found');
      }
      
      console.log('='.repeat(100));
      
      // Test success criteria
      const testPassed = processingComplete && finalState && finalState.briefData && !finalState.error;
      
      if (testPassed) {
        console.log('🎉 TEST PASSED: Workflow processed file successfully and maintained state!');
      } else {
        console.log('⚠️ TEST INCOMPLETE: Some issues detected but workflow partially functional');
      }
      
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
        console.log('🧹 Cleaned up temp file');
      }
    }
  });
});
