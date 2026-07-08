import { createClient } from "@/lib/supabase/server";

export default async function CompanyBoardPage({
  params,
}: {
  params: { companySlug: string };
}) {
  const supabase = createClient();

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("slug", params.companySlug)
    .single();

  const { data: board } = await supabase
    .from("boards")
    .select("id, skin")
    .eq("company_id", company?.id ?? "")
    .is("department_id", null)
    .single();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="font-heading text-2xl text-umber">Bảng chung công ty</h1>
      <p className="mt-2 text-umber/70">
        Chào mừng đến với {company?.name}. Bảng ghim sẽ hiển thị tại đây.
      </p>
      {board && (
        <p className="mt-4 text-sm text-umber/60">Skin: {board.skin}</p>
      )}
    </main>
  );
}
