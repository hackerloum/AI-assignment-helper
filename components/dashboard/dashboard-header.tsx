"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

export default function DashboardHeader({ user }: { user: User }) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    router.push("/auth/signup");
    router.refresh();
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            AI Assignment Helper
          </h1>
          <p className="text-sm text-gray-600">
            Welcome, {user.email}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/purchase">
            <Button variant="outline">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Credits
            </Button>
          </Link>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}

