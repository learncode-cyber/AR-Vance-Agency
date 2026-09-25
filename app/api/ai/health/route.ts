import { NextResponse } from 'next/server'
import { getProviderRegistry } from '@/lib/ai/AIProvider'

export async function GET() {
  const registry = getProviderRegistry()
  const provider = registry.getProvider('gemini')
  const isHealthy = !!provider
  
  return NextResponse.json({ status: isHealthy ? 'healthy' : 'unhealthy', provider: provider?.name })
}
