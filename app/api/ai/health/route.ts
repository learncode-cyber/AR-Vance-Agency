import { NextResponse } from 'next/server'
import { getProviderRegistry } from '@/lib/ai/AIProvider'

// Public health probe. Previously threw (500, empty body) when no Gemini key was
// configured because getProvider() throws for an unregistered provider.
export async function GET() {
  try {
    const provider = getProviderRegistry().getProvider('gemini')
    return NextResponse.json({ status: provider ? 'healthy' : 'unhealthy', provider: provider?.name })
  } catch {
    return NextResponse.json({ status: 'unhealthy', provider: null, reason: 'AI provider not configured' }, { status: 503 })
  }
}
