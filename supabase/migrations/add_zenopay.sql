-- Migration: Switch to ZenoPay as the only payment method
-- This migration updates the payments table to only support 'zenopay' as a payment method
-- ZenoPay handles all mobile money providers (M-Pesa, TigoPesa, AirtelMoney)

-- Drop the existing check constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;

-- Add the new check constraint with only zenopay
ALTER TABLE payments 
ADD CONSTRAINT payments_payment_method_check 
CHECK (payment_method IN ('zenopay'));

