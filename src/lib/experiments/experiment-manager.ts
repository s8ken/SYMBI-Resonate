/**
 * Experiment Manager
 * Main entry point for the SYMBI Resonate experiment system
 * Coordinates all components and provides high-level API
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ExperimentConfig,
  ExperimentRun,
  Trial,
  Evaluation,
  ExportConfig,
  StatisticalResult,
  ExperimentError,
} from './types';
import { ExperimentOrchestrator } from './orchestrator';
import { InMemoryAgentBus } from './agent-bus';
import { TokenBucketRateLimiter } from './rate-limiter';

/**
 * Experiment Manager
 * High-level API for managing experiments
 */
export class ExperimentManager {
  private orchestrator: ExperimentOrchestrator;
  private rateLimiter: TokenBucketRateLimiter;
  private experiments: Map<string, ExperimentConfig> = new Map();

  constructor() {
    const agentBus = new InMemoryAgentBus();
    this.orchestrator = new ExperimentOrchestrator(agentBus);
    
    // Default rate limits for common providers
    this.rateLimiter = new TokenBucketRateLimiter({
      'openai': { maxRequestsPerMin: 60, maxTokensPerMin: 90000 },
      'anthropic': { maxRequestsPerMin: 60, maxTokensPerMin: 40000 },
      'google': { maxRequestsPerMin: 60, maxTokensPerMin: 60000 },
      'default': { maxRequestsPerMin: 30, maxTokensPerMin: 30000 },
    });
  }

