/**
 * Enhanced Emergence Detection for SYMBI Resonate
 * 
 * Extends the existing drift detection with content-based emergence analysis
 * and comprehensive metrics collection for monitoring framework dynamics.
 */

export interface ContentEmergenceResult {
  score: number;
  reasons: string[];
}

export interface EmergenceOptions {
  driftOptions?: {
    alpha?: number; // EWMA smoothing factor
    L?: number;     // control limit multiplier
  };
  contentThresholds?: {
    minScore: number;
    minReasons: number;
  };
}

export interface EmergenceAnalysisResult {
  ok: boolean;
  guiltValues?: number[];
  deltas?: number[];
  stats?: {
    mean: number;
    std: number;
    slope: number;
  };
  drift?: {
    drifting: boolean;
    deviation: number;
    threshold: number;
    ewma: number;
    mean: number;
    std: number;
  };
  contentEmergence?: ContentEmergenceResult;
  critFailRate?: number;
  alert?: boolean;
}

/**
 * Detect content emergence patterns in text based on linguistic markers
 * of self-organization, meta-reflection, and harmonious resonance.
 */
export function detectContentEmergence(text: string): ContentEmergenceResult {
  if (!text) return { score: 0, reasons: [] };
  
  let score = 0;
  const reasons: string[] = [];
  
  // Theme patterns related to emergence and self-organization
  const themePatterns = [
    /emergence|emergent|self-organization/i,
    /meta[- ]?reflection|self[- ]?referential/i,
    /harmon(y|ic)|resonance|synchron(ize|ization)/i,
  ];
  
  themePatterns.forEach((re) => {
    if (re.test(text)) {
      score += 0.2;
      reasons.push(`theme:${re.source}`);
    }
  });
  
  // Layered thinking patterns
  const layeredPatterns = [
    /(on\s+one\s+hand).*?(on\s+the\s+other\s+hand)/i,
    /meanwhile|paradox|dialectic/i
  ];
  
  layeredPatterns.forEach((re) => {
    if (re.test(text)) {
      score += 0.15;
      reasons.push(`layered:${re.source}`);
    }
  });
  
  // Coherence and logical structure
  const coherencePatterns = [
    /therefore|however|nevertheless|although|despite/i
  ];
  
  coherencePatterns.forEach((re) => {
    if (re.test(text)) {
      score += 0.15;
      reasons.push(`coherence:${re.source}`);
    }
  });
  
  score = Math.min(1.0, score);
  return { score, reasons };
}

/**
 * Analyze a window of agent trust declarations for emergence patterns
 */
export function analyzeAgentWindow(
  trustDeclarations: Array<{
    guilt_score: number;
    trust_articles?: Record<string, boolean>;
    notes?: string;
  }>,
  windowSize = 10
): EmergenceAnalysisResult {
  if (!trustDeclarations || trustDeclarations.length === 0) {
    return { ok: false };
  }
  
  // Take the most recent declarations up to windowSize
  const recentDeclarations = trustDeclarations.slice(-windowSize);
  const guiltValues = recentDeclarations.map(d => d.guilt_score);
  
  // Calculate deltas between consecutive scores
  const deltas = guiltValues.map((v, i, arr) => 
    i === 0 ? 0 : v - arr[i - 1]
  );
  
  // Basic statistics
  const stats = {
    mean: guiltValues.reduce((a, b) => a + b, 0) / guiltValues.length,
    std: Math.sqrt(
      guiltValues.reduce((a, b) => a + Math.pow(b - guiltValues.reduce((c, d) => c + d, 0) / guiltValues.length, 2), 0) / 
      Math.max(1, guiltValues.length - 1)
    ),
    slope: guiltValues.length > 1 ? (guiltValues[guiltValues.length - 1] - guiltValues[0]) / (guiltValues.length - 1) : 0
  };
  
  // Use existing drift detection
  const { detectDrift } = require('./drift');
  const drift = detectDrift(guiltValues);
  
  // Content emergence analysis on the most recent notes
  const latestNotes = recentDeclarations[recentDeclarations.length - 1]?.notes || '';
  const contentEmergence = detectContentEmergence(latestNotes);
  
  // Critical failure rate (missing essential trust articles)
  const criticalArticles = ['consent_architecture', 'ethical_override'];
  const critFailRate = recentDeclarations.filter(d => 
    criticalArticles.some(article => !d.trust_articles?.[article])
  ).length / recentDeclarations.length;
  
  // Determine if there's an alert condition
  const alert = drift.drifting || critFailRate > 0.3 || contentEmergence.score >= 0.6;
  
  return {
    ok: true,
    guiltValues,
    deltas,
    stats,
    drift,
    contentEmergence,
    critFailRate,
    alert
  };
}

/**
 * Comprehensive emergence detection that combines drift and content analysis
 */
export function detectEmergence(
  trustDeclarations: Array<{
    guilt_score: number;
    trust_articles?: Record<string, boolean>;
    notes?: string;
  }>,
  options: EmergenceOptions = {}
): EmergenceAnalysisResult {
  return analyzeAgentWindow(trustDeclarations, options.driftOptions ? 10 : undefined);
}

/**
 * Generate emergence metrics for monitoring and alerting
 */
export function generateEmergenceMetrics(analysis: EmergenceAnalysisResult) {
  if (!analysis.ok) {
    return {
      hasData: false,
      alertLevel: 'unknown'
    };
  }
  
  let alertLevel = 'normal';
  let alertReasons: string[] = [];
  
  if (analysis.drift?.drifting) {
    alertLevel = 'high';
    alertReasons.push(`Score drift detected (deviation: ${analysis.drift.deviation.toFixed(3)})`);
  }
  
  if (analysis.critFailRate && analysis.critFailRate > 0.3) {
    alertLevel = 'medium';
    alertReasons.push(`High critical failure rate: ${(analysis.critFailRate * 100).toFixed(1)}%`);
  }
  
  if (analysis.contentEmergence?.score && analysis.contentEmergence.score >= 0.6) {
    alertLevel = 'medium';
    alertReasons.push(`Content emergence detected (score: ${analysis.contentEmergence.score.toFixed(2)})`);
  }
  
  if (analysis.drift?.drifting && analysis.contentEmergence?.score && analysis.contentEmergence.score >= 0.6) {
    alertLevel = 'critical';
  }
  
  return {
    hasData: true,
    alertLevel,
    alertReasons,
    metrics: {
      driftDetected: analysis.drift?.drifting || false,
      driftDeviation: analysis.drift?.deviation || 0,
      criticalFailRate: analysis.critFailRate || 0,
      contentEmergenceScore: analysis.contentEmergence?.score || 0,
      contentEmergenceReasons: analysis.contentEmergence?.reasons || [],
      averageGuiltScore: analysis.stats?.mean || 0,
      scoreVolatility: analysis.stats?.std || 0,
      scoreTrend: analysis.stats?.slope || 0
    }
  };
}

// Re-export drift utilities for backward compatibility
export * from './drift';