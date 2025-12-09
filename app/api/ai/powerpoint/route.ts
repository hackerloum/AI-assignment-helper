import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";
import { generatePresentation } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    console.log("[PowerPoint API] Request received");
    
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[PowerPoint API] Auth check:", { 
      hasUser: !!user, 
      userEmail: user?.email,
      authError: authError?.message 
    });

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated. Please refresh the page and try again." },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { topic, slides = 5, style = "professional" } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    if (slides < 3 || slides > 15) {
      return NextResponse.json(
        { error: "Number of slides must be between 3 and 15" },
        { status: 400 }
      );
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, "summarizer");
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 4 credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Generate presentation
    const presentation = await generatePresentation(topic, slides, style);

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "summarizer",
      input_text: `${topic} (${slides} slides, ${style} style)`,
      output_text: JSON.stringify(presentation),
      credits_used: 4,
    });

    return NextResponse.json(presentation);
  } catch (error: any) {
    console.error("Error in powerpoint API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presentation" },
      { status: 500 }
    );
  }
}

