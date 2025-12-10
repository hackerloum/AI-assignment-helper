import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs'
import path from 'path'

interface AssignmentData {
  // Cover page fields
  college_name?: string
  college_code?: string
  program_name?: string
  module_name?: string
  module_code?: string
  course_name?: string
  course_code?: string
  instructor_name?: string
  type_of_work?: string
  group_number?: string
  submission_date?: string
  task?: string
  
  // Student/Group info
  student_name?: string
  registration_number?: string
  group_name?: string
  
  // Group members (for LGTI format)
  group_members?: Array<{
    name?: string
    registration_no?: string
    phone_number?: string
  }>
  
  // Group representatives
  group_representatives?: Array<{
    name?: string
    role?: string
    registration_no?: string
  }>
  
  // Content
  title?: string
  assignment_content?: string
  
  // References
  assignment_references?: Array<{
    authors?: string
    author?: string
    year?: string
    title?: string
    source?: string
    url?: string
  }>
}

/**
 * Generate assignment document from a DOCX template using docxtemplater
 * @param templatePath - Path to the DOCX template file
 * @param data - Assignment data to fill into the template
 * @returns Buffer containing the generated DOCX file
 */
export async function generateFromTemplate(
  templatePath: string,
  data: AssignmentData
): Promise<Buffer> {
  try {
    // Read the template file
    const templateBuffer = fs.readFileSync(templatePath)
    
    // Load the template into PizZip
    const zip = new PizZip(templateBuffer)
    
    // Create Docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })
    
    // Prepare data for template
    const templateData = prepareTemplateData(data)
    
    // Set data and render
    doc.setData(templateData)
    
    try {
      doc.render()
    } catch (error: any) {
      // Handle rendering errors
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
          .map((e: any) => {
            return `${e.name}: ${e.message}`
          })
          .join('\n')
        throw new Error(`Template rendering error: ${errorMessages}`)
      }
      throw error
    }
    
    // Generate the document buffer
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })
    
    return Buffer.from(buf)
  } catch (error: any) {
    console.error('Error generating document from template:', error)
    throw new Error(`Failed to generate document: ${error.message}`)
  }
}

/**
 * Prepare assignment data for template variables
 * Uses docxtemplater syntax: {variable_name} or {#condition}...{/condition}
 */
function prepareTemplateData(data: AssignmentData): any {
  const templateData: any = {
    // Basic fields
    college_name: data.college_name || '',
    college_code: data.college_code || '',
    program_name: data.program_name || '',
    module_name: data.module_name || '',
    module_code: data.module_code || '',
    course_name: data.course_name || '',
    course_code: data.course_code || '',
    instructor_name: data.instructor_name || '',
    type_of_work: data.type_of_work || '',
    group_number: data.group_number || '',
    submission_date: data.submission_date || '',
    task: data.task || '',
    student_name: data.student_name || '',
    registration_number: data.registration_number || '',
    group_name: data.group_name || '',
    title: data.title || 'Untitled Assignment',
    
    // Content - split into paragraphs for better formatting
    assignment_content: formatContent(data.assignment_content || ''),
    
    // References - formatted as list
    references: formatReferences(data.assignment_references || []),
    
    // Group members table (for LGTI format)
    group_members: (data.group_members || []).map((member, index) => ({
      sn: index + 1,
      name: member.name || '',
      registration_no: member.registration_no || '',
      phone_number: member.phone_number || '',
    })),
    
    // Group representatives
    group_representatives: (data.group_representatives || []).map((rep) => ({
      name: rep.name || '',
      role: rep.role || '',
      registration_no: rep.registration_no || '',
    })),
    
    // Conditional flags for template logic
    is_group: data.type_of_work?.toLowerCase().includes('group') || false,
    is_individual: !data.type_of_work?.toLowerCase().includes('group'),
    has_group_members: (data.group_members?.length || 0) > 0,
    has_representatives: (data.group_representatives?.length || 0) > 0,
    has_references: (data.assignment_references?.length || 0) > 0,
  }
  
  return templateData
}

/**
 * Format assignment content for template
 * Splits content into paragraphs and handles section headers
 */
function formatContent(content: string): string {
  if (!content) return ''
  
  // Split by double newlines or section headers
  const lines = content.split('\n')
  const paragraphs: string[] = []
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    
    // Remove markdown headers if present
    if (trimmed.startsWith('## ')) {
      paragraphs.push(trimmed.replace('## ', ''))
    } else {
      paragraphs.push(trimmed)
    }
  }
  
  return paragraphs.join('\n\n')
}

/**
 * Format references for template
 */
function formatReferences(references: AssignmentData['assignment_references']): string {
  if (!references || references.length === 0) return ''
  
  return references
    .map((ref, index) => {
      const author = ref.authors || ref.author || 'Unknown'
      const year = ref.year || 'n.d.'
      const title = ref.title || ''
      const source = ref.source || ''
      const url = ref.url || ''
      
      return `${author}. (${year}). ${title}. ${source}${url ? `. Retrieved from ${url}` : ''}.`
    })
    .join('\n')
}

/**
 * Get template path for a given college and type
 * @param collegeCode - College code (e.g., 'LGTI', 'UDSM')
 * @param templateType - 'individual' or 'group'
 * @returns Path to the template file
 */
export function getTemplatePath(
  collegeCode: string,
  templateType: 'individual' | 'group'
): string {
  // Template files should be in the templates directory
  // Format: templates/{collegeCode}_{templateType}.docx
  // e.g., templates/LGTI_group.docx, templates/UDSM_individual.docx
  
  const templateName = `${collegeCode.toUpperCase()}_${templateType}.docx`
  const templatePath = path.join(process.cwd(), 'templates', templateName)
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    // Fallback to default template
    const defaultPath = path.join(process.cwd(), 'templates', `default_${templateType}.docx`)
    if (fs.existsSync(defaultPath)) {
      return defaultPath
    }
    throw new Error(`Template not found: ${templateName}`)
  }
  
  return templatePath
}

/**
 * List available templates
 */
export function listAvailableTemplates(): Array<{ code: string; type: 'individual' | 'group'; path: string }> {
  const templatesDir = path.join(process.cwd(), 'templates')
  
  if (!fs.existsSync(templatesDir)) {
    return []
  }
  
  const files = fs.readdirSync(templatesDir)
  const templates: Array<{ code: string; type: 'individual' | 'group'; path: string }> = []
  
  for (const file of files) {
    if (file.endsWith('.docx')) {
      const match = file.match(/^(.+)_(individual|group)\.docx$/)
      if (match) {
        templates.push({
          code: match[1],
          type: match[2] as 'individual' | 'group',
          path: path.join(templatesDir, file),
        })
      }
    }
  }
  
  return templates
}

