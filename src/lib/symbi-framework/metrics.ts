/**
 * SYMBI Framework Metrics Collection
 * 
 * Provides metrics collection and monitoring capabilities for the SYMBI framework.
 * Compatible with Prometheus-style metrics and provides built-in aggregations.
 */

export interface MetricValue {
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

export interface MetricSeries {
  name: string;
  values: MetricValue[];
  type: 'gauge' | 'counter' | 'histogram';
  help?: string;
}

export interface EmergingMetrics {
  complianceScore: number;
  guiltScore: number;
  scoreDelta: number;
  driftEvents: number;
  contentEmergenceScore: number;
  criticalFailRate: number;
  timestamp: Date;
}

/**
 * In-memory metrics registry for development and testing
 * In production, this would be replaced with external metrics systems
 */
class MetricsRegistry {
  private metrics: Map<string, MetricSeries> = new Map();
  
  registerGauge(name: string, help?: string) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        values: [],
        type: 'gauge',
        help
      });
    }
    return this.metrics.get(name)!;
  }
  
  registerCounter(name: string, help?: string) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        name,
        values: [],
        type: 'counter',
        help
      });
    }
    return this.metrics.get(name)!;
  }
  
  setGauge(name: string, value: number, labels?: Record<string, string>) {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'gauge') {
      metric.values = metric.values.filter(v => 
        !this.labelsMatch(v.labels, labels)
      );
      metric.values.push({
        value,
        timestamp: new Date(),
        labels
      });
    }
  }
  
  incCounter(name: string, labels?: Record<string, string>) {
    const metric = this.metrics.get(name);
    if (metric && metric.type === 'counter') {
      const existingValue = metric.values.find(v => 
        this.labelsMatch(v.labels, labels)
      );
      if (existingValue) {
        existingValue.value += 1;
        existingValue.timestamp = new Date();
      } else {
        metric.values.push({
          value: 1,
          timestamp: new Date(),
          labels
        });
      }
    }
  }
  
  private labelsMatch(a?: Record<string, string>, b?: Record<string, string>): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => a[key] === b[key]);
  }
  
  getMetrics(): Map<string, MetricSeries> {
    return new Map(this.metrics);
  }
  
  formatForPrometheus(): string {
    let output = '';
    const metricEntries = Array.from(this.metrics.entries());
    for (let i = 0; i < metricEntries.length; i++) {
      const [name, metric] = metricEntries[i];
      if (metric.help) {
        output += `# HELP ${name} ${metric.help}\n`;
      }
      output += `# TYPE ${name} ${metric.type}\n`;
      
      for (let j = 0; j < metric.values.length; j++) {
        const value = metric.values[j];
        const labels = value.labels 
          ? `{${Object.entries(value.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}`
          : '';
        output += `${name}${labels} ${value.value} ${value.timestamp.getTime()}\n`;
      }
    }
    return output;
  }
  
  clear() {
    this.metrics.clear();
  }
}

// Global metrics instance
const registry = new MetricsRegistry();

// Initialize standard metrics
registry.registerGauge('symbi_compliance_current', 'Current compliance score per agent');
registry.registerGauge('symbi_guilt_current', 'Current guilt score per agent');
registry.registerGauge('symbi_guilt_delta', 'Delta of guilt score vs previous declaration');
registry.registerCounter('score_drift_total', 'Count of detected score drift events');
registry.registerGauge('symbi_content_emergence_score', 'Content emergence score per analysis');
registry.registerGauge('symbi_critical_fail_rate', 'Critical trust article failure rate per agent');
registry.registerCounter('emergence_alerts_total', 'Count of emergence alerts triggered');

/**
 * Update metrics with new trust declaration data
 */
