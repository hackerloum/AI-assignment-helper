import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

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

    // Find payment record by ID
    const { data: payment, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Get metadata (already JSONB, no parsing needed)
    const metadata = payment.metadata || {}

    return NextResponse.json({
      status: payment.payment_status,
      transactionId: payment.transaction_id,
      amount: payment.amount,
      tool: metadata.tool,
      originalPaymentId: metadata.paymentId,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    })
  } catch (error: any) {
    console.error('[Tool Payment Verify] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

