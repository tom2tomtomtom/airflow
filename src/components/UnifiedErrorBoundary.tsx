import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Collapse,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
// Import Material-UI icons individually to avoid build issues
import { Error, Refresh, ExpandMore, Home, BugReport, Info } from '@mui/icons-material';

// Create aliases for clarity
const ErrorIcon = Error;
const RefreshIcon = Refresh;
const ExpandMoreIcon = ExpandMore;
const HomeIcon = Home;
const BugReportIcon = BugReport;
const InfoIcon = Info;
import { errorReporter } from '@/utils/errorReporting';
import { getLogger } from '@/lib/logger';

const logger = getLogger('components/UnifiedErrorBoundary');

// Error boundary context types
export type ErrorBoundaryContext =
  | 'page'
  | 'section'
  | 'component'
  | 'video-studio'
  | 'workflow'
  | 'ui-component'
  | 'general';

// Error boundary level for different error handling strategies
export type ErrorBoundaryLevel = 'critical' | 'warning' | 'info';

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  context: ErrorBoundaryContext;
  resetError: () => void;
  goHome: () => void;
}

export interface BugReportDetails {
  errorId: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  errorInfo?: {
    componentStack?: string;
  };
  context: ErrorBoundaryContext;
  feature?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  environment: string;
}

export interface UnifiedErrorBoundaryProps {
  children: ReactNode;

  // Customization options
  fallback?: React.ComponentType<ErrorFallbackProps>;
  context?: ErrorBoundaryContext;
  level?: ErrorBoundaryLevel;

  // Event handlers
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    errorId: string,
    context: ErrorBoundaryContext
  ) => void;

  // Reset functionality
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  autoResetTimeout?: number; // Milliseconds

  // UI options
  showDetails?: boolean;
  isolate?: boolean;

  // Bug reporting functionality
  enableBugReporting?: boolean; // default: true if email or callback provided
  bugReportEmail?: string;
  onReportBug?: (errorDetails: BugReportDetails) => void;
  emailTemplate?: (errorDetails: BugReportDetails) => string;

  // Legacy compatibility
  section?: string; // For video-studio compatibility
}

interface UnifiedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
  prevResetKeys: Array<string | number>;
}

/**
 * UnifiedErrorBoundary - Consolidated error boundary component
 *
 * This component consolidates all ErrorBoundary implementations into a single,
 * comprehensive error handling solution. It supports:
 * - Context-aware error handling (page, section, component, video-studio, workflow)
 * - Customizable fallback UI components
 * - Error reporting and logging integration
 * - Reset functionality with key-based and prop-change detection
 * - Progressive disclosure of error details
 * - Isolation mode for component-level errors
 */
