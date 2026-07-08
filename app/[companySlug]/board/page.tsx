import { notFound } from "next/navigation";
import { Board } from "@/components/board/Board";
import { BoardNav } from "@/components/board/BoardNav";
import { CreatePinForm } from "@/components/pin/CreatePinForm";
import { PinCard } from "@/components/pin/PinCard";
import type { BoardSkin } from "@/lib/utils/board";
import {
  getAccessibleBoards,
  getBoardPins,
  getCompanyBySlug,
  getCompanyMembers,
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
  const members = await getCompanyMembers(company.id);

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

  const boardOptions = navItems.map((n) => ({ id: n.id, label: n.label }));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <BoardNav items={navItems} currentId={companyBoard.id} />
      <CreatePinForm
        companySlug={params.companySlug}
        boards={boardOptions}
        members={members.map((m) => ({ id: m.id, name: m.display_name }))}
        defaultBoardId={companyBoard.id}
      />
      <Board skin={companyBoard.skin as BoardSkin}>
        {pins
          .filter((p) => !p.is_hidden)
          .map((pin) => (
            <PinCard
              key={pin.id}
              pin={pin}
              companyLogoUrl={company.logo_url}
              canShare={!pin.is_hidden}
            />
          ))}
        {pins.length === 0 && (
          <p className="text-umber/60">Chưa có ghim nào — hãy là người đầu tiên!</p>
        )}
      </Board>
    </main>
  );
}
