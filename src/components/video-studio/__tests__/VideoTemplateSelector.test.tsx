import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoTemplateSelector } from '../VideoTemplateSelector';
import { VideoTemplate } from '../types';

// Mock data
const mockTemplates: VideoTemplate[] = [
  {
    id: 'template-1',
    name: 'Social Media Promo',
    description: 'Perfect for social media campaigns with dynamic text and animations',
    thumbnail: 'https://via.placeholder.com/300x169/4f46e5/ffffff?text=Social+Promo',
    duration: 15,
    aspect_ratio: '16:9',
    platform: ['instagram', 'facebook', 'youtube'],
    category: 'Social Media',
    tags: ['promo', 'social', 'dynamic'],
  },
  {
    id: 'template-2',
    name: 'Product Showcase',
    description: 'Showcase your products with elegant transitions and branding',
    thumbnail: 'https://via.placeholder.com/300x169/e91e63/ffffff?text=Product+Showcase',
    duration: 20,
    aspect_ratio: '16:9',
    platform: ['youtube', 'linkedin', 'facebook'],
    category: 'Product',
    tags: ['product', 'showcase', 'elegant'],
  },
  {
    id: 'template-3',
    name: 'TikTok Vertical',
    description: 'Vertical format optimized for TikTok and Instagram Stories',
    thumbnail: 'https://via.placeholder.com/169x300/ff9800/ffffff?text=TikTok+Vertical',
    duration: 10,
    aspect_ratio: '9:16',
    platform: ['tiktok', 'instagram'],
    category: 'Vertical',
    tags: ['vertical', 'tiktok', 'stories'],
  },
  {
    id: 'template-4',
    name: 'Corporate Presentation',
    description: 'Professional template for corporate communications',
    thumbnail: 'https://via.placeholder.com/300x169/2196f3/ffffff?text=Corporate',
    duration: 30,
    aspect_ratio: '16:9',
    platform: ['linkedin', 'youtube'],
    category: 'Corporate',
    tags: ['corporate', 'professional', 'presentation'],
  },
];

