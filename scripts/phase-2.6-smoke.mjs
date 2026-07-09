/**
 * Phase 2.6 smoke: owner with incomplete onboarding → setup wizard → board
 * Usage: node scripts/phase-2.6-smoke.mjs [baseUrl]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.argv[2] ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const slug = `wizard-smoke-${Date.now()}`;
const email = `wizard-${Date.now()}@gratipin.test`;
const password = "TestPass123!";

function loadEnv() {
  const raw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
  const get = (key) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function createOwnerCompany() {
  const { url, serviceKey } = loadEnv();
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authError) throw authError;

  const { data: company, error: companyError } = await admin
    .from("companies")
    .insert({ name: "Wizard Smoke Co", slug, onboarding_completed: false })
    .select("id, slug")
    .single();
  if (companyError) throw companyError;

  await admin.from("members").insert({
    user_id: authData.user.id,
    company_id: company.id,
    display_name: "Wizard Owner",
    role: "admin",
    is_owner: true,
  });
  await admin.from("boards").insert({
    company_id: company.id,
    department_id: null,
    skin: "wood",
  });

  return { slug: company.slug, email };
}

async function cleanup() {
  const { url, serviceKey } = loadEnv();
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: company } = await admin.from("companies").select("id").eq("slug", slug).maybeSingle();
  if (!company) return;
  const { data: members } = await admin.from("members").select("user_id").eq("company_id", company.id);
  await admin.from("boards").delete().eq("company_id", company.id);
  await admin.from("members").delete().eq("company_id", company.id);
  await admin.from("companies").delete().eq("id", company.id);
  for (const m of members ?? []) {
    await admin.auth.admin.deleteUser(m.user_id);
  }
}

async function main() {
  await createOwnerCompany();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/login`);
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await page.waitForURL(`**/${slug}/setup`, { timeout: 15000 });
    await page.getByRole("button", { name: "Bắt đầu" }).click();
    await page.getByRole("button", { name: "Tiếp tục" }).click();
    await page.getByRole("button", { name: "Bỏ qua" }).first().click();
    await page.getByRole("button", { name: "Bỏ qua" }).click();
    await page.getByRole("button", { name: "Vào Bảng chung" }).click();

    await page.waitForURL(`**/${slug}/board`, { timeout: 15000 });
    console.log("Phase 2.6 smoke OK:", page.url());
  } finally {
    await browser.close();
    await cleanup();
  }
}

main().catch(async (err) => {
  console.error("Phase 2.6 smoke failed:", err);
  await cleanup().catch(() => {});
  process.exit(1);
});
