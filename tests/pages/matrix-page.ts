/**
 * Campaign Matrix Page Object Model
 * Handles interactions with the campaign matrix creation and management interface
 */

import { Page, Locator, expect } from '@playwright/test';

export class MatrixPage {
  readonly page: Page;
  
  // Header elements
  readonly pageTitle: Locator;
  readonly createMatrixButton: Locator;
  readonly templateSelector: Locator;
  readonly matrixActionsMenu: Locator;
  
  // Matrix interface
  readonly matrixGrid: Locator;
  readonly matrixRows: Locator;
  readonly matrixHeaders: Locator;
  readonly matrixCells: Locator;
  readonly rowNumberColumn: Locator;
  
  // Matrix actions
  readonly addRowButton: Locator;
  readonly removeRowButton: Locator;
  readonly duplicateRowButton: Locator;
  readonly addColumnButton: Locator;
  readonly removeColumnButton: Locator;
  readonly clearMatrixButton: Locator;
  
  // Asset browser
  readonly assetBrowser: Locator;
  readonly assetBrowserToggle: Locator;
  readonly assetTabs: Locator;
  readonly videoAssetsTab: Locator;
  readonly imageAssetsTab: Locator;
  readonly textAssetsTab: Locator;
  readonly audioAssetsTab: Locator;
  readonly assetItems: Locator;
  readonly assetSearchInput: Locator;
  readonly assetFilterDropdown: Locator;
  
  // Asset assignment
  readonly emptySlot: Locator;
  readonly assignedAsset: Locator;
  readonly assetPreview: Locator;
  readonly removeAssetButton: Locator;
  readonly replaceAssetButton: Locator;
  readonly lockAssetButton: Locator;
  readonly lockedAsset: Locator;
  
  // Auto-fill features
  readonly autoFillButton: Locator;
  readonly autoFillOptions: Locator;
  readonly randomFillButton: Locator;
  readonly smartFillButton: Locator;
  readonly autoFillProgress: Locator;
  
  // Execution controls
  readonly executeMatrixButton: Locator;
  readonly executionModal: Locator;
  readonly executionProgress: Locator;
  readonly executionStatus: Locator;
  readonly executionResults: Locator;
  readonly downloadResultsButton: Locator;
  readonly previewResultsButton: Locator;
  
  // Matrix management
  readonly saveMatrixButton: Locator;
  readonly loadMatrixButton: Locator;
  readonly matrixNameInput: Locator;
  readonly matrixDescriptionInput: Locator;
  readonly matrixTemplateSelector: Locator;
  readonly exportMatrixButton: Locator;
  readonly importMatrixButton: Locator;
  
  // Combination preview
  readonly combinationPreview: Locator;
  readonly previewModal: Locator;
  readonly previewPlayer: Locator;
  readonly previewControls: Locator;
  readonly previewQuality: Locator;
  readonly previewFullscreen: Locator;
  
  // Validation and errors
  readonly validationErrors: Locator;
  readonly matrixWarnings: Locator;
  readonly conflictHighlights: Locator;
  readonly missingAssetWarnings: Locator;
  
  // Messages
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly progressMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Header elements
    this.pageTitle = page.locator('h4:has-text("Matrix")');
    this.createMatrixButton = page.locator('[data-testid="create-matrix-button"]');
    this.templateSelector = page.locator('[data-testid="template-selector"]');
    this.matrixActionsMenu = page.locator('[data-testid="matrix-actions-menu"]');
    
    // Matrix interface
    this.matrixGrid = page.locator('[data-testid="matrix-grid"]');
    this.matrixRows = page.locator('[data-testid="matrix-row"]');
    this.matrixHeaders = page.locator('[data-testid="matrix-header"]');
    this.matrixCells = page.locator('[data-testid="matrix-cell"]');
    this.rowNumberColumn = page.locator('[data-testid="row-number"]');
    
    // Matrix actions
    this.addRowButton = page.locator('[data-testid="add-row-button"]');
    this.removeRowButton = page.locator('[data-testid="remove-row-button"]');
    this.duplicateRowButton = page.locator('[data-testid="duplicate-row-button"]');
    this.addColumnButton = page.locator('[data-testid="add-column-button"]');
    this.removeColumnButton = page.locator('[data-testid="remove-column-button"]');
    this.clearMatrixButton = page.locator('[data-testid="clear-matrix-button"]');
    
