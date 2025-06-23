import { Page, expect } from '@playwright/test';

// Test configuration
export const TEST_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password-123',
  timeout: 30000,
  creatomateTemplate: {
    templateId: process.env.TEST_CREATOMATE_TEMPLATE_ID || 'test-template-id',
    apiKey: process.env.TEST_CREATOMATE_API_KEY || 'test-api-key',
    modifications: {
      'Music.source': 'https://creatomate.com/files/assets/b5dc815e-dcc9-4c62-9405-f94913936bf5',
      'Background-1.source': 'https://creatomate.com/files/assets/4a7903f0-37bc-48df-9d83-5eb52afd5d07',
      'Text-1.text': 'Did you know you can automate TikTok, Instagram, and YouTube videos? 🔥',
      'Background-2.source': 'https://creatomate.com/files/assets/4a6f6b28-bb42-4987-8eca-7ee36b347ee7',
      'Text-2.text': 'Use any video automation tool to replace these text and background assets with your own! 😊',
      'Background-3.source': 'https://creatomate.com/files/assets/4f6963a5-7286-450b-bc64-f87a3a1d8964',
      'Text-3.text': 'Learn how to get started on the Guides & Tutorials page on Creatomate\'s home page.',
      'Background-4.source': 'https://creatomate.com/files/assets/36899eae-a128-43e6-9e97-f2076f54ea18',
      'Text-4.text': 'Use the template editor to completely customize this video to meet your own needs. 🚀'
    }
  }
};

// Authentication helpers
export async function login(page: Page) {
  await page.goto('/auth/login');
  await page.fill('[data-testid="email-input"]', TEST_CONFIG.email);
  await page.fill('[data-testid="password-input"]', TEST_CONFIG.password);
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful login redirect
  await page.waitForURL('/dashboard', { timeout: TEST_CONFIG.timeout });
  await expect(page.locator('[data-testid="dashboard-header"]')).toBeVisible();
}

export async function logout(page: Page) {
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/auth/login');
}

// Client management helpers
export async function createTestClient(page: Page, clientName?: string) {
  const name = clientName || `Test Client ${Date.now()}`;
  
  await page.goto('/clients');
  await page.click('[data-testid="create-client-button"]');
  
  await page.fill('[data-testid="client-name-input"]', name);
  await page.fill('[data-testid="client-industry-input"]', 'Technology');
  await page.fill('[data-testid="client-description-input"]', 'Test client for E2E testing');
  await page.fill('[data-testid="client-email-input"]', 'test@example.com');
  
  await page.click('[data-testid="save-client-button"]');
  await expect(page.locator(`text=${name}`)).toBeVisible();
  
  return name;
}

export async function deleteTestClient(page: Page, clientName: string) {
  await page.goto('/clients');
  await page.click(`[data-testid="client-${clientName}"] [data-testid="delete-button"]`);
  await page.click('[data-testid="confirm-delete-button"]');
  await expect(page.locator(`text=${clientName}`)).not.toBeVisible();
}

// Campaign management helpers
export async function createTestCampaign(page: Page, campaignName?: string) {
  const name = campaignName || `Test Campaign ${Date.now()}`;
  
  await page.goto('/campaigns/new');
  
  // Step 1: Campaign Details
  await page.fill('[data-testid="campaign-name"]', name);
  await page.fill('[data-testid="campaign-description"]', 'Test campaign for E2E testing');
  await page.selectOption('[data-testid="campaign-type"]', 'social-media');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 2: Target Audience
  await page.fill('[data-testid="target-age-min"]', '18');
  await page.fill('[data-testid="target-age-max"]', '65');
  await page.check('[data-testid="interest-technology"]');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 3: Content Strategy
  await page.selectOption('[data-testid="content-tone"]', 'professional');
  await page.fill('[data-testid="key-messages"]', 'Innovation, Quality, Trust');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 4: Review and Launch
  await page.click('[data-testid="launch-campaign-button"]');
  
  await page.waitForURL('/campaigns');
  await expect(page.locator(`text=${name}`)).toBeVisible();
  
  return name;
}

