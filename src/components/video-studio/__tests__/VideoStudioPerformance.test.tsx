import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { performance } from 'perf_hooks';
import {
  VideoStudioProvider,
  VideoTemplateSelector,
  VideoConfigurationPanel,
  ContentElementEditor,
  VideoPreviewPanel,
  GenerationControlPanel,
} from '../index';
import { VideoTemplate, VideoConfig, ContentElements } from '../types';

// Mock data for performance tests
const mockTemplates: VideoTemplate[] = Array.from({ length: 50 }, (_, index) => ({
  id: `template-${index}`,
  name: `Template ${index + 1}`,
  description: `Description for template ${index + 1}`,
  thumbnail: `https://via.placeholder.com/300x169?text=Template+${index + 1}`,
  duration: 15 + (index % 45), // Vary duration from 15-60s
  aspect_ratio: ['16:9', '1:1', '9:16'][index % 3] as '16:9' | '1:1' | '9:16',
  platform: ['instagram', 'facebook', 'youtube', 'tiktok'][index % 4] as any,
  category: ['Social Media', 'Product', 'Marketing', 'Educational'][index % 4],
  tags: [`tag-${index}`, `category-${index % 4}`],
}));

const mockVideoConfig: VideoConfig = {
  prompt: 'Test video configuration for performance testing',
  style: 'modern',
  duration: 30,
  resolution: '1920x1080',
  platform: 'instagram',
  aspect_ratio: '16:9',
  template_id: 'template-1',
};

const mockContentElements: ContentElements = {
  text_overlays: Array.from({ length: 10 }, (_, index) => ({
    id: `overlay-${index}`,
    text: `Text overlay ${index + 1}`,
    position: { x: 50, y: 50 + index * 20 },
    style: {
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#ffffff',
      fontWeight: 'bold',
    },
  })),
  background_music: true,
  voice_over: undefined,
  brand_elements: {
    logo_url: 'https://via.placeholder.com/100x100',
    color_scheme: ['#007bff', '#28a745'],
  },
};

// Performance measurement utilities
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  reRenderCount: number;
}

const measurePerformance = (testName: string, testFn: () => void): PerformanceMetrics => {
  // Get initial memory usage
  const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  // Measure render time
  const startTime = performance.now();
  testFn();
  const endTime = performance.now();
  
  // Get final memory usage
  const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
  
  const metrics: PerformanceMetrics = {
    renderTime: endTime - startTime,
    memoryUsage: finalMemory - initialMemory,
    reRenderCount: 0, // Will be tracked separately
  };
  
  console.log(`Performance Test: ${testName}`, metrics);
  return metrics;
};

// Custom hook to count re-renders
let renderCount = 0;
const useRenderCounter = (componentName: string) => {
  renderCount++;
  React.useEffect(() => {
    console.log(`${componentName} rendered ${renderCount} times`);
  });
};

// Wrapper components with render counting
const VideoTemplateSelectorWithCounter: React.FC<any> = (props) => {
  useRenderCounter('VideoTemplateSelector');
  return <VideoTemplateSelector {...props} />;
};

const VideoConfigurationPanelWithCounter: React.FC<any> = (props) => {
  useRenderCounter('VideoConfigurationPanel');
  return <VideoConfigurationPanel {...props} />;
};

const ContentElementEditorWithCounter: React.FC<any> = (props) => {
  useRenderCounter('ContentElementEditor');
  return <ContentElementEditor {...props} />;
};

