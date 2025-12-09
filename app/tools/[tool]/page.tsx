import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { TOOL_DESCRIPTIONS } from "@/lib/constants";
import EssayWriter from "@/components/tools/essay-writer";
import ParaphraseTool from "@/components/tools/paraphrase-tool";
import GrammarChecker from "@/components/tools/grammar-checker";
import CitationGenerator from "@/components/tools/citation-generator";
import TextSummarizer from "@/components/tools/text-summarizer";

const toolComponents = {
  essay: EssayWriter,
  paraphrase: ParaphraseTool,
  grammar: GrammarChecker,
  citation: CitationGenerator,
  summarizer: TextSummarizer,
};

export default async function ToolPage({
  params,
}: {
  params: Promise<{ tool: string }>;
}) {
  const { tool } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  if (!(tool in TOOL_DESCRIPTIONS)) {
    redirect("/");
  }

  const ToolComponent = toolComponents[tool as keyof typeof toolComponents];

  if (!ToolComponent) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-primary hover:underline text-sm inline-flex items-center"
          >
            ← Back to Dashboard
          </Link>
        </div>
        <ToolComponent />
      </div>
    </div>
  );
}

