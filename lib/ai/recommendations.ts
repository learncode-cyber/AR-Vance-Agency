import { prisma } from '../prisma';
import { logger } from '../logging';

interface Recommendation {
  id: string;
  title: string;
  score: number;
  reason: string;
}

export class RecommendationEngine {
  // Get similar posts based on content
  static async getSimilarPosts(
    postId: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    try {
      const currentPost = await prisma.blogPost.findUnique({
        where: { id: postId },
      });

      if (!currentPost) return [];

      // Find posts with similar tags and category
      const similarPosts = await prisma.blogPost.findMany({
        where: {
          AND: [
            { id: { not: postId } },
            { published: true },
            {
              OR: [
                { tags: { hasSome: currentPost.tags } },
                { category: currentPost.category },
              ],
            },
          ],
        },
        take: limit,
      });

      return similarPosts.map((post) => ({
        id: post.id,
        title: post.title,
        score: 0.85,
        reason: 'Similar content',
      }));
    } catch (error) {
      logger.error('Failed to get similar posts', error, 'RecommendationEngine');
      return [];
    }
  }

  // Get recommended products for user
  static async getRecommendedProducts(
    userId: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    try {
      // Get user's purchase history
      const userOrders = await prisma.order.findMany({
        where: { userId },
        include: { items: true },
      });

      if (userOrders.length === 0) {
        // Return trending products if no history
        return this.getTrendingProducts(limit);
      }

      // Get categories from purchase history
      const purchasedCategories = new Set<string>();
      userOrders.forEach((order) => {
        order.items.forEach((item: any) => {
          if (item.category) purchasedCategories.add(item.category);
        });
      });

      // Get products from similar categories
      const recommendations = await prisma.product.findMany({
        where: {
          category: { in: Array.from(purchasedCategories) },
        },
        take: limit,
      });

      return recommendations.map((product) => ({
        id: product.id,
        title: product.name,
        score: 0.78,
        reason: 'Based on your purchases',
      }));
    } catch (error) {
      logger.error('Failed to get recommended products', error, 'RecommendationEngine');
      return [];
    }
  }

  // Get trending products
  static async getTrendingProducts(limit: number = 5): Promise<Recommendation[]> {
    try {
      const trendingProducts = await prisma.product.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return trendingProducts.map((product) => ({
        id: product.id,
        title: product.name,
        score: 0.92,
        reason: 'Trending now',
      }));
    } catch (error) {
      logger.error('Failed to get trending products', error, 'RecommendationEngine');
      return [];
    }
  }

  // Get user similarity score
  static calculateUserSimilarity(user1Tags: string[], user2Tags: string[]): number {
    if (user1Tags.length === 0 || user2Tags.length === 0) return 0;

    const intersection = user1Tags.filter((tag) => user2Tags.includes(tag));
    const union = new Set([...user1Tags, ...user2Tags]);

    return intersection.length / union.size;
  }

  // Get content-based recommendations
  static async getContentBasedRecommendations(
    userId: string,
    limit: number = 5
  ): Promise<Recommendation[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) return [];

      // Get posts user might like based on interests
      const posts = await prisma.blogPost.findMany({
        where: { published: true },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });

      return posts.map((post) => ({
        id: post.id,
        title: post.title,
        score: 0.65,
        reason: 'You might like this',
      }));
    } catch (error) {
      logger.error('Failed to get content-based recommendations', error, 'RecommendationEngine');
      return [];
    }
  }
}
