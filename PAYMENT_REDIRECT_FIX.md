# Payment Redirect and Database Update Fix

## Issues Fixed

### 1. Database Not Updating
**Problem:** `has_paid_one_time_fee` was not being set to `true` even when payment was completed

**Root Causes:**
- Condition check was wrong: checked `payment.payment_status !== "completed"` AFTER updating status
- `user_credits` record might not exist, causing update to fail silently
- No error handling for missing records

**Solution:**
- Check OLD status before updating
- Create `user_credits` record if it doesn't exist
- Better error handling and logging
- Verify payment status even if already marked as completed

### 2. Redirect Loop
**Problem:** Countdown restarts instead of redirecting, causing infinite loop

**Root Causes:**
- `verifyPaymentStatus` returning false caused countdown reset
- Using `router.push()` which doesn't refresh state
- Dashboard checking payment status before database is updated

**Solution:**
- Use `window.location.href` for hard redirect (ensures fresh state)
- Don't reset countdown on verification failure, just retry
- Better error handling in redirect logic
- Dashboard checks pathname before redirecting

### 3. Payment Verification Not Working
**Problem:** Verification page couldn't confirm payment was processed

**Solution:**
- Updated `verifyPaymentStatus` to trigger status check first
- Waits for database update before checking
- Handles missing `user_credits` records
- Better logging for debugging

## Changes Made

### 1. `app/api/payments/check-zenopay-status/route.ts`
- Fixed condition to check OLD status before updating
- Added logic to handle already-completed payments
- Improved `handleCompletedPayment` function:
  - Creates `user_credits` record if it doesn't exist
  - Better error handling
  - More detailed logging

### 2. `app/api/payments/zenopay-callback/route.ts`
- Updated webhook handler to create `user_credits` record if missing
- Same logic as status check endpoint for consistency

### 3. `app/(auth)/payment-verification/page.tsx`
- Changed redirect to use `window.location.href` (hard redirect)
- Improved `verifyPaymentStatus` function:
  - Triggers status check first to ensure database is updated
  - Waits for database update before checking
  - Handles missing records properly
- Better error handling - redirects even on error after delay

### 4. `app/(dashboard)/layout.tsx`
- Added pathname check to prevent redirect loop
- Only redirects if not already on payment pages

## How It Works Now

### Payment Completion Flow:
1. User completes payment on mobile phone
2. ZenoPay sends webhook OR status check detects completion
3. Database updates:
   - Payment status → `completed`
   - If `user_credits` exists → update `has_paid_one_time_fee = true`
   - If `user_credits` doesn't exist → create with `has_paid_one_time_fee = true`
4. Verification page detects completion
5. Countdown starts (5 seconds)
6. Before redirect, verifies payment status in database
7. If verified → hard redirect to dashboard using `window.location.href`
8. Dashboard checks payment status → sees `has_paid_one_time_fee = true` → allows access

## Testing

### Test Payment Flow:
1. Make a payment
2. Complete it on mobile phone
3. Verification page should:
   - Show "Payment Successful" within 3 seconds
   - Start 5-second countdown
   - Redirect to dashboard automatically
4. Dashboard should:
   - Load without redirecting back to payment page
   - Show full access

### Verify Database:
```sql
-- Check payment status
SELECT id, payment_status, payment_type, user_id 
FROM payments 
WHERE id = 'your-order-id';

-- Check user payment status
SELECT user_id, has_paid_one_time_fee, balance 
FROM user_credits 
WHERE user_id = 'your-user-id';
```

## Key Improvements

1. **Database Updates:**
   - Always creates `user_credits` record if missing
   - Checks old status before updating
   - Handles edge cases properly

2. **Redirect Logic:**
   - Uses hard redirect (`window.location.href`)
   - Doesn't reset countdown on verification failure
   - Better error handling

3. **Verification:**
   - Triggers status check to ensure database is updated
   - Waits for database update
   - Handles missing records

4. **Error Handling:**
   - Comprehensive logging
   - Graceful fallbacks
   - User-friendly error messages

## Debugging

If payment still doesn't work:

1. **Check Server Logs:**
   - Look for `[Check ZenoPay Status]` messages
   - Check for database errors
   - Verify payment status updates

2. **Check Database:**
   ```sql
   -- Verify payment is marked as completed
   SELECT * FROM payments WHERE id = 'order-id';
   
   -- Verify user_credits has has_paid_one_time_fee = true
   SELECT * FROM user_credits WHERE user_id = 'user-id';
   ```

3. **Check Browser Console:**
   - Look for verification errors
   - Check network requests to `/api/payments/check-zenopay-status`
   - Verify redirect is happening

## Notes

- Hard redirect (`window.location.href`) ensures fresh state
- Database updates are now more reliable
- Verification waits for database to update
- All edge cases are handled

