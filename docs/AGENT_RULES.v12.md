# AGENT RULES — GratiPin

> **Version: v12** — cập nhật: 09/07/2026

**Mới trong bản này:** viết lại mục 5.3 — bỏ logic tự động đánh dấu "đã xem" khi mở trang Kiểm duyệt, thay bằng 2 hành động rõ ràng "Duyệt" (chỉ set `reviewed_at`) và "Từ chối" (set cả `reviewed_at` và `is_hidden`).

Đây là quy tắc bắt buộc khi build sản phẩm này. Đọc kỹ trước khi làm bất kỳ task nào trong `docs/TASKS.v12.md`. Nếu có mâu thuẫn giữa task cụ thể và rule ở đây, **rule ở đây luôn thắng**.

## 0. Quy ước versioning

Mỗi lần có thay đổi nghiệp vụ/thiết kế đáng kể, bộ 3 file `SPEC`, `AGENT_RULES`, `TASKS` được nâng version cùng lúc (VD: v4 → v5), file cũ giữ nguyên không sửa đè. **Không dùng file `CHANGELOG.md` riêng nữa** — mỗi file version tự nêu ngắn gọn phần mới của bản đó ngay dưới dòng tiêu đề Version (mục "Mới trong bản này"), không mô tả lại phần đã có ở bản trước. **Luôn dùng version cao nhất khi làm việc**, trừ khi được yêu cầu khác.

---

## 1. Tổng quan sản phẩm

SaaS đa khách hàng (multi-tenant): nền tảng ghi nhận, biết ơn và lưu giữ kỷ niệm công ty, giao diện dạng bảng ghim (corkboard). Xem chi tiết tính năng & design tại `docs/SPEC.v12.md` (đính kèm cùng bộ này) — file đó là nguồn sự thật (source of truth) về nghiệp vụ.

**Tuyệt đối không tích hợp AI/LLM API vào bất kỳ tính năng nào của sản phẩm này** (không gợi ý nội dung, không kiểm duyệt bằng AI, không tóm tắt gì cả). Đây là constraint cứng, không phải gợi ý.

---

## 2. Tech stack (bắt buộc, không tự ý đổi)

- **Framework**: Next.js 14, App Router
- **Ngôn ngữ**: TypeScript, strict mode bật
- **Database + Auth + Storage**: Supabase (Postgres, Supabase Auth email/password, Supabase Storage cho ảnh)
- **CSS**: Tailwind CSS
- **Kéo-thả vị trí ghim**: `react-draggable` (đơn giản, đủ dùng cho kéo tự do trong 1 canvas, không cần dnd phức tạp)
- **Deploy**: Vercel
- Không thêm ORM khác (không Prisma) — dùng Supabase client trực tiếp + generated types (`supabase gen types typescript`)

---

## 3. Multi-tenancy — path-based slug

Theo đúng pattern đã dùng ở Pickleball Manager: routing dạng `domain.com/{company-slug}/...`

- Mỗi công ty có 1 `slug` duy nhất, sinh tự động từ tên công ty lúc đăng ký (lowercase, không dấu, gạch ngang), kiểm tra trùng và cho phép chỉnh tay nếu trùng
- Toàn bộ route nghiệp vụ nằm dưới `app/[companySlug]/...`
- Middleware xác thực: mọi request vào `[companySlug]` phải kiểm tra user hiện tại có phải member của company đó không — nếu không, redirect về trang chọn công ty hoặc 404 (không lộ thông tin công ty khác tồn tại hay không)
- **Setup Wizard redirect**: nếu `companies.onboarding_completed = false` VÀ user hiện tại là admin đầu tiên (người tạo company) → mọi route vào `/[companySlug]/board*` tự động redirect sang `/[companySlug]/setup` cho tới khi hoàn tất/bỏ qua wizard. Thành viên được mời sau (không phải người tạo) **không** bị redirect này dù `onboarding_completed` vẫn là false — chỉ chặn đúng người tạo company

