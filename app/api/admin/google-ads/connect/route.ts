import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { cookies } from 'next/headers'
import { getAdminSession, unauthorized } from '@/lib/api-auth'
import { getSettings } from '@/lib/settings'
import { buildGoogleAdsOAuthUrl } from '@/lib/google-ads-api'

export async function GET(req: Request) {
  const session = await getAdminSession()
  if (!session) return unauthorized()

  const settings = await getSettings()
  if (!settings.googleAdsOAuthClientId) {
    return NextResponse.json(
      { error: 'Set the Google Ads OAuth Client ID and Secret in Settings first, then try connecting.' },
      { status: 400 }
    )
  }

  const redirectUri = new URL('/api/admin/google-ads/callback', req.url).toString()

  // CSRF protection: random state, verified in the callback
  const state = crypto.randomBytes(16).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set('google_ads_oauth_state', state, { httpOnly: true, maxAge: 600, path: '/', sameSite: 'lax' })

  const authUrl = buildGoogleAdsOAuthUrl(settings.googleAdsOAuthClientId, redirectUri, state)
  return NextResponse.redirect(authUrl)
}
