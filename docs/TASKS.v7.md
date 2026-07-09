# TASKS — GratiPin

> **Version: v7** — cập nhật: 09/07/2026

**Mới trong bản này:** Phase 5.11 — sửa lại thứ tự form tạo/sửa ghim đã build ở Phase 5.9: Ảnh lên đầu tiên, đổi nhãn thành "Ảnh", nội dung chữ trở thành tuỳ chọn nếu đã có ảnh.

Làm tuần tự từ Phase 0 → Phase 9, không nhảy cóc. Sau mỗi task, chạy thử và xác nhận hoạt động trước khi sang task kế. Đọc `docs/AGENT_RULES.v7.md` và `docs/SPEC.v7.md` trước khi bắt đầu.

---

## Phase 0 — Khởi tạo dự án

- [ ] 0.1 Tạo project Next.js 14 (App Router, TypeScript, Tailwind CSS bật sẵn)
- [ ] 0.2 Cài `@supabase/supabase-js`, `@supabase/ssr`, `zod`
- [ ] 0.3 Tạo project Supabase mới (hoặc dùng project có sẵn nếu được cung cấp), lấy `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`, lưu vào `.env.local`
- [ ] 0.4 Cấu hình Google Fonts (Fredoka/Quicksand + Inter/Nunito) với subset `vietnamese`, import trong `app/layout.tsx`
- [ ] 0.5 Setup Tailwind theme: khai báo màu trong `tailwind.config.ts` theo đúng mục 8 của `docs/AGENT_RULES.v7.md` (đặt tên token: `cream`, `peach`, `butter`, `mint`, `umber`)
- [ ] 0.6 Commit theo đúng format ở `docs/AGENT_RULES.v7.md` mục 10 — báo cáo: project chạy được `npm run dev`, Tailwind + font hiển thị đúng

---

## Phase 1 — Database schema & RLS

- [ ] 1.1 Viết migration SQL tạo đủ 6 bảng: `companies`, `members`, `departments`, `member_departments`, `boards`, `pins` — đúng schema ở `docs/AGENT_RULES.v7.md` mục 4
- [ ] 1.2 Bật RLS cho cả 6 bảng
- [ ] 1.3 Viết policy: user chỉ đọc/ghi được record có `company_id` khớp với công ty của mình (qua bảng `members`)
- [ ] 1.4 Viết policy riêng: chỉ `role = 'admin'` được ghi vào `members`, `departments`, `companies.logo_url`, và cập nhật `pins.is_hidden`
- [ ] 1.5 Chạy `supabase gen types typescript` sinh type, lưu vào `lib/database.types.ts`
- [ ] 1.6 Viết seed script tạo 1 công ty mẫu + 1 admin + 2 user để test thủ công xuyên suốt quá trình build
- [ ] 1.7 Commit — báo cáo: migration chạy thành công, RLS test bằng 2 user khác company không thấy dữ liệu của nhau

---

## Phase 2 — Đăng ký công ty & Auth

- [ ] 2.1 Trang `/signup`: form tạo công ty mới — tên công ty, upload logo (resize theo mục 6 của `docs/AGENT_RULES.v7.md`), email + mật khẩu admin đầu tiên
- [ ] 2.2 Khi submit: tạo user qua Supabase Auth → tạo record `companies` (sinh `slug` tự động, kiểm tra trùng, `onboarding_completed = false`) → tạo record `members` với `role = 'admin'`, `is_owner = true` → tự động tạo 1 `boards` record với `department_id = null` (bảng chung công ty, skin mặc định tạm — sẽ đổi lại ở Setup Wizard)
- [ ] 2.3 Trang `/login`: đăng nhập bằng email/mật khẩu → sau khi login, tra `members` để biết `company_slug` → redirect vào `/{slug}/board` (middleware Phase 2.6 sẽ tự chuyển hướng sang wizard nếu cần)
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

## Phase 2.6 — Setup Wizard

