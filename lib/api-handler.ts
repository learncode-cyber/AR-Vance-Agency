import { NextResponse } from 'next/server'
import { resolveRequestId } from './request-id'
import { tagRequest } from './telemetry'
import { AppError, RateLimitError, toAppError } from './errors'

export type ApiHandler<C = unknown> = (req: Request, ctx: C & { requestId: string }) => Promise<Response> | Response

/**
 * Wrap a route handler: assigns a request ID, converts any thrown error into
 * a consistent JSON body, logs the real cause server-side, and never leaks
 * stack traces / DB errors / paths to the client.
 *
 *   export const POST = withApi(async (req, { requestId }) => { ... })
 */
export function withApi<C = unknown>(handler: ApiHandler<C>) {
  return async (req: Request, ctx?: C): Promise<Response> => {
    const requestId = resolveRequestId(req.headers.get('x-request-id'))
    const started = Date.now()
    tagRequest(requestId)
    try {
      const res = await handler(req, { ...(ctx as C), requestId })
      res.headers.set('x-request-id', requestId)
      return res
    } catch (raw) {
      const err: AppError = toAppError(raw)
      const logLine = {
        requestId,
        code: err.code,
        status: err.status,
        path: safePath(req.url),
        method: req.method,
        ms: Date.now() - started,
        message: err.message,
      }
      // 5xx are real faults (with cause); 4xx are expected client errors.
      if (err.status >= 500) console.error('[api]', logLine, err.cause ?? raw)
      else console.warn('[api]', logLine)

      const body: Record<string, unknown> = {
        error: err.publicMessage,
        code: err.code,
        requestId,
      }
      if (err.code === 'VALIDATION_ERROR' && err.details && process.env.NODE_ENV !== 'production') {
        body.details = err.details
      }
      const headers: Record<string, string> = { 'x-request-id': requestId }
      if (err instanceof RateLimitError && err.retryAfterSeconds) headers['retry-after'] = String(err.retryAfterSeconds)
      return NextResponse.json(body, { status: err.status, headers })
    }
  }
}

function safePath(url: string): string {
  try { return new URL(url).pathname } catch { return 'unknown' }
}
