import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BoardSettingsForm } from "@/components/board/BoardSettingsForm";
import { canManageBoard, getBoardAdminBoardIds, getBoardAdminMemberIds } from "@/lib/data/boardAdmin";
import { getCompanyBySlug, getCompanyMembers, getCurrentMember } from "@/lib/data/board";
import { createClient } from "@/lib/supabase/server";
import type { BoardSkin } from "@/lib/utils/board";

export default async function BoardSettingsPage({
  params,
}: {
  params: { companySlug: string; boardId: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const member = await getCurrentMember(company.id);
  if (!member) notFound();

  const isCompanyAdmin = member.role === "admin";
  const boardAdminBoardIds = await getBoardAdminBoardIds(member.id);

  if (!canManageBoard(isCompanyAdmin, params.boardId, boardAdminBoardIds)) {
    notFound();
  }

  const boardAdminMemberIds = await getBoardAdminMemberIds(params.boardId);

  const supabase = createClient();
  const { data: board } = await supabase
    .from("boards")
    .select("id, skin, embed_enabled, embed_token, department_id, departments(name)")
    .eq("id", params.boardId)
    .eq("company_id", company.id)
    .single();

  if (!board) notFound();

  const boardLabel = board.department_id
    ? (board.departments as { name: string } | null)?.name ?? "Phòng ban"
    : "Bảng chung";

  const boardHref = board.department_id
    ? `/${params.companySlug}/board/${board.id}`
    : `/${params.companySlug}/board`;

  const members = await getCompanyMembers(company.id);
  const host = headers().get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <BoardSettingsForm
        companySlug={params.companySlug}
        boardId={board.id}
        boardLabel={boardLabel}
        skin={board.skin as BoardSkin}
        embedEnabled={board.embed_enabled}
        embedToken={board.embed_token}
        baseUrl={baseUrl}
        members={members.map((m) => ({ id: m.id, display_name: m.display_name }))}
        boardAdminMemberIds={boardAdminMemberIds}
        isCompanyAdmin={isCompanyAdmin}
        boardHref={boardHref}
      />
    </main>
  );
}
