import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const publicPaths = ["/", "/login", "/signup"];
  const isPublic =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/embed/");

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const companyMatch = pathname.match(/^\/([^/]+)/);
  const reserved = new Set([
    "login",
    "signup",
    "embed",
    "connecta-admin",
    "_next",
    "favicon.ico",
  ]);

  if (user && companyMatch) {
    const slug = companyMatch[1];
    if (!reserved.has(slug) && pathname !== "/") {
      const { data: memberRow } = await supabase
        .from("members")
        .select("is_owner, companies!inner(slug, onboarding_completed)")
        .eq("user_id", user.id)
        .eq("companies.slug", slug)
        .maybeSingle();

      if (!memberRow) {
        return new NextResponse(null, { status: 404 });
      }

      const company = memberRow.companies as unknown as {
        slug: string;
        onboarding_completed: boolean;
      };

      const isBoardRoute =
        pathname === `/${slug}/board` || pathname.startsWith(`/${slug}/board/`);
      const isSetupRoute = pathname === `/${slug}/setup`;

      if (!company.onboarding_completed && memberRow.is_owner && isBoardRoute) {
        const url = request.nextUrl.clone();
        url.pathname = `/${slug}/setup`;
        return NextResponse.redirect(url);
      }

      if (isSetupRoute) {
        if (company.onboarding_completed || !memberRow.is_owner) {
          const url = request.nextUrl.clone();
          url.pathname = `/${slug}/board`;
          return NextResponse.redirect(url);
        }
      }
    }
  }

  return supabaseResponse;
}
