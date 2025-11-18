/**
 * Performance Monitoring Service
 * Tracks application performance metrics and provides insights
 */

import { auditLogger, AuditEventType, AuditSeverity } from '../audit/enhanced-logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface PerformanceThreshold {
  warning: number;
  critical: number;
}

export class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds: Map<string, PerformanceThreshold> = new Map();
  private timers: Map<string, number> = new Map();

  constructor() {
    this.initializeThresholds();
  }

  /**
   * Initialize performance thresholds
   */
  private initializeThresholds(): void {
    this.thresholds.set('api_response_time', { warning: 200, critical: 1000 });
    this.thresholds.set('database_query_time', { warning: 50, critical: 200 });
    this.thresholds.set('memory_usage', { warning: 80, critical: 95 });
    this.thresholds.set('cpu_usage', { warning: 70, critical: 90 });
  }

  /**
   * Start a performance timer
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End a performance timer and record the metric
   */
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);
    
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      tags
    });

    return duration;
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    const metrics = this.metrics.get(metric.name) || [];
    metrics.push(metric);
    
    // Keep only last 1000 metrics per name
    if (metrics.length > 1000) {
      metrics.shift();
    }
    
    this.metrics.set(metric.name, metrics);

    // Check thresholds
    this.checkThreshold(metric);
  }

  /**
   * Check if metric exceeds thresholds
   */
  private checkThreshold(metric: PerformanceMetric): void {
    const threshold = this.thresholds.get(metric.name);
    
    if (!threshold) {
      return;
    }

    if (metric.value >= threshold.critical) {
      this.alertCritical(metric);
    } else if (metric.value >= threshold.warning) {
      this.alertWarning(metric);
    }
  }

  /**
   * Alert on critical threshold breach
   */
  private async alertCritical(metric: PerformanceMetric): Promise<void> {
    await auditLogger.log({
      eventType: AuditEventType.SYSTEM_ERROR,
      severity: AuditSeverity.CRITICAL,
      action: 'performance_threshold_critical',
      result: 'failure',
      details: {
        metric: metric.name,
        value: metric.value,
        unit: metric.unit,
        threshold: this.thresholds.get(metric.name)?.critical,
        tags: metric.tags
      }
    });
  }

  /**
   * Alert on warning threshold breach
   */
  private async alertWarning(metric: PerformanceMetric): Promise<void> {
    await auditLogger.log({
      eventType: AuditEventType.SYSTEM_WARNING,
      severity: AuditSeverity.WARNING,
      action: 'performance_threshold_warning',
      result: 'partial',
      details: {
        metric: metric.name,
        value: metric.value,
        unit: metric.unit,
        threshold: this.thresholds.get(metric.name)?.warning,
        tags: metric.tags
      }
    });
  }

  /**
   * Get metrics for a specific name
   */
  getMetrics(name: string, limit?: number): PerformanceMetric[] {
    const metrics = this.metrics.get(name) || [];
    return limit ? metrics.slice(-limit) : metrics;
  }

  /**
   * Get statistics for a metric
   */
  getStatistics(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  } | null {
    const metrics = this.metrics.get(name);
    
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    const count = values.length;

    return {
      count,
      min: values[0],
      max: values[count - 1],
      avg: values.reduce((sum, v) => sum + v, 0) / count,
      p50: values[Math.floor(count * 0.5)],
      p95: values[Math.floor(count * 0.95)],
      p99: values[Math.floor(count * 0.99)]
    };
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Clear metrics for a specific name
   */
  clearMetrics(name: string): void {
    this.metrics.delete(name);
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Set custom threshold
   */
  setThreshold(name: string, threshold: PerformanceThreshold): void {
    this.thresholds.set(name, threshold);
  }

  /**
   * Measure function execution time
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, tags);
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, error: 'true' });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measureSync<T>(
    name: string,
    fn: () => T,
    tags?: Record<string, string>
  ): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name, tags);
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, error: 'true' });
      throw error;
    }
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      
      this.recordMetric({
        name: 'memory_heap_used',
        value: usage.heapUsed,
        unit: 'bytes',
        timestamp: new Date()
      });

      this.recordMetric({
        name: 'memory_heap_total',
        value: usage.heapTotal,
        unit: 'bytes',
        timestamp: new Date()
      });

      this.recordMetric({
        name: 'memory_external',
        value: usage.external,
        unit: 'bytes',
        timestamp: new Date()
      });

      // Calculate percentage
      const percentage = (usage.heapUsed / usage.heapTotal) * 100;
      this.recordMetric({
        name: 'memory_usage',
        value: percentage,
        unit: 'percentage',
        timestamp: new Date()
      });
    }
  }

  /**
   * Start periodic memory monitoring
   */
  startMemoryMonitoring(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.recordMemoryUsage();
    }, intervalMs);
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheus(): string {
    const lines: string[] = [];

    for (const [name, metrics] of this.metrics.entries()) {
      if (metrics.length === 0) continue;

      const stats = this.getStatistics(name);
      if (!stats) continue;

      const metricName = name.replace(/[^a-zA-Z0-9_]/g, '_');
      
      lines.push(`# HELP ${metricName} Performance metric for ${name}`);
      lines.push(`# TYPE ${metricName} summary`);
      lines.push(`${metricName}_count ${stats.count}`);
      lines.push(`${metricName}_sum ${stats.avg * stats.count}`);
      lines.push(`${metricName}{quantile="0.5"} ${stats.p50}`);
      lines.push(`${metricName}{quantile="0.95"} ${stats.p95}`);
      lines.push(`${metricName}{quantile="0.99"} ${stats.p99}`);
    }

    return lines.join('\n');
  }

  /**
   * Export metrics as JSON
   */
  exportJSON(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const name of this.getMetricNames()) {
      result[name] = {
        statistics: this.getStatistics(name),
        recentMetrics: this.getMetrics(name, 10)
      };
    }

    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * Decorator for measuring method execution time
 */
export function Measure(metricName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      return performanceMonitor.measure(
        name,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}