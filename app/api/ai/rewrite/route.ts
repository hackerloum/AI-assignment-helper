import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { deductCredits } from "@/lib/credits";
import { rewriteText } from "@/lib/ai-service";

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
    const { text, style } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Deduct credits - pass authenticated supabase client
    const creditResult = await deductCredits(user.id, "paraphrase", supabase);
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 5 credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Rewrite text with tone-specific instructions
    // Validate tone value
    const validTones = ['academic', 'professional', 'casual', 'concise'] as const;
    const selectedTone = (style && validTones.includes(style as typeof validTones[number])) 
      ? (style as typeof validTones[number])
      : 'academic'; // Default to academic if invalid or missing
    
    const rewrittenText = await rewriteText(text, selectedTone);

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "rewrite",
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

