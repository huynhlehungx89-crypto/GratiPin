"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getAdminContext(companySlug: string) {
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

  if (!member || member.role !== "admin") throw new Error("Không có quyền admin");

  return { supabase, admin: createAdminClient(), company, member };
}

async function countAdmins(companyId: string) {
  const admin = createAdminClient();
  const { count } = await admin
    .from("members")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .eq("role", "admin");
  return count ?? 0;
}

const addMemberSchema = z.object({
  companySlug: z.string(),
  email: z.string().email(),
  displayName: z.string().min(1),
  password: z.string().min(8),
});

export async function addMember(input: z.infer<typeof addMemberSchema>) {
  const parsed = addMemberSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { admin, company } = await getAdminContext(parsed.data.companySlug);

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });
  if (authError) return { error: authError.message };

  const { error } = await admin.from("members").insert({
    user_id: authData.user.id,
    company_id: company.id,
    display_name: parsed.data.displayName,
    role: "user",
  });
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/members`);
  return { success: true };
}

export async function removeMember(companySlug: string, memberId: string) {
  const { admin, company } = await getAdminContext(companySlug);

  const { data: target } = await admin
    .from("members")
    .select("role, user_id")
    .eq("id", memberId)
    .eq("company_id", company.id)
    .single();

  if (!target) return { error: "Không tìm thấy thành viên" };
  if (target.role === "admin" && (await countAdmins(company.id)) <= 1) {
    return { error: "Không thể xoá admin cuối cùng" };
  }

  await admin.from("member_departments").delete().eq("member_id", memberId);
  const { error } = await admin.from("members").delete().eq("id", memberId);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/members`);
  return { success: true };
}

export async function updateMemberRole(
  companySlug: string,
  memberId: string,
  role: "admin" | "user"
) {
  const { admin, company } = await getAdminContext(companySlug);

  const { data: target } = await admin
    .from("members")
    .select("role")
    .eq("id", memberId)
    .eq("company_id", company.id)
    .single();

  if (!target) return { error: "Không tìm thấy thành viên" };
  if (target.role === "admin" && role === "user" && (await countAdmins(company.id)) <= 1) {
    return { error: "Công ty phải có ít nhất 1 admin" };
  }

  const { error } = await admin
    .from("members")
    .update({ role })
    .eq("id", memberId);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/members`);
  return { success: true };
}

export async function setMemberDepartments(
  companySlug: string,
  memberId: string,
  departmentIds: string[]
) {
  const { admin, company } = await getAdminContext(companySlug);

  await admin.from("member_departments").delete().eq("member_id", memberId);

  if (departmentIds.length > 0) {
    const { error } = await admin.from("member_departments").insert(
      departmentIds.map((departmentId) => ({
        member_id: memberId,
        department_id: departmentId,
      }))
    );
    if (error) return { error: error.message };
  }

  revalidatePath(`/${company.slug}/admin/members`);
  return { success: true };
}

const departmentSchema = z.object({
  companySlug: z.string(),
  name: z.string().min(1),
  skin: z.enum(["wood", "felt", "linen", "chalkboard"]),
});

export async function createDepartment(input: z.infer<typeof departmentSchema>) {
  const parsed = departmentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { admin, company } = await getAdminContext(parsed.data.companySlug);

  const { data: dept, error: deptError } = await admin
    .from("departments")
    .insert({ company_id: company.id, name: parsed.data.name })
    .select("id")
    .single();
  if (deptError) return { error: deptError.message };

  const { error: boardError } = await admin.from("boards").insert({
    company_id: company.id,
    department_id: dept.id,
    skin: parsed.data.skin,
  });
  if (boardError) return { error: boardError.message };

  revalidatePath(`/${company.slug}/admin/departments`);
  return { success: true };
}

export async function archiveDepartment(companySlug: string, departmentId: string) {
  const { admin, company } = await getAdminContext(companySlug);

  const { error } = await admin
    .from("departments")
    .update({ status: "archived" })
    .eq("id", departmentId)
    .eq("company_id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/departments`);
  return { success: true };
}

export async function updateBoardSkin(
  companySlug: string,
  boardId: string,
  skin: "wood" | "felt" | "linen" | "chalkboard"
) {
  const { admin, company } = await getAdminContext(companySlug);

  const { error } = await admin
    .from("boards")
    .update({ skin })
    .eq("id", boardId)
    .eq("company_id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/departments`);
  revalidatePath(`/${company.slug}/board`);
  return { success: true };
}

const settingsSchema = z.object({
  companySlug: z.string(),
  name: z.string().min(2),
  logoUrl: z.string().optional(),
});

export async function updateCompanySettings(input: z.infer<typeof settingsSchema>) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { admin, company } = await getAdminContext(parsed.data.companySlug);

  const { error } = await admin
    .from("companies")
    .update({
      name: parsed.data.name,
      logo_url: parsed.data.logoUrl || null,
    })
    .eq("id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}`);
  return { success: true };
}

export async function hidePin(companySlug: string, pinId: string) {
  const { admin, company } = await getAdminContext(companySlug);

  const { error } = await admin
    .from("pins")
    .update({ is_hidden: true })
    .eq("id", pinId)
    .eq("company_id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/pins`);
  revalidatePath(`/${company.slug}/board`);
  return { success: true };
}

export async function enableBoardEmbed(companySlug: string, boardId: string) {
  const { admin, company } = await getAdminContext(companySlug);
  const token = crypto.randomUUID().replace(/-/g, "");

  const { error } = await admin
    .from("boards")
    .update({ embed_enabled: true, embed_token: token })
    .eq("id", boardId)
    .eq("company_id", company.id);
  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/admin/departments`);
  return { success: true, token };
}