- [ ] 2.6.1 Migration: thêm cột `onboarding_completed` vào `companies`, `is_owner` vào `members` (xem `docs/AGENT_RULES.v7.md` mục 4)
- [ ] 2.6.2 Middleware: nếu `companies.onboarding_completed = false` và user hiện tại có `is_owner = true` → redirect mọi request `/[companySlug]/board*` sang `/[companySlug]/setup`
- [ ] 2.6.3 Trang `/[companySlug]/setup`: wizard nhiều bước (component step-by-step, không cần route riêng cho từng bước) theo đúng `docs/SPEC.v7.md` mục 2.1a:
  - Bước 1: Chào mừng (tĩnh, chỉ có nút Tiếp tục)
  - Bước 2: Chọn board skin cho Bảng chung công ty → cập nhật `boards.skin`
  - Bước 3: Mời thành viên (tái dùng logic thêm user ở Phase 3) — có nút Bỏ qua
  - Bước 4: Tạo phòng ban đầu tiên (tái dùng logic tạo department ở Phase 3) — có nút Bỏ qua
  - Bước 5: Hoàn tất → set `companies.onboarding_completed = true` → redirect `/[companySlug]/board`
- [ ] 2.6.4 Nút "Bỏ qua" ở mọi bước tuỳ chọn vẫn dẫn tới bước cuối, không thoát thẳng ra ngoài wizard
- [ ] 2.6.5 Xác nhận: user được mời sau (không phải `is_owner`) đăng nhập vào thẳng `/board`, không bị redirect sang `/setup` dù công ty `onboarding_completed = false`
- [ ] 2.6.6 Commit — báo cáo: tạo công ty mới → thấy wizard ngay, đi hết hoặc bỏ qua đều vào được bảng chung, user được mời sau không thấy wizard

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

- [ ] 4.1 Component `<Board>`: nhận `skin` prop, render nền tương ứng (wood/felt/linen/chalkboard) — dùng CSS/texture nhẹ theo mô tả ở `docs/SPEC.v7.md` mục 3.4
- [ ] 4.2 Trang `/[companySlug]/board`: hiển thị bảng chung công ty (board có `department_id = null`)
- [ ] 4.3 Trang `/[companySlug]/board/[departmentId]`: hiển thị board của phòng ban cụ thể — chỉ vào được nếu user thuộc phòng ban đó (hoặc là admin)
- [ ] 4.4 Nếu board thuộc department đã `archived`: hiển thị banner "Bảng đã lưu trữ" — vẫn xem được, ẩn nút tạo ghim mới
- [ ] 4.5 Menu chuyển nhanh giữa các board mà user có quyền xem (bảng chung + các phòng ban mình thuộc)
- [ ] 4.6 Commit — báo cáo: vào đúng board theo skin đã chọn, board archived hiển thị đúng trạng thái read-only

---

## Phase 5 — Tạo & xem Ghim (Pin)

- [ ] 5.1 Component `<PinCard>`: 4 biến thể template (note/polaroid/floral/washi) theo mô tả `docs/SPEC.v7.md` mục 3.5, mỗi biến thể có prop nhận ảnh (optional) + nội dung
- [ ] 5.2 Form tạo ghim: nội dung (bắt buộc), upload ảnh (optional, resize client-side), chọn template, toggle công khai/ẩn danh, chọn người nhận (dropdown từ danh sách member cùng board, optional), chọn board đích (bảng chung hoặc phòng ban mình thuộc)
- [ ] 5.3 Validate: chặn submit nếu board đích đang `archived`
- [ ] 5.4 API tạo pin: lưu `author_member_id` luôn là user thật, `is_anonymous` chỉ là cờ hiển thị
- [ ] 5.5 Render danh sách pin trên board: sắp xếp mới nhất lên trên/dễ thấy nhất, ẩn tên nếu `is_anonymous = true` (trừ khi viewer là admin)
- [ ] 5.6 Modal xem phóng to 1 pin khi click vào
- [ ] 5.7 Không có nút xoá pin ở phía user — chỉ admin có nút "Ẩn ghim" ở Phase 6
- [ ] 5.8 Commit — báo cáo: tạo được ghim với đủ 4 template, ẩn danh hoạt động đúng, ghim hiện đúng board đích

