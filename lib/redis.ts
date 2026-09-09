import { createClient, RedisClientType } from 'redis';
import NodeCache from 'node-cache';

let redisClient: RedisClientType | null = null;
const inMemoryCache = new NodeCache({ stdTTL: 600 });

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
  const regex = new RegExp(pattern.replace('*', '.*'));
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
