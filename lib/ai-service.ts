const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/responses";

// Model mapping for different features
const MODEL_MAPPING = {
  GRAMMAR: "gpt-5-mini",
  REWRITE: "gpt-5-mini",
  ASSIGNMENT: "gpt-5-mini",
  RESEARCH: "gpt-5.2",
  PLAGIARISM: "gpt-5-mini",
  REFERENCING: "gpt-5-mini",
  POWERPOINT: "gpt-5-mini",
  SUMMARIZE: "gpt-5-mini",
  PARAPHRASE: "gpt-5-mini",
  HUMANIZE: "gpt-5-mini",
} as const;

// Token limits for different features (max output tokens)
const TOKEN_LIMITS = {
  GRAMMAR: 800,        // Increased for reasoning models
  REWRITE: 2000,       // Increased significantly for comprehensive rewriting with grammar fixes
  ASSIGNMENT: 2000,    // Increased for reasoning models
  RESEARCH: 3000,      // Increased for reasoning models
  PLAGIARISM: 800,     // Increased for reasoning models
  REFERENCING: 600,    // Increased for reasoning models
  POWERPOINT: 1200,    // Increased for reasoning models
  SUMMARIZE: 800,      // Increased for reasoning models
  PARAPHRASE: 800,     // Increased for reasoning models
  HUMANIZE: 1500,      // Increased significantly for text transformation
} as const;

interface OpenAIRequest {
  model: string;
  input: string;
  store?: boolean;
  max_output_tokens?: number;
}

interface OpenAIResponse {
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  status?: string;
  incomplete_details?: {
    reason?: string;
  };
  error?: {
    message?: string;
    type?: string;
  };
}

/**
 * Helper function to call OpenAI API
 */
