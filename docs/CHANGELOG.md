# CHANGELOG — GratiPin Docs

Theo dõi thay đổi qua các version của bộ 3 file `SPEC`, `AGENT_RULES`, `TASKS`. Luôn dùng bản version cao nhất khi giao việc cho Cursor — các bản cũ giữ lại chỉ để tham khảo lịch sử, không sửa đè lên bản cũ nữa.

---

## v4 — 09/07/2026

**Lý do:** mở rộng bộ template từ 4 lên 7 mẫu để đa dạng cảm xúc hơn, đồng thời tinh chỉnh 3 mẫu theo phản hồi trực tiếp trên bản mockup.

**Thay đổi:**
- **File cập nhật**: `docs/pin-templates-reference.html` — thêm 3 template mới (Vườn Xanh, Nắng Ấm, Thư Yêu Thương), mỗi mẫu có ví dụ nội dung ngắn/dài để test tràn chữ. File này không đánh version riêng — luôn dùng bản mới nhất.
- `SPEC.v4.md`: mục 3.5 viết lại đầy đủ cho cả 7 template (mô tả, biên độ xoay, cách xử lý ảnh riêng từng mẫu):
  - Floral: thêm dải cỏ hoa nhỏ dọc viền dưới (nhẹ hơn Garden để tránh trùng cảm giác)
  - Sunshine: thêm quầng sáng lan toả + tăng 6→8 tia nắng + sparkle — "rạng rỡ" hơn
  - Love: thêm 2-3 trái tim mờ bay trong nền, layer dưới chữ
  - Garden, Sunshine, Love: 3 template hoàn toàn mới
- `AGENT_RULES.v4.md`: mở rộng CHECK constraint `pins.template` thêm `garden`, `sunshine`, `love`
- `TASKS.v4.md`: thêm Phase 5.7 — build 3 template mới + tinh chỉnh 3 template cũ (8 task)

**File đổi:** SPEC, AGENT_RULES, TASKS (lên v4) + `pin-templates-reference.html` (cập nhật tại chỗ, không version riêng)

---

## v3 — 09/07/2026

**Lý do:** test thực tế Phase 5.5 phát hiện 2 vấn đề: (1) template không có ảnh vẫn hiện khối "Chưa có ảnh" trống, không giống 1 tờ ghim thật; (2) 4 template vẫn chỉ khác màu, chưa có sự khác biệt về kết cấu/trang trí như mô tả — mô tả bằng chữ chưa đủ rõ để implement đúng.

**Thay đổi:**
- **File mới**: `docs/pin-templates-reference.html` — mockup HTML/CSS thật của cả 4 template, ở cả 2 trạng thái có/không ảnh. Đây là nguồn tham chiếu chính, ưu tiên hơn mô tả chữ trong SPEC.
- `SPEC.v3.md`: mục 3.5 thêm quy tắc cứng "không render khối ảnh/placeholder khi không có ảnh" cho Note/Floral/Washi, dẫn chiếu trực tiếp tới file HTML mẫu
- `TASKS.v3.md`: thêm Phase 5.6 — sửa lại đúng 2 vấn đề trên, dựa trên file tham chiếu thay vì mô tả

**File đổi:** SPEC, AGENT_RULES (chỉ đổi số version, không có thay đổi nội dung), TASKS + 1 file tham chiếu mới

---

## v2 — 09/07/2026

**Lý do:** phát hiện khi mới tạo công ty, vào thẳng bảng trống ngay, chưa có bước thiết lập ban đầu — trải nghiệm hụt hẫng, thiếu cảm giác "khai trương".

**Thay đổi:**
- `SPEC.v2.md`: thêm mục 2.1a — Setup Wizard 5 bước (Chào mừng → Chọn skin bảng chung → Mời thành viên → Tạo phòng ban đầu tiên → Hoàn tất), chỉ chạy 1 lần cho người tạo công ty
- `AGENT_RULES.v2.md`: 
  - Thêm cột `companies.onboarding_completed`
  - Thêm cột `members.is_owner` (đánh dấu admin đầu tiên/người tạo công ty, để phân biệt với admin được nâng quyền sau)
  - Thêm rule redirect middleware: chặn `is_owner` chưa hoàn tất wizard vào thẳng `/board`
- `TASKS.v2.md`: thêm Phase 2.6 — Setup Wizard (6 task), cập nhật task 2.2/2.3 cho khớp field mới

**File đổi:** SPEC, AGENT_RULES, TASKS (cả 3 lên v2 cùng lúc)

---

## v1 — 09/07/2026

**Nội dung:** Bản đầy đủ đầu tiên sau khi chốt concept GratiPin, bao gồm:
- Kiến trúc multi-tenant, schema 6 bảng gốc (companies, members, departments, member_departments, boards, pins)
- Tính năng: đăng ký công ty, quản lý user/phòng ban, tạo/xem ghim, chia sẻ MXH, nhúng iframe, kiểm duyệt, Platform Admin (Connecta)
- Design spec: bảng màu, typography, 4 board skin, 4 pin template
- Bổ sung sau khi test thực tế lần 1 (chưa tách version riêng, đã gộp vào v1): layout full-screen + FAB + modal, kéo-thả tự do vị trí ghim (`position_x/y`, `rotation`), thiết kế chi tiết thật cho 4 template thay vì chỉ đổi màu

**File:** SPEC.v1.md, AGENT_RULES.v1.md, TASKS.v1.md
