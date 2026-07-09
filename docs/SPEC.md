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
- [ ] Bảng ghim là **màn hình chính, chiếm toàn bộ viewport** (trừ thanh nav mỏng phía trên) — không phải 1 khối cuộn chung với form/danh sách khác. Đây là trải nghiệm cốt lõi của sản phẩm, phải nổi bật ngay khi vào trang, không bị chìm phía dưới các block khác.
- [ ] Nút **"+" (Floating Action Button)** cố định góc dưới-phải màn hình, luôn nổi trên bảng dù cuộn/kéo tới đâu
- [ ] Bấm nút "+" → mở **modal/pop-up** chứa form tạo ghim (nội dung, ảnh, template, danh tính, người nhận, bảng đích) — modal đóng lại thì quay về đúng vị trí đang xem trên bảng, không load lại trang
- [ ] Xem các Bảng phòng ban mình có quyền truy cập qua menu chuyển bảng (không đổi layout tổng thể)
- [ ] Bấm vào 1 ghim để xem phóng to / đọc đầy đủ (modal riêng, khác modal tạo ghim)

### 2.6a Vị trí tự do trên bảng (Kéo-thả)
- [ ] Bảng ghim là **canvas tự do**, không phải danh sách/lưới cố định — mỗi ghim có toạ độ (x, y) riêng trên bảng, giống ghim thật đính rải rác
- [ ] Ghim mới tạo: hệ thống tự chọn vị trí trống hợp lý (tránh chồng lên ghim khác) + góc xoay ngẫu nhiên nhẹ, tạo cảm giác tự nhiên
- [ ] Bất kỳ user nào (không riêng admin) đều kéo được ghim để sắp xếp lại — vị trí lưu lại ngay cho mọi người cùng thấy (không phải chỉ hiển thị tạm trên máy mình)
- [ ] Bảng có kích thước canvas lớn hơn màn hình khi có nhiều ghim — cho phép cuộn ngang/dọc để xem hết, không co ép ghim nhỏ lại

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

### 2.10 Quản trị nền tảng (Platform Admin — Connecta, không phải Admin công ty)
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

### 3.5 Template thẻ ghim — 4 mẫu (thiết kế thật, không chỉ đổi màu nền)

Mỗi template phải khác nhau về: **kết cấu nền, khung/viền, chi tiết trang trí, font chữ, và cách xử lý ảnh** — không được chỉ đổi màu nền rồi giữ nguyên bố cục.

**1. Giấy note viết tay**
- Nền: giấy trắng ngà có kẻ ngang mờ (lined paper), như trang vở
- Font nội dung: font dáng viết tay, hỗ trợ tiếng Việt (VD: Itim)
- Trang trí: 1 icon đinh ghim nhỏ (📍 hoặc SVG) ở mép trên, hơi xoay ngẫu nhiên (-3° đến 3°)
- Ảnh: nếu có, hiện nhỏ góc dưới như 1 tấm ảnh kẹp thêm — không phải yếu tố chính
- Bóng đổ: nhẹ, như tờ giấy hơi nhấc khỏi bảng

**2. Polaroid kỷ niệm**
- Khung: đúng tỷ lệ khung polaroid thật — viền trắng dày, riêng viền dưới dày hơn để chứa chú thích
- **Yêu cầu bắt buộc phải có ảnh** — nếu user chọn template này mà chưa upload ảnh, disable lựa chọn + hiện gợi ý "Cần thêm ảnh để dùng mẫu Polaroid"
- Chú thích dưới ảnh: font viết tay, căn giữa
- Trang trí: góc có thể có nét băng dán nhỏ, xoay ngẫu nhiên rõ hơn (-6° đến 6°)
- Bóng đổ: kiểu ảnh chụp thật, đậm hơn note

**3. Thiệp hoa lá**
- Nền: gradient pastel nhẹ (đào → kem)
- Trang trí: hoạ tiết hoa/lá nhỏ (SVG) ở 2 góc đối diện (trên-trái, dưới-phải), dùng đúng tông màu trong bảng màu đã chọn
- Viền: đường viền mảnh, có thể là viền đôi (double border) tạo cảm giác thiệp
- Font nội dung: font tiêu đề (Fredoka/Quicksand) thay vì viết tay — cảm giác trang trọng nhẹ, hợp lời chúc kỷ niệm làm việc
- Ảnh: nếu có, đặt trong khung bo góc nhỏ, có viền hoa bao quanh nhẹ
- Không xoay hoặc xoay rất ít (-1° đến 1°) — giữ cảm giác chỉn chu

**4. Washi tape**
- Nền: giấy kraft/be, hơi có texture
- Trang trí: 2 dải "băng keo giấy" (washi tape) hoạ tiết caro/chấm bi màu pastel, dán chéo ở 2 góc đối diện, đè lên mép thẻ (dùng CSS gradient/pattern, không cần ảnh thật)
- Font nội dung: font viết tay (Itim), phóng khoáng hơn note
- Ảnh: nếu có, hiện như 1 tấm ảnh dán thêm, có viền trắng, hơi lệch dưới 1 dải washi tape
- Xoay ngẫu nhiên rõ nhất trong 4 mẫu (-8° đến 8°) — cảm giác scrapbook tự do, phóng khoáng

**Nguyên tắc chung cho cả 4 mẫu:** ảnh (nếu có) không bao giờ bị crop mất nội dung quan trọng (dùng `object-fit: cover` cẩn thận hoặc cho phép user crop cơ bản trước khi đăng).

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
