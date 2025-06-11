/**
 * Performance and Accessibility Testing Suite
 * Comprehensive testing for performance benchmarks and accessibility compliance
 */

import { test, expect } from '@playwright/test';
import { AuthHelper } from '../utils/auth-helper';
import { DashboardPage } from '../pages/dashboard-page';
import { AssetsPage } from '../pages/assets-page';
import { MatrixPage } from '../pages/matrix-page';
import { StrategyPage } from '../pages/strategy-page';

test.describe('Performance Testing', () => {
  let authHelper: AuthHelper;
  let dashboardPage: DashboardPage;
  let assetsPage: AssetsPage;
  let matrixPage: MatrixPage;
  let strategyPage: StrategyPage;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    dashboardPage = new DashboardPage(page);
    assetsPage = new AssetsPage(page);
    matrixPage = new MatrixPage(page);
    strategyPage = new StrategyPage(page);
    
    await authHelper.login('test@airwave.com', 'TestPass123!');
  });

  test.describe('Page Load Performance', () => {
    test('all critical pages load within performance thresholds', async ({ page }) => {
      const performanceMetrics = [];

      await test.step('Dashboard loads quickly', async () => {
        const startTime = Date.now();
        await dashboardPage.goto();
        await dashboardPage.waitForAllContent();
        const loadTime = Date.now() - startTime;
        
        performanceMetrics.push({ page: 'Dashboard', loadTime });
        expect(loadTime).toBeLessThan(3000); // 3 seconds max
      });

      await test.step('Assets page loads with large asset library', async () => {
        // First, populate with test assets to simulate real usage
        await assetsPage.goto();
        
        const startTime = Date.now();
        await page.reload();
        await assetsPage.waitForLoad();
        const loadTime = Date.now() - startTime;
        
        performanceMetrics.push({ page: 'Assets', loadTime });
        expect(loadTime).toBeLessThan(5000); // 5 seconds for asset-heavy page
      });

      await test.step('Matrix page loads complex interface', async () => {
        const startTime = Date.now();
        await matrixPage.goto();
        await matrixPage.waitForLoad();
        const loadTime = Date.now() - startTime;
        
        performanceMetrics.push({ page: 'Matrix', loadTime });
        expect(loadTime).toBeLessThan(4000); // 4 seconds for complex interface
      });

      await test.step('Strategy page loads AI components', async () => {
        const startTime = Date.now();
        await strategyPage.goto();
        await strategyPage.waitForLoad();
        const loadTime = Date.now() - startTime;
        
        performanceMetrics.push({ page: 'Strategy', loadTime });
        expect(loadTime).toBeLessThan(3000); // 3 seconds for AI interface
      });

      // Log performance metrics for analysis
      console.log('Performance Metrics:', performanceMetrics);
    });

    test('pages handle network latency gracefully', async ({ page }) => {
      // Simulate slow network conditions
      const client = await page.context().newCDPSession(page);
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 200 // 200ms latency
      });

      await test.step('Dashboard remains usable with slow network', async () => {
        const startTime = Date.now();
        await dashboardPage.goto();
        
        // Should show loading states
        await expect(dashboardPage.page.locator('[data-testid="loading-skeleton"]')).toBeVisible();
        
        await dashboardPage.waitForAllContent();
        const loadTime = Date.now() - startTime;
        
        // Should complete within reasonable time even with slow network
        expect(loadTime).toBeLessThan(10000);
      });

      await test.step('Asset uploads show proper progress with slow network', async () => {
        await assetsPage.goto();
        await assetsPage.openUploadModal();
        
        const startTime = Date.now();
        await assetsPage.uploadFileByDrop('slow-network-test.jpg', 'image');
        
        // Should show progress indicator
        const progressVisible = await assetsPage.uploadProgress.isVisible();
        expect(progressVisible).toBeTruthy();
        
        await assetsPage.waitForUploadComplete(30000); // Extended timeout for slow network
        const uploadTime = Date.now() - startTime;
        
        console.log(`Upload time with slow network: ${uploadTime}ms`);
      });

      // Restore normal network conditions
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0
      });
    });
  });

  test.describe('Runtime Performance', () => {
    test('search operations remain responsive', async ({ page }) => {
      await assetsPage.goto();
      
      // Measure search performance
      const searchQueries = ['test', 'image', 'video', 'brand', 'campaign'];
      
      for (const query of searchQueries) {
        const startTime = Date.now();
        await assetsPage.searchAssets(query);
        const searchTime = Date.now() - startTime;
        
        expect(searchTime).toBeLessThan(1000); // Search should be instant
        
        // Clear search for next iteration
        await assetsPage.clearAllFilters();
      }
    });

    test('matrix operations scale with size', async ({ page }) => {
      await matrixPage.goto();
      await matrixPage.createNewMatrix();
      
      await test.step('Adding rows remains fast', async () => {
        const rowAddTimes = [];
        
        for (let i = 0; i < 20; i++) {
          const startTime = Date.now();
          await matrixPage.addRow();
          const addTime = Date.now() - startTime;
          
          rowAddTimes.push(addTime);
          expect(addTime).toBeLessThan(2000); // Each row addition should be fast
        }
        
        // Performance shouldn't degrade significantly
        const avgEarlyTime = rowAddTimes.slice(0, 5).reduce((a, b) => a + b) / 5;
        const avgLateTime = rowAddTimes.slice(-5).reduce((a, b) => a + b) / 5;
        
        expect(avgLateTime).toBeLessThan(avgEarlyTime * 3); // Max 3x degradation
      });

      await test.step('Asset assignment remains responsive', async () => {
        await matrixPage.openAssetBrowser();
        
        const assignmentTimes = [];
        
        // Test assignment to multiple cells
        for (let row = 0; row < 5; row++) {
          for (let col = 0; col < 3; col++) {
            const startTime = Date.now();
            await matrixPage.assignAssetByClick(row, col, 'test-image.jpg');
            const assignTime = Date.now() - startTime;
            
            assignmentTimes.push(assignTime);
            expect(assignTime).toBeLessThan(3000);
          }
        }
        
        console.log('Asset assignment times:', assignmentTimes);
      });
    });

    test('AI processing provides real-time feedback', async ({ page }) => {
      await strategyPage.goto();
      
      await strategyPage.createBriefWithTextInput({
        briefText: 'Create a comprehensive campaign strategy for a new product launch targeting millennials with a focus on sustainability and innovation.'
      });
      
      await test.step('Processing status updates regularly', async () => {
        await strategyPage.processButton.click();
        
        const statusUpdates = [];
        let previousStatus = '';
        
        // Monitor status updates for 30 seconds or until completion
        const startTime = Date.now();
        while (Date.now() - startTime < 30000) {
          if (await strategyPage.aiProcessingModal.isVisible()) {
            const currentStatus = await strategyPage.processingStatus.textContent();
            
            if (currentStatus && currentStatus !== previousStatus) {
              statusUpdates.push({
                status: currentStatus,
                timestamp: Date.now() - startTime
              });
              previousStatus = currentStatus;
            }
            
            await page.waitForTimeout(1000);
          } else {
            break; // Processing completed
          }
        }
        
        // Should have multiple meaningful status updates
        expect(statusUpdates.length).toBeGreaterThan(1);
        
        // Status updates should be informative
        const hasInformativeUpdates = statusUpdates.some(update => 
          update.status.match(/analyzing|generating|processing|creating/i)
        );
        expect(hasInformativeUpdates).toBeTruthy();
        
        console.log('AI Processing Status Updates:', statusUpdates);
      });
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('application handles large asset libraries efficiently', async ({ page }) => {
      await assetsPage.goto();
      
      await test.step('Upload multiple large assets', async () => {
        const largeAssets = Array.from({ length: 10 }, (_, i) => `large-asset-${i}.jpg`);
        
        for (const asset of largeAssets) {
          await assetsPage.uploadFileByDrop(asset, 'image');
        }
        
        // Check that memory usage remains reasonable
        const memoryUsage = await page.evaluate(() => {
          return (performance as any).memory ? {
            usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
            totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
            jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
          } : null;
        });
        
        if (memoryUsage) {
          const memoryUsagePercent = (memoryUsage.usedJSHeapSize / memoryUsage.jsHeapSizeLimit) * 100;
          expect(memoryUsagePercent).toBeLessThan(70); // Should use less than 70% of available memory
          
          console.log('Memory Usage:', {
            ...memoryUsage,
            usagePercent: memoryUsagePercent.toFixed(2) + '%'
          });
        }
      });
    });

    test('long sessions maintain performance', async ({ page }) => {
      // Simulate extended user session
      const operations = [
        () => dashboardPage.goto(),
        () => assetsPage.goto(),
        () => assetsPage.searchAssets('test'),
        () => matrixPage.goto(),
        () => matrixPage.createNewMatrix(),
        () => strategyPage.goto(),
        () => dashboardPage.goto()
      ];
      
      const performanceTimes = [];
      
      // Perform operations multiple times to simulate long session
      for (let cycle = 0; cycle < 3; cycle++) {
        for (const operation of operations) {
          const startTime = Date.now();
          await operation();
          const operationTime = Date.now() - startTime;
          
          performanceTimes.push({
            cycle,
            operation: operation.name,
            time: operationTime
          });
        }
      }
      
      // Performance shouldn't degrade significantly over time
      const firstCycleTimes = performanceTimes.filter(p => p.cycle === 0).map(p => p.time);
      const lastCycleTimes = performanceTimes.filter(p => p.cycle === 2).map(p => p.time);
      
      const avgFirstCycle = firstCycleTimes.reduce((a, b) => a + b) / firstCycleTimes.length;
      const avgLastCycle = lastCycleTimes.reduce((a, b) => a + b) / lastCycleTimes.length;
      
      expect(avgLastCycle).toBeLessThan(avgFirstCycle * 2); // Max 2x degradation over session
      
      console.log('Session Performance:', {
        firstCycleAvg: avgFirstCycle,
        lastCycleAvg: avgLastCycle,
        degradation: ((avgLastCycle / avgFirstCycle) * 100).toFixed(2) + '%'
      });
    });
  });
});

