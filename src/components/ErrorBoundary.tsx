/**
 * React Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error tracking service
      // errorTracker.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-brutalist-white flex items-center justify-center p-6">
          <Card className="brutalist-card max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 border-4 border-red-600 brutalist-shadow">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black text-brutalist-black mb-2">
                    SYSTEM ERROR DETECTED
                  </CardTitle>
                  <p className="font-bold text-gray-600 uppercase tracking-wide">
                    Something went wrong in the application
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Message */}
              <div className="p-4 bg-red-50 border-4 border-red-200 rounded-lg">
                <h3 className="font-black text-lg text-red-800 mb-2">ERROR DETAILS</h3>
                <p className="font-bold text-red-700 mb-2">
                  {this.state.error?.name}: {this.state.error?.message}
                </p>
                
                {/* Show stack trace in development */}
                {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                  <details className="mt-4">
                    <summary className="font-bold text-red-700 cursor-pointer hover:underline">
                      View Technical Details
                    </summary>
                    <pre className="mt-2 p-2 bg-red-100 border-2 border-red-300 text-xs overflow-auto">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo?.componentStack && (
                      <pre className="mt-2 p-2 bg-red-100 border-2 border-red-300 text-xs overflow-auto">
                        Component Stack:{this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
              </div>

              {/* Recovery Actions */}
              <div className="space-y-4">
                <h3 className="font-black text-xl text-brutalist-black">RECOVERY OPTIONS</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={this.handleRetry}
                    className="brutalist-button-primary flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>TRY AGAIN</span>
                  </Button>
                  
                  <Button
                    onClick={this.handleReload}
                    className="brutalist-button-secondary flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>RELOAD PAGE</span>
                  </Button>
                  
                  <Button
                    onClick={this.handleGoHome}
                    className="brutalist-button-secondary flex items-center justify-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>GO HOME</span>
                  </Button>
                </div>
              </div>

              {/* Help Information */}
              <div className="p-4 bg-blue-50 border-4 border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Bug className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-black text-blue-800 mb-2">NEED HELP?</h4>
                    <p className="font-bold text-blue-700 text-sm">
                      If this error persists, please report it to the development team with the error details above.
                    </p>
                    {process.env.NODE_ENV === 'production' && (
                      <p className="font-bold text-blue-700 text-sm mt-2">
                        Error ID: {Date.now().toString(36)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Simple error boundary for specific sections
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName 
}: { 
  children: ReactNode; 
  sectionName: string; 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border-4 border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="font-bold text-red-800">
              Error loading {sectionName}
            </span>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error(`Error in ${sectionName}:`, error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}