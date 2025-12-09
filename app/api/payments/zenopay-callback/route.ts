import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addCredits } from "@/lib/credits";

/**
 * ZenoPay Webhook/Callback Endpoint
 * This endpoint receives notifications from ZenoPay when payment status changes
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[ZenoPay Callback] Received notification");
    
    // Verify the request is from ZenoPay (check API key)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.ZENOPAY_API_KEY) {
      console.error("[ZenoPay Callback] Invalid API key");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse the callback payload
    const body = await request.json();
    
    // ZenoPay webhook format: { order_id, payment_status, reference, metadata }
    // Also supports: { order_id, payment_status, reference, transid }
    const order_id = body.order_id || body.orderId;
    const payment_status = body.payment_status || body.status;
    const reference = body.reference;
    const transid = body.transid || body.transaction_id || body.transId;

    console.log("[ZenoPay Callback] Full webhook payload:", JSON.stringify(body, null, 2));
    console.log("[ZenoPay Callback] Parsed notification:", {
      order_id,
      payment_status,
      reference,
      transid
    });

    if (!order_id) {
      console.error("[ZenoPay Callback] Missing order_id in webhook payload");
      return NextResponse.json(
        { error: "Missing order_id" },
        { status: 400 }
      );
    }

    // Create Supabase admin client (no user auth needed for callbacks)
    const supabase = await createClient();

    // Find the payment record
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", order_id)
      .single();

    if (fetchError || !payment) {
      console.error("[ZenoPay Callback] Payment not found:", order_id);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Map ZenoPay status to our status
    // ZenoPay sends: "COMPLETED", "PENDING", "FAILED", etc.
    let paymentStatus: string;
    if (payment_status === "COMPLETED" || payment_status === "completed" || payment_status === "success") {
      paymentStatus = "completed";
    } else if (payment_status === "FAILED" || payment_status === "failed" || payment_status === "error" || payment_status === "CANCELLED") {
      paymentStatus = "failed";
    } else if (payment_status === "PENDING" || payment_status === "pending") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "pending"; // Default to pending for unknown statuses
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        transaction_id: transid || payment.transaction_id,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("[ZenoPay Callback] Failed to update payment:", updateError);
      return NextResponse.json(
        { error: "Failed to update payment" },
        { status: 500 }
      );
    }

    // If payment is completed, handle based on payment type
    if (paymentStatus === "completed" && payment.payment_status !== "completed") {
      // For subscription payments, add credits
      if (payment.payment_type === "subscription" || !payment.payment_type) {
        await addCredits(
          payment.user_id,
          payment.credits_purchased,
          `Payment confirmed - Order ${order_id}`,
          supabase
        );
        
        console.log("[ZenoPay Callback] ✅ Credits added for user:", payment.user_id);
      }
      
      // For one-time payments, mark user as paid
      if (payment.payment_type === "one_time") {
        // First, check if user_credits record exists
        const { data: existingCredits, error: fetchError } = await supabase
          .from("user_credits")
          .select("has_paid_one_time_fee")
          .eq("user_id", payment.user_id)
          .single();

        if (fetchError && fetchError.code === 'PGRST116') {
          // Record doesn't exist, create it
          console.log("[ZenoPay Callback] Creating user_credits record for user:", payment.user_id);
          const { error: insertError } = await supabase
            .from("user_credits")
            .insert({
              user_id: payment.user_id,
              balance: 0,
              has_paid_one_time_fee: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("[ZenoPay Callback] Failed to create user_credits:", insertError);
          } else {
            console.log("[ZenoPay Callback] ✅ Created user_credits with has_paid_one_time_fee=true");
          }
        } else if (fetchError) {
          console.error("[ZenoPay Callback] Error fetching user_credits:", fetchError);
        } else {
          // Record exists, update it
          const { error: updateError } = await supabase
            .from("user_credits")
            .update({ 
              has_paid_one_time_fee: true,
              updated_at: new Date().toISOString()
            })
            .eq("user_id", payment.user_id);
          
          if (updateError) {
            console.error("[ZenoPay Callback] Failed to update payment status:", updateError);
          } else {
            const wasAlreadyPaid = existingCredits?.has_paid_one_time_fee;
            if (!wasAlreadyPaid) {
              console.log("[ZenoPay Callback] ✅ One-time payment marked as paid for user:", payment.user_id);
            } else {
              console.log("[ZenoPay Callback] ✅ User already marked as paid (verified)");
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment status updated"
    });
  } catch (error: any) {
    console.error("[ZenoPay Callback] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Also handle GET for manual status checks
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
    console.error("[ZenoPay Status Check] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

