import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateAssignmentDocument } from '@/lib/utils/docx-generator'
import { generateFromTemplate, getTemplatePath } from '@/lib/utils/docx-template-generator'

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

    // Try to use template-based generation if template is specified
    let buffer: Buffer
    try {
      if (assignment.template_code && assignment.template_type) {
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
      console.error('Template generation failed:', templateError)
      console.error('Error stack:', templateError.stack)
      console.error('Template code:', assignment.template_code)
      console.error('Template type:', assignment.template_type)
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
