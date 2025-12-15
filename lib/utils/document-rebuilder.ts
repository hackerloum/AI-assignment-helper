import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  SectionType,
  WidthType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  ExternalHyperlink,
  InternalHyperlink,
  ImageRun,
} from 'docx'
import { DocumentStructure } from '@/lib/ai-service'
import { ParsedDocument, ImageInfo } from './document-parser'

/**
 * Interface for generated content organized by sections
 */
interface GeneratedContent {
  [sectionType: string]: string
}

/**
 * Rebuild document from analysis with original formatting
 * This is Step 4 - Code-based formatting rebuild (NO AI)
 */
export async function rebuildDocumentFromAnalysis(
  structure: DocumentStructure,
  generatedContent: GeneratedContent,
  originalFormatting: ParsedDocument['styles'],
  images: ParsedDocument['images'],
  assignmentData?: any // Cover page data and other assignment info
): Promise<Buffer> {
  const sections: any[] = []

  // Get formatting defaults
  const defaultFont = originalFormatting.fonts?.default || { name: 'Times New Roman', size: 12 }
  const fontName = defaultFont.name || 'Times New Roman'
  const fontSize = (defaultFont.size || 12) * 2 // Convert to half-points
  const margins = originalFormatting.margins || { top: 1, bottom: 1, left: 1, right: 1 }
  const lineSpacing = originalFormatting.spacing?.line || 1.5

  // Convert margins from inches to twentieths of a point (Word unit)
  const marginInTwips = (inches: number) => Math.round(inches * 1440)

  // Build cover page if present - use structure but fill with assignment data
  if (structure.cover_page && structure.cover_page.elements.length > 0) {
    const coverPageParagraphs: Paragraph[] = []

    // Add logo if available
    // Note: Image insertion is complex and requires proper Media.addImage setup
    // For now, we skip image insertion to avoid build errors
    // Images can be added manually to templates if needed
    // TODO: Implement proper image insertion using docx library Media API
    if (images.length > 0 && structure.cover_page.logo_position) {
      // Skip image insertion for now - can be enhanced later
      console.log('Logo detected but image insertion skipped (to be implemented)')
    }

    // Get cover page data from assignment (which should contain user-edited data)
    const coverPageData = assignmentData?.coverPageData || assignmentData || {}
    
    // Add cover page elements in the order they appear in the structure
    // This preserves the layout from the original document
    structure.cover_page.elements.forEach((element: any) => {
      const alignment = structure.cover_page.layout === 'centered' 
        ? AlignmentType.CENTER 
        : AlignmentType.LEFT

      // Use original text/label from the document, but replace with user data if provided
      let text = element.original_text || element.label || ''
      
      // Map element types to assignment/cover page data fields
      // Only replace if user has provided new data, otherwise keep original
      const coverPageData = assignmentData?.coverPageData || assignmentData || {}
      
      switch (element.type) {
        case 'title':
        case 'assignment_title':
        case 'task':
          // Only replace if user provided new data, otherwise keep original
          const newTitle = coverPageData.assignment_title || 
                          coverPageData.title || 
                          coverPageData.task || 
                          assignmentData?.title || 
                          assignmentData?.task
          if (newTitle) text = newTitle
          break
        case 'student_name':
        case 'name':
          const newStudentName = coverPageData.student_name || 
                                coverPageData.studentName || 
                                assignmentData?.student_name
          if (newStudentName) text = newStudentName
          break
        case 'registration_number':
        case 'reg_number':
        case 'registrationNumber':
          const newRegNumber = coverPageData.registration_number || 
                              coverPageData.registrationNumber || 
                              assignmentData?.registration_number
          if (newRegNumber) text = newRegNumber
          break
        case 'college_name':
        case 'college':
          const newCollegeName = coverPageData.college_name || 
                                coverPageData.collegeName || 
                                assignmentData?.college_name
          if (newCollegeName) text = newCollegeName
          break
        case 'course_name':
        case 'course':
        case 'module_name':
          const newCourseName = coverPageData.course_name || 
                               coverPageData.courseName || 
                               coverPageData.module_name ||
                               assignmentData?.course_name || 
                               assignmentData?.module_name
          if (newCourseName) text = newCourseName
          break
        case 'course_code':
        case 'module_code':
          const newModuleCode = coverPageData.course_code || 
                               coverPageData.courseCode || 
                               coverPageData.module_code || 
                               assignmentData?.course_code ||
                               assignmentData?.module_code
          if (newModuleCode) text = newModuleCode
          break
        case 'instructor_name':
        case 'instructor':
        case 'lecturer_name':
          const newInstructor = coverPageData.instructor_name || 
                               coverPageData.instructor || 
                               coverPageData.lecturer_name ||
                               assignmentData?.instructor_name
          if (newInstructor) text = newInstructor
          break
        case 'submission_date':
        case 'date':
          const newDate = coverPageData.submission_date || 
                         coverPageData.submissionDate || 
                         assignmentData?.submission_date
          if (newDate) text = newDate
          break
        case 'program_name':
          const newProgramName = coverPageData.program_name || assignmentData?.program_name
          if (newProgramName) text = newProgramName
          break
        case 'type_of_work':
          const newWorkType = coverPageData.type_of_work || assignmentData?.type_of_work
          if (newWorkType) text = newWorkType
          break
        default:
          // Try to find by label or use label as-is
          const labelKey = element.label?.toLowerCase().replace(/\s+/g, '_') || ''
          const newValue = coverPageData[labelKey] || assignmentData?.[labelKey]
          if (newValue) {
            text = newValue
          } else {
            // Keep original text/label if no replacement provided
            text = element.original_text || element.label || text
          }
      }

      // Only add paragraph if text exists
      if (text) {
        const displayText = text || element.label || ''
        // Determine font size - titles are larger
        const elementFontSize = element.type === 'title' ? fontSize + 4 : fontSize
        
        coverPageParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: displayText,
                font: fontName,
                size: elementFontSize * 2, // Convert to half-points
                bold: element.type === 'title',
              }),
            ],
            alignment,
            spacing: { 
              after: element.type === 'title' ? 400 : 300,
              before: coverPageParagraphs.length === 0 ? 600 : 0, // Extra space at top
            },
          })
        )
      }
    })

    // Add page break after cover page
    coverPageParagraphs.push(
      new Paragraph({
        children: [new TextRun('')],
        pageBreakBefore: false,
      })
    )

    sections.push({
      properties: {
        page: {
          margin: {
            top: marginInTwips(margins.top),
            bottom: marginInTwips(margins.bottom),
            left: marginInTwips(margins.left),
            right: marginInTwips(margins.right),
          },
        },
      },
      children: coverPageParagraphs,
    })
  }

  // Build content sections
  const contentParagraphs: Paragraph[] = []
  
  // Process sections in order
  structure.sections.forEach((section) => {
    const sectionContent = generatedContent[section.type] || generatedContent[section.title || ''] || ''
    
    if (!sectionContent) return

    // Add section title if present
    if (section.title) {
      const headingLevel = section.type === 'introduction' || section.type === 'conclusion' 
        ? HeadingLevel.HEADING_1 
        : HeadingLevel.HEADING_2

      contentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              font: fontName,
              size: fontSize + 4, // Slightly larger for headings
              bold: true,
            }),
          ],
          heading: headingLevel,
          spacing: { before: 400, after: 200 },
        })
      )
    }

    // Split content into paragraphs
    const paragraphs = sectionContent
      .split(/\n\s*\n/) // Split on double newlines
      .map(p => p.trim())
      .filter(p => p.length > 0)

    paragraphs.forEach((paragraphText) => {
      // Skip if it's just a section header
      if (paragraphText.match(/^(Introduction|Body|Conclusion|Methodology|Results|Discussion|References)$/i)) {
        return
      }

      contentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraphText,
              font: fontName,
              size: fontSize,
            }),
          ],
          spacing: {
            after: Math.round(lineSpacing * 240), // Convert line spacing to points
            line: Math.round(lineSpacing * 240),
          },
          alignment: AlignmentType.JUSTIFIED,
        })
      )
    })

    // Add spacing after section
    contentParagraphs.push(
      new Paragraph({
        children: [new TextRun('')],
        spacing: { after: 200 },
      })
    )
  })

  // Add references section if present
  if (generatedContent.references) {
    contentParagraphs.push(
      new Paragraph({
        children: [new TextRun('')],
        pageBreakBefore: true,
      })
    )

    contentParagraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'REFERENCES',
            font: fontName,
            size: fontSize + 4,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      })
    )

    // Split references by line
    const references = generatedContent.references
      .split('\n')
      .map(r => r.trim())
      .filter(r => r.length > 0)

    references.forEach((ref) => {
      contentParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: ref,
              font: fontName,
              size: fontSize,
            }),
          ],
          spacing: { after: 200 },
          indent: {
            left: 720, // 0.5 inch
            hanging: 720,
          },
        })
      )
    })
  }

  // Create main content section
  if (contentParagraphs.length > 0) {
    sections.push({
      properties: {
        page: {
          margin: {
            top: marginInTwips(margins.top),
            bottom: marginInTwips(margins.bottom),
            left: marginInTwips(margins.left),
            right: marginInTwips(margins.right),
          },
        },
      },
      children: contentParagraphs,
    })
  }

  // Create document
  const doc = new Document({
    sections: sections.length > 0 ? sections : [
      {
        properties: {
          page: {
            margin: {
              top: marginInTwips(margins.top),
              bottom: marginInTwips(margins.bottom),
              left: marginInTwips(margins.left),
              right: marginInTwips(margins.right),
            },
          },
        },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: 'Document content',
                font: fontName,
                size: fontSize,
              }),
            ],
          }),
        ],
      },
    ],
  })

  // Generate buffer
  const buffer = await Packer.toBuffer(doc)
  return buffer
}

