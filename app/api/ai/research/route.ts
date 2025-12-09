import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { deductCredits } from "@/lib/credits";
import { generateResearch } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header (more reliable than cookies)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');
    
    // Get cookies as fallback
    const cookieStore = await cookies();
    
    // Create Supabase client
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
            } catch {
              // Cookie setting might fail in API routes
            }
          },
        },
        global: {
          headers: accessToken ? {
            Authorization: `Bearer ${accessToken}`,
          } : undefined,
        },
      }
    );
    
    // Get authenticated user (will use the access token if provided)
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined);

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated. Please refresh the page and try again." },
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
    // Pass the authenticated supabase client to ensure proper credit access
    const creditResult = await deductCredits(user.id, "summarizer", supabase);
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

