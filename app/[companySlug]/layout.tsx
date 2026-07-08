import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { companySlug: string };
}) {
  const supabase = createClient();
  const { data: company } = await supabase
    .from("companies")
    .select("id, name, logo_url, slug")
    .eq("slug", params.companySlug)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: member } = user
    ? await supabase
        .from("members")
        .select("role")
        .eq("user_id", user.id)
        .eq("company_id", company?.id ?? "")
        .maybeSingle()
    : { data: null };

  const isAdmin = member?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="shrink-0 border-b border-umber/10 bg-white/60 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {company?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo_url}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <span className="font-heading text-lg text-umber">{company?.name}</span>
          </div>
          <nav className="flex flex-wrap items-center gap-3 text-sm">
            <Link href={`/${params.companySlug}/board`} className="hover:text-peach">
              Bảng ghim
            </Link>
            {isAdmin && (
              <>
                <Link
                  href={`/${params.companySlug}/admin/members`}
                  className="hover:text-peach"
                >
                  Thành viên
                </Link>
                <Link
                  href={`/${params.companySlug}/admin/departments`}
                  className="hover:text-peach"
                >
                  Phòng ban
                </Link>
                <Link
                  href={`/${params.companySlug}/admin/pins`}
                  className="hover:text-peach"
                >
                  Kiểm duyệt
                </Link>
                <Link
                  href={`/${params.companySlug}/admin/settings`}
                  className="hover:text-peach"
                >
                  Cài đặt
                </Link>
              </>
            )}
            <form action={logout}>
              <button type="submit" className="text-umber/70 hover:text-peach">
                Đăng xuất
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
