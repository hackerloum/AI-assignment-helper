/**
 * Enhanced PowerPoint Generation Service
 * Uses OpenAI API for high-quality presentation generation
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

interface Slide {
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

interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

/**
 * Call OpenAI API for presentation generation
 */
async function callOpenAI(
  prompt: string,
  systemInstruction: string,
  temperature: number = 0.7,
  maxTokens?: number
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  const requestBody: OpenAIRequest = {
    model: "gpt-4o-mini", // Using GPT-4o-mini for cost-effectiveness and quality
    messages: [
      {
        role: "system",
        content: systemInstruction,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature,
    ...(maxTokens && { max_tokens: maxTokens }),
    response_format: { type: "json_object" },
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `OpenAI API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from OpenAI API");
    }

    return content;
  } catch (error: any) {
    console.error("OpenAI API call failed:", error);
    throw new Error(error.message || "Failed to call OpenAI API");
  }
}

/**
 * Generate a high-quality presentation using OpenAI
 */
export async function generatePresentation(
  topic: string,
  slideCount: number = 5,
  style: string = "professional"
): Promise<Presentation> {
  const systemInstruction = `You are an expert presentation designer and content strategist. Create engaging, well-structured presentation slides with:
- Clear, compelling titles
- Concise bullet points (3-5 per slide)
- Speaker notes for each slide
- Visual suggestions (what images, charts, or graphics would enhance the slide)
- Appropriate slide layouts
- Professional, ${style} tone

Return ONLY a valid JSON object with this exact structure:
{
  "title": "Presentation Title",
  "subtitle": "Optional subtitle",
  "theme": "${style}",
  "estimatedDuration": number in minutes,
  "slides": [
    {
      "title": "Slide Title",
      "content": "Main content text",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"],
      "speakerNotes": "Detailed notes for the presenter",
      "visualSuggestions": ["Suggestion 1", "Suggestion 2"],
      "layout": "content"
    }
  ]
}

Layout options: "title", "content", "two-column", "image-focused", "comparison"
Ensure all slides have complete information.`;

  const prompt = `Create a ${slideCount}-slide presentation on: "${topic}"

Requirements:
- Style: ${style}
- Number of slides: ${slideCount}
- First slide should be a title slide
- Last slide should be a conclusion/summary
- Each slide should have:
  * A clear, engaging title
  * 3-5 bullet points with key information
  * Speaker notes explaining the slide content
  * Visual suggestions for images, charts, or graphics
  * An appropriate layout type
- Make the content comprehensive, accurate, and engaging
- Ensure smooth flow between slides
- Use professional language appropriate for ${style} style`;

  try {
    const response = await callOpenAI(prompt, systemInstruction, 0.7, 4000);
    
    // Parse JSON response
    const parsed = JSON.parse(response);
    
    // Validate and enhance the structure
    if (!parsed.slides || !Array.isArray(parsed.slides)) {
      throw new Error("Invalid presentation structure from API");
    }

    // Ensure all slides have required fields
    const enhancedSlides = parsed.slides.map((slide: any, index: number) => ({
      title: slide.title || `Slide ${index + 1}`,
      content: slide.content || slide.bulletPoints?.join("\n") || "",
      bulletPoints: slide.bulletPoints || [],
      speakerNotes: slide.speakerNotes || "",
      visualSuggestions: slide.visualSuggestions || [],
      layout: slide.layout || "content",
    }));

    return {
      title: parsed.title || topic,
      subtitle: parsed.subtitle,
      theme: parsed.theme || style,
      estimatedDuration: parsed.estimatedDuration || Math.ceil(slideCount * 2),
      slides: enhancedSlides,
    };
  } catch (error: any) {
    console.error("Error generating presentation:", error);
    
    // Fallback: create a basic structure
    const slides: Slide[] = [];
    for (let i = 0; i < slideCount; i++) {
      slides.push({
        title: i === 0 ? topic : `Slide ${i + 1}`,
        content: `Key points about ${topic}`,
        bulletPoints: [
          `Main point ${i + 1}`,
          `Supporting detail ${i + 1}`,
          `Additional information ${i + 1}`,
        ],
        speakerNotes: `Discuss the main points about ${topic} in this section.`,
        visualSuggestions: [
          "Relevant image or chart",
          "Supporting graphic",
        ],
        layout: i === 0 ? "title" : "content",
      });
    }

    return {
      title: topic,
      theme: style,
      estimatedDuration: Math.ceil(slideCount * 2),
      slides,
    };
  }
}

