import { NextResponse } from 'next/server'
import { getAdminSession, unauthorized } from '@/lib/api-auth'

// Not implemented. This route previously returned an empty success response, which made the
// dashboard look like it worked. It now says so explicitly (HTTP 501) until a real,
// tested implementation is connected.
export async function POST() {
  if (!(await getAdminSession())) return unauthorized()
  return NextResponse.json({ error: 'This AI feature is not implemented yet.', implemented: false }, { status: 501 })
}
