import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UnifiedBriefWorkflow } from '../UnifiedBriefWorkflow';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ClientProvider } from '@/contexts/ClientContext';

// Mock fetch responses
const mockFetch = jest.fn();

// Mock API responses
const mockBriefParseResponse = {
  success: true,
  data: {
    title: 'Test Campaign',
    industry: 'Technology',
    product: 'AI Platform',
    objective: 'Increase brand awareness',
    targetAudience: 'Tech professionals',
    valueProposition: 'Revolutionary AI technology',
    budget: '$50,000',
    timeline: '3 months',
    platforms: ['LinkedIn', 'Twitter']
  }
};

const mockMotivationsResponse = {
  success: true,
  data: [
    {
      id: 'motivation-1',
      text: 'Innovation Leadership',
      description: 'Position as industry innovator',
      selected: false
    },
    {
      id: 'motivation-2',
      text: 'Problem Solving',
      description: 'Address key industry challenges',
      selected: false
    },
    {
      id: 'motivation-3',
      text: 'Efficiency Gains',
      description: 'Demonstrate productivity improvements',
      selected: false
    }
  ]
};

const mockCopyResponse = {
  success: true,
  data: [
    {
      id: 'copy-1',
      text: 'Revolutionary AI platform transforming business operations',
      motivation: 'Innovation Leadership',
      platform: 'LinkedIn',
      selected: false
    },
    {
      id: 'copy-2',
      text: 'Solve complex challenges with intelligent automation',
      motivation: 'Problem Solving',
      platform: 'LinkedIn',
      selected: false
    },
    {
      id: 'copy-3',
      text: 'Boost productivity by 300% with our AI solution',
      motivation: 'Efficiency Gains',
      platform: 'Twitter',
      selected: false
    }
  ]
};

const mockCostCheckResponse = {
  allowed: true,
  budgetRemaining: 850.50,
  fallbackModel: null,
  usageStats: {
    percentOfBudget: 15.5
  }
};

// Mock providers
const MockProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>
    <ClientProvider>
      {children}
    </ClientProvider>
  </NotificationProvider>
);

describe('Workflow Integration Tests', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onComplete: jest.fn(),
  };

  beforeAll(() => {
    global.fetch = mockFetch;
  });

  beforeEach(() => {
    mockFetch.mockClear();
    // Setup default successful responses
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBriefParseResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCostCheckResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMotivationsResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCostCheckResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCopyResponse,
      } as Response);
  });

  const renderWorkflow = (props: Record<string, any> = {}) => {
    return render(
      <MockProviders>
        <UnifiedBriefWorkflow {...defaultProps} {...props} />
      </MockProviders>
    );
  };

  test('should render workflow dialog correctly', async () => {
    renderWorkflow();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('AIRWAVE Campaign Builder')).toBeInTheDocument();
    });

    // Should show upload step
    expect(screen.getByText('Upload Brief')).toBeInTheDocument();

    // Should show step description
    await waitFor(() => {
      expect(screen.getByText('Start by uploading your campaign brief. Our AI will parse the content and extract key information.')).toBeInTheDocument();
    });
  });

  test('should handle API errors gracefully', async () => {
    // Setup error response for brief parsing
    mockFetch.mockClear();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        success: false,
        message: 'Failed to parse brief'
      }),
    } as Response);

    renderWorkflow();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('AIRWAVE Campaign Builder')).toBeInTheDocument();
    });

    // Should render without crashing even with API errors
    expect(screen.getByText('Upload Brief')).toBeInTheDocument();
  });

  test('should handle budget limits correctly', async () => {
    // Setup budget limit response
    mockFetch.mockClear();
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBriefParseResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          allowed: false,
          reason: 'Monthly budget limit exceeded',
          budgetRemaining: 0
        }),
      } as Response);

    renderWorkflow();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('AIRWAVE Campaign Builder')).toBeInTheDocument();
    });

    // Should render workflow steps
    expect(screen.getByText('Upload Brief')).toBeInTheDocument();
    expect(screen.getByText('Motivations')).toBeInTheDocument();
  });

  test('should display workflow steps correctly', async () => {
    renderWorkflow();

    await waitFor(() => {
      expect(screen.getByText('AIRWAVE Campaign Builder')).toBeInTheDocument();
    });

    // Check all workflow steps are displayed
    expect(screen.getByText('Upload Brief')).toBeInTheDocument();
    expect(screen.getByText('Motivations')).toBeInTheDocument();
    expect(screen.getByText('Copy Generation')).toBeInTheDocument();
    expect(screen.getByText('Asset Selection')).toBeInTheDocument();
    expect(screen.getByText('Template')).toBeInTheDocument();
    expect(screen.getByText('Campaign Matrix')).toBeInTheDocument();
    expect(screen.getByText('Render Videos')).toBeInTheDocument();
  });
});
