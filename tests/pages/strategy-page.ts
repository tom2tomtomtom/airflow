import { getErrorMessage } from '@/utils/errorUtils';
/**
 * Strategy Development Page Object Model
 * Handles interactions with brief creation and AI strategy development
 */

import { Page, Locator, expect } from '@playwright/test';

export class StrategyPage {
  readonly page: Page;
  
  // Header elements
  readonly pageTitle: Locator;
  readonly newBriefButton: Locator;
  readonly briefHistory: Locator;
  
  // Brief creation methods
  readonly briefMethodTabs: Locator;
  readonly textInputTab: Locator;
  readonly documentUploadTab: Locator;
  readonly templateTab: Locator;
  
  // Text input form
  readonly briefTextArea: Locator;
  readonly brandGuidelinesSection: Locator;
  readonly targetAudienceInput: Locator;
  readonly keyMessagesInput: Locator;
  readonly callToActionInput: Locator;
  readonly tonalitySelect: Locator;
  readonly channelSelectors: Locator;
  
  // Document upload
  readonly documentUploadZone: Locator;
  readonly uploadedDocument: Locator;
  readonly documentPreview: Locator;
  readonly extractedTextPreview: Locator;
  readonly documentParseProgress: Locator;
  readonly documentParseError: Locator;
  
  // Template selection
  readonly templateGrid: Locator;
  readonly templateCards: Locator;
  readonly templatePreview: Locator;
  readonly customizeTemplateButton: Locator;
  
  // AI Processing
  readonly processButton: Locator;
  readonly processingIndicator: Locator;
  readonly processingStatus: Locator;
  readonly aiProcessingModal: Locator;
  readonly retryProcessingButton: Locator;
  
  // Strategy Results
  readonly strategyResults: Locator;
  readonly motivationsSection: Locator;
  readonly motivationCards: Locator;
  readonly copySection: Locator;
  readonly copyVariations: Locator;
  readonly regenerateButton: Locator;
  readonly approveStrategyButton: Locator;
  readonly editStrategyButton: Locator;
  
  // Motivation Management
  readonly motivationSelector: Locator;
  readonly motivationPreview: Locator;
  readonly motivationScore: Locator;
  readonly addMotivationButton: Locator;
  readonly removeMotivationButton: Locator;
  
  // Copy Generation
  readonly copyLengthSelector: Locator;
  readonly copyToneSelector: Locator;
  readonly copyFormatSelector: Locator;
  readonly generateCopyButton: Locator;
  readonly copyPreview: Locator;
  readonly copyVariationTabs: Locator;
  readonly copySaveButton: Locator;
  
  // Strategy Management
  readonly saveStrategyButton: Locator;
  readonly strategyNameInput: Locator;
  readonly strategyDescriptionInput: Locator;
  readonly strategyTagsInput: Locator;
  readonly strategyVersions: Locator;
  
  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly warningMessage: Locator;
  readonly loadingMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements
    this.pageTitle = page.locator('h4:has-text("Strategy")');
    this.newBriefButton = page.locator('[data-testid="new-brief-button"]');
    this.briefHistory = page.locator('[data-testid="brief-history"]');
    
    // Brief creation methods
    this.briefMethodTabs = page.locator('[data-testid="brief-method-tabs"]');
    this.textInputTab = page.locator('[data-testid="text-input-tab"]');
    this.documentUploadTab = page.locator('[data-testid="document-upload-tab"]');
    this.templateTab = page.locator('[data-testid="template-tab"]');
    
    // Text input form
    this.briefTextArea = page.locator('[data-testid="brief-textarea"]');
    this.brandGuidelinesSection = page.locator('[data-testid="brand-guidelines"]');
    this.targetAudienceInput = page.locator('[data-testid="target-audience-input"]');
    this.keyMessagesInput = page.locator('[data-testid="key-messages-input"]');
    this.callToActionInput = page.locator('[data-testid="call-to-action-input"]');
    this.tonalitySelect = page.locator('[data-testid="tonality-select"]');
    this.channelSelectors = page.locator('[data-testid="channel-selector"]');
    
    // Document upload
    this.documentUploadZone = page.locator('[data-testid="document-upload-zone"]');
    this.uploadedDocument = page.locator('[data-testid="uploaded-document"]');
    this.documentPreview = page.locator('[data-testid="document-preview"]');
    this.extractedTextPreview = page.locator('[data-testid="extracted-text-preview"]');
    this.documentParseProgress = page.locator('[data-testid="document-parse-progress"]');
    this.documentParseError = page.locator('[data-testid="document-parse-error"]');
    
