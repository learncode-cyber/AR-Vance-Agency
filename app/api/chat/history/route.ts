import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const conversationId = url.searchParams.get('conversationId')

  if (!conversationId) {
    return NextResponse.json(
      { error: 'Conversation ID required' },
      { status: 400 }
    )
  }

  try {
    const conversation = await prisma.chatConversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json({ data: conversation })
  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    )
  }
}
