import { NextResponse } from 'next/server'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

// DISABLED. This used to return a randomly generated "wallet address" — funds sent to it
// would be lost forever. Real crypto wallets need a custody/RPC provider and keys, which are
// not configured here, so no address is ever issued.
export async function GET() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ error: 'Crypto payments are not enabled on this site.', data: [] }, { status: 501 })
}
export async function POST() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ error: 'Crypto payments are not enabled on this site.' }, { status: 501 })
}
