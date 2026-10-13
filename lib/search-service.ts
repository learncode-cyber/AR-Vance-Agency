import { getElasticsearchClient } from './elasticsearch';
import { CacheManager } from './cache';
import { logger } from './logging';

interface SearchOptions {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
  sort?: string;
}

interface SearchResult {
  total: number;
  results: any[];
  facets?: Record<string, any>;
  took: number;
}

export class SearchService {
  static async search(
    indexName: string,
    options: SearchOptions
  ): Promise<SearchResult> {
    const es = await getElasticsearchClient();
    if (!es) {
      logger.warning('Elasticsearch not available', 'SearchService');
      return { total: 0, results: [], took: 0 };
    }

    try {
      const cacheKey = CacheManager.getCacheKey(
        'search',
        indexName,
        JSON.stringify(options)
      );

      // Check cache
      const cached = await CacheManager.get<SearchResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const from = ((options.page || 1) - 1) * (options.limit || 20);

      const query: any = {
        bool: {
          must: [
            {
              multi_match: {
                query: options.query,
                fields: ['title^2', 'content', 'tags'],
              },
            },
          ],
        },
      };

      // Add filters
      if (options.filters) {
        query.bool.filter = Object.entries(options.filters).map(([key, value]) => ({
          term: { [key]: value },
        }));
      }

      const response = await es.search({
        index: indexName,
        body: {
          query,
          from,
          size: options.limit || 20,
          sort: options.sort ? [{ [options.sort]: { order: 'desc' } }] : [],
          aggs: {
            categories: {
              terms: { field: 'category.keyword', size: 10 },
            },
            tags: {
              terms: { field: 'tags.keyword', size: 20 },
            },
          },
        },
      });

      const result: SearchResult = {
        total: (response.hits.total as any)?.value || 0,
        results: response.hits.hits.map((hit) => ({
          id: hit._id,
          score: hit._score,
          ...hit._source,
        })),
        facets: {
          categories: response.aggregations?.categories?.buckets,
          tags: response.aggregations?.tags?.buckets,
        },
        took: response.took,
      };

      // Cache results
      await CacheManager.set(cacheKey, result, { ttl: CacheManager.TTL.MEDIUM });

      return result;
    } catch (error) {
      logger.error('Search error', error, 'SearchService');
      return { total: 0, results: [], took: 0 };
    }
  }

  static async getSuggestions(
    indexName: string,
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    const es = await getElasticsearchClient();
    if (!es) return [];

    try {
      const response = await es.search({
        index: indexName,
        body: {
          query: {
            match_phrase_prefix: {
              title: query,
            },
          },
          size: limit,
          _source: ['title'],
        },
      });

      return response.hits.hits
        .map((hit: any) => hit._source.title)
        .slice(0, limit);
    } catch (error) {
      logger.error('Suggestions error', error, 'SearchService');
      return [];
    }
  }

  static async getFacets(indexName: string): Promise<Record<string, any>> {
    const es = await getElasticsearchClient();
    if (!es) return {};

    try {
      const response = await es.search({
        index: indexName,
        body: {
          size: 0,
          aggs: {
            categories: { terms: { field: 'category.keyword', size: 20 } },
            tags: { terms: { field: 'tags.keyword', size: 50 } },
            authors: { terms: { field: 'author.keyword', size: 20 } },
            dates: {
              date_histogram: {
                field: 'createdAt',
                calendar_interval: 'month',
              },
            },
          },
        },
      });

      return {
        categories: response.aggregations?.categories?.buckets,
        tags: response.aggregations?.tags?.buckets,
        authors: response.aggregations?.authors?.buckets,
        dates: response.aggregations?.dates?.buckets,
      };
    } catch (error) {
      logger.error('Facets error', error, 'SearchService');
      return {};
    }
  }
}
