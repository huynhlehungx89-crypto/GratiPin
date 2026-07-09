import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CompanyNav } from "@/components/layout/CompanyNav";
import { UserMenu } from "@/components/layout/UserMenu";
import {
  getNavBoardOptions,
  resolveDefaultBoardHref,
} from "@/lib/data/nav";
import { canAccessModeration, getBoardAdminBoardIds } from "@/lib/data/boardAdmin";
import { getUnreviewedPinCount } from "@/lib/data/moderation";

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
        .select("id, role, default_board_id, display_name")
        .eq("user_id", user.id)
        .eq("company_id", company?.id ?? "")
        .maybeSingle()
    : { data: null };

  const isCompanyAdmin = member?.role === "admin";
  const boardAdminBoardIds = member ? await getBoardAdminBoardIds(member.id) : [];
  const canModerate = canAccessModeration(isCompanyAdmin, boardAdminBoardIds);

  const boards =
    company && member
      ? await getNavBoardOptions(
          params.companySlug,
          company.id,
          member.id,
          isCompanyAdmin
        )
      : [];

  const defaultBoardHref = resolveDefaultBoardHref(
    params.companySlug,
    boards,
    member?.default_board_id ?? null
  );

  const unreviewedPinCount =
    canModerate && company
      ? await getUnreviewedPinCount(
          company.id,
          isCompanyAdmin ? null : boardAdminBoardIds
        )
      : 0;

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
            {member && (
              <CompanyNav
                companySlug={params.companySlug}
                defaultBoardHref={defaultBoardHref}
                boards={boards}
                defaultBoardId={member.default_board_id}
                isCompanyAdmin={isCompanyAdmin}
                canModerate={canModerate}
                unreviewedPinCount={unreviewedPinCount}
              />
            )}
            {!member && (
              <Link href={`/${params.companySlug}/board`} className="hover:text-peach">
                Bảng ghim
              </Link>
            )}
            {member && (
              <UserMenu
                companySlug={params.companySlug}
                displayName={member.display_name}
              />
            )}
          </nav>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
