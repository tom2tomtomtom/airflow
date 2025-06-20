import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { useRouter } from 'next/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DashboardLayout from '../DashboardLayout';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('DashboardLayout', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: '/',
      push: mockPush,
    });
  });

  it('renders children correctly', () => {
    const childText = 'Test Child Content';
    render(<DashboardLayout><div>{childText}</div></DashboardLayout>);
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('renders navigation menu', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Generate/i)).toBeInTheDocument();
    expect(screen.getByText(/Templates/i)).toBeInTheDocument();
    expect(screen.getByText(/Matrix/i)).toBeInTheDocument();
  });

  it('highlights active route', () => {
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      pathname: '/generate',
      push: mockPush,
    });
    
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const generateLink = screen.getByText(/Generate/i).closest('a');
    expect(generateLink).toHaveClass('active');
  });
});
