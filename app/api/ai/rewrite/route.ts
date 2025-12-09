import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";
import { paraphraseText } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    console.log("[Rewrite API] Request received");
    
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[Rewrite API] Auth check:", { 
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
    const { text, style } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, "paraphrase");
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 5 credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Rewrite/paraphrase text with style
    const styleInstruction = style ? ` Rewrite in a ${style} style.` : "";
    const rewrittenText = await paraphraseText(text + styleInstruction);

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "paraphrase",
      input_text: text,
      output_text: rewrittenText,
      credits_used: 5,
    });

    return NextResponse.json({ rewrittenText });
  } catch (error: any) {
    console.error("Error in rewrite API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to rewrite text" },
      { status: 500 }
    );
  }
}