### 3.1 Platform Admin (Connecta) — khác hoàn toàn với Admin công ty

Role `admin` trong bảng `members` chỉ có hiệu lực **trong phạm vi 1 công ty**. Platform Admin là quyền riêng của Connecta để xem xuyên suốt mọi tenant — không liên quan đến `members.role`, không tạo bảng/cột mới cho việc này.

- Khai báo danh sách email Platform Admin trong biến môi trường `PLATFORM_ADMIN_EMAILS` (phân tách bằng dấu phẩy)
- Route `app/connecta-admin/page.tsx`: lấy email từ Supabase Auth session hiện tại, so sánh với `PLATFORM_ADMIN_EMAILS` — nếu không khớp, trả 404 (không lộ route này tồn tại)
- Trang này query trực tiếp bảng `companies` kèm đếm số lượng `members`, `departments`, `pins` theo từng company — dùng **service-role client** vì cần đọc xuyên mọi tenant, KHÔNG qua RLS user-context
- MVP chỉ hiển thị danh sách (tên công ty, slug, ngày tạo, email admin công ty, số liệu đếm) — chưa có hành động sửa/xoá/khoá công ty

---

## 4. Database schema (bắt buộc theo đúng cấu trúc này)

```sql
companies (
  id uuid pk,
  name text,
  slug text unique,
  logo_url text nullable,
  onboarding_completed boolean default false, -- true sau khi admin đầu tiên qua hết Setup Wizard (hoặc bỏ qua tới bước cuối)
  created_at timestamptz
)

members (
  id uuid pk,
  user_id uuid references auth.users,
  company_id uuid references companies,
  display_name text,
  role text check (role in ('admin','user')),
  is_owner boolean default false, -- true CHỈ cho admin đầu tiên (người tạo company) — dùng để quyết định có bắt đi qua Setup Wizard hay không
  default_board_id uuid references boards nullable, -- bảng người này chọn làm mặc định, null = dùng Bảng chung công ty (*)
  created_at timestamptz
)
> (*) `boards` được định nghĩa sau `members` trong tài liệu này — khi viết migration thật, thêm cột này bằng `ALTER TABLE members ADD COLUMN ...` sau khi bảng `boards` đã tồn tại, không đưa vào `CREATE TABLE members` ban đầu.


departments (
  id uuid pk,
  company_id uuid references companies,
  name text,
  status text check (status in ('active','archived')) default 'active',
  created_at timestamptz
)

member_departments (
  member_id uuid references members,
  department_id uuid references departments,
  primary key (member_id, department_id)
)
-- quan hệ nhiều-nhiều: 1 member thuộc nhiều department, không giới hạn

boards (
  id uuid pk,
  company_id uuid references companies,
  department_id uuid references departments nullable, -- null = bảng chung công ty
  skin text check (skin in ('wood','felt','linen','chalkboard')),
  embed_enabled boolean default false,
  embed_token text nullable,
  created_at timestamptz
)

pins (
  id uuid pk,
  company_id uuid references companies,
  board_id uuid references boards,
  author_member_id uuid references members, -- LUÔN lưu thật, kể cả khi ẩn danh
  is_anonymous boolean default false,
  recipient_member_id uuid references members nullable,
  content text,
  image_url text nullable,
  template text check (template in ('note','polaroid','floral','washi','garden','sunshine','love')),
  position_x float default 0, -- toạ độ tự do trên canvas bảng, tính theo px hoặc % (quyết định lúc build)
  position_y float default 0,
  rotation float default 0, -- góc xoay hiển thị (độ), random nhẹ lúc tạo theo từng template (xem SPEC.md mục 3.5)
  is_hidden boolean default false, -- admin ẩn khi vi phạm, KHÔNG xoá record
  is_edited boolean default false, -- true sau khi tác giả gốc sửa nội dung/ảnh/template ít nhất 1 lần
  edited_at timestamptz nullable, -- thời điểm sửa gần nhất, hiển thị kèm nhãn "(đã chỉnh sửa)"
  reviewed_at timestamptz nullable, -- null = Admin chưa xem qua ở trang Kiểm duyệt, dùng để tính badge đỏ
  created_at timestamptz
)
```

