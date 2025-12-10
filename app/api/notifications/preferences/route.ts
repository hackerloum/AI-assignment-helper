import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: preferences, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .order("notification_type");

    if (error) {
      console.error("[Notifications API] Error fetching preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ preferences: preferences || [] });
  } catch (error) {
    console.error("[Notifications API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notification_type, enabled, email_enabled, push_enabled, allow_aggregation, min_priority } = body;

    if (!notification_type) {
      return NextResponse.json(
        { error: "Missing notification_type" },
        { status: 400 }
      );
    }

    const { data: preference, error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: user.id,
        notification_type,
        enabled: enabled !== undefined ? enabled : true,
        email_enabled: email_enabled !== undefined ? email_enabled : false,
        push_enabled: push_enabled !== undefined ? push_enabled : false,
        allow_aggregation: allow_aggregation !== undefined ? allow_aggregation : true,
        min_priority: min_priority || "low",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,notification_type",
      })
      .select()
      .single();

    if (error) {
      console.error("[Notifications API] Error updating preferences:", error);
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ preference });
  } catch (error) {
    console.error("[Notifications API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