    // Template selection
    this.templateGrid = page.locator('[data-testid="template-grid"]');
    this.templateCards = page.locator('[data-testid="template-card"]');
    this.templatePreview = page.locator('[data-testid="template-preview"]');
    this.customizeTemplateButton = page.locator('[data-testid="customize-template-button"]');
    
    // AI Processing
    this.processButton = page.locator('[data-testid="process-brief-button"]');
    this.processingIndicator = page.locator('[data-testid="processing-indicator"]');
    this.processingStatus = page.locator('[data-testid="processing-status"]');
    this.aiProcessingModal = page.locator('[data-testid="ai-processing-modal"]');
    this.retryProcessingButton = page.locator('[data-testid="retry-processing-button"]');
    
    // Strategy Results
    this.strategyResults = page.locator('[data-testid="strategy-results"]');
    this.motivationsSection = page.locator('[data-testid="motivations-section"]');
    this.motivationCards = page.locator('[data-testid="motivation-card"]');
    this.copySection = page.locator('[data-testid="copy-section"]');
    this.copyVariations = page.locator('[data-testid="copy-variation"]');
    this.regenerateButton = page.locator('[data-testid="regenerate-strategy-button"]');
    this.approveStrategyButton = page.locator('[data-testid="approve-strategy-button"]');
    this.editStrategyButton = page.locator('[data-testid="edit-strategy-button"]');
    
    // Motivation Management
    this.motivationSelector = page.locator('[data-testid="motivation-selector"]');
    this.motivationPreview = page.locator('[data-testid="motivation-preview"]');
    this.motivationScore = page.locator('[data-testid="motivation-score"]');
    this.addMotivationButton = page.locator('[data-testid="add-motivation-button"]');
    this.removeMotivationButton = page.locator('[data-testid="remove-motivation-button"]');
    
    // Copy Generation
    this.copyLengthSelector = page.locator('[data-testid="copy-length-selector"]');
    this.copyToneSelector = page.locator('[data-testid="copy-tone-selector"]');
    this.copyFormatSelector = page.locator('[data-testid="copy-format-selector"]');
    this.generateCopyButton = page.locator('[data-testid="generate-copy-button"]');
    this.copyPreview = page.locator('[data-testid="copy-preview"]');
    this.copyVariationTabs = page.locator('[data-testid="copy-variation-tab"]');
    this.copySaveButton = page.locator('[data-testid="copy-save-button"]');
    
    // Strategy Management
    this.saveStrategyButton = page.locator('[data-testid="save-strategy-button"]');
    this.strategyNameInput = page.locator('[data-testid="strategy-name-input"]');
    this.strategyDescriptionInput = page.locator('[data-testid="strategy-description-input"]');
    this.strategyTagsInput = page.locator('[data-testid="strategy-tags-input"]');
    this.strategyVersions = page.locator('[data-testid="strategy-versions"]');
    
    // Messages
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.warningMessage = page.locator('[data-testid="warning-message"]');
    this.loadingMessage = page.locator('[data-testid="loading-message"]');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/flow');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  // Brief Creation - Text Input
  async createBriefWithTextInput(briefData: {
    briefText: string;
    targetAudience?: string;
    keyMessages?: string;
    callToAction?: string;
    tonality?: string;
    channels?: string[];
  }): Promise<void> {
    await this.startNewBrief();
    await this.textInputTab.click();
    
    await this.briefTextArea.fill(briefData.briefText);
    
    if (briefData.targetAudience) {
      await this.targetAudienceInput.fill(briefData.targetAudience);
    }
    
    if (briefData.keyMessages) {
      await this.keyMessagesInput.fill(briefData.keyMessages);
    }
    
    if (briefData.callToAction) {
      await this.callToActionInput.fill(briefData.callToAction);
    }
    
    if (briefData.tonality) {
      await this.tonalitySelect.selectOption(briefData.tonality);
    }
    
    if (briefData.channels) {
      for (const channel of briefData.channels) {
        const channelCheckbox = this.channelSelectors.filter({ hasText: channel });
        await channelCheckbox.check();
      }
    }
  }

