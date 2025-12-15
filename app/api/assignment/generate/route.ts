import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
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
      return NextResponse.json(
        { error: 'Not authenticated. Please refresh the page and try again.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      type,
      method,
      templateId,
      customTemplateId,
      documentAnalysisId,
      coverPageData,
      content,
      references,
    } = body

    // Validate required fields
    if (!type || !['individual', 'group'].includes(type)) {
      return NextResponse.json(
        { error: 'Assignment type is required and must be "individual" or "group"' },
        { status: 400 }
      )
    }

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Assignment content is required' },
        { status: 400 }
      )
    }

    // Deduct credits (assignment generation costs more)
    const creditResult = await deductCredits(user.id, 'essay', supabase) // Using essay cost for now
    if (!creditResult.success) {
      return NextResponse.json(
        { error: `Insufficient credits. You need 15 credits but only have ${creditResult.remainingCredits}.` },
        { status: 400 }
      )
    }

    // Calculate word count
    const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0

    // Get title - ensure it's not empty
    const title = coverPageData?.assignment_title || 
                  coverPageData?.title || 
                  coverPageData?.task || 
                  'Untitled Assignment'

    // Prepare assignment data
    const assignmentData: any = {
      user_id: user.id,
      assignment_type: type,
      title: title.trim(),
      course_code: coverPageData?.course_code || coverPageData?.courseCode || coverPageData?.module_code,
      course_name: coverPageData?.course_name || coverPageData?.courseName || coverPageData?.module_name,
      instructor_name: coverPageData?.instructor_name || coverPageData?.instructor,
      submission_date: coverPageData?.submission_date || coverPageData?.submissionDate || null,
      assignment_content: content.trim(),
      assignment_references: Array.isArray(references) ? references : [],
      word_count: wordCount,
      ai_model_used: 'gpt-4',
      generation_time_seconds: 0,
    }

    // Add LGTI-specific fields if present (only if they exist in the data)
    // Note: These columns may not exist in the database yet - they'll be ignored if migration hasn't run
    if (coverPageData?.program_name) {
      assignmentData.program_name = coverPageData.program_name
    }
    if (coverPageData?.module_name) {
      assignmentData.module_name = coverPageData.module_name
    }
    if (coverPageData?.module_code) {
      assignmentData.module_code = coverPageData.module_code
    }
    if (coverPageData?.type_of_work) {
      assignmentData.type_of_work = coverPageData.type_of_work
    }
    if (coverPageData?.task) {
      assignmentData.task = coverPageData.task
    }
    if (coverPageData?.group_number) {
      assignmentData.group_number = coverPageData.group_number
    }

    // Add type-specific fields
    if (type === 'individual') {
      assignmentData.student_name = coverPageData?.student_name || coverPageData?.studentName || null
      assignmentData.registration_number = coverPageData?.registration_number || coverPageData?.registrationNumber || null
    } else if (type === 'group') {
      assignmentData.group_name = coverPageData?.group_name || coverPageData?.groupName || null
      assignmentData.group_number = coverPageData?.group_number || null
      // Ensure JSONB fields are arrays
      assignmentData.group_representatives = Array.isArray(coverPageData?.group_representatives) 
        ? coverPageData.group_representatives 
        : []
      assignmentData.group_members = Array.isArray(coverPageData?.group_members) 
        ? coverPageData.group_members 
        : []
    }

    // Add template reference
    if (method === 'template' && templateId) {
      // Check if templateId is in format "CODE_TYPE" (for DOCX templates)
      // or a UUID (for Supabase templates)
      const templateIdMatch = templateId.match(/^([A-Z0-9]+)_(individual|group)$/)
      if (templateIdMatch) {
        // DOCX template format: CODE_TYPE
        assignmentData.template_code = templateIdMatch[1]
        assignmentData.template_type = templateIdMatch[2]
      } else {
        // Legacy Supabase template (UUID)
        assignmentData.template_id = templateId
      }
    } else if (method === 'sample' && customTemplateId) {
      assignmentData.custom_template_id = customTemplateId
    } else if (method === 'analyze' && documentAnalysisId) {
      assignmentData.document_analysis_id = documentAnalysisId
    }

    // Insert assignment
    const { data: assignment, error } = await supabase
      .from('assignments_new')
      .insert(assignmentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating assignment:', error)
      console.error('Error code:', error.code)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      console.error('Assignment data being inserted:', JSON.stringify(assignmentData, null, 2))
      
      // Provide more helpful error messages
      let errorMessage = 'Failed to create assignment'
      if (error.code === '23503') {
        errorMessage = 'Invalid template reference. Please select a valid template.'
      } else if (error.code === '23505') {
        errorMessage = 'Assignment with this data already exists.'
      } else if (error.code === '42703') {
        errorMessage = 'Database schema mismatch. Please contact support.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: error.message,
        code: error.code,
        hint: error.hint || 'Check console for full error details'
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      assignmentId: assignment.id 
    })
  } catch (error: any) {
    console.error('Error in assignment generation:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate assignment' },
      { status: 500 }
    )
  }
}

