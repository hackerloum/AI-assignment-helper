import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins } from "lucide-react";

export default function CreditBalance({ credits }: { credits: number }) {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-6 w-6" />
          Credit Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{credits}</div>
        <p className="mt-2 text-sm opacity-90">
          Available credits for AI tools
        </p>
      </CardContent>
    </Card>
  );
}

