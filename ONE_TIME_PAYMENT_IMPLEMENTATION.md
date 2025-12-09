# One-Time Payment System Implementation

## Overview

This document describes the implementation of a one-time payment system for first-time signups. Users must pay 3,000 TZS (Tanzanian Shilling) to access the dashboard and all features.

## Features

- ✅ One-time payment of 3,000 TZS for new users
- ✅ Payment verification with automatic redirect
- ✅ Dashboard access blocked until payment is completed
- ✅ Automatic payment status checking
- ✅ Seamless payment flow with ZenoPay integration

## Database Changes

### Migration: `004_add_one_time_payment.sql`

1. **Added `has_paid_one_time_fee` field** to `user_credits` table
   - Type: `BOOLEAN DEFAULT FALSE`
   - Tracks if user has paid the one-time signup fee

2. **Added `payment_type` field** to `payments` table
   - Type: `TEXT DEFAULT 'subscription'`
   - Values: `'subscription'` or `'one_time'`
   - Distinguishes between subscription payments and one-time fees

## API Endpoints

### 1. `/api/payments/one-time/initiate` (POST)
- Initiates a one-time payment of 3,000 TZS
- Creates payment record with `payment_type: 'one_time'`
- Returns payment verification URL

**Request Body:**
```json
{
  "buyerEmail": "user@example.com",
  "buyerName": "John Doe",
  "buyerPhone": "0712345678"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "/payment-verification?order_id=...&type=one_time",
  "orderId": "...",
  "status": "pending"
}
```

### 2. `/api/payments/check-status` (GET)
- Checks if user has paid the one-time fee
- Used by dashboard layout to verify access

**Response:**
```json
{
  "hasPaid": true,
  "userId": "..."
}
```

### 3. `/api/payments/zenopay-callback` (POST/GET)
- Updated to handle one-time payments
- When `payment_type === 'one_time'` and status is `'completed'`:
  - Marks `has_paid_one_time_fee = true` in `user_credits` table
  - Does NOT add credits (one-time payment is for access, not credits)

## Pages

### 1. `/one-time-payment`
- Payment form for one-time signup fee
- Collects: name, email, phone number
- Validates phone number format (Tanzanian: 07XXXXXXXX)
- Redirects to payment verification page after initiation

### 2. `/payment-verification`
- Verifies payment status
- Auto-polls every 3 seconds for payment confirmation
- Auto-redirects to dashboard when payment is completed (5 second countdown)
- Manual verification button available
- Shows payment status (pending/completed/failed)

## Access Control

### Dashboard Layout (`app/(dashboard)/layout.tsx`)
- Checks payment status on mount
- Redirects to `/one-time-payment` if user hasn't paid
- Shows loading state while checking payment status

### Login Redirect (`app/actions/auth-actions.ts`)
- After successful login, checks payment status
- Redirects to `/one-time-payment` if not paid
- Redirects to `/dashboard` if already paid

### Auth Callback (`app/auth/callback/route.ts`)
- After email verification, checks payment status
- Redirects accordingly based on payment status

## Payment Flow

```
1. User signs up
   ↓
2. User logs in
   ↓
3. System checks payment status
   ↓
4a. If NOT paid → Redirect to /one-time-payment
   ↓
5a. User fills payment form
   ↓
6a. Payment initiated via ZenoPay
   ↓
7a. Redirect to /payment-verification
   ↓
8a. Payment status checked (auto-polling)
   ↓
9a. When completed → Mark has_paid_one_time_fee = true
   ↓
10a. Auto-redirect to /dashboard
   ↓
4b. If ALREADY paid → Redirect to /dashboard
```

## Payment Verification

The payment verification process:

1. **Automatic Polling**: Checks payment status every 3 seconds
2. **ZenoPay Callback**: Webhook updates payment status when completed
3. **Database Update**: When payment completes, `has_paid_one_time_fee` is set to `true`
4. **Auto-Redirect**: After verification, automatically redirects to dashboard (5 second countdown)
5. **Manual Verification**: User can click "I've Completed Payment" to verify immediately

## Security

- ✅ Payment status checked server-side
- ✅ User authentication required for all payment operations
- ✅ Payment records linked to user ID
- ✅ Phone number validation (Tanzanian format)
- ✅ Session token validation for API calls

## Testing

### Test Payment Flow:

1. **Create a new user account**
2. **Login** - Should redirect to `/one-time-payment`
3. **Fill payment form** with valid Tanzanian phone number
4. **Initiate payment** - Should redirect to `/payment-verification`
5. **Complete payment** on mobile phone (M-Pesa/TigoPesa/Airtel Money)
6. **Wait for verification** - Should auto-redirect to `/dashboard`
7. **Access dashboard** - Should work without redirect

### Test Already Paid User:

1. **Login with user who has paid**
2. **Should redirect directly to `/dashboard`**
3. **No payment page shown**

## Environment Variables

No new environment variables required. Uses existing:
- `ZENOPAY_API_KEY` - For payment processing
- `NEXT_PUBLIC_SUPABASE_URL` - Database connection
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Database authentication

## Migration Instructions

1. **Run the migration:**
   ```sql
   -- Run: supabase/migrations/004_add_one_time_payment.sql
   ```

2. **Verify migration:**
   ```sql
   -- Check user_credits table has new column
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'user_credits' 
   AND column_name = 'has_paid_one_time_fee';
   
   -- Check payments table has new column
   SELECT column_name, data_type, column_default 
   FROM information_schema.columns 
   WHERE table_name = 'payments' 
   AND column_name = 'payment_type';
   ```

## Notes

- **Amount**: Fixed at 3,000 TZS (hardcoded in API endpoint)
- **No Credits**: One-time payment does NOT add credits to user account
- **One-Time Only**: Users can only pay once (checked before payment initiation)
- **Existing Users**: Users who signed up before this feature will have `has_paid_one_time_fee = false` by default
- **Payment Method**: Uses ZenoPay (supports M-Pesa, TigoPesa, Airtel Money)

## Future Enhancements

- Admin panel to manually mark users as paid
- Bulk payment status updates
- Payment history page
- Refund functionality (if needed)
- Payment reminders for unpaid users

