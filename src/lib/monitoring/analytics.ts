/**
 * Analytics Service
 * Tracks user interactions and events
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: string;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  role?: string;
  organization?: string;
  [key: string]: any;
}

export class Analytics {
  private static instance: Analytics;
  private isInitialized = false;
  private userProperties: UserProperties = {};

  private constructor() {}

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Initialize analytics
   */
  initialize(config: {
    trackingId?: string;
    debug?: boolean;
  }) {
    if (this.isInitialized) {
      console.warn('Analytics already initialized');
      return;
    }

    // In production, initialize analytics service (e.g., Google Analytics, Mixpanel)
    // Example for Google Analytics:
    // gtag('config', config.trackingId);

    this.isInitialized = true;
    console.log('Analytics initialized');
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string) {
    if (!this.isInitialized) {
      return;
    }

    const event: AnalyticsEvent = {
      name: 'page_view',
      properties: {
        path,
        title: title || document.title,
        referrer: document.referrer,
      },
      timestamp: new Date().toISOString(),
    };

    this.sendEvent(event);
  }

  /**
   * Track custom event
   */
  trackEvent(name: string, properties?: Record<string, any>) {
    if (!this.isInitialized) {
      return;
    }

    const event: AnalyticsEvent = {
      name,
      properties: {
        ...properties,
        ...this.userProperties,
      },
      timestamp: new Date().toISOString(),
    };

    this.sendEvent(event);
  }

  /**
   * Track experiment creation
   */
  trackExperimentCreated(experimentId: string, variantCount: number, sampleSize: number) {
    this.trackEvent('experiment_created', {
      experimentId,
      variantCount,
      sampleSize,
    });
  }

  /**
   * Track experiment completion
   */
  trackExperimentCompleted(experimentId: string, duration: number, cost: number) {
    this.trackEvent('experiment_completed', {
      experimentId,
      duration,
      cost,
    });
  }

  /**
   * Track search
   */
  trackSearch(query: string, resultCount: number) {
    this.trackEvent('search', {
      query,
      resultCount,
    });
  }

  /**
   * Track export
   */
  trackExport(format: string, experimentId: string) {
    this.trackEvent('export', {
      format,
      experimentId,
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>) {
    this.trackEvent('error', {
      errorName: error.name,
      errorMessage: error.message,
      ...context,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };

    // In production, send to analytics service
    // Example for Google Analytics:
    // gtag('set', 'user_properties', properties);
  }

  /**
   * Identify user
   */
  identifyUser(userId: string, properties?: UserProperties) {
    this.userProperties = {
      userId,
      ...properties,
    };

    // In production, identify user in analytics service
    // Example for Mixpanel:
    // mixpanel.identify(userId);
    // mixpanel.people.set(properties);
  }

  /**
   * Reset user
   */
  resetUser() {
    this.userProperties = {};

    // In production, reset user in analytics service
    // Example for Mixpanel:
    // mixpanel.reset();
  }

  /**
   * Send event to analytics service
   */
  private sendEvent(event: AnalyticsEvent) {
    console.log('Analytics Event:', event);

    // In production, send to analytics service
    // Example for Google Analytics:
    // gtag('event', event.name, event.properties);

    // Example for Mixpanel:
    // mixpanel.track(event.name, event.properties);
  }
}

/**
 * React hook for analytics
 */
export function useAnalytics() {
  const analytics = Analytics.getInstance();

  return {
    trackEvent: (name: string, properties?: Record<string, any>) =>
      analytics.trackEvent(name, properties),
    trackPageView: (path: string, title?: string) =>
      analytics.trackPageView(path, title),
    trackExperimentCreated: (experimentId: string, variantCount: number, sampleSize: number) =>
      analytics.trackExperimentCreated(experimentId, variantCount, sampleSize),
    trackExperimentCompleted: (experimentId: string, duration: number, cost: number) =>
      analytics.trackExperimentCompleted(experimentId, duration, cost),
    trackSearch: (query: string, resultCount: number) =>
      analytics.trackSearch(query, resultCount),
    trackExport: (format: string, experimentId: string) =>
      analytics.trackExport(format, experimentId),
  };
}

// Export singleton instance
export const analytics = Analytics.getInstance();