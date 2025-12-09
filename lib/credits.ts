import { createClient } from "@/lib/supabase/server";
import { CREDIT_COSTS, FREE_CREDITS_ON_SIGNUP } from "@/lib/constants";

export async function getUserCredits(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_credits")
    .select("balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    // Initialize credits for new user
    const { data: newData, error: insertError } = await supabase
      .from("user_credits")
      .insert({
        user_id: userId,
        balance: FREE_CREDITS_ON_SIGNUP,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error initializing credits:", insertError);
      return 0;
    }

    // Create initial transaction
    await supabase.from("credit_transactions").insert({
      user_id: userId,
      amount: FREE_CREDITS_ON_SIGNUP,
      type: "earned",
      description: "Welcome bonus credits",
    });

    return newData.balance;
  }

  return data.balance;
}

export async function deductCredits(
  userId: string,
  toolType: keyof typeof CREDIT_COSTS
): Promise<{ success: boolean; remainingCredits: number }> {
  const supabase = await createClient();
  const cost = CREDIT_COSTS[toolType];

  // Get current balance
  const currentBalance = await getUserCredits(userId);

  if (currentBalance < cost) {
    return { success: false, remainingCredits: currentBalance };
  }

  // Deduct credits
  const { data, error } = await supabase
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
  await supabase.from("credit_transactions").insert({
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
  description: string
): Promise<void> {
  const supabase = await createClient();
  const currentBalance = await getUserCredits(userId);

  await supabase
    .from("user_credits")
    .update({ balance: currentBalance + amount })
    .eq("user_id", userId);

  await supabase.from("credit_transactions").insert({
    user_id: userId,
    amount,
    type: "purchased",
    description,
  });
}

