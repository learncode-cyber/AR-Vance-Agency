import { 
  createIndex, 
  indexDocument, 
  deleteDocument,
  getElasticsearchClient
} from './elasticsearch';
import { prisma } from './prisma';
import { logger } from './logging';

const INDICES = {
  POSTS: 'posts',
  USERS: 'users',
  PRODUCTS: 'products',
  COMMENTS: 'comments',
};

const MAPPINGS = {
  [INDICES.POSTS]: {
    settings: {
      number_of_shards: 2,
      number_of_replicas: 1,
    },
    mappings: {
      properties: {
        title: { type: 'text', analyzer: 'standard' },
        content: { type: 'text', analyzer: 'standard' },
        slug: { type: 'keyword' },
        category: { type: 'keyword' },
        tags: { type: 'keyword' },
        author: { type: 'keyword' },
        createdAt: { type: 'date' },
        updatedAt: { type: 'date' },
        published: { type: 'boolean' },
        views: { type: 'integer' },
      },
    },
  },
  [INDICES.USERS]: {
    settings: {
      number_of_shards: 1,
      number_of_replicas: 1,
    },
    mappings: {
      properties: {
        email: { type: 'keyword' },
        name: { type: 'text' },
        role: { type: 'keyword' },
        createdAt: { type: 'date' },
        active: { type: 'boolean' },
      },
    },
  },
  [INDICES.PRODUCTS]: {
    settings: {
      number_of_shards: 2,
      number_of_replicas: 1,
    },
    mappings: {
      properties: {
        name: { type: 'text' },
        description: { type: 'text' },
        category: { type: 'keyword' },
        price: { type: 'float' },
        stock: { type: 'integer' },
        tags: { type: 'keyword' },
        createdAt: { type: 'date' },
      },
    },
  },
};

export class Indexer {
  static async initializeIndices() {
    try {
      for (const [indexName, mapping] of Object.entries(MAPPINGS)) {
        await createIndex(indexName, mapping);
      }
      logger.info('All indices initialized', 'Indexer');
    } catch (error) {
      logger.error('Failed to initialize indices', error, 'Indexer');
    }
  }

  static async indexPosts() {
    try {
      const posts = await prisma.blogPost.findMany({
        where: { published: true },
      });

      for (const post of posts) {
        await indexDocument(INDICES.POSTS, post.id, {
          title: post.title,
          content: post.content,
          slug: post.slug,
          category: post.category,
          tags: post.tags,
          author: post.authorId,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          published: post.published,
        });
      }

      logger.info('Posts indexed', 'Indexer', { count: posts.length });
    } catch (error) {
      logger.error('Failed to index posts', error, 'Indexer');
    }
  }

  static async indexUsers() {
    try {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
      });

      for (const user of users) {
        await indexDocument(INDICES.USERS, user.id, {
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          active: user.deletedAt === null,
        });
      }

      logger.info('Users indexed', 'Indexer', { count: users.length });
    } catch (error) {
      logger.error('Failed to index users', error, 'Indexer');
    }
  }

  static async reindexAll() {
    try {
      logger.info('Starting full reindex', 'Indexer');
      await this.initializeIndices();
      await this.indexPosts();
      await this.indexUsers();
      logger.info('Reindex completed', 'Indexer');
    } catch (error) {
      logger.error('Reindex failed', error, 'Indexer');
    }
  }

  static async addDocument(index: string, id: string, document: any) {
    await indexDocument(index, id, document);
  }

  static async removeDocument(index: string, id: string) {
    await deleteDocument(index, id);
  }
}
