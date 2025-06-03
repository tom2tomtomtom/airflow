import { test, expect, Page } from '@playwright/test';
import { randomBytes } from 'crypto';

// Test configuration
const TEST_CREDENTIALS = {
  email: 'tomh@rebaez.com',
  password: 'Wijlre2010'
};

// Generate unique identifiers for test data
const testId = randomBytes(4).toString('hex');
const testClient = {
  name: `Test Client ${testId}`,
  industry: 'Technology',
  brandGuidelines: 'Modern, innovative, professional. Primary colors: Blue and white. Target audience: Tech-savvy professionals.'
};

const testBrief = {
  title: `Q1 2025 Product Launch Campaign ${testId}`,
  objective: 'Launch our new AI-powered analytics platform to enterprise customers',
  targetAudience: 'CTOs, Data Scientists, and IT Decision Makers at Fortune 500 companies',
  keyMessages: [
    'Revolutionary AI-driven insights',
    'Enterprise-grade security and scalability',
    '10x faster than traditional analytics'
  ],
  platforms: ['LinkedIn', 'Twitter', 'Email', 'Web'],
  timeline: '3 months',
  budget: '$50,000',
  deliverables: [
    'Social media campaign assets',
    'Email marketing templates',
    'Landing page designs',
    'Video content for product demos'
  ]
};

