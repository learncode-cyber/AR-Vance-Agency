import { prisma } from './prisma';
import { logger } from './logging';

export class SearchAnalytics {
  static async trackSearch(
    query: string,
    resultCount: number,
    duration: number,
    userId?: string
  ) {
    try {
      await prisma.searchQuery.create({
        data: {
          query,
          resultCount,
          duration,
          userId: userId || null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to track search', error, 'SearchAnalytics');
    }
  }

  static async trackClickThrough(
    searchQueryId: string,
    resultId: string,
    position: number,
    userId?: string
  ) {
    try {
      await prisma.searchClickthrough.create({
        data: {
          searchQueryId,
          resultId,
          position,
          userId: userId || null,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to track click-through', error, 'SearchAnalytics');
    }
  }

  static async getPopularSearches(days: number = 7, limit: number = 10) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const searches = await prisma.searchQuery.groupBy({
        by: ['query'],
        where: {
          timestamp: { gte: startDate },
        },
        _count: true,
        orderBy: {
          _count: {
            query: 'desc',
          },
        },
        take: limit,
      });

      return searches;
    } catch (error) {
      logger.error('Failed to get popular searches', error, 'SearchAnalytics');
      return [];
    }
  }

  static async getZeroResultSearches(days: number = 7, limit: number = 10) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const searches = await prisma.searchQuery.findMany({
        where: {
          resultCount: 0,
          timestamp: { gte: startDate },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      return searches;
    } catch (error) {
      logger.error('Failed to get zero result searches', error, 'SearchAnalytics');
      return [];
    }
  }

  static async getSearchTrends(days: number = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const trends = await prisma.searchQuery.groupBy({
        by: ['timestamp'],
        where: {
          timestamp: { gte: startDate },
        },
        _count: true,
      });

      return trends;
    } catch (error) {
      logger.error('Failed to get search trends', error, 'SearchAnalytics');
      return [];
    }
  }

  static async getAverageSearchDuration(days: number = 7) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await prisma.searchQuery.aggregate({
        _avg: { duration: true },
        where: {
          timestamp: { gte: startDate },
        },
      });

      return result._avg.duration || 0;
    } catch (error) {
      logger.error('Failed to get average search duration', error, 'SearchAnalytics');
      return 0;
    }
  }
}
