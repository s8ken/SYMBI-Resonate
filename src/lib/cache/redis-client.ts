/**
 * Redis Cache Client
 * Provides caching layer for improved performance and scalability
 */

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  keys: number;
}

/**
 * Redis Cache Client
 * Note: This is a mock implementation. In production, use actual Redis client like ioredis
 */
export class RedisCacheClient {
  private cache: Map<string, { value: any; expiresAt: number }> = new Map();
  private stats = { hits: 0, misses: 0 };
  private defaultTTL = 3600; // 1 hour default
  private keyPrefix = 'symbi:';

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.keyPrefix + key;
    const item = this.cache.get(fullKey);

    if (!item) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(fullKey);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return item.value as T;
  }

  /**
   * Set value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const fullKey = this.keyPrefix + key;
    const ttl = options?.ttl || this.defaultTTL;
    const expiresAt = Date.now() + ttl * 1000;

    this.cache.set(fullKey, { value, expiresAt });
  }

  /**
   * Delete value from cache
   */
  async del(key: string): Promise<void> {
    const fullKey = this.keyPrefix + key;
    this.cache.delete(fullKey);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.keyPrefix + key;
    const item = this.cache.get(fullKey);

    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(fullKey);
      return false;
    }

    return true;
  }

  /**
   * Get multiple values
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  /**
   * Set multiple values
   */
  async mset(items: Record<string, any>, options?: CacheOptions): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, value]) => this.set(key, value, options))
    );
  }

  /**
   * Delete multiple keys
   */
  async mdel(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.del(key)));
  }

  /**
   * Increment a counter
   */
  async incr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current + 1;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Decrement a counter
   */
  async decr(key: string): Promise<number> {
    const current = (await this.get<number>(key)) || 0;
    const newValue = current - 1;
    await this.set(key, newValue);
    return newValue;
  }

  /**
   * Set expiration time for a key
   */
  async expire(key: string, seconds: number): Promise<void> {
    const fullKey = this.keyPrefix + key;
    const item = this.cache.get(fullKey);

    if (item) {
      item.expiresAt = Date.now() + seconds * 1000;
      this.cache.set(fullKey, item);
    }
  }

  /**
   * Get time to live for a key
   */
  async ttl(key: string): Promise<number> {
    const fullKey = this.keyPrefix + key;
    const item = this.cache.get(fullKey);

    if (!item) {
      return -2; // Key doesn't exist
    }

    const ttl = Math.floor((item.expiresAt - Date.now()) / 1000);
    return ttl > 0 ? ttl : -1; // -1 means expired
  }

  /**
   * Clear all keys with a specific pattern
   */
  async clearPattern(pattern: string): Promise<number> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  /**
   * Clear all cache
   */
  async flushAll(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      keys: this.cache.size
    };
  }

  /**
   * Get or set pattern (cache-aside)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Generate value
    const value = await factory();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Invalidate cache for a specific resource
   */
  async invalidate(resource: string, id?: string): Promise<void> {
    if (id) {
      await this.del(`${resource}:${id}`);
    } else {
      await this.clearPattern(`${resource}:*`);
    }
  }

  /**
   * Cache warming - preload frequently accessed data
   */
  async warm(items: Record<string, any>, options?: CacheOptions): Promise<void> {
    await this.mset(items, options);
  }
}

export const cacheClient = new RedisCacheClient();

/**
 * Cache key builders for different resources
 */
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userPermissions: (id: string) => `user:${id}:permissions`,
  userRoles: (id: string) => `user:${id}:roles`,
  organization: (id: string) => `org:${id}`,
  conversation: (id: string) => `conversation:${id}`,
  assessment: (id: string) => `assessment:${id}`,
  apiKey: (hash: string) => `api_key:${hash}`,
  rateLimit: (identifier: string, endpoint: string) => `rate_limit:${identifier}:${endpoint}`,
  session: (id: string) => `session:${id}`
};

/**
 * Cache TTL configurations (in seconds)
 */
export const CacheTTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  SESSION: 7200 // 2 hours
};

// --- Factory for Redis or Mock ---
import type { Cache } from './redis-ioredis';

let cacheInstance: Cache | null = null;

export function getCacheClient(): Cache {
  if (cacheInstance) return cacheInstance;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Cache] Production mode without REDIS_URL; falling back to in-memory cache.');
    }
    cacheInstance = new RedisCacheClient();
    return cacheInstance;
  }

  try {
    const { RedisIoClient } = require('./redis-ioredis');
    cacheInstance = new RedisIoClient(redisUrl, {
      tls: process.env.REDIS_TLS === 'true',
      password: process.env.REDIS_PASSWORD || undefined,
    });
    console.log('[Cache] Using Redis (ioredis) backend');
    return cacheInstance;
  } catch (e) {
    console.error('[Cache] Failed to initialize Redis client; falling back to in-memory cache:', e);
    if (process.env.NODE_ENV === 'production') {
      throw e; // Fail fast in production
    }
    cacheInstance = new RedisCacheClient();
    return cacheInstance;
  }
}

// Re-export a default client for backward compatibility
export const cacheClient = getCacheClient();