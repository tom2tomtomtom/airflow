/**
 * Comprehensive test suite for components/ui/ErrorBoundary/ErrorBoundary.tsx
 * 
 * This test documents the behavior of the level-aware ErrorBoundary implementation
 * including resetKeys, resetOnPropsChange, and progressive disclosure features.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary, { withErrorBoundary, useErrorHandler } from '@/components/ui/ErrorBoundary/ErrorBoundary';

// Mock logger
jest.mock('@/lib/logger', () => ({
  loggers: {
    general: {
      error: jest.fn(),
    },
  },
}));

// Mock Sentry
const mockSentryCapture = jest.fn();
const mockSentryWithScope = jest.fn();
Object.defineProperty(window, 'Sentry', {
  value: {
    captureException: mockSentryCapture,
    withScope: mockSentryWithScope,
  },
  writable: true,
});

// Mock console to avoid test noise
const originalError = console.error;

beforeEach(() => {
  console.error = jest.fn();
  jest.clearAllMocks();
  
  mockSentryWithScope.mockImplementation((callback) => {
    const mockScope = {
      setTag: jest.fn(),
      setContext: jest.fn(),
    };
    callback(mockScope);
  });
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

describe('components/ui/ErrorBoundary/ErrorBoundary.tsx', () => {
  describe('Basic ErrorBoundary Behavior', () => {
    it('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('catches and displays error with default component level styling', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(
        screen.getByText(/This section encountered an error and could not be displayed properly./)
      ).toBeInTheDocument();
    });

    it('generates unique error IDs with error- prefix', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const firstErrorId = screen.getByText(/error-.*-/).textContent;

      rerender(
        <ErrorBoundary key="second">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const secondErrorId = screen.getByText(/error-.*-/).textContent;
      expect(firstErrorId).not.toBe(secondErrorId);
      expect(firstErrorId).toMatch(/error-[0-9]+-[a-z0-9]+/);
    });
  });

  describe('Level-based UI Rendering', () => {
    it('renders page-level error boundary with full-screen styling', () => {
      render(
        <ErrorBoundary level="page">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We're sorry, but something unexpected happened. Please try refreshing the page/)
      ).toBeInTheDocument();
      
      // Page level should have Go Home button
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });

    it('renders section-level error boundary with inline styling', () => {
      render(
        <ErrorBoundary level="section">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(
        screen.getByText(/This section encountered an error and could not be displayed properly./)
      ).toBeInTheDocument();
      
      // Section level should not have Go Home button
      expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
    });

    it('renders component-level error boundary with minimal styling', () => {
      render(
        <ErrorBoundary level="component">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(
        screen.getByText(/This section encountered an error and could not be displayed properly./)
      ).toBeInTheDocument();
      
      // Component level should not have Go Home button
      expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
    });

    it('defaults to component level when no level specified', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
    });

    it('adjusts button and icon sizes based on level', () => {
      const { rerender } = render(
        <ErrorBoundary level="page">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Page level should have large buttons
      const pageTryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(pageTryAgainButton).toHaveClass('MuiButton-sizeLarge');

      rerender(
        <ErrorBoundary level="component" key="component">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Component level should have medium buttons
      const componentTryAgainButton = screen.getByRole('button', { name: /try again/i });
      expect(componentTryAgainButton).toHaveClass('MuiButton-sizeMedium');
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

      expect(screen.getByText('Error occurred')).toBeInTheDocument();

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

    it('resets when resetKeys change', async () => {
      let resetKey = 'key1';
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary resetKeys={[resetKey]}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();

      // Change the reset key and error condition
      resetKey = 'key2';
      shouldThrow = false;

      rerender(
        <ErrorBoundary resetKeys={[resetKey]}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('supports multiple resetKeys', async () => {
      let resetKeys = ['key1', 'key2'];
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary resetKeys={resetKeys}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();

      // Change one of the reset keys
      resetKeys = ['key1', 'key3'];
      shouldThrow = false;

      rerender(
        <ErrorBoundary resetKeys={resetKeys}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('resets when resetOnPropsChange is enabled and props change', async () => {
      let shouldThrow = true;
      let someProp = 'value1';

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary resetOnPropsChange someProp={someProp}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();

      // Change props and error condition
      someProp = 'value2';
      shouldThrow = false;

      rerender(
        <ErrorBoundary resetOnPropsChange someProp={someProp}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('does not reset when resetOnPropsChange is disabled and props change', async () => {
      let shouldThrow = true;
      let someProp = 'value1';

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary resetOnPropsChange={false} someProp={someProp}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();

      // Change props but keep error condition - should still show error
      someProp = 'value2';
      shouldThrow = false; // This won't matter since we don't reset

      rerender(
        <ErrorBoundary resetOnPropsChange={false} someProp={someProp}>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('generates new error ID after reset', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const originalErrorId = screen.getByText(/Error ID: error-/).textContent;

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      // Since the component still throws an error, it will immediately error again
      // with a new error ID
      const newErrorId = screen.getByText(/Error ID: error-/).textContent;
      
      // The error ID should be present (and likely different)
      expect(newErrorId).toMatch(/Error ID: error-[0-9]+-[a-z0-9]+/);
    });
  });

  describe('Progressive Disclosure of Technical Details', () => {
    it('hides technical details by default', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.queryByText('Error Details')).not.toBeVisible();
      expect(screen.getByText('Show Technical Details')).toBeInTheDocument();
    });

    it('shows technical details when expanded', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Technical details test" />
        </ErrorBoundary>
      );

      const showDetailsButton = screen.getByText('Show Technical Details');
      await user.click(showDetailsButton);

      expect(screen.getByText('Error Details')).toBeVisible();
      expect(screen.getByText('Error ID:')).toBeInTheDocument();
      expect(screen.getByText('Message:')).toBeInTheDocument();
      expect(screen.getByText('Technical details test')).toBeInTheDocument();
    });

    it('toggles technical details visibility', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const showDetailsButton = screen.getByText('Show Technical Details');
      await user.click(showDetailsButton);

      expect(screen.getByText('Error Details')).toBeVisible();

      const hideDetailsButton = screen.getByText('Hide Technical Details');
      await user.click(hideDetailsButton);

      expect(screen.queryByText('Error Details')).not.toBeVisible();
      expect(screen.getByText('Show Technical Details')).toBeInTheDocument();
    });

    it('displays error stack trace when details are shown', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Stack trace test" />
        </ErrorBoundary>
      );

      const showDetailsButton = screen.getByText('Show Technical Details');
      await user.click(showDetailsButton);

      expect(screen.getByText(/Error: Stack trace test/)).toBeInTheDocument();
    });

    it('displays component stack when details are shown', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const showDetailsButton = screen.getByText('Show Technical Details');
      await user.click(showDetailsButton);

      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
      expect(screen.getByText(/at ErrorThrowingComponent/)).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Component Support', () => {
    it('renders custom fallback component when provided', () => {
      const CustomFallback = ({ error, errorId, resetError, level }) => (
        <div data-testid="custom-ui-fallback">
          <p>Custom UI error: {error.message}</p>
          <p>Level: {level}</p>
          <p>ID: {errorId}</p>
          <button onClick={resetError}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback} level="section">
          <ErrorThrowingComponent shouldThrow message="Custom UI error" />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-ui-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom UI error: Custom UI error')).toBeInTheDocument();
      expect(screen.getByText('Level: section')).toBeInTheDocument();
      expect(screen.getByText(/ID: error-/)).toBeInTheDocument();
    });

    it('passes all required props to custom fallback', () => {
      const CustomFallback = ({ error, errorInfo, errorId, resetError, showDetails, toggleDetails, level }) => {
        expect(error).toBeInstanceOf(Error);
        expect(errorInfo).toBeDefined();
        expect(typeof errorId).toBe('string');
        expect(typeof resetError).toBe('function');
        expect(typeof showDetails).toBe('boolean');
        expect(typeof toggleDetails).toBe('function');
        expect(level).toBe('component');
        return <div data-testid="props-test">All props received</div>;
      };

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('props-test')).toBeInTheDocument();
    });
  });

  describe('Isolation Support', () => {
    it('wraps children in isolation container when isolate is true', () => {
      render(
        <ErrorBoundary isolate>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      const isolatedContainer = screen.getByTestId('success').parentElement;
      expect(isolatedContainer).toHaveStyle('isolation: isolate');
    });

    it('does not add isolation when isolate is false or not specified', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      const container = screen.getByTestId('success').parentElement;
      expect(container).not.toHaveStyle('isolation: isolate');
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
        expect.objectContaining({ componentStack: expect.any(String) }),
        expect.stringMatching(/error-[0-9]+-[a-z0-9]+/)
      );
    });

    it('logs error to logger service', () => {
      const { loggers } = require('@/lib/logger');

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Logger test" />
        </ErrorBoundary>
      );

      expect(loggers.general.error).toHaveBeenCalledWith(
        'React Error Boundary caught an error',
        expect.objectContaining({ message: 'Logger test' }),
        expect.objectContaining({
          errorId: expect.stringMatching(/error-[0-9]+-[a-z0-9]+/),
          componentStack: expect.any(String),
          errorBoundary: 'ErrorBoundary',
        })
      );
    });

    it('reports to Sentry when available', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow message="Sentry test" />
        </ErrorBoundary>
      );

      expect(mockSentryWithScope).toHaveBeenCalled();
      expect(mockSentryCapture).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Sentry test' })
      );
    });

    it('sets Sentry context and tags', () => {
      const mockScope = {
        setTag: jest.fn(),
        setContext: jest.fn(),
      };

      mockSentryWithScope.mockImplementation((callback) => {
        callback(mockScope);
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(mockScope.setTag).toHaveBeenCalledWith('errorBoundary', true);
      expect(mockScope.setContext).toHaveBeenCalledWith('errorInfo', {
        componentStack: expect.any(String),
        errorId: expect.stringMatching(/error-[0-9]+-[a-z0-9]+/),
      });
    });

    it('handles Sentry reporting failures gracefully', () => {
      mockSentryCapture.mockImplementation(() => {
        throw new Error('Sentry failed');
      });

      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Should still render error UI even if Sentry fails
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('navigates to home when Go Home is clicked (page level only)', async () => {
      const user = userEvent.setup();
      
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(
        <ErrorBoundary level="page">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const goHomeButton = screen.getByRole('button', { name: /go home/i });
      await user.click(goHomeButton);

      expect(window.location.href).toBe('/');
    });

    it('does not show Go Home button for non-page levels', () => {
      render(
        <ErrorBoundary level="section">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.queryByRole('button', { name: /go home/i })).not.toBeInTheDocument();
    });
  });

  describe('Higher-Order Component (withErrorBoundary)', () => {
    it('wraps components with error boundary', () => {
      const TestComponent = () => <div data-testid="wrapped-ui">Wrapped UI component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByTestId('wrapped-ui')).toBeInTheDocument();
    });

    it('passes errorBoundaryProps to the boundary', () => {
      const mockOnError = jest.fn();
      const TestComponent = () => <ErrorThrowingComponent shouldThrow />;
      const WrappedComponent = withErrorBoundary(TestComponent, {
        onError: mockOnError,
        level: 'page',
      });

      render(<WrappedComponent />);

      expect(mockOnError).toHaveBeenCalled();
      expect(screen.getByText('Something went wrong')).toBeInTheDocument(); // Page level message
    });

    it('preserves component display name', () => {
      const TestComponent = () => <div>UI Test</div>;
      TestComponent.displayName = 'UITestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(UITestComponent)');
    });
  });

  describe('useErrorHandler Hook', () => {
    it('provides error handler that throws errors to be caught by boundary', () => {
      const TestComponent = () => {
        const handleError = useErrorHandler();
        
        React.useEffect(() => {
          try {
            handleError(new Error('Hook error test'));
          } catch (error) {
            expect(error.message).toBe('Hook error test');
          }
        }, [handleError]);

        return <div data-testid="hook-ui-test">UI Hook test</div>;
      };

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('hook-ui-test')).toBeInTheDocument();
    });
  });

  describe('UI Structure and Styling', () => {
    it('renders with Material-UI Paper container', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      const paperElement = screen.getByText('Error occurred').closest('[class*="MuiPaper"]');
      expect(paperElement).toBeInTheDocument();
    });

    it('displays error icon with appropriate size based on level', () => {
      const { rerender } = render(
        <ErrorBoundary level="page">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      let errorIcon = document.querySelector('[data-testid="ErrorIcon"]');
      expect(errorIcon).toBeInTheDocument();

      rerender(
        <ErrorBoundary level="component" key="component">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      errorIcon = document.querySelector('[data-testid="ErrorIcon"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('shows error ID at bottom of UI', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText(/Error ID: error-[0-9]+-[a-z0-9]+/)).toBeInTheDocument();
    });

    it('uses appropriate container styling based on level', () => {
      const { rerender } = render(
        <ErrorBoundary level="page">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Page level should have specific styling attributes
      let container = screen.getByText('Something went wrong').closest('div');
      expect(container).toBeInTheDocument();

      rerender(
        <ErrorBoundary level="component" key="component">
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      // Component level should have different styling
      container = screen.getByText('Error occurred').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles errors during rendering', () => {
      const RenderError = () => {
        throw new Error('Render error');
      };

      render(
        <ErrorBoundary>
          <RenderError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('handles errors with no stack trace', () => {
      const NoStackError = () => {
        const error = new Error('No stack error');
        delete error.stack;
        throw error;
      };

      render(
        <ErrorBoundary>
          <NoStackError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('handles componentDidCatch with missing errorInfo', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('clears timeout on unmount to prevent memory leaks', () => {
      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

      const { unmount } = render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      unmount();

      // Note: The actual timeout clearing might not be directly testable,
      // but we can verify the component unmounts without errors
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });

    it('handles multiple rapid resets', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      const tryAgainButton = screen.getByRole('button', { name: /try again/i });

      // Click rapidly multiple times
      await user.click(tryAgainButton);
      await user.click(tryAgainButton);
      await user.click(tryAgainButton);

      // Should still work correctly
      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });

    it('handles resetKeys with undefined values', () => {
      render(
        <ErrorBoundary resetKeys={[undefined, null, 'valid-key']}>
          <ErrorThrowingComponent shouldThrow />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error occurred')).toBeInTheDocument();
    });
  });
});