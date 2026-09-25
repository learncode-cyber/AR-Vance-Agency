import { NextRequest, NextResponse } from 'next/server'
import { contentEngine } from '@/services/agents/ContentEngine'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentType, topic, style } = await req.json()
  const content = await contentEngine.generateContent(contentType, topic, style)
  return NextResponse.json(content)
}
