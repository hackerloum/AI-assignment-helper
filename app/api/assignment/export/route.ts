import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateAssignmentDocument } from '@/lib/utils/docx-generator'
import { generateFromTemplate, getTemplatePath } from '@/lib/utils/docx-template-generator'
import { rebuildDocumentFromAnalysis } from '@/lib/utils/document-rebuilder'
import { deductCredits } from '@/lib/credits'

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { assignmentId } = await request.json()

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 })
    }

    // Fetch assignment data
    const { data: assignment, error } = await supabase
      .from('assignments_new')
      .select('*')
      .eq('id', assignmentId)
      .eq('user_id', user.id)
      .single()

    if (error || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if assignment was edited significantly (more than 30% content change)
    // If so, require credits for download to prevent abuse
    const requiresCredits = (assignment.content_changed_percentage || 0) > 30 || 
                           (assignment.edit_count || 0) > 0
    
    if (requiresCredits) {
      // Check if this is the first download after edit, or if it's been more than 24 hours
      const lastDownload = assignment.last_downloaded_at 
        ? new Date(assignment.last_downloaded_at)
        : null
      const now = new Date()
      const hoursSinceLastDownload = lastDownload 
        ? (now.getTime() - lastDownload.getTime()) / (1000 * 60 * 60)
        : Infinity
      
      // Require credits if:
      // 1. Content changed significantly (>30%)
      // 2. OR it's been edited and this is not the first download
      // 3. OR it's been less than 24 hours since last download (rate limiting)
      const shouldChargeCredits = (assignment.content_changed_percentage || 0) > 30 ||
                                 (assignment.download_count || 0) > 0 ||
                                 hoursSinceLastDownload < 24
      
      if (shouldChargeCredits) {
        const { CREDIT_COSTS } = await import('@/lib/constants')
        const creditCost = CREDIT_COSTS.assignment_download
        const creditResult = await deductCredits(user.id, 'essay', supabase, creditCost)
        
        if (!creditResult.success) {
          return NextResponse.json(
            { 
              error: `Insufficient credits. Downloading edited assignments requires ${creditCost} credits. You have ${creditResult.remainingCredits} credits.`,
              requiresCredits: true,
              creditCost,
              remainingCredits: creditResult.remainingCredits
            },
            { status: 402 }
          )
        }
        
        // Record download with credit charge
        await supabase
          .from('assignment_downloads')
          .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            credits_charged: creditCost,
            download_type: 'docx',
          })
        
        // Update download count and timestamp
        await supabase
          .from('assignments_new')
          .update({
            download_count: (assignment.download_count || 0) + 1,
            last_downloaded_at: new Date().toISOString(),
          })
          .eq('id', assignmentId)
      }
    }

    // Try to use document analysis rebuild if analysis_id is present
    let buffer: Buffer
    try {
      if (assignment.document_analysis_id) {
        // Use document analysis rebuild (Step 4 - Code-based formatting)
        console.log(`Using document analysis: ${assignment.document_analysis_id}`)
        
        // Fetch document analysis
        const { data: analysisData, error: analysisError } = await supabase
          .from('document_analyses')
          .select('parsed_data, structure_analysis')
          .eq('id', assignment.document_analysis_id)
          .eq('user_id', user.id)
          .single()

        if (analysisError || !analysisData) {
          console.warn('Document analysis not found, falling back to template generation')
          throw new Error('Document analysis not found')
        }

        // Parse content by sections if it contains section markers
        // Format: [SECTION:type]content[/SECTION]
        const generatedContent: Record<string, string> = {}
        
        if (assignment.assignment_content) {
          const sectionRegex = /\[SECTION:(\w+)\]([\s\S]*?)\[\/SECTION\]/g
          let match
          while ((match = sectionRegex.exec(assignment.assignment_content)) !== null) {
            const sectionType = match[1]
            const sectionContent = match[2].trim()
            generatedContent[sectionType] = sectionContent
          }
          
          // If no section markers found, try to parse by structure sections
          if (Object.keys(generatedContent).length === 0) {
            // Split content by section structure from analysis
            const sections = analysisData.structure_analysis.sections || []
            const contentParts = assignment.assignment_content.split(/\n\s*\n/)
            
            // Try to distribute content to sections (simple approach)
            let contentIndex = 0
            sections.forEach((section: any) => {
              if (section.type === 'references') return
              // Take a chunk of content for each section
              const estimatedWords = section.word_count_range?.[1] || 200
              const wordsPerPart = contentParts.reduce((sum, part) => sum + part.split(/\s+/).length, 0) / contentParts.length
              const partsPerSection = Math.ceil(estimatedWords / wordsPerPart)
              const sectionParts = contentParts.slice(contentIndex, contentIndex + partsPerSection)
              generatedContent[section.type] = sectionParts.join('\n\n')
              contentIndex += partsPerSection
            })
          }
        }
        
        // Add references
        if (assignment.assignment_references && assignment.assignment_references.length > 0) {
          generatedContent.references = assignment.assignment_references.map((ref: any) => 
            `${ref.authors || ref.author || 'Unknown'}. (${ref.year || 'n.d.'}). ${ref.title || ''}. ${ref.source || ''}`
          ).join('\n')
        }

        // Rebuild document using analyzed format
        buffer = await rebuildDocumentFromAnalysis(
          analysisData.structure_analysis,
          generatedContent,
          analysisData.parsed_data.styles,
          analysisData.parsed_data.images || [],
          assignment
        )
        console.log('Document analysis rebuild successful')
      } else if (assignment.template_code && assignment.template_type) {
        // Use DOCX template
        console.log(`Using template: ${assignment.template_code}_${assignment.template_type}`)
        const templatePath = getTemplatePath(assignment.template_code, assignment.template_type)
        console.log(`Template path: ${templatePath}`)
        console.log(`Assignment data keys:`, Object.keys(assignment))
        buffer = await generateFromTemplate(templatePath, assignment)
        console.log('Template generation successful')
      } else {
        console.warn('No template_code or template_type found, using programmatic generation')
        console.warn('Assignment data:', JSON.stringify(assignment, null, 2))
        // Fallback to programmatic generation
        buffer = await generateAssignmentDocument(assignment)
      }
    } catch (templateError: any) {
      console.error('Document generation failed:', templateError)
      console.error('Error stack:', templateError.stack)
      // Fallback to programmatic generation
      buffer = await generateAssignmentDocument(assignment)
    }

    return new NextResponse(Uint8Array.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="assignment_${assignmentId}.docx"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error.message || 'Export failed' },
      { status: 500 }
    )
  }
}

