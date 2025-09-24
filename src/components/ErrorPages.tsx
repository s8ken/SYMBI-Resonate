/**
 * Error Page Components
 * 
 * Dedicated error pages for different error scenarios in SYMBI Resonate.
 * Provides consistent error handling and user guidance across the application.
 */

import React from 'react';
import { 
  AlertTriangle, 
  Home, 
  RefreshCw, 
  Search, 
  Bug, 
  Shield,
  Wifi,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

/**
 * Base Error Page Layout
 */
interface BaseErrorPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

function BaseErrorPage({ icon, title, description, children, actions }: BaseErrorPageProps) {
  return (
    <div className="min-h-screen bg-brutalist-white flex items-center justify-center p-6">
      <Card className="brutalist-card max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-600 flex items-center justify-center brutalist-shadow">
              {icon}
            </div>
            <div>
              <CardTitle className="text-3xl font-black text-brutalist-black mb-2">
                {title}
              </CardTitle>
              <p className="font-bold text-gray-600 uppercase tracking-wide text-sm">
                {description}
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {children}
          
          {actions && (
            <div className="flex flex-wrap gap-4 pt-4">
              {actions}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * 404 - Page Not Found Error
 */
export function NotFoundError() {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <BaseErrorPage
      icon={<Search className="w-8 h-8 text-white" />}
      title="PAGE NOT FOUND"
      description="The requested page could not be located"
      actions={
        <>
          <Button
            onClick={handleGoHome}
            className="brutalist-button-primary flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>GO HOME</span>
          </Button>
          <Button
            onClick={handleGoBack}
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>GO BACK</span>
          </Button>
        </>
      }
    >
      <div className="p-4 bg-yellow-50 border-4 border-yellow-200">
        <h3 className="font-black text-lg text-yellow-800 mb-3">WHAT HAPPENED?</h3>
        <ul className="font-bold text-yellow-700 space-y-2">
          <li>• The page you're looking for doesn't exist</li>
          <li>• The URL might be mistyped</li>
          <li>• The page may have been moved or deleted</li>
          <li>• You might not have permission to access this page</li>
        </ul>
      </div>

      <div className="p-4 bg-blue-50 border-4 border-blue-200">
        <h3 className="font-black text-lg text-blue-800 mb-3">SUGGESTED ACTIONS</h3>
        <ul className="font-bold text-blue-700 space-y-2">
          <li>• Return to the home page and navigate from there</li>
          <li>• Check the URL for typos</li>
          <li>• Use the navigation menu to find what you're looking for</li>
          <li>• Contact support if you believe this is an error</li>
        </ul>
      </div>
    </BaseErrorPage>
  );
}

/**
 * 500 - Internal Server Error
 */
export function InternalServerError() {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleReportIssue = () => {
    // In a real app, this would open a support form or email
    const errorReport = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorType: 'Internal Server Error'
    };
    
    console.log('Error Report:', errorReport);
    alert('Error details have been logged. Please contact support for assistance.');
  };

  return (
    <BaseErrorPage
      icon={<AlertTriangle className="w-8 h-8 text-white" />}
      title="SERVER ERROR"
      description="An internal server error occurred"
      actions={
        <>
          <Button
            onClick={handleRetry}
            className="brutalist-button-primary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </Button>
          <Button
            onClick={handleGoHome}
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>GO HOME</span>
          </Button>
          <Button
            onClick={handleReportIssue}
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <Bug className="w-4 h-4" />
            <span>REPORT ISSUE</span>
          </Button>
        </>
      }
    >
      <div className="p-4 bg-red-50 border-4 border-red-200">
        <h3 className="font-black text-lg text-red-800 mb-3">WHAT HAPPENED?</h3>
        <p className="font-bold text-red-700">
          The server encountered an unexpected condition that prevented it from 
          fulfilling your request. This is usually a temporary issue.
        </p>
      </div>

      <div className="p-4 bg-blue-50 border-4 border-blue-200">
        <h3 className="font-black text-lg text-blue-800 mb-3">WHAT YOU CAN DO</h3>
        <ul className="font-bold text-blue-700 space-y-2">
          <li>• Wait a few minutes and try again</li>
          <li>• Refresh the page</li>
          <li>• Clear your browser cache and cookies</li>
          <li>• Try accessing the page from a different browser</li>
          <li>• Contact support if the issue persists</li>
        </ul>
      </div>
    </BaseErrorPage>
  );
}

/**
 * Network/Connection Error
 */
export function NetworkError() {
  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoOffline = () => {
    // In a real app, you might switch to offline mode
    alert('Offline mode is not currently available.');
  };

  return (
    <BaseErrorPage
      icon={<Wifi className="w-8 h-8 text-white" />}
      title="CONNECTION ERROR"
      description="Unable to connect to the server"
      actions={
        <>
          <Button
            onClick={handleRetry}
            className="brutalist-button-primary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>RETRY CONNECTION</span>
          </Button>
          <Button
            onClick={handleGoOffline}
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <Shield className="w-4 h-4" />
            <span>OFFLINE MODE</span>
          </Button>
        </>
      }
    >
      <div className="p-4 bg-orange-50 border-4 border-orange-200">
        <h3 className="font-black text-lg text-orange-800 mb-3">CONNECTION ISSUES</h3>
        <ul className="font-bold text-orange-700 space-y-2">
          <li>• Check your internet connection</li>
          <li>• Verify your network settings</li>
          <li>• Try connecting to a different network</li>
          <li>• Disable VPN or proxy if active</li>
        </ul>
      </div>
    </BaseErrorPage>
  );
}

/**
 * Timeout Error
 */
export function TimeoutError() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <BaseErrorPage
      icon={<Clock className="w-8 h-8 text-white" />}
      title="REQUEST TIMEOUT"
      description="The request took too long to process"
      actions={
        <Button
          onClick={handleRetry}
          className="brutalist-button-primary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>TRY AGAIN</span>
        </Button>
      }
    >
      <div className="p-4 bg-yellow-50 border-4 border-yellow-200">
        <h3 className="font-black text-lg text-yellow-800 mb-3">TIMEOUT OCCURRED</h3>
        <p className="font-bold text-yellow-700">
          The server is taking longer than expected to respond. This might be due to 
          high server load or network issues.
        </p>
      </div>
    </BaseErrorPage>
  );
}

/**
 * Generic Error Component
 */
interface GenericErrorProps {
  error?: Error;
  title?: string;
  description?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export function GenericError({ 
  error, 
  title = "UNEXPECTED ERROR",
  description = "Something went wrong",
  showRetry = true,
  onRetry
}: GenericErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <BaseErrorPage
      icon={<HelpCircle className="w-8 h-8 text-white" />}
      title={title}
      description={description}
      actions={
        <>
          {showRetry && (
            <Button
              onClick={handleRetry}
              className="brutalist-button-primary flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>TRY AGAIN</span>
            </Button>
          )}
          <Button
            onClick={handleGoHome}
            className="brutalist-button-secondary flex items-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>GO HOME</span>
          </Button>
        </>
      }
    >
      {error && (
        <div className="p-4 bg-red-50 border-4 border-red-200">
          <h3 className="font-black text-lg text-red-800 mb-2">ERROR DETAILS</h3>
          <p className="font-bold text-red-700 text-sm mb-2">
            <strong>Type:</strong> {error.name}
          </p>
          <p className="font-bold text-red-700 text-sm">
            <strong>Message:</strong> {error.message}
          </p>
          
          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mt-3">
              <summary className="font-bold text-red-700 cursor-pointer hover:underline">
                View Stack Trace
              </summary>
              <pre className="mt-2 p-2 bg-red-100 border-2 border-red-300 text-xs overflow-auto max-h-40">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      )}
    </BaseErrorPage>
  );
}

/**
 * Error page router - determines which error page to show based on error type
 */
export function ErrorPageRouter({ error, errorType }: { 
  error?: Error; 
  errorType?: 'not-found' | 'server-error' | 'network' | 'timeout' | 'generic';
}) {
  switch (errorType) {
    case 'not-found':
      return <NotFoundError />;
    case 'server-error':
      return <InternalServerError />;
    case 'network':
      return <NetworkError />;
    case 'timeout':
      return <TimeoutError />;
    case 'generic':
    default:
      return <GenericError error={error} />;
  }
}

export default {
  NotFoundError,
  InternalServerError,
  NetworkError,
  TimeoutError,
  GenericError,
  ErrorPageRouter
};