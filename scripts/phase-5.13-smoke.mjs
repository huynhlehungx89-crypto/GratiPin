import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3002";
const SEED_PASSWORD = "GratiPin@Seed2026";
const USERS = {
  adminA: { email: "admin-a@gratipin.test", slug: "cong-ty-mau-a" },
  userA1: { email: "user-a1@gratipin.test", slug: "cong-ty-mau-a" },
};

function createServiceClient() {
  const raw = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  const get = (key) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return createClient(get("NEXT_PUBLIC_SUPABASE_URL"), get("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function login(page, email) {
  await page.goto(`${BASE}/login`);
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

async function main() {
  const db = createServiceClient();
  const slug = USERS.adminA.slug;

  const { data: company } = await db.from("companies").select("id").eq("slug", slug).single();
  const { data: companyBoard } = await db
    .from("boards")
    .select("id")
    .eq("company_id", company.id)
    .is("department_id", null)
    .single();

  const { data: authData } = await db.auth.admin.listUsers();
  const userId = authData.users.find((u) => u.email === USERS.userA1.email)?.id;
  const { data: userMember } = await db
    .from("members")
    .select("id")
    .eq("company_id", company.id)
    .eq("user_id", userId)
    .single();

  if (!companyBoard || !userMember) throw new Error("Seed data missing");

  await db.from("board_admins").delete().eq("board_id", companyBoard.id);
  await db.from("board_admins").insert({
    board_id: companyBoard.id,
    member_id: userMember.id,
  });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await login(page, USERS.userA1.email);
  await page.waitForURL(`**/${slug}/board**`);

  await page.getByRole("link", { name: "Kiểm duyệt" }).waitFor({ timeout: 10000 });
  if (await page.locator("nav").getByText("Cài đặt", { exact: true }).count()) {
    throw new Error("Board Admin should not see Cài đặt nav");
  }

  const settingsRes = await page.goto(`${BASE}/${slug}/board/${companyBoard.id}/settings`);
  if (settingsRes?.status() !== 200) throw new Error("Board Admin cannot open settings");

  if (await page.getByText("Lưu Board Admin").isVisible()) {
    throw new Error("Board Admin should not see assign Board Admin UI");
  }

  await login(page, USERS.adminA.email);
  await page.waitForURL(`**/${slug}/board**`);
  await page.locator("nav").getByText("Cài đặt", { exact: true }).click();
  await page.getByRole("link", { name: "Phòng ban" }).click();
  await page.getByRole("link", { name: /Cài đặt bảng \(skin/ }).waitFor();

  console.log("OK: Board Admin scoped access + company Admin full nav");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
