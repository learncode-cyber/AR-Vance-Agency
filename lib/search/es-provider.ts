import type { SearchHit, SearchProvider, SearchQuery } from './types'

// Works with managed Elasticsearch or OpenSearch (compatible _search API).
// Index documents must look like: { type, title, url, snippet, content? }.
export const SITE_INDEX = process.env.ELASTICSEARCH_SITE_INDEX || 'site-content'

type EsLike = { search: (args: any) => Promise<any> }

export function makeEsProvider(getClient: () => Promise<EsLike | null>): SearchProvider {
  return {
    name: 'elasticsearch',
    isAvailable: () => !!process.env.ELASTICSEARCH_URL,
    async search({ q, types, limit }: SearchQuery) {
      const es = await getClient()
      if (!es) throw new Error('Elasticsearch client unavailable')
      const res = await es.search({
        index: SITE_INDEX,
        size: limit,
        query: {
          bool: {
            must: [{ multi_match: { query: q, fields: ['title^3', 'snippet^2', 'content'], fuzziness: 'AUTO' } }],
            ...(types && types.length ? { filter: [{ terms: { type: types } }] } : {}),
          },
        },
        _source: ['type', 'title', 'url', 'snippet'],
      })
      const rawHits = res?.hits?.hits ?? res?.body?.hits?.hits ?? []
      const hits: SearchHit[] = rawHits
        .map((h: any) => h._source)
        .filter((s: any) => s && typeof s.title === 'string' && typeof s.url === 'string' && String(s.url).startsWith('/'))
        .map((s: any) => ({ type: s.type, title: s.title, url: s.url, snippet: String(s.snippet ?? '') }))
      const t = res?.hits?.total ?? res?.body?.hits?.total
      return { total: typeof t === 'number' ? t : (t?.value ?? hits.length), hits }
    },
  }
}
