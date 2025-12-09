import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addCredits } from "@/lib/credits";
import {
  initiateZenoPayPayment,
  formatTanzanianPhone,
  validateTanzanianPhone,
} from "@/lib/zenopay";

export async function POST(request: NextRequest) {
  try {
    console.log("[Subscription API] Request received");
    
    // Create Supabase client - this will properly read cookies from the request
    const supabase = await createClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log("[Subscription API] Auth check:", { 
      hasUser: !!user, 
      userEmail: user?.email,
      authError: authError?.message 
    });

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated. Please refresh and try again." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { planType, buyerEmail, buyerName, buyerPhone } = body;

    // Validate required fields
    if (!buyerEmail || !buyerName || !buyerPhone) {
      return NextResponse.json(
        { success: false, error: "Email, name, and phone number are required" },
        { status: 400 }
      );
    }

    // Validate and format phone number
    const formattedPhone = formatTanzanianPhone(buyerPhone);
    if (!validateTanzanianPhone(formattedPhone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Please use format: 07XXXXXXXX" },
        { status: 400 }
      );
    }

    // Define plan details
    const plans = {
      daily: {
        amount: 500,
        credits: 999,
        name: 'Daily Pass',
      },
      monthly: {
        amount: 5000,
        credits: 999,
        name: 'Monthly Pass',
      },
    };

    const plan = plans[planType as 'daily' | 'monthly'];
    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Invalid plan type" },
        { status: 400 }
      );
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: plan.amount,
        credits_purchased: plan.credits,
        payment_method: "zenopay",
        payment_status: "pending",
        phone_number: formattedPhone,
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error("[Subscription API] Payment record error:", paymentError);
      return NextResponse.json(
        { success: false, error: "Failed to create payment record" },
        { status: 500 }
      );
    }

    // Get ZenoPay API key from environment
    const zenopayApiKey = process.env.ZENOPAY_API_KEY;
    if (!zenopayApiKey) {
      return NextResponse.json(
        { success: false, error: "Payment service not configured" },
        { status: 500 }
      );
    }

    // Initiate ZenoPay payment
    const zenopayResponse = await initiateZenoPayPayment(zenopayApiKey, {
      order_id: payment.id,
      buyer_email: buyerEmail,
      buyer_name: buyerName,
      buyer_phone: formattedPhone,
      amount: plan.amount,
    });

    if (zenopayResponse.status === "error") {
      // Update payment status to failed
      await supabase
        .from("payments")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return NextResponse.json(
        { success: false, error: zenopayResponse.message },
        { status: 400 }
      );
    }

    // Update payment with transaction ID and mark as completed
    await supabase
      .from("payments")
      .update({
        transaction_id: zenopayResponse.transaction_id || null,
        payment_status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Add credits to user account
    await addCredits(
      user.id,
      plan.credits,
      `Purchased ${plan.name} via ZenoPay`
    );

    console.log("[Subscription API] ✅ Payment successful for:", user.email);

    // Payment completed, return success with redirect URL
    return NextResponse.json({
      success: true,
      paymentUrl: `/subscription?success=true&paymentId=${payment.id}&plan=${planType}`,
    });
  } catch (error: any) {
    console.error("[Subscription API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