export class UnifiedErrorBoundary extends Component<
  UnifiedErrorBoundaryProps,
  UnifiedErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: UnifiedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      showDetails: props.showDetails ?? false,
      prevResetKeys: props.resetKeys ?? [],
    };
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static getDerivedStateFromError(error: Error): Partial<UnifiedErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  static getDerivedStateFromProps(
    props: UnifiedErrorBoundaryProps,
    state: UnifiedErrorBoundaryState
  ): Partial<UnifiedErrorBoundaryState> | null {
    const { resetKeys = [], resetOnPropsChange = false } = props;
    const { prevResetKeys, hasError } = state;

    // Reset error state if resetKeys have changed
    if (hasError && resetKeys.length > 0) {
      const hasResetKeyChanged =
        resetKeys.length !== prevResetKeys.length ||
        resetKeys.some((key, index) => key !== prevResetKeys[index]);

      if (hasResetKeyChanged || resetOnPropsChange) {
        return {
          hasError: false,
          error: null,
          errorInfo: null,
          errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          prevResetKeys: resetKeys,
        };
      }
    }

    return { prevResetKeys: resetKeys };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, context = 'general' } = this.props;
    const errorId = this.state.errorId;

    // Log error with context
    logger.error('Error boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
      errorId,
    });

    // Report error to error reporting service
    errorReporter.reportUIError(error, 'UnifiedErrorBoundary', `${context}-error`);

    // Update state with error info
    this.setState({ errorInfo });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId, context);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  componentDidUpdate() {
    const { autoResetTimeout } = this.props;
    const { hasError } = this.state;

    // Set auto-reset timeout when error occurs
    if (hasError && autoResetTimeout && !this.resetTimeoutId) {
      this.resetTimeoutId = window.setTimeout(() => {
        this.resetError();
      }, autoResetTimeout);
    }
  }

  private resetError = () => {
    // Clear any active timeout
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
      showDetails: false,
    });
  };

  private goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  private toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  private createBugReportDetails(): BugReportDetails {
    const { error, errorInfo, errorId } = this.state;
    const { context = 'general', section } = this.props;

    return {
      errorId,
      error: {
        name: error?.name || 'Unknown',
        message: this.sanitizeErrorMessage(error?.message || 'Unknown error'),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      errorInfo: errorInfo
        ? {
            componentStack:
              process.env.NODE_ENV === 'development' ? errorInfo.componentStack : undefined,
          }
        : undefined,
      context,
      feature: section,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'Server-side',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server-side',
      environment: process.env.NODE_ENV || 'unknown',
    };
  }

  private getDefaultEmailTemplate = (details: BugReportDetails): string => {
    const stackInfo = details.error.stack ? `\nStack: ${details.error.stack}` : '';
    const componentStackInfo = details.errorInfo?.componentStack
      ? `\nComponent Stack: ${details.errorInfo.componentStack}`
      : '';
    const featureInfo = details.feature ? `\nFeature: ${details.feature}` : '';

    return `
Error ID: ${details.errorId}
Context: ${details.context || 'Unknown'}
${featureInfo}
Error: ${details.error.message || 'Unknown error'}${stackInfo}${componentStackInfo}
URL: ${details.url}
Time: ${details.timestamp}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim();
  };

  private handleReportBug = () => {
    try {
      const { onReportBug, bugReportEmail, emailTemplate } = this.props;
      const bugDetails = this.createBugReportDetails();

      // Use custom callback if provided
      if (onReportBug) {
        onReportBug(bugDetails);
        return;
      }

      // Use mailto if email is configured
      if (bugReportEmail) {
        const template = emailTemplate || this.getDefaultEmailTemplate;
        const bugReport = template(bugDetails);
        const subject = encodeURIComponent(`Bug Report - Error ${bugDetails.errorId}`);
        const body = encodeURIComponent(bugReport);
        const mailtoUrl = `mailto:${bugReportEmail}?subject=${subject}&body=${body}`;

        if (typeof window !== 'undefined') {
          window.open(mailtoUrl, '_blank');
        }
      }
    } catch (reportingError) {
      console.error('Failed to report bug:', reportingError);
    }
  };

  private shouldShowBugReporting(): boolean {
    const { enableBugReporting, bugReportEmail, onReportBug } = this.props;

    // If explicitly disabled, don't show
    if (enableBugReporting === false) {
      return false;
    }

    // Only show if there's a way to report bugs (email or callback)
    // AND either explicitly enabled or implicitly enabled by having email/callback
    const hasReportingMethod = Boolean(bugReportEmail || onReportBug);

    if (!hasReportingMethod) {
      return false;
    }

    // If explicitly enabled or implicitly enabled by having reporting method
    return enableBugReporting === true || hasReportingMethod;
  }

  private getContextualMessage(context: ErrorBoundaryContext): string {
    switch (context) {
      case 'video-studio':
        return 'There was an error in the video studio. Your work has been saved automatically.';
      case 'workflow':
        return 'There was an error in the workflow. Please try refreshing or contact support.';
      case 'ui-component':
        return 'A component failed to load properly. The rest of the application should continue to work.';
      case 'page':
        return 'There was an error loading this page. Please try refreshing.';
      case 'section':
        return 'There was an error in this section. Other parts of the page should continue to work.';
      default:
        return 'Something went wrong. Please try refreshing the page.';
    }
  }

  private sanitizeErrorMessage(message: string): string {
    // In production, sanitize potentially sensitive information
    if (process.env.NODE_ENV === 'production') {
      // Remove file paths and line numbers
      let sanitized = message.replace(/\/[^\s]+\.[a-zA-Z]+:\d+:\d+/g, '[file path removed]');

      // Remove stack traces from error messages
      sanitized = sanitized.replace(/\s+at\s+[^\n]+/g, '');

      // Remove potential API keys or tokens (common patterns)
      sanitized = sanitized.replace(/[a-zA-Z0-9]{32,}/g, '[sensitive data removed]');

      // Remove shorter API keys and tokens (common patterns)
      sanitized = sanitized.replace(/\b[a-zA-Z0-9]{12,31}\b/g, '[sensitive data removed]');

      // Remove URLs that might contain sensitive parameters
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, '[URL removed]');

      return sanitized.trim();
    }

    // In development, return full error message
    return message;
  }

  private getTroubleshootingSteps(context: ErrorBoundaryContext): string[] {
    const commonSteps = [
      'Refresh the page to see if the issue resolves',
      'Clear your browser cache and cookies',
      'Try using a different browser or incognito/private mode',
    ];

    const contextSpecificSteps: Record<ErrorBoundaryContext, string[]> = {
      'video-studio': [
        'Save your current work if possible',
        'Check if all media files are properly uploaded',
        ...commonSteps,
        'Restart your video creation process',
      ],
      workflow: [
        'Try completing the workflow step again',
        'Check your internet connection',
        ...commonSteps,
        'Contact support if working on time-sensitive content',
      ],
      page: [
        'Try navigating to the page again from the main menu',
        ...commonSteps,
        'Check if other pages are working normally',
      ],
      section: [
        'Try reloading just this section if possible',
        'Continue using other parts of the page',
        ...commonSteps,
      ],
      component: [
        'Try interacting with other parts of the interface',
        ...commonSteps,
        'Report the specific component that failed',
      ],
      'ui-component': [
        'Try interacting with other parts of the interface',
        ...commonSteps,
        'Report the specific component that failed',
      ],
      general: commonSteps,
    };

    return contextSpecificSteps[context] || commonSteps;
  }

  private renderDefaultFallback() {
    const { error, errorInfo, errorId, showDetails } = this.state;
    const { context = 'general', level = 'critical', isolate = false } = this.props;

    if (!error) return null;

    const contextMessage = this.getContextualMessage(context);
    const isComponentLevel = context === 'component' || context === 'ui-component' || isolate;

    return (
      <Paper
        elevation={isComponentLevel ? 1 : 3}
        sx={{
          p: 3,
          m: isComponentLevel ? 1 : 2,
          borderLeft: theme => `4px solid ${theme.palette.error.main}`,
          backgroundColor: theme =>
            level === 'critical' ? theme.palette.error.light : theme.palette.warning.light,
        }}
      >
        <Stack spacing={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <ErrorIcon color="error" fontSize="large" />
            <Box>
              <Typography variant={isComponentLevel ? 'h6' : 'h5'} color="error" gutterBottom>
                {level === 'critical' ? 'Critical Error' : 'Error Occurred'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {contextMessage}
              </Typography>
            </Box>
          </Box>

          <Divider />

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={this.resetError}
              color="primary"
            >
              Try Again
            </Button>

            {!isComponentLevel && (
              <Button variant="outlined" startIcon={<HomeIcon />} onClick={this.goHome}>
                Go Home
              </Button>
            )}

            {this.shouldShowBugReporting() && (
              <Button
                variant="text"
                startIcon={<BugReportIcon />}
                onClick={this.handleReportBug}
                size="small"
                color="secondary"
              >
                Report Bug
              </Button>
            )}

            <Button
              variant="text"
              startIcon={<InfoIcon />}
              onClick={this.toggleDetails}
              size="small"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </Stack>

          <Collapse in={showDetails}>
            <Stack spacing={1}>
              {/* Basic Error Information */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Error Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Error ID: {errorId}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Error Message:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 1,
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          overflowX: 'auto',
                        }}
                      >
                        {this.sanitizeErrorMessage(error.message)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Error Type:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {error.name} • {context} context • {level} level
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Timestamp:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date().toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Technical Details - Development Only */}
              {process.env.NODE_ENV === 'development' && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2">Technical Details (Development)</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {error.stack && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Stack Trace:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              backgroundColor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              overflowX: 'auto',
                              maxHeight: 200,
                              overflow: 'auto',
                              fontFamily: 'monospace',
                            }}
                          >
                            {error.stack}
                          </Typography>
                        </Box>
                      )}

                      {errorInfo && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Component Stack:
                          </Typography>
                          <Typography
                            variant="body2"
                            component="pre"
                            sx={{
                              backgroundColor: 'grey.100',
                              p: 1,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              overflowX: 'auto',
                              maxHeight: 200,
                              overflow: 'auto',
                              fontFamily: 'monospace',
                            }}
                          >
                            {errorInfo.componentStack}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Environment Information */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Environment Information</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Environment:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {process.env.NODE_ENV || 'unknown'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        URL:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {typeof window !== 'undefined' ? window.location.href : 'Server-side'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        User Agent:
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: '0.75rem',
                          wordBreak: 'break-all',
                          maxWidth: '100%',
                        }}
                      >
                        {typeof navigator !== 'undefined' ? navigator.userAgent : 'Server-side'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Screen Resolution:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {typeof window !== 'undefined'
                          ? `${window.screen.width}x${window.screen.height}`
                          : 'Server-side'}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Troubleshooting Steps */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">Troubleshooting Steps</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={1}>
                    <Typography variant="body2" gutterBottom>
                      Try these steps to resolve the issue:
                    </Typography>
                    {this.getTroubleshootingSteps(context).map((step, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        {index + 1}. {step}
                      </Typography>
                    ))}

                    <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary">
                        If the problem persists, please copy the Error ID ({errorId}) and contact
                        support.
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Collapse>
        </Stack>
      </Paper>
    );
  }

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { fallback: CustomFallback, children, context = 'general' } = this.props;

    if (hasError && error) {
      if (CustomFallback) {
        return (
          <CustomFallback
            error={error}
            errorInfo={errorInfo!}
            errorId={errorId}
            context={context}
            resetError={this.resetError}
            goHome={this.goHome}
          />
        );
      }

      return this.renderDefaultFallback();
    }

    return children;
  }
}

// Higher-order component for wrapping components with UnifiedErrorBoundary
export function withUnifiedErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<UnifiedErrorBoundaryProps, 'children'>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <UnifiedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </UnifiedErrorBoundary>
  );

  WrappedComponent.displayName = `withUnifiedErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
}

// Hook for manual error reporting and handling
export function useUnifiedErrorHandler() {
  const reportError = React.useCallback((error: Error, context?: string): string => {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log error for debugging
    logger.error('Manual error report', {
      error: error.message,
      stack: error.stack,
      context,
      errorId,
    });

    // Report to error reporting service
    errorReporter.reportUIError(error, 'useUnifiedErrorHandler', context || 'manual-report');

    return errorId;
  }, []);

  const throwError = React.useCallback((error: Error): never => {
    throw error;
  }, []);

  return { reportError, throwError };
}

// Feature-specific error boundary component
export interface FeatureErrorFallbackProps {
  error: Error;
  resetError: () => void;
  feature: string;
}

export interface FeatureErrorBoundaryProps {
  children: ReactNode;
  feature: string;
  fallback?: React.ComponentType<FeatureErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo, feature: string) => void;
  errorReportingEndpoint?: string;
}

