/**
 * ErrorBoundary Migration Wrapper
 *
 * This file provides backward compatibility wrappers for the old ErrorBoundary
 * implementations while gradually migrating to the UnifiedErrorBoundary.
 *
 * Usage: Import from this file instead of the old ErrorBoundary files.
 * The components will automatically use the new UnifiedErrorBoundary with
 * appropriate context settings.
 */

import React from 'react';
import {
  UnifiedErrorBoundary,
  UnifiedErrorBoundaryProps,
  ErrorBoundaryContext,
} from './UnifiedErrorBoundary';

// Legacy prop types for backward compatibility
interface LegacyErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showDetails?: boolean;
  context?: string;
  section?: string;
}

// Main ErrorBoundary (from src/components/ErrorBoundary.tsx)
export const ErrorBoundary: React.FC<LegacyErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  ...props
}) => {
  const unifiedProps: UnifiedErrorBoundaryProps = {
    children,
    context: 'general',
    onError: onError
      ? (error, errorInfo, errorId, context) => onError(error, errorInfo)
      : undefined,
    showDetails: props.showDetails,
  };

  return <UnifiedErrorBoundary {...unifiedProps} />;
};

// Workflow ErrorBoundary (from src/components/workflow/ErrorBoundary.tsx)
export const WorkflowErrorBoundary: React.FC<LegacyErrorBoundaryProps> = ({
  children,
  context,
  ...props
}) => {
  const unifiedProps: UnifiedErrorBoundaryProps = {
    children,
    context: 'workflow',
    showDetails: true,
    onError: props.onError
      ? (error, errorInfo, errorId, context) => props.onError!(error, errorInfo)
      : undefined,
  };

  return <UnifiedErrorBoundary {...unifiedProps} />;
};

// Video Studio ErrorBoundary (from src/components/video-studio/ErrorBoundary.tsx)
export const VideoStudioErrorBoundary: React.FC<
  LegacyErrorBoundaryProps & { section?: string }
> = ({ children, section, ...props }) => {
  const unifiedProps: UnifiedErrorBoundaryProps = {
    children,
    context: 'video-studio',
    section,
    isolate: true,
    resetOnPropsChange: true,
    showDetails: props.showDetails,
    onError: props.onError
      ? (error, errorInfo, errorId, context) => props.onError!(error, errorInfo)
      : undefined,
  };

  return <UnifiedErrorBoundary {...unifiedProps} />;
};

// UI ErrorBoundary (from src/components/ui/ErrorBoundary/ErrorBoundary.tsx)
export const UIErrorBoundary: React.FC<UnifiedErrorBoundaryProps> = props => {
  const unifiedProps: UnifiedErrorBoundaryProps = {
    context: 'ui-component',
    level: 'warning',
    isolate: true,
    ...props,
  };

  return <UnifiedErrorBoundary {...unifiedProps} />;
};

// Higher-order component for wrapping components with error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  context: ErrorBoundaryContext = 'component'
) => {
  const WrappedComponent = (props: P) => (
    <UnifiedErrorBoundary context={context} isolate>
      <Component {...props} />
    </UnifiedErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Specialized HOCs for different contexts
export const withVideoStudioErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withErrorBoundary(Component, 'video-studio');

export const withWorkflowErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withErrorBoundary(Component, 'workflow');

export const withUIErrorBoundary = <P extends object>(Component: React.ComponentType<P>) =>
  withErrorBoundary(Component, 'ui-component');

// Default export for main ErrorBoundary
export default ErrorBoundary;
