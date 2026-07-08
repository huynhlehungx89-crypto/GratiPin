"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureUniqueSlug, slugify } from "@/lib/utils/slug";

const signupSchema = z.object({
  companyName: z.string().min(2, "Tên công ty quá ngắn"),
  slug: z.string().optional(),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự"),
  displayName: z.string().min(1, "Vui lòng nhập tên hiển thị"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;

export async function signupCompany(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const { companyName, email, password, displayName, logoUrl } = parsed.data;
  const baseSlug = slugify(parsed.data.slug?.trim() || companyName);
  const admin = createAdminClient();
  const supabase = createClient();

  const slug = await ensureUniqueSlug(baseSlug, async (candidate) => {
    const { data } = await admin
      .from("companies")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    return !!data;
  });

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) return { error: authError.message };
  if (!authData.user) return { error: "Không thể tạo tài khoản" };

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({
      name: companyName,
      slug,
      logo_url: logoUrl || null,
    })
    .select("id, slug")
    .single();

  if (companyError) {
    return { error: companyError.message };
  }

  const { error: memberError } = await admin.from("members").insert({
    user_id: authData.user.id,
    company_id: company.id,
    display_name: displayName,
    role: "admin",
  });

  if (memberError) return { error: memberError.message };

  const { error: boardError } = await admin.from("boards").insert({
    company_id: company.id,
    department_id: null,
    skin: "wood",
  });

  if (boardError) return { error: boardError.message };

  return { slug: company.slug };
}
