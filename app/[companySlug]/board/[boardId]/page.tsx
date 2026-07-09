import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Board } from "@/components/board/Board";
import { BoardNav } from "@/components/board/BoardNav";
import { BoardCreatePinFab } from "@/components/board/BoardCreatePinFab";
import { BoardPageLayout } from "@/components/board/BoardPageLayout";
import { BoardPinLayer } from "@/components/board/BoardPinLayer";
import type { BoardSkin } from "@/lib/utils/board";
import {
  getAccessibleBoards,
  getBoardPins,
  getCompanyBySlug,
  getCompanyMembers,
  getCurrentMember,
} from "@/lib/data/board";
import { canManageBoard, getBoardAdminBoardIds } from "@/lib/data/boardAdmin";

export default async function BoardByIdPage({
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
  const supabase = createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("id, skin, department_id, departments(status, name)")
    .eq("company_id", company.id)
    .eq("id", params.boardId)
    .single();

  if (!board) notFound();

  if (!board.department_id) {
    notFound();
  }

  const isBoardAdmin = boardAdminBoardIds.includes(board.id);

  if (!isCompanyAdmin && !isBoardAdmin) {
    const { data: access } = await supabase
      .from("member_departments")
      .select("member_id")
      .eq("member_id", member.id)
      .eq("department_id", board.department_id)
      .maybeSingle();
    if (!access) notFound();
  }

  const dept = board.departments as { status: string; name: string } | null;
  const archived = dept?.status === "archived";

  const { companyBoard, deptBoards } = await getAccessibleBoards(
    company.id,
    member.id,
    isCompanyAdmin
  );

  const canModerate = canManageBoard(isCompanyAdmin, board.id, boardAdminBoardIds);
  const pins = await getBoardPins(board.id, canModerate);
  const members = await getCompanyMembers(company.id);

  const navItems = [
    {
      id: companyBoard!.id,
      label: "Bảng chung",
      href: `/${params.companySlug}/board`,
      skin: companyBoard!.skin as BoardSkin,
    },
    ...deptBoards.map((b) => {
      const d = b.departments as { status: string; name: string } | null;
      return {
        id: b.id,
        label: d?.name ?? "Phòng ban",
        href: `/${params.companySlug}/board/${b.id}`,
        skin: b.skin as BoardSkin,
        archived: d?.status === "archived",
      };
    }),
  ];

  const boardOptions = navItems.map((item) => ({ id: item.id, label: item.label }));
  const memberOptions = members.map((m) => ({ id: m.id, name: m.display_name }));

  return (
    <BoardPageLayout
      title={dept?.name}
      nav={
        <BoardNav
          items={navItems}
          currentId={board.id}
          companySlug={params.companySlug}
          canManageCurrentBoard={canModerate}
        />
      }
      board={
        <Board
          key={board.skin}
          skin={board.skin as BoardSkin}
          archived={archived}
          pins={pins}
        >
          <BoardPinLayer
            pins={pins.filter((p) => !p.is_hidden)}
            companyLogoUrl={company.logo_url}
            companySlug={params.companySlug}
            currentMemberId={member.id}
            canModerate={canModerate}
          />
        </Board>
      }
    >
      <BoardCreatePinFab
        companySlug={params.companySlug}
        boards={boardOptions}
        members={memberOptions}
        defaultBoardId={board.id}
        disabled={archived}
      />
    </BoardPageLayout>
  );
}
