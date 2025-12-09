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
async function callGemini(
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
      throw new Error(
        errorData.error?.message ||
          `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Gemini API error");
    }

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Error: No response from Gemini API";

    return text;
  } catch (error: any) {
    console.error("Gemini API call failed:", error);
    throw new Error(error.message || "Failed to call Gemini API");
  }
}

export async function generateEssay(
  topic: string,
  wordCount: number = 500
): Promise<string> {
  const systemInstruction =
    "You are an expert academic writer. Write well-structured, academic essays with proper introduction, body paragraphs, and conclusion.";
  const prompt = `Write a ${wordCount}-word essay on the topic: "${topic}". Ensure it has a clear thesis statement, well-developed arguments, and a strong conclusion.`;

  return await callGemini(
    prompt,
    systemInstruction,
    0.7,
    Math.floor(wordCount * 1.5)
  );
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

export async function generateResearch(query: string): Promise<string> {
  const systemInstruction =
    "You are an expert research assistant. Provide comprehensive, well-researched answers to research questions. Structure your response with clear sections, use evidence-based information, and cite key points when relevant. Be thorough but concise, and ensure accuracy.";
  const prompt = `Answer the following research question comprehensively:\n\n${query}\n\nProvide a detailed, well-structured answer that covers the main aspects of the topic.`;

  return await callGemini(
    prompt,
    systemInstruction,
    0.7,
    2000 // Allow for longer research responses
  );
}

