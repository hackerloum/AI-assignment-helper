import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processPaymentCallback } from "@/app/actions/payment-actions";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get("paymentId");

  if (!paymentId) {
    return NextResponse.redirect(new URL("/purchase?error=invalid", request.url));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Note: ZenoPay payments are handled directly in payment-actions.ts
  // This route is kept for backward compatibility or future use
  // For ZenoPay, payments are processed synchronously when initiated
  await processPaymentCallback(paymentId, "completed", `TXN${Date.now()}`);

  return NextResponse.redirect(
    new URL("/?success=payment_completed", request.url)
  );
}

