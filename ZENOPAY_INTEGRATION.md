# ZenoPay Integration Documentation

## Overview

This document describes how the application integrates with ZenoPay for mobile money payments in Tanzania.

## API Endpoints

### 1. Order Status Check

**URL:** `https://zenoapi.com/api/payments/order-status`  
**Method:** `GET`  
**Header:** `x-api-key: YOUR_API_KEY`  
**Parameter:** `order_id`

**Sample Request:**
```bash
curl -X GET "https://zenoapi.com/api/payments/order-status?order_id=3rer407fe-3ee8-4525-456f-ccb95de38250" \
  -H "x-api-key: YOUR_API_KEY"
```

**Sample Response:**
```json
{
  "reference": "0936183435",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Order fetch successful",
  "data": [
    {
      "order_id": "3rer407fe-3ee8-4525-456f-ccb95de38250",
      "creation_date": "2025-05-19 08:40:33",
      "amount": "1000",
      "payment_status": "COMPLETED",
      "transid": "CEJ3I3SETSN",
      "channel": "MPESA-TZ",
      "reference": "0936183435",
      "msisdn": "255744963858"
    }
  ]
}
```

**Payment Status Values:**
- `COMPLETED` - Payment successful
- `PENDING` - Payment in progress
- `FAILED` - Payment failed
- `CANCELLED` - Payment cancelled

## Webhook Notifications

### Setup

Include `webhook_url` in your payment initiation request:

```json
{
  "order_id": "3rer407fe-3ee8-4525-456f-ccb95de38250",
  "buyer_email": "iam@gmail.com",
  "buyer_name": "John Joh",
  "buyer_phone": "0744963858",
  "amount": 1000,
  "webhook_url": "https://your-domain.com/api/payments/zenopay-callback"
}
```

### Authentication

ZenoPay sends `x-api-key` in the request header. Our webhook handler verifies this matches `ZENOPAY_API_KEY` environment variable.

### Webhook Payload

**Format:**
```json
{
  "order_id": "677e43274d7cb",
  "payment_status": "COMPLETED",
  "reference": "1003020496",
  "metadata": {
    "product": "..."
  }
}
```

**Note:** Webhooks are only triggered when payment status changes to `COMPLETED`.

## Implementation Details

### 1. Payment Verification (`/api/payments/tool/verify`)

This endpoint:
- First checks our database for payment record
- If not found, queries ZenoPay directly using order status API
- If payment is pending, checks ZenoPay for real-time status
- Updates database if ZenoPay shows completed status
- Automatically unlocks tool content when payment is verified

### 2. Webhook Handler (`/api/payments/zenopay-callback`)

This endpoint:
- Verifies `x-api-key` header matches environment variable
- Parses webhook payload (`order_id`, `payment_status`, `reference`, `transid`)
- Updates payment record in database
- Handles different payment types:
  - **Subscription**: Adds credits to user account
  - **One-time**: Marks user as paid (registration fee)
  - **Tool**: Unlocks content for pay-per-use tools

### 3. Order Status Check Function (`lib/zenopay.ts`)

The `checkZenoPayOrderStatus()` function:
- Queries ZenoPay order status API
- Returns standardized response format
- Handles errors gracefully

## Payment Flow

### Tool Payments (Pay-Per-Use)

1. User initiates tool usage → Creates payment record with `payment_type: 'tool'`
2. Payment initiated via ZenoPay → Returns `order_id` (UUID)
3. User completes payment on phone
4. ZenoPay sends webhook → Updates payment status to `COMPLETED`
5. Webhook handler unlocks content → Sets `metadata.unlocked: true`
6. User can verify payment → `/api/payments/tool/verify` checks status
7. Content unlocked → User can view, copy, download

### Subscription Payments

1. User initiates subscription → Creates payment record
2. Payment completed → Webhook adds credits to account
3. User can use tools with credits

### One-Time Registration Fee

1. New user signs up → Redirected to payment page
2. Payment completed → Webhook marks `has_paid_one_time_fee: true`
3. User gains dashboard access

## Error Handling

- **404 on verify**: Payment not found - checks ZenoPay directly
- **Invalid API key**: Webhook rejected with 401
- **Missing order_id**: Webhook rejected with 400
- **Payment timeout**: User can manually verify payment

## Environment Variables

Required:
- `ZENOPAY_API_KEY` - Your ZenoPay API key
- `NEXT_PUBLIC_APP_URL` - Base URL for webhook callbacks

## Testing

To test payment verification:
1. Initiate a payment
2. Complete payment on phone
3. Call `/api/payments/tool/verify?paymentId={order_id}`
4. Should return `status: "completed"`

To test webhook (use ZenoPay test mode or webhook testing tool):
1. Send POST to `/api/payments/zenopay-callback`
2. Include `x-api-key` header
3. Send payload: `{ "order_id": "...", "payment_status": "COMPLETED", ... }`