board_admins (
  board_id uuid references boards,
  member_id uuid references members,
  created_at timestamptz,
  primary key (board_id, member_id)
)
-- 1 member có thể là Board Admin của nhiều board; không liên quan tới members.role

**Nguyên tắc cứng:**
- Bảng `pins` **không có hành động DELETE nào phía user hoặc code nghiệp vụ thông thường** — chỉ có `is_hidden` để admin ẩn khi vi phạm. Không viết bất kỳ API route hay UI nào cho phép xoá cứng 1 pin.
- Khi 1 department chuyển `status = 'archived'`: board tương ứng vẫn giữ nguyên, chỉ chặn tạo pin mới vào board đó (kiểm tra ở API tạo pin: nếu department archived → từ chối).
- `is_anonymous = true` chỉ ẩn danh ở tầng hiển thị UI cho user thường — company Admin **hoặc Board Admin đúng board đó** luôn query được `author_member_id` thật để xử lý vi phạm (xem mục 5.5).

---

## 5. Row Level Security (RLS) — bắt buộc bật cho mọi bảng

- Mọi bảng có `company_id` → RLS policy chỉ cho phép user thao tác nếu `company_id` khớp với company của member hiện tại (join qua `members.user_id = auth.uid()`)
- Riêng thao tác ghi vào `pins.is_hidden`, sửa `companies.logo_url`, quản lý `members`, `departments`: chỉ role `admin` được phép (thêm điều kiện role trong policy)
- Route `/embed/[boardId]` dùng service-role query có kiểm tra `embed_token` khớp, KHÔNG dùng RLS user-context vì đây là truy cập ẩn danh công khai

### 5.1 Cập nhật vị trí ghim (kéo-thả) — dùng RPC riêng, không mở UPDATE chung

Bất kỳ member nào trong công ty cũng được phép kéo-thả để đổi vị trí ghim (theo `docs/SPEC.v12.md` mục 2.6a), **nhưng không được để họ sửa được nội dung/ảnh/danh tính ghim của người khác qua cùng đường đó**. Vì vậy:

- Không mở policy `UPDATE` chung cho bảng `pins`
- Viết 1 Postgres function `update_pin_position(pin_id uuid, x float, y float, rotation float)` với `SECURITY DEFINER`, bên trong function kiểm tra pin đó thuộc đúng `company_id` của caller rồi mới `UPDATE ... SET position_x, position_y, rotation` — chỉ 3 cột này, không đụng cột khác
- Gọi function này qua Supabase RPC (`supabase.rpc('update_pin_position', {...})`) từ client khi kéo-thả xong (debounce ~300-500ms khi đang kéo, chỉ gọi 1 lần lúc thả ra)

### 5.2 Sửa nội dung ghim — RPC riêng, chỉ tác giả gốc

Theo `docs/SPEC.v12.md` mục 2.5a: chỉ tác giả gốc (kể cả Admin cũng không được sửa ghim người khác) mới sửa được **content, image_url, template** — không sửa được `is_anonymous`, `recipient_member_id`, `board_id`.

- Viết Postgres function `update_pin_content(pin_id uuid, new_content text, new_image_url text, new_template text)` với `SECURITY DEFINER`:
  - Kiểm tra `pins.author_member_id` khớp đúng member của `auth.uid()` hiện tại — không khớp thì raise exception, từ chối
  - Kiểm tra `pins.is_hidden = false` — nếu đang bị ẩn, từ chối sửa
  - Nếu `new_template = 'polaroid'` mà `new_image_url` là null → raise exception (validate lại ở tầng DB, không chỉ tin tưởng validate phía client)
  - **Nếu cả `new_content` (sau khi trim) và `new_image_url` đều rỗng/null → raise exception** — không cho sửa thành ghim trống hoàn toàn
  - `UPDATE ... SET content, image_url, template, is_edited = true, edited_at = now()` — chỉ 4 cột này
