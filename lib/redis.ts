import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
// Dependency-free TTL cache (replaces the `node-cache` package, which was
// imported here but never listed in package.json).
class TTLCache {
  private store = new Map<string, { value: unknown; expires: number }>();
  private hits = 0;
  private misses = 0;
  constructor(private defaultTtl = 600, private maxEntries = 5000) {}
  get(key: string): any {
    const e = this.store.get(key);
    if (!e || e.expires < Date.now()) {
      if (e) this.store.delete(key);
      this.misses++;
      return undefined;
    }
    this.hits++;
    return e.value;
  }
  set(key: string, value: unknown, ttl = this.defaultTtl): void {
    if (this.store.size >= this.maxEntries) {
      // evict the oldest entry so memory stays bounded
      const first = this.store.keys().next().value;
      if (first !== undefined) this.store.delete(first);
    }
    this.store.set(key, { value, expires: Date.now() + ttl * 1000 });
  }
  del(key: string): void { this.store.delete(key); }
  keys(): string[] { return Array.from(this.store.keys()); }
  flushAll(): void { this.store.clear(); }
  getStats() { return { keys: this.store.size, hits: this.hits, misses: this.misses }; }
}

const inMemoryCache = new TTLCache(600);

export async function initRedis() {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL,
      });

      redisClient.on('error', (err) => {
        console.error('Redis error:', err);
        redisClient = null;
      });

      await redisClient.connect();
      console.log('✅ Redis connected');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      redisClient = null;
    }
  }
}

export async function getRedis(): Promise<RedisClientType | null> {
  if (!redisClient && process.env.REDIS_URL) {
    await initRedis();
  }
  return redisClient;
}

export async function cacheGet(key: string): Promise<any> {
  // Try Redis first
  if (redisClient) {
    try {
      const value = await redisClient.get(key);
      if (value) {
        return JSON.parse(value);
      }
    } catch (error) {
      console.error('Redis get error:', error);
    }
  }

  // Fallback to in-memory cache
  return inMemoryCache.get(key);
}

export async function cacheSet(
  key: string,
  value: any,
  ttl: number = 600
): Promise<void> {
  // Set in Redis
  if (redisClient) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  // Set in in-memory cache as fallback
  inMemoryCache.set(key, value, ttl);
}

export async function cacheDelete(key: string): Promise<void> {
  // Delete from Redis
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  // Delete from in-memory cache
  inMemoryCache.del(key);
}

export async function cacheInvalidate(pattern: string): Promise<void> {
  // Invalidate from Redis using pattern
  if (redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }

  // Invalidate from in-memory cache
  const allKeys = inMemoryCache.keys();
  const esc = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp('^' + pattern.split('*').map(esc).join('.*') + '$');
  allKeys.forEach((key) => {
    if (regex.test(key)) {
      inMemoryCache.del(key);
    }
  });
}

export async function cacheFlush(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.flushDb();
    } catch (error) {
      console.error('Redis flush error:', error);
    }
  }

  inMemoryCache.flushAll();
}

export async function getCacheStats(): Promise<any> {
  const stats: any = {
    inMemory: inMemoryCache.getStats(),
  };

  if (redisClient) {
    try {
      const info = await redisClient.info('memory');
      stats.redis = info;
    } catch (error) {
      console.error('Redis stats error:', error);
    }
  }

  return stats;
}
