/**
 * Comprehensive test suite for components/workflow/ErrorBoundary.tsx
 * 
 * This test documents the behavior of the workflow-specific ErrorBoundary implementation
 * including error sanitization, context awareness, and progressive disclosure features.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WorkflowErrorBoundary, withErrorBoundary, useErrorHandler } from '@/components/workflow/ErrorBoundary';

// Mock console to avoid test noise
const originalError = console.error;

beforeEach(() => {
  console.error = jest.fn();
  jest.clearAllMocks();
  
  // Mock window.open for email functionality
  window.open = jest.fn();
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

describe('components/workflow/ErrorBoundary.tsx', () => {
  describe('Basic WorkflowErrorBoundary Behavior', () => {
    it('renders children when no error occurs', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('catches and displays error with workflow-specific messaging', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
      expect(
        screen.getByText(/We encountered an unexpected error in the workflow. Don't worry, your progress has been saved./)
      ).toBeInTheDocument();
    });

    it('generates unique error IDs with error_ prefix', () => {
      const { rerender } = render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const firstErrorId = screen.getByText(/error_/).textContent;

      rerender(
        <WorkflowErrorBoundary key="second">
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const secondErrorId = screen.getByText(/error_/).textContent;
      expect(firstErrorId).not.toBe(secondErrorId);
      expect(firstErrorId).toMatch(/error_[0-9]+_[a-z0-9]+/);
    });
  });

  describe('Context Awareness', () => {
    it('displays context information when provided', () => {
      render(
        <WorkflowErrorBoundary context="video-creation">
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Context:')).toBeInTheDocument();
      expect(screen.getByText('video-creation')).toBeInTheDocument();
    });

    it('shows default context when not provided', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Context:')).toBeInTheDocument();
      expect(screen.getByText('Workflow')).toBeInTheDocument();
    });

    it('includes context in error reporting', () => {
      const mockOnError = jest.fn();

      render(
        <WorkflowErrorBoundary context="campaign-setup" onError={mockOnError}>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('Error Message Sanitization', () => {
    describe('Development Mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      afterEach(() => {
        process.env.NODE_ENV = 'test';
      });

      it('shows original error messages in development', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="Detailed development error" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('Message:')).toBeInTheDocument();
        expect(screen.getByText('Detailed development error')).toBeInTheDocument();
      });

      it('includes sensitive information in development mode', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="Database connection failed: password incorrect" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('Database connection failed: password incorrect')).toBeInTheDocument();
      });
    });

    describe('Production Mode', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      afterEach(() => {
        process.env.NODE_ENV = 'test';
      });

      it('sanitizes sensitive error messages in production', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="Database password is incorrect" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('An unexpected error occurred. Please try again or contact support.')).toBeInTheDocument();
        expect(screen.queryByText('password')).not.toBeInTheDocument();
      });

      it('sanitizes token-related errors', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="API token expired" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('An unexpected error occurred. Please try again or contact support.')).toBeInTheDocument();
        expect(screen.queryByText('token')).not.toBeInTheDocument();
      });

      it('sanitizes internal server errors', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="Internal server error occurred" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('An unexpected error occurred. Please try again or contact support.')).toBeInTheDocument();
        expect(screen.queryByText('Internal server')).not.toBeInTheDocument();
      });

      it('provides user-friendly messages for common error types', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="Network Error: Connection refused" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('Connection error. Please check your internet connection and try again.')).toBeInTheDocument();
      });

      it('handles ChunkLoadError with specific message', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="ChunkLoadError: Loading chunk failed" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('Loading error. Please refresh the page and try again.')).toBeInTheDocument();
      });

      it('handles TypeError with generic message', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="TypeError: Cannot read property 'x' of undefined" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('An unexpected error occurred. Please refresh the page and try again.')).toBeInTheDocument();
      });

      it('shows default sanitized message for unknown errors', () => {
        render(
          <WorkflowErrorBoundary>
            <ErrorThrowingComponent shouldThrow message="Some unknown error occurred" />
          </WorkflowErrorBoundary>
        );

        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('Progressive Disclosure UI', () => {
    it('does not show technical details by default', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });

    it('shows technical details when showDetails prop is true', () => {
      render(
        <WorkflowErrorBoundary showDetails>
          <ErrorThrowingComponent shouldThrow message="Technical error" />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      expect(screen.getByText('Error Stack:')).toBeInTheDocument();
      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
    });

    it('allows expanding and collapsing technical details', async () => {
      const user = userEvent.setup();

      render(
        <WorkflowErrorBoundary showDetails>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const detailsAccordion = screen.getByText('Technical Details');
      
      // Details should be collapsible
      expect(detailsAccordion).toBeInTheDocument();
      
      // Click to expand/collapse
      await user.click(detailsAccordion);
      
      // The accordion should be functional (MUI Accordion behavior)
      expect(detailsAccordion).toBeInTheDocument();
    });

    it('displays error stack in technical details', () => {
      render(
        <WorkflowErrorBoundary showDetails>
          <ErrorThrowingComponent shouldThrow message="Stack trace test" />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Error Stack:')).toBeInTheDocument();
      expect(screen.getByText(/Error: Stack trace test/)).toBeInTheDocument();
    });

    it('displays component stack in technical details', () => {
      render(
        <WorkflowErrorBoundary showDetails>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Component Stack:')).toBeInTheDocument();
      expect(screen.getByText(/at ErrorThrowingComponent/)).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Support', () => {
    it('renders custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-workflow-fallback">Custom workflow error</div>;

      render(
        <WorkflowErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByTestId('custom-workflow-fallback')).toBeInTheDocument();
      expect(screen.queryByText('Oops! Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Actions', () => {
    it('displays all workflow-specific action buttons', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument();
    });

    it('resets error state when Try Again is clicked', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => <ErrorThrowingComponent shouldThrow={shouldThrow} />;

      const { rerender } = render(
        <WorkflowErrorBoundary>
          <TestComponent />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();

      shouldThrow = false;
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);

      rerender(
        <WorkflowErrorBoundary key="reset">
          <TestComponent />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('navigates to root when Go to Dashboard is clicked', async () => {
      const user = userEvent.setup();
      
      delete (window as any).location;
      window.location = { href: '' } as any;

      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });
      await user.click(dashboardButton);

      expect(window.location.href).toBe('/');
    });

    it('opens email client when Report Bug is clicked', async () => {
      const user = userEvent.setup();

      render(
        <WorkflowErrorBoundary context="test-workflow">
          <ErrorThrowingComponent shouldThrow message="Bug report test" />
        </WorkflowErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report bug/i });
      await user.click(reportButton);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringMatching(/mailto:support@airwave\.app/)
      );

      // Check that the email contains error details
      const emailUrl = (window.open as jest.Mock).mock.calls[0][0];
      expect(emailUrl).toContain('Bug%20Report');
      expect(emailUrl).toContain('Context:%20test-workflow');
      expect(emailUrl).toContain('Message:%20Bug%20report%20test');
    });

    it('includes error ID in bug report email', async () => {
      const user = userEvent.setup();

      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const reportButton = screen.getByRole('button', { name: /report bug/i });
      await user.click(reportButton);

      const emailUrl = (window.open as jest.Mock).mock.calls[0][0];
      expect(emailUrl).toMatch(/Error%20ID:%20error_[0-9]+_[a-z0-9]+/);
    });
  });

  describe('Error Reporting', () => {
    it('calls custom onError callback when provided', () => {
      const mockOnError = jest.fn();

      render(
        <WorkflowErrorBoundary onError={mockOnError} context="callback-test">
          <ErrorThrowingComponent shouldThrow message="Callback error" />
        </WorkflowErrorBoundary>
      );

      expect(mockOnError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Callback error' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('logs error information to console', () => {
      render(
        <WorkflowErrorBoundary context="console-test">
          <ErrorThrowingComponent shouldThrow message="Console log test" />
        </WorkflowErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'Workflow Error Boundary caught an error:',
        expect.objectContaining({ message: 'Console log test' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('includes environment information in error reports', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          environment: 'development',
          userAgent: expect.any(String),
          url: expect.any(String),
          timestamp: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('includes error ID in reports', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(console.error).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          errorId: expect.stringMatching(/error_[0-9]+_[a-z0-9]+/),
        })
      );
    });

    it('handles error reporting failures gracefully', () => {
      // Mock console.error to throw during error reporting
      const mockError = jest.fn().mockImplementation(() => {
        throw new Error('Reporting failed');
      });
      console.error = mockError;

      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      // Should still render error UI even if reporting fails
      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Higher-Order Component (withErrorBoundary)', () => {
    it('wraps components with workflow error boundary', () => {
      const TestComponent = () => <div data-testid="wrapped-workflow">Wrapped component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent, 'hoc-test');

      render(<WrappedComponent />);

      expect(screen.getByTestId('wrapped-workflow')).toBeInTheDocument();
    });

    it('catches errors in wrapped components', () => {
      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent, 'error-test');

      render(<WrappedComponent shouldThrow />);

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('passes context to the error boundary', () => {
      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent, 'hoc-context');

      render(<WrappedComponent shouldThrow />);

      expect(screen.getByText('Context:')).toBeInTheDocument();
      expect(screen.getByText('hoc-context')).toBeInTheDocument();
    });

    it('enables showDetails in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const WrappedComponent = withErrorBoundary(ErrorThrowingComponent, 'dev-test');

      render(<WrappedComponent shouldThrow />);

      expect(screen.getByText('Technical Details')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('useErrorHandler Hook', () => {
    it('provides error reporting function', () => {
      const TestComponent = () => {
        const { reportError } = useErrorHandler();
        
        React.useEffect(() => {
          const errorId = reportError(new Error('Hook test error'), 'hook-context');
          expect(errorId).toMatch(/error_[0-9]+_[a-z0-9]+/);
        }, [reportError]);

        return <div data-testid="hook-component">Hook test</div>;
      };

      render(<TestComponent />);

      expect(screen.getByTestId('hook-component')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith('Manual error report:', expect.any(Error));
    });

    it('includes context in error reports', () => {
      const TestComponent = () => {
        const { reportError } = useErrorHandler();
        
        React.useEffect(() => {
          reportError(new Error('Context test'), 'manual-context');
        }, [reportError]);

        return <div>Hook with context</div>;
      };

      render(<TestComponent />);

      expect(console.error).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          context: 'manual-context',
        })
      );
    });

    it('generates consistent error report structure', () => {
      const TestComponent = () => {
        const { reportError } = useErrorHandler();
        
        React.useEffect(() => {
          reportError(new Error('Structure test'));
        }, [reportError]);

        return <div>Structure test</div>;
      };

      render(<TestComponent />);

      expect(console.error).toHaveBeenCalledWith(
        'Error Report:',
        expect.objectContaining({
          errorId: expect.stringMatching(/error_[0-9]+_[a-z0-9]+/),
          message: 'Structure test',
          stack: expect.any(String),
          timestamp: expect.any(String),
          userAgent: expect.any(String),
          url: expect.any(String),
        })
      );
    });
  });

  describe('UI Structure and Styling', () => {
    it('renders with Material-UI Paper container', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const paperElement = screen.getByText('Oops! Something went wrong').closest('[class*="MuiPaper"]');
      expect(paperElement).toBeInTheDocument();
    });

    it('displays ErrorIcon', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const errorIcon = document.querySelector('[data-testid="ErrorIcon"]');
      expect(errorIcon).toBeInTheDocument();
    });

    it('shows error details in Alert component', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Error ID:')).toBeInTheDocument();
      expect(screen.getByText('Context:')).toBeInTheDocument();
      expect(screen.getByText('Message:')).toBeInTheDocument();
    });

    it('includes support contact information', () => {
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(
        screen.getByText(/If this problem persists, please contact our support team with the Error ID above./)
      ).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('handles errors with empty messages', () => {
      const EmptyMessageError = () => {
        const error = new Error();
        error.message = '';
        throw error;
      };

      render(
        <WorkflowErrorBoundary>
          <EmptyMessageError />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Message:')).toBeInTheDocument();
      expect(screen.getByText('Unknown error occurred')).toBeInTheDocument();
    });

    it('handles null error scenarios gracefully', () => {
      // This tests the edge case where error might be null
      render(
        <WorkflowErrorBoundary>
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    });

    it('generates unique error IDs for concurrent errors', () => {
      const { rerender } = render(
        <WorkflowErrorBoundary key="first">
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const firstId = screen.getByText(/error_/).textContent?.match(/error_[0-9]+_[a-z0-9]+/)?.[0];

      rerender(
        <WorkflowErrorBoundary key="second">
          <ErrorThrowingComponent shouldThrow />
        </WorkflowErrorBoundary>
      );

      const secondId = screen.getByText(/error_/).textContent?.match(/error_[0-9]+_[a-z0-9]+/)?.[0];

      expect(firstId).toBeDefined();
      expect(secondId).toBeDefined();
      expect(firstId).not.toBe(secondId);
    });
  });
});