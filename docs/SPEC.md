# GratiPin — Spec tổng hợp (v1, để review)

> SaaS đa khách hàng (multi-tenant) — nền tảng ghi nhận, biết ơn và lưu giữ kỷ niệm công ty, giao diện dạng bảng ghim ấm áp.

---

## 1. Kiến trúc tổng thể

- **Multi-tenant**: mỗi công ty là 1 tenant độc lập — dữ liệu, user, logo, bảng ghim tách biệt hoàn toàn
- **Tự đăng ký (self-signup)**: công ty mới tự tạo tài khoản, không cần Connecta khởi tạo tay
- **2 vai trò**: Admin, User (chưa có vai trò trung gian như "trưởng phòng" ở MVP)

---

## 2. Danh sách tính năng chi tiết

### 2.1 Đăng ký & Onboarding công ty
- [ ] Form tạo công ty mới: tên công ty, upload logo, tạo tài khoản admin đầu tiên (email + mật khẩu)
- [ ] Sau khi tạo công ty → tự động có sẵn 1 "Bảng chung công ty" (chưa có bảng phòng ban nào)
- [ ] Admin đăng nhập lần đầu → màn hình hướng dẫn nhanh (3 bước: mời user, tạo phòng ban nếu cần, đăng ghim đầu tiên)

### 2.2 Quản lý người dùng (Admin)
- [ ] Thêm user (email, tên hiển thị)
- [ ] Xoá user
- [ ] Gán user vào **một hoặc nhiều phòng ban cùng lúc** (không giới hạn số lượng)
- [ ] Đổi user thành admin / hạ quyền admin (tối thiểu phải còn 1 admin)

### 2.3 Quản lý phòng ban & bảng ghim (Admin)
- [ ] Tạo phòng ban mới → tự động sinh 1 bảng ghim riêng cho phòng ban đó
- [ ] Giải thể phòng ban → bảng ghim chuyển sang trạng thái **"Đã lưu trữ" (archived)**: không nhận ghim mới, nhưng vẫn xem lại được toàn bộ, **không bao giờ xoá kỷ niệm**
- [ ] Chọn **loại bảng (board skin)** cho mỗi bảng khi tạo: Gỗ mộc / Nỉ nhung / Vải lanh / Chalkboard
- [ ] Đổi loại bảng sau này (không bắt buộc phải cố định vĩnh viễn)

### 2.4 Quản lý công ty (Admin)
- [ ] Upload / đổi logo công ty (hiển thị trên tất cả bảng + trên ảnh chia sẻ)
- [ ] Đổi tên công ty

### 2.5 Tạo Ghim (User — mọi thành viên)
- [ ] Viết nội dung (bắt buộc)
- [ ] Đính kèm 1 ảnh (tuỳ chọn) — **không giới hạn số lượng/dung lượng upload phía người dùng**, hệ thống tự động resize về kích thước tối ưu (nhỏ xinh, đủ nét) trước khi lưu để tối ưu chi phí lưu trữ
- [ ] Chọn **template thẻ**: Giấy note viết tay / Polaroid kỷ niệm / Thiệp hoa lá / Washi tape
- [ ] Chọn hiển thị **công khai tên** hoặc **ẩn danh**
- [ ] Tuỳ chọn **tag người nhận** (chọn từ danh sách user trong công ty) — hoặc để trống nếu là kỷ niệm chung
- [ ] Chọn **đăng lên bảng nào**: Bảng chung công ty, hoặc 1 bảng phòng ban mà mình thuộc về
- [ ] Xem trước (preview) thẻ trước khi đăng

### 2.6 Xem Bảng ghim (mọi user)
- [ ] Xem Bảng chung công ty
- [ ] Xem các Bảng phòng ban mình có quyền truy cập
- [ ] Ghim hiển thị dạng "đính trên bảng" — vị trí xếp theo thời gian đăng (mới nhất dễ thấy nhất), có hiệu ứng ghim/đinh thật
- [ ] Bấm vào 1 ghim để xem phóng to / đọc đầy đủ

### 2.7 Chia sẻ mạng xã hội (mọi user, chỉ với ghim công khai)
- [ ] Nút "Chia sẻ" trên mỗi ghim → xuất ảnh theo đúng style template đã chọn, kèm logo công ty góc nhỏ
- [ ] Tải ảnh về hoặc chia sẻ trực tiếp (Facebook / Zalo / LinkedIn — tuỳ nền tảng hỗ trợ share link ảnh)
- [ ] Ghim ẩn danh khi chia sẻ: không hiện tên người đăng, chỉ hiện nội dung + (nếu có) tên người được tag nhận

### 2.8 Nhúng bảng ra ngoài (Embed)
- [ ] Admin bật "Cho phép nhúng" cho 1 bảng cụ thể → sinh ra đoạn mã `<iframe>` để dán vào website công ty hoặc nơi khác
- [ ] Bảng nhúng hiển thị dạng chỉ-xem (read-only), giữ nguyên skin + ghim, không lộ chức năng quản trị
- [ ] Ghim ẩn danh khi nhúng vẫn giữ ẩn danh (không lộ danh tính thật ra bên ngoài)

### 2.9 Kiểm duyệt (Admin)
- [ ] Xem toàn bộ ghim của công ty (kể cả ẩn danh — admin thấy được ai đăng để xử lý vi phạm, nhưng không hiển thị ra ngoài)
- [ ] Ẩn / xoá ghim vi phạm — **đây là trường hợp duy nhất một ghim bị gỡ**
- [ ] (Không có bước duyệt trước khi đăng — chỉ xử lý sau, giữ trải nghiệm đăng ghim nhanh gọn)

