# TASKS — GratiPin

Làm tuần tự từ Phase 0 → Phase 9, không nhảy cóc. Sau mỗi task, chạy thử và xác nhận hoạt động trước khi sang task kế. Đọc `docs/AGENT_RULES.md` và `docs/SPEC.md` trước khi bắt đầu.

---

## Phase 0 — Khởi tạo dự án

- [ ] 0.1 Tạo project Next.js 14 (App Router, TypeScript, Tailwind CSS bật sẵn)
- [ ] 0.2 Cài `@supabase/supabase-js`, `@supabase/ssr`, `zod`
- [ ] 0.3 Tạo project Supabase mới (hoặc dùng project có sẵn nếu được cung cấp), lấy `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`, lưu vào `.env.local`
- [ ] 0.4 Cấu hình Google Fonts (Fredoka/Quicksand + Inter/Nunito) với subset `vietnamese`, import trong `app/layout.tsx`
- [ ] 0.5 Setup Tailwind theme: khai báo màu trong `tailwind.config.ts` theo đúng mục 8 của `docs/AGENT_RULES.md` (đặt tên token: `cream`, `peach`, `butter`, `mint`, `umber`)
- [ ] 0.6 Commit theo đúng format ở `docs/AGENT_RULES.md` mục 10 — báo cáo: project chạy được `npm run dev`, Tailwind + font hiển thị đúng

---

## Phase 1 — Database schema & RLS

- [ ] 1.1 Viết migration SQL tạo đủ 6 bảng: `companies`, `members`, `departments`, `member_departments`, `boards`, `pins` — đúng schema ở `docs/AGENT_RULES.md` mục 4
- [ ] 1.2 Bật RLS cho cả 6 bảng
- [ ] 1.3 Viết policy: user chỉ đọc/ghi được record có `company_id` khớp với công ty của mình (qua bảng `members`)
- [ ] 1.4 Viết policy riêng: chỉ `role = 'admin'` được ghi vào `members`, `departments`, `companies.logo_url`, và cập nhật `pins.is_hidden`
- [ ] 1.5 Chạy `supabase gen types typescript` sinh type, lưu vào `lib/database.types.ts`
- [ ] 1.6 Viết seed script tạo 1 công ty mẫu + 1 admin + 2 user để test thủ công xuyên suốt quá trình build
- [ ] 1.7 Commit — báo cáo: migration chạy thành công, RLS test bằng 2 user khác company không thấy dữ liệu của nhau

---

## Phase 2 — Đăng ký công ty & Auth

- [ ] 2.1 Trang `/signup`: form tạo công ty mới — tên công ty, upload logo (resize theo mục 6 của `docs/AGENT_RULES.md`), email + mật khẩu admin đầu tiên
- [ ] 2.2 Khi submit: tạo user qua Supabase Auth → tạo record `companies` (sinh `slug` tự động, kiểm tra trùng) → tạo record `members` với `role = 'admin'` → tự động tạo 1 `boards` record với `department_id = null` (bảng chung công ty)
- [ ] 2.3 Trang `/login`: đăng nhập bằng email/mật khẩu → sau khi login, tra `members` để biết `company_slug` → redirect vào `/{slug}/board`
- [ ] 2.4 Middleware: bảo vệ mọi route `/[companySlug]/*` — kiểm tra user đã login và là member của đúng company đó
- [ ] 2.5 Commit — báo cáo: đăng ký công ty mới → login → vào được bảng chung rỗng

---

## Phase 2.5 — Trang quản trị nền tảng (Connecta Platform Admin)

- [ ] 2.5.1 Thêm biến môi trường `PLATFORM_ADMIN_EMAILS` vào `.env.local` (email thật của người quản trị Connecta, phân tách bằng dấu phẩy)
- [ ] 2.5.2 Route `app/connecta-admin/page.tsx`: kiểm tra email session hiện tại có trong `PLATFORM_ADMIN_EMAILS` không — không khớp thì trả 404
- [ ] 2.5.3 Query bằng service-role client: liệt kê tất cả `companies`, kèm đếm số `members`, `departments`, `pins` mỗi công ty (dùng `count` trong Supabase query hoặc SQL view riêng)
- [ ] 2.5.4 Hiển thị bảng: Tên công ty | Slug | Ngày tạo | Email admin công ty | Số thành viên | Số phòng ban | Số ghim — sắp xếp mới nhất lên đầu
- [ ] 2.5.5 Commit — báo cáo: vào `/connecta-admin` bằng email trong danh sách thấy được toàn bộ công ty; thử email khác nhận 404

---

## Phase 3 — Quản lý user & phòng ban (Admin)

