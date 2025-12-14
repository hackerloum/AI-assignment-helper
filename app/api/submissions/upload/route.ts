import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

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
        console.error('[Upload API] Auth error:', authError.message);
      }
    }
    
    if (sessionError) {
      console.error('[Upload API] Session error:', sessionError.message);
    }

    if (!user) {
      console.error('[Upload API] No user found. Session:', !!session, 'Session error:', sessionError?.message);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type - only docx and pdf
    const validTypes = ['.docx', '.pdf'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Invalid file type. Only DOCX and PDF files are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${user.id}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('submissions')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Storage upload error:', error);
      
      // If bucket doesn't exist, return helpful error
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json(
          { 
            error: "Storage bucket not configured. Please create a 'submissions' bucket in Supabase Storage.",
            details: error.message 
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: "Failed to upload file", details: error.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExtension,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}




