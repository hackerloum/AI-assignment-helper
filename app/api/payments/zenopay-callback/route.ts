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
    const { order_id, transaction_id, status, amount } = body;

    console.log("[ZenoPay Callback] Payment notification:", {
      order_id,
      transaction_id,
      status,
      amount
    });

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
    let paymentStatus: string;
    if (status === "success" || status === "completed") {
      paymentStatus = "completed";
    } else if (status === "failed" || status === "error") {
      paymentStatus = "failed";
    } else if (status === "pending") {
      paymentStatus = "pending";
    } else {
      paymentStatus = "failed"; // Default to failed for unknown statuses
    }

    // Update payment record
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        transaction_id: transaction_id || payment.transaction_id,
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

    // If payment is completed, add credits to user
    if (paymentStatus === "completed" && payment.payment_status !== "completed") {
      await addCredits(
        payment.user_id,
        payment.credits_purchased,
        `Payment confirmed - Order ${order_id}`
      );
      
      console.log("[ZenoPay Callback] ✅ Credits added for user:", payment.user_id);
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

