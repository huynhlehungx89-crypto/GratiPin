import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const EMAIL = "admin-a@gratipin.test";
const PASSWORD = "GratiPin@Seed2026";
const SLUG = "cong-ty-mau-a";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC",
  "base64"
);

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

  await page.getByRole("button", { name: "Thêm ghim" }).click();
  await page.waitForSelector('h2:has-text("Đăng ghim mới")');
  await page.screenshot({ path: "docs/screenshots/phase-5.11-form.png" });

  const submit = page.getByRole("button", { name: "Đăng ghim", exact: true });
  if (await submit.isEnabled()) {
    throw new Error("Submit should be disabled when both fields empty");
  }

  await page.locator('input[name="image"]').setInputFiles({
    name: "test-pin.png",
    mimeType: "image/png",
    buffer: PNG_1X1,
  });

  await page.getByRole("button", { name: "Polaroid kỷ niệm" }).click();

  if (!(await submit.isEnabled())) {
    throw new Error("Submit should be enabled with image only");
  }

  await submit.click();
  await page.waitForLoadState("networkidle");

  const pin = page.locator("article[data-pin-export]").filter({ has: page.locator("img") }).first();
  await pin.waitFor({ timeout: 15000 });
  const text = await pin.innerText();
  if (text.includes("Không có nội dung") || text.includes("(Không có")) {
    throw new Error("Image-only pin shows placeholder text");
  }

  await pin.screenshot({ path: "docs/screenshots/phase-5.11-image-only-pin.png" });
  console.log("OK: image-only pin + empty form blocked");
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