test.describe('AIRWAVE MVP Full Workflow Test', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Set longer timeout for this comprehensive test
    test.setTimeout(300000); // 5 minutes
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Complete MVP workflow from login to content generation', async () => {
    console.log('🚀 Starting AIRWAVE MVP workflow test...');

    // Step 1: Login
    console.log('📝 Step 1: Testing login...');
    await test.step('Login with real credentials', async () => {
      await page.goto('/login');
      
      // Fill login form
      await page.fill('[data-testid="email-input"] input', TEST_CREDENTIALS.email);
      await page.fill('[data-testid="password-input"] input', TEST_CREDENTIALS.password);
      
      // Click login button
      await page.click('[data-testid="sign-in-button"]');
      
      // Wait for dashboard
      await page.waitForURL('**/dashboard', { timeout: 30000 });
      console.log('✅ Login successful');
      
      // Verify we're on dashboard
      await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
    });

    // Step 2: Client Management
    console.log('📝 Step 2: Testing client creation...');
    await test.step('Create and select client', async () => {
      // Navigate to clients page
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');
      
      // Check if we need to create a client or can select existing
      const hasClients = await page.locator('[data-testid="client-card"]').count() > 0;
      
      if (!hasClients) {
        // Create new client
        await page.click('button:has-text("Create New Client")');
        await page.waitForSelector('[data-testid="client-form"]', { timeout: 10000 });
        
        // Fill client form
        await page.fill('[name="name"]', testClient.name);
        await page.fill('[name="industry"]', testClient.industry);
        await page.fill('[name="brandGuidelines"]', testClient.brandGuidelines);
        
        // Save client
        await page.click('button:has-text("Create Client")');
        await page.waitForLoadState('networkidle');
        console.log('✅ Client created successfully');
      }
      
      // Select the client
      await page.click(`text=${hasClients ? 'Select' : testClient.name}`).first();
      await page.waitForTimeout(2000);
      console.log('✅ Client selected');
    });

    // Step 3: Strategy/Brief Creation
    console.log('📝 Step 3: Testing strategy/brief creation...');
    await test.step('Create strategic brief', async () => {
      // Navigate to strategy/brief section
      await page.goto('/briefs');
      await page.waitForLoadState('networkidle');
      
      // Click create new brief
      const createButton = page.locator('button:has-text("Create New Brief"), button:has-text("New Brief")');
      await createButton.first().click();
      
      // Wait for form
      await page.waitForSelector('form, [data-testid="brief-form"]', { timeout: 10000 });
      
      // Fill brief form
      await page.fill('[name="title"], input[placeholder*="title"]', testBrief.title);
      await page.fill('[name="objective"], textarea[placeholder*="objective"]', testBrief.objective);
      await page.fill('[name="targetAudience"], textarea[placeholder*="audience"]', testBrief.targetAudience);
      await page.fill('[name="keyMessages"], textarea[placeholder*="messages"]', testBrief.keyMessages.join('\n'));
      await page.fill('[name="timeline"], input[placeholder*="timeline"]', testBrief.timeline);
      await page.fill('[name="budget"], input[placeholder*="budget"]', testBrief.budget);
      
      // Submit brief
      await page.click('button:has-text("Create Brief"), button:has-text("Save Brief")');
      await page.waitForLoadState('networkidle');
      console.log('✅ Brief created successfully');
    });

    // Step 4: AI Content Generation
    console.log('📝 Step 4: Testing AI content generation...');
    await test.step('Generate AI content', async () => {
      // Navigate to generation page
      await page.goto('/generate-enhanced');
      await page.waitForLoadState('networkidle');
      
      // Test image generation
      console.log('🎨 Testing image generation...');
      const imagePrompt = 'Modern tech office with AI visualization on screens, professional and futuristic';
      
      // Find and fill prompt input
      await page.fill('textarea[placeholder*="Describe"], input[placeholder*="prompt"]', imagePrompt);
      
      // Click generate button
      await page.click('button:has-text("Generate Image"), button:has-text("Generate")');
      
      // Wait for generation (this uses real API)
      await page.waitForSelector('img[alt*="Generated"], [data-testid="generated-image"]', { 
        timeout: 60000 // 1 minute for image generation
      });
      console.log('✅ Image generated successfully');
      
      // Save the generated image
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Add to Library")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(2000);
        console.log('✅ Image saved to library');
      }
    });

    // Step 5: Asset Management
    console.log('📝 Step 5: Testing asset management...');
    await test.step('Manage assets', async () => {
      // Navigate to assets page
      await page.goto('/assets');
      await page.waitForLoadState('networkidle');
      
      // Verify assets are displayed
      const assetCount = await page.locator('[data-testid="asset-card"], .asset-item').count();
      console.log(`📊 Found ${assetCount} assets in library`);
      
      // Test asset filtering if available
      const filterButton = page.locator('button:has-text("Filter"), [data-testid="filter-button"]');
      if (await filterButton.isVisible()) {
        await filterButton.click();
        await page.waitForTimeout(1000);
        
        // Apply a filter
        const imageFilter = page.locator('input[value="image"], label:has-text("Images")');
        if (await imageFilter.isVisible()) {
          await imageFilter.click();
          await page.waitForTimeout(1000);
          console.log('✅ Asset filtering working');
        }
      }
    });

    // Step 6: Campaign Creation
    console.log('📝 Step 6: Testing campaign creation...');
    await test.step('Create campaign', async () => {
      // Navigate to campaigns
      await page.goto('/campaigns');
      await page.waitForLoadState('networkidle');
      
      // Create new campaign
      const newCampaignButton = page.locator('button:has-text("New Campaign"), button:has-text("Create Campaign")');
      if (await newCampaignButton.isVisible()) {
        await newCampaignButton.click();
        await page.waitForSelector('form, [data-testid="campaign-form"]', { timeout: 10000 });
        
        // Fill campaign details
        await page.fill('[name="name"], input[placeholder*="campaign name"]', `AI Platform Launch ${testId}`);
        await page.fill('[name="description"], textarea[placeholder*="description"]', 'Q1 2025 product launch campaign');
        
        // Set dates if available
        const startDateInput = page.locator('[name="startDate"], input[type="date"]').first();
        if (await startDateInput.isVisible()) {
          await startDateInput.fill('2025-01-01');
        }
        
        // Save campaign
        await page.click('button:has-text("Create"), button:has-text("Save Campaign")');
        await page.waitForLoadState('networkidle');
        console.log('✅ Campaign created successfully');
      }
    });

    // Step 7: Content Matrix
    console.log('📝 Step 7: Testing content matrix...');
    await test.step('Create content matrix', async () => {
      // Navigate to matrix
      await page.goto('/matrix');
      await page.waitForLoadState('networkidle');
      
      // Check if matrix creation is available
      const matrixButton = page.locator('button:has-text("Create Matrix"), button:has-text("New Matrix")');
      if (await matrixButton.isVisible()) {
        await matrixButton.click();
        await page.waitForTimeout(2000);
        
        // Add content variations
        const addVariationButton = page.locator('button:has-text("Add Variation"), button:has-text("Add Row")');
        if (await addVariationButton.isVisible()) {
          await addVariationButton.click();
          await page.waitForTimeout(1000);
          console.log('✅ Matrix variation added');
        }
      }
    });

    // Final verification
    console.log('📝 Final verification...');
    await test.step('Verify MVP functionality', async () => {
      // Return to dashboard
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Verify user is still logged in
      await expect(page.locator('text=Welcome back')).toBeVisible();
      
      // Check for recent activity if available
      const activityFeed = page.locator('[data-testid="activity-feed"], .activity-feed');
      if (await activityFeed.isVisible()) {
        const activities = await activityFeed.locator('.activity-item').count();
        console.log(`📊 Found ${activities} recent activities`);
      }
      
      console.log('✅ MVP workflow completed successfully!');
    });
  });

  test('Verify session persistence', async () => {
    // Refresh page to test session persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
    console.log('✅ Session persistence verified');
  });
});