- [ ] 3.1 Trang `/[companySlug]/admin/members`: danh sách user trong công ty, form thêm user mới (tạo qua Supabase Auth admin API hoặc gửi invite — chọn cách đơn giản nhất cho MVP), nút xoá user
- [ ] 3.2 Cho phép gán/bỏ user vào nhiều `departments` cùng lúc (checkbox multi-select), ghi vào `member_departments`
- [ ] 3.3 Trang `/[companySlug]/admin/departments`: danh sách phòng ban, tạo phòng ban mới (kèm chọn board skin ngay lúc tạo) → tự động tạo `boards` record tương ứng
- [ ] 3.4 Nút "Giải thể phòng ban": chuyển `departments.status = 'archived'`, KHÔNG xoá board hay pins liên quan — chỉ chặn tạo pin mới vào board đó (validate ở Phase 5)
- [ ] 3.5 Trang `/[companySlug]/admin/settings`: đổi tên công ty, đổi logo
- [ ] 3.6 Ràng buộc: không cho hạ quyền/xoá admin cuối cùng của công ty (luôn phải còn ít nhất 1 admin)
- [ ] 3.7 Commit — báo cáo: tạo được phòng ban, gán user, giải thể phòng ban không mất dữ liệu

---

## Phase 4 — Board & Board Skins

- [ ] 4.1 Component `<Board>`: nhận `skin` prop, render nền tương ứng (wood/felt/linen/chalkboard) — dùng CSS/texture nhẹ theo mô tả ở `docs/SPEC.md` mục 3.4
- [ ] 4.2 Trang `/[companySlug]/board`: hiển thị bảng chung công ty (board có `department_id = null`)
- [ ] 4.3 Trang `/[companySlug]/board/[departmentId]`: hiển thị board của phòng ban cụ thể — chỉ vào được nếu user thuộc phòng ban đó (hoặc là admin)
- [ ] 4.4 Nếu board thuộc department đã `archived`: hiển thị banner "Bảng đã lưu trữ" — vẫn xem được, ẩn nút tạo ghim mới
- [ ] 4.5 Menu chuyển nhanh giữa các board mà user có quyền xem (bảng chung + các phòng ban mình thuộc)
- [ ] 4.6 Commit — báo cáo: vào đúng board theo skin đã chọn, board archived hiển thị đúng trạng thái read-only

---

## Phase 5 — Tạo & xem Ghim (Pin)

- [ ] 5.1 Component `<PinCard>`: 4 biến thể template (note/polaroid/floral/washi) theo mô tả `docs/SPEC.md` mục 3.5, mỗi biến thể có prop nhận ảnh (optional) + nội dung
- [ ] 5.2 Form tạo ghim: nội dung (bắt buộc), upload ảnh (optional, resize client-side), chọn template, toggle công khai/ẩn danh, chọn người nhận (dropdown từ danh sách member cùng board, optional), chọn board đích (bảng chung hoặc phòng ban mình thuộc)
- [ ] 5.3 Validate: chặn submit nếu board đích đang `archived`
- [ ] 5.4 API tạo pin: lưu `author_member_id` luôn là user thật, `is_anonymous` chỉ là cờ hiển thị
- [ ] 5.5 Render danh sách pin trên board: sắp xếp mới nhất lên trên/dễ thấy nhất, ẩn tên nếu `is_anonymous = true` (trừ khi viewer là admin)
- [ ] 5.6 Modal xem phóng to 1 pin khi click vào
- [ ] 5.7 Không có nút xoá pin ở phía user — chỉ admin có nút "Ẩn ghim" ở Phase 6
- [ ] 5.8 Commit — báo cáo: tạo được ghim với đủ 4 template, ẩn danh hoạt động đúng, ghim hiện đúng board đích

---

## Phase 5.5 — Sửa trải nghiệm bảng ghim (theo phản hồi thực tế sau khi test)

Đây là phase sửa lại phần đã build ở Phase 4-5, không phải làm mới từ đầu. Đọc kỹ `docs/SPEC.md` mục 2.6, 2.6a, 3.5 (đã cập nhật) trước khi làm.

