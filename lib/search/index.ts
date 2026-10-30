import type { SearchProvider, SearchQuery, SearchResponse } from './types'
import { dbSearchProvider } from './db-provider'
import { withSpan } from '@/lib/telemetry'

export * from './types'

let esProvider: SearchProvider | null = null
async function es(): Promise<SearchProvider> {
  if (!esProvider) {
    const { makeEsProvider } = await import('./es-provider')
    const { getElasticsearchClient } = await import('@/lib/elasticsearch')
    esProvider = makeEsProvider(getElasticsearchClient as never)
  }
  return esProvider
}

export function normalizeQuery(raw: string): string | null {
  const q = raw.replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim()
  return q.length >= 2 && q.length <= 100 ? q : null
}

/**
 * Search the site. Uses managed Elasticsearch/OpenSearch when configured and
 * healthy; on ANY failure silently falls back to the database provider so
 * search never takes the site down.
 */
export async function searchSite(
  query: SearchQuery,
  providers: { primary?: SearchProvider; fallback?: SearchProvider } = {}
): Promise<SearchResponse> {
  const started = Date.now()
  const fallback = providers.fallback ?? dbSearchProvider
  const primary = providers.primary ?? (process.env.ELASTICSEARCH_URL ? await es() : null)

  if (primary?.isAvailable()) {
    try {
      const r = await withSpan(`search ${primary.name}`, 'search', { 'search.provider': primary.name }, () => primary.search(query))
      return { ...r, provider: primary.name, tookMs: Date.now() - started }
    } catch (err) {
      console.warn(`[search] ${primary.name} failed, using ${fallback.name}:`, (err as Error).message)
    }
  }
  const r = await withSpan(`search ${fallback.name}`, 'search', { 'search.provider': fallback.name }, () => fallback.search(query))
  return { ...r, provider: fallback.name, tookMs: Date.now() - started }
}
