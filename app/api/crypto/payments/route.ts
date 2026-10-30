import { NextResponse } from 'next/server'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

// DISABLED — see /api/crypto/wallets. No payment or deposit address is generated.
export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ error: 'Crypto payments are not enabled on this site.', data: [] }, { status: 501 })
}
export async function POST() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ error: 'Crypto payments are not enabled on this site.' }, { status: 501 })
}