// AIRWAVE Flow helpers
export async function uploadBrief(page: Page, briefContent?: string) {
  const content = briefContent || `
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
  
  await page.goto('/flow');
  await page.click('[data-testid="upload-brief-button"]');
  
  // If text input is available, use it; otherwise simulate file upload
  if (await page.locator('[data-testid="brief-text-input"]').isVisible()) {
    await page.fill('[data-testid="brief-text-input"]', content);
  }
  
  await page.click('[data-testid="process-brief-button"]');
  await page.waitForSelector('[data-testid="brief-analysis"]', { timeout: 30000 });
}

export async function generateMotivations(page: Page) {
  await page.click('[data-testid="generate-motivations-button"]');
  await page.waitForSelector('[data-testid="motivation-cards"]', { timeout: 30000 });
  
  // Select first two motivations
  await page.click('[data-testid="motivation-card"]:first-child [data-testid="select-motivation"]');
  await page.click('[data-testid="motivation-card"]:nth-child(2) [data-testid="select-motivation"]');
  
  await page.click('[data-testid="proceed-to-copy-button"]');
}

export async function generateCopy(page: Page) {
  await page.waitForSelector('[data-testid="copy-variations"]', { timeout: 30000 });
  
  // Select first copy option
  await page.click('[data-testid="copy-option"]:first-child [data-testid="select-copy"]');
  
  await page.click('[data-testid="proceed-to-video-button"]');
}

// Video generation helpers
export async function generateVideo(page: Page, videoTitle?: string) {
  const title = videoTitle || `Test Video ${Date.now()}`;
  
  await page.goto('/video/studio');
  
  // Select template
  await page.click('[data-testid="template-card"]:first-child');
  
  // Configure video
  await page.fill('[data-testid="video-title"]', title);
  await page.fill('[data-testid="video-description"]', 'Test video generated via E2E testing');
  
  // Customize text
  await page.click('[data-testid="customize-text-button"]');
  await page.fill('[data-testid="text-1-input"]', TEST_CONFIG.creatomateTemplate.modifications['Text-1.text']);
  await page.fill('[data-testid="text-2-input"]', TEST_CONFIG.creatomateTemplate.modifications['Text-2.text']);
  
  // Generate video
  await page.click('[data-testid="generate-video-button"]');
  await page.waitForSelector('[data-testid="video-preview"]', { timeout: 60000 });
  
  return title;
}

// API helpers
export async function callCreatomateAPI(page: Page) {
  const response = await page.request.post('https://api.creatomate.com/v1/renders', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_CONFIG.creatomateTemplate.apiKey}`
    },
    data: {
      template_id: TEST_CONFIG.creatomateTemplate.templateId,
      modifications: TEST_CONFIG.creatomateTemplate.modifications
    }
  });
  
  return response;
}

// Utility functions
export async function waitForElement(page: Page, selector: string, timeout = 30000) {
  await page.waitForSelector(selector, { timeout });
  return page.locator(selector);
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
}

export async function checkAccessibility(page: Page) {
  // Basic accessibility checks
  const buttons = await page.locator('button').count();
  const buttonsWithType = await page.locator('button[type]').count();
  
  expect(buttonsWithType).toBeGreaterThan(0);
  
  const ariaLabels = await page.locator('[aria-label]').count();
  expect(ariaLabels).toBeGreaterThan(0);
}

export async function checkResponsive(page: Page) {
  // Test mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page.locator('body')).toBeVisible();
  
  // Test tablet viewport
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('body')).toBeVisible();
  
  // Test desktop viewport
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('body')).toBeVisible();
}

// Performance helpers
export async function measurePageLoad(page: Page, url: string) {
  const startTime = Date.now();
  await page.goto(url);
  const loadTime = Date.now() - startTime;
  
  console.log(`Page load time for ${url}: ${loadTime}ms`);
  expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  
  return loadTime;
}
