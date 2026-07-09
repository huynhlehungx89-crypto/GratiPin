import { chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3003";
const EMAIL = "admin-a@gratipin.test";
const PASSWORD = "GratiPin@Seed2026";
const SLUG = "cong-ty-mau-a";

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(`**/${SLUG}/board**`);
}

async function main() {
  fs.mkdirSync("docs/screenshots", { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await login(page);

  const settingsLink = page.getByRole("link", { name: "Cài đặt bảng", exact: true });
  await settingsLink.waitFor({ timeout: 10000 });
  await page.screenshot({ path: "docs/screenshots/phase-5.14-board-settings-icon.png" });

  await settingsLink.click();
  await page.waitForURL(`**/${SLUG}/board/**/settings**`);
  const skinSelect = page.locator("select").first();
  const current = await skinSelect.inputValue();
  const next = current === "wood" ? "felt" : "wood";
  const nextLabel = next === "felt" ? "Nỉ" : "Gỗ";
  await Promise.all([page.waitForNavigation(), skinSelect.selectOption(next)]);
  await page.waitForLoadState("networkidle");

  await page.goto(`${BASE}/${SLUG}/board`);
  await page.waitForLoadState("networkidle");
  const badge = page.locator("nav").getByText(/Bảng chung/).first();
  const text = await badge.innerText();
  if (!text.includes(nextLabel)) {
    throw new Error(`Skin change not reflected in nav badge: ${text}, expected ${nextLabel}`);
  }

  console.log("OK: settings icon on Bảng chung + skin change works");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
