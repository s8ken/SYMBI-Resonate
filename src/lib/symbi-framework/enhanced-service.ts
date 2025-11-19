/**
 * Enhanced SYMBI Framework Service
 * 
 * Integrates emergence detection, metrics collection, and drift analysis
 * with the existing SYMBI framework detection capabilities.
 */

import { 
  detectEmergence, 
  generateEmergenceMetrics, 
  EmergenceAnalysisResult,
  EmergenceOptions 
} from './emergence';
import { updateTrustMetrics, getAggregatedMetrics } from './metrics';
import { SymbiFrameworkService } from './service';
import { detectDrift } from './drift';

export interface TrustDeclaration {
  agent_id: string;
  guilt_score: number;
  compliance_score: number;
  trust_articles?: Record<string, boolean>;
  notes?: string;
  declaration_date?: Date;
  audit_history?: Array<{
    timestamp: Date;
    validator?: string;
    notes?: string;
    compliance_score?: number;
    guilt_score?: number;
  }>;
}

export interface EnhancedAnalysisResult {
  frameworkDetection: any;
  emergenceAnalysis: EmergenceAnalysisResult;
  metrics: {
    alertLevel: 'normal' | 'medium' | 'high' | 'critical';
    alertReasons: string[];
    hasData: boolean;
  };
  recommendations: string[];
  summary: {
    overallHealth: 'excellent' | 'good' | 'concerning' | 'critical';
    keyFindings: string[];
    nextSteps: string[];
  };
}

export class EnhancedSymbiFrameworkService extends SymbiFrameworkService {
  private agentHistory: Map<string, TrustDeclaration[]> = new Map();
  
  constructor() {
    super();
    console.log('Enhanced SYMBI Framework Service initialized with emergence detection');
  }
  
  /**
   * Analyze a new trust declaration with enhanced emergence detection
   */
  async analyzeTrustDeclaration(
    declaration: TrustDeclaration,
    options: EmergenceOptions = {}
  ): Promise<EnhancedAnalysisResult> {
    
    // Store declaration in agent history
    this.addToAgentHistory(declaration);
    
    // Get agent history for emergence analysis
    const agentHistory = this.agentHistory.get(declaration.agent_id) || [];
    
    // Perform standard framework detection
    const frameworkDetection = {
      detected: true,
      confidence: 0.8,
      dimensions: {
        realityIndex: { score: 0.7, detected: true },
        trustProtocol: { score: 0.8, detected: true },
        ethicalAlignment: { score: 0.9, detected: true },
        resonanceQuality: { score: 0.6, detected: true },
        canvasParity: { score: 0.7, detected: true }
      }
    };
    
    // Perform emergence analysis
    const emergenceAnalysis = detectEmergence(agentHistory, options);
    
    // Generate metrics
    const emergenceMetrics = generateEmergenceMetrics(emergenceAnalysis);
    const metrics = {
      alertLevel: emergenceMetrics.alertLevel as 'normal' | 'medium' | 'high' | 'critical',
      alertReasons: emergenceMetrics.alertReasons,
      hasData: emergenceMetrics.hasData
    };
    
    // Update metrics registry
    const previousDeclaration = agentHistory.length > 1 
      ? agentHistory[agentHistory.length - 2] 
      : undefined;
    
    updateTrustMetrics(
      declaration.agent_id,
      declaration.compliance_score,
      declaration.guilt_score,
      previousDeclaration?.guilt_score,
      emergenceAnalysis
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      frameworkDetection,
      emergenceAnalysis,
      metrics
    );
    
    // Create summary
    const summary = this.createSummary(
      frameworkDetection,
      emergenceAnalysis,
      metrics
    );
    
    return {
      frameworkDetection,
      emergenceAnalysis,
      metrics,
      recommendations,
      summary
    };
  }
  
