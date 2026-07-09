"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BoardSkin } from "@/lib/utils/board";

const skinSchema = z.enum(["wood", "felt", "linen", "chalkboard"]);

async function getOwnerContext(companySlug: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Chưa đăng nhập");

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug, onboarding_completed")
    .eq("slug", companySlug)
    .single();
  if (!company) throw new Error("Không tìm thấy công ty");

  const { data: member } = await supabase
    .from("members")
    .select("id, is_owner, role")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single();

  if (!member?.is_owner || member.role !== "admin") {
    throw new Error("Chỉ người tạo công ty mới được dùng trình thiết lập");
  }

  return { supabase, company, member };
}

export async function updateSetupBoardSkinAction(companySlug: string, skin: BoardSkin) {
  const parsed = skinSchema.safeParse(skin);
  if (!parsed.success) return { error: "Loại bảng không hợp lệ" };

  try {
    const { supabase, company } = await getOwnerContext(companySlug);

    const { error } = await supabase
      .from("boards")
      .update({ skin: parsed.data })
      .eq("company_id", company.id)
      .is("department_id", null);

    if (error) return { error: error.message };

    revalidatePath(`/${company.slug}/setup`);
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra" };
  }
}

export async function completeOnboardingAction(companySlug: string) {
  try {
    const { supabase, company } = await getOwnerContext(companySlug);

    const { error } = await supabase
      .from("companies")
      .update({ onboarding_completed: true })
      .eq("id", company.id);

    if (error) return { error: error.message };

    revalidatePath(`/${company.slug}`, "layout");
    redirect(`/${company.slug}/board`);
  } catch (e) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") throw e;
    return { error: e instanceof Error ? e.message : "Có lỗi xảy ra" };
  }
}
