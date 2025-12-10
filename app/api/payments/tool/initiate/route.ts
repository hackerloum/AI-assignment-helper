import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { initiateZenoPayPayment, formatTanzanianPhone, validateTanzanianPhone } from '@/lib/zenopay'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, tool, amount, buyerEmail, buyerName, buyerPhone } = body

    if (!paymentId || !tool || !amount || !buyerEmail || !buyerName || !buyerPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!validateTanzanianPhone(buyerPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use 07XXXXXXXX' },
        { status: 400 }
      )
    }

    const formattedPhone = formatTanzanianPhone(buyerPhone)
    const supabase = createAdminClient()

    // Get ZenoPay API key
    const zenopayApiKey = process.env.ZENOPAY_API_KEY
    if (!zenopayApiKey) {
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      )
    }

    // First, check if migration has been applied by trying to insert with null user_id
    // If it fails, we'll provide a helpful error message
    let payment
    let paymentError

    try {
      // Try to insert payment record
      const result = await supabase
        .from('payments')
        .insert({
          user_id: null, // Tool payments don't require user account
          amount: amount,
          credits_purchased: 0, // Not applicable for tool payments
          payment_method: 'zenopay',
          payment_status: 'pending',
          phone_number: formattedPhone,
          payment_type: 'tool', // New field to identify tool payments
          metadata: {
            paymentId, // The original payment ID from tool usage
            tool,
            buyerEmail,
            buyerName,
          },
        })
        .select()
        .single()

      payment = result.data
      paymentError = result.error
    } catch (error: any) {
      paymentError = error
    }

    if (paymentError || !payment) {
      console.error('[Tool Payment] Payment record error:', paymentError)
      console.error('[Tool Payment] Error code:', paymentError?.code)
      console.error('[Tool Payment] Error message:', paymentError?.message)
      console.error('[Tool Payment] Error details:', JSON.stringify(paymentError, null, 2))
      
      // Provide specific error messages based on error codes
      let errorMessage = 'Failed to create payment record'
      let migrationRequired = false

      if (paymentError?.code === '23502') {
        // NOT NULL constraint violation
        errorMessage = 'Database migration required: user_id column must allow NULL values. Please run migration 008_add_tool_payments.sql in your Supabase SQL Editor.'
        migrationRequired = true
      } else if (paymentError?.code === '23514') {
        // CHECK constraint violation
        errorMessage = 'Database migration required: payment_type constraint must include "tool". Please run migration 008_add_tool_payments.sql in your Supabase SQL Editor.'
        migrationRequired = true
      } else if (paymentError?.code === '42703') {
        // Column doesn't exist
        errorMessage = 'Database migration required: metadata column is missing. Please run migration 008_add_tool_payments.sql in your Supabase SQL Editor.'
        migrationRequired = true
      } else if (paymentError?.message) {
        errorMessage = paymentError.message
        // Check if it's a constraint error
        if (paymentError.message.includes('constraint') || paymentError.message.includes('NOT NULL')) {
          migrationRequired = true
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          migrationRequired,
          migrationFile: 'supabase/migrations/008_add_tool_payments.sql',
          details: process.env.NODE_ENV === 'development' ? {
            code: paymentError?.code,
            message: paymentError?.message,
            hint: paymentError?.hint,
          } : undefined
        },
        { status: 500 }
      )
    }

    // Get base URL for webhook
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (request.headers.get('origin') || 
                    `https://${request.headers.get('host') || 'localhost:3000'}`)
    const webhookUrl = `${baseUrl}/api/payments/zenopay-callback`

    // Initiate ZenoPay payment
    const zenopayResponse = await initiateZenoPayPayment(zenopayApiKey, {
      order_id: payment.id, // Use payment record ID as order_id
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      buyer_phone: formattedPhone,
      amount: amount,
      webhook_url: webhookUrl,
    })

    if (zenopayResponse.status === 'error') {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      return NextResponse.json(
        { error: zenopayResponse.message || 'Failed to initiate payment' },
        { status: 400 }
      )
    }

    // Update payment with transaction ID
    await supabase
      .from('payments')
      .update({
        transaction_id: zenopayResponse.transaction_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.id)

    // Store the mapping between payment record ID and original paymentId
    // This will be used to unlock the content
    await supabase
      .from('payments')
      .update({
        metadata: {
          paymentId, // Original payment ID from tool
          tool,
          buyerEmail,
          buyerName,
          orderId: payment.id, // Payment record ID
        },
      })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      orderId: payment.id,
      message: 'Payment initiated successfully. Please complete payment on your phone.',
    })
  } catch (error: any) {
    console.error('[Tool Payment] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

