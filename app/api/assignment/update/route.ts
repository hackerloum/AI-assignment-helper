import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { deductCredits } from '@/lib/credits'
import { createHash } from 'crypto'

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

    // Calculate content change percentage if content is being updated
    let contentChangePercentage = 0
    let creditsCharged = 0
    let editHistoryData: any = null

    if (updateData.assignment_content && existingAssignment.assignment_content) {
      const oldContent = existingAssignment.assignment_content || ''
      const newContent = updateData.assignment_content || ''
      
      // Calculate similarity (simple word-based comparison)
      const oldWords = oldContent.toLowerCase().split(/\s+/).filter(Boolean)
      const newWords = newContent.toLowerCase().split(/\s+/).filter(Boolean)
      
      const totalWords = Math.max(oldWords.length, newWords.length)
      if (totalWords > 0) {
        // Count common words
        const oldWordSet = new Set(oldWords)
        const newWordSet = new Set(newWords)
        let commonWords = 0
        
        for (const word of oldWordSet) {
          if (newWordSet.has(word)) commonWords++
        }
        
        // Calculate change percentage
        const similarity = (commonWords / totalWords) * 100
        contentChangePercentage = Math.max(0, 100 - similarity)
        
        // If content changed more than 30%, require credits (significant edit)
        if (contentChangePercentage > 30) {
          const { CREDIT_COSTS } = await import('@/lib/constants')
          const creditCost = CREDIT_COSTS.assignment_edit
          const creditResult = await deductCredits(user.id, 'essay', supabase, creditCost)
          
          if (!creditResult.success) {
            return NextResponse.json(
              { 
                error: `Insufficient credits. Significant content changes require ${creditCost} credits. You have ${creditResult.remainingCredits} credits.`,
                requiresCredits: true,
                creditCost,
                remainingCredits: creditResult.remainingCredits
              },
              { status: 402 }
            )
          }
          
          creditsCharged = creditCost
        }
      }
      
      // Record edit history
      editHistoryData = {
        assignment_id: assignmentId,
        user_id: user.id,
        edit_type: 'content',
        old_value: oldContent.substring(0, 500), // Store first 500 chars for reference
        new_value: newContent.substring(0, 500),
        content_change_percentage: contentChangePercentage,
        credits_charged: creditsCharged,
      }
    }

    // Calculate original content hash if not set (first edit)
    let originalContentHash = existingAssignment.original_content_hash
    if (!originalContentHash && existingAssignment.assignment_content) {
      originalContentHash = createHash('sha256')
        .update(existingAssignment.assignment_content)
        .digest('hex')
    }

    // Update the assignment
    const updatePayload: any = {
      ...updateData,
      updated_at: new Date().toISOString(),
      edit_count: (existingAssignment.edit_count || 0) + 1,
      last_edited_by: user.id,
    }

    // Add content tracking fields
    if (contentChangePercentage > 0) {
      updatePayload.content_changed_percentage = contentChangePercentage
    }
    if (originalContentHash) {
      updatePayload.original_content_hash = originalContentHash
    }

    const { data: updatedAssignment, error: updateError } = await supabase
      .from('assignments_new')
      .update(updatePayload)
      .eq('id', assignmentId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      // If credits were charged but update failed, refund them
      if (creditsCharged > 0) {
        const { addCredits } = await import('@/lib/credits')
        await addCredits(user.id, creditsCharged, 'Refunded due to update failure', supabase)
      }
      
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

    // Record edit history if significant change
    if (editHistoryData) {
      await supabase
        .from('assignment_edit_history')
        .insert(editHistoryData)
    }

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

