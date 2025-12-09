import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      template_name,
      college_name,
      assignment_type,
      extracted_format,
      sample_file_url,
    } = body

    if (!template_name || !extracted_format) {
      return NextResponse.json(
        { error: 'Template name and extracted format are required' },
        { status: 400 }
      )
    }

    const { data: customTemplate, error } = await supabase
      .from('custom_templates')
      .insert({
        user_id: user.id,
        template_name,
        college_name: college_name || null,
        assignment_type: assignment_type || 'individual',
        extracted_format,
        sample_file_url: sample_file_url || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating custom template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      customTemplateId: customTemplate.id,
    })
  } catch (error: any) {
    console.error('Error in custom template route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create custom template' },
      { status: 500 }
    )
  }
}

