# ZenoPay Integration Guide

This document describes the ZenoPay payment integration for the AI Assignment Helper application.

## Overview

ZenoPay is the only payment method integrated for mobile money payments in Tanzania. ZenoPay handles all major mobile money providers (M-Pesa, TigoPesa, AirtelMoney) through a single unified API, eliminating the need for separate integrations. The integration allows users to purchase credits using their mobile money accounts from any supported provider.

## API Details

- **Endpoint:** `https://zenoapi.com/api/payments/mobile_money_tanzania`
- **Method:** POST
- **Authentication:** API key via `x-api-key` header

## Required Information

For each payment, ZenoPay requires:
- `order_id`: Unique transaction ID (UUID)
- `buyer_email`: Payer's email address
- `buyer_name`: Payer's full name
- `buyer_phone`: Tanzanian mobile number (format: 07XXXXXXXX)
- `amount`: Amount in TZS

## Implementation Details

### Files Modified/Created

1. **`lib/zenopay.ts`** - ZenoPay API client
   - `initiateZenoPayPayment()` - Initiates payment with ZenoPay
   - `validateTanzanianPhone()` - Validates phone number format
   - `formatTanzanianPhone()` - Formats phone number to Tanzanian format

2. **`app/actions/payment-actions.ts`** - Payment actions
   - Updated `initiatePayment()` to support ZenoPay
   - Handles ZenoPay API calls and payment record creation

3. **`components/purchase/purchase-credits.tsx`** - Purchase UI
   - Added dialog to collect user information (email, name, phone)
   - Validates phone number format
   - Initiates ZenoPay payments

4. **`supabase/schema.sql`** - Database schema
   - Added 'zenopay' to payment_method check constraint

5. **`types/database.ts`** - TypeScript types
   - Updated payment_method type to include 'zenopay'

## Environment Variables

Add the following environment variable:

```env
ZENOPAY_API_KEY=your_zenopay_api_key
```

**Important:** Keep this key secure and never commit it to version control.

## Database Migration

If you have an existing database, run the migration:

```sql
-- See supabase/migrations/add_zenopay.sql
```

Or manually update the constraint:

```sql
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE payments 
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('mpesa', 'tigopesa', 'airtelmoney', 'zenopay'));
```

## Payment Flow

1. User clicks "Purchase" on a credit package
2. Dialog opens to collect/confirm user information:
   - Email (pre-filled from auth)
   - Full Name (pre-filled if available)
   - Phone Number (Tanzanian format: 07XXXXXXXX)
3. User confirms payment details
4. System creates payment record in database with status "pending"
5. System calls ZenoPay API with payment details
6. ZenoPay returns transaction_id if successful
7. Payment record is updated with transaction_id
8. User is redirected to success page
9. Credits are added to user account (handled by callback/webhook if needed)

## Phone Number Validation

Tanzanian phone numbers must follow the format: `07XXXXXXXX` (10 digits starting with 07).

The system automatically:
- Removes spaces
- Converts international format (+255 or 255) to local format (07)
- Validates the final format

## Error Handling

The integration handles various error scenarios:

- **Missing API key:** Returns error message
- **Invalid phone number:** Validates format before API call
- **ZenoPay API errors:** Returns error message from API response
- **Network errors:** Catches and handles connection failures

## Testing

To test the integration:

1. Set `ZENOPAY_API_KEY` environment variable
2. Ensure database schema is updated
3. Navigate to purchase page
4. Select a credit package
5. Fill in payment details
6. Confirm payment
7. Check payment status in database

## Security Considerations

- API key is stored server-side only (not exposed to client)
- Phone numbers are validated before API calls
- Payment records are protected by Row Level Security (RLS)
- All API calls are made server-side

## Support

For ZenoPay API issues:
- Check ZenoPay API documentation
- Verify API key is correct
- Check API endpoint is accessible
- Review error messages in server logs

## Future Enhancements

Potential improvements:
- Webhook handling for payment status updates
- Payment status polling
- Retry mechanism for failed API calls
- Payment history display
- Refund handling

