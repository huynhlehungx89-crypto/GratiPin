/**
 * Phase 5.16 smoke: đổi skin → nền board đổi màu ngay
 * Usage: node scripts/phase-5.16-smoke.mjs [baseUrl]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const baseUrl = process.argv[2] ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

function loadEnv() {
  const raw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
  const get = (key) => raw.match(new RegExp(`^${key}=(.+)$`, "m"))?.[1]?.trim();
  return {
    url: get("NEXT_PUBLIC_SUPABASE_URL"),
    serviceKey: get("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

const SKIN_BG = {
  wood: "c4a574",
  felt: "5c4a5e",
  linen: "e8e0d4",
  chalkboard: "3d5a4c",
};

async function main() {
  const { url, serviceKey } = loadEnv();
  const admin = createClient(url, serviceKey);
  const { data: company } = await admin
    .from("companies")
    .select("id, slug")
    .eq("slug", "cong-ty-mau-a")
    .single();
  const { data: board } = await admin
    .from("boards")
    .select("id, skin")
    .eq("company_id", company.id)
    .is("department_id", null)
    .single();

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/login`);
  await page.locator('input[name="email"]').fill("admin-a@gratipin.test");
  await page.locator('input[name="password"]').fill("GratiPin@Seed2026");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/cong-ty-mau-a/board**");

  const targetSkin = board.skin === "felt" ? "linen" : "felt";
  await page.goto(`${baseUrl}/cong-ty-mau-a/board/${board.id}/settings`);
  await page.locator("select").selectOption(targetSkin);
  await page.waitForURL("**/cong-ty-mau-a/board**", { timeout: 15000 });

  const canvas = page.locator(".overflow-auto.bg-cream\\/30 > div").first();
  const bg = await canvas.evaluate((el) => getComputedStyle(el).backgroundColor);
  const hex = SKIN_BG[targetSkin];
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  if (!bg.includes(`rgb(${r}, ${g}, ${b})`) && !bg.includes(`rgba(${r}, ${g}, ${b}`)) {
    throw new Error(`Skin ${targetSkin} expected rgb(${r},${g},${b}) but got ${bg}`);
  }

  await admin.from("boards").update({ skin: board.skin }).eq("id", board.id);
  console.log("Phase 5.16 smoke OK: board background matches skin", targetSkin);
  await browser.close();
}

main().catch((err) => {
  console.error("Phase 5.16 smoke failed:", err);
  process.exit(1);
});
