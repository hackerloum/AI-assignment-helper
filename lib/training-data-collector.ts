import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface TrainingDataPoint {
  input: {
    coverPage: any;
    requirements: {
      title: string;
      subject: string;
      academicLevel: string;
      wordCount: number;
      formattingStyle: string;
    };
  };
  output: {
    content: string;
    references: any[];
    qualityScore: number;
  };
  metadata: {
    submissionId: string;
    submissionType: 'individual' | 'group';
    createdAt: string;
  };
}

export async function collectApprovedSubmissionsForTraining(
  limit: number = 100,
  minQualityScore: number = 3.5,
  supabase?: SupabaseClient
): Promise<TrainingDataPoint[]> {
  let client = supabase;
  if (!client) {
    client = await createClient();
  }
  
  // Get approved submissions that can be used for training
  const { data: submissions, error } = await client
    .from('assignment_submissions')
    .select('*')
    .eq('status', 'approved')
    .eq('can_use_for_training', true)
    .eq('used_in_training', false)
    .gte('quality_score', minQualityScore)
    .order('quality_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching training data:', error);
    return [];
  }

  if (!submissions || submissions.length === 0) {
    return [];
  }

  // Format for training
  const trainingData: TrainingDataPoint[] = submissions.map(sub => ({
    input: {
      coverPage: sub.cover_page_data,
      requirements: {
        title: sub.title,
        subject: sub.subject,
        academicLevel: sub.academic_level,
        wordCount: sub.word_count,
        formattingStyle: sub.formatting_style,
      },
    },
    output: {
      content: sub.assignment_content,
      references: Array.isArray(sub.references) ? sub.references : [],
      qualityScore: sub.quality_score || 0,
    },
    metadata: {
      submissionId: sub.id,
      submissionType: sub.submission_type,
      createdAt: sub.created_at,
    },
  }));

  return trainingData;
}

export async function markSubmissionAsUsed(
  submissionId: string,
  supabase?: SupabaseClient
): Promise<void> {
  let client = supabase;
  if (!client) {
    client = await createClient();
  }
  
  const { error } = await client
    .from('assignment_submissions')
    .update({ used_in_training: true })
    .eq('id', submissionId);

  if (error) {
    console.error('Error marking submission as used:', error);
    throw error;
  }
}

export async function markMultipleSubmissionsAsUsed(
  submissionIds: string[],
  supabase?: SupabaseClient
): Promise<void> {
  let client = supabase;
  if (!client) {
    client = await createClient();
  }
  
  const { error } = await client
    .from('assignment_submissions')
    .update({ used_in_training: true })
    .in('id', submissionIds);

  if (error) {
    console.error('Error marking submissions as used:', error);
    throw error;
  }
}

export async function getTrainingDataStats(
  supabase?: SupabaseClient
): Promise<{
  totalAvailable: number;
  totalUsed: number;
  byQuality: { score: number; count: number }[];
}> {
  let client = supabase;
  if (!client) {
    client = await createClient();
  }

  // Get total available
  const { count: totalAvailable } = await client
    .from('assignment_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('can_use_for_training', true)
    .eq('used_in_training', false)
    .gte('quality_score', 3.5);

  // Get total used
  const { count: totalUsed } = await client
    .from('assignment_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')
    .eq('can_use_for_training', true)
    .eq('used_in_training', true);

  // Get by quality score ranges
  const qualityRanges = [
    { min: 4.5, max: 5.0 },
    { min: 4.0, max: 4.4 },
    { min: 3.5, max: 3.9 },
  ];

  const byQuality = await Promise.all(
    qualityRanges.map(async (range) => {
      const { count } = await client
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .eq('can_use_for_training', true)
        .eq('used_in_training', false)
        .gte('quality_score', range.min)
        .lt('quality_score', range.max + 0.1);

      return {
        score: range.min,
        count: count || 0,
      };
    })
  );

  return {
    totalAvailable: totalAvailable || 0,
    totalUsed: totalUsed || 0,
    byQuality,
  };
}

