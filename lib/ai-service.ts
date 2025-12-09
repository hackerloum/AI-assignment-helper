import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEssay(
  topic: string,
  wordCount: number = 500
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are an expert academic writer. Write well-structured, academic essays with proper introduction, body paragraphs, and conclusion.",
      },
      {
        role: "user",
        content: `Write a ${wordCount}-word essay on the topic: "${topic}". Ensure it has a clear thesis statement, well-developed arguments, and a strong conclusion.`,
      },
    ],
    temperature: 0.7,
    max_tokens: Math.floor(wordCount * 1.5),
  });

  return response.choices[0]?.message?.content || "Error generating essay";
}

export async function paraphraseText(text: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a paraphrasing expert. Rewrite the given text in your own words while maintaining the original meaning and academic tone.",
      },
      {
        role: "user",
        content: `Paraphrase the following text while maintaining its meaning:\n\n${text}`,
      },
    ],
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || "Error paraphrasing text";
}

export async function checkGrammar(text: string): Promise<{
  corrected: string;
  suggestions: Array<{ original: string; corrected: string; reason: string }>;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a grammar and writing expert. Check the text for grammar, spelling, and punctuation errors. Return a JSON object with 'corrected' (the corrected text) and 'suggestions' (array of corrections with original, corrected, and reason fields).",
      },
      {
        role: "user",
        content: `Check and correct the following text:\n\n${text}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  try {
    const result = JSON.parse(response.choices[0]?.message?.content || "{}");
    return {
      corrected: result.corrected || text,
      suggestions: result.suggestions || [],
    };
  } catch {
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

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `You are a citation expert. Generate accurate citations in ${format} format.`,
      },
      {
        role: "user",
        content: `Generate a ${format} citation for:\nTitle: ${source.title}\n${source.author ? `Author: ${source.author}\n` : ""}${source.year ? `Year: ${source.year}\n` : ""}${source.url ? `URL: ${source.url}\n` : ""}${source.publisher ? `Publisher: ${source.publisher}\n` : ""}\n\n${formatInstructions[format]}`,
      },
    ],
    temperature: 0.3,
  });

  return response.choices[0]?.message?.content || "Error generating citation";
}

export async function summarizeText(
  text: string,
  maxLength: number = 200
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content:
          "You are a summarization expert. Create concise, accurate summaries that capture the main points and key information.",
      },
      {
        role: "user",
        content: `Summarize the following text in approximately ${maxLength} words:\n\n${text}`,
      },
    ],
    temperature: 0.5,
    max_tokens: Math.floor(maxLength * 1.5),
  });

  return response.choices[0]?.message?.content || "Error summarizing text";
}