// Keep GET method for backward compatibility
export async function GET(request: NextRequest) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const assignmentId = searchParams.get('assignmentId')
    const format = searchParams.get('format') || 'docx'

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID required' }, { status: 400 })
    }

    // Fetch assignment
    const { data: assignment, error } = await supabase
      .from('assignments_new')
      .select('*')
      .eq('id', assignmentId)
      .eq('user_id', user.id)
      .single()

    if (error || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    // Check if assignment was edited significantly - require credits for download
    const requiresCredits = (assignment.content_changed_percentage || 0) > 30 || 
                           (assignment.edit_count || 0) > 0
    
    if (requiresCredits) {
      const lastDownload = assignment.last_downloaded_at 
        ? new Date(assignment.last_downloaded_at)
        : null
      const now = new Date()
      const hoursSinceLastDownload = lastDownload 
        ? (now.getTime() - lastDownload.getTime()) / (1000 * 60 * 60)
        : Infinity
      
      const shouldChargeCredits = (assignment.content_changed_percentage || 0) > 30 ||
                                 (assignment.download_count || 0) > 0 ||
                                 hoursSinceLastDownload < 24
      
      if (shouldChargeCredits) {
        const { CREDIT_COSTS } = await import('@/lib/constants')
        const creditCost = CREDIT_COSTS.assignment_download
        const creditResult = await deductCredits(user.id, 'essay', supabase, creditCost)
        
        if (!creditResult.success) {
          return NextResponse.json(
            { 
              error: `Insufficient credits. Downloading edited assignments requires ${creditCost} credits. You have ${creditResult.remainingCredits} credits.`,
              requiresCredits: true,
              creditCost,
              remainingCredits: creditResult.remainingCredits
            },
            { status: 402 }
          )
        }
        
        await supabase
          .from('assignment_downloads')
          .insert({
            assignment_id: assignmentId,
            user_id: user.id,
            credits_charged: creditCost,
            download_type: 'docx',
          })
        
        await supabase
          .from('assignments_new')
          .update({
            download_count: (assignment.download_count || 0) + 1,
            last_downloaded_at: new Date().toISOString(),
          })
          .eq('id', assignmentId)
      }
    }

    // Try to generate DOCX, fallback to text if it fails
    try {
      let buffer: Buffer
      try {
        if (assignment.template_code && assignment.template_type) {
          // Use DOCX template
          const templatePath = getTemplatePath(assignment.template_code, assignment.template_type)
          buffer = await generateFromTemplate(templatePath, assignment)
        } else {
          // Fallback to programmatic generation
          buffer = await generateAssignmentDocument(assignment)
        }
      } catch (templateError: any) {
        console.warn('Template generation failed, falling back to programmatic:', templateError)
        buffer = await generateAssignmentDocument(assignment)
      }
      
      return new NextResponse(Uint8Array.from(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'Content-Disposition': `attachment; filename="assignment_${assignmentId}.docx"`,
        },
      })
    } catch (docxError) {
      // Fallback to text format
      let content = `Assignment: ${assignment.title}\n\n`
      content += `Course: ${assignment.course_name || 'N/A'}\n`
      content += `Instructor: ${assignment.instructor_name || 'N/A'}\n\n`
      content += `${assignment.assignment_content || 'No content'}\n\n`
      
      if (assignment.assignment_references && assignment.assignment_references.length > 0) {
        content += `References:\n`
        assignment.assignment_references.forEach((ref: any, index: number) => {
          content += `${index + 1}. ${ref.title}`
          if (ref.author || ref.authors) content += ` - ${ref.author || ref.authors}`
          if (ref.year) content += ` (${ref.year})`
          content += '\n'
        })
      }

      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="assignment_${assignmentId}.txt"`,
        },
      })
    }
  } catch (error: any) {
    console.error('Error in export route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export assignment' },
      { status: 500 }
    )
  }
}
