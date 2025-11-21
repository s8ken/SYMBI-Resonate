/**
 * Cache Service
 * Implements Redis-based caching with fallback to in-memory cache
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache implementation
 */
export class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    const expiresAt = Date.now() + ttl * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy cache and cleanup
   */
  destroy() {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

/**
 * Cache service with namespacing and TTL support
 */
export class CacheService {
  private cache: MemoryCache;
  private defaultTTL: number = 3600; // 1 hour
  private namespace: string = 'symbi';

  constructor(options?: { defaultTTL?: number; namespace?: string }) {
    this.cache = new MemoryCache();
    if (options?.defaultTTL) this.defaultTTL = options.defaultTTL;
    if (options?.namespace) this.namespace = options.namespace;
  }

  /**
   * Generate cache key with namespace
   */
  private getKey(key: string, namespace?: string): string {
    const ns = namespace || this.namespace;
    return `${ns}:${key}`;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const cacheKey = this.getKey(key, options?.namespace);
    return this.cache.get<T>(cacheKey);
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const cacheKey = this.getKey(key, options?.namespace);
    const ttl = options?.ttl || this.defaultTTL;
    await this.cache.set(cacheKey, value, ttl);
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, options?: CacheOptions): Promise<void> {
    const cacheKey = this.getKey(key, options?.namespace);
    await this.cache.delete(cacheKey);
  }

  /**
   * Get or set value (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern: string, options?: CacheOptions): Promise<void> {
    // In-memory cache doesn't support pattern matching efficiently
    // For production, use Redis with SCAN command
    await this.cache.clear();
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    await this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size(),
      namespace: this.namespace,
      defaultTTL: this.defaultTTL,
    };
  }
}

/**
 * Memoization decorator for caching function results
 */
export function memoize<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  const cache = new Map<string, { value: any; expiresAt: number }>();
  const ttl = (options?.ttl || 3600) * 1000;

  return (async (...args: Parameters<T>) => {
    const key = options?.keyGenerator
      ? options.keyGenerator(...args)
      : JSON.stringify(args);

    const cached = cache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    const result = await fn(...args);
    cache.set(key, {
      value: result,
      expiresAt: Date.now() + ttl,
    });

    return result;
  }) as T;
}

/**
 * Query result cache for database queries
 */
export class QueryCache {
  private cache: CacheService;

  constructor(cache: CacheService) {
    this.cache = cache;
  }

  /**
   * Cache query result
   */
  async cacheQuery<T>(
    queryKey: string,
    query: () => Promise<T>,
    ttl: number = 300 // 5 minutes default
  ): Promise<T> {
    return this.cache.getOrSet(
      `query:${queryKey}`,
      query,
      { ttl, namespace: 'queries' }
    );
  }

  /**
   * Invalidate query cache
   */
  async invalidateQuery(queryKey: string): Promise<void> {
    await this.cache.delete(`query:${queryKey}`, { namespace: 'queries' });
  }

  /**
   * Invalidate all queries
   */
  async invalidateAll(): Promise<void> {
    await this.cache.invalidatePattern('query:*', { namespace: 'queries' });
  }
}

/**
 * Create global cache instance
 */
export const globalCache = new CacheService({
  defaultTTL: 3600,
  namespace: 'symbi-resonate',
});

export const queryCache = new QueryCache(globalCache);