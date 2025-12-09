import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";
import { generateResearch } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Deduct credits (using summarizer cost as research is similar)
    const creditResult = await deductCredits(user.id, "summarizer");
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 4 credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Generate research answer
    const answer = await generateResearch(query);

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "summarizer", // Using summarizer as research type
      input_text: query,
      output_text: answer,
      credits_used: 4,
    });

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Error in research API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate research answer" },
      { status: 500 }
    );
  }
}