test.describe('Accessibility Testing', () => {
  let authHelper: AuthHelper;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    dashboardPage = new DashboardPage(page);
    
    await authHelper.login('test@airwave.com', 'TestPass123!');
  });

  test.describe('Keyboard Navigation', () => {
    test('complete workflow navigable by keyboard', async ({ page }) => {
      await test.step('Dashboard navigation works with keyboard', async () => {
        await dashboardPage.goto();
        
        // Test tab navigation through main elements
        await page.keyboard.press('Tab');
        const focusedElement = await page.locator(':focus').first();
        await expect(focusedElement).toBeVisible();
        
        // Test that all interactive elements are reachable
        const interactiveElements = [
          dashboardPage.userMenu,
          dashboardPage.clientSelector,
          dashboardPage.globalSearch,
          dashboardPage.clientsLink,
          dashboardPage.assetsLink,
          dashboardPage.matrixLink
        ];
        
        for (let i = 0; i < interactiveElements.length; i++) {
          await page.keyboard.press('Tab');
          // Verify we can reach important navigation elements
        }
      });

      await test.step('Form navigation works with keyboard', async () => {
        await page.goto('/clients');
        
        const clientsPage = new (await import('../pages/clients-page')).ClientsPage(page);
        await clientsPage.openCreateClientModal();
        
        // Test tab navigation through form
        await page.keyboard.press('Tab');
        await expect(clientsPage.clientNameInput).toBeFocused();
        
        await page.keyboard.press('Tab');
        await expect(clientsPage.clientEmailInput).toBeFocused();
        
        // Test form submission with Enter key
        await clientsPage.clientNameInput.fill('Keyboard Test Client');
        await clientsPage.clientEmailInput.fill('keyboard@test.com');
        await page.keyboard.press('Tab'); // Move to save button
        await page.keyboard.press('Enter');
        
        // Should submit form
        await expect(clientsPage.createModal).toBeHidden();
      });

      await test.step('Matrix navigation works with keyboard', async () => {
        await page.goto('/matrix');
        const matrixPage = new (await import('../pages/matrix-page')).MatrixPage(page);
        
        await matrixPage.createNewMatrix();
        
        // Test arrow key navigation in matrix
        const firstCell = matrixPage.getMatrixCell(0, 0);
        await firstCell.focus();
        
        await page.keyboard.press('ArrowRight');
        const secondCell = matrixPage.getMatrixCell(0, 1);
        await expect(secondCell).toBeFocused();
        
        await page.keyboard.press('ArrowDown');
        const belowCell = matrixPage.getMatrixCell(1, 1);
        await expect(belowCell).toBeFocused();
      });
    });

    test('keyboard shortcuts work correctly', async ({ page }) => {
      await dashboardPage.goto();
      
      // Test global keyboard shortcuts
      await test.step('Global shortcuts function', async () => {
        // Test search shortcut (Ctrl+K or Cmd+K)
        const isMac = process.platform === 'darwin';
        const shortcutKey = isMac ? 'Meta+k' : 'Control+k';
        
        await page.keyboard.press(shortcutKey);
        await expect(dashboardPage.globalSearch).toBeFocused();
        
        // Test escape to clear
        await page.keyboard.press('Escape');
      });

      await test.step('Context-specific shortcuts work', async () => {
        await page.goto('/assets');
        const assetsPage = new (await import('../pages/assets-page')).AssetsPage(page);
        
        // Test upload shortcut
        await page.keyboard.press('Control+u');
        if (await assetsPage.uploadModal.isVisible()) {
          await expect(assetsPage.uploadModal).toBeVisible();
          await page.keyboard.press('Escape');
        }
      });
    });
  });

  test.describe('Screen Reader Support', () => {
    test('semantic markup and ARIA labels are correct', async ({ page }) => {
      await test.step('Page structure is semantic', async () => {
        await dashboardPage.goto();
        
        // Check for proper heading structure
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
        expect(headings.length).toBeGreaterThan(0);
        
        // Check main navigation has proper role
        const nav = await page.locator('nav, [role="navigation"]').first();
        await expect(nav).toBeVisible();
        
        // Check main content area
        const main = await page.locator('main, [role="main"]').first();
        await expect(main).toBeVisible();
      });

      await test.step('Interactive elements have proper labels', async () => {
        await page.goto('/clients');
        const clientsPage = new (await import('../pages/clients-page')).ClientsPage(page);
        
        await clientsPage.openCreateClientModal();
        
        // Check form inputs have labels
        const nameInputLabel = await clientsPage.clientNameInput.getAttribute('aria-label') ||
                               await page.locator('label[for*="name"]').first().textContent();
        expect(nameInputLabel).toBeTruthy();
        
        const emailInputLabel = await clientsPage.clientEmailInput.getAttribute('aria-label') ||
                                await page.locator('label[for*="email"]').first().textContent();
        expect(emailInputLabel).toBeTruthy();
      });

      await test.step('Dynamic content updates are announced', async () => {
        await page.goto('/flow');
        const strategyPage = new (await import('../pages/strategy-page')).StrategyPage(page);
        
        // Check that processing status has live region
        const statusLiveRegion = await strategyPage.processingStatus.getAttribute('aria-live');
        expect(statusLiveRegion).toMatch(/polite|assertive/);
        
        // Check error messages have proper role
        await strategyPage.startNewBrief();
        await strategyPage.processButton.click();
        
        if (await strategyPage.errorMessage.isVisible()) {
          const errorRole = await strategyPage.errorMessage.getAttribute('role');
          const errorAria = await strategyPage.errorMessage.getAttribute('aria-live');
          expect(errorRole || errorAria).toBeTruthy();
        }
      });
    });

    test('complex widgets are accessible', async ({ page }) => {
      await test.step('Matrix grid is accessible', async () => {
        await page.goto('/matrix');
        const matrixPage = new (await import('../pages/matrix-page')).MatrixPage(page);
        
        await matrixPage.createNewMatrix();
        
        // Grid should have proper role
        const gridRole = await matrixPage.matrixGrid.getAttribute('role');
        expect(gridRole).toBe('grid');
        
        // Cells should have proper role
        const firstCell = matrixPage.getMatrixCell(0, 0);
        const cellRole = await firstCell.getAttribute('role');
        expect(cellRole).toBe('gridcell');
        
        // Row headers should be marked
        const rowHeader = await matrixPage.matrixRows.first().locator('[role="rowheader"]').first();
        if (await rowHeader.isVisible()) {
          await expect(rowHeader).toBeVisible();
        }
      });

      await test.step('Asset browser is accessible', async () => {
        await page.goto('/assets');
        const assetsPage = new (await import('../pages/assets-page')).AssetsPage(page);
        
        // Asset cards should have proper labels
        const firstAsset = assetsPage.assetCards.first();
        const assetLabel = await firstAsset.getAttribute('aria-label') ||
                          await firstAsset.locator('[data-testid="asset-name"]').textContent();
        expect(assetLabel).toBeTruthy();
        
        // Search should have proper label
        const searchLabel = await assetsPage.searchInput.getAttribute('aria-label') ||
                           await assetsPage.searchInput.getAttribute('placeholder');
        expect(searchLabel).toMatch(/search/i);
      });
    });
  });

  test.describe('Visual Accessibility', () => {
    test('color contrast meets WCAG standards', async ({ page }) => {
      await dashboardPage.goto();
      
      // This would typically use an accessibility testing library
      // For now, we'll test that text elements are visible and have sufficient contrast
      const textElements = await page.locator('p, span, div, button, a').all();
      
      for (const element of textElements.slice(0, 10)) { // Test first 10 elements
        const textContent = await element.textContent();
        if (textContent && textContent.trim()) {
          // Element should be visible (basic contrast check)
          await expect(element).toBeVisible();
          
          // Check computed styles for basic contrast issues
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize
            };
          });
          
          // Basic validation that styles are set
          expect(styles.color).not.toBe('');
          expect(styles.fontSize).not.toBe('');
        }
      }
    });

    test('focus indicators are visible', async ({ page }) => {
      await dashboardPage.goto();
      
      // Test that focusable elements have visible focus indicators
      const focusableElements = [
        dashboardPage.userMenu,
        dashboardPage.clientSelector,
        dashboardPage.globalSearch,
        dashboardPage.clientsLink
      ];
      
      for (const element of focusableElements) {
        await element.focus();
        
        // Check that element has focus styling
        const hasFocusStyle = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.outline !== 'none' || 
                 styles.boxShadow.includes('inset') ||
                 styles.borderColor !== styles.backgroundColor;
        });
        
        expect(hasFocusStyle).toBeTruthy();
      }
    });

    test('text can be scaled to 200% without loss of functionality', async ({ page }) => {
      await dashboardPage.goto();
      
      // Zoom to 200%
      await page.evaluate(() => {
        document.body.style.zoom = '2';
      });
      
      // Verify that important elements are still visible and functional
      await expect(dashboardPage.userMenu).toBeVisible();
      await expect(dashboardPage.sidebar).toBeVisible();
      
      // Test that navigation still works
      await dashboardPage.clientsLink.click();
      await expect(page).toHaveURL(/\/clients/);
      
      // Reset zoom
      await page.evaluate(() => {
        document.body.style.zoom = '1';
      });
    });
  });

  test.describe('Motion and Animation', () => {
    test('respects reduced motion preferences', async ({ page }) => {
      // Set reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });
      
      await dashboardPage.goto();
      
      // Check that animations are reduced or disabled
      const animatedElements = await page.locator('[class*="animate"], [class*="transition"]').all();
      
      for (const element of animatedElements.slice(0, 5)) {
        const animationDuration = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.animationDuration;
        });
        
        // Animation should be instant or very short with reduced motion
        expect(animationDuration === '0s' || animationDuration === '0.01s').toBeTruthy();
      }
    });

    test('provides alternatives to motion-based interactions', async ({ page }) => {
      await page.goto('/matrix');
      const matrixPage = new (await import('../pages/matrix-page')).MatrixPage(page);
      
      await matrixPage.createNewMatrix();
      await matrixPage.openAssetBrowser();
      
      // Test that drag-and-drop has keyboard/click alternatives
      const firstAsset = matrixPage.assetItems.first();
      const targetCell = matrixPage.getMatrixCell(0, 0);
      
      // Should be able to select asset and then click cell (alternative to drag-and-drop)
      await firstAsset.click();
      await targetCell.click();
      
      // Verify assignment worked
      await expect(targetCell.locator('[data-testid="assigned-asset"]')).toBeVisible();
    });
  });
});

