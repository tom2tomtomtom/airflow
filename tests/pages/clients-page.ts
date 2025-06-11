/**
 * Clients Page Object Model
 * Handles interactions with client management interface
 */

import { Page, Locator, expect } from '@playwright/test';

export class ClientsPage {
  readonly page: Page;
  
  // Header elements
  readonly pageTitle: Locator;
  readonly createClientButton: Locator;
  readonly searchInput: Locator;
  
  // Client list
  readonly clientsList: Locator;
  readonly clientCards: Locator;
  readonly emptyState: Locator;
  readonly loadingSkeleton: Locator;
  
  // Client creation modal
  readonly createModal: Locator;
  readonly clientNameInput: Locator;
  readonly clientEmailInput: Locator;
  readonly clientIndustrySelect: Locator;
  readonly clientDescriptionInput: Locator;
  readonly logoUploadInput: Locator;
  readonly logoPreview: Locator;
  readonly primaryColorInput: Locator;
  readonly secondaryColorInput: Locator;
  readonly saveClientButton: Locator;
  readonly cancelClientButton: Locator;
  
  // Client actions
  readonly editClientButton: Locator;
  readonly deleteClientButton: Locator;
  readonly selectClientButton: Locator;
  readonly deactivateClientButton: Locator;
  
  // Success/Error messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly validationErrors: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements
    this.pageTitle = page.locator('h4:has-text("Clients")');
    this.createClientButton = page.locator('[data-testid="create-client-button"]');
    this.searchInput = page.locator('[data-testid="search-clients"]');
    
    // Client list
    this.clientsList = page.locator('[data-testid="clients-list"]');
    this.clientCards = page.locator('[data-testid="client-card"]');
    this.emptyState = page.locator('[data-testid="empty-clients"]');
    this.loadingSkeleton = page.locator('[data-testid="loading-skeleton"]');
    
    // Client creation modal
    this.createModal = page.locator('[data-testid="create-client-modal"]');
    this.clientNameInput = page.locator('[data-testid="client-name-input"]');
    this.clientEmailInput = page.locator('[data-testid="client-email-input"]');
    this.clientIndustrySelect = page.locator('[data-testid="client-industry-select"]');
    this.clientDescriptionInput = page.locator('[data-testid="client-description-input"]');
    this.logoUploadInput = page.locator('[data-testid="logo-upload-input"]');
    this.logoPreview = page.locator('[data-testid="logo-preview"]');
    this.primaryColorInput = page.locator('[data-testid="primary-color-input"]');
    this.secondaryColorInput = page.locator('[data-testid="secondary-color-input"]');
    this.saveClientButton = page.locator('[data-testid="save-client-button"]');
    this.cancelClientButton = page.locator('[data-testid="cancel-client-button"]');
    
    // Client actions
    this.editClientButton = page.locator('[data-testid="edit-client-button"]');
    this.deleteClientButton = page.locator('[data-testid="delete-client-button"]');
    this.selectClientButton = page.locator('[data-testid="select-client-button"]');
    this.deactivateClientButton = page.locator('[data-testid="deactivate-client-button"]');
    
    // Messages
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.validationErrors = page.locator('[data-testid="validation-error"]');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/clients');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
    
