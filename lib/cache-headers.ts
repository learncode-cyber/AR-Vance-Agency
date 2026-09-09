// Cache-Control headers helper
export const cacheHeaders = {
  // Static assets - cache forever
  staticAssets: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },

  // HTML pages - cache for 24 hours
  html: {
    'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    'Vary': 'Accept-Encoding',
  },

  // API responses - cache for 5 minutes
  api: {
    'Cache-Control': 'public, max-age=300, s-maxage=300',
    'Vary': 'Accept-Encoding, Authorization',
  },

  // Images - cache for 30 days
  images: {
    'Cache-Control': 'public, max-age=2592000, stale-while-revalidate=604800',
  },

  // No cache
  noCache: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },

  // Revalidate on request
  revalidate: {
    'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  },
};

export function setResponseCacheHeaders(
  headers: Headers,
  type: keyof typeof cacheHeaders
) {
  const headerSet = cacheHeaders[type];
  Object.entries(headerSet).forEach(([key, value]) => {
    headers.set(key, value);
  });
}