    // Asset browser
    this.assetBrowser = page.locator('[data-testid="asset-browser"]');
    this.assetBrowserToggle = page.locator('[data-testid="asset-browser-toggle"]');
    this.assetTabs = page.locator('[data-testid="asset-tabs"]');
    this.videoAssetsTab = page.locator('[data-testid="video-assets-tab"]');
    this.imageAssetsTab = page.locator('[data-testid="image-assets-tab"]');
    this.textAssetsTab = page.locator('[data-testid="text-assets-tab"]');
    this.audioAssetsTab = page.locator('[data-testid="audio-assets-tab"]');
    this.assetItems = page.locator('[data-testid="asset-item"]');
    this.assetSearchInput = page.locator('[data-testid="asset-search"]');
    this.assetFilterDropdown = page.locator('[data-testid="asset-filter"]');
    
    // Asset assignment
    this.emptySlot = page.locator('[data-testid="empty-slot"]');
    this.assignedAsset = page.locator('[data-testid="assigned-asset"]');
    this.assetPreview = page.locator('[data-testid="asset-preview"]');
    this.removeAssetButton = page.locator('[data-testid="remove-asset-button"]');
    this.replaceAssetButton = page.locator('[data-testid="replace-asset-button"]');
    this.lockAssetButton = page.locator('[data-testid="lock-asset-button"]');
    this.lockedAsset = page.locator('[data-testid="locked-asset"]');
    
    // Auto-fill features
    this.autoFillButton = page.locator('[data-testid="auto-fill-button"]');
    this.autoFillOptions = page.locator('[data-testid="auto-fill-options"]');
    this.randomFillButton = page.locator('[data-testid="random-fill-button"]');
    this.smartFillButton = page.locator('[data-testid="smart-fill-button"]');
    this.autoFillProgress = page.locator('[data-testid="auto-fill-progress"]');
    
    // Execution controls
    this.executeMatrixButton = page.locator('[data-testid="execute-matrix-button"]');
    this.executionModal = page.locator('[data-testid="execution-modal"]');
    this.executionProgress = page.locator('[data-testid="execution-progress"]');
    this.executionStatus = page.locator('[data-testid="execution-status"]');
    this.executionResults = page.locator('[data-testid="execution-results"]');
    this.downloadResultsButton = page.locator('[data-testid="download-results-button"]');
    this.previewResultsButton = page.locator('[data-testid="preview-results-button"]');
    
    // Matrix management
    this.saveMatrixButton = page.locator('[data-testid="save-matrix-button"]');
    this.loadMatrixButton = page.locator('[data-testid="load-matrix-button"]');
    this.matrixNameInput = page.locator('[data-testid="matrix-name-input"]');
    this.matrixDescriptionInput = page.locator('[data-testid="matrix-description-input"]');
    this.matrixTemplateSelector = page.locator('[data-testid="matrix-template-selector"]');
    this.exportMatrixButton = page.locator('[data-testid="export-matrix-button"]');
    this.importMatrixButton = page.locator('[data-testid="import-matrix-button"]');
    
    // Combination preview
    this.combinationPreview = page.locator('[data-testid="combination-preview"]');
    this.previewModal = page.locator('[data-testid="preview-modal"]');
    this.previewPlayer = page.locator('[data-testid="preview-player"]');
    this.previewControls = page.locator('[data-testid="preview-controls"]');
    this.previewQuality = page.locator('[data-testid="preview-quality"]');
    this.previewFullscreen = page.locator('[data-testid="preview-fullscreen"]');
    
    // Validation and errors
    this.validationErrors = page.locator('[data-testid="validation-error"]');
    this.matrixWarnings = page.locator('[data-testid="matrix-warning"]');
    this.conflictHighlights = page.locator('[data-testid="conflict-highlight"]');
    this.missingAssetWarnings = page.locator('[data-testid="missing-asset-warning"]');
    