- [ ] 5.5.1 Migration: thêm cột `position_x`, `position_y`, `rotation` vào bảng `pins` (xem `docs/AGENT_RULES.md` mục 4)
- [ ] 5.5.2 Viết Postgres function `update_pin_position` (SECURITY DEFINER) theo đúng mục 5.1 của `docs/AGENT_RULES.md`, không mở UPDATE chung cho bảng `pins`
- [ ] 5.5.3 Refactor layout trang board: bảng chiếm full-height/full-width, xoá form inline hiện tại
- [ ] 5.5.4 Thêm nút FAB góc dưới-phải, bấm vào mở modal chứa form tạo ghim (dùng lại logic form cũ, chỉ đổi chỗ hiển thị)
- [ ] 5.5.5 Cài `react-draggable`, bọc mỗi `<PinCard>` để kéo-thả tự do trong canvas bảng
- [ ] 5.5.6 Lúc thả ghim (drag end): gọi RPC `update_pin_position`, debounce để tránh gọi liên tục khi đang kéo
- [ ] 5.5.7 Lúc tạo ghim mới: tự sinh `position_x/position_y` hợp lý (tránh chồng lên ghim khác trong viewport hiện tại) + `rotation` ngẫu nhiên theo đúng biên độ từng template ở `docs/SPEC.md` mục 3.5
- [ ] 5.5.8 Thiết kế lại thật sự 4 `<PinCard>` variant theo đúng chi tiết ở `docs/SPEC.md` mục 3.5 (kết cấu nền, khung/viền, trang trí SVG, font riêng, xử lý ảnh riêng từng loại) — không chỉ đổi màu nền
- [ ] 5.5.9 Validate: template "polaroid" chỉ chọn được khi đã có ảnh đính kèm, disable + tooltip giải thích nếu chưa có ảnh
- [ ] 5.5.10 Canvas bảng cho phép cuộn ngang/dọc khi nội dung vượt viewport
- [ ] 5.5.11 Commit — báo cáo: bảng full-screen đúng, FAB + modal hoạt động, kéo-thả lưu được vị trí, 4 template nhìn khác biệt rõ rệt (đính kèm ảnh chụp lại nếu được)

---

## Phase 6 — Kiểm duyệt (Admin)

- [ ] 6.1 Trang `/[companySlug]/admin/pins`: danh sách toàn bộ pin (kể cả ẩn danh — hiện tên thật cho admin), lọc theo board
- [ ] 6.2 Nút "Ẩn ghim" → set `is_hidden = true`, pin biến mất khỏi board công khai nhưng vẫn còn trong DB
- [ ] 6.3 Commit — báo cáo: admin ẩn được pin vi phạm, pin đó không còn hiện trên board thường

---

## Phase 7 — Chia sẻ mạng xã hội (export ảnh)

- [ ] 7.1 Nút "Chia sẻ" trên mỗi pin (chỉ hiện nếu `is_hidden = false`) → render pin thành ảnh (dùng `html-to-image` hoặc tương đương) đúng style template đã chọn + logo công ty góc nhỏ
- [ ] 7.2 Nếu pin ẩn danh: ảnh xuất ra không hiện tên người đăng, chỉ hiện nội dung + tên người nhận (nếu có)
- [ ] 7.3 Cho phép tải ảnh về máy; nếu trình duyệt hỗ trợ Web Share API thì hiện thêm nút chia sẻ trực tiếp
- [ ] 7.4 Commit — báo cáo: ảnh xuất ra đúng style, đúng logic ẩn danh

---

## Phase 8 — Nhúng bảng (Embed)

- [ ] 8.1 Thêm nút "Cho phép nhúng" ở trang quản trị board (Admin) → sinh `embed_token` ngẫu nhiên, set `embed_enabled = true`
- [ ] 8.2 Route `app/embed/[boardId]/page.tsx`: nhận `?token=` qua query string, so khớp với `embed_token` trong DB (dùng service-role client, không qua RLS user-context)
- [ ] 8.3 Trang embed: chỉ hiển thị board read-only, không nav, không nút quản trị/chia sẻ/tạo ghim
- [ ] 8.4 Sai token hoặc `embed_enabled = false` → hiện trang lỗi ngắn gọn, không lộ thông tin board
- [ ] 8.5 Admin xem được đoạn mã `<iframe src="...">` để copy dán ra ngoài
- [ ] 8.6 Commit — báo cáo: nhúng thử vào 1 trang HTML tĩnh, board hiển thị đúng, đúng quyền read-only

---

## Phase 9 — Hoàn thiện & Deploy

- [ ] 9.1 Rà lại toàn bộ UI copy (text hiển thị) đúng tiếng Việt, đúng giọng ấm áp như mô tả ở `docs/SPEC.md` mục 3.1
- [ ] 9.2 Kiểm tra responsive mobile cho toàn bộ luồng chính (đăng ký, xem board, tạo ghim)
- [ ] 9.3 Kiểm tra lại RLS lần cuối: tạo 2 công ty test, xác nhận không rò dữ liệu chéo
- [ ] 9.4 Deploy lên Vercel, gắn biến môi trường Supabase
- [ ] 9.5 Test end-to-end trên môi trường production: đăng ký công ty mới → tạo phòng ban → tạo ghim → chia sẻ ảnh → nhúng iframe
- [ ] 9.6 Commit cuối — báo cáo tổng kết: những gì đã hoàn thành, những gì còn để Phase 2 (Odoo sync, upload nền tuỳ ý, export zip trả phí — xem `docs/SPEC.md` mục 4)
