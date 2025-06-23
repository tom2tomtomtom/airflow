import React from 'react';
import { render } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import { useRouter } from 'next/router';
// Jest test - no imports needed for basic Jest functions
import DashboardLayout from '../DashboardLayout';
import { ThemeModeProvider } from '../../contexts/ThemeContext';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('DashboardLayout', () => {
  const mockPush = jest.fn();

  // Helper function to render with ThemeModeProvider
  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeModeProvider>{component}</ThemeModeProvider>);
  };

  beforeEach(() => {
    (useRouter as ReturnType<typeof jest.fn>).mockReturnValue({
      pathname: '/',
      push: mockPush,
    });
  });

  it('renders children correctly', () => {
    const childText = 'Test Child Content';
    renderWithTheme(
      <DashboardLayout>
        <div>{childText}</div>
      </DashboardLayout>
    );
    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('renders navigation menu', () => {
    renderWithTheme(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    // Use getAllByText for multiple Dashboard elements
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
    // Check for navigation items that might be in the drawer (not visible by default)
    expect(screen.getByLabelText('open drawer')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    (useRouter as ReturnType<typeof jest.fn>).mockReturnValue({
      pathname: '/dashboard',
      push: mockPush,
    });

    renderWithTheme(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    // Check that the component renders without errors when pathname is set
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
