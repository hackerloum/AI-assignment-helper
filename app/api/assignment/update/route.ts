import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function PATCH(request: NextRequest) {
  try {
    // Get access token from Authorization header
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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please refresh the page and try again.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { assignmentId, ...updateData } = body

    if (!assignmentId) {
      return NextResponse.json(
        { error: 'Assignment ID is required' },
        { status: 400 }
      )
    }

    // Verify the assignment belongs to the user
    const { data: existingAssignment, error: fetchError } = await supabase
      .from('assignments_new')
      .select('user_id')
      .eq('id', assignmentId)
      .single()

    if (fetchError || !existingAssignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      )
    }

    if (existingAssignment.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized. You can only edit your own assignments.' },
        { status: 403 }
      )
    }

    // Update the assignment
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('assignments_new')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assignmentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating assignment:', updateError)
      console.error('Update data:', JSON.stringify(updateData, null, 2))
      
      let errorMessage = 'Failed to update assignment'
      if (updateError.code === '42703') {
        errorMessage = 'Database schema mismatch. Some fields may not exist.'
      } else if (updateError.message) {
        errorMessage = updateError.message
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: updateError.message,
          code: updateError.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      assignment: updatedAssignment 
    })
  } catch (error: any) {
    console.error('Error in assignment update:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update assignment' },
      { status: 500 }
    )
  }
}

