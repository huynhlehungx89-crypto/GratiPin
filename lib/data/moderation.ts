import { createClient } from "@/lib/supabase/server";

export async function getUnreviewedPinCount(
  companyId: string,
  boardIds: string[] | null
): Promise<number> {
  const supabase = createClient();
  let query = supabase
    .from("pins")
    .select("id", { count: "exact", head: true })
    .eq("company_id", companyId)
    .is("reviewed_at", null)
    .eq("is_hidden", false);

  if (boardIds !== null) {
    if (boardIds.length === 0) return 0;
    query = query.in("board_id", boardIds);
  }

  const { count } = await query;
  return count ?? 0;
}
