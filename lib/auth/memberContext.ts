"use server";

import { createClient } from "@/lib/supabase/server";
import {
  canManageBoard,
  getBoardAdminBoardIds,
} from "@/lib/data/boardAdmin";

export async function getMemberContext(companySlug: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("slug", companySlug)
    .single();
  if (!company) throw new Error("Không tìm thấy công ty");

  const { data: member } = await supabase
    .from("members")
    .select("id, role")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single();
  if (!member) throw new Error("Không phải thành viên");

  const isCompanyAdmin = member.role === "admin";
  const boardAdminBoardIds = await getBoardAdminBoardIds(member.id);

  return { supabase, company, member, isCompanyAdmin, boardAdminBoardIds };
}

export async function assertCanManageBoard(companySlug: string, boardId: string) {
  const ctx = await getMemberContext(companySlug);
  if (!canManageBoard(ctx.isCompanyAdmin, boardId, ctx.boardAdminBoardIds)) {
    throw new Error("Không có quyền quản lý bảng này");
  }
  return ctx;
}

export async function assertCanHidePinOnBoard(
  companySlug: string,
  pinId: string
): Promise<{ boardId: string }> {
  const ctx = await getMemberContext(companySlug);
  const { data: pin } = await ctx.supabase
    .from("pins")
    .select("board_id")
    .eq("id", pinId)
    .eq("company_id", ctx.company.id)
    .single();
  if (!pin) throw new Error("Không tìm thấy ghim");

  if (!canManageBoard(ctx.isCompanyAdmin, pin.board_id, ctx.boardAdminBoardIds)) {
    throw new Error("Không có quyền ẩn ghim này");
  }
  return { boardId: pin.board_id };
}

export async function canHidePinOnBoard(
  isCompanyAdmin: boolean,
  boardAdminBoardIds: string[],
  boardId: string
): Promise<boolean> {
  return canManageBoard(isCompanyAdmin, boardId, boardAdminBoardIds);
}