---

## Phase 5.5 — Sửa trải nghiệm bảng ghim (theo phản hồi thực tế sau khi test)

Đây là phase sửa lại phần đã build ở Phase 4-5, không phải làm mới từ đầu. Đọc kỹ `docs/SPEC.v7.md` mục 2.6, 2.6a, 3.5 (đã cập nhật) trước khi làm.

- [ ] 5.5.1 Migration: thêm cột `position_x`, `position_y`, `rotation` vào bảng `pins` (xem `docs/AGENT_RULES.v7.md` mục 4)
- [ ] 5.5.2 Viết Postgres function `update_pin_position` (SECURITY DEFINER) theo đúng mục 5.1 của `docs/AGENT_RULES.v7.md`, không mở UPDATE chung cho bảng `pins`
- [ ] 5.5.3 Refactor layout trang board: bảng chiếm full-height/full-width, xoá form inline hiện tại
- [ ] 5.5.4 Thêm nút FAB góc dưới-phải, bấm vào mở modal chứa form tạo ghim (dùng lại logic form cũ, chỉ đổi chỗ hiển thị)
- [ ] 5.5.5 Cài `react-draggable`, bọc mỗi `<PinCard>` để kéo-thả tự do trong canvas bảng
- [ ] 5.5.6 Lúc thả ghim (drag end): gọi RPC `update_pin_position`, debounce để tránh gọi liên tục khi đang kéo
- [ ] 5.5.7 Lúc tạo ghim mới: tự sinh `position_x/position_y` hợp lý (tránh chồng lên ghim khác trong viewport hiện tại) + `rotation` ngẫu nhiên theo đúng biên độ từng template ở `docs/SPEC.v7.md` mục 3.5
- [ ] 5.5.8 Thiết kế lại thật sự 4 `<PinCard>` variant theo đúng chi tiết ở `docs/SPEC.v7.md` mục 3.5 (kết cấu nền, khung/viền, trang trí SVG, font riêng, xử lý ảnh riêng từng loại) — không chỉ đổi màu nền
- [ ] 5.5.9 Validate: template "polaroid" chỉ chọn được khi đã có ảnh đính kèm, disable + tooltip giải thích nếu chưa có ảnh
- [ ] 5.5.10 Canvas bảng cho phép cuộn ngang/dọc khi nội dung vượt viewport
- [ ] 5.5.11 Commit — báo cáo: bảng full-screen đúng, FAB + modal hoạt động, kéo-thả lưu được vị trí, 4 template nhìn khác biệt rõ rệt (đính kèm ảnh chụp lại nếu được)

---

## Phase 5.6 — Sửa template thật theo file tham chiếu (sau test lần 2)

Phase 5.5 đã làm nhưng 4 template vẫn chỉ khác màu, chưa đúng ý đồ thiết kế. Lần này bắt buộc dùng file tham chiếu thật thay vì mô tả chữ.

