-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Credits Table
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'purchased')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignments Table (stores AI tool usage history)
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('essay', 'paraphrase', 'grammar', 'citation', 'summarizer')),
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  credits_purchased INTEGER NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('zenopay')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_created_at ON assignments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own credits
CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can only see their own assignments
CREATE POLICY "Users can view own assignments"
  ON assignments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assignments"
  ON assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only see their own payments
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

