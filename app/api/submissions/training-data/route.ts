import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import {
  collectApprovedSubmissionsForTraining,
  markMultipleSubmissionsAsUsed,
  getTrainingDataStats,
} from "@/lib/training-data-collector";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check
    // const isAdmin = await checkAdminRole(user.id);
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const minQuality = parseFloat(searchParams.get('minQuality') || '3.5');
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      const stats = await getTrainingDataStats(supabase);
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    const trainingData = await collectApprovedSubmissionsForTraining(
      limit,
      minQuality,
      supabase
    );

    return NextResponse.json({
      success: true,
      data: trainingData,
      count: trainingData.length,
    });
  } catch (error: any) {
    console.error('Training data error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // TODO: Add admin check

    const body = await request.json();
    const { submissionIds } = body;

    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return NextResponse.json(
        { error: "submissionIds array is required" },
        { status: 400 }
      );
    }

    await markMultipleSubmissionsAsUsed(submissionIds, supabase);

    return NextResponse.json({
      success: true,
      message: `Marked ${submissionIds.length} submissions as used in training`,
    });
  } catch (error: any) {
    console.error('Mark as used error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

