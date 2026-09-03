import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getSettings } from '@/lib/settings'
import { exchangeGoogleAdsAuthCode } from '@/lib/google-ads-api'
import { ADMIN_PATH } from '@/lib/admin-path'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const errorParam = url.searchParams.get('error')

  const settingsUrl = new URL(`/${ADMIN_PATH}/settings`, req.url)

  if (errorParam) {
    settingsUrl.searchParams.set('google_ads_error', errorParam)
    return NextResponse.redirect(settingsUrl)
  }

  const cookieStore = await cookies()
  const expectedState = cookieStore.get('google_ads_oauth_state')?.value
  cookieStore.delete('google_ads_oauth_state')

  if (!code || !state || state !== expectedState) {
    settingsUrl.searchParams.set('google_ads_error', 'invalid_state')
    return NextResponse.redirect(settingsUrl)
  }

  try {
    const settings = await getSettings()
    const redirectUri = new URL('/api/admin/google-ads/callback', req.url).toString()

    const { refreshToken } = await exchangeGoogleAdsAuthCode(
      code,
      settings.googleAdsOAuthClientId,
      settings.googleAdsOAuthClientSecret,
      redirectUri
    )

    await prisma.settings.update({ where: { id: 1 }, data: { googleAdsRefreshToken: refreshToken } })

    settingsUrl.searchParams.set('google_ads_connected', '1')
    return NextResponse.redirect(settingsUrl)
  } catch (err) {
    settingsUrl.searchParams.set('google_ads_error', err instanceof Error ? err.message : 'unknown_error')
    return NextResponse.redirect(settingsUrl)
  }
}
