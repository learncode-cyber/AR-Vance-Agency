export interface GA4Event {
  measurementId: string
  apiSecret: string
  clientId: string        // GA4 client ID — from the ga_* cookie, or a random UUID if unavailable
  eventName: string        // e.g. "generate_lead"
  params?: Record<string, unknown>
}

/**
 * Sends an event directly to Google Analytics 4 via the Measurement
 * Protocol — Google's official server-side tracking mechanism. No
 * OAuth or developer approval required, just a Measurement Protocol
 * API secret from the GA4 property.
 */
export async function sendGA4Event(event: GA4Event): Promise<{ ok: boolean; error?: string }> {
  try {
    const url = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(event.measurementId)}&api_secret=${encodeURIComponent(event.apiSecret)}`

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: event.clientId,
        events: [{ name: event.eventName, params: event.params ?? {} }],
      }),
    })

    // GA4 Measurement Protocol returns 204 with no body on success and
    // doesn't validate payloads synchronously — a non-2xx here means the
    // request itself was malformed (bad secret, bad JSON, etc).
    if (!res.ok) {
      return { ok: false, error: `GA4 Measurement Protocol ${res.status}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
