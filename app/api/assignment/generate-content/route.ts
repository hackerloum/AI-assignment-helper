import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { deductCredits } from '@/lib/credits'
import { generateEssay, stripMarkdownHeaders, callGemini } from '@/lib/ai-service'

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
      // For section-based generation, create a more specific prompt
      const sectionPrompt = `Write a ${wordCount || 500}-word ${section.toLowerCase()} section for an academic assignment on: "${finalPrompt}". 

Requirements:
- Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting
- Use only paragraph breaks to separate ideas
- Write professionally and academically
- Ensure proper flow and coherence`
      
      const systemInstruction = `You are an expert academic writer. Write a well-structured ${section.toLowerCase()} section for an academic assignment. 

CRITICAL: Do NOT use markdown formatting (no ##, **, or other markdown syntax). Write plain text only with proper paragraph breaks.`
      
      // Call Gemini directly for section-specific content
      const rawContent = await callGemini(
        sectionPrompt,
        systemInstruction,
        0.7,
        Math.floor((wordCount || 500) * 1.5)
      )
      
      // Strip markdown headers (double-check)
      content = stripMarkdownHeaders(rawContent)
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

