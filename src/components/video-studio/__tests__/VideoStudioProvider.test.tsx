import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { VideoStudioProvider, useVideoStudio } from '../VideoStudioProvider';
import { useClient } from '@/contexts/ClientContext';
import { useNotification } from '@/contexts/NotificationContext';

// Mock the external dependencies
jest.mock('@/contexts/ClientContext');
jest.mock('@/contexts/NotificationContext');

const mockUseClient = useClient as jest.MockedFunction<typeof useClient>;
const mockUseNotification = useNotification as jest.MockedFunction<typeof useNotification>;

// Mock fetch globally
global.fetch = jest.fn();

// Test component that uses the VideoStudio context
const TestComponent: React.FC = () => {
  const context = useVideoStudio();

  return (
    <div>
      <div data-testid="templates-count">{context.templates.length}</div>
      <div data-testid="selected-template">{context.selectedTemplate?.name || 'none'}</div>
      <div data-testid="video-config-prompt">{context.videoConfig.prompt}</div>
      <div data-testid="generation-status">{context.generationStatus}</div>
      <div data-testid="active-step">{context.activeStep}</div>
      <div data-testid="loading">{context.loading.toString()}</div>
      <button
        data-testid="update-config"
        onClick={() => context.updateVideoConfig({ prompt: 'test prompt' })}
      >
        Update Config
      </button>
      <button
        data-testid="set-template"
        onClick={() =>
          context.setSelectedTemplate({
            id: '1',
            name: 'Test Template',
            description: 'Test',
            thumbnail: '',
            duration: 30,
            aspect_ratio: '16:9',
            platform: ['youtube'],
            category: 'commercial',
            tags: [],
          })
        }
      >
        Set Template
      </button>
    </div>
  );
};

