import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ContentElementEditor } from '../ContentElementEditor';
import { VideoTemplate, ContentElements } from '../types';

// Mock template for testing
const mockTemplate: VideoTemplate = {
  id: 'template-1',
  name: 'Social Media Promo',
  description: 'Perfect for social media campaigns',
  thumbnail: 'https://via.placeholder.com/300x169',
  duration: 15,
  aspect_ratio: '16:9',
  platform: ['instagram', 'facebook', 'youtube'],
  category: 'Social Media',
  tags: ['promo', 'social'],
};

// Mock content elements for testing
const mockContentElements: ContentElements = {
  text_overlays: [],
  background_music: true,
  voice_over: undefined,
  brand_elements: {
    logo_url: 'https://example.com/logo.png',
    color_scheme: ['#ff0000', '#00ff00'],
    font_family: 'Arial, sans-serif',
  },
};

describe('ContentElementEditor', () => {
  const mockOnElementsChange = jest.fn();
  const mockOnElementSelect = jest.fn();
  const mockOnGenerationSettingsChange = jest.fn();

  const defaultProps = {
    elements: [],
    onElementsChange: mockOnElementsChange,
    template: mockTemplate,
    selectedElement: null,
    onElementSelect: mockOnElementSelect,
    maxElements: 5,
    onGenerationSettingsChange: mockOnGenerationSettingsChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all tabs', () => {
    render(<ContentElementEditor {...defaultProps} />);

    expect(screen.getByText('Text Overlays')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should display empty state for text overlays', () => {
    render(<ContentElementEditor {...defaultProps} />);

    expect(screen.getByText('No text overlays added yet')).toBeInTheDocument();
    expect(screen.getByText('Add Text Overlay')).toBeInTheDocument();
  });

  it('should add a new text overlay', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const addButton = screen.getByText('Add Text Overlay');
    fireEvent.click(addButton);

    expect(mockOnElementsChange).toHaveBeenCalledWith([{ text: '', position: 'center' }]);
  });

  it('should display existing text overlays', () => {
    const elementsWithOverlays = [
      { text: 'First overlay', position: 'top' as const },
      { text: 'Second overlay', position: 'bottom' as const },
    ];

    render(<ContentElementEditor {...defaultProps} elements={elementsWithOverlays} />);

    expect(screen.getByText('Text Overlay 1: First overlay')).toBeInTheDocument();
    expect(screen.getByText('Text Overlay 2: Second overlay')).toBeInTheDocument();
  });

  it('should update text overlay content', () => {
    const elementsWithOverlays = [{ text: 'Original text', position: 'center' as const }];

    render(<ContentElementEditor {...defaultProps} elements={elementsWithOverlays} />);

    // Expand the first accordion
    const accordion = screen.getByText('Text Overlay 1: Original text');
    fireEvent.click(accordion);

    // Update the text
    const textField = screen.getByDisplayValue('Original text');
    fireEvent.change(textField, { target: { value: 'Updated text' } });

    expect(mockOnElementsChange).toHaveBeenCalledWith([
      { text: 'Updated text', position: 'center' },
    ]);
  });

  it('should update text overlay position', () => {
    const elementsWithOverlays = [{ text: 'Test text', position: 'center' as const }];

    render(<ContentElementEditor {...defaultProps} elements={elementsWithOverlays} />);

    // Expand the accordion
    const accordion = screen.getByText('Text Overlay 1: Test text');
    fireEvent.click(accordion);

    // Change position
    const positionSelect = screen.getByLabelText('Position');
    fireEvent.mouseDown(positionSelect);

    const topOption = screen.getByText('Top');
    fireEvent.click(topOption);

    expect(mockOnElementsChange).toHaveBeenCalledWith([{ text: 'Test text', position: 'top' }]);
  });

  it('should remove text overlay', () => {
    const elementsWithOverlays = [
      { text: 'First overlay', position: 'top' as const },
      { text: 'Second overlay', position: 'bottom' as const },
    ];

    render(<ContentElementEditor {...defaultProps} elements={elementsWithOverlays} />);

    // Expand the first accordion
    const firstAccordion = screen.getByText('Text Overlay 1: First overlay');
    fireEvent.click(firstAccordion);

    // Remove the first overlay
    const removeButton = screen.getByText('Remove Overlay');
    fireEvent.click(removeButton);

    expect(mockOnElementsChange).toHaveBeenCalledWith([
      { text: 'Second overlay', position: 'bottom' },
    ]);
  });

  it('should add another text overlay when existing overlays are present', () => {
    const elementsWithOverlays = [{ text: 'Existing overlay', position: 'center' as const }];

    render(<ContentElementEditor {...defaultProps} elements={elementsWithOverlays} />);

    const addButton = screen.getByText('Add Another Overlay');
    fireEvent.click(addButton);

    expect(mockOnElementsChange).toHaveBeenCalledWith([
      { text: 'Existing overlay', position: 'center' },
      { text: '', position: 'center' },
    ]);
  });

  it('should respect maximum elements limit', () => {
    const maxElements = [
      { text: 'Overlay 1', position: 'top' as const },
      { text: 'Overlay 2', position: 'center' as const },
      { text: 'Overlay 3', position: 'bottom' as const },
    ];

    render(<ContentElementEditor {...defaultProps} elements={maxElements} maxElements={3} />);

    // Add button should be disabled when at max
    const addButton = screen.getByText('Add Another Overlay');
    expect(addButton).toBeDisabled();
  });

  it('should switch to audio tab and display audio controls', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const audioTab = screen.getByText('Audio');
    fireEvent.click(audioTab);

    expect(screen.getByText('Include Background Music')).toBeInTheDocument();
    expect(screen.getByText('Include Voice Over')).toBeInTheDocument();
  });

  it('should handle background music toggle', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const audioTab = screen.getByText('Audio');
    fireEvent.click(audioTab);

    const musicSwitch = screen.getByRole('checkbox', { name: /include background music/i });
    fireEvent.click(musicSwitch);

    expect(mockOnElementsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        background_music: expect.any(Boolean),
      })
    );
  });

  it('should enable voice over and show voice over controls', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const audioTab = screen.getByText('Audio');
    fireEvent.click(audioTab);

    const voiceOverSwitch = screen.getByRole('checkbox', { name: /include voice over/i });
    fireEvent.click(voiceOverSwitch);

    expect(mockOnElementsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        voice_over: {
          text: '',
          voice: 'neural',
          language: 'en',
        },
      })
    );
  });

  it('should show voice over controls when voice over is enabled', () => {
    const contentWithVoiceOver: ContentElements = {
      ...mockContentElements,
      voice_over: {
        text: 'Test voice over text',
        voice: 'female',
        language: 'es',
      },
    };

    render(<ContentElementEditor {...defaultProps} contentElements={contentWithVoiceOver} />);

    const audioTab = screen.getByText('Audio');
    fireEvent.click(audioTab);

    expect(screen.getByLabelText('Voice Over Text')).toBeInTheDocument();
    expect(screen.getByLabelText('Voice')).toBeInTheDocument();
    expect(screen.getByLabelText('Language')).toBeInTheDocument();
  });

  it('should update voice over text', () => {
    const contentWithVoiceOver: ContentElements = {
      ...mockContentElements,
      voice_over: {
        text: 'Original text',
        voice: 'neural',
        language: 'en',
      },
    };

    render(<ContentElementEditor {...defaultProps} contentElements={contentWithVoiceOver} />);

    const audioTab = screen.getByText('Audio');
    fireEvent.click(audioTab);

    const textField = screen.getByLabelText('Voice Over Text');
    fireEvent.change(textField, { target: { value: 'Updated voice over text' } });

    expect(mockOnElementsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        voice_over: {
          text: 'Updated voice over text',
          voice: 'neural',
          language: 'en',
        },
      })
    );
  });

  it('should switch to branding tab and display brand controls', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const brandingTab = screen.getByText('Branding');
    fireEvent.click(brandingTab);

    expect(screen.getByText('Brand Elements')).toBeInTheDocument();
    expect(screen.getByLabelText('Logo URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Font Family')).toBeInTheDocument();
  });

  it('should update logo URL', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const brandingTab = screen.getByText('Branding');
    fireEvent.click(brandingTab);

    const logoField = screen.getByLabelText('Logo URL');
    fireEvent.change(logoField, { target: { value: 'https://newlogo.com/logo.png' } });

    expect(mockOnElementsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        brand_elements: expect.objectContaining({
          logo_url: 'https://newlogo.com/logo.png',
        }),
      })
    );
  });

  it('should update font family', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const brandingTab = screen.getByText('Branding');
    fireEvent.click(brandingTab);

    const fontField = screen.getByLabelText('Font Family');
    fireEvent.change(fontField, { target: { value: 'Helvetica, sans-serif' } });

    expect(mockOnElementsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        brand_elements: expect.objectContaining({
          font_family: 'Helvetica, sans-serif',
        }),
      })
    );
  });

  it('should display brand colors when provided', () => {
    const contentWithBrandColors: ContentElements = {
      ...mockContentElements,
      brand_elements: {
        logo_url: 'test.png',
        color_scheme: ['#ff0000', '#00ff00'],
        font_family: 'Arial',
      },
    };

    render(<ContentElementEditor {...defaultProps} contentElements={contentWithBrandColors} />);

    const brandingTab = screen.getByText('Branding');
    fireEvent.click(brandingTab);

    expect(screen.getByText('Brand Colors:')).toBeInTheDocument();
  });

  it('should switch to settings tab and display generation settings', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);

    expect(screen.getByText('Generation Settings')).toBeInTheDocument();
    expect(screen.getByText(/Variations:/)).toBeInTheDocument();
    expect(screen.getByText('Include Captions')).toBeInTheDocument();
    expect(screen.getByText('Auto-optimize for Platform')).toBeInTheDocument();
    expect(screen.getByText('Save to Assets Library')).toBeInTheDocument();
  });

  it('should update variations count', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });

    expect(mockOnGenerationSettingsChange).toHaveBeenCalledWith({
      variations_count: 3,
    });
  });

  it('should handle captions toggle', () => {
    render(<ContentElementEditor {...defaultProps} />);

    const settingsTab = screen.getByText('Settings');
    fireEvent.click(settingsTab);

    const captionsSwitch = screen.getByRole('checkbox', { name: /include captions/i });
    fireEvent.click(captionsSwitch);

    expect(mockOnGenerationSettingsChange).toHaveBeenCalledWith({
      include_captions: expect.any(Boolean),
    });
  });

  it('should handle element selection', () => {
    const elementsWithOverlays = [
      { text: 'First overlay', position: 'top' as const },
      { text: 'Second overlay', position: 'bottom' as const },
    ];

    render(
      <ContentElementEditor {...defaultProps} elements={elementsWithOverlays} selectedElement="0" />
    );

    // First accordion should be expanded (selected)
    expect(screen.getByDisplayValue('First overlay')).toBeInTheDocument();
  });

  it('should display untitled for empty text overlays', () => {
    const elementsWithEmptyOverlay = [{ text: '', position: 'center' as const }];

    render(<ContentElementEditor {...defaultProps} elements={elementsWithEmptyOverlay} />);

    expect(screen.getByText('Text Overlay 1: Untitled')).toBeInTheDocument();
  });

  it('should be accessible with proper labels and roles', () => {
    render(<ContentElementEditor {...defaultProps} />);

    // Check tab accessibility
    const tabList = screen.getByRole('tablist');
    expect(tabList).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(4);

    // Check that tabs have proper labels
    expect(screen.getByRole('tab', { name: /text overlays/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /audio/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /branding/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
  });
});
