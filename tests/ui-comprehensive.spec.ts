import { test, expect } from '@playwright/test';

test.describe('Comprehensive UI Testing', () => {
  // Test authentication flow in detail
  test.describe('Authentication UI', () => {
    test('should display complete login interface', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Take initial screenshot
      await page.screenshot({ path: 'tests/screenshots/ui-test-login-initial.png', fullPage: true });
      
      // Check for login form elements
      const emailField = page.locator('input[type="email"], input[name="email"]');
      const passwordField = page.locator('input[type="password"], input[name="password"]');
      const loginButton = page.getByRole('button', { name: /sign in|login|log in/i });
      
      if (await emailField.count() > 0) {
        await expect(emailField).toBeVisible();
        await expect(passwordField).toBeVisible();
        await expect(loginButton).toBeVisible();
        
        // Test field interactions
        await emailField.fill('test@example.com');
        await passwordField.fill('testpassword123');
        
        await page.screenshot({ path: 'tests/screenshots/ui-test-login-filled.png', fullPage: true });
        
        // Test form validation if any
        await emailField.fill('invalid-email');
        await page.screenshot({ path: 'tests/screenshots/ui-test-login-validation.png', fullPage: true });
      }
    });

    test('should test signup interface', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Look for signup link
      const signupLink = page.getByText(/sign up|register|create account/i).first();
      
      if (await signupLink.count() > 0) {
        await signupLink.click();
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'tests/screenshots/ui-test-signup-page.png', fullPage: true });
        
        // Test signup form if present
        const signupForm = page.locator('form');
        if (await signupForm.count() > 0) {
          const nameField = page.locator('input[name="name"], input[name="firstName"]');
          const emailField = page.locator('input[type="email"], input[name="email"]');
          const passwordField = page.locator('input[type="password"], input[name="password"]');
          
          if (await nameField.count() > 0) await nameField.fill('Test User');
          if (await emailField.count() > 0) await emailField.fill('newuser@example.com');
          if (await passwordField.count() > 0) await passwordField.fill('SecurePassword123!');
          
          await page.screenshot({ path: 'tests/screenshots/ui-test-signup-filled.png', fullPage: true });
        }
      }
    });
  });

  // Test dashboard and navigation
  test.describe('Dashboard UI', () => {
    test('should test dashboard interface', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-dashboard-full.png', fullPage: true });
      
      // Test navigation elements
      const navigation = page.locator('nav, [role="navigation"]');
      if (await navigation.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-navigation.png' });
      }
      
      // Test sidebar if present
      const sidebar = page.locator('aside, .sidebar');
      if (await sidebar.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-sidebar.png' });
      }
      
      // Test main content area
      const mainContent = page.locator('main, .main-content');
      if (await mainContent.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-main-content.png' });
      }
    });

    test('should test responsive design', async ({ page }) => {
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-mobile-dashboard.png', fullPage: true });
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-tablet-dashboard.png', fullPage: true });
      
      // Reset to desktop
      await page.setViewportSize({ width: 1920, height: 1080 });
    });
  });

  // Test clients page UI
  test.describe('Clients Management UI', () => {
    test('should test clients interface', async ({ page }) => {
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-clients-full.png', fullPage: true });
      
      // Test client cards/list
      const clientCards = page.locator('.client-card, [data-testid="client-card"]');
      const clientList = page.locator('.client-list, [data-testid="client-list"]');
      
      if (await clientCards.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-client-cards.png' });
      }
      
      // Test add client button
      const addButton = page.getByRole('button', { name: /add client|new client|create client/i });
      if (await addButton.count() > 0) {
        await addButton.hover();
        await page.screenshot({ path: 'tests/screenshots/ui-test-add-client-hover.png', fullPage: true });
        
        await addButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/ui-test-add-client-modal.png', fullPage: true });
      }
    });
  });

  // Test assets page UI
  test.describe('Assets Management UI', () => {
    test('should test assets interface', async ({ page }) => {
      await page.goto('/assets');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-assets-full.png', fullPage: true });
      
      // Test asset grid/list view
      const assetGrid = page.locator('.asset-grid, [data-testid="asset-grid"]');
      const assetList = page.locator('.asset-list, [data-testid="asset-list"]');
      
      if (await assetGrid.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-asset-grid.png' });
      }
      
      // Test search functionality
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/ui-test-asset-search.png', fullPage: true });
      }
      
      // Test filter options
      const filterButtons = page.locator('button').filter({ hasText: /filter|type|date/i });
      if (await filterButtons.count() > 0) {
        await filterButtons.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/ui-test-asset-filters.png', fullPage: true });
      }
      
      // Test upload button
      const uploadButton = page.getByRole('button', { name: /upload|add asset/i });
      if (await uploadButton.count() > 0) {
        await uploadButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/ui-test-upload-modal.png', fullPage: true });
      }
    });
  });

  // Test templates page UI
  test.describe('Templates UI', () => {
    test('should test templates interface', async ({ page }) => {
      await page.goto('/templates');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-templates-full.png', fullPage: true });
      
      // Test template gallery
      const templateCards = page.locator('.template-card, [data-testid="template-card"]');
      if (await templateCards.count() > 0) {
        await templateCards.first().hover();
        await page.screenshot({ path: 'tests/screenshots/ui-test-template-hover.png', fullPage: true });
        
        await templateCards.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/ui-test-template-preview.png', fullPage: true });
      }
      
      // Test platform filters
      const platformTabs = page.locator('button').filter({ hasText: /instagram|facebook|twitter|linkedin/i });
      if (await platformTabs.count() > 0) {
        await platformTabs.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/ui-test-platform-filter.png', fullPage: true });
      }
    });
  });

  // Test campaigns page UI
  test.describe('Campaigns UI', () => {
    test('should test campaigns interface', async ({ page }) => {
      await page.goto('/campaigns');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-campaigns-full.png', fullPage: true });
      
      // Test campaign cards
      const campaignCards = page.locator('.campaign-card, [data-testid="campaign-card"]');
      if (await campaignCards.count() > 0) {
        await campaignCards.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/ui-test-campaign-details.png', fullPage: true });
      }
      
      // Test create campaign button
      const createButton = page.getByRole('button', { name: /create|new campaign/i });
      if (await createButton.count() > 0) {
        await createButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/ui-test-create-campaign.png', fullPage: true });
      }
    });
  });

  // Test matrix page UI
  test.describe('Matrix UI', () => {
    test('should test matrix interface', async ({ page }) => {
      await page.goto('/matrix');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-matrix-full.png', fullPage: true });
      
      // Test matrix builder
      const matrixBuilder = page.locator('.matrix-builder, [data-testid="matrix-builder"]');
      if (await matrixBuilder.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-matrix-builder.png' });
      }
      
      // Test add dimension buttons
      const addButtons = page.getByRole('button', { name: /add dimension|add variant/i });
      if (await addButtons.count() > 0) {
        await addButtons.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/ui-test-add-dimension.png', fullPage: true });
      }
    });
  });

  // Test execute page UI
  test.describe('Execute UI', () => {
    test('should test execution interface', async ({ page }) => {
      await page.goto('/execute');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-execute-full.png', fullPage: true });
      
      // Test execution queue
      const executionQueue = page.locator('.execution-queue, [data-testid="execution-queue"]');
      if (await executionQueue.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-execution-queue.png' });
      }
      
      // Test progress indicators
      const progressBars = page.locator('.progress-bar, [role="progressbar"]');
      if (await progressBars.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-progress-bars.png' });
      }
    });
  });

  // Test approvals page UI
  test.describe('Approvals UI', () => {
    test('should test approvals interface', async ({ page }) => {
      await page.goto('/approvals');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-approvals-full.png', fullPage: true });
      
      // Test approval cards
      const approvalCards = page.locator('.approval-card, [data-testid="approval-card"]');
      if (await approvalCards.count() > 0) {
        await approvalCards.first().hover();
        await page.screenshot({ path: 'tests/screenshots/ui-test-approval-hover.png', fullPage: true });
      }
      
      // Test approval actions
      const approveButtons = page.getByRole('button', { name: /approve|reject|request changes/i });
      if (await approveButtons.count() > 0) {
        await approveButtons.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/ui-test-approval-action.png', fullPage: true });
      }
    });
  });

  // Test analytics page UI
  test.describe('Analytics UI', () => {
    test('should test analytics interface', async ({ page }) => {
      await page.goto('/analytics');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-analytics-full.png', fullPage: true });
      
      // Test charts and graphs
      const charts = page.locator('canvas, .chart, [data-testid="chart"]');
      if (await charts.count() > 0) {
        await page.screenshot({ path: 'tests/screenshots/ui-test-charts.png' });
      }
      
      // Test date filters
      const dateInputs = page.locator('input[type="date"]');
      if (await dateInputs.count() > 0) {
        await dateInputs.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'tests/screenshots/ui-test-date-picker.png', fullPage: true });
      }
    });
  });

  // Test social media publishing UI
  test.describe('Social Media Publishing UI', () => {
    test('should test social media publisher component', async ({ page }) => {
      // Navigate to a page that might have the social media publisher
      await page.goto('/campaigns');
      await page.waitForLoadState('networkidle');
      
      // Look for social media related buttons or components
      const socialButtons = page.locator('button').filter({ hasText: /facebook|instagram|twitter|linkedin|publish/i });
      if (await socialButtons.count() > 0) {
        await socialButtons.first().click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'tests/screenshots/ui-test-social-publisher.png', fullPage: true });
      }
      
      // Test if there's a dedicated social media page
      await page.goto('/social');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-social-page.png', fullPage: true });
    });
  });

  // Test error handling and edge cases
  test.describe('Error Handling UI', () => {
    test('should test 404 page', async ({ page }) => {
      await page.goto('/non-existent-page');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-404.png', fullPage: true });
    });

    test('should test error boundaries', async ({ page }) => {
      // Test various error scenarios
      await page.goto('/error-test');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'tests/screenshots/ui-test-error-boundary.png', fullPage: true });
    });
  });

  // Test keyboard navigation and accessibility
  test.describe('Accessibility UI', () => {
    test('should test keyboard navigation', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.screenshot({ path: 'tests/screenshots/ui-test-tab-navigation-1.png', fullPage: true });
      
      await page.keyboard.press('Tab');
      await page.screenshot({ path: 'tests/screenshots/ui-test-tab-navigation-2.png', fullPage: true });
      
      await page.keyboard.press('Tab');
      await page.screenshot({ path: 'tests/screenshots/ui-test-tab-navigation-3.png', fullPage: true });
    });

    test('should test focus indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test focus on interactive elements
      const buttons = page.getByRole('button');
      if (await buttons.count() > 0) {
        await buttons.first().focus();
        await page.screenshot({ path: 'tests/screenshots/ui-test-button-focus.png', fullPage: true });
      }
      
      const links = page.getByRole('link');
      if (await links.count() > 0) {
        await links.first().focus();
        await page.screenshot({ path: 'tests/screenshots/ui-test-link-focus.png', fullPage: true });
      }
    });
  });
});