import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnv() {
  const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
  const get = (key) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

const SEED_PASSWORD = "GratiPin@Seed2026";

const COMPANIES = [
  {
    name: "Công ty Mẫu A",
    slug: "cong-ty-mau-a",
    admin: { email: "admin-a@gratipin.test", displayName: "Admin Công ty A" },
    users: [
      { email: "user-a1@gratipin.test", displayName: "Nhân viên A1" },
      { email: "user-a2@gratipin.test", displayName: "Nhân viên A2" },
    ],
  },
  {
    name: "Công ty Mẫu B",
    slug: "cong-ty-mau-b",
    admin: { email: "admin-b@gratipin.test", displayName: "Admin Công ty B" },
    users: [
      { email: "user-b1@gratipin.test", displayName: "Nhân viên B1" },
      { email: "user-b2@gratipin.test", displayName: "Nhân viên B2" },
    ],
  },
];

async function ensureAuthUser(admin, email) {
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  return data.user.id;
}

async function seedCompany(admin, seed) {
  const { data: existingCompany } = await admin
    .from("companies")
    .select("id")
    .eq("slug", seed.slug)
    .maybeSingle();

  let companyId = existingCompany?.id;

  if (!companyId) {
    const { data: company, error } = await admin
      .from("companies")
      .insert({ name: seed.name, slug: seed.slug, onboarding_completed: true })
      .select("id")
      .single();
    if (error) throw error;
    companyId = company.id;

    const { error: boardError } = await admin.from("boards").insert({
      company_id: companyId,
      department_id: null,
      skin: "wood",
    });
    if (boardError) throw boardError;
  }

  const adminUserId = await ensureAuthUser(admin, seed.admin.email);
  const { data: existingAdminMember } = await admin
    .from("members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", adminUserId)
    .maybeSingle();

  let adminMemberId = existingAdminMember?.id;

  if (!existingAdminMember) {
    const { data: inserted, error } = await admin
      .from("members")
      .insert({
        user_id: adminUserId,
        company_id: companyId,
        display_name: seed.admin.displayName,
        role: "admin",
        is_owner: true,
      })
      .select("id")
      .single();
    if (error) throw error;
    adminMemberId = inserted.id;
  }

  if (adminMemberId) {
    await ensureOnboardingFlags(admin, companyId, adminMemberId);
  }

  for (const user of seed.users) {
    const userId = await ensureAuthUser(admin, user.email);
    const { data: existingMember } = await admin
      .from("members")
      .select("id")
      .eq("company_id", companyId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!existingMember) {
      const { error } = await admin.from("members").insert({
        user_id: userId,
        company_id: companyId,
        display_name: user.displayName,
        role: "user",
      });
      if (error) throw error;
    }
  }

  console.log(`Seeded: ${seed.name} (${seed.slug})`);
}

async function ensureOnboardingFlags(admin, companyId, adminMemberId) {
  await admin
    .from("companies")
    .update({ onboarding_completed: true })
    .eq("id", companyId);
  await admin
    .from("members")
    .update({ is_owner: true })
    .eq("id", adminMemberId);
}

async function main() {
  const { url, serviceKey } = loadEnv();
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const company of COMPANIES) {
    await seedCompany(admin, company);
  }

  console.log("\nSeed hoàn tất. Mật khẩu chung:", SEED_PASSWORD);
  console.log("Dùng admin-a@gratipin.test / admin-b@gratipin.test để test RLS.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
