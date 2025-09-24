/**
 * Lazy Loading Components
 * 
 * Provides lazy-loaded versions of heavy components to improve initial bundle size
 * and loading performance through code splitting.
 */

import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner, AssessmentLoadingSkeleton, DashboardLoadingSkeleton } from './ui/loading';

// Lazy load page components for better code splitting
export const LazyDashboardPage = lazy(() => 
  import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage }))
);

export const LazyAssessmentPage = lazy(() => 
  import('./pages/AssessmentPage').then(module => ({ default: module.AssessmentPage }))
);

export const LazyAnalyticsPage = lazy(() => 
  import('./pages/AnalyticsPage').then(module => ({ default: module.AnalyticsPage }))
);

export const LazyReportsPage = lazy(() => 
  import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage }))
);

export const LazySymbiFrameworkPage = lazy(() => 
  import('./pages/SymbiFrameworkPage').then(module => ({ default: module.SymbiFrameworkPage }))
);

export const LazyIntelligencePage = lazy(() => 
  import('./pages/IntelligencePage').then(module => ({ default: module.IntelligencePage }))
);

export const LazySentimentPage = lazy(() => 
  import('./pages/SentimentPage').then(module => ({ default: module.SentimentPage }))
);

export const LazyCitationsPage = lazy(() => 
  import('./pages/CitationsPage').then(module => ({ default: module.CitationsPage }))
);

export const LazyPromptsPage = lazy(() => 
  import('./pages/PromptsPage').then(module => ({ default: module.PromptsPage }))
);

export const LazyOptimizePage = lazy(() => 
  import('./pages/OptimizePage').then(module => ({ default: module.OptimizePage }))
);

export const LazyCrawlersPage = lazy(() => 
  import('./pages/CrawlersPage').then(module => ({ default: module.CrawlersPage }))
);

export const LazyLLMTrafficPage = lazy(() => 
  import('./pages/LLMTrafficPage').then(module => ({ default: module.LLMTrafficPage }))
);

export const LazyConversationsPage = lazy(() => 
  import('./pages/ConversationsPage').then(module => ({ default: module.ConversationsPage }))
);

export const LazyIntegrationsPage = lazy(() => 
  import('./pages/IntegrationsPage').then(module => ({ default: module.IntegrationsPage }))
);

// Lazy load SYMBI Framework components
export const LazySymbiFrameworkAssessment = lazy(() => 
  import('./SymbiFrameworkAssessment').then(module => ({ default: module.SymbiFrameworkAssessment }))
);

export const LazySymbiFrameworkGuide = lazy(() => 
  import('./SymbiFrameworkGuide').then(module => ({ default: module.SymbiFrameworkGuide }))
);

// Lazy load heavy detector components
export const LazyEnhancedDetector = lazy(() => 
  import('../lib/symbi-framework/enhanced-detector').then(module => ({ default: module.EnhancedSymbiFrameworkDetector }))
);

export const LazyFinalDetector = lazy(() => 
  import('../lib/symbi-framework/final-detector').then(module => ({ default: module.FinalSymbiFrameworkDetector }))
);

/**
 * Higher-order component for wrapping lazy components with custom loading states
 */
export function withLazyLoading<T extends object>(
  LazyComponent: ComponentType<T>,
  LoadingComponent?: ComponentType,
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: T) => (
    <Suspense 
      fallback={
        LoadingComponent ? (
          <LoadingComponent />
        ) : (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
            <span className="ml-3 font-bold text-gray-600">LOADING COMPONENT...</span>
          </div>
        )
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );

  WrappedComponent.displayName = `withLazyLoading(${LazyComponent.displayName || 'LazyComponent'})`;
  
  return WrappedComponent;
}

/**
 * Lazy component wrapper with custom skeleton loading
 */
export function LazyPageWrapper({ 
  children, 
  fallback,
  skeleton 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeleton?: 'dashboard' | 'assessment' | 'default';
}) {
  const getSkeletonComponent = () => {
    switch (skeleton) {
      case 'dashboard':
        return <DashboardLoadingSkeleton />;
      case 'assessment':
        return <AssessmentLoadingSkeleton />;
      default:
        return (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
            <span className="ml-3 font-bold text-gray-600">LOADING...</span>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={fallback || getSkeletonComponent()}>
      {children}
    </Suspense>
  );
}

/**
 * Pre-configured lazy page components with appropriate loading states
 */
export const DashboardPageLazy = withLazyLoading(
  LazyDashboardPage,
  DashboardLoadingSkeleton
);

export const AssessmentPageLazy = withLazyLoading(
  LazyAssessmentPage,
  AssessmentLoadingSkeleton
);

export const SymbiFrameworkPageLazy = withLazyLoading(
  LazySymbiFrameworkPage,
  AssessmentLoadingSkeleton
);

export const AnalyticsPageLazy = withLazyLoading(LazyAnalyticsPage);
export const ReportsPageLazy = withLazyLoading(LazyReportsPage);
export const IntelligencePageLazy = withLazyLoading(LazyIntelligencePage);
export const SentimentPageLazy = withLazyLoading(LazySentimentPage);
export const CitationsPageLazy = withLazyLoading(LazyCitationsPage);
export const PromptsPageLazy = withLazyLoading(LazyPromptsPage);
export const OptimizePageLazy = withLazyLoading(LazyOptimizePage);
export const CrawlersPageLazy = withLazyLoading(LazyCrawlersPage);
export const LLMTrafficPageLazy = withLazyLoading(LazyLLMTrafficPage);
export const ConversationsPageLazy = withLazyLoading(LazyConversationsPage);
export const IntegrationsPageLazy = withLazyLoading(LazyIntegrationsPage);

/**
 * Preload function to warm up lazy components
 */
export const preloadComponents = {
  dashboard: () => import('./pages/DashboardPage'),
  assessment: () => import('./pages/AssessmentPage'),
  analytics: () => import('./pages/AnalyticsPage'),
  reports: () => import('./pages/ReportsPage'),
  symbiFramework: () => import('./pages/SymbiFrameworkPage'),
  intelligence: () => import('./pages/IntelligencePage'),
  sentiment: () => import('./pages/SentimentPage'),
  citations: () => import('./pages/CitationsPage'),
  prompts: () => import('./pages/PromptsPage'),
  optimize: () => import('./pages/OptimizePage'),
  crawlers: () => import('./pages/CrawlersPage'),
  llmTraffic: () => import('./pages/LLMTrafficPage'),
  conversations: () => import('./pages/ConversationsPage'),
  integrations: () => import('./pages/IntegrationsPage')
};

/**
 * Preload critical components on app initialization
 */
export const preloadCriticalComponents = () => {
  // Preload the most commonly used components
  setTimeout(() => {
    preloadComponents.dashboard();
    preloadComponents.symbiFramework();
    preloadComponents.assessment();
  }, 1000); // Delay to not interfere with initial load
};

/**
 * Component preloader hook
 */
export const useComponentPreloader = () => {
  const preload = (componentName: keyof typeof preloadComponents) => {
    return preloadComponents[componentName]();
  };

  const preloadMultiple = (componentNames: (keyof typeof preloadComponents)[]) => {
    return Promise.all(componentNames.map(name => preloadComponents[name]()));
  };

  return { preload, preloadMultiple };
};