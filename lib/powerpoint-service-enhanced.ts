/**
 * Enhanced PowerPoint Service
 * Combines OpenAI content generation with PowerPoint Generator API
 * to create actual .pptx files
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const PPTX_API_GEN_URL = "https://gen.powerpointgeneratorapi.com/v1.0/generator/create";
const PPTX_API_BEARER_TOKEN = process.env.PPTX_API_BEARER_TOKEN;

export interface Slide {
  title: string;
  content: string;
  speakerNotes?: string;
  visualSuggestions?: string[];
  layout?: "title" | "content" | "two-column" | "image-focused" | "comparison";
  bulletPoints?: string[];
}

export interface Presentation {
  title: string;
  subtitle?: string;
  slides: Slide[];
  theme?: string;
  estimatedDuration?: number;
}

/**
 * Generate presentation content using OpenAI
 */
async function generatePresentationContent(
  topic: string,
  slideCount: number,
  style: string
): Promise<Presentation> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const systemInstruction = `You are an expert presentation designer. Create engaging, well-structured presentation slides.
Return ONLY a valid JSON object with this structure:
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "theme": "${style}",
  "estimatedDuration": number,
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Notes for presenter",
      "visualSuggestions": ["Suggestion 1", "Suggestion 2"],
      "layout": "content"
    }
  ]
}`;

  const prompt = `Create a ${slideCount}-slide presentation on: "${topic}"
Style: ${style}
Include title slide, content slides, and conclusion.
Each slide should have 3-5 bullet points and speaker notes.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return {
      title: parsed.title || topic,
      subtitle: parsed.subtitle,
      theme: parsed.theme || style,
      estimatedDuration: parsed.estimatedDuration || Math.ceil(slideCount * 2),
      slides: parsed.slides || [],
    };
  } catch (error: any) {
    console.error("Error generating content:", error);
    // Fallback to basic structure
    return createFallbackPresentation(topic, slideCount, style);
  }
}

/**
 * Create fallback presentation if AI fails
 */
function createFallbackPresentation(
  topic: string,
  slideCount: number,
  style: string
): Presentation {
  const slides: Slide[] = [
    {
      title: topic,
      content: "AI-Generated Presentation",
      bulletPoints: ["Professional content", "Engaging design", "Clear structure"],
      layout: "title",
    },
  ];

  for (let i = 1; i < slideCount - 1; i++) {
    slides.push({
      title: `Key Point ${i}`,
      content: `Main content about ${topic}`,
      bulletPoints: [
        `Important aspect ${i}`,
        `Supporting detail ${i}`,
        `Additional information ${i}`,
      ],
      layout: "content",
    });
  }

  slides.push({
    title: "Conclusion",
    content: `Summary of ${topic}`,
    bulletPoints: ["Key takeaways", "Next steps", "Thank you"],
    layout: "content",
  });

  return {
    title: topic,
    theme: style,
    estimatedDuration: Math.ceil(slideCount * 2),
    slides,
  };
}

/**
 * Format presentation for PowerPoint Generator API
 */
function formatForPowerPointAPI(presentation: Presentation): any {
  const slides = [];

  // Title slide
  slides.push({
    type: "slide",
    slide_index: 0,
    shapes: [
      {
        name: "Title 1",
        content: presentation.title,
      },
      {
        name: "Subtitle 2",
        content: presentation.subtitle || "AI-Generated Presentation",
      },
    ],
  });

  // Content slides
  presentation.slides.slice(1).forEach((slide, index) => {
    const shapes: any[] = [
      {
        name: "Title 1",
        content: slide.title,
      },
    ];

    // Format bullet points or content
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      shapes.push({
        name: "Content Placeholder 2",
        content: slide.bulletPoints.map((point) => `• ${point}`).join("\n"),
      });
    } else if (slide.content) {
      shapes.push({
        name: "Content Placeholder 2",
        content: slide.content,
      });
    }

    slides.push({
      type: "slide",
      slide_index: index + 1,
      shapes,
    });
  });

  return {
    presentation: {
      template: `${presentation.theme || "professional"}_template.pptx`,
      export_version: "Pptx2010",
      resultFileName: `${presentation.title.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}`,
      slides,
    },
  };
}

/**
 * Create PowerPoint file using PowerPoint Generator API
 */
async function createPowerPointFile(
  jsonData: any,
  templateBlob?: Blob
): Promise<Blob> {
  if (!PPTX_API_BEARER_TOKEN) {
    throw new Error("PowerPoint Generator API token not configured");
  }

  const formData = new FormData();
  formData.append("jsonData", JSON.stringify(jsonData));

  if (templateBlob) {
    formData.append("files", templateBlob, jsonData.presentation.template);
  }

  const response = await fetch(PPTX_API_GEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PPTX_API_BEARER_TOKEN}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PowerPoint API error: ${response.statusText} - ${errorText}`);
  }

  return await response.blob();
}

/**
 * Main function: Generate complete presentation
 * Returns both the presentation data and optionally the .pptx file
 */
export async function generatePresentation(
  topic: string,
  slideCount: number = 5,
  style: string = "professional",
  createFile: boolean = false
): Promise<Presentation & { fileBlob?: Blob }> {
  // Step 1: Generate content using AI
  const presentation = await generatePresentationContent(topic, slideCount, style);

  // Step 2: If file creation is requested, create .pptx file
  if (createFile && PPTX_API_BEARER_TOKEN) {
    try {
      const apiData = formatForPowerPointAPI(presentation);
      const fileBlob = await createPowerPointFile(apiData);
      return {
        ...presentation,
        fileBlob,
      };
    } catch (error) {
      console.error("Error creating PowerPoint file:", error);
      // Return presentation data without file if API fails
      return presentation;
    }
  }

  return presentation;
}

/**
 * Export presentation data to PowerPoint API format (for debugging/testing)
 */
export function exportToPowerPointFormat(presentation: Presentation): string {
  const apiData = formatForPowerPointAPI(presentation);
  return JSON.stringify(apiData, null, 2);
}