  // Brief Creation - Document Upload
  async createBriefWithDocument(documentPath: string): Promise<void> {
    await this.startNewBrief();
    await this.documentUploadTab.click();
    
    await this.documentUploadZone.setInputFiles(documentPath);
    
    // Wait for document processing
    await this.waitForDocumentProcessing();
  }

  async waitForDocumentProcessing(timeoutMs: number = 30000): Promise<void> {
    // Wait for parsing to complete
    await this.documentParseProgress.waitFor({ state: 'visible', timeout: 5000 });
    
    try {
      await this.extractedTextPreview.waitFor({ state: 'visible', timeout: timeoutMs });
    } catch (error) {
    const message = getErrorMessage(error);
      // Check if there was a parsing error
      const hasError = await this.documentParseError.isVisible();
      if (hasError) {
        const errorText = await this.documentParseError.textContent();
        throw new Error(`Document parsing failed: ${errorText}`);
      }
      throw error;
    }
  }

  // Brief Creation - Template
  async createBriefWithTemplate(templateName: string): Promise<void> {
    await this.startNewBrief();
    await this.templateTab.click();
    
    await this.templateGrid.waitFor({ state: 'visible' });
    
    const template = this.templateCards.filter({ hasText: templateName });
    await template.click();
    
    await this.templatePreview.waitFor({ state: 'visible' });
    await this.customizeTemplateButton.click();
  }

  async startNewBrief(): Promise<void> {
    await this.newBriefButton.click();
    await this.briefMethodTabs.waitFor({ state: 'visible' });
  }

  // AI Processing
  async processBrief(): Promise<void> {
    await this.processButton.click();
    await this.aiProcessingModal.waitFor({ state: 'visible' });
    
    // Wait for processing to complete
    await this.waitForAIProcessing();
  }

  async waitForAIProcessing(timeoutMs: number = 60000): Promise<void> {
    try {
      // Wait for processing to complete and results to appear
      await this.strategyResults.waitFor({ state: 'visible', timeout: timeoutMs });
      await this.aiProcessingModal.waitFor({ state: 'hidden' });
    } catch (error) {
    const message = getErrorMessage(error);
      // Check if processing failed
      const hasRetryButton = await this.retryProcessingButton.isVisible();
      if (hasRetryButton) {
        const statusText = await this.processingStatus.textContent();
        throw new Error(`AI processing failed: ${statusText}`);
      }
      throw error;
    }
  }

  async retryAIProcessing(): Promise<void> {
    await this.retryProcessingButton.click();
    await this.waitForAIProcessing();
  }

  // Strategy Results Management
  async getGeneratedMotivations(): Promise<Array<{ title: string; score: number; content: string }>> {
    const motivations = await this.motivationCards.all();
    const motivationData = [];
    
    for (const motivation of motivations) {
      const title = await motivation.locator('[data-testid="motivation-title"]').textContent() || '';
      const scoreText = await motivation.locator('[data-testid="motivation-score"]').textContent() || '0';
      const score = parseInt(scoreText.match(/\d+/)?.[0] || '0');
      const content = await motivation.locator('[data-testid="motivation-content"]').textContent() || '';
      
      motivationData.push({ title, score, content });
    }
    
    return motivationData;
  }

  async selectMotivation(motivationTitle: string): Promise<void> {
    const motivation = this.motivationCards.filter({ hasText: motivationTitle });
    await motivation.click();
    
    // Wait for motivation to be selected
    await expect(motivation).toHaveClass(/selected|active/);
  }

  async removeMotivation(motivationTitle: string): Promise<void> {
    const motivation = this.motivationCards.filter({ hasText: motivationTitle });
    const removeButton = motivation.locator('[data-testid="remove-motivation-button"]');
    await removeButton.click();
    
    // Wait for motivation to be removed
    await expect(motivation).not.toBeVisible();
  }

  async addCustomMotivation(motivationText: string): Promise<void> {
    await this.addMotivationButton.click();
    
    const customMotivationInput = this.page.locator('[data-testid="custom-motivation-input"]');
    await customMotivationInput.fill(motivationText);
    
    const addButton = this.page.locator('[data-testid="add-custom-motivation-button"]');
    await addButton.click();
    
    // Wait for new motivation to appear
    await this.motivationCards.filter({ hasText: motivationText }).waitFor({ state: 'visible' });
  }

