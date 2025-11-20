/**
 * Rate Limiting System
 * Manages API rate limits across multiple providers
 * Supports both in-memory and distributed implementations
 */

import { RateLimitConfig, RateLimitStatus, RateLimitError } from './types';

/**
 * Rate Limiter Interface
 */
export interface RateLimiter {
  checkLimit(provider: string, requests: number, tokens: number): Promise<boolean>;
  consume(provider: string, requests: number, tokens: number): Promise<void>;
  getStatus(provider: string): Promise<RateLimitStatus>;
  reset(provider: string): Promise<void>;
}

/**
 * Token Bucket Rate Limiter
 * Implements token bucket algorithm for smooth rate limiting
 */
export class TokenBucketRateLimiter implements RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private config: Map<string, RateLimitConfig> = new Map();

  constructor(configs: Record<string, RateLimitConfig>) {
    for (const [provider, config] of Object.entries(configs)) {
      this.config.set(provider, config);
      this.buckets.set(provider, new TokenBucket(config));
    }
  }

  async checkLimit(provider: string, requests: number, tokens: number): Promise<boolean> {
    const bucket = this.buckets.get(provider);
    if (!bucket) {
      return true; // No limit configured
    }

    return bucket.check(requests, tokens);
  }

  async consume(provider: string, requests: number, tokens: number): Promise<void> {
    const bucket = this.buckets.get(provider);
    if (!bucket) {
      return; // No limit configured
    }

    const success = bucket.consume(requests, tokens);
    if (!success) {
      const config = this.config.get(provider)!;
      const resetAt = new Date(Date.now() + 60000).toISOString(); // Reset in 1 minute
      throw new RateLimitError(
        `Rate limit exceeded for ${provider}`,
        provider,
        resetAt
      );
    }
  }

  async getStatus(provider: string): Promise<RateLimitStatus> {
    const bucket = this.buckets.get(provider);
    if (!bucket) {
      return {
        requestsRemaining: Infinity,
        tokensRemaining: Infinity,
        resetAt: new Date(Date.now() + 3600000).toISOString(),
      };
    }

    return bucket.getStatus();
  }

  async reset(provider: string): Promise<void> {
    const config = this.config.get(provider);
    if (config) {
      this.buckets.set(provider, new TokenBucket(config));
    }
  }
}

/**
 * Token Bucket Implementation
 */
class TokenBucket {
  private requestTokens: number;
  private tokenTokens: number;
  private lastRefill: number;

  constructor(private config: RateLimitConfig) {
    this.requestTokens = config.maxRequestsPerMin;
    this.tokenTokens = config.maxTokensPerMin;
    this.lastRefill = Date.now();
  }

  check(requests: number, tokens: number): boolean {
    this.refill();
    return this.requestTokens >= requests && this.tokenTokens >= tokens;
  }

  consume(requests: number, tokens: number): boolean {
    if (!this.check(requests, tokens)) {
      return false;
    }

    this.requestTokens -= requests;
    this.tokenTokens -= tokens;
    return true;
  }

  getStatus(): RateLimitStatus {
    this.refill();
    
    const resetAt = new Date(Date.now() + 60000).toISOString();
    
    return {
      requestsRemaining: this.requestTokens,
      tokensRemaining: this.tokenTokens,
      resetAt,
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const refillRate = elapsed / 60000; // Minutes elapsed

    if (refillRate > 0) {
      this.requestTokens = Math.min(
        this.config.maxRequestsPerMin,
        this.requestTokens + (this.config.maxRequestsPerMin * refillRate)
      );

      this.tokenTokens = Math.min(
        this.config.maxTokensPerMin,
        this.tokenTokens + (this.config.maxTokensPerMin * refillRate)
      );

      this.lastRefill = now;
    }
  }
}

/**
 * Distributed Rate Limiter (Redis-based)
 * For horizontal scaling across multiple instances
 */
export class DistributedRateLimiter implements RateLimiter {
  constructor(
    private redisClient: any, // Would be Redis client in real implementation
    private configs: Record<string, RateLimitConfig>
  ) {}

  async checkLimit(provider: string, requests: number, tokens: number): Promise<boolean> {
    // Redis implementation would check distributed counters
    // For now, return true (no limit)
    return true;
  }

  async consume(provider: string, requests: number, tokens: number): Promise<void> {
    // Redis implementation would increment distributed counters
    // For now, do nothing
  }

  async getStatus(provider: string): Promise<RateLimitStatus> {
    // Redis implementation would get distributed status
    return {
      requestsRemaining: Infinity,
      tokensRemaining: Infinity,
      resetAt: new Date(Date.now() + 3600000).toISOString(),
    };
  }

  async reset(provider: string): Promise<void> {
    // Redis implementation would reset distributed counters
  }
}

/**
 * Rate Limiting Middleware
 * Express/Fastify middleware for API endpoints
 */
export function createRateLimitMiddleware(rateLimiter: RateLimiter) {
  return async (req: any, res: any, next: any) => {
    const provider = req.headers['x-provider'] || 'default';
    const estimatedTokens = parseInt(req.headers['x-estimated-tokens'] || '1000');

    try {
      await rateLimiter.consume(provider, 1, estimatedTokens);
      next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          provider: error.provider,
          resetAt: error.resetAt,
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Rate Limit Queue
 * Manages queued requests when rate limits are exceeded
 */
export class RateLimitQueue {
  private queue: Array<{
    id: string;
    provider: string;
    requests: number;
    tokens: number;
    resolve: () => void;
    reject: (error: Error) => void;
    timestamp: number;
  }> = [];

  constructor(
    private rateLimiter: RateLimiter,
    private maxQueueSize = 1000,
    private queueTimeout = 300000 // 5 minutes
  ) {}

  async execute<T>(
    provider: string,
    requests: number,
    tokens: number,
    fn: () => Promise<T>
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = Math.random().toString(36).substr(2, 9);
      const timestamp = Date.now();

      const queueItem = {
        id,
        provider,
        requests,
        tokens,
        resolve: () => fn().then(resolve).catch(reject),
        reject,
        timestamp,
      };

      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Rate limit queue is full'));
        return;
      }

      this.queue.push(queueItem);
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    const now = Date.now();

    // Remove expired items
    this.queue = this.queue.filter(item => 
      now - item.timestamp < this.queueTimeout
    );

    // Process available items
    for (let i = 0; i < this.queue.length; i++) {
      const item = this.queue[i];
      
      try {
        const canExecute = await this.rateLimiter.checkLimit(item.provider, item.requests, item.tokens);
        
        if (canExecute) {
          this.queue.splice(i, 1);
          i--; // Adjust index after removal
          
          await this.rateLimiter.consume(item.provider, item.requests, item.tokens);
          item.resolve();
        }
      } catch (error) {
        this.queue.splice(i, 1);
        i--;
        item.reject(error);
      }
    }

    // Schedule next processing
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 1000);
    }
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getQueueStats(): {
    totalQueued: number;
    byProvider: Record<string, number>;
    averageWaitTime: number;
  } {
    const now = Date.now();
    const waitTimes = this.queue.map(item => now - item.timestamp);
    const averageWaitTime = waitTimes.length > 0 
      ? waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length 
      : 0;

    const byProvider: Record<string, number> = {};
    this.queue.forEach(item => {
      byProvider[item.provider] = (byProvider[item.provider] || 0) + 1;
    });

    return {
      totalQueued: this.queue.length,
      byProvider,
      averageWaitTime,
    };
  }
}