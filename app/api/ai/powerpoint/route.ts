import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { deductCredits } from "@/lib/credits";
import { generatePresentation } from "@/lib/powerpoint-service-enhanced";

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
    const { topic, slides = 5, style = "professional", downloadFile = false } = body;

    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    if (slides < 3 || slides > 20) {
      return NextResponse.json(
        { error: "Number of slides must be between 3 and 20" },
        { status: 400 }
      );
    }

    // Deduct credits - pass authenticated supabase client
    // PowerPoint generation costs more due to enhanced features
    const creditCost = 6; // Higher cost for premium PowerPoint generation
    const creditResult = await deductCredits(user.id, "powerpoint", supabase, creditCost);
    if (!creditResult.success) {
      return NextResponse.json(
        {
          error: `Insufficient credits. You need ${creditCost} credits but only have ${creditResult.remainingCredits}.`,
        },
        { status: 402 }
      );
    }

    // Generate presentation using enhanced service
    // If downloadFile is true, also create the .pptx file
    const presentation = await generatePresentation(topic, slides, style, downloadFile);

    // Save assignment
    await supabase.from("assignments").insert({
      user_id: user.id,
      tool_type: "powerpoint",
      input_text: `${topic} (${slides} slides, ${style} style)`,
      output_text: JSON.stringify({
        title: presentation.title,
        subtitle: presentation.subtitle,
        slideCount: presentation.slides.length,
        theme: presentation.theme,
      }),
      credits_used: creditCost,
    });

    // If file blob is present and download requested, return file
    if (downloadFile && presentation.fileBlob) {
      const buffer = await presentation.fileBlob.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx"`,
        },
      });
    }

    // Return presentation data for preview
    return NextResponse.json({
      title: presentation.title,
      subtitle: presentation.subtitle,
      theme: presentation.theme,
      estimatedDuration: presentation.estimatedDuration,
      slides: presentation.slides,
    });
  } catch (error: any) {
    console.error("Error in powerpoint API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presentation" },
      { status: 500 }
    );
  }
}
