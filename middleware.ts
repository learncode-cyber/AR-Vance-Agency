import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveRequestId } from '@/lib/request-id'

// Server-only on purpose: this must never be NEXT_PUBLIC_* — Next.js inlines
// any NEXT_PUBLIC_ env var into client bundles at build time, which would
// leak the admin slug into JS anyone can read. Client components that need
// to link within the admin panel derive the current segment from
// usePathname() at runtime instead (see components/admin/AdminSidebar.tsx).
const ADMIN_PATH = (process.env.ADMIN_PATH || 'admin').replace(/^\/|\/$/g, '')

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── API routes: attach a request ID to the request (so handlers/logs/Sentry
  // can correlate) and to the response (so a user can quote it in a bug report).
  if (pathname.startsWith('/api/')) {
    const requestId = resolveRequestId(request.headers.get('x-request-id'))
    const headers = new Headers(request.headers)
    headers.set('x-request-id', requestId)
    const res = NextResponse.next({ request: { headers } })
    res.headers.set('x-request-id', requestId)
    return res
  }

  // ── Block direct access to the real internal /admin path ──
  // Once a custom slug is configured, the literal /admin path should be
  // unreachable — this is what makes hiding the panel actually work.
  if (ADMIN_PATH !== 'admin' && (pathname === '/admin' || pathname.startsWith('/admin/'))) {
    return NextResponse.rewrite(new URL('/not-found-admin-guard', request.url))
  }

  // ── Requests to the public admin slug ──
  if (pathname === `/${ADMIN_PATH}` || pathname.startsWith(`/${ADMIN_PATH}/`)) {
    const internalPath = '/admin' + pathname.slice(ADMIN_PATH.length + 1)
    const url = request.nextUrl.clone()
    url.pathname = internalPath

    // Login page itself needs no auth check
    if (internalPath === '/admin/login') {
      return NextResponse.rewrite(url)
    }

    // Every other admin page requires a valid-looking session cookie
    if (internalPath.startsWith('/admin')) {
      const token = request.cookies.get('admin_token')?.value
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = `/${ADMIN_PATH}/login`

      if (!token) {
        return NextResponse.redirect(loginUrl)
      }
      if (token.split('.').length !== 3) {
        const res = NextResponse.redirect(loginUrl)
        res.cookies.delete('admin_token')
        return res
      }
    }

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  // Runs on every page and API route (static assets excluded) so it
  // can react to whatever ADMIN_PATH is currently set to, without needing
  // a hard-coded matcher tied to one specific slug.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
