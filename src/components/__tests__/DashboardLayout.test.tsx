import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { useRouter } from 'next/router';
// Jest test - no imports needed for basic Jest functions
import DashboardLayout from '../DashboardLayout';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('DashboardLayout', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as ReturnType<typeof jest.fn>).mockReturnValue({
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
    (useRouter as ReturnType<typeof jest.fn>).mockReturnValue({
      pathname: '/generate',
      push: mockPush,
    });
    
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const generateLink = screen.getByText(/Generate/i).closest('a');
    expect(generateLink).toHaveClass('active');
  });
});
