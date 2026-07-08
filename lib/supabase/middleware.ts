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
      const { data: memberships } = await supabase
        .from("members")
        .select("companies(slug)")
        .eq("user_id", user.id);

      const isMember = memberships?.some((m) => {
        const company = m.companies as unknown as { slug: string } | null;
        return company?.slug === slug;
      });

      if (!isMember) {
        return new NextResponse(null, { status: 404 });
      }
    }
  }

  return supabaseResponse;
}
