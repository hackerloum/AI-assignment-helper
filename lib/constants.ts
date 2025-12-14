export const CREDIT_COSTS = {
  essay: 10,
  paraphrase: 5,
  grammar: 3,
  citation: 2,
  summarizer: 4,
  powerpoint: 20,
  plagiarism: 3,
  humanize: 6,
  assignment_edit: 5, // Credits for significant content edits (>30% change)
  assignment_download: 3, // Credits for downloading edited assignments
} as const;

export const FREE_CREDITS_ON_SIGNUP = 50;

export const CREDIT_PACKAGES = [
  { credits: 100, price: 5000, label: "100 Credits - TZS 5,000" },
  { credits: 250, price: 10000, label: "250 Credits - TZS 10,000" },
  { credits: 500, price: 18000, label: "500 Credits - TZS 18,000" },
  { credits: 1000, price: 30000, label: "1,000 Credits - TZS 30,000" },
] as const;

export const TOOL_DESCRIPTIONS = {
  essay: {
    title: "Essay Writer",
    description: "Generate well-structured essays on any topic",
    icon: "📝",
  },
  paraphrase: {
    title: "Paraphrase Tool",
    description: "Rewrite text in your own words while maintaining meaning",
    icon: "✍️",
  },
  grammar: {
    title: "Grammar Checker",
    description: "Fix grammar, spelling, and punctuation errors",
    icon: "✓",
  },
  citation: {
    title: "Citation Generator",
    description: "Generate citations in APA, MLA, Chicago formats",
    icon: "📚",
  },
  summarizer: {
    title: "Text Summarizer",
    description: "Summarize long texts into concise summaries",
    icon: "📄",
  },
  powerpoint: {
    title: "PowerPoint Maker",
    description: "Create professional presentations with AI",
    icon: "📊",
  },
  humanize: {
    title: "Content Humanizer",
    description: "Transform AI-generated text into natural, human-written content",
    icon: "✨",
  },
} as const;

