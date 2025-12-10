import { NextRequest, NextResponse } from 'next/server'
import { getTemplatePath } from '@/lib/utils/docx-template-generator'
import fs from 'fs'

/**
 * API route to get template preview
 * Returns the DOCX file for preview/download
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const type = searchParams.get('type') as 'individual' | 'group' | null
    
    if (!code || !type) {
      return NextResponse.json(
        { error: 'Code and type parameters required' },
        { status: 400 }
      )
    }
    
    const templatePath = getTemplatePath(code, type)
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }
    
    // Read and return the template file
    const templateBuffer = fs.readFileSync(templatePath)
    
    return new NextResponse(templateBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${code}_${type}_template.docx"`,
      },
    })
  } catch (error: any) {
    console.error('Error getting template preview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get template preview' },
      { status: 500 }
    )
  }
}