- [ ] 5.6.1 Mở `docs/pin-templates-reference.html` trong trình duyệt, xem kỹ cấu trúc HTML/CSS thật của cả 4 template ở 2 trạng thái (có ảnh / không ảnh)
- [ ] 5.6.2 Sửa `<PinCard>`: khi `image_url` là null và template thuộc Note/Floral/Washi → **không render bất kỳ thẻ ảnh hay div placeholder nào** (bỏ hẳn khối "Chưa có ảnh" hiện tại), layout co lại tự nhiên quanh phần chữ — port đúng theo ví dụ "TRẠNG THÁI KHÔNG CÓ ẢNH" trong file tham chiếu
- [ ] 5.6.3 Port đúng CSS/cấu trúc của từng template từ file tham chiếu vào 4 variant component (texture nền, khung/viền, SVG trang trí góc cho Floral, 2 dải washi tape cho Washi, khung polaroid đúng tỷ lệ cho Polaroid) — không tự sáng tạo lại từ đầu
- [ ] 5.6.4 Đảm bảo font `Itim` (note, washi) và `Fredoka` (floral) load đúng subset `vietnamese`
- [ ] 5.6.5 Áp `rotation` từ giá trị lưu trong DB (không hardcode) qua `transform: rotate(Ndeg)`
- [ ] 5.6.6 So sánh trực tiếp trên board thật với file tham chiếu — xác nhận 4 template nhìn rõ ràng khác nhau về kết cấu, không chỉ khác màu
- [ ] 5.6.7 Commit — báo cáo kèm mô tả từng template đã khác biệt thế nào, không có khối ảnh trống khi không có ảnh

---

## Phase 5.7 — Thêm 3 template mới + tinh chỉnh 3 template cũ

Mở lại `docs/pin-templates-reference.html` (đã cập nhật lên 7 template) trước khi làm — đây vẫn là nguồn tham chiếu chính, ưu tiên hơn mô tả chữ.

- [ ] 5.7.1 Migration: cập nhật CHECK constraint cột `pins.template` thêm `'garden'`, `'sunshine'`, `'love'` (xem `docs/AGENT_RULES.v7.md` mục 4)
- [ ] 5.7.2 Build 3 component variant mới cho `<PinCard>`: `garden` (cỏ viền dưới + ảnh khung tròn), `sunshine` (mặt trời + quầng sáng + 8 tia + sparkle), `love` (dáng phong thư + con dấu trái tim + trái tim mờ nền) — port đúng CSS/cấu trúc từ file tham chiếu
- [ ] 5.7.3 Sửa lại variant `floral` đã build: thêm dải cỏ hoa nhỏ dọc viền dưới (nhẹ hơn `garden`, chỉ là điểm nhấn phụ)
- [ ] 5.7.4 Đảm bảo layering đúng thứ tự z-index cho `love` (trái tim nền phải nằm dưới chữ, không che nội dung) và `sunshine` (glow/tia nắng nằm dưới chữ)
- [ ] 5.7.5 Cập nhật form tạo ghim: dropdown/picker template giờ có 7 lựa chọn (kèm ảnh xem trước nhỏ mỗi mẫu nếu UI cho phép)
- [ ] 5.7.6 Áp đúng biên độ xoay ngẫu nhiên riêng từng template khi tạo ghim mới theo `docs/SPEC.v7.md` mục 3.5 (garden -2°→2°, sunshine -4°→4°, love -3°→3°)
- [ ] 5.7.7 Test cả 7 template với nội dung ngắn và dài (đối chiếu đúng ví dụ dummy data trong file tham chiếu) — xác nhận không tràn chữ vỡ layout
- [ ] 5.7.8 Commit — báo cáo kèm ảnh chụp cả 7 template trên board thật

---

## Phase 5.8 — Sửa ghim sau khi đăng

- [ ] 5.8.1 Migration: thêm cột `is_edited`, `edited_at` vào bảng `pins` (xem `docs/AGENT_RULES.v7.md` mục 4)
- [ ] 5.8.2 Viết Postgres function `update_pin_content` (SECURITY DEFINER) theo đúng mục 5.2 của `docs/AGENT_RULES.v7.md` — chỉ tác giả gốc, chỉ 3 trường content/image_url/template, validate lại Polaroid cần ảnh
- [ ] 5.8.3 Thêm nút "Sửa" trên ghim — chỉ hiện với tác giả gốc đang xem ghim của chính mình, ẩn với người khác (kể cả Admin)
- [ ] 5.8.4 Nút "Sửa" mở lại modal tạo ghim (tái dùng form ở Phase 5.9), điền sẵn nội dung/ảnh/template hiện tại — không cho đổi công khai/ẩn danh, người nhận, bảng đích (disable các field này ở chế độ sửa)
- [ ] 5.8.5 Lưu qua RPC `update_pin_content`, không phải UPDATE trực tiếp
- [ ] 5.8.6 Hiển thị nhãn "(đã chỉnh sửa · [thời gian])" trên ghim khi `is_edited = true`
- [ ] 5.8.7 Ghim đang `is_hidden = true`: ẩn hẳn nút "Sửa", không cho vào form sửa
- [ ] 5.8.8 Commit — báo cáo: tác giả sửa được ghim của mình, người khác/Admin không thấy nút Sửa, nhãn "đã chỉnh sửa" hiện đúng