const DefaultFeatureFallback: React.FC<FeatureErrorFallbackProps> = ({
  error,
  resetError,
  feature,
}) => {
  return (
    <Alert
      severity="error"
      sx={{ m: 2 }}
      action={
        <Button color="inherit" size="small" onClick={resetError}>
          Retry
        </Button>
      }
    >
      <Typography variant="subtitle2" gutterBottom>
        {feature} is temporarily unavailable
      </Typography>
      <Typography variant="body2">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </Typography>
    </Alert>
  );
};

export const FeatureErrorBoundary: React.FC<FeatureErrorBoundaryProps> = ({
  children,
  feature,
  fallback: CustomFallback,
  onError,
  errorReportingEndpoint,
}) => {
  const handleError = React.useCallback(
    async (error: Error, errorInfo: ErrorInfo) => {
      // Log error with feature context
      logger.error('Feature error boundary caught error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        feature,
      });

      // Call custom error handler
      if (onError) {
        onError(error, errorInfo, feature);
      }

      // Report to feature-specific endpoint if configured
      if (errorReportingEndpoint) {
        try {
          await fetch(errorReportingEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              feature,
              error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
              },
              errorInfo,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (reportingError) {
          console.error('Failed to report feature error:', reportingError);
        }
      }
    },
    [feature, onError, errorReportingEndpoint]
  );

  const FeatureFallback = CustomFallback || DefaultFeatureFallback;

  const customFallback: React.ComponentType<ErrorFallbackProps> = React.useCallback(
    ({ error, resetError }) => (
      <FeatureFallback error={error} resetError={resetError} feature={feature} />
    ),
    [FeatureFallback, feature]
  );

  return (
    <UnifiedErrorBoundary
      context="component"
      isolate={true}
      fallback={customFallback}
      onError={handleError}
    >
      {children}
    </UnifiedErrorBoundary>
  );
};

// Export as default for easy imports
export default UnifiedErrorBoundary;

// Legacy exports for backward compatibility
export { UnifiedErrorBoundary as ErrorBoundary };
export { UnifiedErrorBoundary as VideoStudioErrorBoundary };
export { UnifiedErrorBoundary as WorkflowErrorBoundary };
export { UnifiedErrorBoundary as UIErrorBoundary };
