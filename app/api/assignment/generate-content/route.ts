import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { deductCredits } from '@/lib/credits'
import { generateEssay } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header (more reliable than cookies)
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    // Get cookies as fallback
    const cookieStore = await cookies()
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Cookie setting might fail in API routes
            }
          },
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    )
    
    // Get authenticated user (will use the access token if provided)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please refresh the page and try again.' },
        { status: 401 }
      )
    }

    const { section, prompt, assignment_type, topic, wordCount, assignmentType } = await request.json()

    const finalPrompt = prompt || topic
    const finalAssignmentType = assignment_type || assignmentType

    if (!finalPrompt) {
      return NextResponse.json({ error: 'Prompt or topic required' }, { status: 400 })
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
    // If section is provided, generate section-specific content
    let content: string
    if (section) {
      // Use the prompt directly for section-based generation
      content = await generateEssay(finalPrompt, wordCount || 500)
    } else {
      // Legacy: use topic and wordCount
      content = await generateEssay(finalPrompt, wordCount || 1000)
    }

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

