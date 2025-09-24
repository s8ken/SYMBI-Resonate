/**
 * Performance Monitoring Utilities
 * 
 * Provides tools for monitoring application performance, collecting metrics,
 * and reporting on Web Vitals for optimization insights.
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url?: string;
  userAgent?: string;
}

interface WebVitalsMetric {
  id: string;
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB';
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private vitalsMetrics: WebVitalsMetric[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.isEnabled = !import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';
    
    if (this.isEnabled) {
      this.initializePerformanceObserver();
      this.initializeWebVitals();
    }
  }

  /**
   * Initialize Performance Observer for custom metrics
   */
  private initializePerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('DOM_CONTENT_LOADED', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
            this.recordMetric('PAGE_LOAD_COMPLETE', navEntry.loadEventEnd - navEntry.navigationStart);
            this.recordMetric('DNS_LOOKUP', navEntry.domainLookupEnd - navEntry.domainLookupStart);
            this.recordMetric('TCP_CONNECTION', navEntry.connectEnd - navEntry.connectStart);
            this.recordMetric('SERVER_RESPONSE', navEntry.responseEnd - navEntry.requestStart);
          }
        });
      });
      
      navObserver.observe({ entryTypes: ['navigation'] });

      // Observe resource timing for critical assets
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resource = entry as PerformanceResourceTiming;
          
          // Monitor critical CSS and JS files
          if (resource.name.includes('.css') || resource.name.includes('.js')) {
            this.recordMetric(`RESOURCE_LOAD_${this.getResourceType(resource.name)}`, resource.duration);
          }
        });
      });
      
      resourceObserver.observe({ entryTypes: ['resource'] });

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric(entry.name.toUpperCase().replace('-', '_'), entry.startTime);
        });
      });
      
      paintObserver.observe({ entryTypes: ['paint'] });

    } catch (error) {
      console.warn('Performance Observer initialization failed:', error);
    }
  }

  /**
   * Initialize Web Vitals monitoring
   */
  private initializeWebVitals() {
    if (typeof window === 'undefined') return;

    // Monitor CLS (Cumulative Layout Shift)
    this.observeWebVital('layout-shift', (entries) => {
      let clsValue = 0;
      for (const entry of entries) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      if (clsValue > 0) {
        this.recordWebVital({
          id: this.generateId(),
          name: 'CLS',
          value: clsValue,
          delta: clsValue,
          rating: this.getCLSRating(clsValue),
          navigationType: this.getNavigationType()
        });
      }
    });

    // Monitor LCP (Largest Contentful Paint)
    this.observeWebVital('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1] as any;
      if (lastEntry) {
        this.recordWebVital({
          id: this.generateId(),
          name: 'LCP',
          value: lastEntry.startTime,
          delta: lastEntry.startTime,
          rating: this.getLCPRating(lastEntry.startTime),
          navigationType: this.getNavigationType()
        });
      }
    });

    // Monitor FID (First Input Delay)
    this.observeWebVital('first-input', (entries) => {
      const firstEntry = entries[0] as any;
      if (firstEntry) {
        this.recordWebVital({
          id: this.generateId(),
          name: 'FID',
          value: firstEntry.processingStart - firstEntry.startTime,
          delta: firstEntry.processingStart - firstEntry.startTime,
          rating: this.getFIDRating(firstEntry.processingStart - firstEntry.startTime),
          navigationType: this.getNavigationType()
        });
      }
    });
  }

  /**
   * Observe specific web vital metric
   */
  private observeWebVital(type: string, callback: (entries: PerformanceEntry[]) => void) {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ entryTypes: [type] });
    } catch (error) {
      console.warn(`Failed to observe ${type}:`, error);
    }
  }

  /**
   * Record a custom performance metric
   */
  recordMetric(name: string, value: number, url?: string) {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: url || window.location.href,
      userAgent: navigator.userAgent
    };

    this.metrics.push(metric);

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`Performance: ${name} = ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Record a Web Vitals metric
   */
  private recordWebVital(metric: WebVitalsMetric) {
    this.vitalsMetrics.push(metric);

    // Log in development
    if (import.meta.env.DEV) {
      console.log(`Web Vital: ${metric.name} = ${metric.value.toFixed(2)} (${metric.rating})`);
    }

    // Send to analytics in production
    if (import.meta.env.PROD) {
      this.sendToAnalytics(metric);
    }
  }

  /**
   * Start timing a custom operation
   */
  startTiming(label: string): () => void {
    if (!this.isEnabled) return () => {};

    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric(label, endTime - startTime);
    };
  }

  /**
   * Measure React component render time
   */
  measureComponent(componentName: string) {
    if (!this.isEnabled) return { start: () => {}, end: () => {} };

    let startTime: number;

    return {
      start: () => {
        startTime = performance.now();
      },
      end: () => {
        const duration = performance.now() - startTime;
        this.recordMetric(`COMPONENT_RENDER_${componentName.toUpperCase()}`, duration);
      }
    };
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get Web Vitals metrics
   */
  getWebVitals(): WebVitalsMetric[] {
    return [...this.vitalsMetrics];
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const metrics = this.getMetrics();
    const vitals = this.getWebVitals();

    return {
      totalMetrics: metrics.length,
      vitalsMetrics: vitals.length,
      averagePageLoad: this.getAverageMetric('PAGE_LOAD_COMPLETE'),
      averageDOMContentLoaded: this.getAverageMetric('DOM_CONTENT_LOADED'),
      webVitals: {
        cls: vitals.find(v => v.name === 'CLS')?.value || 0,
        lcp: vitals.find(v => v.name === 'LCP')?.value || 0,
        fid: vitals.find(v => v.name === 'FID')?.value || 0
      },
      ratings: {
        good: vitals.filter(v => v.rating === 'good').length,
        needsImprovement: vitals.filter(v => v.rating === 'needs-improvement').length,
        poor: vitals.filter(v => v.rating === 'poor').length
      }
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics() {
    this.metrics = [];
    this.vitalsMetrics = [];
  }

  /**
   * Helper methods
   */
  private getResourceType(name: string): string {
    if (name.includes('.css')) return 'CSS';
    if (name.includes('.js')) return 'JS';
    if (name.includes('.woff') || name.includes('.ttf')) return 'FONT';
    if (name.includes('.jpg') || name.includes('.png') || name.includes('.svg')) return 'IMAGE';
    return 'OTHER';
  }

  private getAverageMetric(name: string): number {
    const matchingMetrics = this.metrics.filter(m => m.name === name);
    if (matchingMetrics.length === 0) return 0;
    
    const sum = matchingMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / matchingMetrics.length;
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getNavigationType(): string {
    if ('navigation' in performance) {
      return (performance as any).navigation.type === 0 ? 'navigate' : 'reload';
    }
    return 'unknown';
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sendToAnalytics(metric: WebVitalsMetric) {
    // In a real application, you would send this to your analytics service
    // Example: Google Analytics, DataDog, New Relic, etc.
    
    // For now, just store in localStorage for debugging
    try {
      const existing = localStorage.getItem('symbi_web_vitals') || '[]';
      const vitals = JSON.parse(existing);
      vitals.push(metric);
      
      // Keep only last 100 entries
      if (vitals.length > 100) {
        vitals.splice(0, vitals.length - 100);
      }
      
      localStorage.setItem('symbi_web_vitals', JSON.stringify(vitals));
    } catch (error) {
      console.warn('Failed to store web vitals:', error);
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export helper functions for React components
export const measureRender = (componentName: string) => {
  return performanceMonitor.measureComponent(componentName);
};

export const timeOperation = (operationName: string) => {
  return performanceMonitor.startTiming(operationName);
};

export const recordCustomMetric = (name: string, value: number) => {
  performanceMonitor.recordMetric(name, value);
};

export const getPerformanceSummary = () => {
  return performanceMonitor.getSummary();
};

// React Hook for performance monitoring
export const usePerformanceMonitoring = (componentName?: string) => {
  const measureComponent = () => {
    if (!componentName) return { start: () => {}, end: () => {} };
    return performanceMonitor.measureComponent(componentName);
  };

  const startTiming = (operationName: string) => {
    return performanceMonitor.startTiming(operationName);
  };

  const recordMetric = (name: string, value: number) => {
    performanceMonitor.recordMetric(name, value);
  };

  const getSummary = () => {
    return performanceMonitor.getSummary();
  };

  return {
    measureComponent,
    startTiming,
    recordMetric,
    getSummary
  };
};