import { createClient } from "@/lib/supabase/server";

export async function getBoardAdminBoardIds(memberId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("board_admins")
    .select("board_id")
    .eq("member_id", memberId);
  return (data ?? []).map((r) => r.board_id);
}

export async function isBoardAdminFor(memberId: string, boardId: string): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("board_admins")
    .select("board_id")
    .eq("member_id", memberId)
    .eq("board_id", boardId)
    .maybeSingle();
  return !!data;
}

export async function getBoardAdminMemberIds(boardId: string): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("board_admins")
    .select("member_id")
    .eq("board_id", boardId);
  return (data ?? []).map((r) => r.member_id);
}

export function canAccessModeration(isCompanyAdmin: boolean, boardAdminBoardIds: string[]): boolean {
  return isCompanyAdmin || boardAdminBoardIds.length > 0;
}

export function canManageBoard(
  isCompanyAdmin: boolean,
  boardId: string,
  boardAdminBoardIds: string[]
): boolean {
  return isCompanyAdmin || boardAdminBoardIds.includes(boardId);
}