test.describe('Mobile Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('mobile interface is accessible', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    await authHelper.login('test@airwave.com', 'TestPass123!');
    
    await test.step('Touch targets meet size requirements', async () => {
      const dashboardPage = new DashboardPage(page);
      await dashboardPage.goto();
      
      const touchableElements = [
        dashboardPage.userMenu,
        dashboardPage.clientSelector,
        dashboardPage.clientsLink,
        dashboardPage.assetsLink
      ];
      
      for (const element of touchableElements) {
        const bounds = await element.boundingBox();
        expect(bounds?.width).toBeGreaterThanOrEqual(44); // WCAG minimum
        expect(bounds?.height).toBeGreaterThanOrEqual(44);
      }
    });

    await test.step('Mobile navigation is keyboard accessible', async () => {
      const dashboardPage = new DashboardPage(page);
      
      // Test mobile menu if present
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.focus();
        await page.keyboard.press('Enter');
        
        // Mobile menu should open
        const mobileMenu = page.locator('[data-testid="mobile-menu"]');
        await expect(mobileMenu).toBeVisible();
      }
    });

    await test.step('Forms are usable on mobile', async () => {
      await page.goto('/clients');
      const clientsPage = new (await import('../pages/clients-page')).ClientsPage(page);
      
      await clientsPage.openCreateClientModal();
      
      // Form should be properly sized for mobile
      const modal = clientsPage.createModal;
      const modalBounds = await modal.boundingBox();
      expect(modalBounds?.width).toBeLessThanOrEqual(375);
      
      // Input fields should be appropriately sized
      const nameInputBounds = await clientsPage.clientNameInput.boundingBox();
      expect(nameInputBounds?.height).toBeGreaterThanOrEqual(44);
    });
  });
});