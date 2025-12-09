import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  initiateZenoPayPayment,
  formatTanzanianPhone,
  validateTanzanianPhone,
} from "@/lib/zenopay";

const ONE_TIME_PAYMENT_AMOUNT = 3000; // 3000 TZS

export async function POST(request: NextRequest) {
  try {
    console.log("[One-Time Payment API] Request received");
    
    // Try to get the access token from Authorization header first (more reliable)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    console.log("[One-Time Payment API] Auth header present:", !!authHeader);
    
    // Get cookies as fallback
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Create Supabase client
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
            } catch {
              // Cookie setting might fail in API routes, that's okay
            }
          },
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    console.log("[One-Time Payment API] Auth check:", { 
      hasUser: !!user, 
      userEmail: user?.email,
      authError: authError?.message,
      usedToken: !!accessToken
    });

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated. Please log in first." },
        { status: 401 }
      );
    }

    // Check if user has already paid
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("has_paid_one_time_fee")
      .eq("user_id", user.id)
      .single();

    if (userCredits?.has_paid_one_time_fee) {
      return NextResponse.json(
        { success: false, error: "You have already paid the one-time signup fee." },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { buyerEmail, buyerName, buyerPhone } = body;

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

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: ONE_TIME_PAYMENT_AMOUNT,
        credits_purchased: 0, // No credits for one-time payment
        payment_method: "zenopay",
        payment_status: "pending",
        payment_type: "one_time",
        phone_number: formattedPhone,
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error("[One-Time Payment API] Payment record error:", paymentError);
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
      amount: ONE_TIME_PAYMENT_AMOUNT,
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

    // Update payment with transaction ID (status remains pending until callback)
    await supabase
      .from("payments")
      .update({
        transaction_id: zenopayResponse.transaction_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    console.log("[One-Time Payment API] ✅ Payment initiated for:", user.email);

    // Return payment status page URL
    return NextResponse.json({
      success: true,
      paymentUrl: `/payment-verification?order_id=${payment.id}&type=one_time`,
      orderId: payment.id,
      status: "pending"
    });
  } catch (error: any) {
    console.error("[One-Time Payment API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}

