import { notFound } from "next/navigation";
import { PinsModeration } from "@/components/admin/PinsModeration";
import { getCompanyBySlug } from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";

export default async function PinsAdminPage({
  params,
  searchParams,
}: {
  params: { companySlug: string };
  searchParams: { board?: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const supabase = createClient();
  const { data: boards } = await supabase
    .from("boards")
    .select("id, department_id, departments(name)")
    .eq("company_id", company.id);

  const boardLabels = (boards ?? []).map((b) => ({
    id: b.id,
    label: b.department_id
      ? (b.departments as { name: string } | null)?.name ?? "Phòng ban"
      : "Bảng chung",
  }));

  const { data: pins } = await supabase
    .from("pins")
    .select(
      `id, content, is_anonymous, is_hidden, board_id,
       author:members!pins_author_member_id_fkey(display_name)`
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false });

  const pinRows = (pins ?? []).map((p) => {
    const author = p.author as { display_name: string } | null;
    const board = boardLabels.find((b) => b.id === p.board_id);
    return {
      id: p.id,
      content: p.content,
      is_anonymous: p.is_anonymous,
      is_hidden: p.is_hidden,
      author_name: author?.display_name ?? "—",
      board_label: board?.label ?? "—",
    };
  });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Kiểm duyệt ghim</h1>
      <PinsModeration
        companySlug={params.companySlug}
        pins={pinRows}
        boardFilter={searchParams.board ?? ""}
        boards={boardLabels}
      />
    </main>
  );
}
