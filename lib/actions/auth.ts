"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export async function login(input: z.infer<typeof loginSchema>) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Đăng nhập thất bại" };

  const { data: member } = await supabase
    .from("members")
    .select("is_owner, companies(slug, onboarding_completed)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const company = member?.companies as {
    slug: string;
    onboarding_completed: boolean;
  } | null;
  const slug = company?.slug;
  if (!slug) return { error: "Tài khoản chưa thuộc công ty nào" };

  if (member?.is_owner && company && !company.onboarding_completed) {
    redirect(`/${slug}/setup`);
  }

  redirect(`/${slug}/board`);
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
