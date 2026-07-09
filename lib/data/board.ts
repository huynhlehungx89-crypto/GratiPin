import { createClient } from "@/lib/supabase/server";
import type { PinDisplay } from "@/components/pin/PinCard";
import type { PinTemplate } from "@/lib/utils/board";

export async function getCompanyBySlug(slug: string) {
  const supabase = createClient();
  return supabase.from("companies").select("*").eq("slug", slug).single();
}

export async function getCurrentMember(companyId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("members")
    .select("id, role, display_name")
    .eq("user_id", user.id)
    .eq("company_id", companyId)
    .single();
  return data;
}

export async function getAccessibleBoards(companyId: string, memberId: string, isAdmin: boolean) {
  const supabase = createClient();

  const { data: companyBoard } = await supabase
    .from("boards")
    .select("id, skin, department_id, departments(status, name)")
    .eq("company_id", companyId)
    .is("department_id", null)
    .single();

  let deptBoards: NonNullable<typeof companyBoard>[] = [];

  if (isAdmin) {
    const { data } = await supabase
      .from("boards")
      .select("id, skin, department_id, departments(status, name)")
      .eq("company_id", companyId)
      .not("department_id", "is", null);
    deptBoards = data ?? [];
  } else {
    const { data: memberDepts } = await supabase
      .from("member_departments")
      .select("department_id")
      .eq("member_id", memberId);

    const deptIds = memberDepts?.map((d) => d.department_id) ?? [];
    if (deptIds.length > 0) {
      const { data } = await supabase
        .from("boards")
        .select("id, skin, department_id, departments(status, name)")
        .eq("company_id", companyId)
        .in("department_id", deptIds);
      deptBoards = data ?? [];
    }
  }

  return { companyBoard, deptBoards };
}

export async function getBoardPins(
  boardId: string,
  isAdmin: boolean
): Promise<PinDisplay[]> {
  const supabase = createClient();

  const { data: pins } = await supabase
    .from("pins")
    .select(
      `
      id, content, template, image_url, is_anonymous, is_hidden, created_at,
      position_x, position_y, rotation, is_edited, edited_at, author_member_id,
      author:members!pins_author_member_id_fkey(display_name),
      recipient:members!pins_recipient_member_id_fkey(display_name)
    `
    )
    .eq("board_id", boardId)
    .order("created_at", { ascending: false });

  return (pins ?? []).map((pin) => {
    const author = pin.author as { display_name: string } | null;
    const recipient = pin.recipient as { display_name: string } | null;
    return {
      id: pin.id,
      content: pin.content,
      template: pin.template as PinTemplate,
      image_url: pin.image_url,
      is_anonymous: pin.is_anonymous,
      is_hidden: pin.is_hidden,
      created_at: pin.created_at,
      author_name: pin.is_anonymous ? "Ẩn danh" : (author?.display_name ?? "—"),
      author_member_id: pin.author_member_id,
      author_real_name: author?.display_name,
      recipient_name: recipient?.display_name ?? null,
      show_real_author: isAdmin && pin.is_anonymous,
      is_edited: pin.is_edited ?? false,
      edited_at: pin.edited_at ?? null,
      position_x: pin.position_x ?? 0,
      position_y: pin.position_y ?? 0,
      rotation: pin.rotation ?? 0,
    };
  });
}

export async function getCompanyMembers(companyId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("members")
    .select("id, display_name, role, user_id")
    .eq("company_id", companyId)
    .order("display_name");
  return data ?? [];
}
