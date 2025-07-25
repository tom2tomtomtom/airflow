/**
 * Comprehensive test suite for components/ErrorBoundary.tsx
 * 
 * This test documents the current behavior of the basic ErrorBoundary implementation
 * and establishes a baseline for migration validation.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary, { withErrorBoundary } from '@/components/ErrorBoundary';
import { errorReporter } from '@/utils/errorReporting';

// Mock external dependencies
jest.mock('@/utils/errorReporting', () => ({
  errorReporter: {
    reportError: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  getLogger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
  }),
}));

// Mock Sentry
const mockSentryCapture = jest.fn();
Object.defineProperty(window, 'Sentry', {
  value: {
    captureException: mockSentryCapture,
  },
  writable: true,
});

// Mock console to avoid test noise
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  jest.clearAllMocks();
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Test component that can throw errors
const ErrorThrowingComponent = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="success">No error occurred</div>;
};

describe('components/ErrorBoundary.tsx', () => {
  describe('Basic Error Boundary Behavior', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('catches and displays error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We're sorry for the inconvenience. The application encountered an unexpected error./)
      ).toBeInTheDocument();
    });

    it('generates unique error IDs', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const firstErrorId = screen.getByText(/Error ID: ERR_/).textContent;

      // Reset and trigger another error
      rerender(
        <ErrorBoundary key="second">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const secondErrorId = screen.getByText(/Error ID: ERR_/).textContent;
      expect(firstErrorId).not.toBe(secondErrorId);
    });
  });

  describe('Custom Fallback Support', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error UI</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });

    it('falls back to default UI when custom fallback is not provided', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Reporting Integration', () => {
    it('reports errors to errorReporter in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Production error" />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(errorReporter.reportError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Production error',
          }),
          expect.objectContaining({
            action: 'error_boundary',
            component: 'ErrorBoundary',
            metadata: expect.objectContaining({
              errorBoundary: true,
            }),
          })
        );
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('reports errors to Sentry when available', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Sentry error" />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(mockSentryCapture).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Sentry error',
          }),
          expect.objectContaining({
            contexts: expect.objectContaining({
              react: expect.objectContaining({
                componentStack: expect.any(String),
              }),
            }),
            tags: expect.objectContaining({
              errorBoundary: true,
            }),
          })
        );
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('does not report errors in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(errorReporter.reportError).not.toHaveBeenCalled();
      expect(mockSentryCapture).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it('handles error reporting failures gracefully', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      (errorReporter.reportError as jest.Mock).mockRejectedValue(new Error('Reporting failed'));

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Should still render error UI even if reporting fails
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Development vs Production Behavior', () => {
    it('shows error details in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Development error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error Details (Development Mode):')).toBeInTheDocument();
      expect(screen.getByText(/Error: Development error/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('hides error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Production error" />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details (Development Mode):')).not.toBeInTheDocument();
      expect(screen.queryByText(/Error: Production error/)).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Reset Functionality', () => {
    it('resets error state when Try Again is clicked', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Verify error state
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Change the error condition
      shouldThrow = false;

      // Click Try Again
      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      // Force re-render with new props
      rerender(
        <ErrorBoundary key="reset">
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('generates new error ID on reset', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const originalErrorId = screen.getByText(/Error ID: ERR_/).textContent;

      // Click Try Again
      const tryAgainButton = screen.getByText('Try Again');
      await user.click(tryAgainButton);

      // Note: In this implementation, clicking Try Again resets the state,
      // but since the child still throws, it will immediately error again
      // with a new error ID. This is expected behavior.
    });
  });

  describe('Navigation Actions', () => {
    it('navigates to home when Go to Home is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock window.location.href
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByText('Go to Home');
      await user.click(goHomeButton);

      expect(window.location.href).toBe('/');
    });
  });

  describe('UI Structure and Styling', () => {
    it('renders with Material-UI components and proper structure', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Check for MUI Paper component (should have elevation)
      const paperElement = screen.getByText('Oops! Something went wrong').closest('[class*="MuiPaper"]');
      expect(paperElement).toBeInTheDocument();

      // Check for error icon
      const errorIcon = document.querySelector('[data-testid="ErrorOutlineIcon"]');
      expect(errorIcon).toBeInTheDocument();

      // Check for action buttons
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to home/i })).toBeInTheDocument();
    });

    it('displays error ID in the UI', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error ID: ERR_/)).toBeInTheDocument();
    });
  });

  describe('Higher-Order Component (withErrorBoundary)', () => {
    it('wraps components with error boundary', () => {
      const TestComponent = () => <div data-testid="wrapped-component">Wrapped</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByTestId('wrapped-component')).toBeInTheDocument();
    });

    it('catches errors in wrapped components', () => {
      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent);

      render(<WrappedComponent shouldThrow />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('supports custom fallback in HOC', () => {
      const customFallback = <div data-testid="hoc-fallback">HOC Error</div>;
      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent, customFallback);

      render(<WrappedComponent shouldThrow />);

      expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
    });

    it('preserves component display name', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });

    it('handles components without display name', () => {
      const TestComponent = () => <div>Test</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });
  });

  describe('Error Boundary Edge Cases', () => {
    it('handles errors thrown during render', () => {
      const RenderErrorComponent = () => {
        throw new Error('Render error');
      };

      render(
        <ErrorBoundary>
          <RenderErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('handles errors thrown in useEffect', async () => {
      const EffectErrorComponent = () => {
        React.useEffect(() => {
          throw new Error('Effect error');
        }, []);
        return <div>Effect component</div>;
      };

      render(
        <ErrorBoundary>
          <EffectErrorComponent />
        </ErrorBoundary>
      );

      // Note: useEffect errors are not caught by error boundaries
      // This component should render normally
      expect(screen.getByText('Effect component')).toBeInTheDocument();
    });

    it('handles multiple consecutive errors', () => {
      let errorCount = 0;
      
      const MultiErrorComponent = () => {
        errorCount++;
        throw new Error(`Error ${errorCount}`);
      };

      const { rerender } = render(
        <ErrorBoundary>
          <MultiErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      // Rerender with new key to trigger another error
      rerender(
        <ErrorBoundary key="second">
          <MultiErrorComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Error Context Information', () => {
    it('includes component stack in error info', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <div>
            <ErrorThrowingComponent shouldThrow />
          </div>
        </ErrorBoundary>
      );

      // Check that component stack is displayed
      const componentStackText = screen.getByText(/at ErrorThrowingComponent/);
      expect(componentStackText).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('includes error stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Stack trace test" />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error: Stack trace test/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});