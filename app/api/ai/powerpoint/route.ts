import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { deductCredits } from "@/lib/credits";
import { generatePresentation } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined);

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