describe('VideoStudioProvider', () => {
  const mockShowNotification = jest.fn();
  const mockActiveClient = {
    id: '1',
    name: 'Test Client',
    logo: 'test-logo.png',
    primaryColor: '#ff0000',
    secondaryColor: '#00ff00',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseClient.mockReturnValue({
      activeClient: mockActiveClient,
      clients: [mockActiveClient],
      setActiveClient: jest.fn(),
      loading: false,
      error: null,
    });

    mockUseNotification.mockReturnValue({
      showNotification: mockShowNotification,
      notifications: [],
      clearNotification: jest.fn(),
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        templates: [
          {
            id: '1',
            name: 'Template 1',
            description: 'Test template 1',
            thumbnail: 'thumb1.jpg',
            duration: 30,
            aspect_ratio: '16:9',
            platform: ['youtube'],
            category: 'commercial',
            tags: ['business'],
          },
          {
            id: '2',
            name: 'Template 2',
            description: 'Test template 2',
            thumbnail: 'thumb2.jpg',
            duration: 15,
            aspect_ratio: '1:1',
            platform: ['instagram'],
            category: 'social',
            tags: ['lifestyle'],
          },
        ],
      }),
    });
  });

  it('should initialize with default state', async () => {
    render(
      <VideoStudioProvider>
        <TestComponent />
      </VideoStudioProvider>
    );

    // Check initial state
    expect(screen.getByTestId('selected-template')).toHaveTextContent('none');
    expect(screen.getByTestId('video-config-prompt')).toHaveTextContent('');
    expect(screen.getByTestId('generation-status')).toHaveTextContent('idle');
    expect(screen.getByTestId('active-step')).toHaveTextContent('0');

    // Wait for templates to load
    await waitFor(() => {
      expect(screen.getByTestId('templates-count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
  });

  it('should load templates on mount', async () => {
    render(
      <VideoStudioProvider>
        <TestComponent />
      </VideoStudioProvider>
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/templates');
      expect(screen.getByTestId('templates-count')).toHaveTextContent('2');
    });
  });

  it('should handle template loading error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <VideoStudioProvider>
        <TestComponent />
      </VideoStudioProvider>
    );

    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Error loading templates', 'error');
    });
  });

  it('should update video configuration', async () => {
    render(
      <VideoStudioProvider>
        <TestComponent />
      </VideoStudioProvider>
    );

    const updateButton = screen.getByTestId('update-config');

    act(() => {
      updateButton.click();
    });

    expect(screen.getByTestId('video-config-prompt')).toHaveTextContent('test prompt');
  });

  it('should set selected template', async () => {
    render(
      <VideoStudioProvider>
        <TestComponent />
      </VideoStudioProvider>
    );

    const setTemplateButton = screen.getByTestId('set-template');

    act(() => {
      setTemplateButton.click();
    });

    expect(screen.getByTestId('selected-template')).toHaveTextContent('Test Template');
  });

  it('should initialize with brand elements from active client', async () => {
    const TestBrandComponent: React.FC = () => {
      const { contentElements } = useVideoStudio();
      return (
        <div>
          <div data-testid="logo-url">{contentElements.brand_elements?.logo_url || 'none'}</div>
          <div data-testid="color-scheme">
            {contentElements.brand_elements?.color_scheme?.join(',') || 'none'}
          </div>
        </div>
      );
    };

    render(
      <VideoStudioProvider>
        <TestBrandComponent />
      </VideoStudioProvider>
    );

    expect(screen.getByTestId('logo-url')).toHaveTextContent('test-logo.png');
    expect(screen.getByTestId('color-scheme')).toHaveTextContent('#ff0000,#00ff00');
  });

  it('should accept initial configuration and elements', async () => {
    const initialConfig = {
      prompt: 'Initial prompt',
      style: 'animated',
      duration: 20,
    };

    const initialElements = {
      text_overlays: [{ text: 'Initial overlay', position: 'center' as const }],
      background_music: false,
    };

    const TestInitialComponent: React.FC = () => {
      const { videoConfig, contentElements } = useVideoStudio();
      return (
        <div>
          <div data-testid="initial-prompt">{videoConfig.prompt}</div>
          <div data-testid="initial-style">{videoConfig.style}</div>
          <div data-testid="initial-duration">{videoConfig.duration}</div>
          <div data-testid="initial-overlays">{contentElements.text_overlays.length}</div>
          <div data-testid="initial-music">{contentElements.background_music.toString()}</div>
        </div>
      );
    };

    render(
      <VideoStudioProvider initialConfig={initialConfig} initialElements={initialElements}>
        <TestInitialComponent />
      </VideoStudioProvider>
    );

    expect(screen.getByTestId('initial-prompt')).toHaveTextContent('Initial prompt');
    expect(screen.getByTestId('initial-style')).toHaveTextContent('animated');
    expect(screen.getByTestId('initial-duration')).toHaveTextContent('20');
    expect(screen.getByTestId('initial-overlays')).toHaveTextContent('1');
    expect(screen.getByTestId('initial-music')).toHaveTextContent('false');
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useVideoStudio must be used within a VideoStudioProvider');

    consoleSpy.mockRestore();
  });

  it('should handle video generation', async () => {
    const TestGenerationComponent: React.FC = () => {
      const { generateVideo, setSelectedTemplate, generationStatus } = useVideoStudio();

      const handleGenerate = () => {
        setSelectedTemplate({
          id: '1',
          name: 'Test Template',
          description: 'Test',
          thumbnail: '',
          duration: 30,
          aspect_ratio: '16:9',
          platform: ['youtube'],
          category: 'commercial',
          tags: [],
        });
        generateVideo({ quality: 'standard', format: 'mp4' });
      };

      return (
        <div>
          <div data-testid="generation-status">{generationStatus}</div>
          <button data-testid="generate" onClick={handleGenerate}>
            Generate
          </button>
        </div>
      );
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ templates: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, generation_id: 'test-123' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'completed',
          progress: 100,
          output_url: 'test-video.mp4',
          thumbnail_url: 'test-thumb.jpg',
          duration: 30,
        }),
      });

    render(
      <VideoStudioProvider>
        <TestGenerationComponent />
      </VideoStudioProvider>
    );

    const generateButton = screen.getByTestId('generate');

    act(() => {
      generateButton.click();
    });

    // Should start generating
    expect(screen.getByTestId('generation-status')).toHaveTextContent('generating');

    // Wait for completion
    await waitFor(
      () => {
        expect(screen.getByTestId('generation-status')).toHaveTextContent('completed');
      },
      { timeout: 1000 }
    );
  });
});
