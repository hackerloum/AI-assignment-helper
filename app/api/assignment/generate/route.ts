import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { deductCredits } from '@/lib/credits'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      method,
      templateId,
      customTemplateId,
      coverPageData,
      content,
      references,
    } = body

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

    // Prepare assignment data
    const assignmentData: any = {
      user_id: user.id,
      assignment_type: type,
      title: coverPageData?.title || 'Untitled Assignment',
      course_code: coverPageData?.courseCode,
      course_name: coverPageData?.courseName,
      instructor_name: coverPageData?.instructor,
      submission_date: coverPageData?.submissionDate || null,
      assignment_content: content,
      references: references || [],
      word_count: wordCount,
      ai_model_used: 'gpt-4',
      generation_time_seconds: 0,
    }

    // Add type-specific fields
    if (type === 'individual') {
      assignmentData.student_name = coverPageData?.studentName
      assignmentData.registration_number = coverPageData?.registrationNumber
    } else if (type === 'group') {
      assignmentData.group_name = coverPageData?.groupName
      // These would come from GroupMembersManager component
      assignmentData.group_representatives = []
      assignmentData.group_members = []
    }

    // Add template reference
    if (method === 'template' && templateId) {
      assignmentData.template_id = templateId
    } else if (method === 'sample' && customTemplateId) {
      assignmentData.custom_template_id = customTemplateId
    }

    // Insert assignment
    const { data: assignment, error } = await supabase
      .from('assignments_new')
      .insert(assignmentData)
      .select()
      .single()

    if (error) {
      console.error('Error creating assignment:', error)
      return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 })
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

