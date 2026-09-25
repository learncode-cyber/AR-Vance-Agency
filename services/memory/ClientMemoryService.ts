import { prisma } from '@/lib/prisma'

export interface MemoryEntry {
  id: string
  clientId: string
  type: string // interaction, context, preference, insight
  key: string
  value: string
  importance: number // 0-1
  expiresAt?: Date
}

export class ClientMemoryService {
  async storeMemory(
    clientId: string,
    type: string,
    key: string,
    value: string,
    importance: number = 0.5,
    ttl: number = 86400 * 30 // 30 days default
  ) {
    const memoryId = `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const expiresAt = new Date(Date.now() + ttl * 1000)

    return prisma.clientMemory.create({
      data: {
        id: memoryId,
        clientId,
        type,
        key,
        value,
        importance,
        expiresAt,
        accessCount: 0,
      }
    })
  }

  async getMemory(clientId: string, key: string) {
    const memory = await prisma.clientMemory.findFirst({
      where: { clientId, key }
    })

    if (memory) {
      // Increment access count
      await prisma.clientMemory.update({
        where: { id: memory.id },
        data: { accessCount: memory.accessCount + 1, lastAccessedAt: new Date() }
      })
    }

    return memory
  }

  async getClientContext(clientId: string, type?: string) {
    const memories = await prisma.clientMemory.findMany({
      where: {
        clientId,
        type: type ? { equals: type } : undefined,
        expiresAt: { gt: new Date() } // Not expired
      },
      orderBy: { importance: 'desc' },
      take: 50
    })

    return memories
  }

  async updateMemory(memoryId: string, value: string, importance?: number) {
    return prisma.clientMemory.update({
      where: { id: memoryId },
      data: {
        value,
        importance: importance !== undefined ? importance : undefined,
        updatedAt: new Date()
      }
    })
  }

  async deleteMemory(memoryId: string) {
    return prisma.clientMemory.delete({ where: { id: memoryId } })
  }

  async deleteExpiredMemories() {
    return prisma.clientMemory.deleteMany({
      where: { expiresAt: { lt: new Date() } }
    })
  }

  async getMemorySummary(clientId: string) {
    const memories = await prisma.clientMemory.findMany({
      where: { clientId, expiresAt: { gt: new Date() } }
    })

    const byType = memories.reduce((acc, mem) => {
      acc[mem.type] = (acc[mem.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalImportance = memories.reduce((sum, mem) => sum + mem.importance, 0)

    return {
      clientId,
      totalMemories: memories.length,
      byType,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      memoryUsagePercent: (memories.length / 1000) * 100 // Max 1000 memories
    }
  }
}

export const clientMemoryService = new ClientMemoryService()
