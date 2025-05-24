import React from 'react';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';
import { vi } from 'vitest';
import DashboardLayout from '../DashboardLayout';

vi.mock('next/router', () => ({
  useRouter: vi.fn(),
}));

describe('DashboardLayout', () => {
  const mockPush = vi.fn();
  
  beforeEach(() => {
    (useRouter as any).mockReturnValue({
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
    (useRouter as any).mockReturnValue({
      pathname: '/generate',
      push: mockPush,
    });
    
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const generateLink = screen.getByText(/Generate/i).closest('a');
    expect(generateLink).toHaveClass('active');
  });
});
