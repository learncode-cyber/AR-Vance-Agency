# ISR (Incremental Static Regeneration) Configuration

## next.config.ts Updates

```typescript
const nextConfig = {
  // ... existing config
  
  // ISR Settings
  staticPageGenerationTimeout: 120,
  
  // Revalidation configuration by route
  // This would be handled in route handlers:
  
  /*
  export const revalidate = 3600; // Revalidate every hour
  
  // Or on-demand revalidation:
  export async function POST(req: Request) {
    await revalidateTag('posts');
    return Response.json({ revalidated: true, now: Date.now() })
  }
  */
};
```

## ISR Routes Configuration

### Homepage - Revalidate every 24 hours
```typescript
// app/page.tsx
export const revalidate = 86400; // 24 hours
```

### Blog Posts - Revalidate on-demand
```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600; // 1 hour fallback

export async function generateStaticParams() {
  // Generate static params for all posts
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### On-demand Revalidation Endpoint
```typescript
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret');
  
  if (secret !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tag } = await request.json();
  
  try {
    revalidateTag(tag);
    return Response.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return Response.json(
      { error: 'Revalidation failed' },
      { status: 500 }
    );
  }
}
```

## Cache Strategy by Content Type

### Static Assets
- TTL: 1 year
- Strategy: Immutable
- Revalidate: Never

### HTML Pages
- TTL: 24 hours
- Strategy: Time-based ISR
- Revalidate: On demand

### API Responses
- TTL: 5 minutes
- Strategy: Network first with fallback
- Revalidate: Time-based

### User-specific Content
- TTL: 1 hour
- Strategy: Cache but validate
- Revalidate: On user change

### Blog Posts
- TTL: 1 hour
- Strategy: ISR with fallback
- Revalidate: On post update

## Revalidation Triggers

1. **Time-based:** Automatic after TTL expires
2. **Event-based:** On data mutation (POST/PUT/DELETE)
3. **Manual:** Admin trigger via API
4. **Webhook:** External service triggers

## Monitoring

Check revalidation status:
```bash
GET /api/cache/stats
GET /api/cache/health
```

Trigger revalidation:
```bash
POST /api/cache/invalidate
{
  "type": "post",
  "id": "post-123"
}
```
