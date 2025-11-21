/**
 * Error Tracking Service
 * Integrates with Sentry for error monitoring
 */

export interface ErrorContext {
  user?: {
    id: string;
    email: string;
  };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export class ErrorTracker {
  private static instance: ErrorTracker;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker();
    }
    return ErrorTracker.instance;
  }

  /**
   * Initialize error tracking
   */
  initialize(config: {
    dsn: string;
    environment: string;
    release?: string;
    sampleRate?: number;
  }) {
    if (this.isInitialized) {
      console.warn('Error tracker already initialized');
      return;
    }

    // In production, initialize Sentry here
    // import * as Sentry from '@sentry/react';
    // Sentry.init({
    //   dsn: config.dsn,
    //   environment: config.environment,
    //   release: config.release,
    //   tracesSampleRate: config.sampleRate || 0.1,
    // });

    this.isInitialized = true;
    console.log('Error tracking initialized:', config.environment);
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: ErrorContext) {
    console.error('Error captured:', error, context);

    if (!this.isInitialized) {
      return;
    }

    // In production, use Sentry
    // Sentry.captureException(error, {
    //   user: context?.user,
    //   tags: context?.tags,
    //   extra: context?.extra,
    // });
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
    console.log(`[${level.toUpperCase()}] ${message}`, context);

    if (!this.isInitialized) {
      return;
    }

    // In production, use Sentry
    // Sentry.captureMessage(message, {
    //   level,
    //   user: context?.user,
    //   tags: context?.tags,
    //   extra: context?.extra,
    // });
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email: string } | null) {
    if (!this.isInitialized) {
      return;
    }

    // In production, use Sentry
    // if (user) {
    //   Sentry.setUser(user);
    // } else {
    //   Sentry.setUser(null);
    // }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }) {
    if (!this.isInitialized) {
      return;
    }

    // In production, use Sentry
    // Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string) {
    if (!this.isInitialized) {
      return;
    }

    // In production, use Sentry
    // Sentry.setTag(key, value);
  }

  /**
   * Set context
   */
  setContext(name: string, context: Record<string, any>) {
    if (!this.isInitialized) {
      return;
    }

    // In production, use Sentry
    // Sentry.setContext(name, context);
  }
}

/**
 * Global error handler
 */
export function setupGlobalErrorHandler() {
  const errorTracker = ErrorTracker.getInstance();

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.captureException(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      {
        tags: { type: 'unhandled_rejection' },
        extra: { reason: event.reason },
      }
    );
  });

  // Handle global errors
  window.addEventListener('error', (event) => {
    errorTracker.captureException(event.error || new Error(event.message), {
      tags: { type: 'global_error' },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    });
  });
}

/**
 * React Error Boundary
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorTracker = ErrorTracker.getInstance();
    errorTracker.captureException(error, {
      tags: { type: 'react_error_boundary' },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Something went wrong
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Export singleton instance
export const errorTracker = ErrorTracker.getInstance();