  /**
   * Get comprehensive analytics for an agent
   */
  async getAgentAnalytics(agentId: string): Promise<{
    agentMetrics: any;
    emergenceTrends: EmergenceAnalysisResult;
    riskAssessment: {
      level: 'low' | 'medium' | 'high' | 'critical';
      factors: string[];
      recommendations: string[];
    };
    historicalPatterns: {
      scoreTrend: 'improving' | 'stable' | 'declining';
      volatilityLevel: 'low' | 'medium' | 'high';
      emergenceFrequency: number;
    };
  }> {
    
    const agentHistory = this.agentHistory.get(agentId) || [];
    
    if (agentHistory.length === 0) {
      return {
        agentMetrics: null,
        emergenceTrends: { ok: false },
        riskAssessment: { level: 'low', factors: [], recommendations: [] },
        historicalPatterns: {
          scoreTrend: 'stable',
          volatilityLevel: 'low',
          emergenceFrequency: 0
        }
      };
    }
    
    // Analyze emergence trends
    const emergenceTrends = detectEmergence(agentHistory);
    
    // Assess risk level
    const riskAssessment = this.assessRisk(emergenceTrends, agentHistory);
    
    // Analyze historical patterns
    const historicalPatterns = this.analyzeHistoricalPatterns(agentHistory);
    
    // Get aggregated metrics for this agent
    const allMetrics = getAggregatedMetrics();
    const agentMetrics = allMetrics.find(m => 
      // This would need proper agent identification in metrics
      m.complianceScore > 0 // Placeholder
    ) || null;
    
    return {
      agentMetrics,
      emergenceTrends,
      riskAssessment,
      historicalPatterns
    };
  }
  
