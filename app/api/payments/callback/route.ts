import { NextRequest, NextResponse } from "next/server";
import { processPaymentCallback } from "@/app/actions/payment-actions";

// This endpoint receives webhooks/callbacks from ZenoPay (if supported)
// Currently, ZenoPay processes payments synchronously, but this endpoint
// is available for future webhook support
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract payment details from ZenoPay webhook/callback
    // Format depends on ZenoPay webhook structure
    const paymentId = body.paymentId || body.MerchantRequestID;
    const transactionId = body.TransactionID || body.CheckoutRequestID;
    const status =
      body.ResultCode === 0 ? "completed" : "failed";

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    const result = await processPaymentCallback(
      paymentId,
      status,
      transactionId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Return success response to ZenoPay
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error: any) {
    console.error("Payment callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

