import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { AFF_SESSION_COOKIE } from '@/lib/affiliate-session'

export async function POST() {
  ;(await cookies()).delete(AFF_SESSION_COOKIE)
  return NextResponse.json({ success: true })
}
