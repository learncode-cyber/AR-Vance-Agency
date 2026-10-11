import * as Sentry from '@sentry/nextjs'

// Thin tracing layer over Sentry (which is OpenTelemetry-based in v8+).
// With no DSN configured spans are simply not recorded and `fn` still runs
// exactly as before, so this is safe to call everywhere.
//
// Naming: op = "ai.agent" | "ai.model" | "ai.tool" | "job" | "search" | "db"
export type SpanAttrs = Record<string, string | number | boolean | undefined>

const clean = (a: SpanAttrs): Record<string, string | number | boolean> =>
  Object.fromEntries(Object.entries(a).filter(([, v]) => v !== undefined)) as Record<string, string | number | boolean>

/**
 * Run `fn` inside a span. Marks the span as errored (and rethrows) when `fn`
 * throws. `fn` receives `setAttrs` to attach results (token counts, status…)
 * once they are known.
 */
export async function withSpan<T>(
  name: string,
  op: string,
  attrs: SpanAttrs,
  fn: (setAttrs: (a: SpanAttrs) => void) => Promise<T>
): Promise<T> {
  return Sentry.startSpan({ name, op, attributes: clean(attrs) }, async (span) => {
    const setAttrs = (a: SpanAttrs) => { for (const [k, v] of Object.entries(clean(a))) span.setAttribute(k, v) }
    try {
      return await fn(setAttrs)
    } catch (err) {
      span.setStatus({ code: 2, message: err instanceof Error ? err.name : 'error' }) // 2 = ERROR; message is the class only, never user data
      throw err
    }
  })
}

/** Attach the request ID (set by middleware) to the current scope so errors/traces correlate with logs. */
export function tagRequest(requestId: string): void {
  Sentry.getCurrentScope().setTag('request_id', requestId)
}
