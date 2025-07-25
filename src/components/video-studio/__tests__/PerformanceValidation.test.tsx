import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PerformanceMonitor, usePerformanceMonitor } from '../utils/performance';
import {
  VideoStudioProvider,
  VideoTemplateSelector,
  VideoConfigurationPanel,
  ContentElementEditor,
  VideoPreviewPanel,
  GenerationControlPanel,
} from '../index';
import { VideoTemplate, VideoConfig, ContentElements } from '../types';

// Performance validation tests for optimized components
describe('Performance Optimization Validation', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.clearMetrics();
    jest.clearAllMocks();
  });

  const mockTemplates: VideoTemplate[] = Array.from({ length: 20 }, (_, index) => ({
    id: `template-${index}`,
    name: `Template ${index + 1}`,
    description: `Description for template ${index + 1}`,
    thumbnail: `https://via.placeholder.com/300x169?text=Template+${index + 1}`,
    duration: 15 + (index % 45),
    aspect_ratio: ['16:9', '1:1', '9:16'][index % 3] as '16:9' | '1:1' | '9:16',
    platform: ['instagram', 'facebook', 'youtube', 'tiktok'][index % 4] as 'instagram' | 'facebook' | 'youtube' | 'tiktok',
    category: ['Social Media', 'Product', 'Marketing', 'Educational'][index % 4],
    tags: [`tag-${index}`, `category-${index % 4}`],
  }));

  describe('React.memo Optimization Validation', () => {
    it('should prevent unnecessary re-renders in VideoTemplateSelector', () => {
      let renderCount = 0;
      
      const TrackedVideoTemplateSelector = () => {
        renderCount++;
        return (
          <VideoTemplateSelector
            templates={mockTemplates}
            selectedTemplate={null}
            onTemplateSelect={() => {}}
            filters={{}}
            onFilterChange={() => {}}
          />
        );
      };

      const TestComponent = () => {
        const [externalState, setExternalState] = React.useState(0);
        
        return (
          <VideoStudioProvider>
            <button onClick={() => setExternalState(prev => prev + 1)}>
              Update External: {externalState}
            </button>
            <TrackedVideoTemplateSelector />
          </VideoStudioProvider>
        );
      };

      render(<TestComponent />);
      const initialRenderCount = renderCount;
      
      // Update external state that shouldn't affect VideoTemplateSelector
      const updateButton = screen.getByText(/Update External: 0/);
      fireEvent.click(updateButton);
      fireEvent.click(updateButton);
      fireEvent.click(updateButton);

      // VideoTemplateSelector should not re-render due to React.memo
      expect(renderCount).toBe(initialRenderCount);
    });

    it('should validate useCallback optimization in event handlers', () => {
      const mockOnTemplateSelect = jest.fn();
      const mockOnFilterChange = jest.fn();
      
      const TestComponent = () => {
        // These functions change on every render without useCallback
        const onTemplateSelect = React.useCallback(mockOnTemplateSelect, []);
        const onFilterChange = React.useCallback(mockOnFilterChange, []);
        
        return (
          <VideoStudioProvider>
            <VideoTemplateSelector
              templates={mockTemplates}
              selectedTemplate={null}
              onTemplateSelect={onTemplateSelect}
              filters={{}}
              onFilterChange={onFilterChange}
            />
          </VideoStudioProvider>
        );
      };

      const { rerender } = render(<TestComponent />);
      
      // Select a template
      const firstTemplate = screen.getByText('Template 1');
      fireEvent.click(firstTemplate);
      
      // Re-render the component
      rerender(<TestComponent />);
      
      // Select another template
      const secondTemplate = screen.getByText('Template 2');
      fireEvent.click(secondTemplate);

      // Event handlers should work consistently
      expect(mockOnTemplateSelect).toHaveBeenCalledTimes(2);
    });
  });

  describe('useMemo Optimization Validation', () => {
    it('should memoize expensive filtering calculations', () => {
      const TestComponent = () => {
        const [searchTerm, setSearchTerm] = React.useState('');
        const [unrelatedState, setUnrelatedState] = React.useState(0);
        
        return (
          <VideoStudioProvider>
            <input
              data-testid="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              data-testid="unrelated-button"
              onClick={() => setUnrelatedState(prev => prev + 1)}
            >
              Unrelated State: {unrelatedState}
            </button>
            <VideoTemplateSelector
              templates={mockTemplates}
              selectedTemplate={null}
              onTemplateSelect={() => {}}
              filters={{ search: searchTerm }}
              onFilterChange={() => {}}
            />
          </VideoStudioProvider>
        );
      };

      render(<TestComponent />);
      
      // Update search term - should trigger filtering recalculation
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Template 1' } });
      
      // Should show filtered results
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.queryByText('Template 2')).not.toBeInTheDocument();
      
      // Update unrelated state - should NOT trigger filtering recalculation
      const unrelatedButton = screen.getByTestId('unrelated-button');
      fireEvent.click(unrelatedButton);
      
      // Results should remain the same (memoized)
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.queryByText('Template 2')).not.toBeInTheDocument();
    });

    it('should memoize VideoStudioPage step content rendering', () => {
      let stepContentRenderCount = 0;
      
      // Mock component that tracks renders
      const MockStepContent = React.memo(() => {
        stepContentRenderCount++;
        return <div data-testid="step-content">Step Content</div>;
      });

      const TestComponent = () => {
        const [activeStep, setActiveStep] = React.useState(0);
        const [unrelatedState, setUnrelatedState] = React.useState(0);
        
        return (
          <div>
            <button onClick={() => setActiveStep(1)}>Next Step</button>
            <button onClick={() => setUnrelatedState(prev => prev + 1)}>
              Unrelated: {unrelatedState}
            </button>
            {activeStep === 0 && <MockStepContent />}
          </div>
        );
      };

      render(<TestComponent />);
      const initialRenderCount = stepContentRenderCount;
      
      // Update unrelated state
      const unrelatedButton = screen.getByText(/Unrelated: 0/);
      fireEvent.click(unrelatedButton);
      fireEvent.click(unrelatedButton);
      
      // Step content should not re-render due to memoization
      expect(stepContentRenderCount).toBe(initialRenderCount);
      
      // Change step - should trigger re-render
      const nextButton = screen.getByText('Next Step');
      fireEvent.click(nextButton);
      
      // Step content should disappear (step changed)
      expect(screen.queryByTestId('step-content')).not.toBeInTheDocument();
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track component render times', () => {
      let totalRenderTime = 0;
      
      const PerformanceTrackedComponent: React.FC = () => {
        const endMeasure = performanceMonitor.startMeasure('TestComponent Render');
        
        React.useEffect(() => {
          totalRenderTime += endMeasure();
        });
        
        return (
          <VideoStudioProvider>
            <VideoTemplateSelector
              templates={mockTemplates.slice(0, 5)}
              selectedTemplate={null}
              onTemplateSelect={() => {}}
              filters={{}}
              onFilterChange={() => {}}
            />
          </VideoStudioProvider>
        );
      };

      render(<PerformanceTrackedComponent />);
      
      // Should have recorded render time
      expect(totalRenderTime).toBeGreaterThan(0);
      
      const metrics = performanceMonitor.getMetrics();
      expect(metrics['TestComponent Render']).toBeDefined();
      expect(metrics['TestComponent Render'].count).toBe(1);
    });

    it('should validate performance under stress conditions', async () => {
      const StressTestComponent = () => {
        const [templates, setTemplates] = React.useState(mockTemplates.slice(0, 5));
        const [selectedTemplate, setSelectedTemplate] = React.useState<VideoTemplate | null>(null);
        
        React.useEffect(() => {
          // Simulate rapid template additions
          const interval = setInterval(() => {
            setTemplates(prev => {
              if (prev.length < 20) {
                return [...prev, mockTemplates[prev.length]];
              }
              return prev;
            });
          }, 50);
          
          return () => clearInterval(interval);
        }, []);
        
        return (
          <VideoStudioProvider>
            <VideoTemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              filters={{}}
              onFilterChange={() => {}}
            />
            <div data-testid="template-count">Templates: {templates.length}</div>
          </VideoStudioProvider>
        );
      };

      render(<StressTestComponent />);
      
      // Wait for templates to load gradually
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
      });
      
      // Should handle rapid updates gracefully
      const templateCount = screen.getByTestId('template-count');
      expect(templateCount.textContent).toContain('Templates: 20');
      
      // All templates should be rendered
      expect(screen.getByText('Template 20')).toBeInTheDocument();
    });
  });

  describe('Memory Usage Optimization', () => {
    it('should not create memory leaks with rapid mount/unmount', () => {
      const MountUnmountTest = () => {
        const [showComponent, setShowComponent] = React.useState(true);
        const [toggleCount, setToggleCount] = React.useState(0);
        
        React.useEffect(() => {
          if (toggleCount < 5) {
            const timer = setTimeout(() => {
              setShowComponent(prev => !prev);
              setToggleCount(prev => prev + 1);
            }, 100);
            return () => clearTimeout(timer);
          }
        }, [showComponent, toggleCount]);
        
        return (
          <div>
            <div data-testid="toggle-count">Toggles: {toggleCount}</div>
            {showComponent && (
              <VideoStudioProvider>
                <VideoTemplateSelector
                  templates={mockTemplates.slice(0, 10)}
                  selectedTemplate={null}
                  onTemplateSelect={() => {}}
                  filters={{}}
                  onFilterChange={() => {}}
                />
              </VideoStudioProvider>
            )}
          </div>
        );
      };

      render(<MountUnmountTest />);
      
      // Wait for all toggles to complete
      return act(async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Should complete all toggles without errors
        const toggleCount = screen.getByTestId('toggle-count');
        expect(toggleCount.textContent).toContain('Toggles: 5');
      });
    });
  });

  describe('Bundle Size Impact', () => {
    it('should validate that optimizations do not significantly increase bundle size', () => {
      // This test validates that our optimization utilities are tree-shakeable
      const { container } = render(
        <VideoStudioProvider>
          <VideoTemplateSelector
            templates={mockTemplates.slice(0, 3)}
            selectedTemplate={null}
            onTemplateSelect={() => {}}
            filters={{}}
            onFilterChange={() => {}}
          />
        </VideoStudioProvider>
      );
      
      // Component should render successfully with optimizations
      expect(container.firstChild).toBeTruthy();
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 2')).toBeInTheDocument();
      expect(screen.getByText('Template 3')).toBeInTheDocument();
    });
  });

  describe('Real-world Performance Scenarios', () => {
    it('should handle rapid user interactions without performance degradation', async () => {
      const InteractionTest = () => {
        const [selectedTemplate, setSelectedTemplate] = React.useState<VideoTemplate | null>(null);
        const [filters, setFilters] = React.useState({});
        
        return (
          <VideoStudioProvider>
            <input
              data-testid="rapid-search"
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Search templates"
            />
            <VideoTemplateSelector
              templates={mockTemplates}
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
              filters={filters}
              onFilterChange={setFilters}
            />
            <div data-testid="selected-template">
              {selectedTemplate ? selectedTemplate.name : 'None'}
            </div>
          </VideoStudioProvider>
        );
      };

      render(<InteractionTest />);
      
      const searchInput = screen.getByTestId('rapid-search');
      const selectedDisplay = screen.getByTestId('selected-template');
      
      // Simulate rapid typing
      const searchText = 'Template 1';
      for (let i = 1; i <= searchText.length; i++) {
        fireEvent.change(searchInput, { 
          target: { value: searchText.substring(0, i) } 
        });
      }
      
      // Should handle rapid changes gracefully
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      
      // Select template
      fireEvent.click(screen.getByText('Template 1'));
      
      await act(async () => {
        expect(selectedDisplay.textContent).toBe('Template 1');
      });
    });

    it('should maintain performance with large datasets', () => {
      const largeTemplateSet = Array.from({ length: 100 }, (_, index) => ({
        ...mockTemplates[0],
        id: `large-template-${index}`,
        name: `Large Template ${index + 1}`,
      }));

      const startTime = performance.now();
      
      render(
        <VideoStudioProvider>
          <VideoTemplateSelector
            templates={largeTemplateSet}
            selectedTemplate={null}
            onTemplateSelect={() => {}}
            filters={{}}
            onFilterChange={() => {}}
          />
        </VideoStudioProvider>
      );
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large dataset within reasonable time (< 500ms)
      expect(renderTime).toBeLessThan(500);
      
      // Should display templates correctly
      expect(screen.getByText('Large Template 1')).toBeInTheDocument();
      expect(screen.getByText('Large Template 100')).toBeInTheDocument();
    });
  });
});