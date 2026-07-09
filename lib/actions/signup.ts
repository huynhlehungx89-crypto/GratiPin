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
  logoBase64: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export async function signupCompany(input: SignupInput) {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const { companyName, email, password, displayName, logoBase64 } = parsed.data;
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
      logo_url: null,
      onboarding_completed: false,
    })
    .select("id, slug")
    .single();

  if (companyError) {
    return { error: companyError.message };
  }

  if (logoBase64?.startsWith("data:image/")) {
    const [, meta, data] = logoBase64.match(/^data:(image\/\w+);base64,(.+)$/) ?? [];
    if (meta && data) {
      const buffer = Buffer.from(data, "base64");
      const fileName = `logos/${company.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await admin.storage
        .from("pin-images")
        .upload(fileName, buffer, { contentType: meta, upsert: false });

      if (!uploadError) {
        const { data: publicUrl } = admin.storage
          .from("pin-images")
          .getPublicUrl(fileName);
        await admin
          .from("companies")
          .update({ logo_url: publicUrl.publicUrl })
          .eq("id", company.id);
      }
    }
  }

  const { error: memberError } = await admin.from("members").insert({
    user_id: authData.user.id,
    company_id: company.id,
    display_name: displayName,
    role: "admin",
    is_owner: true,
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
