/**
 * ZenoPay API Client
 * Handles mobile money payments for Tanzania
 */

const ZENOPAY_API_URL = "https://zenoapi.com/api/payments/mobile_money_tanzania";

export interface ZenoPayRequest {
  order_id: string;
  buyer_email: string;
  buyer_name: string;
  buyer_phone: string;
  amount: number;
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
 * Check ZenoPay order status
 * This function queries ZenoPay API directly to get real-time payment status
 */
export async function checkZenoPayOrderStatus(
  orderId: string,
  apiKey: string
): Promise<{ status: string; data?: any; error?: string }> {
  try {
    const response = await fetch(
      `https://zenoapi.com/api/payments/order-status?order_id=${orderId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        status: "error",
        error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    
    // ZenoPay returns data in a data array
    const orderData = data.data?.[0];
    
    if (!orderData) {
      return {
        status: "pending",
        error: "Order not found in ZenoPay system",
      };
    }

    // Map ZenoPay payment_status to our status
    const zenopayStatus = orderData.payment_status?.toUpperCase() || "PENDING";
    let mappedStatus = "pending";
    
    if (zenopayStatus === "SUCCESS" || zenopayStatus === "COMPLETED" || zenopayStatus === "PAID") {
      mappedStatus = "completed";
    } else if (zenopayStatus === "FAILED" || zenopayStatus === "ERROR" || zenopayStatus === "CANCELLED") {
      mappedStatus = "failed";
    }

    return {
      status: mappedStatus,
      data: {
        payment_status: mappedStatus,
        transaction_id: orderData.transaction_id,
        amount: orderData.amount,
        ...orderData,
      },
    };
  } catch (error: any) {
    console.error("ZenoPay order status check error:", error);
    return {
      status: "error",
      error: error.message || "Failed to check order status",
    };
  }
}

