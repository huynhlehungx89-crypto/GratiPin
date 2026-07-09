import { notFound } from "next/navigation";
import { AccountSettings } from "@/components/account/AccountSettings";
import { getCompanyBySlug, getCurrentMember } from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const member = await getCurrentMember(company.id);
  if (!member) notFound();

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) notFound();

  const { data: deptRows } = await supabase
    .from("member_departments")
    .select("departments(name)")
    .eq("member_id", member.id);

  const departments = (deptRows ?? [])
    .map((r) => (r.departments as { name: string } | null)?.name)
    .filter((n): n is string => !!n);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Tài khoản của tôi</h1>
      <AccountSettings
        companySlug={params.companySlug}
        displayName={member.display_name}
        email={user.email}
        departments={departments}
      />
    </main>
  );
}
