const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

/**
 * Helper function to call Gemini API
 */
export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  temperature: number = 0.7,
  maxOutputTokens?: number
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
  }

  // Combine system instruction and user prompt
  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  const requestBody: GeminiRequest = {
    contents: [
      {
        parts: [
          {
            text: fullPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature,
      ...(maxOutputTokens && { maxOutputTokens }),
    },
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`;
      
      // Check for quota/rate limit errors
      if (errorMessage.includes("quota") || errorMessage.includes("Quota exceeded") || errorMessage.includes("rate limit")) {
        // Extract retry time from error message if available
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
        const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : null;
        
        const quotaError: any = new Error(errorMessage);
        quotaError.isQuotaError = true;
        quotaError.retryAfter = retrySeconds;
        quotaError.statusCode = response.status;
        throw quotaError;
      }
      
      throw new Error(errorMessage);
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      const errorMessage = data.error.message || "Gemini API error";
      
      // Check for quota/rate limit errors in response
      if (errorMessage.includes("quota") || errorMessage.includes("Quota exceeded") || errorMessage.includes("rate limit")) {
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i);
        const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : null;
        
        const quotaError: any = new Error(errorMessage);
        quotaError.isQuotaError = true;
        quotaError.retryAfter = retrySeconds;
        throw quotaError;
      }
      
      throw new Error(errorMessage);
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Error: No response from Gemini API";

    return text;
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    
    // Re-throw quota errors with their special properties
    if (error.isQuotaError) {
      throw error;
    }
    
    throw new Error(error.message || "Failed to call Gemini API");
  }
}

export async function generateEssay(
  topic: string,
  wordCount: number = 500
): Promise<string> {
  const systemInstruction =
    "You are an expert academic writer. Write well-structured, academic essays with proper introduction, body paragraphs, and conclusion. IMPORTANT: Do NOT use markdown formatting (no ##, **, or other markdown syntax). Write plain text only with proper paragraph breaks.";
  const prompt = `Write a ${wordCount}-word essay on the topic: "${topic}". Ensure it has a clear thesis statement, well-developed arguments, and a strong conclusion. Write in plain text format - do NOT use markdown headers (##), bold (**), or any other markdown formatting. Use only paragraph breaks to separate sections.`;

  const content = await callGemini(
    prompt,
    systemInstruction,
    0.7,
    Math.floor(wordCount * 1.5)
  );

  // Strip any markdown headers that might have been added
  return stripMarkdownHeaders(content);
}

/**
 * Remove markdown headers and formatting from text
 */
export function stripMarkdownHeaders(text: string): string {
  // Remove markdown headers (##, ###, etc.)
  let cleaned = text.replace(/^#{1,6}\s+.+$/gm, '');
  
  // Remove bold/italic markdown (**text**, *text*)
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  
  // Remove any remaining markdown links [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Clean up multiple newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  return cleaned.trim();
}

export async function paraphraseText(text: string): Promise<string> {
  const systemInstruction =
    "You are a paraphrasing expert. Rewrite the given text in your own words while maintaining the original meaning and academic tone.";
  const prompt = `Paraphrase the following text while maintaining its meaning:\n\n${text}`;

  return await callGemini(prompt, systemInstruction, 0.8);
}

export async function checkGrammar(text: string): Promise<{
  corrected: string;
  suggestions: Array<{ original: string; corrected: string; reason: string }>;
}> {
  const systemInstruction =
    "You are a grammar and writing expert. Check the text for grammar, spelling, and punctuation errors. Return a JSON object with 'corrected' (the corrected text) and 'suggestions' (array of corrections with original, corrected, and reason fields). Always return valid JSON only, no additional text.";
  const prompt = `Check and correct the following text:\n\n${text}\n\nReturn the result as a JSON object with 'corrected' and 'suggestions' fields.`;

  try {
    const response = await callGemini(prompt, systemInstruction, 0.3);
    // Try to extract JSON from the response (in case Gemini adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : response;
    const result = JSON.parse(jsonText);

    return {
      corrected: result.corrected || text,
      suggestions: result.suggestions || [],
    };
  } catch (error) {
    console.error("Error parsing grammar check response:", error);
    return {
      corrected: text,
      suggestions: [],
    };
  }
}

export async function generateCitation(
  source: {
    title: string;
    author?: string;
    year?: string;
    url?: string;
    publisher?: string;
  },
  format: "APA" | "MLA" | "Chicago" = "APA"
): Promise<string> {
  const formatInstructions = {
    APA: "Format in APA 7th edition style",
    MLA: "Format in MLA 9th edition style",
    Chicago: "Format in Chicago 17th edition style",
  };

  const systemInstruction = `You are a citation expert. Generate accurate citations in ${format} format.`;
  const prompt = `Generate a ${format} citation for:\nTitle: ${source.title}\n${source.author ? `Author: ${source.author}\n` : ""}${source.year ? `Year: ${source.year}\n` : ""}${source.url ? `URL: ${source.url}\n` : ""}${source.publisher ? `Publisher: ${source.publisher}\n` : ""}\n\n${formatInstructions[format]}`;

  return await callGemini(prompt, systemInstruction, 0.3);
}

export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<string> {
  const systemInstruction =
    "You are a summarization expert. Create concise, accurate summaries that capture the main points and key information.";
  const prompt = `Summarize the following text in approximately ${maxLength} words:\n\n${text}`;

  return await callGemini(
    prompt,
    systemInstruction,
    0.5,
    Math.floor(maxLength * 1.5)
  );
}

export interface ResearchOptions {
  depth?: 'basic' | 'intermediate' | 'advanced';
  format?: 'comprehensive' | 'summary' | 'detailed';
  includeExamples?: boolean;
  includeVisualSuggestions?: boolean;
  studentLevel?: 'high-school' | 'undergraduate' | 'graduate';
}

export async function generateResearch(
  query: string,
  options: ResearchOptions = {}
): Promise<string> {
  const {
    depth = 'intermediate',
    format = 'comprehensive',
    includeExamples = true,
    includeVisualSuggestions = true,
    studentLevel = 'undergraduate'
  } = options;

  // Determine explanation style based on student level
  const explanationStyle = {
    'high-school': 'Use simple language, avoid jargon, explain technical terms, use analogies and real-world examples',
    'undergraduate': 'Use clear academic language, define key terms, provide context, include relevant examples',
    'graduate': 'Use sophisticated academic language, assume familiarity with concepts, include nuanced analysis'
  }[studentLevel];

  // Determine depth instructions
  const depthInstructions = {
    'basic': 'Provide a clear, concise overview covering the essential points. Keep it brief and easy to understand.',
    'intermediate': 'Provide a thorough explanation with multiple perspectives, key concepts, and important details.',
    'advanced': 'Provide an in-depth analysis with comprehensive coverage, multiple viewpoints, critical analysis, and detailed explanations.'
  }[depth];

  const systemInstruction = `You are an expert academic research assistant and educator specializing in helping students understand complex topics. Your goal is to make learning accessible, engaging, and comprehensive.

CORE PRINCIPLES:
1. **Student-Friendly Approach**: ${explanationStyle}
2. **Academic Rigor**: Maintain accuracy and cite important concepts
3. **Clear Structure**: Organize information logically with clear headings
4. **Visual Learning**: ${includeVisualSuggestions ? 'Suggest diagrams, charts, or visual aids where helpful' : 'Focus on textual explanations'}
5. **Practical Application**: ${includeExamples ? 'Include real-world examples, case studies, and practical applications' : 'Focus on theoretical understanding'}

RESPONSE STRUCTURE:
Your response MUST follow this exact format using markdown:

## 📚 Overview
[A brief 2-3 sentence introduction to the topic]

## 🎯 Key Concepts
[Break down the main concepts in simple terms. Use bullet points or numbered lists.]

## 📖 Detailed Explanation
[${depthInstructions}]

${includeExamples ? `## 💡 Examples & Applications
[Provide 2-3 concrete examples, case studies, or real-world applications that help students understand the concept better]` : ''}

## 🔑 Key Takeaways
[Summarize the 3-5 most important points students should remember]

${includeVisualSuggestions ? `## 📊 Visual Learning Suggestions
[Suggest 2-3 types of diagrams, charts, or visual aids that would help visualize this concept (e.g., "A flowchart showing...", "A timeline diagram of...", "A comparison table of...")]` : ''}

## 📚 Further Reading
[Suggest 2-3 areas for deeper exploration or related topics]

IMPORTANT FORMATTING RULES:
- Use markdown headers (##, ###) for clear structure
- Use bullet points (-) and numbered lists for clarity
- Use **bold** for key terms and important concepts
- Use *italics* for emphasis
- Use emojis sparingly but effectively (📚 🎯 📖 💡 🔑 📊)
- Break up long paragraphs into shorter, digestible chunks
- Use tables when comparing concepts
- Use code blocks for technical examples if relevant

TONE:
- Friendly and encouraging, like a helpful tutor
- Professional but approachable
- Enthusiastic about the subject matter
- Patient and clear in explanations`;

  const formatInstructions = {
    'comprehensive': 'Provide a full, detailed response covering all aspects',
    'summary': 'Provide a concise summary focusing on the most important points',
    'detailed': 'Provide an extremely detailed, in-depth analysis with extensive coverage'
  }[format];

  const prompt = `Research Question: "${query}"

Instructions:
- ${formatInstructions}
- ${depthInstructions}
- Make it engaging and easy to understand for ${studentLevel} level students
- Ensure all information is accurate and well-structured
- Use the exact response structure provided in the system instructions

Generate a comprehensive, student-friendly research response that will help the student fully understand this topic.`;

  const maxTokens = {
    'basic': 1500,
    'intermediate': 2500,
    'advanced': 4000
  }[depth];

  return await callGemini(
    prompt,
    systemInstruction,
    0.7,
    maxTokens
  );
}

export async function generatePresentation(
  topic: string,
  slideCount: number = 5,
  style: string = "professional"
): Promise<{ title: string; slides: Array<{ title: string; content: string }> }> {
  const systemInstruction = `You are an expert presentation designer. Create engaging, well-structured presentation slides with clear titles and concise content. Style: ${style}. Return ONLY a JSON object with this exact structure: {"title": "Presentation Title", "slides": [{"title": "Slide Title", "content": "Slide content in bullet points"}]}`;
  
  const prompt = `Create a ${slideCount}-slide presentation on: "${topic}". Make it ${style} in tone. Each slide should have a clear title and 3-5 bullet points of content. Format as JSON only.`;

  try {
    const response = await callGemini(prompt, systemInstruction, 0.7, 2000);
    
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    }
    
    // Fallback: create simple structure
    const slides = [];
    for (let i = 1; i <= slideCount; i++) {
      slides.push({
        title: `Slide ${i}`,
        content: `• Key point 1\n• Key point 2\n• Key point 3`
      });
    }
    
    return {
      title: topic,
      slides
    };
  } catch (error) {
    console.error("Error parsing presentation JSON:", error);
    
    // Fallback structure
    const slides = [];
    for (let i = 1; i <= slideCount; i++) {
      slides.push({
        title: `Slide ${i}: ${topic}`,
        content: `• Key point about ${topic}\n• Supporting detail\n• Conclusion`
      });
    }
    
    return {
      title: topic,
      slides
    };
  }
}

