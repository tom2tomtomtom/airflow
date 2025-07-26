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
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
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

  // UI options
  showDetails?: boolean;
  isolate?: boolean;

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

  private resetError = () => {
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

            <Button
              variant="text"
              startIcon={<BugReportIcon />}
              onClick={this.toggleDetails}
              size="small"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </Stack>

          <Collapse in={showDetails}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle2">Error Details</Typography>
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
                      {error.message}
                    </Typography>
                  </Box>

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
                        }}
                      >
                        {errorInfo.componentStack}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </AccordionDetails>
            </Accordion>
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

// Export as default for easy imports
export default UnifiedErrorBoundary;

// Legacy exports for backward compatibility
export { UnifiedErrorBoundary as ErrorBoundary };
export { UnifiedErrorBoundary as VideoStudioErrorBoundary };
export { UnifiedErrorBoundary as WorkflowErrorBoundary };
export { UnifiedErrorBoundary as UIErrorBoundary };
