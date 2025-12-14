/**
 * Enhanced PowerPoint Service
 * Uses OpenAI API for content generation and SlidesGPT API
 * to create actual .pptx files
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5-mini"; // PowerPoint uses GPT-5 mini
const MAX_TOKENS = 600; // 400-600 tokens: Enough for 5-10 slides

import { generateSlidesGPTPresentation, downloadSlidesGPTPresentation } from "./slidesgpt-service";

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
 * Generate presentation content using OpenAI API
 */
async function generatePresentationContent(
  topic: string,
  slideCount: number,
  style: string
): Promise<Presentation> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  // Style-specific instructions
  const styleInstructions = {
    academic: "Use academic language but keep it simple and accessible for students. Use clear definitions, simple examples, and avoid complex jargon. If you must use technical terms, explain them in simple language. Focus on understanding over complexity.",
    professional: "Use professional business language but keep it clear and straightforward. Use practical examples and real-world applications.",
    creative: "Use engaging, visual language. Be creative but still clear and easy to understand. Use vivid examples and analogies.",
  };

  const systemInstruction = `You are an expert academic presentation designer specializing in creating student-friendly educational content. Your goal is to make complex topics accessible and understandable.

CRITICAL REQUIREMENTS:
- Use simple, clear language that students can easily understand
- Avoid complex jargon - if technical terms are needed, explain them simply
- Include practical examples and analogies to help understanding
- Focus on clarity and comprehension over complexity
- Make content engaging but educational
- Presentation style: ${style}
- Style guidance: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.academic}

Return ONLY a valid JSON object with this structure:
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "theme": "${style}",
  "estimatedDuration": number,
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content in simple terms",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Notes for presenter",
      "visualSuggestions": ["Suggestion 1", "Suggestion 2"],
      "layout": "content"
    }
  ]
}`;

  const prompt = `Create EXACTLY ${slideCount} slides for a presentation on: "${topic}"

PRESENTATION STYLE: ${style}
${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.academic}

CRITICAL: Create EXACTLY ${slideCount} slides total - no more, no less. Count carefully.

Structure:
- Slide 1: Title slide with title and subtitle
${slideCount > 1 ? `- Slides 2-${slideCount - 1}: Content slides with key points explained simply` : ''}
${slideCount > 1 ? `- Slide ${slideCount}: Conclusion/summary slide` : ''}

Content Requirements:
- Use simple, student-friendly language
- Explain concepts clearly with examples
- Avoid complex terminology unless necessary (and explain if used)
- Make content accessible and understandable
- Each slide should have 3-5 bullet points
- Include speaker notes that help explain the content simply

Return ONLY valid JSON with exactly ${slideCount} slides in the slides array.`;

  try {
    const fullPrompt = `${systemInstruction}\n\n${prompt}`;
    
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: "user",
            content: fullPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    // Extract JSON from response (AI might add extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : content;
    const parsed = JSON.parse(jsonText);

    // Ensure we have exactly the requested number of slides
    let slides = parsed.slides || [];
    if (slides.length > slideCount) {
      // Trim to exact count
      slides = slides.slice(0, slideCount);
    } else if (slides.length < slideCount) {
      // Add placeholder slides if needed
      while (slides.length < slideCount) {
        slides.push({
          title: `Slide ${slides.length + 1}`,
          content: `Content for slide ${slides.length + 1}`,
          bulletPoints: [`Key point ${slides.length + 1}`],
          layout: "content",
        });
      }
    }

    return {
      title: parsed.title || topic,
      subtitle: parsed.subtitle,
      theme: parsed.theme || style,
      estimatedDuration: parsed.estimatedDuration || Math.ceil(slideCount * 2),
      slides: slides.slice(0, slideCount), // Ensure exact count
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
 * Create a prompt for SlidesGPT from presentation data
 * This ensures exact slide count and content matching user requirements
 */
function createSlidesGPTPrompt(
  presentation: Presentation,
  requestedSlideCount: number,
  style: string
): string {
  // Create a precise prompt for SlidesGPT with exact slide count
  const actualSlideCount = presentation.slides.length;
  const slideCountToUse = Math.min(actualSlideCount, requestedSlideCount);
  
  // Limit slides to exactly what user requested
  const slidesToInclude = presentation.slides.slice(0, slideCountToUse);
  
  // Style-specific instructions for SlidesGPT
  const styleGuidance = {
    academic: "Use an academic, scholarly style with clear structure. Keep language simple and accessible for students.",
    professional: "Use a professional, business-oriented style. Focus on practical applications and clear communication.",
    creative: "Use a creative, engaging style with visual elements. Make it colorful and dynamic while maintaining clarity.",
  };
  
  // Build a very structured, explicit prompt with maximum emphasis on slide count
  let prompt = `Create a PowerPoint presentation with EXACTLY ${slideCountToUse} slides.\n\n`;
  
  // Repeat the slide count requirement multiple times
  prompt += `SLIDE COUNT REQUIREMENT: ${slideCountToUse} SLIDES\n`;
  prompt += `SLIDE COUNT REQUIREMENT: ${slideCountToUse} SLIDES\n`;
  prompt += `SLIDE COUNT REQUIREMENT: ${slideCountToUse} SLIDES\n\n`;
  
  prompt += `Topic: ${presentation.title}\n`;
  if (presentation.subtitle) {
    prompt += `Subtitle: ${presentation.subtitle}\n`;
  }
  prompt += `Style: ${style} - ${styleGuidance[style as keyof typeof styleGuidance] || styleGuidance.academic}\n\n`;
  
  prompt += `YOU MUST CREATE EXACTLY ${slideCountToUse} SLIDES. HERE ARE THE ${slideCountToUse} SLIDES TO CREATE:\n\n`;
  
  // List each slide explicitly with very clear numbering
  slidesToInclude.forEach((slide, index) => {
    const slideNum = index + 1;
    prompt += `SLIDE ${slideNum} OF ${slideCountToUse}:\n`;
    prompt += `Title: ${slide.title}\n`;
    if (slide.bulletPoints && slide.bulletPoints.length > 0) {
      prompt += `Content:\n`;
      slide.bulletPoints.forEach((point, idx) => {
        prompt += `  • ${point}\n`;
      });
    } else if (slide.content) {
      prompt += `Content: ${slide.content}\n`;
    }
    prompt += `\n`;
  });

  prompt += `\n`;
  prompt += `CRITICAL FINAL REMINDERS:\n`;
  prompt += `- Total slides to create: ${slideCountToUse}\n`;
  prompt += `- Do NOT create ${slideCountToUse + 1} slides\n`;
  prompt += `- Do NOT create ${slideCountToUse + 2} slides\n`;
  prompt += `- Do NOT create any slides beyond ${slideCountToUse}\n`;
  prompt += `- The final presentation must have exactly ${slideCountToUse} slides\n`;
  prompt += `- Follow ${style} style\n`;
  prompt += `- Use simple, student-friendly language\n\n`;
  
  prompt += `FINAL COUNT CHECK: ${slideCountToUse} SLIDES = ${slideCountToUse} SLIDES ONLY.`;

  return prompt;
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
): Promise<Presentation & { fileBlob?: Blob; slidesGPTId?: string }> {
  // Step 1: Generate content using AI (limit to requested slide count)
  const presentation = await generatePresentationContent(topic, slideCount, style);
  
  // Ensure we only have the requested number of slides
  if (presentation.slides.length > slideCount) {
    presentation.slides = presentation.slides.slice(0, slideCount);
  }

  // Step 2: If file creation is requested, create .pptx file using SlidesGPT
  if (createFile) {
    try {
      // Create a precise prompt for SlidesGPT with exact slide count and style
      const slidesGPTPrompt = createSlidesGPTPrompt(presentation, slideCount, style);
      
      // Generate presentation with SlidesGPT
      const slidesGPTResponse = await generateSlidesGPTPresentation(slidesGPTPrompt);
      
      // Download the file
      const fileBlob = await downloadSlidesGPTPresentation(slidesGPTResponse.id);
      
      return {
        ...presentation,
        fileBlob,
        slidesGPTId: slidesGPTResponse.id,
      };
    } catch (error: any) {
      console.error("Error creating PowerPoint file with SlidesGPT:", error);
      // Re-throw the error so the API route can handle it properly
      throw new Error(`Failed to create PowerPoint file: ${error.message}`);
    }
  }

  return presentation;
}
