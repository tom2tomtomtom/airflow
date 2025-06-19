import { test, expect } from '@playwright/test';
import { AuthHelper } from './utils/auth-helper';

test.describe('AIRWAVE Pages Functionality Tests', () => {
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    
    // Login as admin user for all tests
    await authHelper.login('admin@airwave-test.com', 'TestPass123!');
    
    // Navigate to the app
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('Clients page should render and function correctly', async ({ page }) => {
    await page.goto('/clients');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Clients/);
    await expect(page.locator('h1')).toContainText('Clients');
    
    // Check for client management description
    await expect(page.locator('text=Manage your client relationships')).toBeVisible();
    
    // Check for Add Client button
    await expect(page.locator('button:has-text("Add Client")')).toBeVisible();
    
    // Check for loading states or client data
    const clientCards = page.locator('[data-testid="client-card"]');
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    
    // Either loading or client cards should be visible
    await expect(clientCards.first().or(loadingSpinner)).toBeVisible();
    
    // Test Add Client button interaction
    await page.locator('button:has-text("Add Client")').click();
    // Should show notification or modal
    await expect(page.locator('.MuiSnackbar-root, .MuiDialog-root')).toBeVisible({ timeout: 3000 });
  });

  test('Strategic Content page should render with tabs', async ({ page }) => {
    await page.goto('/strategic-content');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Strategic Content/);
    await expect(page.locator('h1')).toContainText('Strategic Content');
    
    // Check for tabs
    await expect(page.locator('[role="tab"]:has-text("Strategy Overview")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Brand Guidelines")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Content Planning")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Performance Insights")')).toBeVisible();
    
    // Test tab navigation
    await page.locator('[role="tab"]:has-text("Brand Guidelines")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    // Test Content Planning tab
    await page.locator('[role="tab"]:has-text("Content Planning")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Generate Enhanced page should render with AI generation tabs', async ({ page }) => {
    await page.goto('/generate-enhanced');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Generate Enhanced/);
    await expect(page.locator('h1')).toContainText('Generate Enhanced');
    
    // Check for AI info alert
    await expect(page.locator('.MuiAlert-root:has-text("AI-powered content generation")')).toBeVisible();
    
    // Check for generation tabs
    await expect(page.locator('[role="tab"]:has-text("Strategic Motivations")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Copy Generation")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Image Generation")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Voice Generation")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Video Generation")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Results")')).toBeVisible();
    
    // Test tab navigation
    await page.locator('[role="tab"]:has-text("Copy Generation")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    // Test Image Generation tab
    await page.locator('[role="tab"]:has-text("Image Generation")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Execute page should render monitoring interface', async ({ page }) => {
    await page.goto('/execute');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Execute/);
    await expect(page.locator('h1')).toContainText('Execute');
    
    // Check for description
    await expect(page.locator('text=Monitor and control campaign execution')).toBeVisible();
    
    // Check for execution stats cards
    await expect(page.locator('text=Active Executions')).toBeVisible();
    await expect(page.locator('text=Completed Today')).toBeVisible();
    await expect(page.locator('text=Failed Tasks')).toBeVisible();
    
    // Check for tabs
    await expect(page.locator('[role="tab"]:has-text("Live Monitor")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Scheduled Tasks")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Execution History")')).toBeVisible();
    
    // Test Start Execution button
    await expect(page.locator('button:has-text("Start Execution")')).toBeVisible();
  });

  test('Approvals page should render workflow interface', async ({ page }) => {
    await page.goto('/approvals');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Approvals/);
    await expect(page.locator('h1')).toContainText('Approvals');
    
    // Check for approval stats
    await expect(page.locator('text=Pending Approval')).toBeVisible();
    await expect(page.locator('text=Approved Today')).toBeVisible();
    await expect(page.locator('text=Rejected')).toBeVisible();
    
    // Check for tabs
    await expect(page.locator('[role="tab"]:has-text("Approval Queue")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Workflow Settings")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Approval History")')).toBeVisible();
    
    // Test approval actions on pending items
    const approveButton = page.locator('button:has-text("Approve")').first();
    const rejectButton = page.locator('button:has-text("Reject")').first();
    
    if (await approveButton.isVisible()) {
      await expect(approveButton).toBeVisible();
      await expect(rejectButton).toBeVisible();
    }
    
    // Test Workflow Settings tab
    await page.locator('[role="tab"]:has-text("Workflow Settings")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Analytics page should render dashboard components', async ({ page }) => {
    await page.goto('/analytics');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Analytics/);
    await expect(page.locator('h1')).toContainText('Analytics');
    
    // Check for info alert
    await expect(page.locator('.MuiAlert-root:has-text("Analytics data will be populated")')).toBeVisible();
    
    // Check for tabs
    await expect(page.locator('[role="tab"]:has-text("Performance Dashboard")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Advanced Analytics")')).toBeVisible();
    
    // Test tab navigation
    await page.locator('[role="tab"]:has-text("Advanced Analytics")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    // Switch back to Performance Dashboard
    await page.locator('[role="tab"]:has-text("Performance Dashboard")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Social Publishing page should render social management interface', async ({ page }) => {
    await page.goto('/social-publishing');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Social Publishing/);
    await expect(page.locator('h1')).toContainText('Social Publishing');
    
    // Check for Create Post button
    await expect(page.locator('button:has-text("Create Post")')).toBeVisible();
    
    // Check for info alert
    await expect(page.locator('.MuiAlert-root:has-text("Connect your social media accounts")')).toBeVisible();
    
    // Check for tabs
    await expect(page.locator('[role="tab"]:has-text("Publisher")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Scheduled Posts")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Analytics")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Enhanced Publisher")')).toBeVisible();
    
    // Test Create Post button
    await page.locator('button:has-text("Create Post")').click();
    // Should trigger some action or navigation
    
    // Test tab navigation
    await page.locator('[role="tab"]:has-text("Scheduled Posts")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    await page.locator('[role="tab"]:has-text("Analytics")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Sign Off page should render approval management interface', async ({ page }) => {
    await page.goto('/sign-off');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Sign Off/);
    await expect(page.locator('h1')).toContainText('Sign Off');
    
    // Check for sign-off stats
    await expect(page.locator('text=Pending Sign-offs')).toBeVisible();
    await expect(page.locator('text=Approved Today')).toBeVisible();
    await expect(page.locator('text=Rejected')).toBeVisible();
    
    // Check for tabs
    await expect(page.locator('[role="tab"]:has-text("Pending Sign-offs")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("Completed")')).toBeVisible();
    await expect(page.locator('[role="tab"]:has-text("All Items")')).toBeVisible();
    
    // Check for sign-off items
    const signOffItems = page.locator('.MuiCard-root').filter({ hasText: 'Request Sign-off' });
    if (await signOffItems.count() > 0) {
      await expect(signOffItems.first()).toBeVisible();
      
      // Test view and download buttons
      await expect(page.locator('button[aria-label="view"]').first()).toBeVisible();
      await expect(page.locator('button[aria-label="download"]').first()).toBeVisible();
    }
    
    // Test tab navigation
    await page.locator('[role="tab"]:has-text("Completed")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
    
    await page.locator('[role="tab"]:has-text("All Items")').click();
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test('Navigation should work correctly between all pages', async ({ page }) => {
    // Start from home
    await page.goto('/');
    
    const pages = [
      { path: '/clients', title: 'Clients' },
      { path: '/strategic-content', title: 'Strategic Content' },
      { path: '/generate-enhanced', title: 'Generate Enhanced' },
      { path: '/execute', title: 'Execute' },
      { path: '/approvals', title: 'Approvals' },
      { path: '/analytics', title: 'Analytics' },
      { path: '/social-publishing', title: 'Social Publishing' },
      { path: '/sign-off', title: 'Sign Off' }
    ];
    
    for (const pageInfo of pages) {
      // Navigate via URL
      await page.goto(pageInfo.path);
      
      // Check page loads correctly
      await expect(page).toHaveTitle(new RegExp(pageInfo.title));
      await expect(page.locator('h1')).toContainText(pageInfo.title);
      
      // Check no JavaScript errors
      const errors: string[] = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
      });
      
      // Wait a moment for any async operations
      await page.waitForTimeout(1000);
      
      // Check for any obvious error states
      await expect(page.locator('text=Error')).toHaveCount(0);
      await expect(page.locator('text=Failed')).toHaveCount(0);
      
      // Verify the page is interactive
      const interactiveElements = page.locator('button, [role="tab"], a').first();
      if (await interactiveElements.count() > 0) {
        await expect(interactiveElements).toBeVisible();
      }
    }
  });

  test('Pages should handle loading states gracefully', async ({ page }) => {
    const pages = ['/clients', '/analytics', '/social-publishing'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Check for loading indicators
      const loadingSpinner = page.locator('[data-testid="loading-spinner"], .MuiCircularProgress-root');
      const skeletonLoaders = page.locator('.MuiSkeleton-root');
      
      // Either content should be loaded or loading indicators should be present
      await page.waitForFunction(
        () => {
          const hasContent = document.querySelector('h1, .MuiCard-root, [role="tabpanel"]');
          const hasLoading = document.querySelector('[data-testid="loading-spinner"], .MuiCircularProgress-root, .MuiSkeleton-root');
          return hasContent || hasLoading;
        },
        { timeout: 10000 }
      );
      
      // Wait for content to stabilize
      await page.waitForLoadState('networkidle');
      
      // Verify no error boundaries triggered
      await expect(page.locator('text=Something went wrong')).toHaveCount(0);
      await expect(page.locator('text=Error Boundary')).toHaveCount(0);
    }
  });
});
