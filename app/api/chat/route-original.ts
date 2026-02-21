import { NextRequest, NextResponse } from 'next/server'
import { openai, SYSTEM_PROMPT } from '@/lib/openai'
import type { ChatMessage } from '@/types'

export async function POST(req: NextRequest) {
  const { messages } = await req.json() as { messages: ChatMessage[] }

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Invalid messages' }, { status: 400 })
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast + cheap, perfect for this
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content }))
      ],
      max_tokens: 250,
      temperature: 0.7,
    })

    const message = response.choices[0]?.message?.content || "I'm sorry, I couldn't process that. Please try again."
    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'AI service unavailable', message: "I'm having trouble right now. Please try the search page instead!" },
      { status: 500 }
    )
  }
}
