import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { deductCredits } from "@/lib/credits";
import { generatePresentation } from "@/lib/powerpoint-service-enhanced";
import { calculatePowerPointCredits } from "@/lib/powerpoint-credits";

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

    // Calculate credits based on slide count
    // 5 slides or less: 20 credits
    // Above 5 slides: 20 credits + 7 credits per additional slide
    const creditCost = calculatePowerPointCredits(slides);
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
    let presentation;
    try {
      presentation = await generatePresentation(topic, slides, style, downloadFile);
    } catch (error: any) {
      // If file generation fails, return error
      if (downloadFile) {
        return NextResponse.json(
          { 
            error: error.message || "Failed to generate PowerPoint file",
            suggestion: "The SlidesGPT API may be experiencing issues. Please check your API configuration or try downloading as Text/JSON format instead."
          },
          { status: 500 }
        );
      }
      // Re-throw for non-file requests
      throw error;
    }

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

    // If file download is requested, we must return a file or an error
    if (downloadFile) {
      // Check if file blob was created
      if (!presentation.fileBlob) {
        console.error("PowerPoint file generation failed - no fileBlob returned");
        return NextResponse.json(
          { 
            error: "Failed to generate PowerPoint file. The SlidesGPT API may have returned an error. Please check the server logs for details.",
            suggestion: "Try downloading as Text or JSON format instead, or ensure SLIDESGPT_API_KEY is configured correctly."
          },
          { status: 500 }
        );
      }

      try {
        // Validate the blob is actually a PowerPoint file
        const arrayBuffer = await presentation.fileBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // PPTX files are ZIP archives, they start with "PK" (0x50 0x4B)
        if (uint8Array.length < 2 || uint8Array[0] !== 0x50 || uint8Array[1] !== 0x4B) {
          // Not a valid PowerPoint file, return error
          const text = new TextDecoder().decode(uint8Array.slice(0, 500));
          console.error("Invalid PowerPoint file received:", text);
          return NextResponse.json(
            { 
              error: "Invalid PowerPoint file received from API. The API may have returned an error instead of a file.",
              details: text.substring(0, 200),
              suggestion: "The SlidesGPT API may be experiencing issues. Please check your API configuration."
            },
            { status: 500 }
          );
        }

        // Return the valid PowerPoint file
        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'Content-Disposition': `attachment; filename="${presentation.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx"`,
            'Content-Length': arrayBuffer.byteLength.toString(),
          },
        });
      } catch (error: any) {
        console.error("Error processing PowerPoint file:", error);
        return NextResponse.json(
          { 
            error: "Failed to process PowerPoint file: " + error.message,
            suggestion: "The SlidesGPT API may be experiencing issues. Please check your API configuration."
          },
          { status: 500 }
        );
      }
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
