/**
 * Enhanced PowerPoint Generation Service
 * Uses OpenAI API for high-quality presentation generation
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = "gpt-5-mini"; // PowerPoint uses GPT-5 mini
const MAX_TOKENS = 600; // 400-600 tokens: Enough for 5-10 slides

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


/**
 * Call OpenAI API for presentation generation
 */
async function callGemini(
  prompt: string,
  systemInstruction: string,
  temperature: number = 0.7,
  maxTokens?: number
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  const fullPrompt = `${systemInstruction}\n\n${prompt}`;

  try {
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
        temperature: temperature,
        max_tokens: maxTokens || MAX_TOKENS,
      }),
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
    const response = await callGemini(prompt, systemInstruction, 0.7, MAX_TOKENS);
    
    // Extract JSON from response (AI might add extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : response;
    const parsed = JSON.parse(jsonText);
    
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

