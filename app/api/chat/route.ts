import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getChatbotResponse, detectSentiment, shouldEscalate } from '@/lib/ai-chatbot'

const sendMessageSchema = z.object({
  botId: z.string(),
  conversationId: z.string().optional(),
  visitorEmail: z.string().email(),
  visitorName: z.string().min(2),
  message: z.string().min(1).max(5000),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = sendMessageSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message },
      { status: 400 }
    )
  }

  try {
    const { botId, conversationId, visitorEmail, visitorName, message } = parsed.data

    // Get or create conversation
    let conversation = conversationId
      ? await prisma.chatConversation.findUniqueOrThrow({
          where: { id: conversationId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null

    if (!conversation) {
      conversation = await prisma.chatConversation.create({
        data: {
          botId,
          visitorEmail,
          visitorName,
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
        sentiment: detectSentiment(message),
      },
    })

    // Get conversation history (last 10 messages)
    const history = conversation.messages.slice(-10).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Get AI response
    const aiResponse = await getChatbotResponse(botId, message, history)

    // Check if should escalate
    const needsEscalation = await shouldEscalate(message)

    // Save AI response
    await prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse,
      },
    })

    // Update conversation stats
    await prisma.chatConversation.update({
      where: { id: conversation.id },
      data: {
        messageCount: { increment: 2 },
        status: needsEscalation ? 'waiting_for_human' : 'open',
      },
    })

    return NextResponse.json({
      data: {
        conversationId: conversation.id,
        response: aiResponse,
        needsEscalation,
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
}
