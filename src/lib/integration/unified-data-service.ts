/**
 * Unified Data Service
 * Connects Resonance Lab experiments with Analytics Dashboard
 * Provides a single interface for all data operations
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface UnifiedExperiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'completed' | 'failed' | 'cancelled';
  sampleSize: number;
  confidenceLevel: number;
  budget: number;
  totalCost: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  variants: UnifiedVariant[];
  analytics: ExperimentAnalytics;
  symbiScores?: SymbiScores;
}

export interface UnifiedVariant {
  id: string;
  name: string;
  provider: string;
  model: string;
  systemPrompt?: string;
  performance: VariantPerformance;
}

export interface VariantPerformance {
  trialCount: number;
  avgScore: number;
  avgResponseTime: number;
  totalCost: number;
  successRate: number;
  scores: {
    coherence: number;
    accuracy: number;
    creativity: number;
    helpfulness: number;
    overall: number;
  };
}

export interface ExperimentAnalytics {
  totalTrials: number;
  completedTrials: number;
  failedTrials: number;
  avgScore: number;
  avgResponseTime: number;
  totalCost: number;
  successRate: number;
  costPerTrial: number;
  trendsOverTime: TrendData[];
}

export interface TrendData {
  date: string;
  avgScore: number;
  trialCount: number;
  cost: number;
}

export interface SymbiScores {
  selfOrganization: number;
  metaReflection: number;
  boundaryAwareness: number;
  integration: number;
  overall: number;
}

export class UnifiedDataService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get all experiments with full analytics
   */
  async getExperiments(): Promise<UnifiedExperiment[]> {
    const { data: experiments, error } = await this.supabase
      .from('experiments')
      .select(`
        *,
        variants (
          *,
          trials (
            id,
            status,
            response_time_ms,
            cost,
            trial_scores (
              criterion,
              score
            )
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return experiments.map((exp) => this.transformExperiment(exp));
  }

  /**
   * Get a single experiment with full details
   */
  async getExperiment(id: string): Promise<UnifiedExperiment> {
    const { data: experiment, error } = await this.supabase
      .from('experiments')
      .select(`
        *,
        variants (
          *,
          trials (
            id,
            status,
            response_time_ms,
            cost,
            tokens_used,
            trial_scores (
              criterion,
              score
            )
          )
        ),
        symbi_assessments (
          self_organization_score,
          meta_reflection_score,
          boundary_awareness_score,
          integration_score,
          overall_score
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    return this.transformExperiment(experiment);
  }

  /**
   * Get experiment results summary (from view)
   */
  async getExperimentsSummary() {
    const { data, error } = await this.supabase
      .from('experiment_results_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get variant performance comparison
   */
  async getVariantComparison(experimentId: string) {
    const { data, error } = await this.supabase
      .from('variant_performance')
      .select('*')
      .eq('experiment_id', experimentId);

    if (error) throw error;
    return data;
  }

  /**
   * Get SYMBI Framework trends over time
   */
  async getSymbiTrends(days: number = 30) {
    const { data, error } = await this.supabase
      .from('symbi_trends')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Link experiment to analytics data
   */
  async linkExperimentAnalytics(
    experimentId: string,
    metricName: string,
    metricValue: number,
    metricType: 'performance' | 'cost' | 'quality' | 'engagement'
  ) {
    const { data, error } = await this.supabase
      .from('experiment_analytics')
      .insert({
        experiment_id: experimentId,
        metric_name: metricName,
        metric_value: metricValue,
        metric_type: metricType,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Create SYMBI assessment for trial
   */
  async createSymbiAssessment(
    trialId: string,
    experimentId: string,
    scores: SymbiScores,
    contentText: string
  ) {
    const { data, error } = await this.supabase
      .from('symbi_assessments')
      .insert({
        trial_id: trialId,
        experiment_id: experimentId,
        content_text: contentText,
        self_organization_score: scores.selfOrganization,
        meta_reflection_score: scores.metaReflection,
        boundary_awareness_score: scores.boundaryAwareness,
        integration_score: scores.integration,
        overall_score: scores.overall,
      });

    if (error) throw error;
    return data;
  }

  /**
   * Get cross-referenced data (experiments + analytics)
   */
  async getCrossReferencedData(experimentId: string) {
    const [experiment, analytics, symbiData] = await Promise.all([
      this.getExperiment(experimentId),
      this.supabase
        .from('experiment_analytics')
        .select('*')
        .eq('experiment_id', experimentId),
      this.supabase
        .from('symbi_assessments')
        .select('*')
        .eq('experiment_id', experimentId),
    ]);

    return {
      experiment,
      analytics: analytics.data || [],
      symbiAssessments: symbiData.data || [],
    };
  }

  /**
   * Search across experiments and analytics
   */
  async globalSearch(query: string) {
    const { data: experiments, error: expError } = await this.supabase
      .from('experiments')
      .select('id, name, description, status')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    const { data: variants, error: varError } = await this.supabase
      .from('variants')
      .select('id, experiment_id, name, provider, model')
      .or(`name.ilike.%${query}%,provider.ilike.%${query}%,model.ilike.%${query}%`);

    return {
      experiments: experiments || [],
      variants: variants || [],
    };
  }

  /**
   * Export experiment data
   */
  async exportExperiment(experimentId: string, format: 'json' | 'csv') {
    const data = await this.getCrossReferencedData(experimentId);

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV format
      return this.convertToCSV(data);
    }
  }

  /**
   * Transform raw experiment data to unified format
   */
  private transformExperiment(raw: any): UnifiedExperiment {
    const variants = (raw.variants || []).map((v: any) => {
      const trials = v.trials || [];
      const completedTrials = trials.filter((t: any) => t.status === 'completed');

      // Calculate scores by criterion
      const scoresByCriterion: any = {};
      completedTrials.forEach((trial: any) => {
        (trial.trial_scores || []).forEach((score: any) => {
          if (!scoresByCriterion[score.criterion]) {
            scoresByCriterion[score.criterion] = [];
          }
          scoresByCriterion[score.criterion].push(score.score);
        });
      });

      const avgScores: any = {};
      Object.keys(scoresByCriterion).forEach((criterion) => {
        const scores = scoresByCriterion[criterion];
        avgScores[criterion] = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
      });

      return {
        id: v.id,
        name: v.name,
        provider: v.provider,
        model: v.model,
        systemPrompt: v.system_prompt,
        performance: {
          trialCount: trials.length,
          avgScore: avgScores.overall || 0,
          avgResponseTime: completedTrials.reduce((sum: number, t: any) => sum + (t.response_time_ms || 0), 0) / completedTrials.length || 0,
          totalCost: trials.reduce((sum: number, t: any) => sum + (t.cost || 0), 0),
          successRate: (completedTrials.length / trials.length) * 100 || 0,
          scores: {
            coherence: avgScores.coherence || 0,
            accuracy: avgScores.accuracy || 0,
            creativity: avgScores.creativity || 0,
            helpfulness: avgScores.helpfulness || 0,
            overall: avgScores.overall || 0,
          },
        },
      };
    });

    const allTrials = variants.flatMap((v: any) => v.performance.trialCount);
    const totalTrials = allTrials.reduce((a: number, b: number) => a + b, 0);

    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      status: raw.status,
      sampleSize: raw.sample_size,
      confidenceLevel: raw.confidence_level,
      budget: raw.budget,
      totalCost: raw.total_cost,
      createdAt: raw.created_at,
      startedAt: raw.started_at,
      completedAt: raw.completed_at,
      variants,
      analytics: {
        totalTrials,
        completedTrials: variants.reduce((sum: number, v: any) => sum + (v.performance.trialCount * v.performance.successRate / 100), 0),
        failedTrials: totalTrials - variants.reduce((sum: number, v: any) => sum + (v.performance.trialCount * v.performance.successRate / 100), 0),
        avgScore: variants.reduce((sum: number, v: any) => sum + v.performance.avgScore, 0) / variants.length || 0,
        avgResponseTime: variants.reduce((sum: number, v: any) => sum + v.performance.avgResponseTime, 0) / variants.length || 0,
        totalCost: raw.total_cost,
        successRate: variants.reduce((sum: number, v: any) => sum + v.performance.successRate, 0) / variants.length || 0,
        costPerTrial: raw.total_cost / totalTrials || 0,
        trendsOverTime: [],
      },
      symbiScores: raw.symbi_assessments?.[0] ? {
        selfOrganization: raw.symbi_assessments[0].self_organization_score,
        metaReflection: raw.symbi_assessments[0].meta_reflection_score,
        boundaryAwareness: raw.symbi_assessments[0].boundary_awareness_score,
        integration: raw.symbi_assessments[0].integration_score,
        overall: raw.symbi_assessments[0].overall_score,
      } : undefined,
    };
  }

  /**
   * Convert data to CSV format
   */
  private convertToCSV(data: any): string {
    // Implementation for CSV conversion
    const headers = ['Experiment', 'Variant', 'Score', 'Cost', 'Response Time'];
    const rows = [headers.join(',')];

    // Add data rows
    // ... CSV conversion logic

    return rows.join('\n');
  }
}