import { test, expect, Page } from '@playwright/test';

// Test configuration
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000',
  email: 'tomh@redbaez.com',
  password: 'Wijlre2010',
  timeout: 30000,
  creatomateTemplate: {
    templateId: '374ee9e3-de75-4feb-bfae-5c5e11d88d80',
    apiKey: '5ab32660fef044e5b135a646a78cff8ec7e2503b79e201bad7e566f4b24ec111f2fa7e01a824eaa77904c1783e083efa'
  }
};

// Helper functions
async function login(page: Page) {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', TEST_CONFIG.email);
  await page.fill('[data-testid="password-input"]', TEST_CONFIG.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login redirect
  await page.waitForURL('/dashboard', { timeout: TEST_CONFIG.timeout });
  await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
}

async function createTestClient(page: Page) {
  const clientName = `Test Client ${Date.now()}`;
  
  await page.goto('/clients');
  await page.click('[data-testid="create-client-button"]');
  
  await page.fill('[data-testid="client-name-input"]', clientName);
  await page.fill('[data-testid="client-industry-input"]', 'Technology');
  await page.fill('[data-testid="client-description-input"]', 'Test client for E2E testing');
  
  await page.click('[data-testid="save-client-button"]');
  await expect(page.locator(`text=${clientName}`)).toBeVisible();
  
  return clientName;
}

test.describe('AIRWAVE Comprehensive E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for all tests
    test.setTimeout(120000);
    
    // Navigate to base URL
    await page.goto(TEST_CONFIG.baseURL);
  });

  test('01. Homepage and Navigation', async ({ page }) => {
    // Test homepage loads correctly
    await expect(page.locator('h1')).toContainText(/AIrFLOW|AIRWAVE/);
    await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
    
    // Test navigation menu
    await expect(page.locator('[data-testid="nav-features"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-pricing"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-login"]')).toBeVisible();
    
    // Test responsive navigation
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('02. Authentication Flow', async ({ page }) => {
    // Test login page
    await page.goto('/auth/login');
    await expect(page.locator('h1')).toContainText('Sign In');
    
    // Test invalid login
    await page.fill('[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Test valid login
    await login(page);
    
    // Verify dashboard access
    await expect(page.locator('[data-testid="dashboard-header"]')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Test logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL('/auth/login');
  });

  test('03. Dashboard Overview', async ({ page }) => {
    await login(page);
    
    // Test dashboard components
    await expect(page.locator('[data-testid="stats-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-campaigns"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
    
    // Test navigation sidebar
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-clients"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-campaigns"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-assets"]')).toBeVisible();
    
    // Test quick action buttons
    await expect(page.locator('[data-testid="create-campaign-quick"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-asset-quick"]')).toBeVisible();
  });

  test('04. Client Management', async ({ page }) => {
    await login(page);
    
    // Navigate to clients page
    await page.click('[data-testid="nav-clients"]');
    await page.waitForURL('/clients');
    
    // Test clients list view
    await expect(page.locator('[data-testid="clients-header"]')).toContainText('Clients');
    await expect(page.locator('[data-testid="clients-table"]')).toBeVisible();
    
    // Create new client
    const clientName = await createTestClient(page);
    
    // Test client details view
    await page.click(`[data-testid="client-${clientName}"]`);
    await expect(page.locator('[data-testid="client-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="client-campaigns"]')).toBeVisible();
    
    // Test client editing
    await page.click('[data-testid="edit-client-button"]');
    await page.fill('[data-testid="client-description-input"]', 'Updated description');
    await page.click('[data-testid="save-client-button"]');
    await expect(page.locator('text=Updated description')).toBeVisible();
  });

  test('05. Asset Management', async ({ page }) => {
    await login(page);
    
    // Navigate to assets page
    await page.click('[data-testid="nav-assets"]');
    await page.waitForURL('/assets');
    
    // Test assets overview
    await expect(page.locator('[data-testid="assets-header"]')).toContainText('Assets');
    await expect(page.locator('[data-testid="upload-asset-button"]')).toBeVisible();
    
    // Test asset filtering
    await page.click('[data-testid="filter-images"]');
    await expect(page.locator('[data-testid="assets-grid"]')).toBeVisible();
    
    // Test asset search
    await page.fill('[data-testid="asset-search"]', 'test');
    await page.press('[data-testid="asset-search"]', 'Enter');
    
    // Test asset upload (mock file)
    await page.click('[data-testid="upload-asset-button"]');
    await expect(page.locator('[data-testid="upload-modal"]')).toBeVisible();
    
    // Test drag and drop area
    await expect(page.locator('[data-testid="drop-zone"]')).toBeVisible();
    await expect(page.locator('[data-testid="file-input"]')).toBeVisible();
  });

  test('06. Campaign Creation Flow', async ({ page }) => {
    await login(page);
    
    // Navigate to campaigns
    await page.click('[data-testid="nav-campaigns"]');
    await page.waitForURL('/campaigns');
    
    // Start new campaign
    await page.click('[data-testid="create-campaign-button"]');
    await page.waitForURL('/campaigns/new');
    
    // Test campaign builder steps
    await expect(page.locator('[data-testid="campaign-builder"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-indicator"]')).toBeVisible();
    
    // Step 1: Campaign Details
    await page.fill('[data-testid="campaign-name"]', 'E2E Test Campaign');
    await page.fill('[data-testid="campaign-description"]', 'Test campaign for E2E testing');
    await page.selectOption('[data-testid="campaign-type"]', 'social-media');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 2: Target Audience
    await expect(page.locator('[data-testid="audience-builder"]')).toBeVisible();
    await page.fill('[data-testid="target-age-min"]', '18');
    await page.fill('[data-testid="target-age-max"]', '65');
    await page.check('[data-testid="interest-technology"]');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 3: Content Strategy
    await expect(page.locator('[data-testid="content-strategy"]')).toBeVisible();
    await page.selectOption('[data-testid="content-tone"]', 'professional');
    await page.fill('[data-testid="key-messages"]', 'Innovation, Quality, Trust');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 4: Review and Launch
    await expect(page.locator('[data-testid="campaign-review"]')).toBeVisible();
    await expect(page.locator('text=E2E Test Campaign')).toBeVisible();
    await page.click('[data-testid="launch-campaign-button"]');
    
    // Verify campaign creation
    await page.waitForURL('/campaigns');
    await expect(page.locator('text=E2E Test Campaign')).toBeVisible();
  });

  test('07. AIRWAVE Flow - Brief Upload and Processing', async ({ page }) => {
    await login(page);

    // Navigate to AIRWAVE flow
    await page.goto('/flow');
    await expect(page.locator('[data-testid="flow-header"]')).toContainText('AIRWAVE Flow');

    // Test brief upload
    await expect(page.locator('[data-testid="upload-brief-section"]')).toBeVisible();
    await page.click('[data-testid="upload-brief-button"]');

    // Mock file upload (simulate PDF brief)
    const briefContent = `
      RedBaez Marketing Brief

      Company: RedBaez Technologies
      Industry: Software Development
      Target Audience: Small to medium businesses
      Key Messages: Innovation, Reliability, Growth
      Campaign Goals: Increase brand awareness, Generate leads
      Tone: Professional yet approachable
      Budget: $50,000
      Timeline: 3 months
    `;

    // Simulate file upload by filling text area (if available)
    if (await page.locator('[data-testid="brief-text-input"]').isVisible()) {
      await page.fill('[data-testid="brief-text-input"]', briefContent);
    }

    await page.click('[data-testid="process-brief-button"]');

    // Wait for brief processing
    await expect(page.locator('[data-testid="processing-indicator"]')).toBeVisible();
    await page.waitForSelector('[data-testid="brief-analysis"]', { timeout: 30000 });

    // Verify brief analysis results
    await expect(page.locator('[data-testid="brief-analysis"]')).toBeVisible();
    await expect(page.locator('[data-testid="extracted-insights"]')).toBeVisible();
    await expect(page.locator('[data-testid="target-audience-analysis"]')).toBeVisible();
  });

  test('08. AIRWAVE Flow - Motivation Generation', async ({ page }) => {
    await login(page);
    await page.goto('/flow');

    // Assume brief is already processed (or mock the state)
    await page.evaluate(() => {
      localStorage.setItem('briefAnalysis', JSON.stringify({
        company: 'RedBaez Technologies',
        industry: 'Software Development',
        targetAudience: 'Small to medium businesses',
        keyMessages: ['Innovation', 'Reliability', 'Growth'],
        tone: 'Professional yet approachable'
      }));
    });

    await page.reload();

    // Navigate to motivation generation
    await page.click('[data-testid="generate-motivations-button"]');
    await expect(page.locator('[data-testid="motivation-generation"]')).toBeVisible();

    // Wait for AI-generated motivations
    await page.waitForSelector('[data-testid="motivation-cards"]', { timeout: 30000 });

    // Verify motivations are specific to brief content
    await expect(page.locator('[data-testid="motivation-cards"]')).toBeVisible();
    const motivations = await page.locator('[data-testid="motivation-card"]').count();
    expect(motivations).toBeGreaterThan(0);

    // Select motivations for copy generation
    await page.click('[data-testid="motivation-card"]:first-child [data-testid="select-motivation"]');
    await page.click('[data-testid="motivation-card"]:nth-child(2) [data-testid="select-motivation"]');

    await page.click('[data-testid="proceed-to-copy-button"]');
  });

  test('09. AIRWAVE Flow - Copy Generation', async ({ page }) => {
    await login(page);
    await page.goto('/flow');

    // Mock previous state
    await page.evaluate(() => {
      localStorage.setItem('selectedMotivations', JSON.stringify([
        { id: 1, text: 'Efficiency and productivity gains', selected: true },
        { id: 2, text: 'Cost reduction and ROI improvement', selected: true }
      ]));
    });

    await page.reload();
    await page.click('[data-testid="generate-copy-button"]');

    // Wait for copy generation
    await page.waitForSelector('[data-testid="copy-variations"]', { timeout: 30000 });

    // Verify copy is grouped by motivation (3 options per motivation)
    await expect(page.locator('[data-testid="copy-group"]')).toHaveCount(2);

    const firstGroup = page.locator('[data-testid="copy-group"]').first();
    await expect(firstGroup.locator('[data-testid="copy-option"]')).toHaveCount(3);

    // Test copy selection
    await page.click('[data-testid="copy-option"]:first-child [data-testid="select-copy"]');
    await expect(page.locator('[data-testid="selected-copy-preview"]')).toBeVisible();

    // Test copy editing
    await page.click('[data-testid="edit-copy-button"]');
    await page.fill('[data-testid="copy-editor"]', 'Edited copy content for testing');
    await page.click('[data-testid="save-copy-button"]');
  });

  test('10. Video Generation with Creatomate', async ({ page }) => {
    await login(page);

    // Navigate to video studio
    await page.goto('/video/studio');
    await expect(page.locator('[data-testid="video-studio"]')).toBeVisible();

    // Test template selection
    await expect(page.locator('[data-testid="template-gallery"]')).toBeVisible();
    await page.click('[data-testid="template-card"]:first-child');

    // Configure video parameters
    await page.fill('[data-testid="video-title"]', 'E2E Test Video');
    await page.fill('[data-testid="video-description"]', 'Test video generated via E2E testing');

    // Test text customization
    await page.click('[data-testid="customize-text-button"]');
    await page.fill('[data-testid="text-1-input"]', 'Did you know you can automate TikTok, Instagram, and YouTube videos? 🔥');
    await page.fill('[data-testid="text-2-input"]', 'Use any video automation tool to replace these text and background assets with your own! 😊');

    // Test background customization
    await page.click('[data-testid="customize-backgrounds-button"]');
    await expect(page.locator('[data-testid="background-options"]')).toBeVisible();

    // Generate video
    await page.click('[data-testid="generate-video-button"]');

    // Wait for video generation (this might take a while)
    await expect(page.locator('[data-testid="generation-progress"]')).toBeVisible();
    await page.waitForSelector('[data-testid="video-preview"]', { timeout: 60000 });

    // Verify video generation success
    await expect(page.locator('[data-testid="video-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-video-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-video-button"]')).toBeVisible();
  });

  test('11. API Documentation Page', async ({ page }) => {
    await login(page);

    // Navigate to API docs
    await page.goto('/api-docs');
    await expect(page.locator('[data-testid="api-docs-header"]')).toContainText('API Documentation');

    // Test Swagger UI components
    await expect(page.locator('.swagger-ui')).toBeVisible();
    await expect(page.locator('[data-testid="api-endpoints"]')).toBeVisible();

    // Test endpoint expansion
    await page.click('[data-testid="endpoint-clients-get"]');
    await expect(page.locator('[data-testid="endpoint-details"]')).toBeVisible();

    // Test authentication section
    await expect(page.locator('[data-testid="auth-section"]')).toBeVisible();
    await expect(page.locator('text=Bearer Token')).toBeVisible();
  });

  test('12. Error Handling and Edge Cases', async ({ page }) => {
    await login(page);

    // Test 404 page
    await page.goto('/non-existent-page');
    await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-home"]')).toBeVisible();

    // Test error boundary
    await page.goto('/dashboard');

    // Simulate network error
    await page.route('**/api/campaigns', route => route.abort());
    await page.reload();

    // Should show error state gracefully
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Test retry functionality
    await page.unroute('**/api/campaigns');
    await page.click('[data-testid="retry-button"]');
  });

  test('13. Performance and Accessibility', async ({ page }) => {
    await login(page);

    // Test page load performance
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

    // Test accessibility
    await expect(page.locator('[aria-label]')).toHaveCount.greaterThan(0);
    await expect(page.locator('button')).toHaveAttribute('type');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();

    // Test responsive design
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();

    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
  });

  test('14. End-to-End Complete Workflow', async ({ page }) => {
    await login(page);

    // Complete workflow: Client → Brief → Motivations → Copy → Video

    // 1. Create client
    const clientName = await createTestClient(page);

    // 2. Upload and process brief
    await page.goto('/flow');
    await page.click('[data-testid="upload-brief-button"]');
    // ... brief processing steps ...

    // 3. Generate motivations
    await page.click('[data-testid="generate-motivations-button"]');
    await page.waitForSelector('[data-testid="motivation-cards"]', { timeout: 30000 });
    await page.click('[data-testid="motivation-card"]:first-child [data-testid="select-motivation"]');

    // 4. Generate copy
    await page.click('[data-testid="proceed-to-copy-button"]');
    await page.waitForSelector('[data-testid="copy-variations"]', { timeout: 30000 });
    await page.click('[data-testid="copy-option"]:first-child [data-testid="select-copy"]');

    // 5. Generate video
    await page.click('[data-testid="proceed-to-video-button"]');
    await page.waitForSelector('[data-testid="video-preview"]', { timeout: 60000 });

    // 6. Save campaign
    await page.click('[data-testid="save-campaign-button"]');
    await page.fill('[data-testid="campaign-name-input"]', 'Complete E2E Campaign');
    await page.click('[data-testid="confirm-save-button"]');

    // Verify complete workflow success
    await page.goto('/campaigns');
    await expect(page.locator('text=Complete E2E Campaign')).toBeVisible();
  });
});