describe('VideoTemplateSelector', () => {
  const mockOnTemplateSelect = jest.fn();
  const mockOnFilterChange = jest.fn();

  const defaultProps = {
    templates: mockTemplates,
    selectedTemplate: null,
    onTemplateSelect: mockOnTemplateSelect,
    filters: {},
    onFilterChange: mockOnFilterChange,
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all templates when no filters are applied', () => {
    render(<VideoTemplateSelector {...defaultProps} />);

    expect(screen.getByText('Social Media Promo')).toBeInTheDocument();
    expect(screen.getByText('Product Showcase')).toBeInTheDocument();
    expect(screen.getByText('TikTok Vertical')).toBeInTheDocument();
    expect(screen.getByText('Corporate Presentation')).toBeInTheDocument();
  });

  it('should display template information correctly', () => {
    render(<VideoTemplateSelector {...defaultProps} />);

    const socialTemplate = screen.getByText('Social Media Promo').closest('[role="button"]');
    expect(socialTemplate).toBeInTheDocument();

    // Check description
    expect(
      screen.getByText('Perfect for social media campaigns with dynamic text and animations')
    ).toBeInTheDocument();

    // Check metadata chips
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('16:9')).toBeInTheDocument();
    expect(screen.getByText('15s')).toBeInTheDocument();

    // Check platform chips
    expect(screen.getByText('instagram')).toBeInTheDocument();
    expect(screen.getByText('facebook')).toBeInTheDocument();
    expect(screen.getByText('youtube')).toBeInTheDocument();
  });

  it('should call onTemplateSelect when a template is clicked', () => {
    render(<VideoTemplateSelector {...defaultProps} />);

    const templateCard = screen.getByText('Social Media Promo').closest('[role="button"]');
    expect(templateCard).toBeInTheDocument();

    fireEvent.click(templateCard!);

    expect(mockOnTemplateSelect).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('should highlight selected template', () => {
    const propsWithSelection = {
      ...defaultProps,
      selectedTemplate: mockTemplates[0],
    };

    render(<VideoTemplateSelector {...propsWithSelection} />);

    const selectedCard = screen.getByText('Social Media Promo').closest('[role="button"]');
    expect(selectedCard).toHaveStyle({ borderColor: expect.stringContaining('primary') });
  });

  it('should filter templates by category', () => {
    const propsWithCategoryFilter = {
      ...defaultProps,
      filters: { category: 'Product' },
    };

    render(<VideoTemplateSelector {...propsWithCategoryFilter} />);

    expect(screen.getByText('Product Showcase')).toBeInTheDocument();
    expect(screen.queryByText('Social Media Promo')).not.toBeInTheDocument();
    expect(screen.queryByText('TikTok Vertical')).not.toBeInTheDocument();
    expect(screen.queryByText('Corporate Presentation')).not.toBeInTheDocument();
  });

  it('should filter templates by platform', () => {
    const propsWithPlatformFilter = {
      ...defaultProps,
      filters: { platform: 'tiktok' },
    };

    render(<VideoTemplateSelector {...propsWithPlatformFilter} />);

    expect(screen.getByText('TikTok Vertical')).toBeInTheDocument();
    expect(screen.queryByText('Social Media Promo')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Showcase')).not.toBeInTheDocument();
    expect(screen.queryByText('Corporate Presentation')).not.toBeInTheDocument();
  });

  it('should filter templates by aspect ratio', () => {
    const propsWithAspectRatioFilter = {
      ...defaultProps,
      filters: { aspect_ratio: '9:16' },
    };

    render(<VideoTemplateSelector {...propsWithAspectRatioFilter} />);

    expect(screen.getByText('TikTok Vertical')).toBeInTheDocument();
    expect(screen.queryByText('Social Media Promo')).not.toBeInTheDocument();
    expect(screen.queryByText('Product Showcase')).not.toBeInTheDocument();
    expect(screen.queryByText('Corporate Presentation')).not.toBeInTheDocument();
  });

  it('should filter templates by duration', () => {
    const propsWithDurationFilter = {
      ...defaultProps,
      filters: { duration: 'short' }, // Assuming short means <= 15s
    };

    render(<VideoTemplateSelector {...propsWithDurationFilter} />);

    expect(screen.getByText('Social Media Promo')).toBeInTheDocument(); // 15s
    expect(screen.getByText('TikTok Vertical')).toBeInTheDocument(); // 10s
    expect(screen.queryByText('Product Showcase')).not.toBeInTheDocument(); // 20s
    expect(screen.queryByText('Corporate Presentation')).not.toBeInTheDocument(); // 30s
  });

  it('should filter templates by search term', () => {
    const propsWithSearchFilter = {
      ...defaultProps,
      filters: { search: 'social' },
    };

    render(<VideoTemplateSelector {...propsWithSearchFilter} />);

    expect(screen.getByText('Social Media Promo')).toBeInTheDocument();
    expect(screen.queryByText('Product Showcase')).not.toBeInTheDocument();
    expect(screen.queryByText('TikTok Vertical')).not.toBeInTheDocument();
    expect(screen.queryByText('Corporate Presentation')).not.toBeInTheDocument();
  });

  it('should apply multiple filters together', () => {
    const propsWithMultipleFilters = {
      ...defaultProps,
      filters: {
        category: 'Social Media',
        platform: 'instagram',
        aspect_ratio: '16:9',
      },
    };

    render(<VideoTemplateSelector {...propsWithMultipleFilters} />);

    expect(screen.getByText('Social Media Promo')).toBeInTheDocument();
    expect(screen.queryByText('Product Showcase')).not.toBeInTheDocument();
    expect(screen.queryByText('TikTok Vertical')).not.toBeInTheDocument();
    expect(screen.queryByText('Corporate Presentation')).not.toBeInTheDocument();
  });

  it('should display loading state', () => {
    const propsWithLoading = {
      ...defaultProps,
      loading: true,
    };

    render(<VideoTemplateSelector {...propsWithLoading} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });

  it('should display empty state when no templates match filters', () => {
    const propsWithNoResults = {
      ...defaultProps,
      filters: { category: 'NonExistentCategory' },
    };

    render(<VideoTemplateSelector {...propsWithNoResults} />);

    expect(screen.getByText('No templates found')).toBeInTheDocument();
    expect(
      screen.getByText('Try adjusting your filters to see more templates.')
    ).toBeInTheDocument();
  });

  it('should render filter controls and handle filter changes', () => {
    render(<VideoTemplateSelector {...defaultProps} />);

    // Check if filter controls are present
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Platform')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search templates...')).toBeInTheDocument();

    // Test search filter
    const searchInput = screen.getByPlaceholderText('Search templates...');
    fireEvent.change(searchInput, { target: { value: 'product' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ search: 'product' });
  });

  it('should handle template thumbnails and display fallbacks', () => {
    const templatesWithMissingThumbnail = [
      {
        ...mockTemplates[0],
        thumbnail: '',
      },
    ];

    const propsWithMissingThumbnail = {
      ...defaultProps,
      templates: templatesWithMissingThumbnail,
    };

    render(<VideoTemplateSelector {...propsWithMissingThumbnail} />);

    // Should handle missing thumbnails gracefully
    const templateCard = screen.getByText('Social Media Promo').closest('[role="button"]');
    expect(templateCard).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA attributes', () => {
    render(<VideoTemplateSelector {...defaultProps} />);

    // Check for proper role attributes
    const templateCards = screen.getAllByRole('button');
    expect(templateCards).toHaveLength(mockTemplates.length);

    // Check for proper labels
    templateCards.forEach((card, index) => {
      expect(card).toHaveAttribute(
        'aria-label',
        expect.stringContaining(mockTemplates[index].name)
      );
    });
  });

  it('should support keyboard navigation', () => {
    render(<VideoTemplateSelector {...defaultProps} />);

    const firstTemplate = screen.getAllByRole('button')[0];
    firstTemplate.focus();

    fireEvent.keyDown(firstTemplate, { key: 'Enter' });
    expect(mockOnTemplateSelect).toHaveBeenCalledWith(mockTemplates[0]);

    fireEvent.keyDown(firstTemplate, { key: ' ' });
    expect(mockOnTemplateSelect).toHaveBeenCalledTimes(2);
  });
});
