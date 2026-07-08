import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

export const SEED_PASSWORD = "GratiPin@Seed2026";

export const USERS = {
  adminA: { email: "admin-a@gratipin.test", slug: "cong-ty-mau-a" },
  adminB: { email: "admin-b@gratipin.test", slug: "cong-ty-mau-b" },
  userA1: { email: "user-a1@gratipin.test", slug: "cong-ty-mau-a" },
  userB1: { email: "user-b1@gratipin.test", slug: "cong-ty-mau-b" },
};

function loadEnv() {
  const raw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
  const get = (key: string) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL")!,
    anonKey: get("NEXT_PUBLIC_SUPABASE_ANON_KEY")!,
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY")!,
  };
}

export function createAnonClient() {
  const { url, anonKey } = loadEnv();
  return createClient(url, anonKey);
}

export function createServiceClient() {
  const { url, serviceKey } = loadEnv();
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function testRlsIsolation(): Promise<{
  pass: boolean;
  userASlugs: string[];
  userBSlugs: string[];
}> {
  const anon = createAnonClient();

  const clientA = createAnonClient();
  await clientA.auth.signInWithPassword({
    email: USERS.userA1.email,
    password: SEED_PASSWORD,
  });
  const { data: companiesA } = await clientA.from("companies").select("slug");
  await clientA.auth.signOut();

  const clientB = createAnonClient();
  await clientB.auth.signInWithPassword({
    email: USERS.userB1.email,
    password: SEED_PASSWORD,
  });
  const { data: companiesB } = await clientB.from("companies").select("slug");
  await clientB.auth.signOut();

  const userASlugs = companiesA?.map((c) => c.slug) ?? [];
  const userBSlugs = companiesB?.map((c) => c.slug) ?? [];

  const pass =
    userASlugs.length === 1 &&
    userBSlugs.length === 1 &&
    userASlugs[0] === USERS.userA1.slug &&
    userBSlugs[0] === USERS.userB1.slug &&
    userASlugs[0] !== userBSlugs[0];

  return { pass, userASlugs, userBSlugs };
}

export async function createCompanyViaApi(opts: {
  slug: string;
  name: string;
  email: string;
  displayName: string;
}) {
  const admin = createServiceClient();
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email: opts.email,
    password: SEED_PASSWORD,
    email_confirm: true,
  });
  if (authError) throw authError;

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: opts.name, slug: opts.slug })
    .select("id, slug")
    .single();
  if (companyError) throw companyError;

  await admin.from("members").insert({
    user_id: authData.user.id,
    company_id: company.id,
    display_name: opts.displayName,
    role: "admin",
  });
  await admin.from("boards").insert({
    company_id: company.id,
    department_id: null,
    skin: "wood",
  });

  return { slug: company.slug, email: opts.email };
}

export async function enableEmbedForCompanyBoard(slug: string) {
  const admin = createServiceClient();
  const { data: company } = await admin
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single();
  if (!company) throw new Error("Company not found");

  const { data: board } = await admin
    .from("boards")
    .select("id")
    .eq("company_id", company.id)
    .is("department_id", null)
    .single();
  if (!board) throw new Error("Board not found");

  const token = `e2e-${Date.now()}`;
  await admin
    .from("boards")
    .update({ embed_enabled: true, embed_token: token })
    .eq("id", board.id);

  return { boardId: board.id, token };
}

export async function cleanupE2eCompany(slugPrefix: string) {
  const admin = createServiceClient();
  const { data: companies } = await admin
    .from("companies")
    .select("id, slug")
    .like("slug", `${slugPrefix}%`);

  for (const company of companies ?? []) {
    const { data: members } = await admin
      .from("members")
      .select("id, user_id")
      .eq("company_id", company.id);
    const memberIds = members?.map((m) => m.id) ?? [];

    if (memberIds.length > 0) {
      await admin.from("member_departments").delete().in("member_id", memberIds);
    }
    await admin.from("pins").delete().eq("company_id", company.id);
    await admin.from("boards").delete().eq("company_id", company.id);
    await admin.from("departments").delete().eq("company_id", company.id);
    await admin.from("members").delete().eq("company_id", company.id);
    await admin.from("companies").delete().eq("id", company.id);
    for (const m of members ?? []) {
      await admin.auth.admin.deleteUser(m.user_id);
    }
  }
}
