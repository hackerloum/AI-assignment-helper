import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import PurchaseCredits from "@/components/purchase/purchase-credits";

export default async function PurchasePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/signin");
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
        <PurchaseCredits />
      </div>
    </div>
  );
}