> **Nguyên tắc cốt lõi**: Ghim đã đăng không thể tự xoá bởi chính người đăng — đúng tinh thần "kỷ niệm không biến mất". Chỉ Admin mới có quyền ẩn/xoá, và chỉ dùng cho trường hợp vi phạm.

---

### 2.9 Quản trị nền tảng (Platform Admin — Connecta, không phải Admin công ty)
- [ ] Route riêng chỉ Connecta truy cập được, ví dụ `/connecta-admin`
- [ ] Danh sách toàn bộ công ty đã đăng ký: tên công ty, slug, ngày tạo, email admin, số lượng thành viên / phòng ban / ghim
- [ ] MVP: chỉ xem (read-only), chưa cần khoá/sửa công ty ở bước này
- [ ] Phân quyền: không tạo role mới trong DB — chỉ kiểm tra email đăng nhập có nằm trong danh sách email Platform Admin (khai báo qua biến môi trường) hay không

## 3. Design Spec

### 3.1 Tinh thần thiết kế
Ấm áp, thủ công (handmade), như một góc tường thật trong văn phòng — tránh cảm giác "phần mềm doanh nghiệp" lạnh lùng. Ưu tiên cảm xúc tích cực hơn là hiệu năng hiển thị dữ liệu.

### 3.2 Bảng màu gợi ý (pastel ấm)
| Vai trò màu | Gợi ý tông |
|---|---|
| Nền tổng thể | Kem ngà (#FBF3E7) |
| Nhấn chính | Hồng đào (#F4A99B) |
| Nhấn phụ | Vàng bơ (#F2C879) |
| Nhấn mát | Xanh bạc hà (#A9CBB7) |
| Chữ chính | Nâu than ấm (#4A3B32), không dùng đen thuần |

*(Đây là gợi ý ban đầu — sẽ tinh chỉnh kỹ hơn ở bước thiết kế chi tiết cho Cursor)*

### 3.3 Typography
- **Tiêu đề / tên ghim**: font tròn trịa, hơi có nét viết tay nhẹ (VD nhóm font: Fredoka, Quicksand, hoặc tương đương có hỗ trợ tiếng Việt)
- **Nội dung ghim**: font dễ đọc, thân thiện (VD: Inter, Nunito)
- Toàn bộ font phải hỗ trợ dấu tiếng Việt đầy đủ

### 3.4 Loại bảng (Board Skins) — 4 mẫu
| Skin | Cảm giác | Màu đinh ghim đi kèm |
|---|---|---|
| Gỗ mộc | Ấm áp, gần gũi, truyền thống | Đỏ gạch, vàng đồng |
| Nỉ nhung | Sang trọng nhẹ, trầm tĩnh | Xanh rêu, nâu đất |
| Vải lanh | Tối giản, sáng | Trắng, be nhạt |
| Chalkboard | Năng động, sáng tạo | Neon pastel (hồng, xanh mint) |

### 3.5 Template thẻ ghim — 4 mẫu
| Template | Đặc điểm | Hợp với |
|---|---|---|
| Giấy note viết tay | Nền giấy kẻ ngang, chữ dạng viết tay | Lời cảm ơn ngắn |
| Polaroid kỷ niệm | Khung ảnh polaroid, mép trắng, chú thích bên dưới | Ảnh team building |
| Thiệp hoa lá | Viền hoa nhỏ góc thẻ, tông pastel | Lời chúc trang trọng (kỷ niệm làm việc) |
| Washi tape | Băng keo giấy màu dán 2 góc, phong cách scrapbook | Kỷ niệm tự do, đa dạng |

### 3.6 Component chính cần thiết kế
- Ghim (Pin card) — 4 biến thể template × trạng thái có ảnh / không ảnh
- Bảng ghim (Board) — 4 biến thể skin, layout hiển thị nhiều ghim
- Form tạo ghim (chọn template, ảnh, danh tính, người nhận, bảng đích)
- Trang quản trị Admin (danh sách user, danh sách phòng ban, danh sách bảng)
- Ảnh xuất chia sẻ (export card) — theo đúng style đã chọn + logo

---

## 4. Ngoài phạm vi MVP (Phase 2)
- Kết nối Odoo để đồng bộ danh sách nhân viên/phòng ban tự động
- Cho phép admin tự upload ảnh nền bảng tuỳ ý (ngoài 4 skin có sẵn)
- Vai trò trung gian (trưởng phòng quản lý riêng bảng phòng ban mình)
- Duyệt nội dung trước khi đăng (pre-moderation)
- **💰 Tính năng trả phí (ý tưởng nâng cấp/monetization):** "Tải toàn bộ kỷ niệm" — xuất tất cả ghim của công ty thành ảnh, đóng gói vào 1 file `.zip` để tải về lưu trữ ngoài hệ thống. Ghi chú lại để cân nhắc đưa vào gói trả phí nếu sản phẩm bắt đầu thu phí — chưa làm ở MVP.

---

## 5. Nguyên tắc đã chốt (không còn là câu hỏi mở)
1. **Giải thể phòng ban** → bảng chuyển trạng thái "Đã lưu trữ", kỷ niệm giữ nguyên, không xoá
2. **Đa phòng ban** → 1 user có thể thuộc nhiều phòng ban cùng lúc, không giới hạn
3. **Ảnh đính kèm** → không giới hạn số lượng/dung lượng phía người dùng, hệ thống tự resize nhỏ gọn trước khi lưu
