import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import type { Session } from 'next-auth'

// Import types to ensure NextAuth augmentations are loaded

export const dynamic = 'force-dynamic'

// Crisis keywords for detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
  'self harm', 'hurt myself', 'cut myself', 'overdose',
]

function detectCrisis(text: string): boolean {
  const lowerText = text.toLowerCase()
  return CRISIS_KEYWORDS.some((keyword) => lowerText.includes(keyword))
}

export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null
    
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { message, sessionId } = await request.json()

    if (!message) {
      return new Response('Message is required', { status: 400 })
    }

    // Detect crisis in user message
    const hasCrisis = detectCrisis(message)

    // Get userId in a type-safe way to avoid depending on TS augmentation
    const userId = (session as any)?.user?.id

    // Get or create AI session
    let aiSession: any
    if (sessionId) {
      aiSession = await prisma.aISession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }

    if (!aiSession) {
      aiSession = await prisma.aISession.create({
        data: {
          userId,
          title: message.slice(0, 50) + '...',
        },
        include: { messages: true },
      })
    }

    // Save user message
    await prisma.message.create({
      data: {
        sessionId: aiSession.id,
        role: 'user',
        content: message,
        hasCrisisFlag: hasCrisis,
      },
    })

    // Build conversation history
    const conversationHistory = [
      {
        role: 'system',
        content: `You are a compassionate and empathetic AI mental health support companion. Your role is to:
- Provide emotional support and validation
- Suggest coping strategies and grounding exercises
- Listen actively and respond with empathy
- Encourage professional help when needed
- NEVER provide medical diagnoses or prescribe medications
- If you detect crisis language (suicide, self-harm), immediately provide crisis resources

Be warm, supportive, and culturally sensitive. Keep responses concise and actionable.`,
      },
      ...(aiSession.messages?.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) ?? []),
      { role: 'user' as const, content: message },
    ]

    // Call LLM API with streaming
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: conversationHistory,
        stream: true,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('LLM API request failed')
    }

    // Create a readable stream
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''
        let partialRead = ''

        try {
          while (true) {
            const { done, value } = await reader?.read() ?? { done: true, value: undefined }
            if (done) break

            partialRead += decoder.decode(value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Save assistant message to database
                  const assistantHasCrisis = detectCrisis(buffer)
                  await prisma.message.create({
                    data: {
                      sessionId: aiSession.id,
                      role: 'assistant',
                      content: buffer,
                      hasCrisisFlag: assistantHasCrisis,
                    },
                  })

                  // Update session timestamp
                  await prisma.aISession.update({
                    where: { id: aiSession.id },
                    data: { updatedAt: new Date() },
                  })

                  // Send final data with session info
                  const finalData = JSON.stringify({
                    done: true,
                    sessionId: aiSession.id,
                    hasCrisis: hasCrisis || assistantHasCrisis,
                  })
                  controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content ?? ''
                  if (content) {
                    buffer += content
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}
