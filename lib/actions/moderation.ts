"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertCanHidePinOnBoard } from "@/lib/auth/memberContext";

async function updatePinModeration(
  companySlug: string,
  pinId: string,
  patch: { reviewed_at: string; is_hidden?: boolean }
) {
  const supabase = createClient();
  await assertCanHidePinOnBoard(companySlug, pinId);

  const { data: company } = await supabase
    .from("companies")
    .select("id, slug")
    .eq("slug", companySlug)
    .single();
  if (!company) return { error: "Không tìm thấy công ty" };

  const { error } = await supabase
    .from("pins")
    .update(patch)
    .eq("id", pinId)
    .eq("company_id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}`, "layout");
  revalidatePath(`/${company.slug}/admin/pins`);
  revalidatePath(`/${company.slug}/board`);
  return { success: true };
}

export async function approvePinAction(companySlug: string, pinId: string) {
  try {
    return await updatePinModeration(companySlug, pinId, {
      reviewed_at: new Date().toISOString(),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Không có quyền" };
  }
}

export async function rejectPinAction(companySlug: string, pinId: string) {
  try {
    return await updatePinModeration(companySlug, pinId, {
      reviewed_at: new Date().toISOString(),
      is_hidden: true,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Không có quyền" };
  }
}
