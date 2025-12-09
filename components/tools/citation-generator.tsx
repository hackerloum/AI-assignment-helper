"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { generateCitation } from "@/app/actions/ai-actions";
import { Loader2 } from "lucide-react";

const citationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().optional(),
  year: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  publisher: z.string().optional(),
  format: z.enum(["APA", "MLA", "Chicago"]),
});

type CitationFormData = z.infer<typeof citationSchema>;

export default function CitationGenerator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [format, setFormat] = useState<"APA" | "MLA" | "Chicago">("APA");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CitationFormData>({
    resolver: zodResolver(citationSchema),
    defaultValues: {
      format: "APA",
    },
  });

  const onSubmit = async (data: CitationFormData) => {
    setLoading(true);
    setResult("");
    try {
      const response = await generateCitation(
        {
          title: data.title,
          author: data.author,
          year: data.year,
          url: data.url || undefined,
          publisher: data.publisher,
        },
        format
      );
      if (response.success && response.content) {
        setResult(response.content || '');
        toast.success("Citation generated successfully!");
      } else {
        toast.error(response.error || "Failed to generate citation");
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
          <CardTitle>📚 Citation Generator</CardTitle>
          <CardDescription>
            Generate citations in APA, MLA, or Chicago format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format">Citation Format</Label>
              <Select
                value={format}
                onValueChange={(value) =>
                  setFormat(value as "APA" | "MLA" | "Chicago")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA">APA</SelectItem>
                  <SelectItem value="MLA">MLA</SelectItem>
                  <SelectItem value="Chicago">Chicago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Article or book title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                placeholder="Author name"
                {...register("author")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  placeholder="2024"
                  {...register("year")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  placeholder="Publisher name"
                  {...register("publisher")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                {...register("url")}
              />
              {errors.url && (
                <p className="text-sm text-destructive">{errors.url.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Citation"
              )}
            </Button>
          </form>

          {result && (
            <div className="mt-6">
              <Label>Generated Citation ({format})</Label>
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
                Copy Citation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

