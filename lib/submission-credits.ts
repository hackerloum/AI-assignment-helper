import { createClient } from "@/lib/supabase/server";
import { getUserCredits } from "./credits";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreditRewardRules {
  individual: {
    base: number;
    qualityMultiplier: {
      excellent: number; // 4.5-5.0
      good: number;      // 3.5-4.4
      average: number;   // 2.5-3.4
      poor: number;      // 1.0-2.4
    };
    wordCountBonus: {
      threshold: number; // e.g., 5000 words
      bonus: number;
    };
  };
  group: {
    base: number;
    memberCountMultiplier: number; // per member
    qualityMultiplier: {
      excellent: number;
      good: number;
      average: number;
      poor: number;
    };
  };
  achievements: {
    firstSubmission: number;
    perfectScore: number; // 5.0 quality
    tenSubmissions: number;
    fiftySubmissions: number;
    topContributor: number;
  };
  trainingBonus: number; // 10% bonus for allowing training data use
}

export const CREDIT_REWARD_RULES: CreditRewardRules = {
  individual: {
    base: 50,
    qualityMultiplier: {
      excellent: 2.0,  // 100 credits for excellent
      good: 1.5,       // 75 credits for good
      average: 1.0,    // 50 credits for average
      poor: 0.5,       // 25 credits for poor
    },
    wordCountBonus: {
      threshold: 5000,
      bonus: 25,
    },
  },
  group: {
    base: 100,
    memberCountMultiplier: 20, // +20 per member
    qualityMultiplier: {
      excellent: 2.0,
      good: 1.5,
      average: 1.0,
      poor: 0.5,
    },
  },
  achievements: {
    firstSubmission: 25,
    perfectScore: 100,
    tenSubmissions: 50,
    fiftySubmissions: 200,
    topContributor: 500,
  },
  trainingBonus: 0.1, // 10% bonus
};

export async function calculateSubmissionCredits(
  submissionId: string,
  qualityScore: number,
  wordCount: number,
  submissionType: 'individual' | 'group',
  canUseForTraining: boolean = false,
  memberCount?: number,
  supabase?: SupabaseClient
): Promise<number> {
  const rules = submissionType === 'individual' 
    ? CREDIT_REWARD_RULES.individual 
    : CREDIT_REWARD_RULES.group;

  // Base credits
  let credits = rules.base;

  // Quality multiplier
  let qualityMultiplier = rules.qualityMultiplier.poor;
  if (qualityScore >= 4.5) {
    qualityMultiplier = rules.qualityMultiplier.excellent;
  } else if (qualityScore >= 3.5) {
    qualityMultiplier = rules.qualityMultiplier.good;
  } else if (qualityScore >= 2.5) {
    qualityMultiplier = rules.qualityMultiplier.average;
  }

  credits = Math.floor(credits * qualityMultiplier);

  // Word count bonus (individual only)
  if (submissionType === 'individual' && wordCount >= CREDIT_REWARD_RULES.individual.wordCountBonus.threshold) {
    credits += CREDIT_REWARD_RULES.individual.wordCountBonus.bonus;
  }

  // Group member bonus
  if (submissionType === 'group' && memberCount) {
    credits += CREDIT_REWARD_RULES.group.memberCountMultiplier * memberCount;
  }

  // Training data bonus (10% extra)
  if (canUseForTraining) {
    credits = Math.floor(credits * (1 + CREDIT_REWARD_RULES.trainingBonus));
  }

  return credits;
}

export async function awardSubmissionCredits(
  userId: string,
  submissionId: string,
  credits: number,
  reason: string,
  supabase?: SupabaseClient
): Promise<void> {
  let client = supabase;
  if (!client) {
    client = await createClient();
  }
  
  // Add credits to user account (using service client for proper transaction type)
  const currentBalance = await getUserCredits(userId, client);
  
  await client
    .from("user_credits")
    .update({ balance: currentBalance + credits })
    .eq("user_id", userId);

  await client.from("credit_transactions").insert({
    user_id: userId,
    amount: credits,
    type: "earned", // Use "earned" for submission rewards
    description: `Assignment submission approved: ${reason}`,
  });

  // Update submission record
  const { error } = await client
    .from('assignment_submissions')
    .update({
      credits_awarded: credits,
      credits_awarded_at: new Date().toISOString(),
    })
    .eq('id', submissionId);

  if (error) {
    console.error('Error updating submission credits:', error);
    throw error;
  }
}

export async function checkAndAwardAchievements(
  userId: string,
  submissionId: string,
  supabase?: SupabaseClient
): Promise<void> {
  let client = supabase;
  if (!client) {
    client = await createClient();
  }
  
  // Get user submission stats
  const { data: stats } = await client
    .from('assignment_submissions')
    .select('id, quality_score, status')
    .eq('user_id', userId)
    .eq('status', 'approved');

  if (!stats || stats.length === 0) return;

  const totalSubmissions = stats.length;
  const hasPerfectScore = stats.some(s => s.quality_score === 5.0);
  const isFirstSubmission = totalSubmissions === 1;

  // Check existing achievements
  const { data: existingAchievements } = await client
    .from('user_achievements')
    .select('achievement_type')
    .eq('user_id', userId);

  const existingTypes = new Set(existingAchievements?.map(a => a.achievement_type) || []);

  // Check achievements
  const achievements = [];

  if (isFirstSubmission && !existingTypes.has('first_submission')) {
    achievements.push({
      user_id: userId,
      achievement_type: 'first_submission',
      achievement_name: 'First Steps',
      description: 'Submitted your first assignment',
      credits_bonus: CREDIT_REWARD_RULES.achievements.firstSubmission,
    });
  }

  if (hasPerfectScore && !existingTypes.has('perfect_score')) {
    achievements.push({
      user_id: userId,
      achievement_type: 'perfect_score',
      achievement_name: 'Perfectionist',
      description: 'Achieved a perfect 5.0 quality score',
      credits_bonus: CREDIT_REWARD_RULES.achievements.perfectScore,
    });
  }

  if (totalSubmissions === 10 && !existingTypes.has('ten_submissions')) {
    achievements.push({
      user_id: userId,
      achievement_type: 'ten_submissions',
      achievement_name: 'Dedicated Scholar',
      description: 'Submitted 10 approved assignments',
      credits_bonus: CREDIT_REWARD_RULES.achievements.tenSubmissions,
    });
  }

  if (totalSubmissions === 50 && !existingTypes.has('fifty_submissions')) {
    achievements.push({
      user_id: userId,
      achievement_type: 'fifty_submissions',
      achievement_name: 'Master Contributor',
      description: 'Submitted 50 approved assignments',
      credits_bonus: CREDIT_REWARD_RULES.achievements.fiftySubmissions,
    });
  }

  // Award achievements
  for (const achievement of achievements) {
    const { error } = await client
      .from('user_achievements')
      .upsert(achievement, { onConflict: 'user_id,achievement_type' });

    if (!error && achievement.credits_bonus > 0) {
      const currentBalance = await getUserCredits(userId, client);
      
      await client
        .from("user_credits")
        .update({ balance: currentBalance + achievement.credits_bonus })
        .eq("user_id", userId);

      await client.from("credit_transactions").insert({
        user_id: userId,
        amount: achievement.credits_bonus,
        type: "earned",
        description: `Achievement unlocked: ${achievement.achievement_name}`,
      });
    }
  }
}