    // Messages
    this.successMessage = page.locator('[data-testid="success-message"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.progressMessage = page.locator('[data-testid="progress-message"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/matrix');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    await this.pageTitle.waitFor({ state: 'visible' });
    await this.matrixGrid.waitFor({ state: 'visible' });
    await this.page.waitForLoadState('networkidle');
  }

  // Matrix Creation
  async createNewMatrix(templateName?: string): Promise<void> {
    await this.createMatrixButton.click();
    
    if (templateName) {
      await this.templateSelector.selectOption(templateName);
    }
    
    // Wait for matrix to initialize
    await this.matrixGrid.waitFor({ state: 'visible' });
    await this.addRowButton.waitFor({ state: 'visible' });
  }

  async loadExistingMatrix(matrixName: string): Promise<void> {
    await this.loadMatrixButton.click();
    
    const matrixOption = this.page.locator(`[data-testid="matrix-option"]:has-text("${matrixName}")`);
    await matrixOption.click();
    
    await this.waitForLoad();
  }

  // Matrix Structure Management
  async addRow(): Promise<void> {
    const initialRowCount = await this.matrixRows.count();
    
    await this.addRowButton.click();
    
    // Wait for new row to appear
    await expect(this.matrixRows).toHaveCount(initialRowCount + 1);
  }

  async removeRow(rowIndex: number): Promise<void> {
    const row = this.matrixRows.nth(rowIndex);
    const removeButton = row.locator('[data-testid="remove-row-button"]');
    
    await removeButton.click();
    
    // Confirm removal if there's a confirmation dialog
    try {
      const confirmButton = this.page.locator('[data-testid="confirm-remove-row"]');
      await confirmButton.click({ timeout: 2000 });
    } catch (error) {
      // No confirmation dialog
    }
    
    // Wait for row to be removed
    await this.page.waitForTimeout(500);
  }

  async duplicateRow(rowIndex: number): Promise<void> {
    const initialRowCount = await this.matrixRows.count();
    
    const row = this.matrixRows.nth(rowIndex);
    const duplicateButton = row.locator('[data-testid="duplicate-row-button"]');
    
    await duplicateButton.click();
    
    // Wait for duplicated row to appear
    await expect(this.matrixRows).toHaveCount(initialRowCount + 1);
  }

  async addColumn(columnType: 'video' | 'image' | 'text' | 'audio'): Promise<void> {
    await this.addColumnButton.click();
    
    const columnTypeSelector = this.page.locator('[data-testid="column-type-selector"]');
    await columnTypeSelector.selectOption(columnType);
    
    const confirmButton = this.page.locator('[data-testid="confirm-add-column"]');
    await confirmButton.click();
    
    // Wait for new column to appear
    await this.page.waitForTimeout(500);
  }

  async removeColumn(columnIndex: number): Promise<void> {
    const header = this.matrixHeaders.nth(columnIndex);
    const removeButton = header.locator('[data-testid="remove-column-button"]');
    
    await removeButton.click();
    
    // Confirm removal
    const confirmButton = this.page.locator('[data-testid="confirm-remove-column"]');
    await confirmButton.click();
    
    await this.page.waitForTimeout(500);
  }

  // Asset Management
  async openAssetBrowser(): Promise<void> {
    if (!(await this.assetBrowser.isVisible())) {
      await this.assetBrowserToggle.click();
      await this.assetBrowser.waitFor({ state: 'visible' });
    }
  }

  async closeAssetBrowser(): Promise<void> {
    if (await this.assetBrowser.isVisible()) {
      await this.assetBrowserToggle.click();
      await this.assetBrowser.waitFor({ state: 'hidden' });
    }
  }

  async switchToAssetTab(assetType: 'video' | 'image' | 'text' | 'audio'): Promise<void> {
    await this.openAssetBrowser();
    
    const tab = this.page.locator(`[data-testid="${assetType}-assets-tab"]`);
    await tab.click();
    
    // Wait for assets to load
    await this.assetItems.first().waitFor({ state: 'visible', timeout: 5000 });
  }

  async searchAssets(query: string): Promise<void> {
    await this.openAssetBrowser();
    await this.assetSearchInput.fill(query);
    await this.assetSearchInput.press('Enter');
    
    // Wait for search results
    await this.page.waitForTimeout(1000);
  }

  async filterAssets(filterType: string): Promise<void> {
    await this.openAssetBrowser();
    await this.assetFilterDropdown.selectOption(filterType);
    
    await this.page.waitForTimeout(1000);
  }

  // Asset Assignment
  async assignAssetToCell(rowIndex: number, columnIndex: number, assetName: string): Promise<void> {
    await this.openAssetBrowser();
    
    // Find the asset
    const asset = this.assetItems.filter({ hasText: assetName });
    
    // Find the target cell
    const targetCell = this.getMatrixCell(rowIndex, columnIndex);
    
    // Drag and drop asset to cell
    await asset.dragTo(targetCell);
    
    // Wait for assignment to complete
    await expect(targetCell.locator('[data-testid="assigned-asset"]')).toBeVisible();
  }

  async assignAssetByClick(rowIndex: number, columnIndex: number, assetName: string): Promise<void> {
    // Click on empty cell first
    const targetCell = this.getMatrixCell(rowIndex, columnIndex);
    await targetCell.click();
    
    await this.openAssetBrowser();
    
    // Click on asset to assign it
    const asset = this.assetItems.filter({ hasText: assetName });
    await asset.click();
    
    // Wait for assignment
    await expect(targetCell.locator('[data-testid="assigned-asset"]')).toBeVisible();
  }

  async removeAssetFromCell(rowIndex: number, columnIndex: number): Promise<void> {
    const cell = this.getMatrixCell(rowIndex, columnIndex);
    const removeButton = cell.locator('[data-testid="remove-asset-button"]');
    
    await removeButton.click();
    
    // Wait for asset to be removed
    await expect(cell.locator('[data-testid="empty-slot"]')).toBeVisible();
  }

  async lockAssetInCell(rowIndex: number, columnIndex: number): Promise<void> {
    const cell = this.getMatrixCell(rowIndex, columnIndex);
    const lockButton = cell.locator('[data-testid="lock-asset-button"]');
    
    await lockButton.click();
    
    // Wait for lock indicator
    await expect(cell.locator('[data-testid="locked-asset"]')).toBeVisible();
  }

  async unlockAssetInCell(rowIndex: number, columnIndex: number): Promise<void> {
    const cell = this.getMatrixCell(rowIndex, columnIndex);
    const lockButton = cell.locator('[data-testid="lock-asset-button"]');
    
    await lockButton.click();
    
    // Wait for unlock
    await expect(cell.locator('[data-testid="locked-asset"]')).not.toBeVisible();
  }

  async replaceAssetInCell(rowIndex: number, columnIndex: number, newAssetName: string): Promise<void> {
    const cell = this.getMatrixCell(rowIndex, columnIndex);
    const replaceButton = cell.locator('[data-testid="replace-asset-button"]');
    
    await replaceButton.click();
    
    await this.openAssetBrowser();
    
    const newAsset = this.assetItems.filter({ hasText: newAssetName });
    await newAsset.click();
    
    // Wait for replacement
    await this.page.waitForTimeout(1000);
  }

  // Auto-fill Features
  async autoFillMatrix(fillType: 'random' | 'smart'): Promise<void> {
    await this.autoFillButton.click();
    await this.autoFillOptions.waitFor({ state: 'visible' });
    
    if (fillType === 'random') {
      await this.randomFillButton.click();
    } else {
      await this.smartFillButton.click();
    }
    
    // Wait for auto-fill to complete
    await this.waitForAutoFillComplete();
  }

  async waitForAutoFillComplete(timeoutMs: number = 30000): Promise<void> {
    await this.autoFillProgress.waitFor({ state: 'visible', timeout: 5000 });
    await this.autoFillProgress.waitFor({ state: 'hidden', timeout: timeoutMs });
  }

  // Matrix Execution
  async executeMatrix(): Promise<void> {
    await this.executeMatrixButton.click();
    await this.executionModal.waitFor({ state: 'visible' });
    
    // Confirm execution
    const confirmButton = this.page.locator('[data-testid="confirm-execution-button"]');
    await confirmButton.click();
    
    // Wait for execution to start
    await this.executionProgress.waitFor({ state: 'visible' });
  }

  async waitForExecutionComplete(timeoutMs: number = 300000): Promise<void> {
    // Wait for execution to complete (5 minutes timeout for video rendering)
    await this.executionResults.waitFor({ state: 'visible', timeout: timeoutMs });
    await this.executionModal.waitFor({ state: 'hidden' });
  }

  async getExecutionProgress(): Promise<number> {
    const progressText = await this.executionProgress.textContent();
    const match = progressText?.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  async getExecutionStatus(): Promise<string> {
    return await this.executionStatus.textContent() || '';
  }

  async downloadExecutionResults(): Promise<void> {
    await this.downloadResultsButton.click();
    // Download should start automatically
  }

  async previewExecutionResults(): Promise<void> {
    await this.previewResultsButton.click();
    await this.previewModal.waitFor({ state: 'visible' });
  }

  // Combination Preview
  async previewCombination(rowIndex: number): Promise<void> {
    const row = this.matrixRows.nth(rowIndex);
    const previewButton = row.locator('[data-testid="preview-combination-button"]');
    
    await previewButton.click();
    await this.previewModal.waitFor({ state: 'visible' });
    await this.previewPlayer.waitFor({ state: 'visible' });
  }

  async closePreview(): Promise<void> {
    const closeButton = this.previewModal.locator('[data-testid="close-preview-button"]');
    await closeButton.click();
    await this.previewModal.waitFor({ state: 'hidden' });
  }

  async playPreview(): Promise<void> {
    const playButton = this.previewControls.locator('[data-testid="play-button"]');
    await playButton.click();
  }

  async pausePreview(): Promise<void> {
    const pauseButton = this.previewControls.locator('[data-testid="pause-button"]');
    await pauseButton.click();
  }

  async setPreviewQuality(quality: 'low' | 'medium' | 'high'): Promise<void> {
    await this.previewQuality.selectOption(quality);
  }

  async togglePreviewFullscreen(): Promise<void> {
    await this.previewFullscreen.click();
  }

  // Matrix Management
  async saveMatrix(matrixData: {
    name: string;
    description?: string;
  }): Promise<void> {
    await this.saveMatrixButton.click();
    
    const saveModal = this.page.locator('[data-testid="save-matrix-modal"]');
    await saveModal.waitFor({ state: 'visible' });
    
    await this.matrixNameInput.fill(matrixData.name);
    
    if (matrixData.description) {
      await this.matrixDescriptionInput.fill(matrixData.description);
    }
    
    const confirmSaveButton = this.page.locator('[data-testid="confirm-save-matrix"]');
    await confirmSaveButton.click();
    
    await saveModal.waitFor({ state: 'hidden' });
    await this.successMessage.waitFor({ state: 'visible' });
  }

  async exportMatrix(): Promise<void> {
    await this.exportMatrixButton.click();
    // Export should start automatically
  }

  async importMatrix(filePath: string): Promise<void> {
    await this.importMatrixButton.click();
    
    const fileInput = this.page.locator('[data-testid="import-file-input"]');
    await fileInput.setInputFiles(filePath);
    
    const importButton = this.page.locator('[data-testid="confirm-import-button"]');
    await importButton.click();
    
    await this.waitForLoad();
  }

  async clearMatrix(): Promise<void> {
    await this.clearMatrixButton.click();
    
    // Confirm clearing
    const confirmButton = this.page.locator('[data-testid="confirm-clear-matrix"]');
    await confirmButton.click();
    
    // Wait for matrix to be cleared
    await this.page.waitForTimeout(1000);
  }

  // Helper Methods
  private getMatrixCell(rowIndex: number, columnIndex: number): Locator {
    return this.matrixRows.nth(rowIndex).locator('[data-testid="matrix-cell"]').nth(columnIndex);
  }

  async getMatrixDimensions(): Promise<{ rows: number; columns: number }> {
    const rows = await this.matrixRows.count();
    const columns = rows > 0 ? await this.matrixRows.first().locator('[data-testid="matrix-cell"]').count() : 0;
    
    return { rows, columns };
  }

  async getAssignedAssetCount(): Promise<number> {
    return await this.assignedAsset.count();
  }

  async getEmptySlotCount(): Promise<number> {
    return await this.emptySlot.count();
  }

  async getLockedAssetCount(): Promise<number> {
    return await this.lockedAsset.count();
  }

  // Validation Methods
  async getValidationErrors(): Promise<string[]> {
    const errors = await this.validationErrors.all();
    const errorTexts = [];
    
    for (const error of errors) {
      const text = await error.textContent();
      if (text) errorTexts.push(text);
    }
    
    return errorTexts;
  }

  async getMatrixWarnings(): Promise<string[]> {
    const warnings = await this.matrixWarnings.all();
    const warningTexts = [];
    
    for (const warning of warnings) {
      const text = await warning.textContent();
      if (text) warningTexts.push(text);
    }
    
    return warningTexts;
  }

  async hasConflicts(): Promise<boolean> {
    return await this.conflictHighlights.isVisible();
  }

  async hasMissingAssets(): Promise<boolean> {
    return await this.missingAssetWarnings.isVisible();
  }

  // Performance Testing
  async measureMatrixLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    await this.waitForLoad();
    return Date.now() - startTime;
  }

  async measureAssetAssignmentTime(rowIndex: number, columnIndex: number, assetName: string): Promise<number> {
    const startTime = Date.now();
    await this.assignAssetToCell(rowIndex, columnIndex, assetName);
    return Date.now() - startTime;
  }

  async measureExecutionTime(): Promise<number> {
    const startTime = Date.now();
    await this.executeMatrix();
    await this.waitForExecutionComplete();
    return Date.now() - startTime;
  }

  // UX Testing
  async testDragAndDropResponsiveness(): Promise<void> {
    await this.openAssetBrowser();
    
    const asset = this.assetItems.first();
    const targetCell = this.getMatrixCell(0, 0);
    
    // Test that drag provides visual feedback
    await asset.hover();
    await this.page.mouse.down();
    
    // Should show drag cursor or visual feedback
    const isDragging = await this.page.evaluate(() => {
      return document.body.style.cursor.includes('grab') || 
             document.querySelector('[data-dragging]') !== null;
    });
    
    await this.page.mouse.up();
    
    expect(isDragging).toBeTruthy();
  }

  async testMatrixScrolling(): Promise<void> {
    // Add many rows to test scrolling
    for (let i = 0; i < 20; i++) {
      await this.addRow();
    }
    
    // Test that matrix is scrollable
    const matrixBounds = await this.matrixGrid.boundingBox();
    const matrixScrollHeight = await this.matrixGrid.evaluate(el => el.scrollHeight);
    
    expect(matrixScrollHeight).toBeGreaterThan(matrixBounds?.height || 0);
  }

  // Accessibility Testing
  async testKeyboardNavigation(): Promise<void> {
    await this.goto();
    
    // Test tab navigation through matrix cells
    const firstCell = this.getMatrixCell(0, 0);
    await firstCell.focus();
    
    // Arrow keys should navigate between cells
    await this.page.keyboard.press('ArrowRight');
    const secondCell = this.getMatrixCell(0, 1);
    await expect(secondCell).toBeFocused();
    
    await this.page.keyboard.press('ArrowDown');
    const belowCell = this.getMatrixCell(1, 1);
    await expect(belowCell).toBeFocused();
  }

  async testScreenReaderSupport(): Promise<void> {
    // Check ARIA labels for matrix structure
    const gridRole = await this.matrixGrid.getAttribute('role');
    expect(gridRole).toBe('grid');
    
    const firstCell = this.getMatrixCell(0, 0);
    const cellRole = await firstCell.getAttribute('role');
    expect(cellRole).toBe('gridcell');
  }

  // Error Handling
  async testExecutionFailureRecovery(): Promise<void> {
    // Mock execution failure
    await this.page.route('**/api/matrices/**/execute', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Execution failed' })
      });
    });
    
    await this.executeMatrix();
    
    // Should show error and allow retry
    await expect(this.errorMessage).toBeVisible();
    
    const retryButton = this.page.locator('[data-testid="retry-execution-button"]');
    await expect(retryButton).toBeVisible();
    
    // Restore and retry
    await this.page.unroute('**/api/matrices/**/execute');
    await retryButton.click();
  }

  // Verification Methods
  async verifyMatrixStructure(): Promise<void> {
    await expect(this.matrixGrid).toBeVisible();
    await expect(this.matrixRows.first()).toBeVisible();
    await expect(this.matrixHeaders.first()).toBeVisible();
  }

  async verifyAssetBrowserFunctionality(): Promise<void> {
    await this.openAssetBrowser();
    
    await expect(this.assetBrowser).toBeVisible();
    await expect(this.assetTabs).toBeVisible();
    await expect(this.assetItems.first()).toBeVisible();
    await expect(this.assetSearchInput).toBeVisible();
  }

  async verifyMatrixCanExecute(): Promise<void> {
    const dimensions = await this.getMatrixDimensions();
    const assignedAssets = await this.getAssignedAssetCount();
    const errors = await this.getValidationErrors();
    
    expect(dimensions.rows).toBeGreaterThan(0);
    expect(dimensions.columns).toBeGreaterThan(0);
    expect(assignedAssets).toBeGreaterThan(0);
    expect(errors.length).toBe(0);
    
    await expect(this.executeMatrixButton).toBeEnabled();
  }

  async verifyExecutionResults(): Promise<void> {
    await expect(this.executionResults).toBeVisible();
    await expect(this.downloadResultsButton).toBeVisible();
    await expect(this.previewResultsButton).toBeVisible();
  }
}