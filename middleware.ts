import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Same value the client uses (lib/admin-path.ts) — duplicated here because
// middleware runs in the Edge runtime and must stay a tiny, dependency-free
// file. Keep both in sync if you ever change how the env var is read.
const ADMIN_PATH = (process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin').replace(/^\/|\/$/g, '')

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
  // Runs on every page route (static assets / API routes excluded) so it
  // can react to whatever ADMIN_PATH is currently set to, without needing
  // a hard-coded matcher tied to one specific slug.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
