import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const appVersion = url.searchParams.get('appVersion')
  const deviceType = url.searchParams.get('deviceType')
  const userId = url.searchParams.get('userId')

  if (!appVersion || !deviceType) {
    return NextResponse.json(
      { error: 'appVersion and deviceType required' },
      { status: 400 }
    )
  }

  try {
    // Get all active feature flags
    const flags = await prisma.appFeatureFlag.findMany({
      where: { active: true },
    })

    // Determine which flags are enabled for this user
    const enabledFlags: Record<string, boolean> = {}

    for (const flag of flags) {
      let enabled = flag.enabled

      // Check if app version is compatible
      const minVersion = flag.minAppVersion.split('.').map(Number)
      const currentVersion = appVersion.split('.').map(Number)

      const isCompatible = currentVersion.every(
        (v, i) => v >= (minVersion[i] || 0)
      )

      if (!isCompatible) {
        enabled = false
      }

      // Check device type
      if (enabled && flag.targetDeviceTypes) {
        const types = flag.targetDeviceTypes.split(',')
        enabled = types.includes(deviceType)
      }

      // Check rollout percentage
      if (enabled && flag.rolloutPercentage < 100 && userId) {
        const hash = userId.charCodeAt(0) % 100
        enabled = hash < flag.rolloutPercentage
      }

      enabledFlags[flag.name] = enabled
    }

    return NextResponse.json({ data: enabledFlags })
  } catch (error) {
    console.error('Feature flags fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    )
  }
}
