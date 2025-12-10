import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { deductCredits, addCredits } from "@/lib/credits";
import { humanizeContent, HumanizeOptions } from "@/lib/ai-service";

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
    const { text, options } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Deduct credits
    const creditResult = await deductCredits(user.id, "humanize", supabase);
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need 6 credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Humanize content
    let result;
    try {
      result = await humanizeContent(text, options || {});
    } catch (error: any) {
      // If it's a quota error, refund credits and return specific error
      if (error.isQuotaError) {
        // Refund the credits that were deducted
        await addCredits(
          user.id,
          6,
          "Refunded due to API quota limit",
          supabase
        );
        
        return NextResponse.json(
          {
            error: "API quota limit reached",
            quotaError: true,
            retryAfter: error.retryAfter,
            message: error.message || "The AI service has reached its rate limit. Please try again in a few moments.",
          },
          { status: 429 }
        );
      }
      // Re-throw other errors
      throw error;
    }

    // Save assignment
    const { data: assignment } = await supabase
      .from("assignments")
      .insert({
        user_id: user.id,
        tool_type: "humanize",
        input_text: text,
        output_text: result.humanized,
        credits_used: 6,
      })
      .select()
      .single();

    return NextResponse.json({ 
      result,
      assignmentId: assignment?.id 
    });
  } catch (error: any) {
    console.error("Error in humanize API:", error);
    
    // Check if it's a quota error that wasn't caught earlier
    if (error.isQuotaError) {
      return NextResponse.json(
        {
          error: "API quota limit reached",
          quotaError: true,
          retryAfter: error.retryAfter,
          message: error.message || "The AI service has reached its rate limit. Please try again in a few moments.",
        },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to humanize content" },
      { status: 500 }
    );
  }
}

