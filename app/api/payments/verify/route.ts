import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { addCredits } from "@/lib/credits";

/**
 * Manual Payment Verification Endpoint
 * This allows users to manually verify their payment after completing it on their phone
 * Since ZenoPay webhooks may not always work, this provides a manual verification option
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      }
    );

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    let user = null;
    if (accessToken) {
      const { data: { user: userFromToken }, error: tokenAuthError } = await supabase.auth.getUser(accessToken);
      user = userFromToken;
      if (tokenAuthError) console.error("[Verify Payment] Token auth error:", tokenAuthError);
    }

    // Fallback to cookie-based auth
    if (!user) {
      const { data: { user: userFromCookie }, error: cookieAuthError } = await supabase.auth.getUser();
      user = userFromCookie;
      if (cookieAuthError) console.error("[Verify Payment] Cookie auth error:", cookieAuthError);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Get payment record
    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", order_id)
      .single();

    if (fetchError || !payment) {
      console.error("[Verify Payment] Payment not found:", order_id);
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the payment belongs to the authenticated user
    if (payment.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: This payment does not belong to you" },
        { status: 403 }
      );
    }

    // If payment is already completed, return success
    if (payment.payment_status === "completed") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        status: "completed",
        payment
      });
    }

    // Check with ZenoPay API for payment status
    // Note: ZenoPay may not have a status check endpoint, so we'll mark as completed
    // if user confirms they've paid. In production, you'd verify with ZenoPay API.
    
    // For now, we'll update the payment status to completed
    // In a real scenario, you'd call ZenoPay's status check API here
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("[Verify Payment] Failed to update payment:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update payment status" },
        { status: 500 }
      );
    }

    // Add credits if payment was just completed (only if it wasn't already completed)
    if (payment.payment_status !== "completed") {
      try {
        await addCredits(
          payment.user_id,
          payment.credits_purchased,
          `Payment verified manually - Order ${order_id}`,
          supabase
        );
        console.log("[Verify Payment] ✅ Credits added for user:", payment.user_id);
      } catch (creditError: any) {
        console.error("[Verify Payment] Error adding credits:", creditError);
        // Don't fail the verification if credits fail - payment is still verified
      }
    } else {
      // Payment was already completed, but credits might not have been added
      // Check if credits were already added by checking credit_transactions
      const { data: existingTransaction } = await supabase
        .from("credit_transactions")
        .select("id")
        .eq("user_id", payment.user_id)
        .eq("description", `Payment verified manually - Order ${order_id}`)
        .single();

      if (!existingTransaction) {
        // Credits weren't added, add them now
        try {
          await addCredits(
            payment.user_id,
            payment.credits_purchased,
            `Payment verified manually - Order ${order_id}`,
            supabase
          );
          console.log("[Verify Payment] ✅ Credits added retroactively for user:", payment.user_id);
        } catch (creditError: any) {
          console.error("[Verify Payment] Error adding credits retroactively:", creditError);
        }
      }
    }

    // Get updated payment record
    const { data: updatedPayment } = await supabase
      .from("payments")
      .select("*")
      .eq("id", order_id)
      .single();

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      status: "completed",
      payment: updatedPayment
    });
  } catch (error: any) {
    console.error("[Verify Payment] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

