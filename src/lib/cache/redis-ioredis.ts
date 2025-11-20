import Redis from 'ioredis';
import type { Cache } from './redis-client';

export class RedisIoClient implements Cache {
  private client: Redis;
  constructor(url?: string, options?: { tls?: boolean; password?: string }) {
    if (!url) throw new Error('REDIS_URL not set');
    this.client = new Redis(url, {
      tls: options?.tls ? {} : undefined,
      password: options?.password || undefined,
      lazyConnect: true,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const v = await this.client.get(key);
    return v ? (JSON.parse(v) as T) : null;
  }

  async set(key: string, value: any, options?: { ttl?: number }): Promise<void> {
    const args = options?.ttl ? ['EX', options.ttl] as const : [];
    await this.client.set(key, JSON.stringify(value), ...args);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const n = await this.client.exists(key);
    return n > 0;
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }

  async close(): Promise<void> {
    await this.client.quit();
  }

  // Health check helper
  async ping(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  // Increment/decrement helpers
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }
}