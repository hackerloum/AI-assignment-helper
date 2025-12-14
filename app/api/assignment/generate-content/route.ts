import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { deductCredits } from '@/lib/credits'
import { generateEssay, stripMarkdownHeaders, callGemini } from '@/lib/ai-service'

/**
 * Detect the type of assignment question
 */
function detectQuestionType(question: string): 'multiple' | 'describe_terms' | 'essay' {
  const lowerQuestion = question.toLowerCase()
  
  // Check for "describe the following terms" or similar patterns
  if (
    lowerQuestion.includes('describe the following') ||
    lowerQuestion.includes('define the following') ||
    lowerQuestion.includes('explain the following') ||
    lowerQuestion.includes('what is') && (lowerQuestion.includes('term') || lowerQuestion.includes('concept'))
  ) {
    return 'describe_terms'
  }
  
  // Check for multiple questions (numbered questions, bullet points, or multiple question marks)
  const questionCount = (question.match(/\?/g) || []).length
  const numberedQuestions = question.match(/\d+[\.\)]\s*[A-Z]/g) || question.match(/^[a-z]\)/gim) || []
  
  if (questionCount >= 2 || numberedQuestions.length >= 2) {
    return 'multiple'
  }
  
  // Default to essay type
  return 'essay'
}

/**
 * Extract terms to describe from the question
 */
function extractTerms(question: string): string[] {
  const terms: string[] = []
  
  // Look for patterns like "describe: term1, term2, term3" or "terms: term1, term2"
  const colonMatch = question.match(/(?:describe|define|explain)[^:]*:\s*([^\n]+)/i)
  if (colonMatch) {
    const termList = colonMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean)
    if (termList.length > 0) {
      return termList
    }
  }
  
  // Look for numbered or bulleted lists
  const numberedTerms = question.match(/\d+[\.\)]\s*([^\n]+)/g)
  if (numberedTerms && numberedTerms.length >= 2) {
    return numberedTerms.map(t => t.replace(/^\d+[\.\)]\s*/, '').trim())
  }
  
  // Look for terms in quotes
  const quotedTerms = question.match(/"([^"]+)"/g)
  if (quotedTerms) {
    return quotedTerms.map(t => t.replace(/"/g, ''))
  }
  
  return []
}

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
    let content: string = ''
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
- **PRIORITIZE TANZANIAN EXAMPLES**: Include relevant Tanzanian case studies, institutions, policies, organizations, or real-world examples when applicable
- Make it comprehensive and detailed - this is for a real assignment
- Write ONLY the ${section} section - do NOT include other sections
- When relevant, use Tanzanian context, institutions, or examples`
      
      const systemInstruction = `You are an expert academic writer specializing in creating student-friendly, comprehensive assignment content for Tanzanian students. Your writing should be:

1. **Student-Friendly**: Clear, engaging, easy to understand, with explanations of complex concepts
2. **Comprehensive**: Detailed and thorough, not superficial
3. **Academic**: Professional tone, well-structured, properly formatted
4. **Realistic**: Appropriate length and depth for actual student assignments
5. **Tanzanian Context-Focused**: Prioritize Tanzanian examples, case studies, institutions, and local context when relevant

TANZANIAN CONTEXT EXPERTISE:
- You have deep knowledge of Tanzanian institutions, policies, and context
- You prioritize Tanzanian examples over generic international examples when relevant
- You understand Tanzanian universities, government structure, local businesses, and NGOs
- You can relate academic concepts to Tanzanian real-world situations

CRITICAL RULES:
- Do NOT use markdown formatting (no ##, **, or other markdown syntax)
- Write plain text only with proper paragraph breaks
- Write ONLY the requested section - do NOT write other sections
- Make content detailed and comprehensive to look like a real assignment
- Use ${targetWordCount} words as the target length
- Include Tanzanian examples or context when relevant to the topic`
      
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
      // Detect question type and generate accordingly
      const questionType = detectQuestionType(finalPrompt)
      const terms = extractTerms(finalPrompt)
      
      let fullAssignmentPrompt: string
      
      if (questionType === 'describe_terms' && terms.length > 0) {
        // Handle "describe the following terms" type assignments
        const termsList = terms.map((t, i) => `${i + 1}. ${t}`).join('\n')
        fullAssignmentPrompt = `Write a complete academic assignment (${targetWordCount} words) that describes and explains the following terms:

${termsList}

STRUCTURE REQUIREMENTS:
1. **Introduction Paragraph(s)**: 
   - Start with a brief introduction explaining the importance of understanding these terms
   - Provide context on how these terms relate to each other or the subject area
   - Preview what will be discussed

2. **Body Paragraphs** (one section per term):
   - For EACH term, provide:
     * A clear definition
     * Detailed explanation of the concept
     * Key characteristics or components
     * Examples from Tanzania (institutions, policies, real-world applications)
     * How it relates to the subject or other terms
   - Use clear transitions between terms
   - Each term should be explained in 1-2 paragraphs
   - **PRIORITIZE TANZANIAN EXAMPLES**: Include relevant Tanzanian case studies, institutions, policies, or real-world examples for each term

3. **Conclusion Paragraph(s)**:
   - Summarize the key terms and their importance
   - Explain how these terms relate to each other (if applicable)
   - Provide final thoughts on their significance, especially in the Tanzanian context
   - End with a strong closing statement

TANZANIAN CONTEXT REQUIREMENTS:
- For each term, include Tanzanian examples or case studies when relevant
- Reference Tanzanian institutions, policies, or organizations
- Relate each term to Tanzanian context, challenges, or opportunities

CRITICAL FORMATTING RULES:
- Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting
- Use only paragraph breaks (double line breaks) to separate paragraphs
- Write in a student-friendly, clear, and engaging style
- Use simple language where possible, but maintain academic tone
- Make it comprehensive and detailed - this is for a real assignment
- Ensure the total word count is approximately ${targetWordCount} words
- Address ALL ${terms.length} terms provided
- The assignment should flow naturally from introduction through body to conclusion`
      
      } else if (questionType === 'multiple') {
        // Handle multiple questions (2-3 questions)
        // Extract individual questions
        const questions = finalPrompt
          .split(/\n+/)
          .map((q: string) => q.trim())
          .filter((q: string) => q.length > 0 && (q.includes('?') || /^\d+[\.\)]/.test(q) || /^[a-z]\)/.test(q)))
        
        const questionsList = questions.length > 0 
          ? questions.map((q: string, i: number) => `${i + 1}. ${q.replace(/^\d+[\.\)]\s*/, '').replace(/^[a-z]\)\s*/, '')}`).join('\n')
          : finalPrompt
        
        fullAssignmentPrompt = `Write a complete academic assignment (${targetWordCount} words) that answers the following ${questions.length > 0 ? questions.length : 'multiple'} questions:

