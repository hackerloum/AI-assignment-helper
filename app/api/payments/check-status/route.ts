import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Try to get the access token from Authorization header first
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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { hasPaid: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Check payment status
    const { data: userCredits, error: creditsError } = await supabase
      .from("user_credits")
      .select("has_paid_one_time_fee")
      .eq("user_id", user.id)
      .single();

    if (creditsError && creditsError.code !== 'PGRST116') {
      console.error("[Check Payment Status] Error:", creditsError);
      return NextResponse.json(
        { hasPaid: false, error: "Failed to check payment status" },
        { status: 500 }
      );
    }

    // If no record exists, user hasn't paid
    const hasPaid = userCredits?.has_paid_one_time_fee || false;

    return NextResponse.json({
      hasPaid,
      userId: user.id
    });
  } catch (error: any) {
    console.error("[Check Payment Status] Error:", error);
    return NextResponse.json(
      { hasPaid: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

