import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Card, CardContent, Typography, Button, Alert, Divider } from '@mui/material';
import { Error as ErrorIcon, Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree and displays
 * a fallback UI instead of crashing the entire application. Designed specifically
 * for the Video Studio components to provide graceful error handling.
 */
export class VideoStudioErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console and external services
    console.error('Video Studio Error Boundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In a real application, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  handleRetry = () => {
    // Reset the error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReportBug = () => {
    // In a real application, this would open a bug report form or redirect to support
    const errorDetails = {
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      section: this.props.section,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.log('Bug report details:', errorDetails);

    // Example: Open support form with pre-filled error details
    const subject = encodeURIComponent(
      `Video Studio Error - ${this.props.section || 'Unknown Section'}`
    );
    const body = encodeURIComponent(`
Error Details:
${JSON.stringify(errorDetails, null, 2)}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@airwave.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon
              sx={{
                fontSize: 64,
                color: 'error.main',
                mb: 2,
              }}
            />

            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph>
              {this.props.section
                ? `An error occurred in the ${this.props.section} section. Don't worry, your other work is safe.`
                : 'An unexpected error occurred in the Video Studio.'}
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography variant="body2" component="div">
                <strong>Error:</strong> {this.state.error?.message}
              </Typography>
            </Alert>

            <Box display="flex" gap={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                size="large"
              >
                Try Again
              </Button>

              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={this.handleReportBug}
                size="large"
              >
                Report Bug
              </Button>
            </Box>

            {/* Show detailed error info in development */}
            {process.env.NODE_ENV === 'development' && (
              <>
                <Divider sx={{ my: 3 }} />
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="h6" gutterBottom>
                    Debug Information
                  </Typography>

                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      backgroundColor: 'grey.100',
                      p: 2,
                      borderRadius: 1,
                      overflow: 'auto',
                      fontSize: '0.75rem',
                      mb: 2,
                    }}
                  >
                    {this.state.error?.stack}
                  </Typography>

                  {this.state.errorInfo && (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Component Stack:
                      </Typography>
                      <Typography
                        variant="body2"
                        component="pre"
                        sx={{
                          backgroundColor: 'grey.100',
                          p: 2,
                          borderRadius: 1,
                          overflow: 'auto',
                          fontSize: '0.75rem',
                        }}
                      >
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </>
                  )}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

// Functional wrapper for easier usage with hooks
interface VideoStudioErrorBoundaryWrapperProps {
  children: ReactNode;
  section: string;
  fallback?: ReactNode;
}

export const VideoStudioSectionBoundary: React.FC<VideoStudioErrorBoundaryWrapperProps> = ({
  children,
  section,
  fallback,
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log section-specific errors
    console.error(`Error in Video Studio ${section}:`, error, errorInfo);

    // You could add section-specific error tracking here
    // Example: Analytics.track('video_studio_error', { section, error: error.message });
  };

  return (
    <VideoStudioErrorBoundary section={section} onError={handleError} fallback={fallback}>
      {children}
    </VideoStudioErrorBoundary>
  );
};

// Higher-order component for wrapping individual components
export const withVideoStudioErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  section: string,
  fallback?: ReactNode
) => {
  const WrappedComponent: React.FC<P> = props => (
    <VideoStudioSectionBoundary section={section} fallback={fallback}>
      <Component {...props} />
    </VideoStudioSectionBoundary>
  );

  WrappedComponent.displayName = `withVideoStudioErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
