import { notFound } from "next/navigation";
import { MembersAdmin } from "@/components/admin/MembersAdmin";
import { getCompanyBySlug } from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const supabase = createClient();
  const { data: members } = await supabase
    .from("members")
    .select("id, display_name, role, user_id")
    .eq("company_id", company.id);

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("company_id", company.id)
    .eq("status", "active");

  const { data: memberDepartments } = await supabase
    .from("member_departments")
    .select("member_id, department_id");

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Quản lý thành viên</h1>
      <MembersAdmin
        companySlug={params.companySlug}
        members={members ?? []}
        departments={departments ?? []}
        memberDepartments={memberDepartments ?? []}
      />
    </main>
  );
}
