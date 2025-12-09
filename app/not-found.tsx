import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-4xl">404</CardTitle>
          <CardDescription>Page Not Found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

