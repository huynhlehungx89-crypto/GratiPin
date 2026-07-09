import { test, expect } from "@playwright/test";
import {
  SEED_PASSWORD,
  USERS,
  testRlsIsolation,
  enableEmbedForCompanyBoard,
  cleanupE2eCompany,
  createCompanyViaApi,
} from "./helpers";

function pinOnBoard(page: import("@playwright/test").Page, content: string) {
  return page.locator("article[data-pin-export]").filter({ hasText: content });
}

async function openCreatePinModal(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: "Thêm ghim" }).click();
  await expect(page.getByRole("heading", { name: "Đăng ghim mới" })).toBeVisible();
}

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/login");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(SEED_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
}

test.describe("GratiPin E2E", () => {
  const e2eSlugPrefix = "e2e-test";

  test.afterAll(async () => {
    await cleanupE2eCompany(e2eSlugPrefix);
  });

  test("E2E-01: Trang chủ hiển thị đúng", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Nơi lưu giữ mọi lời cảm ơn/ })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Tạo bảng ghim miễn phí cho công ty bạn" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
  });

  test("E2E-02: Đăng nhập admin → vào bảng chung", async ({ page }) => {
    await login(page, USERS.adminA.email);
    await page.waitForURL(`**/${USERS.adminA.slug}/board**`);
    await expect(page.getByRole("button", { name: "Thêm ghim" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Bảng chung/ })).toBeVisible();
  });

  test("E2E-03: RLS — user khác company không thấy dữ liệu chéo", async () => {
    const { pass, userASlugs, userBSlugs } = await testRlsIsolation();
    expect(pass, `A=${userASlugs.join()}, B=${userBSlugs.join()}`).toBe(true);
  });

  test("E2E-04: Middleware — user B không vào được board công ty A", async ({ page }) => {
    await login(page, USERS.userB1.email);
    await page.waitForURL(`**/${USERS.userB1.slug}/board**`);
    const res = await page.goto(`/${USERS.adminA.slug}/board`);
    expect(res?.status()).toBe(404);
  });

  test("E2E-05: Đăng ký công ty mới → login → board rỗng", async ({ page }) => {
    const unique = Date.now();
    const slug = `${e2eSlugPrefix}-${unique}`;
    const email = `e2e-admin-${unique}@gratipin.test`;

    await createCompanyViaApi({
      slug,
      name: `E2E Test ${unique}`,
      email,
      displayName: "E2E Admin",
    });

    await login(page, email);
    await page.waitForURL(`**/${slug}/board**`);
    await expect(page.getByText("Chưa có ghim nào")).toBeVisible();
  });

  test("E2E-06: Tạo ghim trên bảng chung", async ({ page }) => {
    await login(page, USERS.adminA.email);
    await page.waitForURL(`**/${USERS.adminA.slug}/board**`);

    const pinContent = `E2E ghim ${Date.now()}`;
    await openCreatePinModal(page);
    await page.getByPlaceholder("Viết lời biết ơn, kỷ niệm...").fill(pinContent);
    await page.getByRole("button", { name: "Đăng ghim", exact: true }).click();
    await page.waitForLoadState("networkidle");
    await expect(pinOnBoard(page, pinContent).first()).toBeVisible({ timeout: 15_000 });
  });

  test("E2E-07: Admin tạo phòng ban", async ({ page }) => {
    await login(page, USERS.adminA.email);
    await page.waitForURL(`**/${USERS.adminA.slug}/board**`);

    await page.goto(`/${USERS.adminA.slug}/admin/departments`);
    const deptName = `Phòng E2E ${Date.now()}`;
    await page.getByPlaceholder("Tên phòng ban").fill(deptName);
    await page.getByRole("button", { name: "Tạo" }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(deptName)).toBeVisible({ timeout: 15_000 });
  });

  test("E2E-08: Connecta admin — user thường nhận 404", async ({ page }) => {
    await login(page, USERS.adminA.email);
    await page.waitForURL(`**/${USERS.adminA.slug}/board**`);
    const res = await page.goto("/connecta-admin");
    expect(res?.status()).toBe(404);
  });

  test("E2E-09: Embed board read-only với token hợp lệ", async ({ page }) => {
    const { boardId, token } = await enableEmbedForCompanyBoard(USERS.adminA.slug);
    const res = await page.goto(`/embed/${boardId}?token=${token}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng ghim" })).toHaveCount(0);
  });

  test("E2E-10: Embed — token sai hiện lỗi", async ({ page }) => {
    const { boardId } = await enableEmbedForCompanyBoard(USERS.adminA.slug);
    await page.goto(`/embed/${boardId}?token=wrong-token`);
    await expect(page.getByText("Không thể hiển thị bảng ghim này")).toBeVisible();
  });

  test("E2E-11: Admin từ chối ghim (trang Kiểm duyệt)", async ({ page }) => {
    await login(page, USERS.adminA.email);
    await page.waitForURL(`**/${USERS.adminA.slug}/board**`);

    const pinContent = `E2E hide me ${Date.now()}`;
    await openCreatePinModal(page);
    await page.getByPlaceholder(/Viết lời biết ơn/).fill(pinContent);
    await page.getByRole("button", { name: "Đăng ghim", exact: true }).click();
    await page.waitForLoadState("networkidle");
    await expect(pinOnBoard(page, pinContent).first()).toBeVisible({ timeout: 15_000 });

    await page.goto(`/${USERS.adminA.slug}/admin/pins`);
    const pinRow = page
      .locator(".border-b.border-umber\\/10")
      .filter({ hasText: pinContent });
    await expect(pinRow).toBeVisible();
    page.once("dialog", (d) => d.accept());
    await pinRow.getByRole("button", { name: "Từ chối" }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Không còn ghim chờ kiểm duyệt")).toBeVisible({
      timeout: 10_000,
    }).catch(async () => {
      await expect(pinRow).toHaveCount(0);
    });

    await page.goto(`/${USERS.adminA.slug}/board`);
    await expect(pinOnBoard(page, pinContent)).toHaveCount(0);
  });

  test("E2E-12b: User thường không thấy Ẩn ghim trên board", async ({ page }) => {
    await login(page, "user-a2@gratipin.test");
    await page.waitForURL(`**/${USERS.userA1.slug}/board**`);

    await expect(page.getByRole("button", { name: "Ẩn ghim" })).toHaveCount(0);

    const menus = page.getByRole("button", { name: "Tuỳ chọn ghim" });
    const count = await menus.count();
    for (let i = 0; i < count; i++) {
      await menus.nth(i).click();
      await expect(page.getByRole("button", { name: "Ẩn ghim" })).toHaveCount(0);
      await page.keyboard.press("Escape");
    }
  });

  test("E2E-12: Admin ẩn ghim từ menu trên board", async ({ page }) => {
    await login(page, USERS.adminA.email);
    await page.waitForURL(`**/${USERS.adminA.slug}/board**`);

    const pinContent = `E2E board hide ${Date.now()}`;
    await openCreatePinModal(page);
    await page.getByPlaceholder(/Viết lời biết ơn/).fill(pinContent);
    await page.getByRole("button", { name: "Đăng ghim", exact: true }).click();
    await page.waitForLoadState("networkidle");
    const pinArticle = page.locator("[data-pin-export]").filter({ hasText: pinContent }).first();
    await expect(pinArticle).toBeVisible({ timeout: 15_000 });

    await pinArticle.locator("..").getByRole("button", { name: "Tuỳ chọn ghim" }).click();
    page.once("dialog", (d) => d.accept());
    await pinArticle
      .locator("..")
      .getByRole("button", { name: "Ẩn ghim" })
      .click();
    await expect(pinOnBoard(page, pinContent)).toHaveCount(0, { timeout: 10_000 });
  });
});
