"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { summarizeText } from "@/app/actions/ai-actions";
import { Loader2 } from "lucide-react";

const summarizerSchema = z.object({
  text: z.string().min(50, "Text must be at least 50 characters"),
  maxLength: z.number().min(50).max(1000),
});

type SummarizerFormData = z.infer<typeof summarizerSchema>;

export default function TextSummarizer() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SummarizerFormData>({
    resolver: zodResolver(summarizerSchema),
    defaultValues: {
      maxLength: 200,
    },
  });

  const onSubmit = async (data: SummarizerFormData) => {
    setLoading(true);
    setResult("");
    try {
      const response = await summarizeText(data.text, data.maxLength);
      if (response.success && response.content) {
        setResult(response.content);
        toast.success("Text summarized successfully!");
      } else {
        toast.error(response.error || "Failed to summarize text");
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
          <CardTitle>📄 Text Summarizer</CardTitle>
          <CardDescription>
            Summarize long texts into concise summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to Summarize</Label>
              <Textarea
                id="text"
                placeholder="Enter the text you want to summarize..."
                rows={10}
                {...register("text")}
              />
              {errors.text && (
                <p className="text-sm text-destructive">{errors.text.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLength">Maximum Summary Length (words)</Label>
              <Input
                id="maxLength"
                type="number"
                min={50}
                max={1000}
                {...register("maxLength", { valueAsNumber: true })}
              />
              {errors.maxLength && (
                <p className="text-sm text-destructive">
                  {errors.maxLength.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Summarizing...
                </>
              ) : (
                "Summarize Text"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6">
              <Label>Summary</Label>
              <div className="mt-2 rounded-md border bg-white p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm">
                  {result}
                </pre>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success("Copied to clipboard!");
                }}
              >
                Copy Summary
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

