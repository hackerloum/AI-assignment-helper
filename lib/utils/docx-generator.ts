import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx'

export async function generateAssignmentDocument(assignment: any): Promise<Buffer> {
  const sections: any[] = []

  // Cover Page
  const coverPageChildren: Paragraph[] = []

  // College/School
  if (assignment.course_code || assignment.module_code) {
    coverPageChildren.push(
      new Paragraph({
        text: assignment.course_code || assignment.module_code || '',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    )
  }

  // Assignment Title
  coverPageChildren.push(
    new Paragraph({
      text: (assignment.title || 'Untitled Assignment').toUpperCase(),
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 400 },
      children: [
        new TextRun({
          text: (assignment.title || 'Untitled Assignment').toUpperCase(),
          bold: true,
        }),
      ],
    })
  )

  // Group or Individual Info
  if (assignment.assignment_type === 'group') {
    if (assignment.group_name || assignment.group_number) {
      coverPageChildren.push(
        new Paragraph({
          text: `GROUP ${assignment.group_number ? 'NUMBER' : 'NAME'}: ${assignment.group_name || assignment.group_number || ''}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `GROUP ${assignment.group_number ? 'NUMBER' : 'NAME'}: ${assignment.group_name || assignment.group_number || ''}`,
              bold: true,
            }),
          ],
        })
      )
    }

    // Representatives Table
    if (assignment.group_representatives && assignment.group_representatives.length > 0) {
      coverPageChildren.push(
        new Paragraph({
          text: 'GROUP REPRESENTATIVES',
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        })
      )

      const representativesTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'NAME', bold: true })]
                })] 
              }),
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'ROLE', bold: true })]
                })] 
              }),
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'REG. NUMBER', bold: true })]
                })] 
              }),
            ],
          }),
          ...assignment.group_representatives.map((rep: any) => 
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(rep.name || '')] }),
                new TableCell({ children: [new Paragraph(rep.role || '')] }),
                new TableCell({ children: [new Paragraph(rep.registration_no || '')] }),
              ],
            })
          ),
        ],
      })

      coverPageChildren.push(representativesTable as any)
    }

    // Group Members Table (for LGTI format)
    if (assignment.group_members && assignment.group_members.length > 0) {
      coverPageChildren.push(
        new Paragraph({
          text: 'GROUP PARTICIPANTS',
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
        })
      )

      const membersTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'S/N', bold: true })]
                })] 
              }),
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'NAME OF PARTICIPANTS', bold: true })]
                })] 
              }),
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'REGISTRATION NUMBER', bold: true })]
                })] 
              }),
              new TableCell({ 
                children: [new Paragraph({ 
                  children: [new TextRun({ text: 'PHONE NUMBER', bold: true })]
                })] 
              }),
            ],
          }),
          ...assignment.group_members.map((member: any, index: number) => 
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(String(index + 1))] }),
                new TableCell({ children: [new Paragraph(member.name || '')] }),
                new TableCell({ children: [new Paragraph(member.registration_no || '')] }),
                new TableCell({ children: [new Paragraph(member.phone_number || '')] }),
              ],
            })
          ),
        ],
      })

      coverPageChildren.push(membersTable as any)
    }
  } else {
    coverPageChildren.push(
      new Paragraph({
        text: `NAME: ${assignment.student_name || ''}`,
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
      }),
      new Paragraph({
        text: `REGISTRATION NUMBER: ${assignment.registration_number || ''}`,
        alignment: AlignmentType.LEFT,
        spacing: { after: 100 },
      })
    )
  }

  // Instructor and Date
  coverPageChildren.push(
    new Paragraph({
      text: `INSTRUCTOR: ${assignment.instructor_name || ''}`,
      alignment: AlignmentType.LEFT,
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      text: `SUBMISSION DATE: ${assignment.submission_date || ''}`,
      alignment: AlignmentType.LEFT,
    })
  )

  sections.push({
    properties: {},
    children: coverPageChildren,
  })

  // Content Sections
  if (assignment.assignment_content) {
    // Get font settings (default to Times New Roman, 12pt)
    const fontFamily = assignment.font_family || 'Times New Roman'
    const fontSize = (assignment.font_size || 12) * 2 // Convert to half-points
    
    // Remove markdown headers
    const cleanContent = assignment.assignment_content
      .replace(/^##+\s*(Introduction|Body|Conclusion|Intro|Body Paragraphs?|Concluding?)\s*$/gmi, '') // Remove markdown headers
      .replace(/^##+\s*/gm, '') // Remove any remaining markdown headers
      .trim()
    
    const contentLines = cleanContent.split('\n')
    const contentParagraphs: Paragraph[] = []

    contentLines.forEach((line: string) => {
      const trimmed = line.trim()
      if (!trimmed) {
        // Empty line
        contentParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: '', font: fontFamily, size: fontSize })],
            spacing: { after: 150 },
          })
        )
      } else if (!trimmed.match(/^(Introduction|Body|Conclusion|Intro|Body Paragraphs?|Concluding?)$/i)) {
        // Skip section header lines, only include actual content
        contentParagraphs.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed, font: fontFamily, size: fontSize })],
            spacing: { after: 150 },
            alignment: AlignmentType.JUSTIFIED,
          })
        )
      }
    })

    if (contentParagraphs.length > 0) {
      sections.push({
        properties: {},
        children: contentParagraphs,
      })
    }
  }

  // References
  if (assignment.assignment_references && assignment.assignment_references.length > 0) {
    const referenceParagraphs = [
      new Paragraph({
        text: 'REFERENCES',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      }),
      ...assignment.assignment_references.map((ref: any) => {
        const author = ref.authors || ref.author || 'Unknown'
        const year = ref.year || 'n.d.'
        const title = ref.title || ''
        const source = ref.source || ''
        const url = ref.url || ''
        
        const refText = `${author}. (${year}). ${title}. ${source}${url ? `. Retrieved from ${url}` : ''}.`
        
        return new Paragraph({
          text: refText,
          spacing: { after: 200 },
          indent: { left: 720, hanging: 720 },
        })
      }),
    ]

    sections.push({
      properties: {},
      children: referenceParagraphs,
    })
  }

  const doc = new Document({
    sections,
  })

  return await Packer.toBuffer(doc)
}

