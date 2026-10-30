export type SearchEntity = 'post' | 'service' | 'portfolio'

export interface SearchHit {
  type: SearchEntity
  title: string
  url: string
  snippet: string
}

export interface SearchResponse {
  total: number
  hits: SearchHit[]
  provider: string
  tookMs: number
}

export interface SearchQuery {
  q: string
  types?: SearchEntity[]
  limit: number
}

/** Business code depends on this interface only; Elasticsearch/OpenSearch/DB are interchangeable. */
export interface SearchProvider {
  readonly name: string
  isAvailable(): boolean
  search(query: SearchQuery): Promise<Omit<SearchResponse, 'provider' | 'tookMs'>>
}