---

## Phase 5.9 — Cải thiện UI/UX form tạo & sửa ghim

- [ ] 5.9.1 Đổi ô chọn "Mẫu ghim" từ ô màu phẳng sang **mini-render thật** của từng `<PinCard>` (tái sử dụng chính component đã build ở Phase 5.7, chỉ scale nhỏ lại) — port đúng theo `docs/pin-templates-reference.html`
- [ ] 5.9.2 Ô Polaroid: gắn badge khoá (🔒 "Cần ảnh") đè trực tiếp lên mini-render khi chưa có ảnh, xoá dòng chữ gợi ý trôi nổi cũ
- [ ] 5.9.3 Sắp lại thứ tự field: Nội dung → Ảnh đính kèm → Mẫu ghim → Bảng đích → Người nhận → Đăng ẩn danh (đúng `docs/SPEC.v7.md` mục 2.5b)
- [ ] 5.9.4 Style lại input file, dropdown "Bảng đích"/"Người nhận", checkbox "Đăng ẩn danh" theo design token ở `docs/AGENT_RULES.v7.md` mục 8 — không dùng control mặc định trình duyệt
- [ ] 5.9.5 Sau khi chọn ảnh, hiện thumbnail preview ngay trong form (thay vì chỉ hiện tên file)
- [ ] 5.9.6 Không thêm khung xem trước trực tiếp (live preview) riêng — giữ form gọn theo quyết định đã chốt
- [ ] 5.9.7 Áp dụng đúng UI mới này cho cả 2 chế độ: tạo ghim mới và sửa ghim (Phase 5.8) — dùng chung 1 component form
- [ ] 5.9.8 Commit — báo cáo kèm ảnh chụp form mới, xác nhận Polaroid tự khoá/mở đúng theo có/không ảnh

---

## Phase 5.10 — Tái cấu trúc menu điều hướng

- [ ] 5.10.1 Migration: thêm cột `default_board_id` vào `members` (ALTER TABLE sau khi `boards` đã tồn tại — xem ghi chú (*) ở `docs/AGENT_RULES.v7.md` mục 4)
- [ ] 5.10.2 Đổi nav "Bảng ghim" thành dropdown trigger (hover/click): liệt kê Bảng chung + các bảng phòng ban user thuộc về, mỗi dòng có control (icon ngôi sao hoặc checkbox) để "Đặt làm mặc định" → ghi vào `default_board_id`
- [ ] 5.10.3 Bấm thẳng vào chữ "Bảng ghim" (không mở dropdown) → điều hướng tới `default_board_id` của user, hoặc Bảng chung công ty nếu chưa đặt
- [ ] 5.10.4 Gộp 3 nav item "Thành viên", "Phòng ban", "Cài đặt" thành 1 nav item "Cài đặt" dạng dropdown — chỉ hiện với Admin, giữ nguyên route/RLS 3 trang con, chỉ đổi UI điều hướng
- [ ] 5.10.5 Commit — báo cáo: dropdown bảng hoạt động, đặt mặc định đúng, menu Cài đặt gộp đúng 3 mục, không đổi quyền truy cập

---

## Phase 5.11 — Sửa lại thứ tự form tạo/sửa ghim (đã build ở Phase 5.9)

