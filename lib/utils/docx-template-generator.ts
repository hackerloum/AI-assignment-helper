import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import fs from 'fs'
import path from 'path'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'

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
  
  // Formatting
  font_family?: string
  font_size?: number
  
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
    
    // Generate the document buffer from template
    const templateBuf = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })
    
    console.log('Template generation successful, buffer size:', templateBuf.length)
    
    // If there's content or references, append them to the document
    if (data.assignment_content || (data.assignment_references && data.assignment_references.length > 0)) {
      try {
        return await appendContentToTemplate(Buffer.from(templateBuf), data)
      } catch (appendError: any) {
        console.error('Failed to append content to template:', appendError)
        console.warn('Returning template without content - content should be added to template file')
        // Return template as-is if append fails
        // The export route will handle fallback to programmatic generation if needed
        return Buffer.from(templateBuf)
      }
    }
    
    return Buffer.from(templateBuf)
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

/**
 * Append content and references sections to a rendered template
 * This function merges the template with additional content sections
 */
async function appendContentToTemplate(
  templateBuffer: Buffer,
  data: AssignmentData
): Promise<Buffer> {
  try {
    // Use docxtemplater's raw XML feature to append content
    // This is safer than manual XML manipulation
    
    // Create content XML using docx library first, then convert to XML string
    const contentParagraphs: Paragraph[] = []
    const referenceParagraphs: Paragraph[] = []
    
    // Content Section
    if (data.assignment_content) {
      // Add page break
      contentParagraphs.push(
        new Paragraph({
          text: '',
          pageBreakBefore: true,
        })
      )
      
      // Get font settings (default to Times New Roman, 12pt)
      const fontFamily = data.font_family || 'Times New Roman'
      const fontSize = data.font_size || 12
      
      // Remove markdown headers and split into paragraphs
      const cleanContent = data.assignment_content
        .replace(/^##+\s*(Introduction|Body|Conclusion|Intro|Body Paragraphs?|Concluding?)\s*$/gmi, '') // Remove markdown headers
        .replace(/^##+\s*/gm, '') // Remove any remaining markdown headers
        .trim()
      
      const contentLines = cleanContent.split('\n')
      contentLines.forEach((line: string) => {
        const trimmed = line.trim()
        if (!trimmed) {
          contentParagraphs.push(
            new Paragraph({
              children: [new TextRun({ text: '', font: fontFamily, size: fontSize * 2 })], // Size in half-points
              spacing: { after: 200 },
            })
          )
        } else {
          // Skip lines that are just section headers (without markdown)
          if (!trimmed.match(/^(Introduction|Body|Conclusion|Intro|Body Paragraphs?|Concluding?)$/i)) {
            contentParagraphs.push(
              new Paragraph({
                children: [new TextRun({ text: trimmed, font: fontFamily, size: fontSize * 2 })], // Size in half-points
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED,
              })
            )
          }
        }
      })
    }
    
    // References Section
    if (data.assignment_references && data.assignment_references.length > 0) {
      referenceParagraphs.push(
        new Paragraph({
          text: '',
          pageBreakBefore: true,
        })
      )
      
      // Get font settings
      const refFontFamily = data.font_family || 'Times New Roman'
      const refFontSize = (data.font_size || 12) * 2 // Convert to half-points
      const headingFontSize = ((data.font_size || 12) + 2) * 2 // Slightly larger for heading
      
      referenceParagraphs.push(
        new Paragraph({
          children: [new TextRun({ text: 'REFERENCES', font: refFontFamily, size: headingFontSize, bold: true })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 400 },
        })
      )
      
      data.assignment_references.forEach((ref: any) => {
        const author = ref.authors || ref.author || 'Unknown'
        const year = ref.year || 'n.d.'
        const title = ref.title || ''
        const source = ref.source || ''
        const url = ref.url || ''
        const refText = `${author}. (${year}). ${title}. ${source}${url ? `. Retrieved from ${url}` : ''}.`
        
        referenceParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: refText, font: refFontFamily, size: refFontSize })],
            spacing: { after: 200 },
            indent: { left: 720, hanging: 720 },
          })
        )
      })
    }
    
    // Create a temporary document to get the XML
    const tempSections: any[] = []
    if (contentParagraphs.length > 0) {
      tempSections.push({ properties: {}, children: contentParagraphs })
    }
    if (referenceParagraphs.length > 0) {
      tempSections.push({ properties: {}, children: referenceParagraphs })
    }
    
    if (tempSections.length === 0) {
      return templateBuffer
    }
    
    const tempDoc = new Document({ sections: tempSections })
    const tempBuffer = await Packer.toBuffer(tempDoc)
    
    // Now merge using a more careful XML approach
    const templateZip = new PizZip(templateBuffer)
    const tempZip = new PizZip(tempBuffer)
    
    const templateDocXml = templateZip.files['word/document.xml']
    const tempDocXml = tempZip.files['word/document.xml']
    
    if (!templateDocXml || !tempDocXml) {
      throw new Error('Could not find document.xml')
    }
    
    // Get XML as strings
    const templateXml = templateDocXml.asText()
    const tempXml = tempDocXml.asText()
    
    // Extract body content from temp document (the content we want to add)
    const tempBodyMatch = tempXml.match(/<w:body[^>]*>([\s\S]*?)<\/w:body>/)
    if (!tempBodyMatch) {
      throw new Error('Could not extract body from temp document')
    }
    const additionalContent = tempBodyMatch[1]
    
    // Find the body tag in template and insert content before closing tag
    // Use a more precise regex that finds the exact </w:body> closing tag
    const bodyCloseIndex = templateXml.lastIndexOf('</w:body>')
    if (bodyCloseIndex === -1) {
      throw new Error('Could not find </w:body> closing tag in template')
    }
    
    // Create page break XML (properly formatted)
    const pageBreakXml = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'
    
    // Insert the content before </w:body>
    const beforeBody = templateXml.substring(0, bodyCloseIndex)
    const afterBody = templateXml.substring(bodyCloseIndex)
    const newTemplateXml = beforeBody + pageBreakXml + additionalContent + afterBody
    
    // Validate XML structure before updating
    // Check that we have proper opening and closing tags
    const openBodyTags = (newTemplateXml.match(/<w:body[^>]*>/g) || []).length
    const closeBodyTags = (newTemplateXml.match(/<\/w:body>/g) || []).length
    
    if (openBodyTags !== 1 || closeBodyTags !== 1) {
      throw new Error(`Invalid XML structure: ${openBodyTags} opening tags, ${closeBodyTags} closing tags`)
    }
    
    // Update document.xml with UTF-8 encoding
    templateZip.file('word/document.xml', Buffer.from(newTemplateXml, 'utf-8'))
    
    // Generate final buffer with proper options
    const finalBuffer = templateZip.generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    })
    
    // Validate the buffer is not empty
    if (!finalBuffer || finalBuffer.length === 0) {
      throw new Error('Generated buffer is empty')
    }
    
    console.log('Successfully appended content and references to template, final size:', finalBuffer.length)
    return Buffer.from(finalBuffer)
  } catch (error: any) {
    console.error('Error appending content to template:', error)
    console.error('Error details:', error.message, error.stack)
    // Re-throw to trigger fallback in calling function
    throw error
  }
}

