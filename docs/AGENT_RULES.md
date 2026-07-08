# AGENT RULES — GratiPin

Đây là quy tắc bắt buộc khi build sản phẩm này. Đọc kỹ trước khi làm bất kỳ task nào trong `docs/TASKS.md`. Nếu có mâu thuẫn giữa task cụ thể và rule ở đây, **rule ở đây luôn thắng**.

---

## 1. Tổng quan sản phẩm

SaaS đa khách hàng (multi-tenant): nền tảng ghi nhận, biết ơn và lưu giữ kỷ niệm công ty, giao diện dạng bảng ghim (corkboard). Xem chi tiết tính năng & design tại `docs/SPEC.md` (đính kèm cùng bộ này) — file đó là nguồn sự thật (source of truth) về nghiệp vụ.

**Tuyệt đối không tích hợp AI/LLM API vào bất kỳ tính năng nào của sản phẩm này** (không gợi ý nội dung, không kiểm duyệt bằng AI, không tóm tắt gì cả). Đây là constraint cứng, không phải gợi ý.

---

## 2. Tech stack (bắt buộc, không tự ý đổi)

- **Framework**: Next.js 14, App Router
- **Ngôn ngữ**: TypeScript, strict mode bật
- **Database + Auth + Storage**: Supabase (Postgres, Supabase Auth email/password, Supabase Storage cho ảnh)
- **CSS**: Tailwind CSS
- **Deploy**: Vercel
- Không thêm ORM khác (không Prisma) — dùng Supabase client trực tiếp + generated types (`supabase gen types typescript`)

---

## 3. Multi-tenancy — path-based slug

Theo đúng pattern đã dùng ở Pickleball Manager: routing dạng `domain.com/{company-slug}/...`

- Mỗi công ty có 1 `slug` duy nhất, sinh tự động từ tên công ty lúc đăng ký (lowercase, không dấu, gạch ngang), kiểm tra trùng và cho phép chỉnh tay nếu trùng
- Toàn bộ route nghiệp vụ nằm dưới `app/[companySlug]/...`
- Middleware xác thực: mọi request vào `[companySlug]` phải kiểm tra user hiện tại có phải member của company đó không — nếu không, redirect về trang chọn công ty hoặc 404 (không lộ thông tin công ty khác tồn tại hay không)

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
  created_at timestamptz
)

members (
  id uuid pk,
  user_id uuid references auth.users,
  company_id uuid references companies,
  display_name text,
  role text check (role in ('admin','user')),
  created_at timestamptz
)

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
  template text check (template in ('note','polaroid','floral','washi')),
  is_hidden boolean default false, -- admin ẩn khi vi phạm, KHÔNG xoá record
  created_at timestamptz
)
```

**Nguyên tắc cứng:**
- Bảng `pins` **không có hành động DELETE nào phía user hoặc code nghiệp vụ thông thường** — chỉ có `is_hidden` để admin ẩn khi vi phạm. Không viết bất kỳ API route hay UI nào cho phép xoá cứng 1 pin.
- Khi 1 department chuyển `status = 'archived'`: board tương ứng vẫn giữ nguyên, chỉ chặn tạo pin mới vào board đó (kiểm tra ở API tạo pin: nếu department archived → từ chối).
- `is_anonymous = true` chỉ ẩn danh ở tầng hiển thị UI cho user thường — admin luôn query được `author_member_id` thật để xử lý vi phạm.

---

## 5. Row Level Security (RLS) — bắt buộc bật cho mọi bảng

- Mọi bảng có `company_id` → RLS policy chỉ cho phép user thao tác nếu `company_id` khớp với company của member hiện tại (join qua `members.user_id = auth.uid()`)
- Riêng thao tác ghi vào `pins.is_hidden`, sửa `companies.logo_url`, quản lý `members`, `departments`: chỉ role `admin` được phép (thêm điều kiện role trong policy)
- Route `/embed/[boardId]` dùng service-role query có kiểm tra `embed_token` khớp, KHÔNG dùng RLS user-context vì đây là truy cập ẩn danh công khai

---

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

Tham chiếu đầy đủ tại `docs/SPEC.md` mục 3. Tóm tắt bắt buộc:
- Font tiêu đề: Fredoka hoặc Quicksand (Google Fonts, có hỗ trợ tiếng Việt — kiểm tra subset `vietnamese` khi import)
- Font nội dung: Inter hoặc Nunito
- Bảng màu nền: kem ngà `#FBF3E7`, nhấn chính hồng đào `#F4A99B`, nhấn phụ vàng bơ `#F2C879`, nhấn mát xanh bạc hà `#A9CBB7`, chữ nâu than `#4A3B32`
- 4 board skin: wood / felt / linen / chalkboard — mỗi skin có bộ màu đinh ghim riêng (xem docs/SPEC.md mục 3.4)
- 4 pin template: note / polaroid / floral / washi (xem docs/SPEC.md mục 3.5)

---

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

**Không tự ý commit** nếu chưa hoàn thành 1 task trọn vẹn trong `docs/TASKS.md` và chưa báo cáo lại kết quả (đã test được gì, còn thiếu gì) trước khi commit.

---

## 11. Thứ tự làm việc

Luôn làm theo đúng thứ tự trong `docs/TASKS.md`, không nhảy cóc. Sau mỗi task, chạy thử (`npm run dev` hoặc test tương ứng) trước khi chuyển task tiếp theo. Nếu 1 task bị chặn vì thiếu quyết định nghiệp vụ chưa có trong `docs/SPEC.md`, dừng lại và hỏi thay vì tự đoán.
