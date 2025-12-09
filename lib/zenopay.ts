/**
 * ZenoPay API Client
 * Handles mobile money payments for Tanzania
 */

const ZENOPAY_API_URL = "https://zenoapi.com/api/payments/mobile_money_tanzania";
const ZENOPAY_ORDER_STATUS_URL = "https://zenoapi.com/api/payments/order-status";

export interface ZenoPayRequest {
  order_id: string;
  buyer_email: string;
  buyer_name: string;
  buyer_phone: string;
  amount: number;
  webhook_url?: string;
}

export interface ZenoPayResponse {
  status: "success" | "error";
  message: string;
  transaction_id?: string;
}

export interface ZenoPayError {
  status: "error";
  message: string;
  error?: string;
}

export interface ZenoPayOrderStatusResponse {
  reference: string;
  resultcode: string;
  result: string;
  message: string;
  data?: Array<{
    order_id: string;
    creation_date: string;
    amount: string;
    payment_status: "COMPLETED" | "PENDING" | "FAILED" | "CANCELLED";
    transid?: string;
    channel?: string;
    reference?: string;
    msisdn?: string;
  }>;
}

/**
 * Initiate a payment with ZenoPay
 */
export async function initiateZenoPayPayment(
  apiKey: string,
  request: ZenoPayRequest
): Promise<ZenoPayResponse | ZenoPayError> {
  try {
    const response = await fetch(ZENOPAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "error",
        message: data.message || "Payment initiation failed",
        error: data.error,
      };
    }

    return data as ZenoPayResponse;
  } catch (error: any) {
    console.error("ZenoPay API error:", error);
    return {
      status: "error",
      message: error.message || "Failed to connect to payment service",
    };
  }
}

/**
 * Validate Tanzanian phone number format (07XXXXXXXX)
 */
export function validateTanzanianPhone(phone: string): boolean {
  const phoneRegex = /^07\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

/**
 * Format phone number to Tanzanian format (remove spaces, ensure starts with 07)
 */
export function formatTanzanianPhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.startsWith("255")) {
    // Convert international format to local
    return "0" + cleaned.slice(3);
  }
  if (cleaned.startsWith("+255")) {
    return "0" + cleaned.slice(4);
  }
  return cleaned;
}

/**
 * Check order status from ZenoPay
 */
export async function checkZenoPayOrderStatus(
  apiKey: string,
  orderId: string
): Promise<ZenoPayOrderStatusResponse | ZenoPayError> {
  try {
    const response = await fetch(
      `${ZENOPAY_ORDER_STATUS_URL}?order_id=${orderId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        status: "error",
        message: data.message || "Failed to check order status",
        error: data.error,
      };
    }

    return data as ZenoPayOrderStatusResponse;
  } catch (error: any) {
    console.error("ZenoPay Order Status API error:", error);
    return {
      status: "error",
      message: error.message || "Failed to connect to payment service",
    };
  }
}

