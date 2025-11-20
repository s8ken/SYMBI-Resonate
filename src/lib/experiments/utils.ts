import { z } from 'zod';
import crypto from 'crypto';
import { ExperimentError } from './types';

export const IdGenerator = {
  generateExperimentId(): string {
    return `exp_${crypto.randomBytes(16).toString('hex')}`;
  },

  generateRunId(): string {
    return `run_${crypto.randomBytes(16).toString('hex')}`;
  },

  generateTrialId(): string {
    return `trial_${crypto.randomBytes(16).toString('hex')}`;
  },

  generateAgentId(role: string): string {
    return `agent_${role.toLowerCase()}_${crypto.randomBytes(8).toString('hex')}`;
  },

  generateEvaluationId(): string {
    return `eval_${crypto.randomBytes(16).toString('hex')}`;
  },

  generateResonanceId(): string {
    return `res_${crypto.randomBytes(16).toString('hex')}`;
  }
};

export const ValidationHelpers = {
  validateExperimentName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new ExperimentError('Experiment name cannot be empty', 'INVALID_CONFIG');
    }
    if (name.length > 100) {
      throw new ExperimentError('Experiment name must be 100 characters or less', 'INVALID_CONFIG');
    }
    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
      throw new ExperimentError('Experiment name can only contain letters, numbers, spaces, hyphens, and underscores', 'INVALID_CONFIG');
    }
  },

  validateDescription(description: string): void {
    if (description && description.length > 1000) {
      throw new ExperimentError('Description must be 1000 characters or less', 'INVALID_CONFIG');
    }
  },

  validateBudget(budget: number): void {
    if (budget < 0) {
      throw new ExperimentError('Budget cannot be negative', 'INVALID_CONFIG');
    }
    if (budget > 1000000) {
      throw new ExperimentError('Budget cannot exceed $1,000,000', 'INVALID_CONFIG');
    }
  },

  validateSampleSize(sampleSize: number): void {
    if (!Number.isInteger(sampleSize) || sampleSize < 1) {
      throw new ExperimentError('Sample size must be a positive integer', 'INVALID_CONFIG');
    }
    if (sampleSize > 10000) {
      throw new ExperimentError('Sample size cannot exceed 10,000', 'INVALID_CONFIG');
    }
  },

  validateConfidenceLevel(confidenceLevel: number): void {
    if (confidenceLevel < 0.8 || confidenceLevel > 0.999) {
      throw new ExperimentError('Confidence level must be between 0.8 and 0.999', 'INVALID_CONFIG');
    }
  },

  validateProviderConfig(provider: string, model?: string): void {
    const validProviders = ['openai', 'anthropic', 'google'];
    if (!validProviders.includes(provider.toLowerCase())) {
      throw new ExperimentError(`Invalid provider: ${provider}. Must be one of: ${validProviders.join(', ')}`, 'INVALID_CONFIG');
    }
    
    if (model) {
      const validModels = this.getValidModels(provider);
      if (!validModels.includes(model)) {
        throw new ExperimentError(`Invalid model: ${model} for provider ${provider}. Valid models: ${validModels.join(', ')}`, 'INVALID_CONFIG');
      }
    }
  },

  getValidModels(provider: string): string[] {
    const models = {
      openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      google: ['gemini-pro', 'gemini-pro-vision']
    };
    return models[provider.toLowerCase() as keyof typeof models] || [];
  }
};

export const DataTransformers = {
  sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value === null || value === undefined) {
        sanitized[key] = value;
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' ? item : String(item)
        );
      } else {
        sanitized[key] = String(value);
      }
    }
    return sanitized;
  },

  normalizeScore(score: number, fromMin: number, fromMax: number, toMin: number = 0, toMax: number = 10): number {
    if (fromMin === fromMax) return toMin;
    const normalized = ((score - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
    return Math.max(toMin, Math.min(toMax, normalized));
  },

  calculatePercentage(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 10000) / 100;
  },

  formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  },

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  },

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  }
};

export const CryptoUtils = {
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  },

  hashObject(obj: any): string {
    const sorted = JSON.stringify(obj, Object.keys(obj).sort());
    return this.hash(sorted);
  },

  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  },

  verifyIntegrity(data: string, expectedHash: string): boolean {
    return this.hash(data) === expectedHash;
  }
};

export const ExperimentCalculators = {
  calculateExpectedDuration(sampleSize: number, avgResponseTimeMs: number = 2000): number {
    return sampleSize * avgResponseTimeMs;
  },

  calculateEstimatedCost(sampleSize: number, avgCostPerRequest: number = 0.01): number {
    return sampleSize * avgCostPerRequest;
  },

  calculateProgress(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.min(100, Math.max(0, (completed / total) * 100));
  },

  calculateCompletionRate(completed: number, started: number): number {
    if (started === 0) return 0;
    return this.calculatePercentage(completed, started);
  },

  calculateErrorRate(errors: number, total: number): number {
    if (total === 0) return 0;
    return this.calculatePercentage(errors, total);
  }
};

export const ErrorHandler = {
  wrapAsync<T>(fn: () => Promise<T>, context: string): Promise<T> {
    return fn().catch(error => {
      if (error instanceof ExperimentError) {
        throw error;
      }
      throw new ExperimentError(
        `${context}: ${error instanceof Error ? error.message : String(error)}`,
        'INTERNAL_ERROR',
        error
      );
    });
  },

  validateAndThrow<T>(schema: z.ZodSchema<T>, data: unknown, context: string): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ExperimentError(
          `${context}: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
          'INVALID_CONFIG'
        );
      }
      throw new ExperimentError(
        `${context}: Validation failed`,
        'INVALID_CONFIG',
        error
      );
    }
  }
};

export const RetryPolicy = {
  async withExponentialBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 30000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        const delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt));
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
};

export const CollectionUtils = {
  chunk<T>(array: T[], size: number): T[][] {
    if (size <= 0) throw new Error('Chunk size must be positive');
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]> {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<K, T[]>);
  }
};