    try {
      // Either clients load or empty state appears
      await Promise.race([
        this.clientCards.first().waitFor({ state: 'visible', timeout: 5000 }),
        this.emptyState.waitFor({ state: 'visible', timeout: 5000 })
      ]);
    } catch (error) {
      // Clients might be loading, wait for skeleton to disappear
      await this.loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  // Client creation
  async openCreateClientModal(): Promise<void> {
    await this.createClientButton.click();
    await this.createModal.waitFor({ state: 'visible' });
  }

  async closeCreateClientModal(): Promise<void> {
    await this.cancelClientButton.click();
    await this.createModal.waitFor({ state: 'hidden' });
  }

  async createClient(clientData: {
    name: string;
    email?: string;
    industry?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }): Promise<void> {
    await this.openCreateClientModal();
    
    await this.clientNameInput.fill(clientData.name);
    
    if (clientData.email) {
      await this.clientEmailInput.fill(clientData.email);
    }
    
    if (clientData.industry) {
      await this.clientIndustrySelect.selectOption(clientData.industry);
    }
    
    if (clientData.description) {
      await this.clientDescriptionInput.fill(clientData.description);
    }
    
    if (clientData.primaryColor) {
      await this.primaryColorInput.fill(clientData.primaryColor);
    }
    
    if (clientData.secondaryColor) {
      await this.secondaryColorInput.fill(clientData.secondaryColor);
    }
    
    await this.saveClientButton.click();
    
    // Wait for creation to complete
    await Promise.race([
      this.successMessage.waitFor({ state: 'visible', timeout: 10000 }),
      this.errorMessage.waitFor({ state: 'visible', timeout: 10000 }),
      this.createModal.waitFor({ state: 'hidden', timeout: 10000 })
    ]);
  }

  async createClientAndExpectSuccess(clientData: {
    name: string;
    email?: string;
    industry?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }): Promise<void> {
    await this.createClient(clientData);
    
    // Should either show success message or close modal
    const modalClosed = await this.createModal.isHidden();
    const hasSuccessMessage = await this.successMessage.isVisible();
    
    expect(modalClosed || hasSuccessMessage).toBeTruthy();
  }

  async createClientAndExpectError(clientData: {
    name: string;
    email?: string;
    industry?: string;
    description?: string;
  }): Promise<void> {
    await this.createClient(clientData);
    
    await expect(this.errorMessage).toBeVisible();
  }

  async uploadClientLogo(logoPath: string): Promise<void> {
    await this.logoUploadInput.setInputFiles(logoPath);
    await this.logoPreview.waitFor({ state: 'visible' });
  }

  // Client management
  async searchClients(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForClientsToLoad();
  }

  async getClientCount(): Promise<number> {
    return await this.clientCards.count();
  }

  async getClientNames(): Promise<string[]> {
    const cards = await this.clientCards.all();
    const names = [];
    
    for (const card of cards) {
      const nameElement = card.locator('[data-testid="client-name"]');
      const name = await nameElement.textContent();
      if (name) names.push(name.trim());
    }
    
    return names;
  }

  async selectClient(clientName: string): Promise<void> {
    const client = this.getClientByName(clientName);
    const selectButton = client.locator('[data-testid="select-client-button"]');
    await selectButton.click();
    
    // Wait for client selection to update
    await this.page.waitForTimeout(1000);
  }

  async editClient(clientName: string, newData: {
    name?: string;
    email?: string;
    industry?: string;
    description?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }): Promise<void> {
    const client = this.getClientByName(clientName);
    const editButton = client.locator('[data-testid="edit-client-button"]');
    await editButton.click();
    
    // Wait for edit modal to open
    const editModal = this.page.locator('[data-testid="edit-client-modal"]');
    await editModal.waitFor({ state: 'visible' });
    
    if (newData.name) {
      await this.clientNameInput.clear();
      await this.clientNameInput.fill(newData.name);
    }
    
    if (newData.email) {
      await this.clientEmailInput.clear();
      await this.clientEmailInput.fill(newData.email);
    }
    
    if (newData.industry) {
      await this.clientIndustrySelect.selectOption(newData.industry);
    }
    
    if (newData.description) {
      await this.clientDescriptionInput.clear();
      await this.clientDescriptionInput.fill(newData.description);
    }
    
    if (newData.primaryColor) {
      await this.primaryColorInput.fill(newData.primaryColor);
    }
    
    if (newData.secondaryColor) {
      await this.secondaryColorInput.fill(newData.secondaryColor);
    }
    
    const saveButton = this.page.locator('[data-testid="save-edit-button"]');
    await saveButton.click();
    
    await editModal.waitFor({ state: 'hidden' });
  }

  async deleteClient(clientName: string): Promise<void> {
    const client = this.getClientByName(clientName);
    const deleteButton = client.locator('[data-testid="delete-client-button"]');
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = this.page.locator('[data-testid="confirm-delete-button"]');
    await confirmButton.click();
    
    await this.waitForClientsToLoad();
  }

  async deactivateClient(clientName: string): Promise<void> {
    const client = this.getClientByName(clientName);
    const deactivateButton = client.locator('[data-testid="deactivate-client-button"]');
    await deactivateButton.click();
    
    // Confirm deactivation
    const confirmButton = this.page.locator('[data-testid="confirm-deactivate-button"]');
    await confirmButton.click();
    
    await this.waitForClientsToLoad();
  }

  // Validation testing
  async testClientNameValidation(): Promise<void> {
    await this.openCreateClientModal();
    
    // Test empty name
    await this.clientNameInput.fill('');
    await this.saveClientButton.click();
    
    await expect(this.validationErrors).toBeVisible();
    await expect(this.validationErrors).toContainText(/name.*required/i);
    
    await this.closeCreateClientModal();
  }

  async testEmailValidation(): Promise<void> {
    await this.openCreateClientModal();
    
    await this.clientNameInput.fill('Test Client');
    
    // Test invalid email
    const invalidEmails = ['invalid', 'test@', '@domain.com'];
    
    for (const email of invalidEmails) {
      await this.clientEmailInput.fill(email);
      await this.saveClientButton.click();
      
      await expect(this.validationErrors).toBeVisible();
      await this.clientEmailInput.clear();
    }
    
    await this.closeCreateClientModal();
  }

  async testColorValidation(): Promise<void> {
    await this.openCreateClientModal();
    
    await this.clientNameInput.fill('Test Client');
    
    // Test invalid color format
    await this.primaryColorInput.fill('invalid-color');
    await this.saveClientButton.click();
    
    // Should show validation error or reset to valid color
    const hasError = await this.validationErrors.isVisible();
    const colorValue = await this.primaryColorInput.inputValue();
    
    expect(hasError || colorValue !== 'invalid-color').toBeTruthy();
    
    await this.closeCreateClientModal();
  }

  // Helper methods
  private getClientByName(name: string): Locator {
    return this.clientCards.filter({ hasText: name });
  }

  private async waitForClientsToLoad(): Promise<void> {
    await this.loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
    await this.page.waitForTimeout(500);
  }

  // Performance testing
  async measureClientLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    await this.waitForLoad();
    return Date.now() - startTime;
  }

