"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TOOL_DESCRIPTIONS, CREDIT_COSTS } from "@/lib/constants";
import { useRouter } from "next/navigation";

export default function ToolGrid() {
  const router = useRouter();

  const tools = Object.entries(TOOL_DESCRIPTIONS).map(([key, value]) => ({
    key: key as keyof typeof TOOL_DESCRIPTIONS,
    ...value,
    cost: CREDIT_COSTS[key as keyof typeof CREDIT_COSTS],
  }));

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <Card key={tool.key} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{tool.icon}</span>
              {tool.title}
            </CardTitle>
            <CardDescription>{tool.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Cost: <span className="font-semibold">{tool.cost} credits</span>
              </div>
              <Button
                onClick={() => router.push(`/tools/${tool.key}`)}
              >
                Use Tool
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}






