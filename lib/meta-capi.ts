import crypto from 'crypto'

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export interface MetaCapiLeadEvent {
  pixelId: string
  accessToken: string
  testEventCode?: string
  eventId: string        // shared with the client-side fbq() call for deduplication
  email: string
  phone?: string
  fbp?: string            // _fbp cookie value
  fbc?: string             // _fbc cookie value
  clientIpAddress?: string
  clientUserAgent?: string
  eventSourceUrl: string
  value?: number
  currency?: string
}

/**
 * Sends a "Lead" event directly to Meta's servers (Conversions API).
 * This works even when the browser pixel is blocked by an ad-blocker or
 * iOS tracking restrictions, and is the recommended complement (not
 * replacement) to the client-side Pixel — send both with the same
 * event_id and Meta deduplicates them automatically.
 */
export async function sendMetaCapiLead(event: MetaCapiLeadEvent): Promise<{ ok: boolean; error?: string }> {
  try {
    const userData: Record<string, unknown> = {
      em: [sha256(event.email)],
    }
    if (event.phone) userData.ph = [sha256(event.phone.replace(/[^0-9]/g, ''))]
    if (event.fbp) userData.fbp = event.fbp
    if (event.fbc) userData.fbc = event.fbc
    if (event.clientIpAddress) userData.client_ip_address = event.clientIpAddress
    if (event.clientUserAgent) userData.client_user_agent = event.clientUserAgent

    const body = {
      data: [{
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data: userData,
        ...(event.value != null && {
          custom_data: { value: event.value, currency: event.currency ?? 'USD' },
        }),
      }],
      ...(event.testEventCode && { test_event_code: event.testEventCode }),
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${event.pixelId}/events?access_token=${encodeURIComponent(event.accessToken)}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )

    if (!res.ok) {
      const errBody = await res.text()
      return { ok: false, error: `Meta CAPI ${res.status}: ${errBody.slice(0, 300)}` }
    }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}
