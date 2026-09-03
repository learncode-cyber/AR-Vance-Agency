const GOOGLE_ADS_API_VERSION = 'v18'

/**
 * Exchanges a stored OAuth refresh token for a short-lived access token.
 * Refresh tokens don't expire (unless revoked), so this runs on every
 * conversion upload rather than caching — the token endpoint is fast
 * and this keeps the implementation simple and always-correct.
 */
async function getAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to refresh Google OAuth token: ${res.status} ${body.slice(0, 300)}`)
  }
  const json = await res.json()
  return json.access_token as string
}

export interface GoogleAdsConversionUpload {
  developerToken: string
  oauthClientId: string
  oauthClientSecret: string
  refreshToken: string
  customerId: string          // digits only, no dashes
  loginCustomerId?: string    // MCC ID, digits only, if applicable
  conversionActionId: string
  gclid: string
  conversionDateTime: Date
  conversionValue?: number
  currencyCode?: string
}

/**
 * Uploads a single click conversion to Google Ads via the official
 * Google Ads API (ConversionUploadService). Requires an approved
 * Developer Token — see DEPLOYMENT-HOSTINGER-BUSINESS.md for the
 * application process.
 */
export async function uploadGoogleAdsClickConversion(
  input: GoogleAdsConversionUpload
): Promise<{ ok: boolean; error?: string }> {
  try {
    const accessToken = await getAccessToken(input.oauthClientId, input.oauthClientSecret, input.refreshToken)

    const conversionActionResourceName =
      `customers/${input.customerId}/conversionActions/${input.conversionActionId}`

    // Google Ads API expects "YYYY-MM-DD HH:MM:SS+HH:MM"
    const pad = (n: number) => String(n).padStart(2, '0')
    const d = input.conversionDateTime
    const conversionDateTime =
      `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
      `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}+00:00`

    const body = {
      conversions: [{
        gclid: input.gclid,
        conversionAction: conversionActionResourceName,
        conversionDateTime,
        ...(input.conversionValue != null && {
          conversionValue: input.conversionValue,
          currencyCode: input.currencyCode ?? 'USD',
        }),
      }],
      partialFailure: true,
    }

    const res = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${input.customerId}:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': input.developerToken,
          ...(input.loginCustomerId && { 'login-customer-id': input.loginCustomerId }),
        },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const errBody = await res.text()
      return { ok: false, error: `Google Ads API ${res.status}: ${errBody.slice(0, 400)}` }
    }

    const json = await res.json()
    if (json.partialFailureError) {
      return { ok: false, error: `Partial failure: ${JSON.stringify(json.partialFailureError).slice(0, 400)}` }
    }

    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

/**
 * Builds the Google OAuth consent screen URL for the "Connect Google Ads
 * Account" button in the admin panel. Uses access_type=offline +
 * prompt=consent so Google always returns a refresh_token (without
 * prompt=consent, Google only returns one on the very first authorization).
 */
export function buildGoogleAdsOAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/adwords',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Exchanges the OAuth authorization code (from the callback redirect)
 * for a refresh token — called once, by the OAuth callback route.
 */
export async function exchangeGoogleAdsAuthCode(
  code: string, clientId: string, clientSecret: string, redirectUri: string
): Promise<{ refreshToken: string }> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Failed to exchange auth code: ${res.status} ${body.slice(0, 300)}`)
  }
  const json = await res.json()
  if (!json.refresh_token) {
    throw new Error(
      'Google did not return a refresh token. This usually means the account was already ' +
      'authorized before — go to https://myaccount.google.com/permissions, remove access for ' +
      'this app, and try connecting again.'
    )
  }
  return { refreshToken: json.refresh_token as string }
}
