"use server";

import { createClient } from "@/lib/supabase/server";
import { addCredits } from "@/lib/credits";
import {
  initiateZenoPayPayment,
  formatTanzanianPhone,
  validateTanzanianPhone,
} from "@/lib/zenopay";
import { cookies, headers } from "next/headers";

export async function initiateSubscriptionPayment(data: {
  planType: 'daily' | 'monthly';
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
}): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    console.log("[Server Action] Initiating payment for:", data.buyerEmail);
    
    // Force Next.js to wait for cookies and headers (important for server actions)
    const cookieStore = await cookies();
    const headersList = await headers();
    
    console.log("[Server Action] Cookie count:", cookieStore.getAll().length);
    console.log("[Server Action] Auth cookies:", 
      cookieStore.getAll().filter(c => c.name.includes('sb-')).map(c => c.name)
    );
    
    const supabase = await createClient();
    
    // Try getSession first (more reliable for server actions in production)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log("[Server Action] Session check:", { 
      hasSession: !!session, 
      sessionUser: session?.user?.email,
      sessionError: sessionError?.message 
    });

    let user = session?.user ?? null;

    // Fallback to getUser if session didn't work
    if (!user) {
      const { data: { user: userFromGetUser }, error: authError } = await supabase.auth.getUser();
      user = userFromGetUser ?? null;
      
      console.log("[Server Action] GetUser fallback:", { 
        hasUser: !!user, 
        userEmail: user?.email,
        authError: authError?.message 
      });
    }

    if (!user) {
      console.error("[Server Action] No user found after both attempts");
      return { 
        success: false, 
        error: "Authentication failed. Please try logging out and logging in again." 
      };
    }

    console.log("[Server Action] ✅ User authenticated:", user.email);

    // Validate required fields
    if (!data.buyerEmail || !data.buyerName || !data.buyerPhone) {
      return {
        success: false,
        error: "Email, name, and phone number are required",
      };
    }

    // Validate and format phone number
    const formattedPhone = formatTanzanianPhone(data.buyerPhone);
    if (!validateTanzanianPhone(formattedPhone)) {
      return {
        success: false,
        error: "Invalid phone number format. Please use format: 07XXXXXXXX",
      };
    }

    // Define plan details
    const plans = {
      daily: {
        amount: 500,
        credits: 999, // Unlimited for practical purposes
        name: 'Daily Pass',
      },
      monthly: {
        amount: 5000,
        credits: 999, // Unlimited for practical purposes
        name: 'Monthly Pass',
      },
    };

    const plan = plans[data.planType];

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
      return { success: false, error: "Failed to create payment record" };
    }

    // Get ZenoPay API key from environment
    const zenopayApiKey = process.env.ZENOPAY_API_KEY;
    if (!zenopayApiKey) {
      return { success: false, error: "ZenoPay API key not configured" };
    }

    // Get base URL for webhook
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${baseUrl}/api/payments/zenopay-callback`;

    // Initiate ZenoPay payment with webhook URL
    const zenopayResponse = await initiateZenoPayPayment(zenopayApiKey, {
      order_id: payment.id,
      buyer_email: data.buyerEmail,
      buyer_name: data.buyerName,
      buyer_phone: formattedPhone,
      amount: plan.amount,
      webhook_url: webhookUrl,
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

      return { success: false, error: zenopayResponse.message };
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
      `Purchased ${plan.name} via ZenoPay`,
      supabase
    );

    // Payment completed, redirect to success page
    return {
      success: true,
      paymentUrl: `/subscription?success=true&paymentId=${payment.id}&plan=${data.planType}`,
    };
  } catch (error: any) {
    console.error("Error initiating subscription payment:", error);
    return { success: false, error: error.message || "Failed to initiate payment" };
  }
}

