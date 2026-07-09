import { getAccessibleBoards } from "@/lib/data/board";

export type NavBoardOption = {
  id: string;
  label: string;
  href: string;
  archived?: boolean;
};

export function boardHref(companySlug: string, boardId: string | null): string {
  if (!boardId) return `/${companySlug}/board`;
  return `/${companySlug}/board/${boardId}`;
}

export async function getNavBoardOptions(
  companySlug: string,
  companyId: string,
  memberId: string,
  isAdmin: boolean
): Promise<NavBoardOption[]> {
  const { companyBoard, deptBoards } = await getAccessibleBoards(
    companyId,
    memberId,
    isAdmin
  );

  const items: NavBoardOption[] = [];

  if (companyBoard) {
    items.push({
      id: companyBoard.id,
      label: "Bảng chung",
      href: boardHref(companySlug, null),
    });
  }

  for (const board of deptBoards) {
    const dept = board.departments as { status: string; name: string } | null;
    items.push({
      id: board.id,
      label: dept?.name ?? "Phòng ban",
      href: boardHref(companySlug, board.id),
      archived: dept?.status === "archived",
    });
  }

  return items;
}

export function resolveDefaultBoardHref(
  companySlug: string,
  boards: NavBoardOption[],
  defaultBoardId: string | null
): string {
  if (defaultBoardId) {
    const match = boards.find((b) => b.id === defaultBoardId);
    if (match) return match.href;
  }
  return boardHref(companySlug, null);
}
