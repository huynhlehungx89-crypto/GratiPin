import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SetupWizard } from "@/components/setup/SetupWizard";
import type { BoardSkin } from "@/lib/utils/board";

export default async function SetupPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug, onboarding_completed")
    .eq("slug", params.companySlug)
    .single();

  if (!company) redirect("/");

  const { data: member } = await supabase
    .from("members")
    .select("is_owner, role")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single();

  if (!member?.is_owner) {
    redirect(`/${params.companySlug}/board`);
  }

  if (company.onboarding_completed) {
    redirect(`/${params.companySlug}/board`);
  }

  const { data: companyBoard } = await supabase
    .from("boards")
    .select("skin")
    .eq("company_id", company.id)
    .is("department_id", null)
    .single();

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <SetupWizard
        companySlug={params.companySlug}
        initialSkin={(companyBoard?.skin as BoardSkin) ?? "wood"}
      />
    </main>
  );
}