${questionsList}

STRUCTURE REQUIREMENTS:
1. **Introduction Paragraph(s)**: 
   - Start with a hook or attention-grabbing opening relevant to Tanzania
   - Provide background context on the topic, preferably with Tanzanian context
   - Clearly state that you will address ${questions.length > 0 ? questions.length : 'multiple'} questions
   - Preview what will be discussed

2. **Body Paragraphs** (organized by question):
   - Address EACH question separately and thoroughly
   - For each question, provide:
     * A clear answer with explanation
     * Supporting evidence and examples
     * Tanzanian examples, case studies, or context when relevant
     * Detailed analysis and discussion
   - Use clear transitions between questions
   - Each question should be answered in 2-4 paragraphs depending on complexity
   - **PRIORITIZE TANZANIAN EXAMPLES**: Include relevant Tanzanian case studies, institutions, policies, organizations, or real-world examples

3. **Conclusion Paragraph(s)**:
   - Summarize the answers to all questions
   - Provide final thoughts or implications, especially for Tanzania
   - Show how the answers relate to each other (if applicable)
   - End with a strong closing statement

TANZANIAN CONTEXT REQUIREMENTS:
- For each question, include Tanzanian examples or case studies when relevant
- Reference Tanzanian institutions, policies, or organizations
- Relate answers to Tanzanian context, challenges, or opportunities

CRITICAL FORMATTING RULES:
- Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting
- Use only paragraph breaks (double line breaks) to separate paragraphs
- Write in a student-friendly, clear, and engaging style
- Use simple language where possible, but maintain academic tone
- Make it comprehensive and detailed - this is for a real assignment
- Ensure the total word count is approximately ${targetWordCount} words
- Answer ALL questions provided
- The assignment should flow naturally from introduction through body to conclusion`
      
      } else {
        // Default essay-type assignment
        fullAssignmentPrompt = `Write a complete academic assignment (${targetWordCount} words) that addresses the following question/task:

"${finalPrompt}"

