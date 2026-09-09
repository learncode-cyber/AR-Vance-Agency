# Elasticsearch Setup Guide

## Installation

### Docker Compose
```yaml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

volumes:
  elasticsearch_data:
```

### Start
```bash
docker-compose up -d
```

## Environment Variables

```bash
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USER=elastic
ELASTICSEARCH_PASSWORD=changeme
```

## Index Mapping

Automatically created on initialization with proper mappings for:
- Posts (text search)
- Users (keyword search)
- Products (price and category)
- Comments (nested content)

## Indexing

### Automatic Indexing
```typescript
import { Indexer } from '@/lib/indexer';

// On app startup
await Indexer.initializeIndices();
await Indexer.indexPosts();
await Indexer.indexUsers();
```

### Manual Indexing
```typescript
await Indexer.addDocument('posts', 'post-123', {
  title: 'Post Title',
  content: 'Post content...',
  tags: ['tag1', 'tag2'],
});
```

## Search Endpoints

### Search
```bash
POST /api/search
{
  "query": "search term",
  "index": "posts",
  "page": 1,
  "limit": 20,
  "filters": { "category": "tech" }
}
```

### Suggestions (Autocomplete)
```bash
GET /api/search/suggest?query=search&index=posts&limit=10
```

### Facets
```bash
GET /api/search/facets?index=posts
```

### Analytics
```bash
GET /api/search/analytics?metric=popular&days=7
```

## Performance Tuning

### Shard Configuration
- Posts: 2 shards, 1 replica
- Users: 1 shard, 1 replica
- Products: 2 shards, 1 replica

### Query Optimization
- Results are cached for 5 minutes
- Aggregations limited to 50 results
- Pagination enforced

### Index Optimization
```bash
# Optimize index
POST /posts/_forcemerge

# Check health
GET /_cluster/health

# Index stats
GET /posts/_stats
```

## Monitoring

### Health Check
```bash
GET /api/cache/health
```

### Cluster Status
```bash
GET /_cluster/health
```

### Index Info
```bash
GET /_cat/indices?v
```

## Troubleshooting

### Connection Issues
- Check Elasticsearch is running: `curl http://localhost:9200`
- Verify credentials
- Check firewall rules

### Indexing Slow
- Run reindex: POST `/_reindex`
- Check disk space
- Monitor JVM memory

### Search Slow
- Check query complexity
- Verify cache is working
- Review shard distribution