- Không mở policy `UPDATE` chung nào khác cho phép sửa `content`/`image_url`/`template` ngoài RPC này
- **Áp dụng cùng rule này khi tạo ghim mới** (không chỉ lúc sửa): API/Server Action tạo pin phải validate có ít nhất 1 trong 2 (`content` hoặc `image_url`) trước khi insert — `content` trong schema vẫn để kiểu `text` nullable, không đặt `NOT NULL` cứng ở DB vì rule là "ít nhất 1 trong 2 cột", không riêng cột nào luôn bắt buộc

---

### 5.3 Hành động "Duyệt" / "Từ chối" ở trang Kiểm duyệt (thay logic auto-mark ở v6)

> **Đổi so với v6**: KHÔNG còn update hàng loạt khi mở trang. Mỗi ghim được xử lý riêng lẻ qua đúng 1 trong 2 hành động dưới đây, cùng phạm vi quyền như mục 5.5 (company Admin hoặc Board Admin đúng board).

- **"Duyệt"**: `UPDATE pins SET reviewed_at = now() WHERE id = <pin_id>` — chỉ cột này, không đụng `is_hidden`. Có thể làm qua RLS UPDATE policy (cùng điều kiện quyền ở mục 5.5) hoặc RPC riêng `mark_pin_reviewed(pin_id)`, tuỳ cách nào gọn hơn khi build — không bắt buộc phải RPC vì không có rủi ro sửa nhầm cột khác nếu giới hạn đúng trong policy.
- **"Từ chối"**: `UPDATE pins SET is_hidden = true, reviewed_at = now() WHERE id = <pin_id>` — set cả 2 cột trong 1 lần update, tái dùng đúng policy admin/board-admin đã có ở mục 5.5 cho `is_hidden`, mở rộng thêm cho phép set `reviewed_at` cùng lúc
- **Danh sách hiển thị ở trang Kiểm duyệt**: `WHERE reviewed_at IS NULL AND is_hidden = false` — ghim đã Duyệt hoặc đã Từ chối đều biến mất khỏi danh sách này (đã xử lý xong)
- Badge đỏ ở nav "Kiểm duyệt": query `count(*) FROM pins WHERE company_id = <company> AND reviewed_at IS NULL AND is_hidden = false` (không đổi so với v6) — nhưng giờ chỉ giảm khi có ghim cụ thể được Duyệt/Từ chối, không giảm chỉ vì mở trang xem qua
- Với Board Admin: cả 2 hành động và badge đều lọc thêm theo board được gán, đúng logic mục 5.5

### 5.4 Ẩn ghim ngay trên board (Admin) — tái dùng RLS đã có, không cần API mới

Theo `docs/SPEC.v12.md` mục 2.6d — đây thuần tuý là thêm 1 điểm truy cập UI trên board, gọi lại đúng logic set `pins.is_hidden = true` đã được bảo vệ bởi policy admin-only ở mục 5 (không phải tính năng backend mới):

- Component `<PinCard>` nhận thêm prop biết vai trò người xem hiện tại (`isAdmin`) — nếu `true` và pin chưa `is_hidden`, render thêm mục "Ẩn ghim" trong menu tuỳ chọn có sẵn trên thẻ
- Gọi cùng 1 mutation/API mà trang `/admin/pins` đang dùng để set `is_hidden = true` — không viết API riêng thứ hai cho cùng 1 hành động
- Sau khi ẩn thành công: xoá ghim đó khỏi canvas board ngay (optimistic update hoặc refetch), không cần rời trang

### 5.5 Board Admin — mở rộng RLS/policy, không thay thế cơ chế company Admin

