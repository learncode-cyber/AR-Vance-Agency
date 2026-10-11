import { prisma } from '../prisma';
import { logger } from '../logging';

export class PredictiveAnalytics {
  // Predict user churn probability
  static async predictChurnRisk(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          activities: { orderBy: { timestamp: 'desc' }, take: 30 },
        },
      });

      if (!user) return 0;

      // Calculate risk score based on inactivity
      const lastActivityDays = user.activities.length > 0
        ? Math.floor((Date.now() - user.activities[0].timestamp.getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Risk increases with inactivity
      const inactivityRisk = Math.min(lastActivityDays / 30, 1);

      // Check recent interactions
      const recentActivities = user.activities.filter(
        (a) => Date.now() - a.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
      ).length;

      const engagementRisk = Math.max(0, 1 - recentActivities / 5);

      // Weighted score
      const churnRisk = inactivityRisk * 0.6 + engagementRisk * 0.4;

      return Math.min(churnRisk, 1);
    } catch (error) {
      logger.error('Failed to predict churn', error, 'PredictiveAnalytics');
      return 0;
    }
  }

  // Predict user lifetime value
  static async predictLifetimeValue(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { orders: { select: { total: true } } },
      });

      if (!user || user.orders.length === 0) return 0;

      // Calculate average order value
      const totalSpent = user.orders.reduce((sum, order) => sum + order.total, 0);
      const averageOrderValue = totalSpent / user.orders.length;

      // Estimate future value (simple model)
      // Assume 5 more years of purchases with slight growth
      const estimatedFutureOrders = Math.max(10, user.orders.length * 2);
      const growthFactor = 1.1; // 10% annual growth

      return averageOrderValue * estimatedFutureOrders * growthFactor;
    } catch (error) {
      logger.error('Failed to predict LTV', error, 'PredictiveAnalytics');
      return 0;
    }
  }

  // Predict post popularity
  static async predictPostPopularity(postId: string): Promise<number> {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { id: postId },
        include: { comments: true },
      });

      if (!post) return 0;

      // Score based on content factors
      const contentScore = (post.title.length * 0.05 + post.content.length * 0.02) / 100;
      const engagementScore = post.comments.length / 10;
      const recencyScore = Math.max(0, 1 - 
        (Date.now() - post.createdAt.getTime()) / (30 * 24 * 60 * 60 * 1000)
      );

      // Weighted average
      const popularity = 
        contentScore * 0.3 + 
        engagementScore * 0.4 + 
        recencyScore * 0.3;

      return Math.min(popularity, 1);
    } catch (error) {
      logger.error('Failed to predict post popularity', error, 'PredictiveAnalytics');
      return 0;
    }
  }

  // Predict conversion probability
  static async predictConversionProbability(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { orders: true },
      });

      if (!user) return 0;

      // Higher probability if user has already made purchases
      if (user.orders.length > 0) {
        return 0.8; // High repeat customer probability
      }

      // Random prediction for new users (in real scenario would use ML model)
      return Math.random() * 0.4; // 0-40% for new users
    } catch (error) {
      logger.error('Failed to predict conversion', error, 'PredictiveAnalytics');
      return 0;
    }
  }

  // Predict revenue for next month
  static async predictMonthlyRevenue(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const lastMonthRevenue = await prisma.order.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      });

      const revenue = lastMonthRevenue._sum.total || 0;

      // Simple trend: assume 5% growth
      return revenue * 1.05;
    } catch (error) {
      logger.error('Failed to predict monthly revenue', error, 'PredictiveAnalytics');
      return 0;
    }
  }
}
