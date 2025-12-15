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

  // Build cover page if present
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

    // Add cover page elements
    structure.cover_page.elements.forEach((element) => {
      const alignment = structure.cover_page.layout === 'centered' 
        ? AlignmentType.CENTER 
        : AlignmentType.LEFT

      let text = ''
      if (assignmentData) {
        // Map element types to assignment data fields
        switch (element.type) {
          case 'title':
            text = assignmentData.title || assignmentData.task || ''
            break
          case 'student_name':
            text = assignmentData.student_name || ''
            break
          case 'registration_number':
            text = assignmentData.registration_number || ''
            break
          case 'college_name':
            text = assignmentData.college_name || ''
            break
          case 'course_name':
            text = assignmentData.course_name || ''
            break
          case 'instructor_name':
            text = assignmentData.instructor_name || ''
            break
          case 'submission_date':
            text = assignmentData.submission_date || ''
            break
          default:
            text = element.label || ''
        }
      } else {
        text = element.label || ''
      }

      if (text) {
        coverPageParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: text,
                font: fontName,
                size: fontSize,
                bold: element.type === 'title',
              }),
            ],
            alignment,
            spacing: { after: 300 },
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

