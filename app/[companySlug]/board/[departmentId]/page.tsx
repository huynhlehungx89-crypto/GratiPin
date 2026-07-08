import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
        href: `/${params.companySlug}/board/${b.department_id}`,
        skin: b.skin as BoardSkin,
        archived: d?.status === "archived",
      };
    }),
  ];

  const boardOptions = navItems.map((n) => ({ id: n.id, label: n.label }));

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber mb-4">{dept?.name}</h1>
      <BoardNav items={navItems} currentId={board.id} />
      <CreatePinForm
        companySlug={params.companySlug}
        boards={boardOptions}
        members={members.map((m) => ({ id: m.id, name: m.display_name }))}
        defaultBoardId={board.id}
        disabled={archived}
      />
      <Board skin={board.skin as BoardSkin} archived={archived}>
        {pins
          .filter((p) => !p.is_hidden)
          .map((pin) => (
            <PinCard key={pin.id} pin={pin} companyLogoUrl={company.logo_url} />
          ))}
      </Board>
    </main>
  );
}
