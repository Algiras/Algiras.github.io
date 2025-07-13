import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container size="sm" py="xl">
          <Stack align="center" gap="md">
            <AlertTriangle size={48} color="red" />
            <Title order={2} ta="center">Something went wrong</Title>
            
            <Alert 
              variant="light" 
              color="red" 
              title="Error Details"
              icon={<AlertTriangle size={16} />}
              style={{ width: '100%' }}
            >
              <Text size="sm" mb="xs">
                {this.state.error?.message || 'An unexpected error occurred'}
              </Text>
              
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                  {this.state.error.stack}
                </Text>
              )}
            </Alert>

            <Stack gap="sm">
              <Button 
                onClick={this.handleReset}
                leftSection={<RefreshCw size={16} />}
                variant="filled"
              >
                Try Again
              </Button>
              
              <Button 
                onClick={this.handleReload}
                variant="light"
                color="gray"
              >
                Reload Page
              </Button>
            </Stack>

            <Text size="sm" c="dimmed" ta="center">
              If this problem persists, please try refreshing the page or contact support.
            </Text>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return handleError;
}; 