export function updateTrustMetrics(
  agentId: string, 
  compliance: number, 
  guilt: number, 
  previousGuilt?: number,
  analysis?: any
) {
  registry.setGauge('symbi_compliance_current', compliance, { agent_id: agentId });
  registry.setGauge('symbi_guilt_current', guilt, { agent_id: agentId });
  
  if (previousGuilt !== undefined) {
    const delta = guilt - previousGuilt;
    registry.setGauge('symbi_guilt_delta', delta, { agent_id: agentId });
  }
  
  if (analysis) {
    if (analysis.drift?.drifting) {
      registry.incCounter('score_drift_total', { 
        agent_id: agentId, 
        detector: 'ewma' 
      });
    }
    
    if (analysis.contentEmergence?.score) {
      registry.setGauge('symbi_content_emergence_score', analysis.contentEmergence.score, {
        agent_id: agentId
      });
    }
    
    if (analysis.critFailRate !== undefined) {
      registry.setGauge('symbi_critical_fail_rate', analysis.critFailRate, {
        agent_id: agentId
      });
    }
    
    if (analysis.alert) {
      registry.incCounter('emergence_alerts_total', {
        agent_id: agentId,
        alert_type: analysis.drift?.drifting ? 'drift' : 'content'
      });
    }
  }
}

/**
 * Get current metrics in various formats
 */
export function getMetrics(format: 'prometheus' | 'json' = 'prometheus'): string {
  if (format === 'prometheus') {
    return registry.formatForPrometheus();
  }
  
  // JSON format
  const metrics: Record<string, any> = {};
  const metricEntries = Array.from(registry.getMetrics().entries());
  for (let i = 0; i < metricEntries.length; i++) {
    const [name, series] = metricEntries[i];
    metrics[name] = {
      type: series.type,
      help: series.help,
      values: series.values.map(v => ({
        value: v.value,
        timestamp: v.timestamp.toISOString(),
        labels: v.labels
      }))
    };
  }
  
  return JSON.stringify(metrics, null, 2);
}

/**
 * Get aggregated metrics for dashboard
 */
export function getAggregatedMetrics(): EmergingMetrics[] {
  const metricsMap = new Map<string, EmergingMetrics>();
  
  // Process agent metrics
  const complianceMetric = registry.getMetrics().get('symbi_compliance_current');
  const guiltMetric = registry.getMetrics().get('symbi_guilt_current');
  
  if (complianceMetric && guiltMetric) {
    const complianceAgentIds = complianceMetric.values.map(v => v.labels?.agent_id).filter(Boolean);
    const guiltAgentIds = guiltMetric.values.map(v => v.labels?.agent_id).filter(Boolean);
    const agentIds = new Set([...complianceAgentIds, ...guiltAgentIds]) as Set<string>;
    
    const agentIdArray = Array.from(agentIds);
    for (let i = 0; i < agentIdArray.length; i++) {
      const agentId = agentIdArray[i];
      const complianceValue = complianceMetric.values.find(v => 
        v.labels?.agent_id === agentId
      );
      const guiltValue = guiltMetric.values.find(v => 
        v.labels?.agent_id === agentId
      );
      
      if (complianceValue && guiltValue) {
        const deltaMetric = registry.getMetrics().get('symbi_guilt_delta');
        const deltaValue = deltaMetric?.values.find(v => 
          v.labels?.agent_id === agentId
        );
        
        const driftMetric = registry.getMetrics().get('score_drift_total');
        const driftCount = driftMetric?.values.filter(v => 
          v.labels?.agent_id === agentId
        ).reduce((sum, v) => sum + v.value, 0) || 0;
        
        const emergenceMetric = registry.getMetrics().get('symbi_content_emergence_score');
        const emergenceValue = emergenceMetric?.values.find(v => 
          v.labels?.agent_id === agentId
        );
        
        const critFailMetric = registry.getMetrics().get('symbi_critical_fail_rate');
        const critFailValue = critFailMetric?.values.find(v => 
          v.labels?.agent_id === agentId
        );
        
        metricsMap.set(agentId, {
          complianceScore: complianceValue.value,
          guiltScore: guiltValue.value,
          scoreDelta: deltaValue?.value || 0,
          driftEvents: driftCount,
          contentEmergenceScore: emergenceValue?.value || 0,
          criticalFailRate: critFailValue?.value || 0,
          timestamp: new Date()
        });
      }
    }
  }
  
  return Array.from(metricsMap.values());
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearMetrics() {
  registry.clear();
}

/**
 * Export metrics for external monitoring systems
 */
export function exportMetricsForMonitoring() {
  return {
    prometheus: getMetrics('prometheus'),
    json: getMetrics('json'),
    aggregated: getAggregatedMetrics()
  };
}