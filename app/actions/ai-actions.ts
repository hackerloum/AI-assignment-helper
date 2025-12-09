"use server";

import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";
import {
  generateEssay as aiGenerateEssay,
  paraphraseText as aiParaphraseText,
  checkGrammar as aiCheckGrammar,
  generateCitation as aiGenerateCitation,
  summarizeText as aiSummarizeText,
} from "@/lib/ai-service";

export async function generateEssay(
  topic: string,
  wordCount: number
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, "essay");
    if (!creditResult.success) {
      return {
        success: false,
        error: `Insufficient credits. You need 10 credits but only have ${creditResult.remainingCredits}.`,
      };
    }

    // Generate essay
    const content = await aiGenerateEssay(topic, wordCount);

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "essay",
      input_text: topic,
      output_text: content,
      credits_used: 10,
    });

    return { success: true, content };
  } catch (error: any) {
    console.error("Error generating essay:", error);
    return { success: false, error: error.message || "Failed to generate essay" };
  }
}

export async function paraphraseText(
  text: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const creditResult = await deductCredits(user.id, "paraphrase");
    if (!creditResult.success) {
      return {
        success: false,
        error: `Insufficient credits. You need 5 credits but only have ${creditResult.remainingCredits}.`,
      };
    }

    const content = await aiParaphraseText(text);

    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "paraphrase",
      input_text: text,
      output_text: content,
      credits_used: 5,
    });

    return { success: true, content };
  } catch (error: any) {
    console.error("Error paraphrasing text:", error);
    return { success: false, error: error.message || "Failed to paraphrase text" };
  }
}

export async function checkGrammar(
  text: string
): Promise<{
  success: boolean;
  result?: {
    corrected: string;
    suggestions: Array<{ original: string; corrected: string; reason: string }>;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const creditResult = await deductCredits(user.id, "grammar");
    if (!creditResult.success) {
      return {
        success: false,
        error: `Insufficient credits. You need 3 credits but only have ${creditResult.remainingCredits}.`,
      };
    }

    const result = await aiCheckGrammar(text);

    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "grammar",
      input_text: text,
      output_text: result.corrected,
      credits_used: 3,
    });

    return { success: true, result };
  } catch (error: any) {
    console.error("Error checking grammar:", error);
    return { success: false, error: error.message || "Failed to check grammar" };
  }
}

export async function generateCitation(
  source: {
    title: string;
    author?: string;
    year?: string;
    url?: string;
    publisher?: string;
  },
  format: "APA" | "MLA" | "Chicago"
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const creditResult = await deductCredits(user.id, "citation");
    if (!creditResult.success) {
      return {
        success: false,
        error: `Insufficient credits. You need 2 credits but only have ${creditResult.remainingCredits}.`,
      };
    }

    const content = await aiGenerateCitation(source, format);

    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "citation",
      input_text: JSON.stringify(source),
      output_text: content,
      credits_used: 2,
    });

    return { success: true, content };
  } catch (error: any) {
    console.error("Error generating citation:", error);
    return { success: false, error: error.message || "Failed to generate citation" };
  }
}

export async function summarizeText(
  text: string,
  maxLength: number
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const creditResult = await deductCredits(user.id, "summarizer");
    if (!creditResult.success) {
      return {
        success: false,
        error: `Insufficient credits. You need 4 credits but only have ${creditResult.remainingCredits}.`,
      };
    }

    const content = await aiSummarizeText(text, maxLength);

    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "summarizer",
      input_text: text,
      output_text: content,
      credits_used: 4,
    });

    return { success: true, content };
  } catch (error: any) {
    console.error("Error summarizing text:", error);
    return { success: false, error: error.message || "Failed to summarize text" };
  }
}

