# Payment Verification Fix

## Issues Fixed

### 1. 404 Error on Payment Status Check
**Problem:** `/api/payments/zenopay-callback?order_id=...` was returning 404 errors

**Solution:** 
- Created new endpoint `/api/payments/check-zenopay-status` that queries ZenoPay API directly
- This endpoint checks real-time payment status from ZenoPay's order-status API
- Falls back to database check if ZenoPay API fails

### 2. Payment Stuck on "Checking" Status
**Problem:** Payment verification page was stuck checking even after payment completed

**Solution:**
- Updated verification page to use new `/api/payments/check-zenopay-status` endpoint
- This endpoint queries ZenoPay directly using their order-status API
- Automatically updates database when payment status changes
- Handles completed payments immediately

### 3. Webhook Integration
**Problem:** Webhooks weren't being called properly

**Solution:**
- Updated payment initiation to include `webhook_url` parameter
- Webhook URL: `https://your-domain.com/api/payments/zenopay-callback`
- Webhook handler now properly parses ZenoPay's webhook format
- Handles both webhook notifications and manual status checks

## New Endpoints

### `/api/payments/check-zenopay-status` (GET)
- Queries ZenoPay order-status API directly
- Returns real-time payment status
- Automatically updates database when status changes
- Handles completed payments (adds credits or marks as paid)

**Query Parameters:**
- `order_id` (required): Payment order ID

**Response:**
```json
{
  "order_id": "...",
  "status": "completed" | "pending" | "failed",
  "transaction_id": "...",
  "amount": 3000,
  "channel": "MPESA-TZ",
  "reference": "...",
  "msisdn": "...",
  "created_at": "...",
  "updated_at": "..."
}
```

## Updated Files

1. **`app/api/payments/check-zenopay-status/route.ts`** (NEW)
   - Queries ZenoPay order-status API
   - Updates database automatically
   - Handles completed payments

2. **`app/api/payments/zenopay-callback/route.ts`** (UPDATED)
   - Improved webhook payload parsing
   - Handles ZenoPay's webhook format correctly
   - Better error handling and logging

3. **`app/api/payments/one-time/initiate/route.ts`** (UPDATED)
   - Added `webhook_url` parameter to payment initiation
   - Webhook URL automatically constructed from request

4. **`app/api/subscription/initiate/route.ts`** (UPDATED)
   - Added `webhook_url` parameter to subscription payments

5. **`app/(auth)/payment-verification/page.tsx`** (UPDATED)
   - Uses new `/api/payments/check-zenopay-status` endpoint
   - Falls back to database check if needed
   - Better error handling

6. **`app/(dashboard)/payment-status/page.tsx`** (UPDATED)
   - Uses new endpoint for real-time status checks

## How It Works Now

### Payment Flow:
1. User initiates payment → Payment created in database with `pending` status
2. ZenoPay payment initiated with `webhook_url` parameter
3. User completes payment on mobile phone
4. **Two ways payment is detected:**

   **A. Webhook (Automatic):**
   - ZenoPay sends webhook to `/api/payments/zenopay-callback`
   - Webhook handler updates database immediately
   - User sees status change in real-time

   **B. Polling (Fallback):**
   - Verification page polls `/api/payments/check-zenopay-status` every 3 seconds
   - This endpoint queries ZenoPay API directly
   - Updates database when status changes
   - User sees status change within 3 seconds

5. When payment status = `completed`:
   - For one-time payments: `has_paid_one_time_fee = true`
   - For subscriptions: Credits added to account
   - User auto-redirected to dashboard

## ZenoPay API Integration

### Order Status Check
```
GET https://zenoapi.com/api/payments/order-status?order_id={order_id}
Headers: x-api-key: YOUR_API_KEY
```

### Webhook Format
ZenoPay sends webhooks with this format:
```json
{
  "order_id": "...",
  "payment_status": "COMPLETED",
  "reference": "...",
  "transid": "...",
  "metadata": {...}
}
```

## Testing

### Test Payment Verification:
1. Initiate a payment
2. Complete payment on mobile phone
3. Check verification page - should update within 3 seconds
4. Should auto-redirect to dashboard when completed

### Test Webhook:
1. Set up webhook URL in ZenoPay dashboard (if needed)
2. Complete a payment
3. Check server logs for webhook notification
4. Database should update automatically

## Environment Variables

Make sure these are set:
- `ZENOPAY_API_KEY` - Your ZenoPay API key
- `NEXT_PUBLIC_APP_URL` - Your app URL (for webhook URL construction)
  - Example: `https://ai-assignment-helper-three.vercel.app`

## Notes

- Webhooks are only sent when payment status changes to `COMPLETED`
- Polling happens every 3 seconds as fallback
- Both methods update the database
- Payment verification is now real-time and reliable

