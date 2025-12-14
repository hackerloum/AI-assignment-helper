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
    const targetWordCount = wordCount || 500

    if (!finalPrompt) {
      return NextResponse.json({ error: 'Prompt or topic required' }, { status: 400 })
    }

    // Calculate credits based on word count (1 credit per 100 words, minimum 5 credits)
    const creditCost = Math.max(5, Math.ceil(targetWordCount / 100))

    // Deduct credits for content generation
    const creditResult = await deductCredits(user.id, 'essay', supabase, creditCost)
    if (!creditResult.success) {
      return NextResponse.json(
        { error: `Insufficient credits. You need ${creditCost} credits but only have ${creditResult.remainingCredits}.` },
        { status: 400 }
      )
    }

    // Generate content using AI
    // If section is provided, generate section-specific content ONLY
    // If no section is provided, generate full assignment with introduction, body, and conclusion
    let content: string
    if (section) {
      // Determine section-specific instructions
      const sectionInstructions = {
        'Introduction': `Write ONLY an introduction section (${targetWordCount} words). This should:
- Start with a hook or attention-grabbing opening
- Provide background context on the topic
- Clearly state the main topic and its importance
- Present a thesis statement or main argument
- Preview what will be discussed (but do NOT write the actual discussion)
- End with a transition sentence

IMPORTANT: Write ONLY the introduction. Do NOT write body paragraphs or conclusion.`,
        
        'Body': `Write ONLY body paragraphs (${targetWordCount} words). This should:
- Develop the main arguments and points
- Use clear topic sentences for each paragraph
- Provide evidence, examples, and explanations
- Use transitions between paragraphs
- Support the thesis statement

IMPORTANT: Write ONLY body paragraphs. Do NOT write introduction or conclusion.`,
        
        'Conclusion': `Write ONLY a conclusion section (${targetWordCount} words). This should:
- Restate the thesis in different words
- Summarize the main points discussed
- Provide final thoughts or implications
- End with a strong closing statement

IMPORTANT: Write ONLY the conclusion. Do NOT write introduction or body paragraphs.`
      }

      const sectionGuidance = sectionInstructions[section as keyof typeof sectionInstructions] || 
        `Write ONLY a ${section.toLowerCase()} section (${targetWordCount} words) for an academic assignment.`

      // For section-based generation, create a very specific prompt
      const sectionPrompt = `${sectionGuidance}

Topic: "${finalPrompt}"

CRITICAL REQUIREMENTS:
- Write EXACTLY ${targetWordCount} words (aim for this target)
- Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting
- Use only paragraph breaks to separate ideas
- Write in a student-friendly, clear, and engaging style
- Use simple language where possible, but maintain academic tone
- Include examples and explanations to help understanding
- Make it comprehensive and detailed - this is for a real assignment
- Write ONLY the ${section} section - do NOT include other sections`
      
      const systemInstruction = `You are an expert academic writer specializing in creating student-friendly, comprehensive assignment content. Your writing should be:

1. **Student-Friendly**: Clear, engaging, easy to understand, with explanations of complex concepts
2. **Comprehensive**: Detailed and thorough, not superficial
3. **Academic**: Professional tone, well-structured, properly formatted
4. **Realistic**: Appropriate length and depth for actual student assignments

CRITICAL RULES:
- Do NOT use markdown formatting (no ##, **, or other markdown syntax)
- Write plain text only with proper paragraph breaks
- Write ONLY the requested section - do NOT write other sections
- Make content detailed and comprehensive to look like a real assignment
- Use ${targetWordCount} words as the target length`
      
      // Call Gemini directly for section-specific content
      const rawContent = await callGemini(
        sectionPrompt,
        systemInstruction,
        0.7,
        Math.floor(targetWordCount * 2) // Allow more tokens for longer, detailed content
      )
      
      // Strip markdown headers (double-check)
      content = stripMarkdownHeaders(rawContent)
      
      // Ensure we only have the requested section (remove any other sections that might have been generated)
      // This is a safety check in case AI still generates other sections
      if (section === 'Introduction') {
        // Remove any body or conclusion text
        const introEndMarkers = [
          '## Body',
          '## Conclusion',
          'Body:',
          'Conclusion:',
          'In the body',
          'In conclusion',
          'To conclude'
        ]
        for (const marker of introEndMarkers) {
          const index = content.toLowerCase().indexOf(marker.toLowerCase())
          if (index > 0) {
            content = content.substring(0, index).trim()
            break
          }
        }
      } else if (section === 'Body') {
        // Remove introduction or conclusion
        const bodyStartMarkers = ['## Introduction', 'Introduction:', '## Conclusion', 'Conclusion:']
        for (const marker of bodyStartMarkers) {
          const index = content.toLowerCase().indexOf(marker.toLowerCase())
          if (index > 0) {
            content = content.substring(index + marker.length).trim()
          }
        }
        const conclusionMarkers = ['## Conclusion', 'Conclusion:', 'In conclusion', 'To conclude']
        for (const marker of conclusionMarkers) {
          const index = content.toLowerCase().indexOf(marker.toLowerCase())
          if (index > 0) {
            content = content.substring(0, index).trim()
            break
          }
        }
      } else if (section === 'Conclusion') {
        // Remove introduction or body
        const conclusionStartMarkers = ['## Introduction', 'Introduction:', '## Body', 'Body:']
        for (const marker of conclusionStartMarkers) {
          const index = content.toLowerCase().indexOf(marker.toLowerCase())
          if (index > 0) {
            content = content.substring(index + marker.length).trim()
            // Find the actual conclusion start
            const conclusionMarkers = ['in conclusion', 'to conclude', 'conclusion:', '## Conclusion']
            for (const cm of conclusionMarkers) {
              const cmIndex = content.toLowerCase().indexOf(cm.toLowerCase())
              if (cmIndex > 0) {
                content = content.substring(cmIndex + cm.length).trim()
                break
              }
            }
            break
          }
        }
      }
    } else {
      // Generate full assignment with introduction, body paragraphs, and conclusion
      const fullAssignmentPrompt = `Write a complete academic assignment (${targetWordCount} words) that addresses the following question/task:

"${finalPrompt}"

STRUCTURE REQUIREMENTS:
1. **Introduction Paragraph(s)**: 
   - Start with a hook or attention-grabbing opening
   - Provide background context on the topic
   - Clearly state the main topic and its importance
   - Present a thesis statement or main argument
   - Preview what will be discussed

2. **Body Paragraphs** (multiple paragraphs):
   - Develop the main arguments and points
   - Use clear topic sentences for each paragraph
   - Provide evidence, examples, and explanations
   - Use transitions between paragraphs
   - Support the thesis statement
   - Each paragraph should focus on a specific point or aspect

3. **Conclusion Paragraph(s)**:
   - Restate the thesis in different words
   - Summarize the main points discussed
   - Provide final thoughts or implications
   - End with a strong closing statement

CRITICAL FORMATTING RULES:
- Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting
- Use only paragraph breaks (double line breaks) to separate paragraphs
- Write in a student-friendly, clear, and engaging style
- Use simple language where possible, but maintain academic tone
- Include examples and explanations to help understanding
- Make it comprehensive and detailed - this is for a real assignment
- Ensure the total word count is approximately ${targetWordCount} words
- The assignment should flow naturally from introduction through body to conclusion`

      const systemInstruction = `You are an expert academic writer specializing in creating student-friendly, comprehensive assignment content. Your writing should be:

1. **Student-Friendly**: Clear, engaging, easy to understand, with explanations of complex concepts
2. **Comprehensive**: Detailed and thorough, not superficial
3. **Academic**: Professional tone, well-structured, properly formatted
4. **Realistic**: Appropriate length and depth for actual student assignments

CRITICAL RULES:
- Do NOT use markdown formatting (no ##, **, or other markdown syntax)
- Write plain text only with proper paragraph breaks (double line breaks between paragraphs)
- Generate a COMPLETE assignment with introduction, body paragraphs, and conclusion
- Make content detailed and comprehensive to look like a real assignment
- Use ${targetWordCount} words as the target length
- Structure the assignment naturally: introduction paragraphs first, then body paragraphs, then conclusion paragraphs
- Each section should flow smoothly into the next`

      // Call Gemini directly for full assignment generation
      const rawContent = await callGemini(
        fullAssignmentPrompt,
        systemInstruction,
        0.7,
        Math.floor(targetWordCount * 2) // Allow more tokens for longer, detailed content
      )
      
      // Strip markdown headers (double-check)
      content = stripMarkdownHeaders(rawContent)
      
      // Ensure we have a complete assignment structure
      // Remove any section headers that might have been added
      content = content
        .replace(/^#{1,6}\s+(Introduction|Body|Conclusion|Intro|Body Paragraphs?|Concluding?)\s*$/gmi, '')
        .trim()
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

