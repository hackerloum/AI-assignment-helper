"use server";

import { createClient } from "@/lib/supabase/server";
import { addCredits } from "@/lib/credits";
import {
  initiateZenoPayPayment,
  formatTanzanianPhone,
  validateTanzanianPhone,
} from "@/lib/zenopay";

export async function initiateSubscriptionPayment(data: {
  planType: 'daily' | 'monthly';
  buyerEmail: string;
  buyerName: string;
  buyerPhone: string;
}): Promise<{ success: boolean; paymentUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

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

    // Initiate ZenoPay payment
    const zenopayResponse = await initiateZenoPayPayment(zenopayApiKey, {
      order_id: payment.id,
      buyer_email: data.buyerEmail,
      buyer_name: data.buyerName,
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
      `Purchased ${plan.name} via ZenoPay`
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

