import { notFound } from "next/navigation";
import { PinsModeration } from "@/components/admin/PinsModeration";
import {
  canAccessModeration,
  getBoardAdminBoardIds,
} from "@/lib/data/boardAdmin";
import { getCompanyBySlug, getCurrentMember } from "@/lib/data/board";
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

  const member = await getCurrentMember(company.id);
  if (!member) notFound();

  const isCompanyAdmin = member.role === "admin";
  const boardAdminBoardIds = await getBoardAdminBoardIds(member.id);

  if (!canAccessModeration(isCompanyAdmin, boardAdminBoardIds)) {
    notFound();
  }

  const supabase = createClient();
  const { data: boards } = await supabase
    .from("boards")
    .select("id, department_id, departments(name)")
    .eq("company_id", company.id);

  let boardLabels = (boards ?? []).map((b) => ({
    id: b.id,
    label: b.department_id
      ? (b.departments as { name: string } | null)?.name ?? "Phòng ban"
      : "Bảng chung",
  }));

  if (!isCompanyAdmin) {
    boardLabels = boardLabels.filter((b) => boardAdminBoardIds.includes(b.id));
  }

  let pinsQuery = supabase
    .from("pins")
    .select(
      `id, content, is_anonymous, board_id, created_at,
       author:members!pins_author_member_id_fkey(display_name)`
    )
    .eq("company_id", company.id)
    .is("reviewed_at", null)
    .eq("is_hidden", false)
    .order("created_at", { ascending: false });

  if (!isCompanyAdmin) {
    pinsQuery = pinsQuery.in("board_id", boardAdminBoardIds);
  }

  const { data: pins } = await pinsQuery;

  const pinRows = (pins ?? []).map((p) => {
    const author = p.author as { display_name: string } | null;
    const board = boardLabels.find((b) => b.id === p.board_id);
    return {
      id: p.id,
      content: p.content,
      is_anonymous: p.is_anonymous,
      author_name: author?.display_name ?? "—",
      board_label: board?.label ?? "—",
      created_at: p.created_at,
    };
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <h1 className="font-heading text-2xl text-umber mb-6">Kiểm duyệt ghim</h1>
      {!isCompanyAdmin && (
        <p className="mb-4 text-sm text-umber/60">
          Bạn chỉ thấy ghim thuộc các bảng bạn được gán quản lý.
        </p>
      )}
      <PinsModeration
        companySlug={params.companySlug}
        pins={pinRows}
        boardFilter={searchParams.board ?? ""}
        boards={boardLabels}
      />
    </main>
  );
}
