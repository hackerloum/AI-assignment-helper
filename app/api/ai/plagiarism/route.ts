import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deductCredits } from "@/lib/credits";

export async function POST(request: NextRequest) {
  try {
    console.log("[Plagiarism API] Request received");
    
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[Plagiarism API] Auth check:", { 
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
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    if (text.length < 50) {
      return NextResponse.json(
        { error: "Text must be at least 50 characters" },
        { status: 400 }
      );
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, "grammar");
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 3 credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Generate plagiarism check result
    // For demo purposes, we'll use a simple algorithm
    // In production, you'd integrate with a real plagiarism detection API
    const words = text.split(/\s+/);
    const wordCount = words.length;
    
    // Simple heuristic: check for common phrases that might indicate copied content
    const commonPhrases = [
      "according to",
      "research shows",
      "studies have shown",
      "it is well known",
      "as mentioned before"
    ];
    
    let matchCount = 0;
    const textLower = text.toLowerCase();
    commonPhrases.forEach(phrase => {
      if (textLower.includes(phrase)) matchCount++;
    });
    
    // Calculate similarity score (0-100)
    const similarityScore = Math.min(Math.floor((matchCount / commonPhrases.length) * 30 + Math.random() * 10), 100);
    
    // Generate fake sources if similarity is high
    const sources = similarityScore > 15 ? [
      {
        url: "https://example.com/article1",
        similarity: Math.floor(similarityScore * 0.6),
        title: "Sample Academic Article"
      },
      {
        url: "https://example.com/article2",
        similarity: Math.floor(similarityScore * 0.4),
        title: "Research Paper on Similar Topic"
      }
    ] : [];

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "grammar", // Using grammar as closest match
      input_text: text,
      output_text: `Plagiarism check completed. Similarity score: ${similarityScore}%`,
      credits_used: 3,
    });

    return NextResponse.json({ 
      similarityScore,
      sources,
      wordCount,
      isPlagiarized: similarityScore > 15
    });
  } catch (error: any) {
    console.error("Error in plagiarism API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check plagiarism" },
      { status: 500 }
    );
  }
}

