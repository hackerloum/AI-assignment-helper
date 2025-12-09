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
import { paraphraseText } from "@/app/actions/ai-actions";
import { Loader2 } from "lucide-react";

const paraphraseSchema = z.object({
  text: z.string().min(20, "Text must be at least 20 characters"),
});

type ParaphraseFormData = z.infer<typeof paraphraseSchema>;

export default function ParaphraseTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParaphraseFormData>({
    resolver: zodResolver(paraphraseSchema),
  });

  const onSubmit = async (data: ParaphraseFormData) => {
    setLoading(true);
    setResult("");
    try {
      const response = await paraphraseText(data.text);
      if (response.success && response.content) {
        setResult(response.content);
        toast.success("Text paraphrased successfully!");
      } else {
        toast.error(response.error || "Failed to paraphrase text");
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
          <CardTitle>✍️ Paraphrase Tool</CardTitle>
          <CardDescription>
            Rewrite text in your own words while maintaining meaning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Text to Paraphrase</Label>
              <Textarea
                id="text"
                placeholder="Enter the text you want to paraphrase..."
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
                  Paraphrasing...
                </>
              ) : (
                "Paraphrase Text"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6">
              <Label>Paraphrased Text</Label>
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
                Copy Text
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