Theo `docs/SPEC.v12.md` mục 2.3a. Nguyên tắc: mọi chỗ RLS hiện đang check `role = 'admin'` cho các hành động **giới hạn theo 1 board cụ thể** (ẩn ghim, đổi skin, bật/tắt embed) cần OR thêm điều kiện Board Admin đúng board đó. Các hành động **không giới hạn theo board** (quản lý members, departments, company settings) **giữ nguyên chỉ company Admin**, không mở rộng cho Board Admin.

- **Policy UPDATE `pins.is_hidden`**: cho phép nếu `role = 'admin'` **HOẶC** tồn tại record trong `board_admins` có `board_id = pins.board_id` và `member_id` khớp caller
- **Policy UPDATE `boards.skin`, `boards.embed_enabled`, `boards.embed_token`**: cho phép nếu `role = 'admin'` **HOẶC** tồn tại record trong `board_admins` có `board_id = boards.id` và `member_id` khớp caller
- **Bảng `board_admins`**: chỉ company Admin (`role = 'admin'`) được INSERT/DELETE (gán/gỡ Board Admin); chính người được gán chỉ SELECT được record của mình (để biết mình đang là Board Admin của board nào), không tự sửa/gán thêm cho người khác
- **Trang Kiểm duyệt** (`/admin/pins`): route vẫn cho vào nếu `role = 'admin'` **HOẶC** có ít nhất 1 record trong `board_admins`. Nếu không phải company Admin, query danh sách pin phải lọc `WHERE board_id IN (SELECT board_id FROM board_admins WHERE member_id = caller)` — Board Admin chỉ thấy đúng board mình được gán
- **Hiện danh tính thật ghim ẩn danh**: áp dụng logic OR tương tự — company Admin thấy mọi nơi, Board Admin chỉ thấy trong board mình được gán

### 5.6 Tài khoản cá nhân — RPC riêng cho tự sửa tên, Supabase Auth cho đổi mật khẩu

Theo `docs/SPEC.v12.md` mục 2.2a. Không tạo bảng/cột mới.

- **Đổi tên hiển thị**: Postgres function `update_own_display_name(new_name text)` với `SECURITY DEFINER` — chỉ `UPDATE members SET display_name = new_name WHERE user_id = auth.uid()`, không nhận `member_id` làm tham số để tránh sửa nhầm/cố ý sửa người khác qua truyền id tuỳ ý
- **Đổi mật khẩu**: dùng thẳng Supabase Auth client, KHÔNG qua bảng `members`:
  1. Xác nhận mật khẩu hiện tại: gọi `supabase.auth.signInWithPassword({ email, password: currentPassword })` — sai thì báo lỗi ngay, không cho qua bước tiếp
  2. Đổi mật khẩu: gọi `supabase.auth.updateUser({ password: newPassword })`
- **Xem phòng ban mình thuộc**: query đơn giản qua `member_departments` join `departments` WHERE `member_id` = member của caller — chỉ SELECT, không cần RPC riêng vì đã có RLS chuẩn ở mục 5

## 6. Ảnh & resize

- Upload ảnh từ client → resize bằng canvas phía client trước khi upload (max cạnh dài 1600px, nén JPEG quality ~0.8) để giữ "nhỏ xinh" đúng yêu cầu, giảm chi phí storage
- Không giới hạn số lượng ảnh mỗi pin ở tầng nghiệp vụ cho MVP (spec hiện tại: 1 ảnh/pin) — nhưng viết code upload dạng hàm tái sử dụng được, dễ mở rộng nhiều ảnh sau này
- Lưu vào Supabase Storage bucket `pin-images`, public read

---

## 7. Route `/embed`

- Route riêng `app/embed/[boardId]/page.tsx`, KHÔNG dùng chung layout có nav/admin
- Phải set header cho phép nhúng: không set `X-Frame-Options: DENY` (mặc định Next.js không set, nhưng kiểm tra kỹ middleware không chặn nhầm route này)
- Chỉ render khi `embed_enabled = true` và token khớp — sai token → trang trắng báo lỗi ngắn gọn, không lộ thông tin

---