  // Copy Generation
  async generateCopy(options?: {
    length?: 'short' | 'medium' | 'long';
    tone?: 'professional' | 'casual' | 'urgent' | 'friendly';
    format?: 'social' | 'email' | 'ad' | 'blog';
  }): Promise<void> {
    if (options?.length) {
      await this.copyLengthSelector.selectOption(options.length);
    }
    
    if (options?.tone) {
      await this.copyToneSelector.selectOption(options.tone);
    }
    
    if (options?.format) {
      await this.copyFormatSelector.selectOption(options.format);
    }
    
    await this.generateCopyButton.click();
    
    // Wait for copy generation
    await this.waitForCopyGeneration();
  }

  async waitForCopyGeneration(timeoutMs: number = 30000): Promise<void> {
    await this.copyPreview.waitFor({ state: 'visible', timeout: timeoutMs });
  }

  async getGeneratedCopyVariations(): Promise<string[]> {
    const variations = await this.copyVariations.all();
    const copyTexts = [];
    
    for (const variation of variations) {
      const copyText = await variation.locator('[data-testid="copy-text"]').textContent();
      if (copyText) copyTexts.push(copyText);
    }
    
    return copyTexts;
  }

  async selectCopyVariation(index: number): Promise<void> {
    const variation = this.copyVariationTabs.nth(index);
    await variation.click();
    
    await expect(variation).toHaveClass(/active|selected/);
  }

