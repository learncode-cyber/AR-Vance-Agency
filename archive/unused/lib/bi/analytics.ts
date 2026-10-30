import { prisma } from '../prisma';
import { logger } from '../logging';

export class AnalyticsEngine {
  // Get revenue metrics
  static async getRevenueMetrics(days: number = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const result = await prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: startDate },
        },
        _sum: { total: true },
        _count: true,
      });

      return {
        dailyRevenue: result,
        totalRevenue: result.reduce((sum: any, day: any) => sum + (day._sum.total || 0), 0),
        totalOrders: result.reduce((sum: any, day: any) => sum + day._count, 0),
        avgOrderValue: 0,
      };
    } catch (error) {
      logger.error('Failed to get revenue metrics', error, 'AnalyticsEngine');
      return { dailyRevenue: [], totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    }
  }

  // Get user analytics
  static async getUserAnalytics(days: number = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const newUsers = await prisma.user.count({
        where: { createdAt: { gte: startDate } },
      });

      const totalUsers = await prisma.user.count();

      const activeUsers = await prisma.user.count({
        where: {
          lastSeen: { gte: startDate },
        },
      });

      return { newUsers, totalUsers, activeUsers, growthRate: (newUsers / totalUsers) * 100 };
    } catch (error) {
      logger.error('Failed to get user analytics', error, 'AnalyticsEngine');
      return { newUsers: 0, totalUsers: 0, activeUsers: 0, growthRate: 0 };
    }
  }

  // Cohort analysis
  static async getCohortAnalysis() {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, createdAt: true },
      });

      const cohorts: Record<string, number> = {};

      users.forEach((user) => {
        const month = user.createdAt.toISOString().slice(0, 7);
        cohorts[month] = (cohorts[month] || 0) + 1;
      });

      return cohorts;
    } catch (error) {
      logger.error('Failed to get cohort analysis', error, 'AnalyticsEngine');
      return {};
    }
  }

  // Trend analysis
  static async getTrendAnalysis(metric: string, days: number = 90) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      let data: any[] = [];

      if (metric === 'orders') {
        data = await prisma.order.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true, total: true },
        });
      } else if (metric === 'users') {
        data = await prisma.user.findMany({
          where: { createdAt: { gte: startDate } },
          select: { createdAt: true },
        });
      }

      return data;
    } catch (error) {
      logger.error('Failed to get trend analysis', error, 'AnalyticsEngine');
      return [];
    }
  }

  // Product performance
  static async getProductPerformance() {
    try {
      const products = await prisma.product.findMany({
        include: { _count: { select: { orderItems: true } } },
        take: 10,
      });

      return products.map((p) => ({
        id: p.id,
        name: p.name,
        sales: (p as any)._count.orderItems,
        revenue: p.price * (p as any)._count.orderItems,
      }));
    } catch (error) {
      logger.error('Failed to get product performance', error, 'AnalyticsEngine');
      return [];
    }
  }
}
