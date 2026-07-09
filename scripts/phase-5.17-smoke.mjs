/**
 * Phase 5.17 smoke: user menu → account page
 */
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/login`);
  await page.locator('input[name="email"]').fill("user-a1@gratipin.test");
  await page.locator('input[name="password"]').fill("GratiPin@Seed2026");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL("**/cong-ty-mau-a/board**");

  await page.getByRole("button", { name: /Nhân viên A1/ }).click();
  await page.getByRole("menuitem", { name: "Tài khoản của tôi" }).click();
  await page.waitForURL("**/cong-ty-mau-a/account");
  await page.getByRole("heading", { name: "Tài khoản của tôi" }).waitFor();

  console.log("Phase 5.17 smoke OK:", page.url());
  await browser.close();
}

main().catch((err) => {
  console.error("Phase 5.17 smoke failed:", err);
  process.exit(1);
});
