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
import { generateEssay } from "@/app/actions/ai-actions";
import { Loader2 } from "lucide-react";

const essaySchema = z.object({
  topic: z.string().min(10, "Topic must be at least 10 characters"),
  wordCount: z.number().min(200).max(5000),
});

type EssayFormData = z.infer<typeof essaySchema>;

export default function EssayWriter() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EssayFormData>({
    resolver: zodResolver(essaySchema),
    defaultValues: {
      wordCount: 500,
    },
  });

  const onSubmit = async (data: EssayFormData) => {
    setLoading(true);
    setResult("");
    try {
      const response = await generateEssay(data.topic, data.wordCount);
      if (response.success && response.content) {
        setResult(response.content);
        toast.success("Essay generated successfully!");
      } else {
        toast.error(response.error || "Failed to generate essay");
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
          <CardTitle>📝 Essay Writer</CardTitle>
          <CardDescription>
            Generate well-structured essays on any topic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Essay Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., The impact of technology on education"
                {...register("topic")}
              />
              {errors.topic && (
                <p className="text-sm text-destructive">{errors.topic.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordCount">Word Count</Label>
              <Input
                id="wordCount"
                type="number"
                min={200}
                max={5000}
                {...register("wordCount", { valueAsNumber: true })}
              />
              {errors.wordCount && (
                <p className="text-sm text-destructive">
                  {errors.wordCount.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Essay"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6">
              <Label>Generated Essay</Label>
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
                Copy Essay
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

