/**
 * Comprehensive test suite for components/error/ErrorBoundary.tsx
 * 
 * This test documents the behavior of the feature-focused ErrorBoundary implementation
 * including the FeatureErrorBoundary and useErrorHandler hook.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary, withErrorBoundary, useErrorHandler, FeatureErrorBoundary } from '@/components/error/ErrorBoundary';

// Mock console to avoid test noise
const originalError = console.error;

beforeEach(() => {
  console.error = jest.fn();
  jest.clearAllMocks();
  
  // Mock fetch for error reporting
  global.fetch = jest.fn();
});

afterEach(() => {
  console.error = originalError;
  jest.restoreAllMocks();
});

// Test component that can throw errors
const ErrorThrowingComponent = ({ shouldThrow = false, message = 'Test error' }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="success">No error occurred</div>;
};

describe('components/error/ErrorBoundary.tsx', () => {
  describe('Basic ErrorBoundary Behavior', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('catches and displays error with default fallback', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We're sorry for the inconvenience. An unexpected error occurred/)
      ).toBeInTheDocument();
    });

    it('generates unique error IDs with err_ prefix', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const firstErrorId = screen.getByText(/err_/).textContent;

      rerender(
        <ErrorBoundary key="second">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const secondErrorId = screen.getByText(/err_/).textContent;
      expect(firstErrorId).not.toBe(secondErrorId);
      expect(firstErrorId).toMatch(/err_[a-z0-9]+_[a-z0-9]+/);
    });
  });

  describe('Custom Fallback Component Support', () => {
    it('renders custom fallback component when provided', () => {
      const CustomFallback = ({ error, resetError, eventId }) => (
        <div data-testid="custom-fallback">
          <p>Custom error: {error.message}</p>
          <p>Event ID: {eventId}</p>
          <button onClick={resetError}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ErrorThrowingComponent shouldThrow message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error: Custom error message')).toBeInTheDocument();
      expect(screen.getByText(/Event ID: err_/)).toBeInTheDocument();
      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
    });

    it('passes all required props to custom fallback', () => {
      const CustomFallback = ({ error, errorInfo, resetError, eventId }) => {
        expect(error).toBeInstanceOf(Error);
        expect(errorInfo).toBeDefined();
        expect(errorInfo.componentStack).toBeDefined();
        expect(typeof resetError).toBe('function');
        expect(eventId).toMatch(/err_/);
        return <div data-testid="props-verified">Props verified</div>;
      };

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('props-verified')).toBeInTheDocument();
    });
  });

  describe('Default Fallback UI Components', () => {
    it('displays all navigation buttons', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /report this error/i })).toBeInTheDocument();
    });

    it('shows error ID in alert when available', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
      expect(screen.getByText(/err_[a-z0-9]+_[a-z0-9]+/)).toBeInTheDocument();
    });

    it('displays BugReportOutlined icon', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const bugIcon = document.querySelector('[data-testid="BugReportOutlinedIcon"]');
      expect(bugIcon).toBeInTheDocument();
    });

    it('shows development error details when in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Development error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Development Error Details')).toBeInTheDocument();
      expect(screen.getByText(/Error: Development error/)).toBeInTheDocument();
      expect(screen.getByText('Component Stack:')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('hides development error details in production mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Development Error Details')).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Navigation Button Behaviors', () => {
    it('calls resetError when Try Again is clicked', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      shouldThrow = false;
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      rerender(
        <ErrorBoundary key="reset">
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('reloads page when Reload Page is clicked', async () => {
      const user = userEvent.setup();
      const mockReload = jest.fn();
      
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const reloadButton = screen.getByRole('button', { name: /reload page/i });
      await user.click(reloadButton);

      expect(mockReload).toHaveBeenCalledTimes(1);
    });

    it('navigates to dashboard when Go Home is clicked', async () => {
      const user = userEvent.setup();
      
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      await user.click(goHomeButton);

      expect(window.location.href).toBe('/dashboard');
    });

    it('opens email client when Report This Error is clicked in production', async () => {
      const user = userEvent.setup();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const mockOpen = jest.fn();
      window.open = mockOpen;

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report this error/i });
      await user.click(reportButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('mailto:support@airwave.com')
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('logs error details when Report This Error is clicked in development', async () => {
      const user = userEvent.setup();
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report this error/i });
      await user.click(reportButton);

      expect(console.error).toHaveBeenCalledWith(
        'Error details:',
        expect.objectContaining({
          error: expect.any(Error),
          errorInfo: expect.any(Object),
          eventId: expect.stringMatching(/err_/),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Reporting Integration', () => {
    it('calls custom onError callback when provided', () => {
      const mockOnError = jest.fn();

      render(
        <ErrorBoundary onError={mockOnError}>
          <ErrorThrowingComponent shouldThrow message="Callback test" />
        </ErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Callback test' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('makes API call to error reporting endpoint in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="API reporting test" />
        </ErrorBoundary>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"message":"API reporting test"'),
        });
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('handles API reporting failures gracefully', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Should still render error UI even if reporting fails
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('includes all required fields in error report', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Complete report test" />
        </ErrorBoundary>
      );

      await waitFor(() => {
        const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
        const requestBody = JSON.parse(fetchCall[1].body);

        expect(requestBody).toMatchObject({
          eventId: expect.stringMatching(/err_/),
          error: {
            name: 'Error',
            message: 'Complete report test',
            stack: expect.any(String),
          },
          errorInfo: expect.any(Object),
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String),
        });
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Isolation Support', () => {
    it('supports isolate prop for error containment', () => {
      render(
        <ErrorBoundary isolate>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });
  });

  describe('Higher-Order Component (withErrorBoundary)', () => {
    it('wraps components with error boundary', () => {
      const TestComponent = () => <div data-testid="wrapped">Wrapped component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByTestId('wrapped')).toBeInTheDocument();
    });

    it('passes errorBoundaryProps to the boundary', () => {
      const mockOnError = jest.fn();
      const TestComponent = () => <ErrorThrowingComponent shouldThrow />;
      const WrappedComponent = withErrorBoundary(TestComponent, { onError: mockOnError });

      render(<WrappedComponent />);

      expect(mockOnError).toHaveBeenCalled();
    });

    it('preserves component display name', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });
  });

  describe('useErrorHandler Hook', () => {
    it('provides error handler function that throws errors', () => {
      const TestComponent = () => {
        const handleError = useErrorHandler();
        
        React.useEffect(() => {
          try {
            handleError(new Error('Hook error'));
          } catch (error) {
            expect(error.message).toBe('Hook error');
          }
        }, [handleError]);

        return <div data-testid="hook-test">Hook test</div>;
      };

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('hook-test')).toBeInTheDocument();
    });
  });

  describe('FeatureErrorBoundary Component', () => {
    it('renders children when no error occurs', () => {
      render(
        <FeatureErrorBoundary feature="test-feature">
          <ErrorThrowingComponent />
        </FeatureErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('displays feature-specific error message', () => {
      render(
        <FeatureErrorBoundary feature="video-processing">
          <ErrorThrowingComponent shouldThrow message="Feature error" />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('video-processing is temporarily unavailable')).toBeInTheDocument();
      expect(screen.getByText('Feature error')).toBeInTheDocument();
    });

    it('provides retry button in feature error boundary', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <FeatureErrorBoundary feature="test-feature">
          <TestComponent />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('test-feature is temporarily unavailable')).toBeInTheDocument();

      shouldThrow = false;
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      rerender(
        <FeatureErrorBoundary feature="test-feature" key="retry">
          <TestComponent />
        </FeatureErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('reports feature-specific errors to API', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      render(
        <FeatureErrorBoundary feature="analytics-dashboard">
          <ErrorThrowingComponent shouldThrow message="Analytics error" />
        </FeatureErrorBoundary>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"feature":"analytics-dashboard"'),
        });
      });
    });

    it('handles feature error reporting failures gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Feature API error'));

      render(
        <FeatureErrorBoundary feature="failing-feature">
          <ErrorThrowingComponent shouldThrow />
        </FeatureErrorBoundary>
      );

      // Should still render feature error UI
      expect(screen.getByText('failing-feature is temporarily unavailable')).toBeInTheDocument();
    });

    it('provides generic error message when error message is undefined', () => {
      const ErrorWithoutMessage = () => {
        const error = new Error();
        error.message = '';
        throw error;
      };

      render(
        <FeatureErrorBoundary feature="test-feature">
          <ErrorWithoutMessage />
        </FeatureErrorBoundary>
      );

      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Edge Cases', () => {
    it('handles errors during rendering', () => {
      const RenderError = () => {
        throw new Error('Render time error');
      };

      render(
        <ErrorBoundary>
          <RenderError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('generates consistent error ID format', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const errorIdText = screen.getByText(/err_/).textContent;
      expect(errorIdText).toMatch(/err_[a-z0-9]+_[a-z0-9]{6}/);
    });

    it('handles multiple nested error boundaries', () => {
      render(
        <ErrorBoundary>
          <div>Outer boundary</div>
          <FeatureErrorBoundary feature="nested-feature">
            <ErrorThrowingComponent shouldThrow message="Nested error" />
          </FeatureErrorBoundary>
        </ErrorBoundary>
      );

      // Inner FeatureErrorBoundary should catch the error
      expect(screen.getByText('nested-feature is temporarily unavailable')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });
  });
});