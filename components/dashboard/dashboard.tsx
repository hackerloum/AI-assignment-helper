import { createClient } from "@/lib/supabase/server";
import { getUserCredits } from "@/lib/credits";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import ToolGrid from "@/components/dashboard/tool-grid";
import CreditBalance from "@/components/dashboard/credit-balance";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const credits = await getUserCredits(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <CreditBalance credits={credits} />
        </div>
        <ToolGrid />
      </div>
    </div>
  );
}