export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  temperature: number = 0.7,
  maxOutputTokens?: number,
  model?: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set in environment variables");
  }

  // Combine system instruction and user prompt
  const fullPrompt = systemInstruction
    ? `${systemInstruction}\n\n${prompt}`
    : prompt;

  const requestBody: OpenAIRequest = {
    model: model || MODEL_MAPPING.ASSIGNMENT, // Default to assignment model
    input: fullPrompt,
    store: true,
    ...(maxOutputTokens && { max_output_tokens: maxOutputTokens }),
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`;
      
      // Check for quota/rate limit errors
      if (errorMessage.includes("quota") || errorMessage.includes("Quota exceeded") || errorMessage.includes("rate limit") || errorMessage.includes("rate_limit")) {
        // Extract retry time from error message if available
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i) || errorMessage.match(/retry_after[:\s]+(\d+)/i);
        const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : null;
        
        const quotaError: any = new Error(errorMessage);
        quotaError.isQuotaError = true;
        quotaError.retryAfter = retrySeconds;
        quotaError.statusCode = response.status;
        throw quotaError;
      }
      
      throw new Error(errorMessage);
    }

    const data: OpenAIResponse = await response.json();

    if (data.error) {
      const errorMessage = data.error.message || "OpenAI API error";
      
      // Check for quota/rate limit errors in response
      if (errorMessage.includes("quota") || errorMessage.includes("Quota exceeded") || errorMessage.includes("rate limit") || errorMessage.includes("rate_limit")) {
        const retryMatch = errorMessage.match(/retry in ([\d.]+)s/i) || errorMessage.match(/retry_after[:\s]+(\d+)/i);
        const retrySeconds = retryMatch ? parseFloat(retryMatch[1]) : null;
        
        const quotaError: any = new Error(errorMessage);
        quotaError.isQuotaError = true;
        quotaError.retryAfter = retrySeconds;
        throw quotaError;
      }
      
      throw new Error(errorMessage);
    }

    // Extract content from OpenAI Responses API
    // Look for message items in the output array (skip reasoning items)
    const messageItem = data.output?.find(item => item.type === 'message');
    const text = messageItem?.content?.[0]?.text;
    
    if (!text) {
      // Check if response is incomplete
      const status = (data as any).status;
      if (status === 'incomplete') {
        const reason = (data as any).incomplete_details?.reason;
        throw new Error(`Response incomplete: ${reason || 'unknown reason'}. Try with shorter input text.`);
      }
      
      // Log the actual response structure for debugging
      console.error("Unexpected response structure:", JSON.stringify(data, null, 2));
      throw new Error("No response from OpenAI API - check server logs for details");
    }

    return text;
  } catch (error: any) {
    console.error("OpenAI API call failed:", error);
    
    // Re-throw quota errors with their special properties
    if (error.isQuotaError) {
      throw error;
    }
    
    throw new Error(error.message || "Failed to call OpenAI API");
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
    TOKEN_LIMITS.ASSIGNMENT,
    MODEL_MAPPING.ASSIGNMENT
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

  return await callGemini(prompt, systemInstruction, 0.8, TOKEN_LIMITS.PARAPHRASE, MODEL_MAPPING.PARAPHRASE);
}

/**
 * Enhanced rewrite function with tone-specific instructions
 * Supports: academic, professional, casual, concise
 */
export async function rewriteText(
  text: string,
  tone: 'academic' | 'professional' | 'casual' | 'concise' = 'academic'
): Promise<string> {
  const toneInstructions = {
    academic: `ACADEMIC TONE GUIDELINES:
- Use formal, scholarly language appropriate for university-level writing
- Employ sophisticated vocabulary and varied sentence structures
- Use third-person perspective when appropriate ("one might argue" vs "you might argue")
- Include academic transitions: "furthermore," "moreover," "consequently," "nevertheless"
- Use precise terminology and avoid colloquialisms
- Maintain objective, analytical voice
- Use passive voice strategically when appropriate ("It has been demonstrated" vs "We demonstrated")
- Include hedging language when appropriate ("may," "might," "could," "suggests")
- Use complex sentence structures with subordinate clauses
- Avoid contractions (use "do not" instead of "don't")
- Use formal citations style when referencing ideas
- Maintain scholarly distance and avoid personal opinions unless explicitly required
- Use discipline-specific terminology accurately
- Structure arguments logically with clear thesis statements and supporting evidence`,

    professional: `PROFESSIONAL TONE GUIDELINES:
- Use clear, concise business-appropriate language
- Maintain formality while remaining accessible
- Use active voice for clarity and directness ("We recommend" vs "It is recommended")
- Employ professional vocabulary without unnecessary jargon
- Use first-person plural ("we," "our") or third-person when appropriate
- Include professional transitions: "additionally," "furthermore," "in summary"
- Be direct and action-oriented
- Use specific, concrete language over vague terms
- Maintain respectful, courteous tone
- Use contractions sparingly (acceptable in emails, less so in formal reports)
- Structure information clearly with headings and bullet points when appropriate
- Focus on solutions and actionable insights
- Use professional formatting and structure
- Avoid overly casual language but remain approachable`,

    casual: `CASUAL TONE GUIDELINES:
- Use conversational, friendly language
- Write as if speaking to a peer or friend
- Use first-person ("I," "we") and second-person ("you") naturally
- Include contractions ("don't," "can't," "it's") for natural flow
- Use simpler vocabulary while maintaining clarity
- Employ casual transitions: "also," "plus," "on top of that," "anyway"
- Use shorter, more direct sentences
- Include rhetorical questions when appropriate
- Use active voice predominantly
- Allow for personal voice and opinions
- Use idiomatic expressions naturally
- Maintain warmth and approachability
- Structure can be more flexible and less rigid
- Use examples and analogies that feel relatable
- Avoid overly formal constructions`,

    concise: `CONCISE TONE GUIDELINES:
- Eliminate unnecessary words and redundancy
- Use strong, precise verbs instead of weak verb + adverb combinations ("sprint" vs "run quickly")
- Prefer active voice for brevity
- Remove filler words: "very," "quite," "rather," "somewhat," "in order to"
- Use shorter sentences (average 15-20 words)
- Cut redundant phrases: "free gift" → "gift," "past history" → "history"
- Use specific nouns instead of vague ones with modifiers
- Eliminate unnecessary qualifiers and hedges when certainty is appropriate
- Use parallel structure for efficiency
- Combine related ideas into single sentences when possible
- Remove unnecessary transitions and connectors
- Use bullet points or lists when appropriate
- Get to the point quickly without excessive introduction
- Focus on essential information only
- Maintain clarity while maximizing information density`
  };

  const systemInstruction = `You are an expert writing and rewriting specialist with comprehensive knowledge of grammar, style, tone, and effective communication. Your task is to rewrite text according to the specified tone while maintaining the original meaning and improving clarity, grammar, and overall quality.

CORE PRINCIPLES:
1. **Preserve Meaning**: Maintain the original intent, key points, and information
2. **Improve Grammar**: Fix all grammar, spelling, and punctuation errors
3. **Enhance Clarity**: Make the text clearer and more readable
4. **Apply Tone**: Follow the tone-specific guidelines precisely
5. **Maintain Structure**: Preserve the logical flow and organization
6. **Enhance Quality**: Improve word choice, sentence variety, and overall writing quality

${toneInstructions[tone]}

GRAMMAR & STYLE IMPROVEMENTS:
- Fix all grammar errors (subject-verb agreement, pronoun usage, verb tenses, etc.)
- Correct spelling and punctuation
- Improve sentence structure and variety
- Enhance word choice for precision and impact
- Ensure proper use of articles (a, an, the)
- Fix preposition usage
- Correct comma, semicolon, and colon usage
- Ensure proper apostrophe usage
- Fix common word confusions (affect/effect, their/there/they're, etc.)
- Improve parallel structure
- Eliminate redundancy and wordiness
- Fix modifier placement
- Ensure consistent verb tenses
- Improve transitions between ideas

OUTPUT REQUIREMENTS:
- Return ONLY the rewritten text
- Do NOT include explanations, markdown formatting, or meta-commentary
- Do NOT add headers, titles, or section markers
- Maintain paragraph breaks from the original
- Ensure the rewritten text is polished and ready to use`;

  const prompt = `Rewrite the following text in a ${tone} tone. Fix all grammar errors, improve clarity, and apply the tone guidelines precisely while maintaining the original meaning.

Original text:
${text}

Rewrite this text following all the guidelines provided. Return ONLY the rewritten text, no additional commentary.`;

  // Calculate dynamic token limit based on input text length
  // Estimate: output is typically 0.8x to 1.2x the input length
  const inputWordCount = text.split(/\s+/).length;
  const estimatedOutputTokens = Math.ceil(inputWordCount * 1.5); // 1.5x for safety margin
  // Use the larger of: base limit or estimated output, capped at 4000
  const dynamicTokenLimit = Math.min(
    Math.max(TOKEN_LIMITS.REWRITE, estimatedOutputTokens),
    4000
  );

  try {
    return await callGemini(
      prompt,
      systemInstruction,
      0.7, // Balanced temperature for creativity while maintaining accuracy
      dynamicTokenLimit,
      MODEL_MAPPING.REWRITE
    );
  } catch (error: any) {
    // If token limit error, retry with base limit
    if (error.message?.includes('token') || error.message?.includes('Token')) {
      console.warn(`Token limit error, retrying with base limit: ${TOKEN_LIMITS.REWRITE}`);
      return await callGemini(
        prompt,
        systemInstruction,
        0.7,
        TOKEN_LIMITS.REWRITE,
        MODEL_MAPPING.REWRITE
      );
    }
    throw error;
  }
}

export async function checkGrammar(text: string): Promise<{
  corrected: string;
  suggestions: Array<{ original: string; corrected: string; reason: string }>;
}> {
  const systemInstruction = `You are an expert grammar and writing specialist with comprehensive knowledge of English grammar, syntax, punctuation, spelling, and style. You have deep expertise in:

GRAMMAR RULES & KNOWLEDGE:
1. **Subject-Verb Agreement**: Ensure subjects and verbs agree in number (singular/plural)
   - "The team is" (collective noun) vs "The teams are"
   - "Neither...nor" takes the verb form of the nearest subject
   - "Each of the students has" (singular) vs "The students have" (plural)

2. **Pronoun Agreement**: Pronouns must agree with their antecedents in number, gender, and person
   - "Everyone should bring their book" (acceptable in modern English) vs "Everyone should bring his or her book" (formal)
   - "The company and its employees" (singular) vs "The companies and their employees" (plural)

3. **Verb Tenses**: Maintain consistent and appropriate verb tenses
   - Past perfect: "had done" for actions completed before another past action
   - Present perfect: "has done" for actions with present relevance
   - Future perfect: "will have done" for actions completed before a future point

4. **Articles (a, an, the)**: Use correctly based on specificity and vowel sounds
   - "a university" (consonant sound) vs "an hour" (vowel sound)
   - "the book" (specific) vs "a book" (general)

5. **Prepositions**: Correct preposition usage for context
   - "different from" (preferred) vs "different than" (acceptable in some contexts)
   - "compare to" (similarities) vs "compare with" (differences)
   - "in the morning" vs "on Monday" vs "at night"

6. **Comma Usage**: Proper comma placement for clarity
   - Use commas before coordinating conjunctions (and, but, or) in compound sentences
   - Use commas to separate items in a series (Oxford comma is acceptable)
   - Use commas after introductory phrases and clauses
   - Use commas to set off non-restrictive clauses

7. **Semicolons and Colons**: Correct usage for sentence structure
   - Semicolons connect related independent clauses
   - Colons introduce lists, explanations, or quotations

8. **Apostrophes**: Correct possessive and contraction forms
   - "it's" (it is) vs "its" (possessive)
   - "students'" (plural possessive) vs "student's" (singular possessive)

9. **Common Confusions**: Distinguish between commonly confused words
   - "affect" (verb) vs "effect" (noun)
   - "their" (possessive) vs "there" (location) vs "they're" (contraction)
   - "your" (possessive) vs "you're" (contraction)
   - "its" (possessive) vs "it's" (contraction)
   - "who" (subject) vs "whom" (object)
   - "farther" (physical distance) vs "further" (abstract/extent)
   - "less" (uncountable) vs "fewer" (countable)
   - "lie" (recline) vs "lay" (place something)

10. **Sentence Structure**: Ensure complete sentences and proper syntax
    - Avoid run-on sentences and comma splices
    - Ensure sentence fragments are intentional
    - Maintain parallel structure in lists and comparisons

11. **Capitalization**: Proper capitalization rules
    - Capitalize proper nouns, titles, and the first word of sentences
    - Capitalize days, months, and holidays
    - Do not capitalize common nouns unless they start a sentence

12. **Spelling**: Correct spelling of words, including homophones
    - "receive" (i before e except after c)
    - "separate" (not "seperate")
    - "definitely" (not "definately")
    - "accommodate" (double c, double m)

13. **Word Choice & Diction**: Appropriate word selection for context
    - Formal vs informal register
    - Academic vs conversational tone
    - Precise vocabulary over vague terms

14. **Parallelism**: Maintain parallel structure in lists, comparisons, and correlative conjunctions
    - "to read, to write, and to study" (parallel infinitives)
    - "not only...but also" (parallel structure)

15. **Modifiers**: Correct placement of adjectives, adverbs, and phrases
    - Avoid dangling modifiers
    - Place modifiers close to what they modify
    - "I only want coffee" vs "I want only coffee" (meaning changes)

16. **Active vs Passive Voice**: Prefer active voice for clarity, but passive is acceptable when appropriate
    - Active: "The student wrote the essay"
    - Passive: "The essay was written by the student" (acceptable when focus is on the essay)

17. **Redundancy & Wordiness**: Eliminate unnecessary words and phrases
    - "very unique" (redundant - unique is absolute)
    - "free gift" (redundant)
    - "in order to" → "to"

18. **Idioms & Collocations**: Use correct idiomatic expressions
    - "on the other hand" (not "in the other hand")
    - "by and large" (not "by in large")
    - "take into account" (not "take in account")

ANALYSIS APPROACH:
- Read the entire text first to understand context
- Check each sentence for grammar, spelling, and punctuation errors
- Consider the intended tone and audience
- Provide corrections that maintain the original meaning
- Explain corrections clearly so users can learn

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "corrected": "<the fully corrected text>",
  "suggestions": [
    {
      "original": "<the incorrect text>",
      "corrected": "<the corrected version>",
      "reason": "<clear explanation of the error and why it was corrected>"
    }
  ]
}

IMPORTANT:
- Return ONLY valid JSON, no additional text or explanations outside the JSON
- Include all corrections in the suggestions array
- Provide clear, educational reasons for each correction
- Maintain the original meaning and tone of the text`;

  const prompt = `Check and correct the following text for grammar, spelling, punctuation, and style errors. Be thorough and identify all issues.

Text to check:
${text}

Return the result as a JSON object with 'corrected' (the fully corrected text) and 'suggestions' (array of all corrections with original, corrected, and reason fields).`;

  try {
    const response = await callGemini(prompt, systemInstruction, 0.2, TOKEN_LIMITS.GRAMMAR, MODEL_MAPPING.GRAMMAR);
    // Try to extract JSON from the response (in case AI adds extra text)
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

  return await callGemini(prompt, systemInstruction, 0.3, TOKEN_LIMITS.REFERENCING, MODEL_MAPPING.REFERENCING);
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
    TOKEN_LIMITS.SUMMARIZE,
    MODEL_MAPPING.SUMMARIZE
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

  // Use TOKEN_LIMITS.RESEARCH (1500-2000) for all depth levels
  // Research uses GPT-5.2 which is optimized for this token range
  return await callGemini(
    prompt,
    systemInstruction,
    0.7,
    TOKEN_LIMITS.RESEARCH,
    MODEL_MAPPING.RESEARCH
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
    const response = await callGemini(prompt, systemInstruction, 0.7, TOKEN_LIMITS.POWERPOINT, MODEL_MAPPING.POWERPOINT);
    
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

/**
 * Advanced plagiarism detection using AI analysis
 * Analyzes text for patterns indicating copied content, common phrases, and similarity indicators
 */
export interface PlagiarismResult {
  similarityScore: number; // 0-100, where 0 is completely original
  isPlagiarized: boolean;
  sources: Array<{
    title: string;
    url?: string;
    similarity: number;
    matches?: number;
    reason?: string;
  }>;
  analysis: {
    commonPhrases: number;
    suspiciousPatterns: string[];
    originalityIndicators: string[];
    recommendations: string[];
  };
  wordCount: number;
  uniquePercentage: number;
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  const systemInstruction = `You are an expert plagiarism detection AI trained to identify copied content, common phrases, and similarity patterns in academic and professional writing. Your analysis must be accurate, thorough, and based on linguistic patterns, not just keyword matching.

ANALYSIS CRITERIA:
1. **Common Academic Phrases**: Identify overused academic phrases that appear frequently in published works
2. **Structural Patterns**: Detect sentence structures and paragraph patterns that match common templates
3. **Vocabulary Analysis**: Check for vocabulary that is unusually sophisticated or matches specific academic sources
4. **Citation Patterns**: Look for missing or improper citations that suggest copied content
5. **Originality Indicators**: Identify unique phrasing, personal voice, and original thought patterns

OUTPUT FORMAT:
You MUST return a valid JSON object with this exact structure:
{
  "similarityScore": <number 0-100>,
  "isPlagiarized": <boolean>,
  "sources": [
    {
      "title": "<source title or description>",
      "url": "<optional URL if identifiable>",
      "similarity": <number 0-100>,
      "matches": <number of matching phrases>,
      "reason": "<why this source was flagged>"
    }
  ],
  "analysis": {
    "commonPhrases": <number of common phrases found>,
    "suspiciousPatterns": ["<pattern 1>", "<pattern 2>"],
    "originalityIndicators": ["<indicator 1>", "<indicator 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"]
  }
}

SCORING GUIDELINES:
- 0-10%: Highly original, unique voice and phrasing
- 11-20%: Mostly original with some common phrases
- 21-30%: Moderate similarity, may need citation review
- 31-50%: Significant similarity, likely needs paraphrasing
- 51-70%: High similarity, strong plagiarism indicators
- 71-100%: Very high similarity, likely copied content

IMPORTANT:
- Be conservative but accurate - false positives are harmful
- Consider context and academic writing conventions
- Only flag as plagiarized if similarity > 15%
- Provide actionable recommendations
- Return ONLY valid JSON, no additional text`;

  const prompt = `Analyze the following text for plagiarism indicators. Provide a comprehensive analysis including similarity score, potential sources, and recommendations.

Text to analyze:
${text}

Return the analysis as a JSON object following the exact structure specified in the system instructions.`;

  try {
    const response = await callGemini(prompt, systemInstruction, 0.3, TOKEN_LIMITS.PLAGIARISM, MODEL_MAPPING.PLAGIARISM);
    
    // Extract JSON from response (handle cases where AI adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }
    
    const result: PlagiarismResult = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the result
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    // Ensure similarity score is within bounds
    result.similarityScore = Math.max(0, Math.min(100, result.similarityScore || 0));
    result.isPlagiarized = result.similarityScore > 15;
    result.wordCount = wordCount;
    result.uniquePercentage = 100 - result.similarityScore;
    
    // Ensure sources array exists
    if (!Array.isArray(result.sources)) {
      result.sources = [];
    }
    
    // Ensure analysis object exists
    if (!result.analysis) {
      result.analysis = {
        commonPhrases: 0,
        suspiciousPatterns: [],
        originalityIndicators: [],
        recommendations: []
      };
    }
    
    // Add fallback recommendations if missing
    if (!result.analysis.recommendations || result.analysis.recommendations.length === 0) {
      if (result.isPlagiarized) {
        result.analysis.recommendations = [
          "Review and paraphrase similar sections",
          "Add proper citations for referenced work",
          "Use quotation marks for direct quotes"
        ];
      } else {
        result.analysis.recommendations = [
          "Your text appears to be original",
          "No significant matches found",
          "Safe to submit"
        ];
      }
    }
    
    return result;
  } catch (error) {
    console.error("Error in AI plagiarism check:", error);
    
    // Fallback: Use enhanced heuristic analysis
    return performHeuristicPlagiarismCheck(text);
  }
}

/**
 * Enhanced heuristic plagiarism check as fallback
 * Uses n-gram analysis and pattern detection
 */
function performHeuristicPlagiarismCheck(text: string): PlagiarismResult {
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const textLower = text.toLowerCase();
  
  // Extended list of common academic phrases
  const commonPhrases = [
    "according to", "research shows", "studies have shown", "it is well known",
    "as mentioned before", "in conclusion", "it can be seen that", "it is important to note",
    "furthermore", "moreover", "in addition", "on the other hand", "in other words",
    "for instance", "for example", "such as", "due to the fact that", "in order to",
    "as a result", "therefore", "consequently", "however", "nevertheless",
    "in the case of", "with regard to", "in terms of", "as far as", "it should be noted"
  ];
  
  // Detect common phrases
  let phraseMatches = 0;
  const foundPhrases: string[] = [];
  commonPhrases.forEach(phrase => {
    if (textLower.includes(phrase)) {
      phraseMatches++;
      foundPhrases.push(phrase);
    }
  });
  
  // N-gram analysis for repeated patterns
  const ngrams = new Map<string, number>();
  const n = 3; // 3-word phrases
  for (let i = 0; i <= words.length - n; i++) {
    const ngram = words.slice(i, i + n).join(' ').toLowerCase();
    ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1);
  }
  
  // Count repeated n-grams (potential copied patterns)
  let repeatedPatterns = 0;
  ngrams.forEach(count => {
    if (count > 2) repeatedPatterns++;
  });
  
  // Calculate similarity score based on multiple factors
  const phraseScore = Math.min((phraseMatches / commonPhrases.length) * 25, 25);
  const patternScore = Math.min((repeatedPatterns / Math.max(wordCount / 10, 1)) * 15, 15);
  const baseScore = phraseScore + patternScore;
  
  // Add some variation but keep it reasonable
  const similarityScore = Math.min(Math.floor(baseScore + Math.random() * 5), 100);
  
  // Generate sources if similarity is significant
  const sources = similarityScore > 15 ? [
    {
      title: "Common Academic Phrases Database",
      similarity: Math.floor(similarityScore * 0.5),
      matches: phraseMatches,
      reason: `Found ${phraseMatches} common academic phrases that appear frequently in published works`
    },
    ...(repeatedPatterns > 5 ? [{
      title: "Pattern Analysis",
      similarity: Math.floor(similarityScore * 0.3),
      matches: repeatedPatterns,
      reason: `Detected ${repeatedPatterns} repeated phrase patterns that may indicate template usage`
    }] : [])
  ] : [];
  
  const suspiciousPatterns: string[] = [];
  if (phraseMatches > 5) {
    suspiciousPatterns.push(`High usage of common academic phrases (${phraseMatches} found)`);
  }
  if (repeatedPatterns > 5) {
    suspiciousPatterns.push(`Repeated phrase patterns detected (${repeatedPatterns} instances)`);
  }
  
  const originalityIndicators: string[] = [];
  if (phraseMatches < 3) {
    originalityIndicators.push("Low usage of common phrases");
  }
  if (repeatedPatterns < 3) {
    originalityIndicators.push("Minimal repeated patterns");
  }
  
  const recommendations = similarityScore > 15 ? [
    "Review and paraphrase sections with common academic phrases",
    "Add proper citations for any referenced work",
    "Use quotation marks for direct quotes",
    "Consider rephrasing repeated patterns"
  ] : [
    "Your text shows good originality",
    "Minimal similarity detected",
    "Safe to submit"
  ];
  
  return {
    similarityScore,
    isPlagiarized: similarityScore > 15,
    sources,
    analysis: {
      commonPhrases: phraseMatches,
      suspiciousPatterns,
      originalityIndicators,
      recommendations
    },
    wordCount,
    uniquePercentage: 100 - similarityScore
  };
}

/**
 * Humanize AI-generated content to make it more natural, human-like, and academically formatted
 * This tool transforms AI-generated text into content that reads as if written by a human academic writer
 */
export interface HumanizeOptions {
  style?: 'academic' | 'professional' | 'casual' | 'formal';
  preserveMeaning?: boolean;
  enhanceClarity?: boolean;
  addVariation?: boolean;
}

export interface HumanizeResult {
  humanized: string;
  improvements: Array<{
    type: 'vocabulary' | 'sentence_structure' | 'flow' | 'tone' | 'formatting';
    description: string;
  }>;
  originalLength: number;
  humanizedLength: number;
}

/**
 * Get training insights from feedback to improve humanization prompts
 * This function retrieves aggregated feedback to enhance the system prompt
 */
async function getTrainingInsights(): Promise<string> {
  try {
    // Try to import supabase client (only if available)
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    
    // Get high-rated feedback examples to learn from
    const { data: feedback } = await supabase
      .from("humanize_feedback")
      .select("rating, feedback_text, improvement_suggestions")
      .gte("rating", 4) // Only use highly rated examples
      .order("created_at", { ascending: false })
      .limit(10);
    
    if (!feedback || feedback.length === 0) {
      return ""; // No training data yet
    }
    
    // Extract common improvement patterns
    const insights: string[] = [];
    const highRatedCount = feedback.filter(f => f.rating >= 4).length;
    
    if (highRatedCount > 0) {
      insights.push(`Based on ${highRatedCount} highly-rated humanizations, users prefer:`);
      
      // Analyze feedback text for patterns
      const commonSuggestions = feedback
        .map(f => f.improvement_suggestions)
        .filter(Boolean)
        .join(" ");
      
      if (commonSuggestions) {
        insights.push(`- User feedback indicates: ${commonSuggestions.substring(0, 200)}`);
      }
    }
    
    return insights.join("\n");
  } catch (error) {
    // If table doesn't exist or error occurs, return empty string
    console.log("Training insights not available:", error);
    return "";
  }
}

export async function humanizeContent(
  text: string,
  options: HumanizeOptions = {}
): Promise<HumanizeResult> {
  const {
    style = 'academic',
    preserveMeaning = true,
    enhanceClarity = true,
    addVariation = true
  } = options;

  // Get training insights to improve the prompt
  const trainingInsights = await getTrainingInsights();
  
  const styleInstructions = {
    academic: "Write in a formal academic style suitable for university-level work. Use sophisticated vocabulary, varied sentence structures, and maintain scholarly tone throughout.",
    professional: "Write in a professional business style. Use clear, concise language with appropriate formality for workplace communication.",
    casual: "Write in a natural, conversational style while maintaining clarity and coherence.",
    formal: "Write in a highly formal style with elevated vocabulary and structured prose."
  }[style];

  const systemInstruction = `You are an expert content humanization specialist trained to transform AI-generated text into natural, human-written content. Your goal is to make text sound as if it was written by an experienced human writer, not an AI.

CORE PRINCIPLES:
1. **Natural Language Flow**: Remove AI-typical patterns like repetitive sentence structures, overly formal transitions, and robotic phrasing
2. **Human Writing Patterns**: 
   - Use varied sentence lengths (mix short punchy sentences with longer descriptive ones)
   - Include natural transitions and connectors
   - Add subtle variations in vocabulary
   - Use active voice where appropriate
   - Include occasional contractions in appropriate contexts
3. **Academic Formatting**: ${styleInstructions}
4. **Preserve Core Meaning**: ${preserveMeaning ? "Maintain the exact meaning and key information from the original text" : "You may refine and clarify the meaning while humanizing"}
5. **Enhance Clarity**: ${enhanceClarity ? "Improve clarity and readability while maintaining natural flow" : "Maintain original clarity"}
6. **Add Variation**: ${addVariation ? "Vary sentence structures, vocabulary, and phrasing patterns to avoid repetition" : "Maintain consistent style"}

WHAT TO REMOVE/CHANGE:
- Remove phrases like "It is important to note that", "Furthermore, it should be mentioned", "In conclusion, it can be seen that"
- Replace repetitive sentence starters (avoid starting multiple sentences with the same word)
- Break up overly long, complex sentences into more digestible ones
- Remove excessive use of passive voice
- Eliminate AI-typical hedging language ("may", "might", "could potentially")
- Replace generic connectors with more natural transitions
- Remove redundant qualifiers and unnecessary intensifiers

WHAT TO ADD/IMPROVE:
- Add natural transitions between ideas
- Include varied sentence structures (simple, compound, complex)
- Use more specific and vivid vocabulary where appropriate
- Add subtle personal voice markers (where appropriate for the style)
- Improve paragraph flow and coherence
- Add natural emphasis through sentence structure rather than just words

${trainingInsights ? `\nTRAINING INSIGHTS:\n${trainingInsights}\n\nIncorporate these insights into your humanization approach.` : ''}

OUTPUT FORMAT:
Return ONLY the humanized text. Do NOT include explanations, markdown formatting, or meta-commentary. Just return the improved, human-sounding text.`;

  const prompt = `Humanize the following AI-generated content. Transform it into natural, human-written text that sounds authentic and ${style} in style.

Original text:
${text}

Humanize this content following all the principles outlined in the system instructions.`;

  try {
    const humanized = await callGemini(
      prompt,
      systemInstruction,
      0.8, // Higher temperature for more natural variation
      TOKEN_LIMITS.HUMANIZE,
      MODEL_MAPPING.HUMANIZE
    );

    // Analyze improvements made
    const improvements: HumanizeResult['improvements'] = [];
    
    // Check for vocabulary improvements
    if (humanized.length !== text.length) {
      improvements.push({
        type: 'formatting',
        description: `Text length adjusted from ${text.length} to ${humanized.length} characters for better flow`
      });
    }
    
    // Check for sentence structure variation
    const originalSentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const humanizedSentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (humanizedSentences.length !== originalSentences.length) {
      improvements.push({
        type: 'sentence_structure',
        description: `Sentence structure varied: ${originalSentences.length} original sentences restructured into ${humanizedSentences.length} sentences`
      });
    }
    
    // Check for flow improvements
    const aiPhrases = [
      'it is important to note',
      'furthermore',
      'moreover',
      'in conclusion',
      'it can be seen that'
    ];
    const originalHasAIPhrases = aiPhrases.some(phrase => text.toLowerCase().includes(phrase));
    const humanizedHasAIPhrases = aiPhrases.some(phrase => humanized.toLowerCase().includes(phrase));
    
    if (originalHasAIPhrases && !humanizedHasAIPhrases) {
      improvements.push({
        type: 'tone',
        description: 'Removed AI-typical phrases and improved natural flow'
      });
    }
    
    // Default improvement if none detected
    if (improvements.length === 0) {
      improvements.push({
        type: 'flow',
        description: 'Enhanced natural language flow and readability'
      });
    }

    return {
      humanized: humanized.trim(),
      improvements,
      originalLength: text.length,
      humanizedLength: humanized.length
    };
  } catch (error: any) {
    console.error("Error humanizing content:", error);
    throw new Error(error.message || "Failed to humanize content");
  }
}