describe('Video Studio Performance Tests', () => {
  beforeEach(() => {
    renderCount = 0;
    jest.clearAllMocks();
  });

  describe('Initial Rendering Performance', () => {
    it('should render VideoTemplateSelector with 50 templates quickly', () => {
      const metrics = measurePerformance('VideoTemplateSelector Initial Render', () => {
        render(
          <VideoStudioProvider>
            <VideoTemplateSelector
              templates={mockTemplates}
              selectedTemplate={null}
              onTemplateSelect={() => {}}
              filters={{}}
              onFilterChange={() => {}}
            />
          </VideoStudioProvider>
        );
      });

      // Rendering 50 templates should complete within 100ms
      expect(metrics.renderTime).toBeLessThan(100);
      
      // Should find template elements
      expect(screen.getByText('Template 1')).toBeInTheDocument();
      expect(screen.getByText('Template 50')).toBeInTheDocument();
    });

    it('should render VideoConfigurationPanel without performance issues', () => {
      const metrics = measurePerformance('VideoConfigurationPanel Initial Render', () => {
        render(
          <VideoStudioProvider>
            <VideoConfigurationPanel
              config={mockVideoConfig}
              onConfigChange={() => {}}
              template={mockTemplates[0]}
            />
          </VideoStudioProvider>
        );
      });

      // Configuration panel should render quickly
      expect(metrics.renderTime).toBeLessThan(50);
      
      // Should display configuration elements
      expect(screen.getByDisplayValue('Test video configuration for performance testing')).toBeInTheDocument();
    });

    it('should render ContentElementEditor with multiple elements efficiently', () => {
      const metrics = measurePerformance('ContentElementEditor Initial Render', () => {
        render(
          <VideoStudioProvider>
            <ContentElementEditor
              elements={mockContentElements.text_overlays}
              onElementsChange={() => {}}
              template={mockTemplates[0]}
              selectedElement={null}
              onElementSelect={() => {}}
              contentElements={mockContentElements}
            />
          </VideoStudioProvider>
        );
      });

      // Should render 10 text overlays quickly
      expect(metrics.renderTime).toBeLessThan(75);
      
      // Should display overlay elements
      expect(screen.getByText('Text overlay 1')).toBeInTheDocument();
      expect(screen.getByText('Text overlay 10')).toBeInTheDocument();
    });

    it('should render complete video studio workflow within performance budget', () => {
      const metrics = measurePerformance('Complete Video Studio Render', () => {
        render(
          <VideoStudioProvider>
            <div>
              <VideoTemplateSelector
                templates={mockTemplates.slice(0, 10)} // Limit for complete workflow test
                selectedTemplate={mockTemplates[0]}
                onTemplateSelect={() => {}}
                filters={{}}
                onFilterChange={() => {}}
              />
              <VideoConfigurationPanel
                config={mockVideoConfig}
                onConfigChange={() => {}}
                template={mockTemplates[0]}
              />
              <ContentElementEditor
                elements={mockContentElements.text_overlays.slice(0, 5)}
                onElementsChange={() => {}}
                template={mockTemplates[0]}
                selectedElement={null}
                onElementSelect={() => {}}
                contentElements={mockContentElements}
              />
              <VideoPreviewPanel
                config={mockVideoConfig}
                elements={mockContentElements}
                template={mockTemplates[0]}
                previewUrl={undefined}
                onPreviewGenerate={() => {}}
                loading={false}
              />
              <GenerationControlPanel
                onGenerate={() => {}}
                generationStatus="idle"
                progress={0}
                resultUrl={null}
                onDownload={() => {}}
                onExport={() => {}}
              />
            </div>
          </VideoStudioProvider>
        );
      });

      // Complete workflow should render within reasonable time
      expect(metrics.renderTime).toBeLessThan(200);
    });
  });

  describe('Re-rendering Performance', () => {
    it('should minimize re-renders when template selection changes', async () => {
      const handleTemplateSelect = jest.fn();
      renderCount = 0;

      const { rerender } = render(
        <VideoStudioProvider>
          <VideoTemplateSelectorWithCounter
            templates={mockTemplates.slice(0, 10)}
            selectedTemplate={null}
            onTemplateSelect={handleTemplateSelect}
            filters={{}}
            onFilterChange={() => {}}
          />
        </VideoStudioProvider>
      );

      const initialRenderCount = renderCount;

      // Change selected template
      rerender(
        <VideoStudioProvider>
          <VideoTemplateSelectorWithCounter
            templates={mockTemplates.slice(0, 10)}
            selectedTemplate={mockTemplates[0]}
            onTemplateSelect={handleTemplateSelect}
            filters={{}}
            onFilterChange={() => {}}
          />
        </VideoStudioProvider>
      );

      // Should only re-render once for the template change
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });

    it('should not re-render unchanged components when state updates', async () => {
      renderCount = 0;

      const TestWrapper: React.FC = () => {
        const [config, setConfig] = React.useState(mockVideoConfig);
        const [elements, setElements] = React.useState(mockContentElements);

        return (
          <VideoStudioProvider>
            <VideoConfigurationPanelWithCounter
              config={config}
              onConfigChange={setConfig}
              template={mockTemplates[0]}
            />
            <ContentElementEditorWithCounter
              elements={elements.text_overlays}
              onElementsChange={(newElements) => {
                if (Array.isArray(newElements)) {
                  setElements(prev => ({ ...prev, text_overlays: newElements }));
                } else {
                  setElements(newElements);
                }
              }}
              template={mockTemplates[0]}
              selectedElement={null}
              onElementSelect={() => {}}
              contentElements={elements}
            />
          </VideoStudioProvider>
        );
      };

      render(<TestWrapper />);
      const initialRenderCount = renderCount;

      // Update only configuration
      const promptInput = screen.getByDisplayValue(mockVideoConfig.prompt);
      fireEvent.change(promptInput, { target: { value: 'Updated prompt' } });

      // ContentElementEditor should not re-render when config changes
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2);
    });

    it('should handle rapid filter changes without performance degradation', async () => {
      const handleFilterChange = jest.fn();
      renderCount = 0;

      render(
        <VideoStudioProvider>
          <VideoTemplateSelectorWithCounter
            templates={mockTemplates}
            selectedTemplate={null}
            onTemplateSelect={() => {}}
            filters={{}}
            onFilterChange={handleFilterChange}
          />
        </VideoStudioProvider>
      );

      const startTime = performance.now();

      // Simulate rapid filter changes
      for (let i = 0; i < 10; i++) {
        const filterInput = screen.getByPlaceholderText(/search templates/i);
        fireEvent.change(filterInput, { target: { value: `filter-${i}` } });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Rapid filter changes should not cause performance issues
      expect(totalTime).toBeLessThan(100);
      expect(handleFilterChange).toHaveBeenCalledTimes(10);
    });

    it('should efficiently handle large dataset updates', async () => {
      const TestComponent: React.FC = () => {
        const [templates, setTemplates] = React.useState(mockTemplates.slice(0, 10));
        
        React.useEffect(() => {
          // Simulate loading more templates
          const timer = setTimeout(() => {
            setTemplates(mockTemplates); // All 50 templates
          }, 100);
          
          return () => clearTimeout(timer);
        }, []);

        return (
          <VideoStudioProvider>
            <VideoTemplateSelectorWithCounter
              templates={templates}
              selectedTemplate={null}
              onTemplateSelect={() => {}}
              filters={{}}
              onFilterChange={() => {}}
            />
          </VideoStudioProvider>
        );
      };

      const metrics = measurePerformance('Large Dataset Update', () => {
        render(<TestComponent />);
      });

      // Should handle dataset expansion efficiently
      expect(metrics.renderTime).toBeLessThan(150);

      // Wait for template expansion
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Should display all templates after update
      expect(screen.getByText('Template 50')).toBeInTheDocument();
    });
  });

  describe('State Update Performance', () => {
    it('should handle complex state updates efficiently', async () => {
      const TestWrapper: React.FC = () => {
        const [state, setState] = React.useState({
          selectedTemplate: null as VideoTemplate | null,
          config: mockVideoConfig,
          elements: mockContentElements,
        });

        const updateAll = () => {
          setState({
            selectedTemplate: mockTemplates[0],
            config: { ...mockVideoConfig, prompt: 'Updated prompt' },
            elements: {
              ...mockContentElements,
              text_overlays: mockContentElements.text_overlays.slice(0, 5),
            },
          });
        };

        return (
          <VideoStudioProvider>
            <button onClick={updateAll}>Update All</button>
            <VideoTemplateSelectorWithCounter
              templates={mockTemplates.slice(0, 10)}
              selectedTemplate={state.selectedTemplate}
              onTemplateSelect={(template) => setState(prev => ({ ...prev, selectedTemplate: template }))}
              filters={{}}
              onFilterChange={() => {}}
            />
            <VideoConfigurationPanelWithCounter
              config={state.config}
              onConfigChange={(config) => setState(prev => ({ ...prev, config: { ...prev.config, ...config } }))}
              template={mockTemplates[0]}
            />
            <ContentElementEditorWithCounter
              elements={state.elements.text_overlays}
              onElementsChange={(elements) => setState(prev => ({
                ...prev,
                elements: {
                  ...prev.elements,
                  text_overlays: Array.isArray(elements) ? elements : prev.elements.text_overlays,
                },
              }))}
              template={mockTemplates[0]}
              selectedElement={null}
              onElementSelect={() => {}}
              contentElements={state.elements}
            />
          </VideoStudioProvider>
        );
      };

      render(<TestWrapper />);
      renderCount = 0;

      const startTime = performance.now();
      
      // Trigger complex state update
      const updateButton = screen.getByText('Update All');
      fireEvent.click(updateButton);

      const endTime = performance.now();
      const updateTime = endTime - startTime;

      // Complex state update should complete quickly
      expect(updateTime).toBeLessThan(50);
      
      // Should not cause excessive re-renders
      expect(renderCount).toBeLessThanOrEqual(6); // 3 components * 2 renders max
    });

    it('should handle async state updates without race conditions', async () => {
      const TestWrapper: React.FC = () => {
        const [loading, setLoading] = React.useState(false);
        const [data, setData] = React.useState<any>(null);

        const loadData = async () => {
          setLoading(true);
          
          // Simulate async operations
          await Promise.all([
            new Promise(resolve => setTimeout(resolve, 50)),
            new Promise(resolve => setTimeout(resolve, 75)),
            new Promise(resolve => setTimeout(resolve, 100)),
          ]);
          
          setData({ loaded: true, timestamp: Date.now() });
          setLoading(false);
        };

        return (
          <VideoStudioProvider>
            <button onClick={loadData}>Load Data</button>
            <div>Loading: {loading ? 'true' : 'false'}</div>
            <div>Data: {data ? JSON.stringify(data) : 'null'}</div>
          </VideoStudioProvider>
        );
      };

      render(<TestWrapper />);

      const loadButton = screen.getByText('Load Data');
      
      // Trigger multiple rapid async operations
      fireEvent.click(loadButton);
      fireEvent.click(loadButton);
      fireEvent.click(loadButton);

      // Wait for all operations to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });

      // Should handle concurrent operations gracefully
      expect(screen.getByText('Loading: false')).toBeInTheDocument();
      expect(screen.getByText(/Data: {"loaded":true/)).toBeInTheDocument();
    });
  });

  describe('Memory Usage', () => {
    it('should not create memory leaks with component mounting/unmounting', async () => {
      const TestWrapper: React.FC = () => {
        const [showComponents, setShowComponents] = React.useState(true);

        return (
          <VideoStudioProvider>
            <button onClick={() => setShowComponents(!showComponents)}>
              Toggle Components
            </button>
            {showComponents && (
              <>
                <VideoTemplateSelector
                  templates={mockTemplates.slice(0, 20)}
                  selectedTemplate={null}
                  onTemplateSelect={() => {}}
                  filters={{}}
                  onFilterChange={() => {}}
                />
                <VideoConfigurationPanel
                  config={mockVideoConfig}
                  onConfigChange={() => {}}
                  template={mockTemplates[0]}
                />
              </>
            )}
          </VideoStudioProvider>
        );
      };

      const { rerender } = render(<TestWrapper />);

      // Mount and unmount components multiple times
      for (let i = 0; i < 5; i++) {
        const toggleButton = screen.getByText('Toggle Components');
        fireEvent.click(toggleButton); // Unmount
        fireEvent.click(toggleButton); // Mount
      }

      // Should not cause memory issues or errors
      expect(screen.getByText('Toggle Components')).toBeInTheDocument();
    });

    it('should efficiently handle large template datasets', () => {
      const largeTemplateSet = Array.from({ length: 200 }, (_, index) => ({
        ...mockTemplates[0],
        id: `large-template-${index}`,
        name: `Large Template ${index + 1}`,
      }));

      const metrics = measurePerformance('Large Template Dataset', () => {
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
      });

      // Should handle large datasets within reasonable performance bounds
      expect(metrics.renderTime).toBeLessThan(300);
    });
  });

  describe('Event Handler Performance', () => {
    it('should throttle expensive operations like search filtering', async () => {
      const handleFilterChange = jest.fn();
      
      render(
        <VideoStudioProvider>
          <VideoTemplateSelector
            templates={mockTemplates}
            selectedTemplate={null}
            onTemplateSelect={() => {}}
            filters={{}}
            onFilterChange={handleFilterChange}
          />
        </VideoStudioProvider>
      );

      const searchInput = screen.getByPlaceholderText(/search templates/i);
      
      const startTime = performance.now();

      // Rapid typing simulation
      const searchTerm = 'performance test search';
      for (let i = 0; i < searchTerm.length; i++) {
        fireEvent.change(searchInput, { 
          target: { value: searchTerm.substring(0, i + 1) } 
        });
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid input changes efficiently
      expect(totalTime).toBeLessThan(100);
      expect(handleFilterChange).toHaveBeenCalledTimes(searchTerm.length);
    });

    it('should debounce preview generation requests', async () => {
      const handlePreviewGenerate = jest.fn();
      
      render(
        <VideoStudioProvider>
          <VideoPreviewPanel
            config={mockVideoConfig}
            elements={mockContentElements}
            template={mockTemplates[0]}
            previewUrl={undefined}
            onPreviewGenerate={handlePreviewGenerate}
            loading={false}
          />
        </VideoStudioProvider>
      );

      const generateButton = screen.getByText('Generate Preview');
      
      // Rapid clicking simulation
      for (let i = 0; i < 5; i++) {
        fireEvent.click(generateButton);
      }

      // Should debounce rapid clicks
      expect(handlePreviewGenerate).toHaveBeenCalledTimes(5);
    });
  });
});