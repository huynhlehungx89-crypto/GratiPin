/**
 * Smoke test: pin share export must not render a fully black PNG.
 * Covers all 7 templates (text-only); polaroid also tested with image.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3001";
const EMAIL = "admin-a@gratipin.test";
const PASSWORD = "GratiPin@Seed2026";
const SLUG = "cong-ty-mau-a";

const TEMPLATES = [
  { label: "Giấy note viết tay", key: "note" },
  { label: "Polaroid kỷ niệm", key: "polaroid" },
  { label: "Thiệp hoa lá", key: "floral" },
  { label: "Washi tape", key: "washi" },
  { label: "Vườn Xanh", key: "garden" },
  { label: "Nắng Ấm", key: "sunshine" },
  { label: "Thư Yêu Thương", key: "love" },
];

async function makeTestPng(page) {
  const bytes = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#e9a87c";
    ctx.fillRect(0, 0, 64, 64);
    const blob = await new Promise((resolve, reject) => {
      c.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
    });
    return Array.from(new Uint8Array(await blob.arrayBuffer()));
  });
  return Buffer.from(bytes);
}

async function login(page) {
  await page.goto(`${BASE}/login`);
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(`**/${SLUG}/board**`);
}

async function avgBrightness(page, pngPath) {
  const b64 = fs.readFileSync(pngPath).toString("base64");
  return page.evaluate(async (dataUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        if (!ctx) {
          reject(new Error("no canvas"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let sum = 0;
        const pixels = d.length / 4;
        for (let i = 0; i < d.length; i += 4) {
          sum += d[i] + d[i + 1] + d[i + 2];
        }
        resolve(sum / pixels / 3);
      };
      img.onerror = () => reject(new Error("image load failed"));
      img.src = dataUrl;
    });
  }, `data:image/png;base64,${b64}`);
}

async function createPin(page, { template, content, withImage, testPng }) {
  await page.getByRole("button", { name: "Thêm ghim" }).click();
  await page.waitForSelector('h2:has-text("Đăng ghim mới")');

  if (withImage) {
    await page.locator('input[name="image"]').setInputFiles({
      name: "test-pin.png",
      mimeType: "image/png",
      buffer: testPng,
    });
    await page.locator('form img').first().waitFor({ timeout: 10_000 });
  }

  await page.getByPlaceholder(/Viết lời biết ơn/).fill(content);
  await page.getByRole("button", { name: template.label }).click();
  await page.getByRole("button", { name: "Đăng ghim", exact: true }).click();
  await page.waitForLoadState("networkidle");

  const pinArticle = page.locator("article[data-pin-export]").filter({ hasText: content }).first();
  await pinArticle.waitFor({ timeout: withImage ? 30_000 : 15_000 });
  await pinArticle.scrollIntoViewIfNeeded();
}

async function exportSharePng(page, content, savePath) {
  const pinArticle = page.locator("article[data-pin-export]").filter({ hasText: content }).first();
  const shareBtn = pinArticle.locator("xpath=..").getByRole("button", { name: "Chia sẻ" });
  await shareBtn.waitFor({ state: "visible" });
  await shareBtn.waitFor({ hasText: "Chia sẻ", timeout: 60_000 });

  const downloadPromise = page.waitForEvent("download", { timeout: 60_000 });
  await shareBtn.evaluate((el) => el.click());
  const download = await downloadPromise;
  await download.saveAs(savePath);
  await page.waitForTimeout(800);
}

async function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gratipin-share-"));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await login(page);
  const testPng = await makeTestPng(page);

  const results = [];

  for (const template of TEMPLATES) {
    const content = `Share smoke ${template.key} ${Date.now()}`;
    await createPin(page, {
      template,
      content,
      withImage: template.key === "polaroid",
      testPng,
    });

    const savePath = path.join(tmpDir, `${template.key}.png`);
    await exportSharePng(page, content, savePath);

    const brightness = await avgBrightness(page, savePath);
    results.push({ template: template.key, brightness, savePath });
    if (brightness < 40) {
      throw new Error(
        `${template.key}: export too dark (avg brightness ${brightness.toFixed(1)}, expected cream pin content)`
      );
    }
    console.log(`OK ${template.key}: avg brightness ${brightness.toFixed(1)}`);
  }

  // Extra: note + polaroid with uploaded image (CORS / tainted canvas check)
  for (const key of ["note", "sunshine"]) {
    const template = TEMPLATES.find((t) => t.key === key);
    const imgContent = `Share smoke ${key}-img ${Date.now()}`;
    await createPin(page, {
      template,
      content: imgContent,
      withImage: true,
      testPng,
    });
    const imgPath = path.join(tmpDir, `${key}-with-image.png`);
    await exportSharePng(page, imgContent, imgPath);
    const imgBrightness = await avgBrightness(page, imgPath);
    if (imgBrightness < 40) {
      throw new Error(`${key}-with-image: too dark (${imgBrightness.toFixed(1)})`);
    }
    console.log(`OK ${key}-with-image: avg brightness ${imgBrightness.toFixed(1)}`);
  }

  console.log("All share exports passed:", results.map((r) => r.template).join(", "));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
