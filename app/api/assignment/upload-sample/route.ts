import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ error: 'Invalid file type. Please upload DOCX, DOC, or PDF' }, { status: 400 })
    }

    // Save file to uploads directory
    const uploadsDir = join(process.cwd(), 'uploads', 'samples')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const fileName = `${user.id}-${Date.now()}${fileExtension}`
    const filePath = join(uploadsDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // For now, create a basic custom template
    // In production, you would use AI to analyze the file and extract format
    const extractedFormat = {
      font: 'Times New Roman',
      font_size: 12,
      line_spacing: 1.5,
      margins: { top: 1, bottom: 1, left: 1, right: 1 },
    }

    const { data: customTemplate, error } = await supabase
      .from('custom_templates')
      .insert({
        user_id: user.id,
        template_name: `Custom Template from ${file.name}`,
        assignment_type: 'individual', // Would be determined from file analysis
        extracted_format: extractedFormat,
        sample_file_url: `/uploads/samples/${fileName}`,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating custom template:', error)
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      customTemplateId: customTemplate.id 
    })
  } catch (error: any) {
    console.error('Error in upload-sample route:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload sample' },
      { status: 500 }
    )
  }
}

