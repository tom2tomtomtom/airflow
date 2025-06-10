/**
 * Assets Page Object Model
 * Handles interactions with the asset library interface
 */

import { Page, Locator, expect } from '@playwright/test';
import { FileHelper } from '../utils/file-helper';

export class AssetsPage {
  readonly page: Page;
  readonly fileHelper: FileHelper;
  
  // Header elements
  readonly pageTitle: Locator;
  readonly uploadButton: Locator;
  readonly bulkActionsButton: Locator;
  
  // Search and filters
  readonly searchInput: Locator;
  readonly typeFilter: Locator;
  readonly sortBySelect: Locator;
  readonly sortOrderToggle: Locator;
  readonly favoritesOnlyCheckbox: Locator;
  readonly clearFiltersButton: Locator;
  
  // View controls
  readonly viewModeToggle: Locator;
  readonly gridViewButton: Locator;
  readonly listViewButton: Locator;
  
  // Asset display
  readonly assetGrid: Locator;
  readonly assetCards: Locator;
  readonly assetList: Locator;
  readonly emptyState: Locator;
  readonly loadingSkeleton: Locator;
  
  // Upload modal
  readonly uploadModal: Locator;
  readonly dropzone: Locator;
  readonly fileInput: Locator;
  readonly uploadProgress: Locator;
  readonly uploadCompleteMessage: Locator;
  readonly uploadErrorMessage: Locator;
  readonly closeUploadButton: Locator;
  readonly uploadFilesButton: Locator;
  
  // Asset actions
  readonly selectAllCheckbox: Locator;
  readonly selectedCount: Locator;
  readonly bulkDeleteButton: Locator;
  readonly bulkDownloadButton: Locator;
  readonly bulkTagButton: Locator;
  
  // Pagination
  readonly pagination: Locator;
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly pageInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.fileHelper = new FileHelper(page);
    
    // Header elements
    this.pageTitle = page.locator('h4:has-text("Assets")');
    this.uploadButton = page.locator('[data-testid="upload-assets-button"]');
    this.bulkActionsButton = page.locator('[data-testid="bulk-actions-button"]');
    
    // Search and filters
    this.searchInput = page.locator('[data-testid="search-assets"]');
    this.typeFilter = page.locator('[data-testid="type-filter"]');
    this.sortBySelect = page.locator('[data-testid="sort-by-select"]');
    this.sortOrderToggle = page.locator('[data-testid="sort-order-toggle"]');
    this.favoritesOnlyCheckbox = page.locator('input[type="checkbox"]:near(:text("Favorites Only"))');
    this.clearFiltersButton = page.locator('[data-testid="clear-filters-button"]');
    
    // View controls
    this.viewModeToggle = page.locator('[data-testid="toggle-view-mode"]');
    this.gridViewButton = page.locator('[data-testid="grid-view-button"]');
    this.listViewButton = page.locator('[data-testid="list-view-button"]');
    
    // Asset display
    this.assetGrid = page.locator('[data-testid="asset-grid"]');
    this.assetCards = page.locator('[data-testid="asset-card"]');
    this.assetList = page.locator('[data-testid="asset-list"]');
    this.emptyState = page.locator('[data-testid="empty-assets"]');
    this.loadingSkeleton = page.locator('[data-testid="loading-skeleton"]');
    
    // Upload modal
    this.uploadModal = page.locator('[data-testid="upload-modal"]');
    this.dropzone = page.locator('[data-testid="dropzone"]');
    this.fileInput = page.locator('[data-testid="file-input"]');
    this.uploadProgress = page.locator('[data-testid="upload-progress"]');
    this.uploadCompleteMessage = page.locator('[data-testid="upload-complete"]');
    this.uploadErrorMessage = page.locator('[data-testid="upload-error"]');
    this.closeUploadButton = page.locator('[data-testid="close-upload-modal"]');
    this.uploadFilesButton = page.locator('[data-testid="upload-files-button"]');
    
    // Asset actions
    this.selectAllCheckbox = page.locator('[data-testid="select-all-checkbox"]');
    this.selectedCount = page.locator('[data-testid="selected-count"]');
    this.bulkDeleteButton = page.locator('[data-testid="bulk-delete-button"]');
    this.bulkDownloadButton = page.locator('[data-testid="bulk-download-button"]');
    this.bulkTagButton = page.locator('[data-testid="bulk-tag-button"]');
    