## 8. Design tokens (dùng đúng, đừng tự sáng tạo thêm màu ngoài spec)

Tham chiếu đầy đủ tại `docs/SPEC.v12.md` mục 3. Tóm tắt bắt buộc:
- Font tiêu đề: Fredoka hoặc Quicksand (Google Fonts, có hỗ trợ tiếng Việt — kiểm tra subset `vietnamese` khi import)
- Font nội dung: Inter hoặc Nunito
- Bảng màu nền: kem ngà `#FBF3E7`, nhấn chính hồng đào `#F4A99B`, nhấn phụ vàng bơ `#F2C879`, nhấn mát xanh bạc hà `#A9CBB7`, chữ nâu than `#4A3B32`
- 4 board skin: wood / felt / linen / chalkboard — mỗi skin có bộ màu đinh ghim riêng (xem docs/SPEC.v12.md mục 3.4)
- 7 pin template: note / polaroid / floral / washi / garden / sunshine / love (xem docs/SPEC.v12.md mục 3.5)

---

## 8.1 Layout convention — Bảng ghim là màn hình chính

- Trang xem bảng (`/[companySlug]/board` và `/[companySlug]/board/[departmentId]`) render **full-height, full-width** dưới thanh nav mỏng — không đặt form tạo ghim hay danh sách khác chung khối cuộn với bảng
- Form tạo ghim **luôn nằm trong modal**, mở bằng nút FAB (Floating Action Button) cố định `position: fixed; bottom; right` — không render form inline trên trang
- Modal xem chi tiết 1 ghim (khi click vào ghim) là component riêng, khác modal tạo ghim
- Canvas bảng cho phép cuộn khi nội dung vượt viewport — không co nhỏ ghim lại để nhét vừa màn hình

### 8.1a Nav restructure — không đổi route/quyền, chỉ gộp lối vào

- Nav "Bảng ghim" là **dropdown trigger** (hover hoặc click), không phải link tĩnh — nội dung dropdown là danh sách board user xem được, mỗi dòng có control chọn làm mặc định (ghi vào `members.default_board_id`)
- Nav "Cài đặt" gộp 3 route cũ (`/admin/members`, `/admin/departments`, `/admin/settings`) làm 3 mục con trong 1 dropdown — **route và RLS giữ nguyên hoàn toàn**, đây thuần tuý là thay đổi UI điều hướng, không phải thay đổi phân quyền hay cấu trúc trang
- Route `/admin/pins` (Kiểm duyệt) giữ nguyên, chỉ thêm badge đỏ ở nav item dựa trên query mục 5.3

## 9. Coding conventions

- Component nằm trong `components/`, chia theo domain: `components/board/`, `components/pin/`, `components/admin/`
- Mọi Server Action / API route validate input bằng `zod`
- Đặt tên file, biến bằng tiếng Anh; nội dung hiển thị cho người dùng (UI text) bằng tiếng Việt
- Không dùng `any`; nếu cần, dùng `unknown` + narrow type

---

## 10. Git commit — bắt buộc theo đúng format

Luôn chạy đúng các dòng sau trước khi commit, không bỏ qua:

```
git config user.email "huynhlehungx89@gmail.com"
git config user.name "huynhlehungx89-9711"
git add .
git commit -m "type: mô tả ngắn"
```

**Không tự ý commit** nếu chưa hoàn thành 1 task trọn vẹn trong `docs/TASKS.v12.md` và chưa báo cáo lại kết quả (đã test được gì, còn thiếu gì) trước khi commit.

---

## 11. Thứ tự làm việc

Luôn làm theo đúng thứ tự trong `docs/TASKS.v12.md`, không nhảy cóc. Sau mỗi task, chạy thử (`npm run dev` hoặc test tương ứng) trước khi chuyển task tiếp theo. Nếu 1 task bị chặn vì thiếu quyết định nghiệp vụ chưa có trong `docs/SPEC.v12.md`, dừng lại và hỏi thay vì tự đoán.
