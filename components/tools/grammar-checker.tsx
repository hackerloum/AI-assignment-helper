"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { checkGrammar } from "@/app/actions/ai-actions";
import { Loader2 } from "lucide-react";

const grammarSchema = z.object({
  text: z.string().min(10, "Text must be at least 10 characters"),
});

type GrammarFormData = z.infer<typeof grammarSchema>;

export default function GrammarChecker() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    corrected: string;
    suggestions: Array<{ original: string; corrected: string; reason: string }>;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GrammarFormData>({
    resolver: zodResolver(grammarSchema),
  });

  const onSubmit = async (data: GrammarFormData) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await checkGrammar(data.text);
      if (response.success && response.result) {
        setResult(response.result);
        toast.success("Grammar check completed!");
      } else {
        toast.error(response.error || "Failed to check grammar");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>✓ Grammar Checker</CardTitle>
          <CardDescription>
            Fix grammar, spelling, and punctuation errors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to Check</Label>
              <Textarea
                id="text"
                placeholder="Enter the text you want to check..."
                rows={8}
                {...register("text")}
              />
              {errors.text && (
                <p className="text-sm text-destructive">{errors.text.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                "Check Grammar"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6 space-y-4">
              <div>
                <Label>Corrected Text</Label>
                <div className="mt-2 rounded-md border bg-white p-4">
                  <pre className="whitespace-pre-wrap font-sans text-sm">
                    {result.corrected}
                  </pre>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    navigator.clipboard.writeText(result.corrected);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  Copy Corrected Text
                </Button>
              </div>

              {result.suggestions.length > 0 && (
                <div>
                  <Label>Suggestions</Label>
                  <div className="mt-2 space-y-2">
                    {result.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="rounded-md border bg-white p-3 text-sm"
                      >
                        <div className="font-semibold">
                          &ldquo;{suggestion.original}&rdquo; → &ldquo;{suggestion.corrected}&rdquo;
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {suggestion.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

