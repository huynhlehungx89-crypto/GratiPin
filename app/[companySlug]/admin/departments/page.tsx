import { notFound } from "next/navigation";
import { DepartmentsAdmin } from "@/components/admin/DepartmentsAdmin";
import { getCompanyBySlug } from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";
import type { BoardSkin } from "@/lib/utils/board";

export default async function DepartmentsPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const supabase = createClient();
  const { data: departments } = await supabase
    .from("departments")
    .select("id, name, status, boards(id, skin, embed_enabled, embed_token)")
    .eq("company_id", company.id);

  const rows = (departments ?? []).map((d) => {
    const boards = d.boards as { id: string; skin: string; embed_enabled: boolean; embed_token: string | null }[] | { id: string; skin: string; embed_enabled: boolean; embed_token: string | null } | null;
    const board = Array.isArray(boards) ? boards[0] : boards;
    return {
      id: d.id,
      name: d.name,
      status: d.status,
      board: { ...board!, skin: board!.skin as BoardSkin },
    };
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Quản lý phòng ban</h1>
      <DepartmentsAdmin
        companySlug={params.companySlug}
        departments={rows}
        baseUrl={baseUrl}
      />
    </main>
  );
}
