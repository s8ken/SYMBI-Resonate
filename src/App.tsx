import { Dashboard } from "./components/Dashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error('App Error:', error, errorInfo);
        
        // In production, send to error tracking service
        if (process.env.NODE_ENV === 'production') {
          // Example: errorTracker.captureException(error, { extra: errorInfo });
        }
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}