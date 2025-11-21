/**
 * Parallel Trial Executor
 * Executes experiment trials in parallel with concurrency control
 */

export interface TrialTask {
  id: string;
  variantId: string;
  trialNumber: number;
  input: string;
  execute: () => Promise<TrialResult>;
}

export interface TrialResult {
  id: string;
  variantId: string;
  output: string;
  responseTime: number;
  tokensUsed: number;
  cost: number;
  status: 'success' | 'failed';
  error?: string;
}

export interface ExecutionProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  percentage: number;
}

export class ParallelExecutor {
  private maxConcurrency: number;
  private activeCount: number = 0;
  private queue: TrialTask[] = [];
  private results: TrialResult[] = [];
  private errors: Array<{ taskId: string; error: Error }> = [];
  private progressCallback?: (progress: ExecutionProgress) => void;

  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Execute trials in parallel with concurrency control
   */
  async executeTasks(
    tasks: TrialTask[],
    onProgress?: (progress: ExecutionProgress) => void
  ): Promise<TrialResult[]> {
    this.queue = [...tasks];
    this.results = [];
    this.errors = [];
    this.activeCount = 0;
    this.progressCallback = onProgress;

    // Start initial batch
    const initialBatch = Math.min(this.maxConcurrency, this.queue.length);
    const promises: Promise<void>[] = [];

    for (let i = 0; i < initialBatch; i++) {
      promises.push(this.processNext());
    }

    // Wait for all tasks to complete
    await Promise.all(promises);

    return this.results;
  }

  /**
   * Process next task in queue
   */
  private async processNext(): Promise<void> {
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      this.activeCount++;
      this.updateProgress();

      try {
        const result = await this.executeWithTimeout(task, 60000); // 60s timeout
        this.results.push(result);
      } catch (error) {
        this.errors.push({
          taskId: task.id,
          error: error as Error,
        });
        
        // Add failed result
        this.results.push({
          id: task.id,
          variantId: task.variantId,
          output: '',
          responseTime: 0,
          tokensUsed: 0,
          cost: 0,
          status: 'failed',
          error: (error as Error).message,
        });
      } finally {
        this.activeCount--;
        this.updateProgress();
      }
    }
  }

  /**
   * Execute task with timeout
   */
  private async executeWithTimeout(
    task: TrialTask,
    timeout: number
  ): Promise<TrialResult> {
    return Promise.race([
      task.execute(),
      new Promise<TrialResult>((_, reject) =>
        setTimeout(() => reject(new Error('Task timeout')), timeout)
      ),
    ]);
  }

  /**
   * Update progress and notify callback
   */
  private updateProgress() {
    if (!this.progressCallback) return;

    const total = this.results.length + this.queue.length + this.activeCount;
    const completed = this.results.filter((r) => r.status === 'success').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;

    const progress: ExecutionProgress = {
      total,
      completed,
      failed,
      inProgress: this.activeCount,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    };

    this.progressCallback(progress);
  }

  /**
   * Get execution statistics
   */
  getStats() {
    const successful = this.results.filter((r) => r.status === 'success');
    const failed = this.results.filter((r) => r.status === 'failed');

    return {
      total: this.results.length,
      successful: successful.length,
      failed: failed.length,
      successRate: (successful.length / this.results.length) * 100,
      avgResponseTime:
        successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length,
      totalCost: this.results.reduce((sum, r) => sum + r.cost, 0),
      totalTokens: this.results.reduce((sum, r) => sum + r.tokensUsed, 0),
    };
  }

  /**
   * Cancel all pending tasks
   */
  cancel() {
    this.queue = [];
  }
}

/**
 * Batch processor for large datasets
 */
export class BatchProcessor {
  /**
   * Process items in batches
   */
  static async processBatches<T, R>(
    items: T[],
    batchSize: number,
    processor: (batch: T[]) => Promise<R[]>,
    onBatchComplete?: (results: R[], batchIndex: number) => void
  ): Promise<R[]> {
    const results: R[] = [];
    const batches = this.createBatches(items, batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchResults = await processor(batch);
      results.push(...batchResults);

      if (onBatchComplete) {
        onBatchComplete(batchResults, i);
      }
    }

    return results;
  }

  /**
   * Create batches from array
   */
  private static createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }
}

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  /**
   * Wait for token availability
   */
  async acquire(): Promise<void> {
    this.refill();

    while (this.tokens < 1) {
      await this.sleep(100);
      this.refill();
    }

    this.tokens--;
  }

  /**
   * Refill tokens based on time elapsed
   */
  private refill() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = (elapsed / 1000) * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}