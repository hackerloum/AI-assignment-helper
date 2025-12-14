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
    // Check if template file exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`)
    }
    
    console.log(`Reading template from: ${templatePath}`)
    
    // Read the template file
    const templateBuffer = fs.readFileSync(templatePath)
    
    if (!templateBuffer || templateBuffer.length === 0) {
      throw new Error('Template file is empty')
    }
    
    // Load the template into PizZip
    const zip = new PizZip(templateBuffer)
    
    // Create Docxtemplater instance
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    })
    
    // Prepare data for template
    const templateData = prepareTemplateData(data)
    
    // Debug: Log template data to help troubleshoot
    console.log('Template data being set:', JSON.stringify(templateData, null, 2))
    console.log('Template variables:', Object.keys(templateData))
    console.log('Group members count:', templateData.group_members?.length || 0)
    if (templateData.group_members?.length > 0) {
      console.log('First group member:', templateData.group_members[0])
    }
    
    // Set data and render
    doc.setData(templateData)
    
    try {
      doc.render()
    } catch (error: any) {
      // Handle rendering errors
      console.error('Template rendering error:', error)
      if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors
          .map((e: any) => {
            return `${e.name}: ${e.message}`
          })
          .join('\n')
        console.error('Rendering errors:', errorMessages)
        throw new Error(`Template rendering error: ${errorMessages}`)
      }
      throw error
    }
    
    // Generate the document buffer
    const buf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })
    
    console.log('Template generation successful, buffer size:', buf.length)
    return Buffer.from(buf)
  } catch (error: any) {
    console.error('Error generating document from template:', error)
    console.error('Template path:', templatePath)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    throw new Error(`Failed to generate document: ${error.message}`)
  }
}

/**
 * Prepare assignment data for template variables
 * Uses docxtemplater syntax: {variable_name} or {#condition}...{/condition}
 */
function prepareTemplateData(data: AssignmentData): any {
  // Format submission date if it exists
  const formatDate = (date: any): string => {
    if (!date) return ''
    if (typeof date === 'string') {
      // Try to parse and format
      try {
        const d = new Date(date)
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        }
      } catch {}
      return date
    }
    return String(date)
  }

  const templateData: any = {
    // Basic fields
    college_name: data.college_name || 'Local Government Training Institute',
    college_code: data.college_code || 'LGTI',
    program_name: data.program_name || '',
    module_name: data.module_name || '',
    module_code: data.module_code || '',
    course_name: data.course_name || '',
    course_code: data.course_code || '',
    instructor_name: data.instructor_name || '',
    type_of_work: data.type_of_work || '',
    group_number: data.group_number || '',
    submission_date: formatDate(data.submission_date),
    task: data.task || data.title || '',
    student_name: data.student_name || '',
    registration_number: data.registration_number || '',
    group_name: data.group_name || '',
    title: data.title || data.task || 'Untitled Assignment',
    
    // Content - split into paragraphs for better formatting
    assignment_content: formatContent(data.assignment_content || ''),
    
    // References - formatted as list
    references: formatReferences(data.assignment_references || []),
    
    // Group members table (for LGTI format)
    // Format: Array of objects with sn, name, registration_no, phone_number
    group_members: (data.group_members || [])
      .filter((member: any) => member && (member.name || member.registration_no)) // Filter out empty/invalid members
      .map((member: any, index: number) => {
        // Handle both object format and ensure all fields are strings
        // Data might come from database as JSONB, so ensure it's an object
        const memberData = member && typeof member === 'object' ? member : {}
        
        return {
          sn: index + 1,
          name: String(memberData.name || ''),
          registration_no: String(memberData.registration_no || memberData.registration_number || ''),
          phone_number: String(memberData.phone_number || memberData.phone || ''),
        }
      }),
    
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
    console.warn('Templates directory does not exist:', templatesDir)
    return []
  }
  
  const files = fs.readdirSync(templatesDir)
  const templates: Array<{ code: string; type: 'individual' | 'group'; path: string }> = []
  
  // Filter out temporary Word files (starting with ~$)
  const docxFiles = files.filter(file => 
    file.endsWith('.docx') && !file.startsWith('~$')
  )
  
  for (const file of docxFiles) {
    const match = file.match(/^(.+)_(individual|group)\.docx$/i) // Case-insensitive match
    if (match) {
      templates.push({
        code: match[1].toUpperCase(), // Normalize to uppercase
        type: match[2].toLowerCase() as 'individual' | 'group',
        path: path.join(templatesDir, file),
      })
    } else {
      // Debug: log files that don't match
      if (process.env.NODE_ENV === 'development') {
        console.log('Template file does not match pattern:', file)
      }
    }
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Found templates:', templates.map(t => `${t.code}_${t.type}`))
  }
  
  return templates
}