  async measureClientCreationTime(clientData: {
    name: string;
    email?: string;
    industry?: string;
    description?: string;
  }): Promise<number> {
    const startTime = Date.now();
    await this.createClientAndExpectSuccess(clientData);
    return Date.now() - startTime;
  }

  // Verification methods
  async verifyClientExists(clientName: string): Promise<boolean> {
    const client = this.getClientByName(clientName);
    return await client.isVisible();
  }

  async verifyClientDeleted(clientName: string): Promise<boolean> {
    const client = this.getClientByName(clientName);
    return !(await client.isVisible());
  }

  async verifyEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.clientCards).toHaveCount(0);
  }

  async verifyClientsLoaded(): Promise<void> {
    await expect(this.clientCards.first()).toBeVisible();
    await expect(this.loadingSkeleton).not.toBeVisible();
  }

  async verifyCreateClientModal(): Promise<void> {
    await this.openCreateClientModal();
    
    await expect(this.createModal).toBeVisible();
    await expect(this.clientNameInput).toBeVisible();
    await expect(this.saveClientButton).toBeVisible();
    await expect(this.cancelClientButton).toBeVisible();
    
    await this.closeCreateClientModal();
  }

  // Mobile testing
  async testMobileLayout(): Promise<void> {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.goto();
    
    // Verify mobile-friendly layout
    await expect(this.pageTitle).toBeVisible();
    await expect(this.createClientButton).toBeVisible();
    
    // Cards should stack vertically
    const cards = await this.clientCards.all();
    if (cards.length >= 2) {
      const firstCardBounds = await cards[0].boundingBox();
      const secondCardBounds = await cards[1].boundingBox();
      
      // Second card should be below first card (mobile stack)
      expect(secondCardBounds?.y).toBeGreaterThan(firstCardBounds?.y || 0);
    }
  }

  // Accessibility testing
  async testKeyboardNavigation(): Promise<void> {
    await this.goto();
    
    // Tab through interactive elements
    await this.page.keyboard.press('Tab'); // Create client button
    await expect(this.createClientButton).toBeFocused();
    
    await this.page.keyboard.press('Tab'); // Search input
    await expect(this.searchInput).toBeFocused();
    
    // Test that Enter key opens create modal
    await this.createClientButton.focus();
    await this.page.keyboard.press('Enter');
    await expect(this.createModal).toBeVisible();
    
    // Test ESC key closes modal
    await this.page.keyboard.press('Escape');
    await expect(this.createModal).not.toBeVisible();
  }

  async testScreenReaderSupport(): Promise<void> {
    await this.goto();
    
    // Check ARIA labels and roles
    const createButtonRole = await this.createClientButton.getAttribute('role');
    const createButtonLabel = await this.createClientButton.getAttribute('aria-label');
    
    expect(createButtonRole || createButtonLabel).toBeTruthy();
    
    // Check that form inputs have proper labels
    await this.openCreateClientModal();
    
    const nameInputLabel = await this.clientNameInput.getAttribute('aria-label') ||
                           await this.clientNameInput.getAttribute('placeholder');
    expect(nameInputLabel).toMatch(/name/i);
    
    await this.closeCreateClientModal();
  }

  // Error scenarios
  async testNetworkErrorHandling(): Promise<void> {
    // Mock network failure
    await this.page.route('**/api/clients**', route => route.abort());
    
    await this.goto();
    
    // Should show error state or retry message
    const errorState = this.page.locator('[data-testid="error-state"]');
    const retryButton = this.page.locator('[data-testid="retry-button"]');
    
    await expect(errorState.or(retryButton)).toBeVisible();
    
    // Restore network
    await this.page.unroute('**/api/clients**');
  }

  async testCreateClientWithServerError(): Promise<void> {
    // Mock server error for client creation
    await this.page.route('**/api/clients', route => {
      if (route.request().method() === 'POST') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal server error' })
        });
      } else {
        route.continue();
      }
    });
    
    await this.createClientAndExpectError({
      name: 'Test Client',
      email: 'test@example.com'
    });
    
    const errorText = await this.errorMessage.textContent();
    expect(errorText).toMatch(/error|problem|try.*again/i);
    
    // Restore network
    await this.page.unroute('**/api/clients');
  }

  // Client context switching
  async testClientContextSwitching(): Promise<void> {
    const clients = await this.getClientNames();
    
    if (clients.length >= 2) {
      // Select first client
      await this.selectClient(clients[0]);
      
      // Navigate to another page and back
      await this.page.goto('/dashboard');
      await this.page.goto('/clients');
      
      // Client context should persist
      const selectedClient = this.page.locator('[data-testid="current-client"]');
      if (await selectedClient.isVisible()) {
        const selectedClientText = await selectedClient.textContent();
        expect(selectedClientText).toContain(clients[0]);
      }
    }
  }
}