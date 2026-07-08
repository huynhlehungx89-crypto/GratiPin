import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Board } from "@/components/board/Board";
import { BoardNav } from "@/components/board/BoardNav";
import { BoardPageLayout } from "@/components/board/BoardPageLayout";
import { BoardPinLayer } from "@/components/board/BoardPinLayer";
import type { BoardSkin } from "@/lib/utils/board";
import {
  getAccessibleBoards,
  getBoardPins,
  getCompanyBySlug,
  getCurrentMember,
} from "@/lib/data/board";

export default async function DepartmentBoardPage({
  params,
}: {
  params: { companySlug: string; departmentId: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const member = await getCurrentMember(company.id);
  if (!member) notFound();

  const isAdmin = member.role === "admin";
  const supabase = createClient();

  const { data: board } = await supabase
    .from("boards")
    .select("id, skin, department_id, departments(status, name)")
    .eq("company_id", company.id)
    .eq("department_id", params.departmentId)
    .single();

  if (!board) notFound();

  if (!isAdmin) {
    const { data: access } = await supabase
      .from("member_departments")
      .select("member_id")
      .eq("member_id", member.id)
      .eq("department_id", params.departmentId)
      .maybeSingle();
    if (!access) notFound();
  }

  const dept = board.departments as { status: string; name: string } | null;
  const archived = dept?.status === "archived";

  const { companyBoard, deptBoards } = await getAccessibleBoards(
    company.id,
    member.id,
    isAdmin
  );

  const pins = await getBoardPins(board.id, isAdmin);

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
        href: `/${params.companySlug}/board/${b.department_id}`,
        skin: b.skin as BoardSkin,
        archived: d?.status === "archived",
      };
    }),
  ];

  return (
    <BoardPageLayout
      title={dept?.name}
      nav={<BoardNav items={navItems} currentId={board.id} />}
      board={
        <Board skin={board.skin as BoardSkin} archived={archived}>
          <BoardPinLayer
            pins={pins.filter((p) => !p.is_hidden)}
            companyLogoUrl={company.logo_url}
          />
        </Board>
      }
    />
  );
}
