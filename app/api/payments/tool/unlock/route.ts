import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * This endpoint unlocks tool content after payment verification
 * It stores the paymentId -> unlocked status mapping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, orderId } = body

    if (!paymentId || !orderId) {
      return NextResponse.json(
        { error: 'paymentId and orderId are required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if payment is completed
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    if (payment.payment_status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed yet' },
        { status: 400 }
      )
    }

    // Parse metadata (it's already JSONB, no need to parse)
    const metadata = payment.metadata || {}

    // Verify this payment is for the correct tool paymentId
    if (metadata.paymentId !== paymentId) {
      return NextResponse.json(
        { error: 'Payment ID mismatch' },
        { status: 400 }
      )
    }

    // Store unlocked status in metadata
    const updatedMetadata = {
      ...metadata,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    }

    // Update payment metadata
    await supabase
      .from('payments')
      .update({
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    return NextResponse.json({
      success: true,
      unlocked: true,
      message: 'Content unlocked successfully',
    })
  } catch (error: any) {
    console.error('[Tool Unlock] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Check if content is unlocked for a paymentId
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Find payment with matching paymentId in metadata
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('payment_type', 'tool')
      .eq('payment_status', 'completed')

    if (error) {
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Find payment with matching paymentId in metadata
    const payment = payments?.find((p) => {
      const metadata = p.metadata || {}
      return metadata.paymentId === paymentId
    })

    if (!payment) {
      return NextResponse.json({
        unlocked: false,
        message: 'Payment not found or not completed',
      })
    }

    // Check if unlocked (metadata is already JSONB)
    const metadata = payment.metadata || {}

    return NextResponse.json({
      unlocked: metadata.unlocked === true,
      orderId: payment.id,
      unlockedAt: metadata.unlockedAt,
    })
  } catch (error: any) {
    console.error('[Tool Unlock Check] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

