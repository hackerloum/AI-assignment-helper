import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { checkZenoPayOrderStatus } from "@/lib/zenopay";

/**
 * Check payment status directly from ZenoPay API
 * This endpoint queries ZenoPay's order-status API to get real-time payment status
 * Uses admin client to bypass RLS for payment processing
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

      // Use ADMIN client to bypass RLS for payment processing
      const supabase = createAdminClient();
      const { data: payment } = await supabase
        .from("payments")
        .select("*")
        .eq("id", orderId)
        .single();

      if (payment) {
        const oldStatus = payment.payment_status;
        
        // Always handle completed payments, regardless of status change
        if (status === "completed") {
          // Update payment record first
          if (payment.payment_status !== status) {
            const { error: updateError } = await supabase
              .from("payments")
              .update({
                payment_status: status,
                transaction_id: paymentData.transid || payment.transaction_id,
                updated_at: new Date().toISOString(),
              })
              .eq("id", orderId);

            if (updateError) {
              console.error("[Check ZenoPay Status] Failed to update payment:", updateError);
            } else {
              console.log(`[Check ZenoPay Status] Payment status updated: ${oldStatus} -> ${status}`);
            }
          }
          
          // Always try to update user_credits when payment is completed
          console.log("[Check ZenoPay Status] Processing completed payment for user:", payment.user_id);
          try {
            await handleCompletedPayment(payment, paymentData.transid || null, supabase);
          } catch (error) {
            console.error("[Check ZenoPay Status] Error in handleCompletedPayment:", error);
            // Continue anyway - payment is completed
          }
        } else if (payment.payment_status !== status) {
          // Update payment record for non-completed status changes
          const { error: updateError } = await supabase
            .from("payments")
            .update({
              payment_status: status,
              transaction_id: paymentData.transid || payment.transaction_id,
              updated_at: new Date().toISOString(),
            })
            .eq("id", orderId);

          if (updateError) {
            console.error("[Check ZenoPay Status] Failed to update payment:", updateError);
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
    const supabase = createAdminClient();
    
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
  console.log("[Check ZenoPay Status] handleCompletedPayment called for payment:", {
    payment_id: payment.id,
    user_id: payment.user_id,
    payment_type: payment.payment_type
  });

  try {
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
      console.log("[Check ZenoPay Status] Processing one-time payment for user:", payment.user_id);
      
      // First, check if user_credits record exists
      const { data: existingCredits, error: fetchError } = await supabase
        .from("user_credits")
        .select("has_paid_one_time_fee")
        .eq("user_id", payment.user_id)
        .single();

      console.log("[Check ZenoPay Status] Existing credits check:", {
        exists: !!existingCredits,
        error: fetchError?.code,
        has_paid: existingCredits?.has_paid_one_time_fee
      });

      if (fetchError && fetchError.code === 'PGRST116') {
        // Record doesn't exist, create it
        console.log("[Check ZenoPay Status] Creating user_credits record for user:", payment.user_id);
        const { data: newCredits, error: insertError } = await supabase
          .from("user_credits")
          .insert({
            user_id: payment.user_id,
            balance: 0,
            has_paid_one_time_fee: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error("[Check ZenoPay Status] Failed to create user_credits:", insertError);
          // Try upsert instead
          const { error: upsertError } = await supabase
            .from("user_credits")
            .upsert({
              user_id: payment.user_id,
              balance: 0,
              has_paid_one_time_fee: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          if (upsertError) {
            console.error("[Check ZenoPay Status] Upsert also failed:", upsertError);
            throw upsertError;
          } else {
            console.log("[Check ZenoPay Status] ✅ Upserted user_credits with has_paid_one_time_fee=true");
          }
        } else {
          console.log("[Check ZenoPay Status] ✅ Created user_credits with has_paid_one_time_fee=true:", newCredits);
        }
      } else if (fetchError) {
        console.error("[Check ZenoPay Status] Error fetching user_credits:", fetchError);
        // Try to create anyway
        const { error: insertError } = await supabase
          .from("user_credits")
          .upsert({
            user_id: payment.user_id,
            balance: 0,
            has_paid_one_time_fee: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (insertError) {
          console.error("[Check ZenoPay Status] Failed to upsert user_credits:", insertError);
          throw insertError;
        } else {
          console.log("[Check ZenoPay Status] ✅ Upserted user_credits after fetch error");
        }
      } else {
        // Record exists, update it
        console.log("[Check ZenoPay Status] Updating existing user_credits record");
        const { data: updatedCredits, error: updateError } = await supabase
          .from("user_credits")
          .update({ 
            has_paid_one_time_fee: true,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", payment.user_id)
          .select()
          .single();
        
        if (updateError) {
          console.error("[Check ZenoPay Status] Failed to update payment status:", updateError);
          // Try upsert as fallback
          const { error: upsertError } = await supabase
            .from("user_credits")
            .upsert({
              user_id: payment.user_id,
              has_paid_one_time_fee: true,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
          
          if (upsertError) {
            console.error("[Check ZenoPay Status] Upsert fallback also failed:", upsertError);
            throw upsertError;
          } else {
            console.log("[Check ZenoPay Status] ✅ Upserted user_credits after update error");
          }
        } else {
          const wasAlreadyPaid = existingCredits?.has_paid_one_time_fee;
          console.log("[Check ZenoPay Status] Update result:", {
            wasAlreadyPaid,
            updated: updatedCredits?.has_paid_one_time_fee
          });
          if (!wasAlreadyPaid) {
            console.log("[Check ZenoPay Status] ✅ One-time payment marked as paid for user:", payment.user_id);
          } else {
            console.log("[Check ZenoPay Status] ✅ User already marked as paid (verified)");
          }
        }
      }
    }
  } catch (error: any) {
    console.error("[Check ZenoPay Status] Error in handleCompletedPayment:", error);
    // Don't throw - log and continue
    console.error("[Check ZenoPay Status] Error details:", JSON.stringify(error, null, 2));
  }
}

