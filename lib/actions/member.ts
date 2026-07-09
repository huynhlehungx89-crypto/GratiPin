"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAccessibleBoards } from "@/lib/data/board";

const setDefaultBoardSchema = z.object({
  companySlug: z.string(),
  boardId: z.string().uuid(),
});

export async function setDefaultBoardAction(input: z.infer<typeof setDefaultBoardSchema>) {
  const parsed = setDefaultBoardSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Chưa đăng nhập" };

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("slug", parsed.data.companySlug)
    .single();
  if (!company) return { error: "Không tìm thấy công ty" };

  const { data: member } = await supabase
    .from("members")
    .select("id, role")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single();
  if (!member) return { error: "Không phải thành viên công ty" };

  const isAdmin = member.role === "admin";
  const { companyBoard, deptBoards } = await getAccessibleBoards(
    company.id,
    member.id,
    isAdmin
  );

  const accessibleIds = new Set<string>();
  if (companyBoard) accessibleIds.add(companyBoard.id);
  for (const b of deptBoards) accessibleIds.add(b.id);

  if (!accessibleIds.has(parsed.data.boardId)) {
    return { error: "Bạn không có quyền truy cập bảng này" };
  }

  const { error } = await supabase
    .from("members")
    .update({ default_board_id: parsed.data.boardId })
    .eq("id", member.id);

  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}`, "layout");
  return { success: true };
}