    // Pagination
    this.pagination = page.locator('[data-testid="pagination"]');
    this.prevPageButton = page.locator('[data-testid="prev-page-button"]');
    this.nextPageButton = page.locator('[data-testid="next-page-button"]');
    this.pageInfo = page.locator('[data-testid="page-info"]');
  }

  // Navigation
  async goto(): Promise<void> {
    await this.page.goto('/assets');
    await this.waitForLoad();
  }

  async waitForLoad(): Promise<void> {
    // Wait for page to load and assets to appear
    await this.pageTitle.waitFor({ state: 'visible' });
    
    try {
      // Either assets load or empty state appears
      await Promise.race([
        this.assetCards.first().waitFor({ state: 'visible', timeout: 5000 }),
        this.emptyState.waitFor({ state: 'visible', timeout: 5000 })
      ]);
    } catch (error) {
      // Assets might be loading, wait for skeleton to disappear
      await this.loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
    }
  }

  // File upload functionality
  async openUploadModal(): Promise<void> {
    await this.uploadButton.click();
    await this.uploadModal.waitFor({ state: 'visible' });
  }

  async closeUploadModal(): Promise<void> {
    await this.closeUploadButton.click();
    await this.uploadModal.waitFor({ state: 'hidden' });
  }

  async uploadFileByDrop(fileName: string, fileType: 'image' | 'video' | 'audio' | 'document' = 'image'): Promise<void> {
    await this.openUploadModal();
    
    const testFile = this.fileHelper.getFileByType(fileType);
    testFile.name = fileName;
    
    await this.fileHelper.uploadFileByDragDrop(testFile, '[data-testid="dropzone"]');
    await this.waitForUploadComplete();
  }

  async uploadFileByInput(fileName: string, fileType: 'image' | 'video' | 'audio' | 'document' = 'image'): Promise<void> {
    await this.openUploadModal();
    
    const testFile = this.fileHelper.getFileByType(fileType);
    testFile.name = fileName;
    
    await this.fileHelper.uploadFileByInput(testFile, '[data-testid="file-input"]');
    await this.waitForUploadComplete();
  }

  async uploadMultipleFiles(fileNames: string[]): Promise<void> {
    await this.openUploadModal();
    
    const testFiles = fileNames.map(name => {
      const file = this.fileHelper.getFileByType('image');
      file.name = name;
      return file;
    });
    
    await this.fileHelper.uploadMultipleFiles(testFiles, '[data-testid="file-input"]');
    await this.waitForUploadComplete();
  }

  async waitForUploadComplete(timeoutMs: number = 30000): Promise<void> {
    // Wait for upload to complete successfully
    try {
      await this.uploadCompleteMessage.waitFor({ state: 'visible', timeout: timeoutMs });
    } catch (error) {
      // Check if there was an upload error
      const errorVisible = await this.uploadErrorMessage.isVisible();
      if (errorVisible) {
        const errorText = await this.uploadErrorMessage.textContent();
        throw new Error(`Upload failed: ${errorText}`);
      }
      throw error;
    }
  }

  async getUploadProgress(): Promise<number> {
    const progressText = await this.uploadProgress.textContent();
    const match = progressText?.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  // Search and filtering
  async searchAssets(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForAssetsToLoad();
  }

  async filterByType(type: 'all' | 'image' | 'video' | 'text' | 'voice'): Promise<void> {
    await this.typeFilter.selectOption(type === 'all' ? '' : type);
    await this.waitForAssetsToLoad();
  }

  async sortBy(field: 'created_at' | 'name' | 'type' | 'size_bytes', order: 'asc' | 'desc' = 'desc'): Promise<void> {
    await this.sortBySelect.selectOption(field);
    
    // Toggle sort order if needed
    const currentOrder = await this.getSortOrder();
    if (currentOrder !== order) {
      await this.sortOrderToggle.click();
    }
    
    await this.waitForAssetsToLoad();
  }

  async getSortOrder(): Promise<'asc' | 'desc'> {
    const orderButton = this.sortOrderToggle;
    const text = await orderButton.textContent();
    return text?.includes('asc') ? 'asc' : 'desc';
  }

  async toggleFavoritesOnly(): Promise<void> {
    await this.favoritesOnlyCheckbox.click();
    await this.waitForAssetsToLoad();
  }

  async clearAllFilters(): Promise<void> {
    await this.clearFiltersButton.click();
    await this.waitForAssetsToLoad();
  }

  // View mode switching
  async switchToGridView(): Promise<void> {
    await this.viewModeToggle.click();
    // Assuming it cycles between grid and list
    const isGrid = await this.assetGrid.isVisible();
    if (!isGrid) {
      await this.viewModeToggle.click();
    }
  }

  async switchToListView(): Promise<void> {
    await this.viewModeToggle.click();
    // Assuming it cycles between grid and list
    const isList = await this.assetList.isVisible();
    if (!isList) {
      await this.viewModeToggle.click();
    }
  }

  async getCurrentViewMode(): Promise<'grid' | 'list'> {
    const gridVisible = await this.assetGrid.isVisible();
    return gridVisible ? 'grid' : 'list';
  }

  // Asset management
  async getAssetCount(): Promise<number> {
    return await this.assetCards.count();
  }

  async getAssetNames(): Promise<string[]> {
    const cards = await this.assetCards.all();
    const names = [];
    
    for (const card of cards) {
      const nameElement = card.locator('[data-testid="asset-name"]');
      const name = await nameElement.textContent();
      if (name) names.push(name);
    }
    
    return names;
  }

  async selectAsset(assetName: string): Promise<void> {
    const asset = this.getAssetByName(assetName);
    const checkbox = asset.locator('input[type="checkbox"]');
    await checkbox.click();
  }

  async selectAllAssets(): Promise<void> {
    await this.selectAllCheckbox.click();
  }

  async getSelectedAssetCount(): Promise<number> {
    const countText = await this.selectedCount.textContent();
    const match = countText?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async deleteAsset(assetName: string): Promise<void> {
    const asset = this.getAssetByName(assetName);
    const deleteButton = asset.locator('button[aria-label="Delete asset"]');
    await deleteButton.click();
    
    // Confirm deletion if there's a confirmation dialog
    try {
      const confirmButton = this.page.locator('[data-testid="confirm-delete-button"]');
      await confirmButton.click({ timeout: 2000 });
    } catch (error) {
      // No confirmation dialog, deletion was immediate
    }
    
    await this.waitForAssetsToLoad();
  }

  async toggleAssetFavorite(assetName: string): Promise<void> {
    const asset = this.getAssetByName(assetName);
    const favoriteButton = asset.locator('button[aria-label="Toggle favorite"]');
    await favoriteButton.click();
  }

  async downloadAsset(assetName: string): Promise<void> {
    const asset = this.getAssetByName(assetName);
    const downloadButton = asset.locator('button[aria-label="Download asset"]');
    await downloadButton.click();
  }

  // Bulk operations
  async bulkDeleteSelected(): Promise<void> {
    await this.bulkDeleteButton.click();
    
    // Confirm bulk deletion
    const confirmButton = this.page.locator('[data-testid="confirm-bulk-delete-button"]');
    await confirmButton.click();
    
    await this.waitForAssetsToLoad();
  }

  async bulkDownloadSelected(): Promise<void> {
    await this.bulkDownloadButton.click();
    // Download should start automatically
  }

  async bulkAddTags(tags: string[]): Promise<void> {
    await this.bulkTagButton.click();
    
    const tagModal = this.page.locator('[data-testid="tag-modal"]');
    await tagModal.waitFor({ state: 'visible' });
    
    const tagInput = this.page.locator('[data-testid="tag-input"]');
    for (const tag of tags) {
      await tagInput.fill(tag);
      await tagInput.press('Enter');
    }
    
    const saveTagsButton = this.page.locator('[data-testid="save-tags-button"]');
    await saveTagsButton.click();
    
    await tagModal.waitFor({ state: 'hidden' });
  }

  // Pagination
  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
    await this.waitForAssetsToLoad();
  }

  async goToPrevPage(): Promise<void> {
    await this.prevPageButton.click();
    await this.waitForAssetsToLoad();
  }

  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.page.locator(`[data-testid="page-button-${pageNumber}"]`);
    await pageButton.click();
    await this.waitForAssetsToLoad();
  }

  async getCurrentPage(): Promise<number> {
    const pageInfo = await this.pageInfo.textContent();
    const match = pageInfo?.match(/Page (\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  async getTotalPages(): Promise<number> {
    const pageInfo = await this.pageInfo.textContent();
    const match = pageInfo?.match(/of (\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  // Helper methods
  private getAssetByName(name: string): Locator {
    return this.assetCards.filter({ hasText: name });
  }

  private async waitForAssetsToLoad(): Promise<void> {
    // Wait for loading to finish
    await this.loadingSkeleton.waitFor({ state: 'hidden', timeout: 10000 });
    
    // Small delay for assets to render
    await this.page.waitForTimeout(500);
  }

  // Performance testing
  async measureAssetLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.goto();
    await this.waitForLoad();
    return Date.now() - startTime;
  }

  async measureSearchTime(query: string): Promise<number> {
    const startTime = Date.now();
    await this.searchAssets(query);
    return Date.now() - startTime;
  }

  // Verification methods
  async verifyAssetExists(assetName: string): Promise<boolean> {
    const asset = this.getAssetByName(assetName);
    return await asset.isVisible();
  }

  async verifyAssetDeleted(assetName: string): Promise<boolean> {
    const asset = this.getAssetByName(assetName);
    return !(await asset.isVisible());
  }

  async verifyEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible();
    await expect(this.assetCards).toHaveCount(0);
  }

  async verifyAssetsLoaded(): Promise<void> {
    await expect(this.assetCards.first()).toBeVisible();
    await expect(this.loadingSkeleton).not.toBeVisible();
  }

  async verifyUploadFunctionality(): Promise<void> {
    await expect(this.uploadButton).toBeVisible();
    await expect(this.uploadButton).toBeEnabled();
    
    await this.openUploadModal();
    await expect(this.uploadModal).toBeVisible();
    await expect(this.dropzone).toBeVisible();
    await expect(this.fileInput).toBeVisible();
    
    await this.closeUploadModal();
  }

  async verifySearchAndFilter(): Promise<void> {
    await expect(this.searchInput).toBeVisible();
    await expect(this.typeFilter).toBeVisible();
    await expect(this.sortBySelect).toBeVisible();
    await expect(this.viewModeToggle).toBeVisible();
  }
}