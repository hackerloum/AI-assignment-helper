import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { checkZenoPayOrderStatus } from "@/lib/zenopay";
import { addCredits } from "@/lib/credits";
import { createClient } from "@/lib/supabase/server";

/**
 * Check payment status directly from ZenoPay API and update our database
 * This endpoint provides real-time payment status checking
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

    // Get ZenoPay API key
    const zenopayApiKey = process.env.ZENOPAY_API_KEY;
    if (!zenopayApiKey) {
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Check status from ZenoPay API directly
    const zenopayStatus = await checkZenoPayOrderStatus(orderId, zenopayApiKey);

    if (zenopayStatus.status === "error") {
      return NextResponse.json(
        { 
          error: zenopayStatus.error || "Failed to check payment status",
          status: "error"
        },
        { status: 500 }
      );
    }

    // Get Supabase client
    const supabase = await createClient();

    // Find the payment record in our database
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !payment) {
      return NextResponse.json(
        { 
          error: "Payment not found in database",
          zenopayStatus: zenopayStatus.status,
          zenopayData: zenopayStatus.data
        },
        { status: 404 }
      );
    }

    const paymentStatus = zenopayStatus.status; // 'pending', 'completed', or 'failed'
    const zenopayData = zenopayStatus.data;

    // Update payment record if status changed
    if (payment.payment_status !== paymentStatus) {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      // Update transaction ID if available from ZenoPay
      if (zenopayData?.transaction_id) {
        updateData.transaction_id = zenopayData.transaction_id;
      }

      const { error: updateError } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", orderId);

      if (updateError) {
        console.error("[Check ZenoPay Status] Failed to update payment:", updateError);
      } else {
        console.log(`[Check ZenoPay Status] ✅ Updated payment ${orderId} to status: ${paymentStatus}`);
      }

      // If payment is completed, handle based on payment type
      if (paymentStatus === "completed" && payment.payment_status !== "completed") {
        // For subscription payments, add credits
        if (payment.payment_type === "subscription" || !payment.payment_type) {
          await addCredits(
            payment.user_id,
            payment.credits_purchased,
            `Payment confirmed - Order ${orderId}`,
            supabase
          );
          
          console.log("[Check ZenoPay Status] ✅ Credits added for user:", payment.user_id);
        }
        
        // For one-time payments, mark user as paid
        if (payment.payment_type === "one_time") {
          // Update user_credits to mark payment as completed
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
    }

    // Return current status
    return NextResponse.json({
      order_id: payment.id,
      status: paymentStatus,
      transaction_id: zenopayData?.transaction_id || payment.transaction_id,
      amount: payment.amount,
      payment_type: payment.payment_type,
      created_at: payment.created_at,
      updated_at: new Date().toISOString(),
      zenopayData: zenopayData, // Include raw ZenoPay data for debugging
    });
  } catch (error: any) {
    console.error("[Check ZenoPay Status] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

