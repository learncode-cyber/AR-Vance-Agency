import { CacheManager } from './cache';
import { logger } from './logging';

export class CacheInvalidationManager {
  // User-related invalidations
  static async invalidateUser(userId: string) {
    await CacheManager.delete(CacheManager.getUserKey(userId));
    await CacheManager.invalidate('users:*');
    logger.info('Cache invalidated for user', 'CacheManager', { userId });
  }

  static async invalidateUsers() {
    await CacheManager.invalidate('users:*');
    await CacheManager.invalidate('user:*');
    logger.info('Cache invalidated for all users', 'CacheManager');
  }

  // Post-related invalidations
  static async invalidatePost(postId: string) {
    await CacheManager.delete(CacheManager.getPostKey(postId));
    await CacheManager.invalidate('posts:*');
    logger.info('Cache invalidated for post', 'CacheManager', { postId });
  }

  static async invalidatePosts() {
    await CacheManager.invalidate('posts:*');
    await CacheManager.invalidate('post:*');
    logger.info('Cache invalidated for all posts', 'CacheManager');
  }

  // Settings invalidations
  static async invalidateSettings(key?: string) {
    if (key) {
      await CacheManager.delete(CacheManager.getSettingsKey(key));
    } else {
      await CacheManager.invalidate('settings:*');
    }
    logger.info('Cache invalidated for settings', 'CacheManager', { key });
  }

  // Analytics invalidations
  static async invalidateAnalytics(date?: string) {
    if (date) {
      await CacheManager.delete(CacheManager.getAnalyticsKey(date));
    } else {
      await CacheManager.invalidate('analytics:*');
    }
    logger.info('Cache invalidated for analytics', 'CacheManager', { date });
  }

  // API cache invalidations
  static async invalidateApi(route?: string) {
    if (route) {
      await CacheManager.invalidate(`api:${route}:*`);
    } else {
      await CacheManager.invalidate('api:*');
    }
    logger.info('Cache invalidated for API', 'CacheManager', { route });
  }

  // Full cache flush
  static async flushAll() {
    await CacheManager.delete('*');
    logger.warning('Full cache flush executed', 'CacheManager');
  }
}

export class CacheWarmingManager {
  static async warmUserCache(userId: string, userData: any) {
    await CacheManager.set(
      CacheManager.getUserKey(userId),
      userData,
      { ttl: CacheManager.TTL.LONG }
    );
  }

  static async warmPostCache(postId: string, postData: any) {
    await CacheManager.set(
      CacheManager.getPostKey(postId),
      postData,
      { ttl: CacheManager.TTL.DAY }
    );
  }

  static async warmSettingsCache(key: string, value: any) {
    await CacheManager.set(
      CacheManager.getSettingsKey(key),
      value,
      { ttl: CacheManager.TTL.WEEK }
    );
  }

  static async warmAnalyticsCache(date: string, data: any) {
    await CacheManager.set(
      CacheManager.getAnalyticsKey(date),
      data,
      { ttl: CacheManager.TTL.MONTH }
    );
  }
}
