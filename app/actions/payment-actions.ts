"use server";

import { createClient } from "@/lib/supabase/server";
import { addCredits } from "@/lib/credits";
import {
  initiateZenoPayPayment,
  formatTanzanianPhone,
  validateTanzanianPhone,
} from "@/lib/zenopay";

export async function initiatePayment(data: {
  credits: number;
  amount: number;
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
}): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();
    
    // Try getSession first (more reliable for server actions)
    const { data: { session } } = await supabase.auth.getSession();
    let user = session?.user ?? null;
    
    // Fallback to getUser if session didn't work
    if (!user) {
      const { data: { user: userFromGetUser } } = await supabase.auth.getUser();
      user = userFromGetUser;
    }

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

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

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: data.amount,
        credits_purchased: data.credits,
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

    // Initiate ZenoPay payment
    const zenopayResponse = await initiateZenoPayPayment(zenopayApiKey, {
      order_id: payment.id,
      buyer_email: data.buyerEmail,
      buyer_name: data.buyerName,
      buyer_phone: formattedPhone,
      amount: data.amount,
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
    // Note: ZenoPay returns success when payment is initiated
    // If webhooks are available later, we can update status via callback
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
      data.credits,
      `Purchased ${data.credits} credits via ZenoPay`,
      supabase
    );

    // ZenoPay payment completed, redirect to success page
    return {
      success: true,
      paymentUrl: `/purchase?success=true&paymentId=${payment.id}`,
    };
  } catch (error: any) {
    console.error("Error initiating payment:", error);
    return { success: false, error: error.message || "Failed to initiate payment" };
  }
}

export async function processPaymentCallback(
  paymentId: string,
  status: "completed" | "failed",
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (fetchError || !payment) {
      return { success: false, error: "Payment not found" };
    }

    if (payment.payment_status !== "pending") {
      return { success: false, error: "Payment already processed" };
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_status: status,
        transaction_id: transactionId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId);

    if (updateError) {
      return { success: false, error: "Failed to update payment" };
    }

    // If payment successful, add credits
    if (status === "completed") {
      await addCredits(
        payment.user_id,
        payment.credits_purchased,
        `Purchased ${payment.credits_purchased} credits`,
        supabase
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error processing payment callback:", error);
    return { success: false, error: error.message || "Failed to process payment" };
  }
}

