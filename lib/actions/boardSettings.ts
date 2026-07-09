"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertCanManageBoard, getMemberContext } from "@/lib/auth/memberContext";
import type { BoardSkin } from "@/lib/utils/board";

const skinSchema = z.enum(["wood", "felt", "linen", "chalkboard"]);

export async function updateBoardSkinAction(
  companySlug: string,
  boardId: string,
  skin: BoardSkin
) {
  const parsed = skinSchema.safeParse(skin);
  if (!parsed.success) return { error: "Skin không hợp lệ" };

  try {
    const { supabase, company } = await assertCanManageBoard(companySlug, boardId);
    const { error } = await supabase
      .from("boards")
      .update({ skin: parsed.data })
      .eq("id", boardId)
      .eq("company_id", company.id);
    if (error) return { error: error.message };

    revalidatePath(`/${company.slug}`, "layout");
    revalidatePath(`/${company.slug}/board`);
    revalidatePath(`/${company.slug}/board/${boardId}`);
    revalidatePath(`/${company.slug}/board/${boardId}/settings`);
    return { success: true, skin: parsed.data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function enableBoardEmbedAction(companySlug: string, boardId: string) {
  try {
    const { supabase, company } = await assertCanManageBoard(companySlug, boardId);
    const token = crypto.randomUUID().replace(/-/g, "");
    const { error } = await supabase
      .from("boards")
      .update({ embed_enabled: true, embed_token: token })
      .eq("id", boardId)
      .eq("company_id", company.id);
    if (error) return { error: error.message };

    revalidatePath(`/${company.slug}/board/${boardId}/settings`);
    return { success: true, token };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}

export async function setBoardAdminsAction(
  companySlug: string,
  boardId: string,
  memberIds: string[]
) {
  try {
    const ctx = await getMemberContext(companySlug);
    if (!ctx.isCompanyAdmin) return { error: "Chỉ Admin công ty mới gán Board Admin" };

    const uniqueIds = Array.from(new Set(memberIds));
    const { data: validMembers } = await ctx.supabase
      .from("members")
      .select("id")
      .eq("company_id", ctx.company.id)
      .in("id", uniqueIds.length ? uniqueIds : ["00000000-0000-0000-0000-000000000000"]);

    const validIds = new Set((validMembers ?? []).map((m) => m.id));
    const toAssign = uniqueIds.filter((id) => validIds.has(id));

    const { data: existing } = await ctx.supabase
      .from("board_admins")
      .select("member_id")
      .eq("board_id", boardId);
    const existingIds = new Set((existing ?? []).map((r) => r.member_id));

    const toRemove = Array.from(existingIds).filter((id) => !toAssign.includes(id));
    const toAdd = toAssign.filter((id) => !existingIds.has(id));

    if (toRemove.length > 0) {
      const { error } = await ctx.supabase
        .from("board_admins")
        .delete()
        .eq("board_id", boardId)
        .in("member_id", toRemove);
      if (error) return { error: error.message };
    }

    if (toAdd.length > 0) {
      const { error } = await ctx.supabase.from("board_admins").insert(
        toAdd.map((memberId) => ({ board_id: boardId, member_id: memberId }))
      );
      if (error) return { error: error.message };
    }

    revalidatePath(`/${companySlug}/board/${boardId}/settings`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Lỗi không xác định" };
  }
}
