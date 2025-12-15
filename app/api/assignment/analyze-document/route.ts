import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { parseDOCX, parsePDF, ParsedDocument } from '@/lib/utils/document-parser'
import { analyzeDocumentStructure, DocumentStructure } from '@/lib/ai-service'

/**
 * Analyze document endpoint
 * Step 1: Parse document (library-based, no AI)
 * Step 2: Analyze structure (GPT-5.2)
 * Step 3: Store analysis in database
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    // Get cookies as fallback
    const cookieStore = await cookies()
    
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
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
    )
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken || undefined)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated. Please refresh the page and try again.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const validTypes = ['.docx', '.doc', '.pdf']
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!validTypes.includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload DOCX, DOC, or PDF' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Upload file to Supabase Storage
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${user.id}/${timestamp}-${sanitizedFileName}`

    const bytes = await file.arrayBuffer()
    const fileBuffer = Buffer.from(bytes)

    // Upload to storage bucket (assuming 'documents' bucket exists, or use 'submissions')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('submissions') // Using existing submissions bucket
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file. Please try again.' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName)

    const fileUrl = urlData.publicUrl

    // Step 1: Parse document (NO AI - library-based)
    let parsedDocument: ParsedDocument
    try {
      if (fileExtension === '.pdf') {
        parsedDocument = await parsePDF(fileBuffer)
      } else {
        // DOCX or DOC
        parsedDocument = await parseDOCX(fileBuffer)
      }
    } catch (parseError: any) {
      console.error('Error parsing document:', parseError)
      return NextResponse.json(
        { error: `Failed to parse document: ${parseError.message}` },
        { status: 400 }
      )
    }

    // Step 2: Analyze structure using GPT-5.2
    let structureAnalysis: DocumentStructure
    try {
      structureAnalysis = await analyzeDocumentStructure(parsedDocument)
    } catch (analysisError: any) {
      console.error('Error analyzing document structure:', analysisError)
      return NextResponse.json(
        { error: `Failed to analyze document structure: ${analysisError.message}` },
        { status: 500 }
      )
    }

    // Step 3: Store analysis in database
    const { data: analysisRecord, error: dbError } = await supabase
      .from('document_analyses')
      .insert({
        user_id: user.id,
        original_file_url: fileUrl,
        parsed_data: parsedDocument,
        structure_analysis: structureAnalysis,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error storing analysis:', dbError)
      return NextResponse.json(
        { error: 'Failed to store analysis. Please try again.' },
        { status: 500 }
      )
    }

    // Prepare preview data
    const preview = {
      sections: structureAnalysis.sections.map(s => ({
        type: s.type,
        title: s.title,
        word_count_range: s.word_count_range,
      })),
      cover_page: {
        has_cover_page: structureAnalysis.cover_page.elements.length > 0,
        layout: structureAnalysis.cover_page.layout,
      },
      formatting: {
        font: parsedDocument.styles.fonts.default?.name || 'Times New Roman',
        font_size: parsedDocument.styles.fonts.default?.size || 12,
        line_spacing: parsedDocument.styles.spacing.line || 1.5,
      },
      academic_style: structureAnalysis.academic_style,
      confidence_score: structureAnalysis.confidence_score,
    }

    return NextResponse.json({
      success: true,
      analysis_id: analysisRecord.id,
      structure: structureAnalysis,
      preview,
    })
  } catch (error: any) {
    console.error('Error in analyze-document route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze document' },
      { status: 500 }
    )
  }
}

