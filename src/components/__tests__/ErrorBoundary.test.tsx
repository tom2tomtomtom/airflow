// Jest test - no imports needed for basic Jest functions
import { render, waitFor } from '@testing-library/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from '../ErrorBoundary';

// Mock console methods to avoid noise in test output
const originalError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalError;
});

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when error is thrown', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText('We\'re sorry for the inconvenience. The application encountered an unexpected error.')
    ).toBeInTheDocument();
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error: Test error/)).toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Error: Test error/)).not.toBeInTheDocument();

    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true
    });
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
  });

  it('should navigate to home when home button is clicked', async () => {
    const user = userEvent.setup();
    const originalLocation = window.location;

    // Mock window.location.href
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' };

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByText('Go to Home');
    await user.click(homeButton);

    expect(window.location.href).toBe('/');

    // Restore original location
    window.location = originalLocation;
  });

  it('should reset error boundary when try again is clicked', async () => {
    const user = userEvent.setup();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify error state
    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

    // Click try again - this should reset the error boundary state
    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    // The error boundary should be reset, but we need to verify the reset worked
    // by checking that the error UI is no longer visible after the click
    await waitFor(() => {
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });
  });
});
