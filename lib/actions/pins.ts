"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOpenPinPosition, randomRotationForTemplate } from "@/lib/pins/placement";

const pinSchema = z.object({
  companySlug: z.string(),
  boardId: z.string().uuid(),
  content: z.string().min(1, "Nội dung không được trống"),
  template: z.enum(["note", "polaroid", "floral", "washi", "garden", "sunshine", "love"]),
  isAnonymous: z.boolean(),
  recipientMemberId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export async function createPin(input: z.infer<typeof pinSchema>) {
  const parsed = pinSchema.safeParse(input);
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
    .select("id")
    .eq("user_id", user.id)
    .eq("company_id", company.id)
    .single();
  if (!member) return { error: "Không phải thành viên công ty" };

  const { data: board } = await supabase
    .from("boards")
    .select("id, department_id, departments(status)")
    .eq("id", parsed.data.boardId)
    .eq("company_id", company.id)
    .single();

  if (!board) return { error: "Không tìm thấy bảng ghim" };

  const dept = board.departments as { status: string } | null;
  if (dept?.status === "archived") {
    return { error: "Bảng này đã lưu trữ, không thể đăng ghim mới" };
  }

  if (parsed.data.template === "polaroid" && !parsed.data.imageUrl) {
    return { error: "Cần thêm ảnh để dùng mẫu Polaroid" };
  }

  const { data: existingPins } = await supabase
    .from("pins")
    .select("position_x, position_y")
    .eq("board_id", board.id);

  const { x, y } = findOpenPinPosition(existingPins ?? []);
  const rotation = randomRotationForTemplate(parsed.data.template);

  const { error } = await supabase.from("pins").insert({
    company_id: company.id,
    board_id: board.id,
    author_member_id: member.id,
    is_anonymous: parsed.data.isAnonymous,
    recipient_member_id: parsed.data.recipientMemberId || null,
    content: parsed.data.content,
    image_url: parsed.data.imageUrl || null,
    template: parsed.data.template,
    position_x: x,
    position_y: y,
    rotation,
  });

  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/board`);
  if (board.department_id) {
    revalidatePath(`/${company.slug}/board/${board.department_id}`);
  }
  return { success: true };
}

const updatePinContentSchema = z.object({
  companySlug: z.string(),
  pinId: z.string().uuid(),
  content: z.string().min(1, "Nội dung không được trống"),
  template: z.enum(["note", "polaroid", "floral", "washi", "garden", "sunshine", "love"]),
  imageUrl: z.string().url().optional().nullable(),
});

export async function updatePinContentAction(input: z.infer<typeof updatePinContentSchema>) {
  const parsed = updatePinContentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  if (parsed.data.template === "polaroid" && !parsed.data.imageUrl) {
    return { error: "Cần thêm ảnh để dùng mẫu Polaroid" };
  }

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

  const { error } = await supabase.rpc("update_pin_content", {
    pin_id: parsed.data.pinId,
    new_content: parsed.data.content,
    new_image_url: parsed.data.imageUrl ?? "",
    new_template: parsed.data.template,
  });

  if (error) return { error: error.message };

  revalidatePath(`/${company.slug}/board`);
  return { success: true };
}