  /**
   * Create a new experiment configuration
   */
  async createExperiment(config: Omit<ExperimentConfig, 'createdBy' | 'createdAt' | 'updatedAt'>): Promise<ExperimentConfig> {
    const fullConfig: ExperimentConfig = {
      ...config,
      createdBy: 'system', // Would come from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Validate configuration
    this.validateExperimentConfig(fullConfig);

    // Store experiment
    this.experiments.set(fullConfig.name, fullConfig);

    return fullConfig;
  }

  /**
   * Start an experiment run
   */
  async startExperiment(experimentName: string): Promise<ExperimentRun> {
    const config = this.experiments.get(experimentName);
    if (!config) {
      throw new ExperimentError("Experiment not found", "EXPERIMENT_NOT_FOUND", experimentName);
    }

    // Check budget constraints
    await this.checkBudgetConstraints(config);

    // Start the experiment
    return this.orchestrator.startExperiment(config);
  }

  /**
   * Get experiment status
   */
  async getExperimentStatus(experimentName: string): Promise<{
    config: ExperimentConfig;
    activeRuns: ExperimentRun[];
    recentRuns: ExperimentRun[];
  }> {
    const config = this.experiments.get(experimentName);
    if (!config) {
      throw new ExperimentError("Experiment not found", "EXPERIMENT_NOT_FOUND", experimentName);
    }

    const activeRuns = this.orchestrator.getActiveRuns().filter(
      run => run.experimentId === experimentName
    );

    return {
      config,
      activeRuns,
      recentRuns: activeRuns.slice(-5), // Last 5 runs
    };
  }

  /**
   * Get run results
   */
  async getRunResults(runId: string): Promise<{
    run: ExperimentRun;
    trials: Trial[];
    statistics: StatisticalResult[];
  }> {
    const run = this.orchestrator.getRun(runId);
    if (!run) {
      throw new ExperimentError("Run not found", "RUN_NOT_FOUND", undefined, runId);
    }

    // For v1, we'll simulate trial data
    const trials = this.simulateTrials(run);
    const statistics = this.calculateStatistics(trials);

    return {
      run,
      trials,
      statistics,
    };
  }

  /**
   * Export experiment data
   */
  async exportExperimentData(
    experimentName: string, 
    config: ExportConfig
  ): Promise<{
    data: any;
    format: string;
    integrityHash: string;
  }> {
    const experimentData = await this.getExperimentStatus(experimentName);
    
    // Prepare export data based on config
    let exportData: any = {
      experiment: experimentData.config,
      runs: experimentData.recentRuns,
      exportedAt: new Date().toISOString(),
      format: config.format,
    };

    if (config.includeRawData) {
      // Would include raw trial data
      exportData.trials = [];
    }

    if (config.includeEvaluations) {
      // Would include evaluation data
      exportData.evaluations = [];
    }

    if (config.includeSymbiScores) {
      // Would include SYMBI dimension scores
      exportData.symbiScores = [];
    }

    if (config.includeIntegrityHashes) {
      // Calculate integrity hash
      exportData.integrityHash = this.calculateExportIntegrityHash(exportData);
    }

    if (config.anonymizePII) {
      // Apply PII anonymization
      exportData = this.anonymizePII(exportData);
    }

    return {
      data: exportData,
      format: config.format,
      integrityHash: exportData.integrityHash || '',
    };
  }

  /**
   * Cancel an active run
   */
  async cancelRun(runId: string): Promise<void> {
    await this.orchestrator.cancelRun(runId);
  }

  /**
   * Get rate limit status
   */
  async getRateLimitStatus(provider: string): Promise<{
    requestsRemaining: number;
    tokensRemaining: number;
    resetAt: string;
  }> {
    return this.rateLimiter.getStatus(provider);
  }

  /**
   * Validate experiment configuration
   */
  private validateExperimentConfig(config: ExperimentConfig): void {
    if (!config.name || config.name.trim().length === 0) {
      throw new ExperimentError("Experiment name is required", "INVALID_CONFIG");
    }

    if (!config.variants || config.variants.length < 2) {
      throw new ExperimentError("At least 2 variants required", "INVALID_CONFIG");
    }

    if (!config.tasks || config.tasks.length === 0) {
      throw new ExperimentError("At least 1 task required", "INVALID_CONFIG");
    }

    if (!config.evaluationCriteria || config.evaluationCriteria.length === 0) {
      throw new ExperimentError("At least 1 evaluation criterion required", "INVALID_CONFIG");
    }

    if (!config.symbiDimensions || config.symbiDimensions.length === 0) {
      throw new ExperimentError("At least 1 SYMBI dimension required", "INVALID_CONFIG");
    }

    // Validate variants
    for (const variant of config.variants) {
      if (!variant.id || !variant.name) {
        throw new ExperimentError("Variant ID and name are required", "INVALID_CONFIG");
      }
      if (!variant.provider || !variant.model) {
        throw new ExperimentError("Variant provider and model are required", "INVALID_CONFIG");
      }
    }

    // Validate tasks
    for (const task of config.tasks) {
      if (!task.id || !task.content) {
        throw new ExperimentError("Task ID and content are required", "INVALID_CONFIG");
      }
    }
  }

  /**
   * Check budget constraints
   */
  private async checkBudgetConstraints(config: ExperimentConfig): Promise<void> {
    if (config.maxCostUsd) {
      // Would check current spending against budget
      // For now, just validate it's a positive number
      if (config.maxCostUsd <= 0) {
        throw new ExperimentError("Max cost must be positive", "INVALID_BUDGET");
      }
    }
  }

  /**
   * Calculate export integrity hash
   */
  private calculateExportIntegrityHash(data: any): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Anonymize PII from export data
   */
  private anonymizePII(data: any): any {
    // Simple anonymization for v1
    // Would implement more sophisticated PII detection in production
    const anonymized = JSON.parse(JSON.stringify(data));
    
    // Remove obvious PII patterns
    const piiPatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
      /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
      /\b\d{3}-\d{3}-\d{4}\b/g, // Phone
    ];

    const anonymizeString = (str: string): string => {
      let result = str;
      for (const pattern of piiPatterns) {
        result = result.replace(pattern, '[REDACTED]');
      }
      return result;
    };

    const processObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return anonymizeString(obj);
      } else if (Array.isArray(obj)) {
        return obj.map(processObject);
      } else if (typeof obj === 'object' && obj !== null) {
        const processed: any = {};
        for (const [key, value] of Object.entries(obj)) {
          processed[key] = processObject(value);
        }
        return processed;
      }
      return obj;
    };

    return processObject(anonymized);
  }

  /**
   * Simulate trial data for v1
   */
  private simulateTrials(run: ExperimentRun): Trial[] {
    // Generate mock trial data for development
    const trials: Trial[] = [];
    
    for (let i = 0; i < run.totalTrials; i++) {
      const slotMapping = { A: 'variant-1', B: 'variant-2' };
      const outputs = {
        A: `Response A for task ${i + 1}`,
        B: `Response B for task ${i + 1}`,
      };

      trials.push({
        id: `trial-${run.id}-${i}`,
        runId: run.id,
        experimentId: run.experimentId,
        taskId: `task-${i + 1}`,
        status: "COMPLETED",
        slotMapping,
        outputs,
        evaluations: [{
          id: `eval-${run.id}-${i}`,
          trialId: `trial-${run.id}-${i}`,
          evaluatorType: "AI",
          winnerSlot: Math.random() > 0.5 ? "A" : "B",
          scores: {
            A: Math.random() * 10,
            B: Math.random() * 10,
          },
          evaluatedAt: new Date().toISOString(),
          confidence: 0.8 + Math.random() * 0.2,
        }],
        createdAt: new Date().toISOString(),
      });
    }

    return trials;
  }

  /**
   * Calculate statistics from trials
   */
  private calculateStatistics(trials: Trial[]): StatisticalResult[] {
    const variantStats: Record<string, { wins: number; losses: number; ties: number; total: number }> = {};

    // Initialize stats for each variant
    for (const trial of trials) {
      for (const [slot, variantId] of Object.entries(trial.slotMapping)) {
        if (!variantStats[variantId]) {
          variantStats[variantId] = { wins: 0, losses: 0, ties: 0, total: 0 };
        }
      }
    }

    // Count wins/losses
    for (const trial of trials) {
      const evaluation = trial.evaluations?.[0];
      if (!evaluation?.winnerSlot) continue;

      const winnerVariant = trial.slotMapping[evaluation.winnerSlot];
      const slots = Object.keys(trial.slotMapping);

      for (const slot of slots) {
        const variantId = trial.slotMapping[slot];
        variantStats[variantId].total++;

        if (slot === evaluation.winnerSlot) {
          variantStats[variantId].wins++;
        } else {
          variantStats[variantId].losses++;
        }
      }
    }

    // Convert to StatisticalResult format
    return Object.entries(variantStats).map(([variantId, stats]) => ({
      variantId,
      wins: stats.wins,
      losses: stats.losses,
      ties: stats.ties,
      winRate: stats.total > 0 ? stats.wins / stats.total : 0,
      significance: stats.total > 10 ? "SIGNIFICANT" : "NOT_SIGNIFICANT",
    }));
  }

  /**
   * Get system statistics
   */
  getSystemStats(): {
    totalExperiments: number;
    activeRuns: number;
    totalRuns: number;
    rateLimitStatus: Record<string, any>;
  } {
    return {
      totalExperiments: this.experiments.size,
      activeRuns: this.orchestrator.getActiveRuns().length,
      totalRuns: this.orchestrator.getActiveRuns().length, // Would track total in real implementation
      rateLimitStatus: {}, // Would get from rate limiter
    };
  }
}