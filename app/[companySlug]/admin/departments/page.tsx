import { notFound } from "next/navigation";
import { DepartmentsAdmin } from "@/components/admin/DepartmentsAdmin";
import { getCompanyBySlug, getCompanyMembers, getCurrentMember } from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";
import type { BoardSkin } from "@/lib/utils/board";

export default async function DepartmentsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const member = await getCurrentMember(company.id);
  if (!member || member.role !== "admin") notFound();

  const supabase = createClient();
  const { data: companyBoard } = await supabase
    .from("boards")
    .select("id")
    .eq("company_id", company.id)
    .is("department_id", null)
    .single();

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, status, boards(id, skin)")
    .eq("company_id", company.id);

  const rows = (departments ?? []).map((d) => {
    const boards = d.boards as { id: string; skin: string }[] | { id: string; skin: string } | null;
    const board = Array.isArray(boards) ? boards[0] : boards;
    return {
      id: d.id,
      name: d.name,
      status: d.status,
      board: { ...board!, skin: board!.skin as BoardSkin },
    };
  });

  const members = await getCompanyMembers(company.id);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Quản lý phòng ban</h1>
      <DepartmentsAdmin
        companySlug={params.companySlug}
        departments={rows}
        members={members.map((m) => ({ id: m.id, display_name: m.display_name }))}
        companyBoardId={companyBoard!.id}
      />
    </main>
  );
}
