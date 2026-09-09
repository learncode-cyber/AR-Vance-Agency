import type { NextConfig } from 'next'

const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin').replace(/^\/|\/$/g, '')

const config: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options',        value: 'DENY' },
          { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // Covers whichever slug NEXT_PUBLIC_ADMIN_PATH currently points to
        source: `/${ADMIN_PATH}/:path*`,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default config
