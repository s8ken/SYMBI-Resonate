export * from './types';
export * from './utils';
export * from './agent-bus';
export * from './orchestrator';
export * from './experiment-manager';
export * from './rate-limiter';
export * from './providers';
export * from './privacy';
export * from './statistics';
export * from './symbi-integration';

import { ExperimentManager } from './experiment-manager';
import { InMemoryAgentBus } from './agent-bus';
import { ExperimentOrchestrator } from './orchestrator';
import { TokenBucketRateLimiter } from './rate-limiter';
import { ProviderFactory } from './providers';
import { PrivacyManager } from './privacy';
import { StatisticalReportGenerator } from './statistics';
import { SymbiScorerManager } from './symbi-integration';

export interface SYMBIExperimentsConfig {
  databaseUrl?: string;
  redisUrl?: string;
  rateLimitConfig?: {
    requestsPerMinute?: number;
    tokensPerMinute?: number;
  };
  privacyConfig?: {
    enableAnonymization?: boolean;
    retentionDays?: number;
  };
  providerConfig?: {
    openaiApiKey?: string;
    anthropicApiKey?: string;
    googleApiKey?: string;
  };
}

export class SYMBIExperiments {
  private manager: ExperimentManager;
  private agentBus: InMemoryAgentBus;
  private orchestrator: ExperimentOrchestrator;
  private rateLimiter: TokenBucketRateLimiter;
  private providerFactory: ProviderFactory;
  private privacyManager: PrivacyManager;
  private statistics: StatisticalReportGenerator;
  private symbiScorer: SymbiScorerManager;

  constructor(config: SYMBIExperimentsConfig = {}) {
    this.agentBus = new InMemoryAgentBus();
    this.rateLimiter = new TokenBucketRateLimiter({
      requestsPerMinute: config.rateLimitConfig?.requestsPerMinute || 60,
      tokensPerMinute: config.rateLimitConfig?.tokensPerMinute || 90000,
      redisUrl: config.redisUrl
    });
    
    this.providerFactory = new ProviderFactory({
      openaiApiKey: config.providerConfig?.openaiApiKey,
      anthropicApiKey: config.providerConfig?.anthropicApiKey,
      googleApiKey: config.providerConfig?.googleApiKey
    });

    this.privacyManager = new PrivacyManager({
      enableAnonymization: config.privacyConfig?.enableAnonymization ?? true,
      retentionDays: config.privacyConfig?.retentionDays || 90
    });

    this.statistics = new StatisticalReportGenerator();
    this.symbiScorer = new SymbiScorerManager();

    this.orchestrator = new ExperimentOrchestrator({
      agentBus: this.agentBus,
      rateLimiter: this.rateLimiter,
      providerFactory: this.providerFactory,
      privacyManager: this.privacyManager,
      symbiScorer: this.symbiScorer
    });

    this.manager = new ExperimentManager({
      orchestrator: this.orchestrator,
      privacyManager: this.privacyManager,
      statistics: this.statistics,
      databaseUrl: config.databaseUrl
    });
  }

  async initialize(): Promise<void> {
    await this.manager.initialize();
    await this.rateLimiter.initialize();
  }

  async shutdown(): Promise<void> {
    await this.manager.shutdown();
    await this.rateLimiter.shutdown();
  }

  get experimentManager(): ExperimentManager {
    return this.manager;
  }

  get agentBus(): InMemoryAgentBus {
    return this.agentBus;
  }

  get orchestrator(): ExperimentOrchestrator {
    return this.orchestrator;
  }

  get rateLimiter(): TokenBucketRateLimiter {
    return this.rateLimiter;
  }

  get providerFactory(): ProviderFactory {
    return this.providerFactory;
  }

  get privacyManager(): PrivacyManager {
    return this.privacyManager;
  }

  get statistics(): StatisticalReportGenerator {
    return this.statistics;
  }

  get symbiScorer(): SymbiScorerManager {
    return this.symbiScorer;
  }
}

export function createSYMBIExperiments(config: SYMBIExperimentsConfig = {}): SYMBIExperiments {
  return new SYMBIExperiments(config);
}

export default {
  SYMBIExperiments,
  createSYMBIExperiments,
  ExperimentManager,
  InMemoryAgentBus,
  ExperimentOrchestrator,
  TokenBucketRateLimiter,
  ProviderFactory,
  PrivacyManager,
  StatisticalReportGenerator,
  SymbiScorerManager
};