import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkZenoPayOrderStatus } from '@/lib/zenopay'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentIdParam = searchParams.get('paymentId')

    if (!paymentIdParam) {
      return NextResponse.json(
        { error: 'paymentId is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Try to find payment by:
    // 1. First, try as orderId (UUID - payment record ID)
    // 2. If not found, try as original paymentId (in metadata)
    let payment = null
    let error = null

    // Check if it's a UUID (orderId format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(paymentIdParam)

    if (isUUID) {
      // Try as orderId (payment record ID)
      const result = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentIdParam)
        .eq('payment_type', 'tool')
        .single()
      
      payment = result.data
      error = result.error
    }

    // If not found as UUID, or if it's not a UUID, search by metadata.paymentId
    if (!payment || error) {
      console.log('[Tool Payment Verify] Not found as UUID, searching by metadata.paymentId:', paymentIdParam)
      
      // Search for payment where metadata.paymentId matches
      const { data: payments, error: searchError } = await supabase
        .from('payments')
        .select('*')
        .eq('payment_type', 'tool')
      
      if (!searchError && payments) {
        // Find payment with matching paymentId in metadata
        payment = payments.find((p) => {
          const metadata = p.metadata || {}
          return metadata.paymentId === paymentIdParam
        })
      }
    }

    if (!payment) {
      console.error('[Tool Payment Verify] Payment not found in database for:', paymentIdParam)
      
      // If payment not found in DB, try checking with ZenoPay directly
      // This handles cases where payment was created but DB record is missing
      const zenopayApiKey = process.env.ZENOPAY_API_KEY
      if (zenopayApiKey && isUUID) {
        console.log('[Tool Payment Verify] Checking ZenoPay directly for orderId:', paymentIdParam)
        try {
          const zenopayStatus = await checkZenoPayOrderStatus(zenopayApiKey, paymentIdParam)
          
          if (zenopayStatus.result === 'SUCCESS' && zenopayStatus.data && zenopayStatus.data.length > 0) {
            const zenoPayment = zenopayStatus.data[0]
            return NextResponse.json({
              status: zenoPayment.payment_status === 'COMPLETED' ? 'completed' : 
                      zenoPayment.payment_status === 'PENDING' ? 'pending' : 'failed',
              transactionId: zenoPayment.transid,
              amount: parseInt(zenoPayment.amount),
              orderId: zenoPayment.order_id,
              channel: zenoPayment.channel,
              reference: zenoPayment.reference,
              message: 'Payment found in ZenoPay but not in database. Please contact support.',
            })
          }
        } catch (zenoError) {
          console.error('[Tool Payment Verify] ZenoPay check error:', zenoError)
        }
      }
      
      return NextResponse.json(
        { error: 'Payment not found. Please check your payment ID or try again later.' },
        { status: 404 }
      )
    }

    // Get metadata (already JSONB, no parsing needed)
    const metadata = payment.metadata || {}

    // If payment is still pending, also check with ZenoPay for real-time status
    if (payment.payment_status === 'pending') {
      const zenopayApiKey = process.env.ZENOPAY_API_KEY
      if (zenopayApiKey) {
        try {
          const zenopayStatus = await checkZenoPayOrderStatus(zenopayApiKey, payment.id)
          
          if (zenopayStatus.result === 'SUCCESS' && zenopayStatus.data && zenopayStatus.data.length > 0) {
            const zenoPayment = zenopayStatus.data[0]
            
            // Update our database if ZenoPay shows different status
            if (zenoPayment.payment_status === 'COMPLETED' && payment.payment_status !== 'completed') {
              console.log('[Tool Payment Verify] Updating payment status from ZenoPay:', payment.id)
              
              // Update payment status
              await supabase
                .from('payments')
                .update({
                  payment_status: 'completed',
                  transaction_id: zenoPayment.transid || payment.transaction_id,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', payment.id)
              
              // Handle tool payment unlock
              if (payment.payment_type === 'tool') {
                const updatedMetadata = {
                  ...metadata,
                  unlocked: true,
                  unlockedAt: new Date().toISOString(),
                }
                await supabase
                  .from('payments')
                  .update({ metadata: updatedMetadata })
                  .eq('id', payment.id)
              }
              
              return NextResponse.json({
                status: 'completed',
                transactionId: zenoPayment.transid,
                amount: payment.amount,
                tool: metadata.tool,
                originalPaymentId: metadata.paymentId,
                orderId: payment.id,
                channel: zenoPayment.channel,
                reference: zenoPayment.reference,
                message: 'Payment verified and completed',
              })
            }
          }
        } catch (zenoError) {
          console.error('[Tool Payment Verify] ZenoPay check error:', zenoError)
          // Continue with DB status if ZenoPay check fails
        }
      }
    }

    return NextResponse.json({
      status: payment.payment_status,
      transactionId: payment.transaction_id,
      amount: payment.amount,
      tool: metadata.tool,
      originalPaymentId: metadata.paymentId,
      orderId: payment.id,
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

