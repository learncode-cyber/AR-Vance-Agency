// Edge- and Node-safe (uses the Web Crypto global, available in Node 22 and the edge runtime).
const VALID = /^[A-Za-z0-9_-]{8,64}$/

/** Reuse a caller-supplied ID only if it is a plain token (prevents log injection / header abuse). */
export function resolveRequestId(incoming: string | null | undefined): string {
  return incoming && VALID.test(incoming) ? incoming : globalThis.crypto.randomUUID()
}
