import { notFound } from "next/navigation";
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

export default async function CompanyBoardPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const { data: company } = await getCompanyBySlug(params.companySlug);
  if (!company) notFound();

  const member = await getCurrentMember(company.id);
  if (!member) notFound();

  const isAdmin = member.role === "admin";
  const { companyBoard, deptBoards } = await getAccessibleBoards(
    company.id,
    member.id,
    isAdmin
  );

  if (!companyBoard) notFound();

  const pins = await getBoardPins(companyBoard.id, isAdmin);

  const navItems = [
    {
      id: companyBoard.id,
      label: "Bảng chung",
      href: `/${params.companySlug}/board`,
      skin: companyBoard.skin as BoardSkin,
    },
    ...deptBoards.map((b) => {
      const dept = b.departments as { status: string; name: string } | null;
      return {
        id: b.id,
        label: dept?.name ?? "Phòng ban",
        href: `/${params.companySlug}/board/${b.department_id}`,
        skin: b.skin as BoardSkin,
        archived: dept?.status === "archived",
      };
    }),
  ];

  return (
    <BoardPageLayout
      nav={<BoardNav items={navItems} currentId={companyBoard.id} />}
      board={
        <Board skin={companyBoard.skin as BoardSkin}>
          <BoardPinLayer
            pins={pins.filter((p) => !p.is_hidden)}
            companyLogoUrl={company.logo_url}
          />
        </Board>
      }
    />
  );
}
