import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/notifications
 * Get user's notifications with intelligent features
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get user - getUser is more reliable for API routes
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      // Return empty notifications for unauthenticated users (don't return 401 to avoid console errors)
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
        hasMore: false,
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread_only") === "true";
    const priority = searchParams.get("priority") as string | null;

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    // Only show notifications that are scheduled for now or earlier
    const now = new Date().toISOString();
    query = query.or(`scheduled_for.is.null,scheduled_for.lte.${now}`);

    // Only show notifications that haven't expired
    query = query.or(`expires_at.is.null,expires_at.gt.${now}`);

    const { data: notifications, error } = await query;

    if (error) {
      console.error("[Notifications API] Error fetching notifications:", error);
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    // Get unread count
    const { data: unreadCount, error: countError } = await supabase
      .rpc("get_unread_notification_count", { p_user_id: user.id });

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      hasMore: (notifications?.length || 0) === limit,
    });
  } catch (error) {
    console.error("[Notifications API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a notification (admin/service role only)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Try getSession first (more reliable for API routes)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    let user = session?.user ?? null;
    
    // Fallback to getUser if session didn't work
    if (!user) {
      const { data: { user: userFromGetUser }, error: authError } = await supabase.auth.getUser();
      user = userFromGetUser ?? null;
      
      if (authError) {
        console.error('[Notifications API POST] Auth error:', authError.message);
      }
    }
    
    if (sessionError) {
      console.error('[Notifications API POST] Session error:', sessionError.message);
    }

    if (!user) {
      console.error('[Notifications API POST] No user found. Session:', !!session, 'Session error:', sessionError?.message);
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      user_id,
      type,
      title,
      message,
      priority = "medium",
      action_url,
      action_label,
      metadata = {},
      aggregation_key,
      should_show_immediately = true,
      scheduled_for,
    } = body;

    // Validate required fields
    if (!user_id || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, type, title, message" },
        { status: 400 }
      );
    }

    // Use the intelligent notification function
    const { data: notificationId, error } = await supabase.rpc(
      "create_intelligent_notification",
      {
        p_user_id: user_id,
        p_type: type,
        p_title: title,
        p_message: message,
        p_priority: priority,
        p_action_url: action_url || null,
        p_action_label: action_label || null,
        p_metadata: metadata,
        p_aggregation_key: aggregation_key || null,
        p_should_show_immediately: should_show_immediately,
        p_scheduled_for: scheduled_for || null,
      }
    );

    if (error) {
      console.error("[Notifications API] Error creating notification:", error);
      return NextResponse.json(
        { error: "Failed to create notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notificationId: notificationId,
    });
  } catch (error) {
    console.error("[Notifications API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

