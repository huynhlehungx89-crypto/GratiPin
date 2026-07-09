"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const displayNameSchema = z.object({
  companySlug: z.string(),
  displayName: z.string().min(1, "Tên hiển thị không được để trống"),
});

const passwordSchema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(8, "Mật khẩu mới tối thiểu 8 ký tự"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Mật khẩu mới không khớp",
  path: ["confirmPassword"],
});

export async function updateDisplayNameAction(input: z.infer<typeof displayNameSchema>) {
  const parsed = displayNameSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error } = await supabase.rpc("update_own_display_name", {
    new_name: parsed.data.displayName,
  });
  if (error) return { error: error.message };

  revalidatePath(`/${parsed.data.companySlug}`, "layout");
  revalidatePath(`/${parsed.data.companySlug}/account`);
  return { success: true };
}

export async function changePasswordAction(input: z.infer<typeof passwordSchema>) {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.currentPassword,
  });
  if (signInError) return { error: "Mật khẩu hiện tại không đúng" };

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });
  if (updateError) return { error: updateError.message };

  return { success: true };
}
