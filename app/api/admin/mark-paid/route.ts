import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin/auth";

/**
 * EMERGENCY ADMIN ENDPOINT
 * Manually marks a user as having paid the one-time fee
 * USE THIS TO FIX ACCOUNTS WHERE PAYMENT COMPLETED BUT DATABASE DIDN'T UPDATE
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, email, orderId } = body;

    if (!userId && !email && !orderId) {
      return NextResponse.json(
        { error: "Provide userId, email, or orderId" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Find user
    let targetUserId = userId;

    if (!targetUserId && email) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users.find(u => u.email === email);
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId && orderId) {
      const { data: payment } = await supabase
        .from("payments")
        .select("user_id")
        .eq("id", orderId)
        .single();
      if (payment) {
        targetUserId = payment.user_id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log("[Admin Mark Paid] Marking user as paid:", targetUserId);

    // Check if user_credits exists
    const { data: existingCredits } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", targetUserId)
      .single();

    if (existingCredits) {
      console.log("[Admin Mark Paid] Existing credits found:", existingCredits);
      
      // Update
      const { data: updated, error: updateError } = await supabase
        .from("user_credits")
        .update({
          has_paid_one_time_fee: true,
          updated_at: new Date().toISOString()
        })
        .eq("user_id", targetUserId)
        .select()
        .single();

      if (updateError) {
        console.error("[Admin Mark Paid] Update failed:", updateError);
        return NextResponse.json(
          { error: "Failed to update", details: updateError },
          { status: 500 }
        );
      }

      console.log("[Admin Mark Paid] ✅ Updated:", updated);
      return NextResponse.json({
        success: true,
        message: "User marked as paid",
        data: updated
      });
    } else {
      console.log("[Admin Mark Paid] No credits record, creating...");
      
      // Create
      const { data: created, error: createError } = await supabase
        .from("user_credits")
        .insert({
          user_id: targetUserId,
          balance: 0,
          has_paid_one_time_fee: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error("[Admin Mark Paid] Create failed:", createError);
        
        // Try upsert as fallback
        const { data: upserted, error: upsertError } = await supabase
          .from("user_credits")
          .upsert({
            user_id: targetUserId,
            balance: 0,
            has_paid_one_time_fee: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (upsertError) {
          console.error("[Admin Mark Paid] Upsert also failed:", upsertError);
          return NextResponse.json(
            { error: "Failed to create/upsert", details: upsertError },
            { status: 500 }
          );
        }

        console.log("[Admin Mark Paid] ✅ Upserted:", upserted);
        return NextResponse.json({
          success: true,
          message: "User marked as paid (upserted)",
          data: upserted
        });
      }

      console.log("[Admin Mark Paid] ✅ Created:", created);
      return NextResponse.json({
        success: true,
        message: "User marked as paid (created)",
        data: created
      });
    }
  } catch (error: any) {
    console.error("[Admin Mark Paid] Error:", error);
    return NextResponse.json(
      { error: error.message, details: error },
      { status: 500 }
    );
  }
}

// GET endpoint to check status
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: "Provide userId or email" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    let targetUserId = userId;

    if (!targetUserId && email) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData?.users.find(u => u.email === email);
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { data: credits, error } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", targetUserId)
      .single();

    if (error) {
      return NextResponse.json({
        userId: targetUserId,
        exists: false,
        error: error.message
      });
    }

    return NextResponse.json({
      userId: targetUserId,
      exists: true,
      data: credits
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

