import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
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

    // In production, you would use a library like docx or pdfkit to generate the file
    // For now, return a simple text representation

    let content = `Assignment: ${assignment.title}\n\n`
    content += `Course: ${assignment.course_name || 'N/A'}\n`
    content += `Instructor: ${assignment.instructor_name || 'N/A'}\n\n`
    content += `${assignment.assignment_content || 'No content'}\n\n`
    
    if (assignment.references && assignment.references.length > 0) {
      content += `References:\n`
      assignment.references.forEach((ref: any, index: number) => {
        content += `${index + 1}. ${ref.title}`
        if (ref.author) content += ` - ${ref.author}`
        if (ref.year) content += ` (${ref.year})`
        content += '\n'
      })
    }

    // Return as text for now (in production, generate actual DOCX/PDF)
    return new NextResponse(content, {
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="assignment.${format}"`,
      },
    })
  } catch (error: any) {
    console.error('Error in export route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to export assignment' },
      { status: 500 }
    )
  }
}