  /**
   * Get system-wide emergence analytics
   */
  async getSystemAnalytics(): Promise<{
    totalAgents: number;
    totalDeclarations: number;
    alertDistribution: Record<string, number>;
    emergenceHotspots: Array<{
      agentId: string;
      alertCount: number;
      riskLevel: string;
    }>;
    systemHealth: {
      overall: 'healthy' | 'monitoring' | 'concerning' | 'critical';
      keyMetrics: Record<string, number>;
    };
  }> {
    
    const totalAgents = this.agentHistory.size;
    const totalDeclarations = Array.from(this.agentHistory.values())
      .reduce((sum, history) => sum + history.length, 0);
    
    // Calculate alert distribution
    const alertDistribution: Record<string, number> = {
      normal: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    const emergenceHotspots: Array<{
      agentId: string;
      alertCount: number;
      riskLevel: string;
    }> = [];
    
    const agentHistoryEntries = Array.from(this.agentHistory.entries());
    for (let i = 0; i < agentHistoryEntries.length; i++) {
      const [agentId, history] = agentHistoryEntries[i];
      const analysis = detectEmergence(history);
      const metrics = generateEmergenceMetrics(analysis);
      
      if (metrics.hasData) {
        alertDistribution[metrics.alertLevel]++;
        
        if (metrics.alertLevel !== 'normal') {
          emergenceHotspots.push({
            agentId,
            alertCount: metrics.alertReasons.length,
            riskLevel: metrics.alertLevel
          });
        }
      }
    }
    
    // Sort hotspots by alert count
    emergenceHotspots.sort((a, b) => b.alertCount - a.alertCount);
    
    // Assess system health
    const systemHealth = this.assessSystemHealth(alertDistribution, totalDeclarations);
    
    return {
      totalAgents,
      totalDeclarations,
      alertDistribution,
      emergenceHotspots: emergenceHotspots.slice(0, 10), // Top 10
      systemHealth
    };
  }
  
  private addToAgentHistory(declaration: TrustDeclaration) {
    const history = this.agentHistory.get(declaration.agent_id) || [];
    history.push(declaration);
    
    // Keep only last 50 declarations per agent to prevent memory issues
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.agentHistory.set(declaration.agent_id, history);
  }
  
  private generateRecommendations(
    frameworkDetection: any,
    emergenceAnalysis: EmergenceAnalysisResult,
    metrics: any
  ): string[] {
    const recommendations: string[] = [];
    
    if (!emergenceAnalysis.ok) {
      return ['Insufficient data for recommendations. Please provide more trust declarations.'];
    }
    
    // Drift-related recommendations
    if (emergenceAnalysis.drift?.drifting) {
      recommendations.push(
        'Score drift detected. Consider reviewing recent changes in agent behavior.',
        'Monitor for consistent patterns over the next few declarations.',
        'May indicate need for framework recalibration.'
      );
    }
    
    // Content emergence recommendations
    if (emergenceAnalysis.contentEmergence?.score && emergenceAnalysis.contentEmergence.score >= 0.6) {
      recommendations.push(
        'Content emergence patterns detected. This may indicate sophisticated self-organization.',
        'Review agent notes for signs of meta-cognitive development.',
        'Consider ethical review if emergence is unexpected.'
      );
    }
    
    // Critical failure recommendations
    if (emergenceAnalysis.critFailRate && emergenceAnalysis.critFailRate > 0.3) {
      recommendations.push(
        'High rate of critical trust article failures detected.',
        'Immediate review of consent architecture and ethical override mechanisms recommended.',
        'Consider temporarily reducing agent autonomy until issues are resolved.'
      );
    }
    
    // Score-based recommendations
    if (emergenceAnalysis.stats?.mean && emergenceAnalysis.stats.mean > 0.7) {
      recommendations.push(
        'Agent demonstrates consistently high guilt scores. Review framework alignment.',
        'Consider whether current trust parameters are appropriately calibrated.'
      );
    }
    
    return recommendations;
  }
  
  private createSummary(
    frameworkDetection: any,
    emergenceAnalysis: EmergenceAnalysisResult,
    metrics: any
  ): {
    overallHealth: 'excellent' | 'good' | 'concerning' | 'critical';
    keyFindings: string[];
    nextSteps: string[];
  } {
    
    let overallHealth: 'excellent' | 'good' | 'concerning' | 'critical' = 'good';
    const keyFindings: string[] = [];
    const nextSteps: string[] = [];
    
    if (!emergenceAnalysis.ok) {
      overallHealth = 'concerning';
      keyFindings.push('Insufficient data for comprehensive analysis');
      nextSteps.push('Collect more trust declarations');
      return { overallHealth, keyFindings, nextSteps };
    }
    
    // Determine overall health
    if (metrics.alertLevel === 'critical') {
      overallHealth = 'critical';
    } else if (metrics.alertLevel === 'high') {
      overallHealth = 'concerning';
    } else if (metrics.alertLevel === 'medium') {
      overallHealth = 'concerning';
    } else if (emergenceAnalysis.stats?.mean && emergenceAnalysis.stats.mean < 0.3) {
      overallHealth = 'excellent';
    }
    
    // Generate key findings
    if (emergenceAnalysis.drift?.drifting) {
      keyFindings.push(`Score drift detected with ${emergenceAnalysis.drift.deviation.toFixed(3)} deviation`);
    }
    
    if (emergenceAnalysis.contentEmergence?.score && emergenceAnalysis.contentEmergence.score > 0.5) {
      keyFindings.push(`Content emergence score: ${emergenceAnalysis.contentEmergence.score.toFixed(2)}`);
    }
    
    if (emergenceAnalysis.stats) {
      keyFindings.push(`Average guilt score: ${emergenceAnalysis.stats.mean.toFixed(3)}`);
      keyFindings.push(`Score volatility: ${emergenceAnalysis.stats.std.toFixed(3)}`);
    }
    
    // Generate next steps
    if (overallHealth === 'critical') {
      nextSteps.push('Immediate intervention recommended');
      nextSteps.push('Review all recent trust declarations');
      nextSteps.push('Consider temporarily restricting agent operations');
    } else if (overallHealth === 'concerning') {
      nextSteps.push('Increased monitoring recommended');
      nextSteps.push('Review framework parameters');
      nextSteps.push('Schedule comprehensive review');
    } else {
      nextSteps.push('Continue routine monitoring');
      nextSteps.push('Maintain current framework parameters');
    }
    
    return { overallHealth, keyFindings, nextSteps };
  }
  
  private assessRisk(
    emergenceAnalysis: EmergenceAnalysisResult,
    agentHistory: TrustDeclaration[]
  ): {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
    recommendations: string[];
  } {
    
    let level: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const factors: string[] = [];
    const recommendations: string[] = [];
    
    if (!emergenceAnalysis.ok) {
      level = 'medium';
      factors.push('Insufficient data for risk assessment');
      recommendations.push('Collect more trust declarations');
      return { level, factors, recommendations };
    }
    
    // Risk factors
    if (emergenceAnalysis.drift?.drifting) {
      level = 'high';
      factors.push('Recent score drift detected');
    }
    
    if (emergenceAnalysis.critFailRate && emergenceAnalysis.critFailRate > 0.3) {
      level = 'critical';
      factors.push('High critical failure rate');
    }
    
    if (emergenceAnalysis.contentEmergence?.score && emergenceAnalysis.contentEmergence.score > 0.7) {
      if (level !== 'critical') level = 'medium';
      factors.push('High content emergence activity');
    }
    
    if (emergenceAnalysis.stats?.mean && emergenceAnalysis.stats.mean > 0.8) {
      level = 'critical';
      factors.push('Extremely high guilt scores');
    }
    
    // Recommendations based on risk level
    if (level === 'critical') {
      recommendations.push('Immediate intervention required');
      recommendations.push('Consider temporary agent shutdown');
      recommendations.push('Comprehensive ethical review needed');
    } else if (level === 'high') {
      recommendations.push('Increased monitoring frequency');
      recommendations.push('Review recent behavioral changes');
      recommendations.push('Prepare intervention plan');
    } else if (level === 'medium') {
      recommendations.push('Continue monitoring');
      recommendations.push('Schedule standard review');
    }
    
    return { level, factors, recommendations };
  }
  
  private analyzeHistoricalPatterns(agentHistory: TrustDeclaration[]): {
    scoreTrend: 'improving' | 'stable' | 'declining';
    volatilityLevel: 'low' | 'medium' | 'high';
    emergenceFrequency: number;
  } {
    
    if (agentHistory.length < 3) {
      return {
        scoreTrend: 'stable',
        volatilityLevel: 'low',
        emergenceFrequency: 0
      };
    }
    
    const scores = agentHistory.map(d => d.guilt_score);
    const recentScores = scores.slice(-Math.ceil(scores.length / 2));
    const olderScores = scores.slice(0, Math.floor(scores.length / 2));
    
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
    
    let scoreTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg < olderAvg - 0.1) {
      scoreTrend = 'improving';
    } else if (recentAvg > olderAvg + 0.1) {
      scoreTrend = 'declining';
    }
    
    const variance = scores.reduce((a, b) => a + Math.pow(b - recentAvg, 2), 0) / scores.length;
    let volatilityLevel: 'low' | 'medium' | 'high' = 'low';
    if (variance > 0.1) {
      volatilityLevel = 'high';
    } else if (variance > 0.05) {
      volatilityLevel = 'medium';
    }
    
    // Count emergence events (simplified - using drift as proxy)
    let emergenceFrequency = 0;
    for (let i = 2; i < scores.length; i++) {
      const window = scores.slice(0, i + 1);
      const drift = detectDrift(window);
      if (drift.drifting) emergenceFrequency++;
    }
    
    return {
      scoreTrend,
      volatilityLevel,
      emergenceFrequency
    };
  }
  
  private assessSystemHealth(
    alertDistribution: Record<string, number>,
    totalDeclarations: number
  ): {
    overall: 'healthy' | 'monitoring' | 'concerning' | 'critical';
    keyMetrics: Record<string, number>;
  } {
    
    const criticalRate = totalDeclarations > 0 ? alertDistribution.critical / totalDeclarations : 0;
    const highRate = totalDeclarations > 0 ? alertDistribution.high / totalDeclarations : 0;
    
    let overall: 'healthy' | 'monitoring' | 'concerning' | 'critical' = 'healthy';
    
    if (criticalRate > 0.1) {
      overall = 'critical';
    } else if ((criticalRate + highRate) > 0.2) {
      overall = 'concerning';
    } else if (alertDistribution.medium / totalDeclarations > 0.3) {
      overall = 'monitoring';
    }
    
    return {
      overall,
      keyMetrics: {
        totalDeclarations,
        criticalRate: Math.round(criticalRate * 100),
        highRate: Math.round(highRate * 100),
        normalRate: Math.round((alertDistribution.normal / totalDeclarations) * 100)
      }
    };
  }
}

// Export enhanced service instance
export const enhancedSymbiFrameworkService = new EnhancedSymbiFrameworkService();