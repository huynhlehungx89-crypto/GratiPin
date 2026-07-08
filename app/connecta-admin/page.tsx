import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function isPlatformAdmin(email: string | undefined): boolean {
  if (!email) return false;
  const list = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

export default async function ConnectaAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!isPlatformAdmin(user?.email)) {
    notFound();
  }

  const admin = createAdminClient();
  const { data: companies } = await admin
    .from("companies")
    .select("id, name, slug, created_at")
    .order("created_at", { ascending: false });

  const rows = await Promise.all(
    (companies ?? []).map(async (company) => {
      const [membersRes, departmentsRes, pinsRes, adminMemberRes] =
        await Promise.all([
          admin
            .from("members")
            .select("id", { count: "exact", head: true })
            .eq("company_id", company.id),
          admin
            .from("departments")
            .select("id", { count: "exact", head: true })
            .eq("company_id", company.id),
          admin
            .from("pins")
            .select("id", { count: "exact", head: true })
            .eq("company_id", company.id),
          admin
            .from("members")
            .select("user_id")
            .eq("company_id", company.id)
            .eq("role", "admin")
            .limit(1)
            .maybeSingle(),
        ]);

      let adminEmail = "—";
      if (adminMemberRes.data?.user_id) {
        const { data: authUser } = await admin.auth.admin.getUserById(
          adminMemberRes.data.user_id
        );
        adminEmail = authUser.user?.email ?? "—";
      }

      return {
        ...company,
        adminEmail,
        memberCount: membersRes.count ?? 0,
        departmentCount: departmentsRes.count ?? 0,
        pinCount: pinsRes.count ?? 0,
      };
    })
  );

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="font-heading text-3xl text-umber">Connecta Platform Admin</h1>
      <p className="mt-2 text-umber/70">Danh sách toàn bộ công ty đã đăng ký</p>

      <div className="mt-8 overflow-x-auto rounded-xl border border-umber/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-umber/10 bg-cream">
            <tr>
              <th className="px-4 py-3 font-medium">Tên công ty</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 font-medium">Email admin</th>
              <th className="px-4 py-3 font-medium">Thành viên</th>
              <th className="px-4 py-3 font-medium">Phòng ban</th>
              <th className="px-4 py-3 font-medium">Ghim</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-umber/5">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{row.slug}</td>
                <td className="px-4 py-3">
                  {new Date(row.created_at).toLocaleDateString("vi-VN")}
                </td>
                <td className="px-4 py-3">{row.adminEmail}</td>
                <td className="px-4 py-3">{row.memberCount}</td>
                <td className="px-4 py-3">{row.departmentCount}</td>
                <td className="px-4 py-3">{row.pinCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
