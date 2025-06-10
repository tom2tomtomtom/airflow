/**
 * Dashboard Page Object Model
 * Handles interactions with the main dashboard interface
 */

import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  
  // Navigation elements
  readonly sidebar: Locator;
  readonly userMenu: Locator;
  readonly logoLink: Locator;
  
  // Navigation links
  readonly dashboardLink: Locator;
  readonly clientsLink: Locator;
  readonly assetsLink: Locator;
  readonly campaignsLink: Locator;
  readonly matrixLink: Locator;
  readonly flowLink: Locator;
  readonly templatesLink: Locator;
  readonly analyticsLink: Locator;
  
  // Dashboard content
  readonly welcomeMessage: Locator;
  readonly statsCards: Locator;
  readonly recentActivity: Locator;
  readonly quickActions: Locator;
  
  // Client selector
  readonly clientSelector: Locator;
  readonly clientDropdown: Locator;
  readonly selectedClient: Locator;
  
  // Search functionality
  readonly globalSearch: Locator;
  readonly searchResults: Locator;
  
  // Notifications
  readonly notificationBell: Locator;
  readonly notificationPanel: Locator;
  readonly notificationItems: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation elements
    this.sidebar = page.locator('[data-testid="sidebar"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
    this.logoLink = page.locator('[data-testid="logo-link"]');
    
    // Navigation links
    this.dashboardLink = page.locator('[data-testid="nav-dashboard"]');
    this.clientsLink = page.locator('[data-testid="nav-clients"]');
    this.assetsLink = page.locator('[data-testid="nav-assets"]');
    this.campaignsLink = page.locator('[data-testid="nav-campaigns"]');
    this.matrixLink = page.locator('[data-testid="nav-matrix"]');
    this.flowLink = page.locator('[data-testid="nav-flow"]');
    this.templatesLink = page.locator('[data-testid="nav-templates"]');
    this.analyticsLink = page.locator('[data-testid="nav-analytics"]');
    
    // Dashboard content
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.statsCards = page.locator('[data-testid="stats-card"]');
    this.recentActivity = page.locator('[data-testid="recent-activity"]');
    this.quickActions = page.locator('[data-testid="quick-actions"]');
    
    // Client selector
    this.clientSelector = page.locator('[data-testid="client-selector"]');
    this.clientDropdown = page.locator('[data-testid="client-dropdown"]');
    this.selectedClient = page.locator('[data-testid="selected-client"]');
    
    // Search
    this.globalSearch = page.locator('[data-testid="global-search"]');
    this.searchResults = page.locator('[data-testid="search-results"]');
    
    // Notifications
    this.notificationBell = page.locator('[data-testid="notification-bell"]');
    this.notificationPanel = page.locator('[data-testid="notification-panel"]');
    this.notificationItems = page.locator('[data-testid="notification-item"]');
  }

  // Navigation methods
  async goto(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for key elements to be visible
    await Promise.all([
      this.sidebar.waitFor({ state: 'visible' }),
      this.userMenu.waitFor({ state: 'visible' }),
      this.page.waitForLoadState('networkidle')
    ]);
  }

  async navigateToClients(): Promise<void> {
    await this.clientsLink.click();
    await this.page.waitForURL('/clients');
  }

  async navigateToAssets(): Promise<void> {
    await this.assetsLink.click();
    await this.page.waitForURL('/assets');
  }

  async navigateToCampaigns(): Promise<void> {
    await this.campaignsLink.click();
    await this.page.waitForURL('/campaigns');
  }

  async navigateToMatrix(): Promise<void> {
    await this.matrixLink.click();
    await this.page.waitForURL('/matrix');
  }

  async navigateToFlow(): Promise<void> {
    await this.flowLink.click();
    await this.page.waitForURL('/flow');
  }

  async navigateToTemplates(): Promise<void> {
    await this.templatesLink.click();
    await this.page.waitForURL('/templates');
  }

  async navigateToAnalytics(): Promise<void> {
    await this.analyticsLink.click();
    await this.page.waitForURL('/analytics');
  }

  // Client management
  async selectClient(clientName: string): Promise<void> {
    await this.clientSelector.click();
    await this.clientDropdown.waitFor({ state: 'visible' });
    
    const clientOption = this.page.locator(`[data-testid="client-option"]:has-text("${clientName}")`);
    await clientOption.click();
    
    // Wait for selection to update
    await expect(this.selectedClient).toContainText(clientName);
  }

  async getSelectedClient(): Promise<string> {
    return await this.selectedClient.textContent() || '';
  }

  // Search functionality
  async performGlobalSearch(query: string): Promise<void> {
    await this.globalSearch.fill(query);
    await this.globalSearch.press('Enter');
    await this.searchResults.waitFor({ state: 'visible' });
  }

  async getSearchResults(): Promise<string[]> {
    const results = await this.searchResults.locator('[data-testid="search-result-item"]').all();
    return Promise.all(results.map(result => result.textContent() || ''));
  }

  // User menu interactions
  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.page.locator('[data-testid="logout-button"]').click();
    await this.page.waitForURL('/login');
  }

  async openProfile(): Promise<void> {
    await this.openUserMenu();
    await this.page.locator('[data-testid="profile-button"]').click();
  }

  async openSettings(): Promise<void> {
    await this.openUserMenu();
    await this.page.locator('[data-testid="settings-button"]').click();
  }

  // Notification management
  async openNotifications(): Promise<void> {
    await this.notificationBell.click();
    await this.notificationPanel.waitFor({ state: 'visible' });
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.page.locator('[data-testid="notification-badge"]');
    const text = await badge.textContent();
    return text ? parseInt(text) : 0;
  }

  async getNotifications(): Promise<Array<{ title: string; message: string; time: string }>> {
    await this.openNotifications();
    const items = await this.notificationItems.all();
    
    const notifications = [];
    for (const item of items) {
      const title = await item.locator('[data-testid="notification-title"]').textContent() || '';
      const message = await item.locator('[data-testid="notification-message"]').textContent() || '';
      const time = await item.locator('[data-testid="notification-time"]').textContent() || '';
      
      notifications.push({ title, message, time });
    }
    
    return notifications;
  }

  async markNotificationAsRead(index: number): Promise<void> {
    await this.openNotifications();
    const notification = this.notificationItems.nth(index);
    await notification.locator('[data-testid="mark-read-button"]').click();
  }

  // Dashboard stats and activity
  async getStatsCards(): Promise<Array<{ title: string; value: string; change?: string }>> {
    const cards = await this.statsCards.all();
    const stats = [];
    
    for (const card of cards) {
      const title = await card.locator('[data-testid="stat-title"]').textContent() || '';
      const value = await card.locator('[data-testid="stat-value"]').textContent() || '';
      const change = await card.locator('[data-testid="stat-change"]').textContent() || '';
      
      stats.push({ title, value, change });
    }
    
    return stats;
  }

  async getRecentActivity(): Promise<Array<{ action: string; time: string; client?: string }>> {
    const activities = await this.recentActivity.locator('[data-testid="activity-item"]').all();
    const activityList = [];
    
    for (const activity of activities) {
      const action = await activity.locator('[data-testid="activity-action"]').textContent() || '';
      const time = await activity.locator('[data-testid="activity-time"]').textContent() || '';
      const client = await activity.locator('[data-testid="activity-client"]').textContent() || '';
      
      activityList.push({ action, time, client });
    }
    
    return activityList;
  }

  // Quick actions
  async clickQuickAction(actionName: string): Promise<void> {
    const action = this.quickActions.locator(`[data-testid="quick-action"]:has-text("${actionName}")`);
    await action.click();
  }

  async getAvailableQuickActions(): Promise<string[]> {
    const actions = await this.quickActions.locator('[data-testid="quick-action"]').all();
    return Promise.all(actions.map(action => action.textContent() || ''));
  }

  // Responsive design testing
  async testMobileLayout(): Promise<void> {
    // Test that sidebar collapses on mobile
    await this.page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    
    // Sidebar should be hidden or collapsed
    await expect(this.sidebar).toHaveClass(/collapsed|hidden/);
    
    // Mobile menu button should be visible
    const mobileMenuButton = this.page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
  }

  async testTabletLayout(): Promise<void> {
    await this.page.setViewportSize({ width: 768, height: 1024 }); // iPad size
    
    // Sidebar might be condensed but still visible
    await expect(this.sidebar).toBeVisible();
  }

  async testDesktopLayout(): Promise<void> {
    await this.page.setViewportSize({ width: 1920, height: 1080 }); // Desktop size
    
    // Full sidebar should be visible
    await expect(this.sidebar).toBeVisible();
    await expect(this.sidebar).not.toHaveClass(/collapsed/);
  }

  // Performance testing helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    return Date.now() - startTime;
  }

  async waitForAllContent(): Promise<void> {
    // Wait for all major dashboard components to load
    await Promise.all([
      this.statsCards.first().waitFor({ state: 'visible' }),
      this.recentActivity.waitFor({ state: 'visible' }),
      this.quickActions.waitFor({ state: 'visible' })
    ]);
  }

  // Verification methods
  async verifyDashboardElements(): Promise<void> {
    // Verify all essential elements are present
    await expect(this.sidebar).toBeVisible();
    await expect(this.userMenu).toBeVisible();
    await expect(this.logoLink).toBeVisible();
    await expect(this.clientSelector).toBeVisible();
    await expect(this.globalSearch).toBeVisible();
    await expect(this.notificationBell).toBeVisible();
  }

  async verifyNavigation(): Promise<void> {
    // Verify all navigation links are present and clickable
    const navLinks = [
      this.dashboardLink,
      this.clientsLink,
      this.assetsLink,
      this.campaignsLink,
      this.matrixLink,
      this.flowLink,
      this.templatesLink,
      this.analyticsLink
    ];
    
    for (const link of navLinks) {
      await expect(link).toBeVisible();
      await expect(link).toBeEnabled();
    }
  }

  async verifyUserIsLoggedIn(): Promise<void> {
    await expect(this.userMenu).toBeVisible();
    await expect(this.welcomeMessage).toBeVisible();
  }
}