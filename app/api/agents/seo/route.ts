import { NextRequest, NextResponse } from 'next/server'
import { seoIntelligenceEngine } from '@/services/agents/SEOIntelligenceEngine'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, keywords } = await req.json()
  const analysis = await seoIntelligenceEngine.analyzeSEO(url, keywords)
  return NextResponse.json(analysis)
}
