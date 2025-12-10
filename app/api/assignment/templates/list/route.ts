import { NextResponse } from 'next/server'
import { listAvailableTemplates } from '@/lib/utils/docx-template-generator'
import fs from 'fs'
import path from 'path'

/**
 * API route to list available DOCX templates
 * Returns template metadata including preview info
 */
export async function GET() {
  try {
    const templates = listAvailableTemplates()
    
    // Get template metadata (size, modified date, etc.)
    const templatesWithMetadata = templates.map((template) => {
      const stats = fs.statSync(template.path)
      return {
        code: template.code,
        type: template.type,
        path: template.path,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        // Preview will be generated on-demand
        preview_url: `/api/assignment/templates/preview?code=${template.code}&type=${template.type}`,
      }
    })
    
    return NextResponse.json({
      success: true,
      templates: templatesWithMetadata,
    })
  } catch (error: any) {
    console.error('Error listing templates:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list templates' },
      { status: 500 }
    )
  }
}

