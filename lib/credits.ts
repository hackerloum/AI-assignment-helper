import { CREDIT_COSTS, FREE_CREDITS_ON_SIGNUP } from "@/lib/constants";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserCredits(
  userId: string,
  supabase?: SupabaseClient
): Promise<number> {
  // If supabase client is provided, use it; otherwise create a new one
  let client = supabase;
  if (!client) {
    const { createClient } = await import("@/lib/supabase/server");
    client = await createClient();
  }

  console.log(`[getUserCredits] Checking credits for user: ${userId}`);

  const { data, error } = await client
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    console.log(`[getUserCredits] No credit record found, creating with ${FREE_CREDITS_ON_SIGNUP} credits`);
    
    // Initialize credits for new user
    const { data: newData, error: insertError } = await client
      .from("user_credits")
      .insert({
        user_id: userId,
        balance: FREE_CREDITS_ON_SIGNUP,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[getUserCredits] Error initializing credits:", insertError);
      // Return default credits even if insert fails (for display purposes)
      return FREE_CREDITS_ON_SIGNUP;
    }

    // Create initial transaction
    const { error: transactionError } = await client.from("credit_transactions").insert({
      user_id: userId,
      amount: FREE_CREDITS_ON_SIGNUP,
      type: "earned",
      description: "Welcome bonus credits",
    });

    if (transactionError) {
      console.error("[getUserCredits] Error creating transaction:", transactionError);
    }

    console.log(`[getUserCredits] ✅ Created credit record with ${newData.balance} credits`);
    return newData.balance;
  }

  console.log(`[getUserCredits] ✅ Found ${data.balance} credits for user`);
  return data.balance;
}

export async function deductCredits(
  userId: string,
  toolType: keyof typeof CREDIT_COSTS,
  supabase?: SupabaseClient,
  customCost?: number
): Promise<{ success: boolean; remainingCredits: number }> {
  // If supabase client is provided, use it; otherwise create a new one
  let client = supabase;
  if (!client) {
    const { createClient } = await import("@/lib/supabase/server");
    client = await createClient();
  }

  const cost = customCost ?? CREDIT_COSTS[toolType];
  console.log(`[deductCredits] Attempting to deduct ${cost} credits for ${toolType} tool`);

  // Get current balance (pass the client to avoid creating another one)
  const currentBalance = await getUserCredits(userId, client);
  console.log(`[deductCredits] Current balance: ${currentBalance}, Required: ${cost}`);

  if (currentBalance < cost) {
    return { success: false, remainingCredits: currentBalance };
  }

  // Deduct credits
  const { data, error } = await client
    .from("user_credits")
    .update({ balance: currentBalance - cost })
    .eq("user_id", userId)
    .select()
    .single();

  if (error || !data) {
    console.error("Error deducting credits:", error);
    return { success: false, remainingCredits: currentBalance };
  }

  // Record transaction
  await client.from("credit_transactions").insert({
    user_id: userId,
    amount: -cost,
    type: "spent",
    description: `Used ${toolType} tool`,
  });

  return { success: true, remainingCredits: data.balance };
}

export async function addCredits(
  userId: string,
  amount: number,
  description: string,
  supabase?: SupabaseClient
): Promise<void> {
  // If supabase client is provided, use it; otherwise create a new one
  let client = supabase;
  if (!client) {
    const { createClient } = await import("@/lib/supabase/server");
    client = await createClient();
  }

  const currentBalance = await getUserCredits(userId, client);

  await client
    .from("user_credits")
    .update({ balance: currentBalance + amount })
    .eq("user_id", userId);

  await client.from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: "purchased",
    description,
  });
}

