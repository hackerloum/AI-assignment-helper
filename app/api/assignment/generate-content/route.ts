import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredits } from '@/lib/credits'
import { generateEssay } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { topic, wordCount, assignmentType } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Topic required' }, { status: 400 })
    }

    // Deduct credits for content generation
    const creditResult = await deductCredits(user.id, 'essay', supabase)
    if (!creditResult.success) {
      return NextResponse.json(
        { error: `Insufficient credits. You need 10 credits but only have ${creditResult.remainingCredits}.` },
        { status: 400 }
      )
    }

    // Generate content using AI
    const content = await generateEssay(topic, wordCount)

    // Extract references from content (simple extraction - in production, use better method)
    const references: any[] = []
    // This is a placeholder - in production, you'd extract actual citations

    return NextResponse.json({ 
      success: true,
      content,
      references 
    })
  } catch (error: any) {
    console.error('Error in generate-content route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    )
  }
}

