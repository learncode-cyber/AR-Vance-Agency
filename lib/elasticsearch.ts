import { Client } from '@elastic/elasticsearch';
import { logger } from './logging';

let client: Client | null = null;

export async function initElasticsearch() {
  if (!process.env.ELASTICSEARCH_URL) {
    logger.warning('Elasticsearch URL not configured, search disabled', 'ES');
    return;
  }

  try {
    client = new Client({
      node: process.env.ELASTICSEARCH_URL,
      auth: {
        username: process.env.ELASTICSEARCH_USER || 'elastic',
        password: process.env.ELASTICSEARCH_PASSWORD || 'changeme',
      },
    });

    // Test connection
    const info = await client.info();
    logger.info('✅ Elasticsearch connected', 'ES', { version: info.version?.number });
  } catch (error) {
    logger.error('Failed to connect to Elasticsearch', error, 'ES');
    client = null;
  }
}

export async function getElasticsearchClient(): Promise<Client | null> {
  if (!client && process.env.ELASTICSEARCH_URL) {
    await initElasticsearch();
  }
  return client;
}

export async function createIndex(indexName: string, mapping: any) {
  const es = await getElasticsearchClient();
  if (!es) return null;

  try {
    const exists = await es.indices.exists({ index: indexName });
    if (!exists) {
      await es.indices.create({
        index: indexName,
        body: mapping,
      });
      logger.info('Index created', 'ES', { index: indexName });
    }
  } catch (error) {
    logger.error('Failed to create index', error, 'ES');
  }
}

export async function deleteIndex(indexName: string) {
  const es = await getElasticsearchClient();
  if (!es) return null;

  try {
    await es.indices.delete({ index: indexName });
    logger.info('Index deleted', 'ES', { index: indexName });
  } catch (error) {
    logger.error('Failed to delete index', error, 'ES');
  }
}

export async function indexDocument(
  indexName: string,
  id: string,
  document: any
) {
  const es = await getElasticsearchClient();
  if (!es) return null;

  try {
    await es.index({
      index: indexName,
      id,
      document,
      refresh: true,
    });
  } catch (error) {
    logger.error('Failed to index document', error, 'ES');
  }
}

export async function deleteDocument(indexName: string, id: string) {
  const es = await getElasticsearchClient();
  if (!es) return null;

  try {
    await es.delete({
      index: indexName,
      id,
      refresh: true,
    });
  } catch (error) {
    logger.error('Failed to delete document', error, 'ES');
  }
}

export async function getElasticsearchHealth() {
  const es = await getElasticsearchClient();
  if (!es) return { status: 'unavailable' };

  try {
    const health = await es.cluster.health();
    return {
      status: 'available',
      clusterHealth: health,
    };
  } catch (error) {
    return { status: 'error', error };
  }
}
