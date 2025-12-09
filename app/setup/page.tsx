import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function SetupPage() {
  // Check environment variables (these are available at build time for NEXT_PUBLIC_* vars)
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Note: GEMINI_API_KEY is server-only, so we can't check it on the client
  // But we can check if Supabase is configured which is the main requirement
  const allConfigured = hasSupabaseUrl && hasSupabaseKey;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Setup Required</CardTitle>
          <CardDescription>
            Configure your environment variables to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              {hasSupabaseUrl ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">Supabase URL</h3>
                <p className="text-sm text-muted-foreground">
                  {hasSupabaseUrl
                    ? "✓ NEXT_PUBLIC_SUPABASE_URL is configured"
                    : "✗ NEXT_PUBLIC_SUPABASE_URL is missing"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {hasSupabaseKey ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold">Supabase Anon Key</h3>
                <p className="text-sm text-muted-foreground">
                  {hasSupabaseKey
                    ? "✓ NEXT_PUBLIC_SUPABASE_ANON_KEY is configured"
                    : "✗ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold">Gemini API Key</h3>
                <p className="text-sm text-muted-foreground">
                  ⚠ GEMINI_API_KEY (server-side only, check server logs if missing)
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-4 space-y-2">
            <h4 className="font-semibold text-sm">Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Create a <code className="bg-white px-1 rounded">.env.local</code> file in the root directory</li>
              <li>Copy the template from <code className="bg-white px-1 rounded">.env.example</code></li>
              <li>Get your Supabase credentials from{" "}
                <a
                  href="https://supabase.com/dashboard/project/_/settings/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>Add your Gemini API key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google AI Studio
                </a>
              </li>
              <li>Restart your development server</li>
            </ol>
          </div>

          {allConfigured ? (
            <Link href="/">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              After configuring your environment variables, restart the server and refresh this page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

