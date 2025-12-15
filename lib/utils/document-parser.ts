import { Document, Paragraph, Packer } from 'docx'
import mammoth from 'mammoth'
import pdfParse from 'pdf-parse'
import PizZip from 'pizzip'

/**
 * Font information interface
 */
interface FontInfo {
  name: string
  size: number // in points
  bold?: boolean
  italic?: boolean
  color?: string
}

/**
 * Margin information interface
 */
interface MarginInfo {
  top: number // in inches
  bottom: number
  left: number
  right: number
}

/**
 * Spacing information interface
 */
interface SpacingInfo {
  line: number // line spacing (1.0, 1.5, 2.0, etc.)
  before?: number // space before paragraph in points
  after?: number // space after paragraph in points
}

/**
 * Heading information interface
 */
interface HeadingInfo {
  level: number // 1-6
  text: string
  style: {
    font?: FontInfo
    alignment?: string
  }
}

/**
 * Image information interface
 */
export interface ImageInfo {
  data: Buffer
  format: string // 'png', 'jpeg', etc.
  width?: number
  height?: number
  position?: {
    page?: number
    x?: number
    y?: number
  }
}

/**
 * Section information interface
 */
interface SectionInfo {
  title?: string
  content: string
  type: string // 'cover_page', 'introduction', 'body', 'conclusion', 'references', etc.
  wordCount: number
}

/**
 * Parsed document interface - output of parsing functions
 */
export interface ParsedDocument {
  text: string
  coverPageText?: string // Extracted cover page content
  headings: HeadingInfo[]
  styles: {
    fonts: Record<string, FontInfo>
    margins: MarginInfo
    spacing: SpacingInfo
  }
  images: ImageInfo[]
  sections: SectionInfo[]
  metadata: {
    pageCount: number
    wordCount: number
    documentType: 'docx' | 'pdf'
  }
}

/**
 * Parse DOCX file using mammoth and docx libraries
 * Extracts text, headings, styles, images, and formatting
 */
export async function parseDOCX(fileBuffer: Buffer): Promise<ParsedDocument> {
  try {
    // Use mammoth for text extraction (preserves formatting structure)
    const mammothResult = await mammoth.extractRawText({ buffer: fileBuffer })
    const text = mammothResult.value
    
    // Extract cover page content (typically first page before first major heading or content section)
    // Split by double newlines and take first few paragraphs as cover page
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    let coverPageText = ''
    // Look for cover page - usually first 5-10 paragraphs or until we hit a section like "QUESTION", "INTRODUCTION", etc.
    const contentStarters = /^(QUESTION|INTRODUCTION|CONTENT|BODY|ABSTRACT|ACKNOWLEDGMENTS)/i
    let coverPageEndIndex = paragraphs.findIndex(p => contentStarters.test(p.trim()))
    if (coverPageEndIndex === -1) {
      coverPageEndIndex = Math.min(8, paragraphs.length) // Default to first 8 paragraphs if no clear break
    }
    coverPageText = paragraphs.slice(0, coverPageEndIndex).join('\n\n')

    // Use PizZip to read DOCX structure directly
    const zip = new PizZip(fileBuffer)
    
    // Extract document.xml for detailed parsing
    const docXml = zip.files['word/document.xml']
    if (!docXml) {
      throw new Error('Invalid DOCX file: document.xml not found')
    }

    // Parse headings and structure from XML
    const headings: HeadingInfo[] = []
    const sections: SectionInfo[] = []
    const images: ImageInfo[] = []
    
    const xmlText = docXml.asText()
    
    // Extract headings using regex (simplified approach)
    // Match w:p (paragraphs) with heading styles
    const headingRegex = /<w:p[^>]*>[\s\S]*?<w:pStyle[^>]*w:val="Heading(\d+)"[^>]*>[\s\S]*?<w:t[^>]*>(.*?)<\/w:t>[\s\S]*?<\/w:p>/g
    let match
    while ((match = headingRegex.exec(xmlText)) !== null) {
      const level = parseInt(match[1])
      const headingText = match[2].replace(/<[^>]+>/g, '').trim()
      if (headingText) {
        headings.push({
          level,
          text: headingText,
          style: {}
        })
      }
    }

    // Extract images from document
    const imageRegex = /<w:drawing[\s\S]*?<a:blip[^>]*r:embed="([^"]+)"/g
    let imageMatch
    while ((imageMatch = imageRegex.exec(xmlText)) !== null) {
      const imageId = imageMatch[1]
      const imageFile = zip.files[`word/media/${imageId}`]
      if (imageFile) {
        const imageBuffer = Buffer.from(imageFile.asArrayBuffer())
        const extension = imageFile.name.split('.').pop() || 'png'
        images.push({
          data: imageBuffer,
          format: extension,
        })
      }
    }

    // Try to extract sections based on headings
    // Split text by major headings
    let currentSection: SectionInfo | null = null
    const lines = text.split('\n')
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Check if this line is a heading (already extracted)
      const isHeading = headings.some(h => h.text === line)
      
      if (isHeading) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection)
        }
        
        // Start new section
        const heading = headings.find(h => h.text === line)
        currentSection = {
          title: line,
          content: '',
          type: determineSectionType(line),
          wordCount: 0,
        }
      } else if (currentSection) {
        currentSection.content += line + '\n'
      }
    }
    
    // Add last section
    if (currentSection) {
      sections.push(currentSection)
    }

    // If no sections found, create one with all content
    if (sections.length === 0) {
      sections.push({
        title: 'Content',
        content: text,
        type: 'body',
        wordCount: text.split(/\s+/).length,
      })
    }

    // Calculate word counts
    sections.forEach(section => {
      section.wordCount = section.content.split(/\s+/).filter(w => w.length > 0).length
    })

    // Extract formatting information (defaults if not found)
    const fonts: Record<string, FontInfo> = {
      default: {
        name: 'Times New Roman',
        size: 12,
      },
    }

    // Extract margins from settings.xml or use defaults
    const margins: MarginInfo = {
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
    }

    // Extract spacing (default 1.5 line spacing)
    const spacing: SpacingInfo = {
      line: 1.5,
    }

    return {
      text,
      coverPageText: coverPageText || undefined,
      headings,
      styles: {
        fonts,
        margins,
        spacing,
      },
      images,
      sections,
      metadata: {
        pageCount: 0, // Would need page break detection to calculate
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
        documentType: 'docx',
      },
    }
  } catch (error: any) {
    console.error('Error parsing DOCX:', error)
    throw new Error(`Failed to parse DOCX file: ${error.message}`)
  }
}