- [ ] 5.11.1 Đổi thứ tự field trong form (cả chế độ tạo mới lẫn sửa): **Ảnh → Nội dung → Mẫu ghim → Bảng đích → Người nhận → Đăng ẩn danh**
- [ ] 5.11.2 Đổi nhãn field ảnh từ "Ảnh đính kèm" thành "Ảnh"
- [ ] 5.11.3 Bỏ `required` cứng ở ô nội dung — validate phía client: disable nút "Đăng ghim"/"Lưu" nếu cả nội dung (sau khi trim) lẫn ảnh đều trống, hiện gợi ý ngắn (VD: "Cần có nội dung hoặc ảnh")
- [ ] 5.11.4 Cập nhật placeholder ô nội dung theo `docs/SPEC.v7.md` mục 2.5b
- [ ] 5.11.5 Cập nhật server action/API tạo pin: validate lại có ít nhất 1 trong 2 (content/image_url) trước khi insert, không chỉ tin client
- [ ] 5.11.6 Cập nhật RPC `update_pin_content` theo đúng `docs/AGENT_RULES.v7.md` mục 5.2 — raise exception nếu sửa thành trống cả 2
- [ ] 5.11.7 Test: đăng ghim chỉ có ảnh không chữ → thành công, hiển thị đúng trên board (không có dòng nội dung rỗng kỳ quặc); đăng ghim trống cả 2 → bị chặn
- [ ] 5.11.8 Commit — báo cáo kèm ảnh chụp form mới và 1 ghim chỉ-có-ảnh trên board

---

## Phase 6 — Kiểm duyệt (Admin)

- [ ] 6.1 Trang `/[companySlug]/admin/pins`: danh sách toàn bộ pin (kể cả ẩn danh — hiện tên thật cho admin), lọc theo board
- [ ] 6.2 Nút "Ẩn ghim" → set `is_hidden = true`, pin biến mất khỏi board công khai nhưng vẫn còn trong DB
- [ ] 6.3 Commit — báo cáo: admin ẩn được pin vi phạm, pin đó không còn hiện trên board thường
- [ ] 6.4 Migration: thêm cột `reviewed_at` vào `pins` (xem `docs/AGENT_RULES.v7.md` mục 4). Khi Admin load trang `/admin/pins`, chạy update đánh dấu `reviewed_at = now()` cho các pin đang null theo đúng `docs/AGENT_RULES.v7.md` mục 5.3
- [ ] 6.5 Thêm icon chấm than đỏ trên nav "Kiểm duyệt" khi còn pin có `reviewed_at IS NULL` và `is_hidden = false` — biến mất sau khi Admin mở trang, hiện lại khi có ghim mới đăng sau đó
- [ ] 6.6 Commit — báo cáo: badge hiện/ẩn đúng lúc, không ảnh hưởng gì tới việc ghim hiển thị public (ghim vẫn luôn lên bảng ngay khi đăng)

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

- [ ] 9.1 Rà lại toàn bộ UI copy (text hiển thị) đúng tiếng Việt, đúng giọng ấm áp như mô tả ở `docs/SPEC.v7.md` mục 3.1
- [ ] 9.2 Kiểm tra responsive mobile cho toàn bộ luồng chính (đăng ký, xem board, tạo ghim)
- [ ] 9.3 Kiểm tra lại RLS lần cuối: tạo 2 công ty test, xác nhận không rò dữ liệu chéo
- [ ] 9.4 Deploy lên Vercel, gắn biến môi trường Supabase
- [ ] 9.5 Test end-to-end trên môi trường production: đăng ký công ty mới → tạo phòng ban → tạo ghim → chia sẻ ảnh → nhúng iframe
- [ ] 9.6 Commit cuối — báo cáo tổng kết: những gì đã hoàn thành, những gì còn để Phase 2 (Odoo sync, upload nền tuỳ ý, export zip trả phí — xem `docs/SPEC.v7.md` mục 4)
