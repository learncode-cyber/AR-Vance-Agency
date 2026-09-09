import { cacheGet, cacheSet, cacheDelete, cacheInvalidate } from './redis';

interface CacheOptions {
  ttl?: number;
}

export class CacheManager {
  private static readonly DEFAULT_TTL = 300; // 5 minutes

  static async get<T>(key: string): Promise<T | null> {
    try {
      return await cacheGet(key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  static async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl || this.DEFAULT_TTL;
      await cacheSet(key, value, ttl);
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  static async delete(key: string): Promise<void> {
    try {
      await cacheDelete(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  static async invalidate(pattern: string): Promise<void> {
    try {
      await cacheInvalidate(pattern);
    } catch (error) {
      console.error('Cache invalidate error:', error);
    }
  }

  // Convenience methods
  static getCacheKey(...parts: string[]): string {
    return parts.join(':');
  }

  static getUserKey(userId: string): string {
    return this.getCacheKey('user', userId);
  }

  static getPostKey(postId: string): string {
    return this.getCacheKey('post', postId);
  }

  static getPostsListKey(): string {
    return this.getCacheKey('posts:list');
  }

  static getSettingsKey(key: string): string {
    return this.getCacheKey('settings', key);
  }

  static getAnalyticsKey(date: string): string {
    return this.getCacheKey('analytics', date);
  }

  static getApiKey(route: string, hash: string): string {
    return this.getCacheKey('api', route, hash);
  }

  // TTL constants
  static readonly TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
    DAY: 86400, // 24 hours
    WEEK: 604800, // 7 days
    MONTH: 2592000, // 30 days
  };
}
