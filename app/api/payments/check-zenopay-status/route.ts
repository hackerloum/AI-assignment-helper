import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkZenoPayOrderStatus } from "@/lib/zenopay";

/**
 * Check payment status directly from ZenoPay API
 * This endpoint queries ZenoPay's order-status API to get real-time payment status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { error: "order_id required" },
        { status: 400 }
      );
    }

    const zenopayApiKey = process.env.ZENOPAY_API_KEY;
    if (!zenopayApiKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Query ZenoPay order status API using library function
    const zenopayData = await checkZenoPayOrderStatus(zenopayApiKey, orderId);

    // Check if it's an error response
    if ('status' in zenopayData && zenopayData.status === "error") {
      console.error("[Check ZenoPay Status] ZenoPay API error:", zenopayData.message);
      // Fallback to database check
      return await checkDatabaseStatus(orderId);
    }

    // At this point, zenopayData is ZenoPayOrderStatusResponse
    const statusResponse = zenopayData as import("@/lib/zenopay").ZenoPayOrderStatusResponse;

    // Parse ZenoPay response
    if (statusResponse.resultcode === "000" && statusResponse.data && statusResponse.data.length > 0) {
      const paymentData = statusResponse.data[0];
      const paymentStatus = paymentData.payment_status;

      // Map ZenoPay status to our status
      let status: string;
      if (paymentStatus === "COMPLETED") {
        status = "completed";
      } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
        status = "failed";
      } else {
        status = "pending";
      }

      // Update our database with the latest status
      const supabase = await createClient();
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("id", orderId)
        .single();

      if (payment) {
        // Update payment record if status changed
        if (payment.payment_status !== status) {
          await supabase
            .from("payments")
            .update({
              payment_status: status,
              transaction_id: paymentData.transid || payment.transaction_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          // If payment completed, handle it
          if (status === "completed" && payment.payment_status !== "completed") {
            await handleCompletedPayment(payment, paymentData.transid, supabase);
          }
        }
      }

      return NextResponse.json({
        order_id: orderId,
        status: status,
        transaction_id: paymentData.transid,
        amount: parseInt(paymentData.amount) || payment?.amount,
        channel: paymentData.channel,
        reference: paymentData.reference,
        msisdn: paymentData.msisdn,
        created_at: payment?.created_at,
        updated_at: new Date().toISOString(),
      });
    } else {
      // ZenoPay returned error or no data
      console.error("[Check ZenoPay Status] ZenoPay response:", statusResponse);
      return await checkDatabaseStatus(orderId);
    }
  } catch (error: any) {
    console.error("[Check ZenoPay Status] Error:", error);
    // Fallback to database check
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');
    if (orderId) {
      return await checkDatabaseStatus(orderId);
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Fallback: Check payment status from database
 */
async function checkDatabaseStatus(orderId: string) {
  try {
    const supabase = await createClient();
    
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      order_id: payment.id,
      status: payment.payment_status,
      transaction_id: payment.transaction_id,
      amount: payment.amount,
      created_at: payment.created_at,
      updated_at: payment.updated_at
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Handle completed payment - add credits or mark as paid
 */
async function handleCompletedPayment(
  payment: any,
  transactionId: string | null,
  supabase: any
) {
  // For subscription payments, add credits
  if (payment.payment_type === "subscription" || !payment.payment_type) {
    const { addCredits } = await import("@/lib/credits");
    await addCredits(
      payment.user_id,
      payment.credits_purchased,
      `Payment confirmed - Order ${payment.id}`,
      supabase
    );
    console.log("[Check ZenoPay Status] ✅ Credits added for user:", payment.user_id);
  }
  
  // For one-time payments, mark user as paid
  if (payment.payment_type === "one_time") {
    const { error: updateError } = await supabase
      .from("user_credits")
      .update({ 
        has_paid_one_time_fee: true,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", payment.user_id);
    
    if (updateError) {
      console.error("[Check ZenoPay Status] Failed to update payment status:", updateError);
    } else {
      console.log("[Check ZenoPay Status] ✅ One-time payment marked as paid for user:", payment.user_id);
    }
  }
}

