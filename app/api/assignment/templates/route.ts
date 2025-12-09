import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const collegeCode = searchParams.get('collegeCode')

    let query = supabase
      .from('assignment_templates')
      .select('*')
      .eq('is_active', true)

    if (type) {
      query = query.eq('template_type', type)
    }

    if (collegeCode) {
      query = query.eq('college_code', collegeCode)
    }

    const { data, error } = await query.order('college_name')

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
    }

    return NextResponse.json({ templates: data || [] })
  } catch (error: any) {
    console.error('Error in templates route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

