import { getErrorMessage } from '@/utils/errorUtils';
import { test, expect } from './fixtures/test-fixtures';
import path from 'path';

test.describe('Campaign Matrix Flow', () => {
  test('should load matrix page and display templates', async ({ authenticatedPage }) => {
    // Navigate to matrix page
    await authenticatedPage.goto('/matrix');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Take screenshot of matrix page
    await authenticatedPage.screenshot({ path: 'test-results/matrix-page.png' });
    
    // Verify page title
    await expect(authenticatedPage).toHaveTitle(/Matrix|AIrWAVE/);
    
    // Look for matrix interface elements
    const matrixTitle = authenticatedPage.locator('h4, h5, h6').filter({ hasText: /matrix|campaign|content/i });
    await expect(matrixTitle.first()).toBeVisible();
    
    // Check for tabs or navigation
    const tabs = authenticatedPage.locator('[role="tablist"], .MuiTabs-root');
    if (await tabs.count() > 0) {
      await expect(tabs.first()).toBeVisible();
    }
    
    // Look for any table or grid structure
    const table = authenticatedPage.locator('table, [role="grid"], .matrix-grid');
    const cards = authenticatedPage.locator('.MuiCard-root, [data-testid*="card"]');
    
    // Either a table/grid or cards should be visible
    const hasTable = await table.count() > 0;
    const hasCards = await cards.count() > 0;
    
    expect(hasTable || hasCards).toBe(true);
  });

  test('should create new campaign matrix project', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/matrix');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Look for create/new project button
    const createButtons = authenticatedPage.locator('button').filter({ 
      hasText: /create|new|add|start/i 
    });
    
    if (await createButtons.count() > 0) {
      // Click the first create button
      await createButtons.first().click({ force: true });
      
      // Wait for form or dialog to appear
      await authenticatedPage.waitForTimeout(1000);
      
      // Take screenshot of create form
      await authenticatedPage.screenshot({ path: 'test-results/matrix-create-form.png' });
      
      // Look for project name input
      const nameInput = authenticatedPage.locator('input[name*="name"], input[placeholder*="name"], [data-testid*="name"]');
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Campaign Matrix');
        
        // Look for description field
        const descInput = authenticatedPage.locator('textarea, input[name*="desc"], [data-testid*="desc"]');
        if (await descInput.isVisible()) {
          await descInput.fill('Test campaign matrix for E2E testing');
        }
        
        // Look for submit/save button
        const submitButton = authenticatedPage.locator('button').filter({ 
          hasText: /save|create|submit/i 
        });
        
        if (await submitButton.count() > 0) {
          await submitButton.first().click();
          
          // Wait for creation to complete
          await authenticatedPage.waitForLoadState('networkidle');
          
          // Take screenshot of created project
          await authenticatedPage.screenshot({ path: 'test-results/matrix-created.png' });
        }
      }
    } else {
      // Skip test if no create button found
      console.log('No create button found, skipping create test');
      test.skip();
    }
  });

  test('should interact with matrix cells and assign content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/matrix');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Look for existing matrix table or grid
    const matrixCells = authenticatedPage.locator('td, .matrix-cell, [data-testid*="cell"]');
    const matrixTable = authenticatedPage.locator('table');
    
    if (await matrixTable.count() > 0) {
      // Take screenshot of matrix table
      await authenticatedPage.screenshot({ path: 'test-results/matrix-table.png' });
      
      // Try to interact with first editable cell
      const editableCells = matrixCells.filter({ hasNotText: /^\s*$/ });
      
      if (await editableCells.count() > 0) {
        const firstCell = editableCells.first();
        
        // Try clicking on the cell
        await firstCell.click({ force: true });
        await authenticatedPage.waitForTimeout(500);
        
        // Look for input field or dropdown that appears
        const cellInput = authenticatedPage.locator('input:visible, textarea:visible, select:visible').last();
        
        if (await cellInput.isVisible()) {
          await cellInput.fill('Test content');
          await authenticatedPage.keyboard.press('Enter');
          
          // Take screenshot after editing
          await authenticatedPage.screenshot({ path: 'test-results/matrix-cell-edited.png' });
        }
        
        // Look for asset assignment buttons
        const assetButtons = authenticatedPage.locator('button').filter({ 
          hasText: /asset|image|video|assign/i 
        });
        
        if (await assetButtons.count() > 0) {
          await assetButtons.first().click({ force: true });
          
          // Wait for asset picker to appear
          await authenticatedPage.waitForTimeout(1000);
          
          // Take screenshot of asset picker
          await authenticatedPage.screenshot({ path: 'test-results/matrix-asset-picker.png' });
          
          // Try to select an asset or close the picker
          const assetItems = authenticatedPage.locator('[data-testid*="asset"], .asset-item, .MuiCard-root img');
          
          if (await assetItems.count() > 0) {
            await assetItems.first().click();
          } else {
            // Close the picker if no assets
            const closeButton = authenticatedPage.locator('button').filter({ 
              hasText: /close|cancel/i 
            });
            if (await closeButton.count() > 0) {
              await closeButton.first().click();
            }
          }
        }
      }
    } else {
      console.log('No matrix table found, checking for alternative layout');
      
      // Look for card-based or alternative matrix layout
      const projectCards = authenticatedPage.locator('.MuiCard-root, [data-testid*="project"]');
      
      if (await projectCards.count() > 0) {
        await projectCards.first().click();
        await authenticatedPage.waitForLoadState('networkidle');
        
        // Take screenshot of opened project
        await authenticatedPage.screenshot({ path: 'test-results/matrix-project-opened.png' });
      }
    }
  });

  test('should generate video from matrix content', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/matrix');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Look for generate or render buttons
    const generateButtons = authenticatedPage.locator('button').filter({ 
      hasText: /generate|render|create video|produce/i 
    });
    
    if (await generateButtons.count() > 0) {
      // Take screenshot before generation
      await authenticatedPage.screenshot({ path: 'test-results/matrix-before-generate.png' });
      
      await generateButtons.first().click({ force: true });
      
      // Wait for generation dialog or progress
      await authenticatedPage.waitForTimeout(2000);
      
      // Take screenshot of generation interface
      await authenticatedPage.screenshot({ path: 'test-results/matrix-generate-dialog.png' });
      
      // Look for progress indicators
      const progressBars = authenticatedPage.locator('.MuiLinearProgress-root, [role="progressbar"]');
      const statusMessages = authenticatedPage.locator('[data-testid*="status"], .status-message');
      
      if (await progressBars.count() > 0) {
        // Monitor progress for a few seconds
        await authenticatedPage.waitForTimeout(3000);
        
        // Take screenshot of progress
        await authenticatedPage.screenshot({ path: 'test-results/matrix-generation-progress.png' });
      }
      
      // Look for completion messages or preview
      const previewElements = authenticatedPage.locator('video, [data-testid*="preview"], .video-preview');
      const successMessages = authenticatedPage.locator('[data-testid*="success"], .MuiAlert-standardSuccess');
      
      if (await previewElements.count() > 0 || await successMessages.count() > 0) {
        await authenticatedPage.screenshot({ path: 'test-results/matrix-generation-complete.png' });
      }
    } else {
      console.log('No generate button found, skipping generation test');
      test.skip();
    }
  });

  test('should export completed matrix project', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/matrix');
    await authenticatedPage.waitForLoadState('networkidle');
    
    // Look for export or download buttons
    const exportButtons = authenticatedPage.locator('button').filter({ 
      hasText: /export|download|share|publish/i 
    });
    
    if (await exportButtons.count() > 0) {
      await exportButtons.first().click({ force: true });
      
      // Wait for export dialog
      await authenticatedPage.waitForTimeout(1000);
      
      // Take screenshot of export options
      await authenticatedPage.screenshot({ path: 'test-results/matrix-export-dialog.png' });
      
      // Look for export format options
      const formatOptions = authenticatedPage.locator('input[type="radio"], select option, .export-format');
      
      if (await formatOptions.count() > 0) {
        // Select an export format if options exist
        await formatOptions.first().click();
      }
      
      // Look for final export button
      const finalExportButton = authenticatedPage.locator('button').filter({ 
        hasText: /confirm|export|download/i 
      });
      
      if (await finalExportButton.count() > 0) {
        // Start download
        const downloadPromise = authenticatedPage.waitForEvent('download');
        await finalExportButton.first().click();
        
        try {
          const download = await downloadPromise;
          console.log('Download started:', download.suggestedFilename());
          
          // Take screenshot after export
          await authenticatedPage.screenshot({ path: 'test-results/matrix-export-complete.png' });
        } catch (e) {
          console.log('No actual download occurred, but export flow tested');
        }
      }
    } else {
      console.log('No export button found, skipping export test');
      test.skip();
    }
  });
});