STRUCTURE REQUIREMENTS:
1. **Introduction Paragraph(s)**: 
   - Start with a hook or attention-grabbing opening relevant to Tanzania
   - Provide background context on the topic, preferably with Tanzanian context
   - Clearly state the main topic and its importance, especially in the Tanzanian context
   - Present a thesis statement or main argument
   - Preview what will be discussed

2. **Body Paragraphs** (multiple paragraphs):
   - Develop the main arguments and points
   - Use clear topic sentences for each paragraph
   - Provide evidence, examples, and explanations
   - **PRIORITIZE TANZANIAN EXAMPLES**: Include relevant Tanzanian case studies, institutions, policies, organizations, or real-world examples
   - Use transitions between paragraphs
   - Support the thesis statement
   - Each paragraph should focus on a specific point or aspect
   - Include concrete examples: Tanzanian universities, government institutions, local businesses, NGOs, policies, or case studies from Tanzania
   - When discussing concepts, relate them to Tanzanian context where applicable

3. **Conclusion Paragraph(s)**:
   - Restate the thesis in different words
   - Summarize the main points discussed
   - Provide final thoughts or implications, especially for Tanzania
   - End with a strong closing statement

TANZANIAN CONTEXT REQUIREMENTS:
- **Prioritize Tanzanian examples**: Use examples from Tanzanian institutions, policies, organizations, or case studies
- **Relevant Tanzanian institutions**: Reference Tanzanian universities (UDSM, UDOM, SUA, etc.), government ministries, local businesses, NGOs, or Tanzanian policies when relevant
- **Local context**: When discussing concepts, relate them to Tanzanian context, challenges, or opportunities
- **Real-world examples**: Include specific, concrete examples from Tanzania rather than generic international examples
- **Cultural relevance**: Consider Tanzanian cultural, social, and economic context when appropriate

CRITICAL FORMATTING RULES:
- Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting
- Use only paragraph breaks (double line breaks) to separate paragraphs
- Write in a student-friendly, clear, and engaging style
- Use simple language where possible, but maintain academic tone
- Include examples and explanations to help understanding
- Make it comprehensive and detailed - this is for a real assignment
- Ensure the total word count is approximately ${targetWordCount} words
- The assignment should flow naturally from introduction through body to conclusion
- Include at least 2-3 concrete Tanzanian examples or case studies in the body paragraphs`
      }

      const systemInstruction = `You are an expert academic writer specializing in creating student-friendly, comprehensive assignment content for Tanzanian students. Your writing should be:

1. **Student-Friendly**: Clear, engaging, easy to understand, with explanations of complex concepts
2. **Comprehensive**: Detailed and thorough, not superficial
3. **Academic**: Professional tone, well-structured, properly formatted
4. **Realistic**: Appropriate length and depth for actual student assignments
5. **Tanzanian Context-Focused**: Prioritize Tanzanian examples, case studies, institutions, and local context

TANZANIAN CONTEXT EXPERTISE:
- You have deep knowledge of Tanzanian institutions, policies, and context
- You prioritize Tanzanian examples over generic international examples
- You understand Tanzanian universities (UDSM, UDOM, SUA, MUHAS, etc.), government structure, local businesses, and NGOs
- You can relate academic concepts to Tanzanian real-world situations
- You include relevant Tanzanian case studies, policies, or examples when applicable

CRITICAL RULES:
- Do NOT use markdown formatting (no ##, **, or other markdown syntax)
- Write plain text only with proper paragraph breaks (double line breaks between paragraphs)
- Generate a COMPLETE assignment with introduction, body paragraphs, and conclusion
- Make content detailed and comprehensive to look like a real assignment
- Use ${targetWordCount} words as the target length
- Structure the assignment naturally: introduction paragraphs first, then body paragraphs, then conclusion paragraphs
- Each section should flow smoothly into the next
- **ALWAYS include Tanzanian examples, case studies, or context when relevant to the topic**
- Include concrete, specific examples rather than vague generalizations
- When the question relates to Tanzanian context, make it the primary focus`

      // Call Gemini directly for full assignment generation
      // Using slightly higher temperature (0.75) for more creative and context-aware responses
      // Increased token limit to allow for comprehensive content with examples
      const rawContent = await callGemini(
        fullAssignmentPrompt,
        systemInstruction,
        0.75, // Slightly higher for better creativity while maintaining quality
        Math.floor(targetWordCount * 2.5) // Allow more tokens for detailed content with examples
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