  async saveCopyVariation(): Promise<void> {
    await this.copySaveButton.click();
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async regenerateStrategy(): Promise<void> {
    await this.regenerateButton.click();
    await this.waitForAIProcessing();
  }

  // Strategy Management
  async saveStrategy(strategyData: {
    name: string;
    description?: string;
    tags?: string[];
  }): Promise<void> {
    await this.saveStrategyButton.click();
    
    const saveModal = this.page.locator('[data-testid="save-strategy-modal"]');
    await saveModal.waitFor({ state: 'visible' });
    
    await this.strategyNameInput.fill(strategyData.name);
    
    if (strategyData.description) {
      await this.strategyDescriptionInput.fill(strategyData.description);
    }
    
    if (strategyData.tags) {
      for (const tag of strategyData.tags) {
        await this.strategyTagsInput.fill(tag);
        await this.strategyTagsInput.press('Enter');
      }
    }
    
    const confirmSaveButton = this.page.locator('[data-testid="confirm-save-strategy-button"]');
    await confirmSaveButton.click();
    
    await saveModal.waitFor({ state: 'hidden' });
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async approveStrategy(): Promise<void> {
    await this.approveStrategyButton.click();
    
    const approvalModal = this.page.locator('[data-testid="approval-modal"]');
    if (await approvalModal.isVisible()) {
      const confirmButton = this.page.locator('[data-testid="confirm-approval-button"]');
      await confirmButton.click();
      await approvalModal.waitFor({ state: 'hidden' });
    }
    
    await this.successMessage.waitFor({ state: 'visible' });
  }

  // Performance Testing
  async measureBriefProcessingTime(briefText: string): Promise<number> {
    await this.createBriefWithTextInput({ briefText });
    
    const startTime = Date.now();
    await this.processBrief();
    return Date.now() - startTime;
  }

  async measureCopyGenerationTime(): Promise<number> {
    const startTime = Date.now();
    await this.generateCopy();
    return Date.now() - startTime;
  }

  // Validation Testing
  async testEmptyBriefValidation(): Promise<void> {
    await this.startNewBrief();
    await this.textInputTab.click();
    
    // Try to process empty brief
    await this.processButton.click();
    
    await expect(this.errorMessage).toBeVisible();
    const errorText = await this.errorMessage.textContent();
    expect(errorText).toMatch(/brief.*required|content.*required/i);
  }

  async testInvalidDocumentUpload(): Promise<void> {
    await this.startNewBrief();
    await this.documentUploadTab.click();
    
    // Try to upload invalid file type
    const invalidFile = Buffer.from('invalid content');
    await this.documentUploadZone.setInputFiles([{
      name: 'invalid.xyz',
      mimeType: 'application/octet-stream',
      buffer: invalidFile
    }]);
    
    await expect(this.documentParseError).toBeVisible();
  }

  // UX Testing
  async testRealTimePreviewUpdates(): Promise<void> {
    await this.createBriefWithTextInput({
      briefText: 'Test brief content',
      targetAudience: 'Young professionals'
    });
    
    await this.processBrief();
    
    // Modify target audience and check if preview updates
    await this.editStrategyButton.click();
    await this.targetAudienceInput.clear();
    await this.targetAudienceInput.fill('Senior executives');
    
    // Preview should update or show loading state
    const hasUpdated = await Promise.race([
      this.loadingMessage.waitFor({ state: 'visible', timeout: 2000 }).then(() => true),
      this.motivationPreview.waitFor({ state: 'visible', timeout: 2000 }).then(() => true)
    ]).catch(() => false);
    
    expect(hasUpdated).toBeTruthy();
  }

  async testProgressIndicatorAccuracy(): Promise<void> {
    await this.createBriefWithTextInput({
      briefText: 'Test brief for progress indicator testing'
    });
    
    await this.processButton.click();
    
    // Monitor processing status updates
    const statusUpdates = [];
    let currentStatus = '';
    
    while (await this.aiProcessingModal.isVisible() && statusUpdates.length < 10) {
      const status = await this.processingStatus.textContent();
      if (status && status !== currentStatus) {
        statusUpdates.push(status);
        currentStatus = status;
      }
      await this.page.waitForTimeout(1000);
    }
    
    // Should have multiple meaningful status updates
    expect(statusUpdates.length).toBeGreaterThan(1);
    expect(statusUpdates.some(status => status.match(/processing|analyzing|generating/i))).toBeTruthy();
  }

  // Error Handling
  async testNetworkErrorDuringProcessing(): Promise<void> {
    await this.createBriefWithTextInput({
      briefText: 'Test brief for network error testing'
    });
    
    // Mock network failure during processing
    await this.page.route('**/api/flow/generate-motivations', route => route.abort());
    
    await this.processButton.click();
    
    // Should show error and retry option
    await expect(this.errorMessage).toBeVisible();
    await expect(this.retryProcessingButton).toBeVisible();
    
    // Restore network and retry
    await this.page.unroute('**/api/flow/generate-motivations');
    await this.retryAIProcessing();
    
    // Should succeed on retry
    await expect(this.strategyResults).toBeVisible();
  }

  // Accessibility Testing
  async testKeyboardNavigation(): Promise<void> {
    await this.goto();
    
    // Tab through main elements
    await this.page.keyboard.press('Tab');
    await expect(this.newBriefButton).toBeFocused();
    
    await this.page.keyboard.press('Enter');
    await expect(this.briefMethodTabs).toBeVisible();
    
    // Navigate through tabs with arrow keys
    await this.textInputTab.focus();
    await this.page.keyboard.press('ArrowRight');
    await expect(this.documentUploadTab).toBeFocused();
  }

  async testScreenReaderSupport(): Promise<void> {
    await this.goto();
    
    // Check ARIA labels and live regions
    const processingStatus = await this.processingStatus.getAttribute('aria-live');
    expect(processingStatus).toBe('polite');
    
    const briefTextArea = await this.briefTextArea.getAttribute('aria-label');
    expect(briefTextArea).toMatch(/brief|content/i);
  }

  // Verification Methods
  async verifyStrategyGenerated(): Promise<void> {
    await expect(this.strategyResults).toBeVisible();
    await expect(this.motivationCards.first()).toBeVisible();
    await expect(this.copySection).toBeVisible();
  }

  async verifyBriefSaved(): Promise<void> {
    await expect(this.successMessage).toBeVisible();
    
    // Check that brief appears in history
    await expect(this.briefHistory.locator('.brief-item').first()).toBeVisible();
  }

  async verifyMotivationQuality(): Promise<void> {
    const motivations = await this.getGeneratedMotivations();
    
    // Should have multiple motivations
    expect(motivations.length).toBeGreaterThan(0);
    
    // Each motivation should have meaningful content
    for (const motivation of motivations) {
      expect(motivation.title.length).toBeGreaterThan(5);
      expect(motivation.content.length).toBeGreaterThan(20);
      expect(motivation.score).toBeGreaterThan(0);
    }
  }

  async verifyCopyQuality(): Promise<void> {
    const copyVariations = await this.getGeneratedCopyVariations();
    
    // Should have multiple variations
    expect(copyVariations.length).toBeGreaterThan(0);
    
    // Each variation should be meaningful
    for (const copy of copyVariations) {
      expect(copy.length).toBeGreaterThan(10);
      expect(copy).not.toMatch(/lorem ipsum|placeholder|test/i);
    }
  }
}