/**
 * Parse PDF file using pdf-parse
 * Extracts text and basic structure
 */
export async function parsePDF(fileBuffer: Buffer): Promise<ParsedDocument> {
  try {
    const pdfData = await pdfParse(fileBuffer)
    
    const text = pdfData.text
    const headings: HeadingInfo[] = []
    const sections: SectionInfo[] = []
    
    // Basic heading detection (lines that are all caps or short lines followed by content)
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      // Detect headings: short lines, all caps, or numbered headings
      if (line.length < 100 && (
        line === line.toUpperCase() ||
        /^\d+[\.\)]\s+[A-Z]/.test(line) ||
        /^(INTRODUCTION|METHODOLOGY|RESULTS|DISCUSSION|CONCLUSION|REFERENCES)/i.test(line)
      )) {
        headings.push({
          level: line === line.toUpperCase() ? 1 : 2,
          text: line,
          style: {},
        })
      }
    }

    // Create sections based on headings
    let currentSection: SectionInfo | null = null
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const isHeading = headings.some(h => h.text === line)
      
      if (isHeading) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          title: line,
          content: '',
          type: determineSectionType(line),
          wordCount: 0,
        }
      } else if (currentSection) {
        currentSection.content += line + '\n'
      }
    }
    
    if (currentSection) {
      sections.push(currentSection)
    }

    if (sections.length === 0) {
      sections.push({
        title: 'Content',
        content: text,
        type: 'body',
        wordCount: text.split(/\s+/).length,
      })
    }

    sections.forEach(section => {
      section.wordCount = section.content.split(/\s+/).filter(w => w.length > 0).length
    })

    // PDF parsing doesn't easily extract images, fonts, margins
    // These would need more advanced PDF parsing libraries
    return {
      text,
      headings,
      styles: {
        fonts: {
          default: {
            name: 'Times New Roman',
            size: 12,
          },
        },
        margins: {
          top: 1,
          bottom: 1,
          left: 1,
          right: 1,
        },
        spacing: {
          line: 1.5,
        },
      },
      images: [], // PDF image extraction requires more advanced parsing
      sections,
      metadata: {
        pageCount: pdfData.numpages,
        wordCount: text.split(/\s+/).filter(w => w.length > 0).length,
        documentType: 'pdf',
      },
    }
  } catch (error: any) {
    console.error('Error parsing PDF:', error)
    throw new Error(`Failed to parse PDF file: ${error.message}`)
  }
}

/**
 * Determine section type based on title/heading
 */
function determineSectionType(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('cover') || lowerTitle.includes('title page')) {
    return 'cover_page'
  }
  if (lowerTitle.includes('introduction') || lowerTitle.includes('intro')) {
    return 'introduction'
  }
  if (lowerTitle.includes('methodology') || lowerTitle.includes('methods')) {
    return 'methodology'
  }
  if (lowerTitle.includes('results') || lowerTitle.includes('findings')) {
    return 'results'
  }
  if (lowerTitle.includes('discussion')) {
    return 'discussion'
  }
  if (lowerTitle.includes('conclusion')) {
    return 'conclusion'
  }
  if (lowerTitle.includes('reference') || lowerTitle.includes('bibliography')) {
    return 'references'
  }
  if (lowerTitle.includes('abstract')) {
    return 'abstract'
  }
  if (lowerTitle.includes('acknowledgment') || lowerTitle.includes('acknowledgement')) {
    return 'acknowledgments'
  }
  
  return 'body'
}

/**
 * Extract formatting information from parsed document
 * (Currently returns defaults, but can be enhanced with actual extraction)
 */
export function extractFormatting(document: ParsedDocument): {
  fonts: Record<string, FontInfo>
  margins: MarginInfo
  spacing: SpacingInfo
} {
  return document.styles
}

/**
 * Extract images from parsed document
 */
export function extractImages(document: ParsedDocument): ImageInfo[] {
  return document.images
}

