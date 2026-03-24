# Hướng dẫn Test — Duly's House Booking System

## 1. Khởi động hệ thống

### Docker (khuyến nghị)
```bash
docker compose up -d --build
# Tự động chạy migrate + seed lần đầu
# Frontend: http://localhost
# Backend API: http://localhost:8000
```

### Manual (development)
```bash
# Terminal 1 — Backend
cd backend
composer install
cp .env.example .env && php artisan key:generate
# Sửa .env: DB_DATABASE=dulys_house, DB_USERNAME=root, DB_PASSWORD=...
php artisan migrate:fresh --seed
php artisan serve   # http://localhost:8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev         # http://localhost:5173
```

---

## 2. Tài khoản test (đã seed)

| Email | Mật khẩu | Vai trò | Ghi chú |
|---|---|---|---|
| `admin@dulyshouse.vn` | `
` | admin | Full access |
| `owner@dulyshouse.vn` | `password` | owner | Quản lý cơ sở |
| `staff@dulyshouse.vn` | `password` | staff | Nhân viên |
| `guest@dulyshouse.vn` | `password` | guest | Khách hàng |

> Trang đăng nhập có nút **quick-login** cho từng tài khoản test.

---

## 3. Test Flow: Trang công khai (Public)

### 3.1 Trang chủ (`/`)
- [ ] Hero section hiển thị đúng (ảnh, tiêu đề, form tìm kiếm)
- [ ] Section "Homestay nổi bật" có 3 card với ảnh, giá, rating
- [ ] Section "Điểm đến" hiển thị đúng
- [ ] Section "Tại sao chọn chúng tôi" hiển thị đúng
- [ ] Section "Đánh giá" (Testimonials) hiển thị đúng
- [ ] Footer đầy đủ
- [ ] Responsive: Thu nhỏ màn hình → hamburger menu xuất hiện

### 3.2 Tìm kiếm (`/search`)
- [ ] Truy cập `/search` không có params → hiện danh sách tất cả homestay
- [ ] Nhập ngày nhận/trả phòng + số khách → bấm "Tìm kiếm"
- [ ] Kết quả nhóm theo homestay, hiển thị loại phòng + số phòng trống + giá
- [ ] Bấm "Xem chi tiết" → điều hướng đến trang chi tiết homestay
- [ ] Tìm ngày quá xa (không có phòng) → hiện empty state "Không tìm thấy phòng trống"
- [ ] Card homestay có hover effect (shadow + translate lên)
- [ ] Image placeholder gradient khi không có ảnh thumbnail

### 3.3 Chi tiết Homestay (`/homestays/:slug`)
- [ ] Hiển thị: ảnh hero (hoặc gradient placeholder), tên, địa chỉ, mô tả
- [ ] Danh sách loại phòng: tên, giá/đêm, sức chứa tối đa, nút đặt phòng
- [ ] Card loại phòng có hover effect
- [ ] Section đánh giá (ReviewSection): hiển thị rating trung bình, danh sách đánh giá
- [ ] Chọn ngày + số phòng → bấm "Đặt phòng" → chuyển sang trang booking
- [ ] Chưa đăng nhập bấm "Đặt phòng" → redirect đến `/login`

### 3.4 Đặt phòng (`/booking`) — cần đăng nhập
- [ ] Form thông tin: Họ tên, SĐT, Email (tự điền từ profile), Ghi chú
- [ ] Panel bên phải: tóm tắt đơn (homestay, loại phòng, ngày, số đêm, giá)
- [ ] Tổng tiền hiển thị đúng format `500.000₫`
- [ ] Bấm "Xác nhận đặt phòng" → loading → chuyển sang success page
- [ ] Validate: không điền tên/SĐT → hiện lỗi validation

### 3.5 Đặt phòng thành công (`/booking/success`)
- [ ] Icon check xanh + tiêu đề "Đặt phòng thành công!"
- [ ] Hiển thị mã đặt phòng (format `BKxxxxxx`)
- [ ] Trạng thái: badge "Chờ xác nhận" (có pulse animation)
- [ ] Thông tin: homestay, loại phòng, ngày, tổng tiền
- [ ] Nút "Xem đặt phòng của tôi" → `/my-bookings`
- [ ] Nút "Về trang chủ" → `/`

---

## 4. Test Flow: Đăng nhập / Đăng ký

### 4.1 Đăng nhập (`/login`)
- [ ] Form email + password
- [ ] Password toggle (bấm icon mắt để show/hide)
- [ ] Đăng nhập đúng → redirect về trang trước đó
- [ ] Đăng nhập sai → hiện lỗi "Email hoặc mật khẩu không đúng"
- [ ] Nút quick-login: bấm "Admin" / "Owner" / "Staff" / "Guest" → đăng nhập nhanh
- [ ] Đã đăng nhập truy cập `/login` → redirect về `/`
- [ ] Link "Đăng ký" → `/register`

### 4.2 Đăng ký (`/register`)
- [ ] Form: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu
- [ ] Password toggle cho cả 2 field mật khẩu
- [ ] Đăng ký thành công → tự động đăng nhập → redirect `/`
- [ ] Email trùng → lỗi validation
- [ ] Mật khẩu không khớp → lỗi validation
- [ ] Đã đăng nhập truy cập `/register` → redirect về `/`

### 4.3 Đăng xuất
- [ ] Bấm "Đăng xuất" trên header → xóa token → về trang chủ
- [ ] Truy cập route protected (`/my-bookings`) → redirect `/login`

---

## 5. Test Flow: Dashboard khách hàng (`/my-bookings`)

### 5.1 Tab "Sắp tới"
- [ ] Hiển thị đơn đặt phòng pending + confirmed
- [ ] Card: mã đặt, homestay, ngày, loại phòng, tổng tiền, trạng thái
- [ ] StatusBadge "Chờ xác nhận" có pulse animation (chấm vàng nhấp nháy)
- [ ] Nút "Huỷ đặt phòng" → confirm dialog → huỷ thành công → badge "Đã huỷ"

### 5.2 Tab "Đã qua"
- [ ] Hiển thị đơn checked_in, checked_out, cancelled
- [ ] Đơn checked_out chưa đánh giá → nút "★ Đánh giá"
- [ ] Bấm "★ Đánh giá" → modal: chọn sao (1-5) + viết comment → submit
- [ ] Đánh giá thành công → nút đổi thành "✓ Đã đánh giá"
- [ ] Đơn checked_out đã đánh giá → hiển thị "✓ Đã đánh giá" (không thể đánh giá lại)

### 5.3 Tab "Hồ sơ"
- [ ] Hiển thị thông tin: Họ tên, Email, SĐT
- [ ] Bấm "Chỉnh sửa" → form edit → lưu thành công
- [ ] Đổi mật khẩu: nhập mật khẩu mới + xác nhận → lưu → đăng nhập lại bằng mật khẩu mới

---

## 6. Test Flow: Thông báo

### 6.1 NotificationBell (trên header)
- [ ] Icon chuông hiển thị trên cả PublicLayout và AdminLayout
- [ ] Badge số thông báo chưa đọc (nếu > 0)
- [ ] Bấm chuông → dropdown danh sách thông báo
- [ ] Bấm vào thông báo → đánh dấu đã đọc
- [ ] Nút "Đánh dấu tất cả đã đọc"
- [ ] Bấm ngoài dropdown → đóng

### 6.2 Trang thông báo (`/notifications`)
- [ ] Danh sách đầy đủ, phân trang
- [ ] Thông báo chưa đọc có nền highlight (xanh nhạt)
- [ ] Bấm vào → đánh dấu đã đọc
- [ ] Nút "Đánh dấu tất cả đã đọc"
- [ ] Tạo booking mới → kiểm tra admin/staff nhận thông báo

---

## 7. Test Flow: Admin (`/admin`)

> Đăng nhập bằng `admin@dulyshouse.vn` hoặc `staff@dulyshouse.vn`

### 7.1 Sidebar responsive
- [ ] Desktop (>=1024px): sidebar hiển thị cố định bên trái
- [ ] Mobile (<1024px): sidebar ẩn, hiện hamburger button
- [ ] Bấm hamburger → sidebar trượt ra với overlay
- [ ] Bấm overlay hoặc nút X → đóng sidebar
- [ ] Bấm link trong sidebar mobile → đóng sidebar + điều hướng

### 7.2 Dashboard (`/admin`)
- [ ] 4 stat cards: Tổng doanh thu, Tổng đặt phòng, Cơ sở hoạt động, Tổng khách hàng
- [ ] Biểu đồ cột doanh thu 6 tháng gần nhất
- [ ] Bảng đặt phòng gần đây (5 dòng): mã, khách, cơ sở, trạng thái, tổng tiền

### 7.3 Quản lý đặt phòng (`/admin/bookings`)
- [ ] Danh sách đặt phòng phân trang
- [ ] Tìm kiếm theo mã đặt phòng / tên khách
- [ ] Lọc theo trạng thái
- [ ] Chi tiết đơn: bấm vào đơn → hiện modal/panel chi tiết
- [ ] Lifecycle actions:
  - [ ] Pending → Bấm "Xác nhận" → status `confirmed`
  - [ ] Confirmed → Bấm "Nhận phòng" → status `checked_in` (tự assign phòng)
  - [ ] Checked_in → Bấm "Trả phòng" → status `checked_out` (release phòng, thanh toán success)
  - [ ] Pending/Confirmed → Bấm "Huỷ" → status `cancelled`
- [ ] Sau mỗi action → khách nhận thông báo

### 7.4 Quản lý cơ sở (`/admin/homestays`)
- [ ] Danh sách homestay
- [ ] Thêm mới: tên, địa chỉ, hotline, email, mô tả, trạng thái
- [ ] Sửa thông tin
- [ ] Bật/tắt hoạt động

### 7.5 Quản lý phòng (`/admin/rooms`)
- [ ] Danh sách phòng (room_code, loại phòng, homestay, trạng thái, cleanliness)
- [ ] Thêm phòng mới
- [ ] Cập nhật trạng thái: available / occupied / maintenance
- [ ] Cập nhật cleanliness: clean / dirty / inspected

### 7.6 Quản lý khách hàng (`/admin/customers`)
- [ ] Danh sách khách hàng: tên, SĐT, email, số đơn đặt
- [ ] Xem chi tiết khách → lịch sử đặt phòng

### 7.7 Thanh toán (`/admin/payments`)
- [ ] Danh sách thanh toán
- [ ] Tạo thanh toán mới: chọn booking, nhập số tiền, phương thức (transfer/cash/card)
- [ ] Trạng thái thanh toán: pending / success / failed

### 7.8 Lịch phòng (`/admin/availability`)
- [ ] Dropdown chọn loại phòng
- [ ] Lịch theo tháng: navigation tháng trước/sau
- [ ] Mỗi ô ngày hiển thị: ngày, số phòng trống/tổng, giá
- [ ] Màu sắc: xanh (còn phòng), đỏ (hết), cam (blocked)
- [ ] Chặn ngày: chọn ngày → nhập lý do → bấm "Chặn"
- [ ] Bỏ chặn: bấm vào ngày blocked → xác nhận bỏ chặn
- [ ] Đặt giá override: chọn khoảng ngày → nhập giá mới → lưu
- [ ] Xoá price override

### 7.9 Báo cáo (`/admin/reports`)
- [ ] **Tab Doanh thu**: Biểu đồ cột doanh thu theo homestay + bảng chi tiết + tổng + trung bình
- [ ] **Tab Công suất**: Biểu đồ đường công suất hàng ngày + card % trung bình
- [ ] **Tab Huỷ phòng**: Biểu đồ tròn + tỷ lệ huỷ + bảng huỷ gần đây
- [ ] Chọn khoảng ngày → dữ liệu cập nhật đúng
- [ ] Chuyển tab → không mất date range

---

## 8. Test: Phân quyền (Role-based Access)

| Route | guest | staff | owner | admin |
|---|---|---|---|---|
| `/my-bookings` | OK | OK | OK | OK |
| `/booking` | OK | OK | OK | OK |
| `/admin` | 403 | OK | OK | OK |
| `/admin/bookings` | 403 | OK | OK | OK |

- [ ] Đăng nhập guest → truy cập `/admin` → bị chặn (redirect hoặc 403)
- [ ] Đăng nhập staff → truy cập `/admin` → OK

---

## 9. Test: Business Rules (Edge Cases)

### 9.1 Concurrent Booking
- [ ] Mở 2 tab, cả 2 đặt cùng loại phòng, cùng ngày, cùng số lượng = max
- [ ] Tab 1 đặt thành công, Tab 2 phải báo lỗi "Không đủ phòng trống"

### 9.2 Booking Expiry
- [ ] Đặt phòng pending → có `expires_at` (15-30 phút)
- [ ] Sau khi hết hạn → đơn tự động cancelled → phòng giải phóng

### 9.3 Blocked Dates
- [ ] Admin chặn ngày cho loại phòng A (ngày 10-15)
- [ ] Guest tìm kiếm ngày 10-15 → loại phòng A không xuất hiện
- [ ] Guest tìm kiếm ngày 16-20 → loại phòng A xuất hiện bình thường

### 9.4 Price Override
- [ ] Admin đặt giá override 800.000₫ cho loại phòng B ngày 1-5
- [ ] Guest đặt phòng B ngày 1-3 (2 đêm) → tổng = 800.000 x 2 = 1.600.000₫
- [ ] Guest đặt phòng B ngày 4-7 (3 đêm) → tổng = 800.000 x 2 + giá gốc x 1

### 9.5 Review
- [ ] Chỉ đánh giá được đơn `checked_out`
- [ ] Không thể đánh giá đơn của người khác (403)
- [ ] Không thể đánh giá 2 lần cùng 1 đơn (422)
- [ ] Rating phải 1-5

---

## 10. API Sanity Checks (curl)

```bash
# Login
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dulyshouse.vn","password":"password"}'

# Lấy token từ response, thay vào TOKEN bên dưới
TOKEN="your-token-here"

# Homestays
curl -s http://localhost:8000/api/homestays

# Search
curl -s -X POST http://localhost:8000/api/search/availability \
  -H "Content-Type: application/json" \
  -d '{"check_in":"2026-04-01","check_out":"2026-04-03","guests":2}'

# Admin Dashboard
curl -s http://localhost:8000/api/admin/dashboard/summary \
  -H "Authorization: Bearer $TOKEN"

# Admin Bookings
curl -s http://localhost:8000/api/admin/bookings \
  -H "Authorization: Bearer $TOKEN"

# Notifications
curl -s http://localhost:8000/api/notifications \
  -H "Authorization: Bearer $TOKEN"

# Calendar (thay {room_type_id} bằng ID thật)
curl -s "http://localhost:8000/api/admin/room-types/{room_type_id}/calendar?month=2026-03" \
  -H "Authorization: Bearer $TOKEN"

# Reports
curl -s "http://localhost:8000/api/admin/reports/revenue-by-homestay?from=2026-01-01&to=2026-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 11. Troubleshooting Docker

```bash
# Xem logs backend
docker compose logs --tail=50 backend

# Bật debug mode tạm thời
# Trong docker-compose.yml: APP_DEBUG: "true"
docker compose up -d backend

# Chạy lại migrate/seed
docker compose exec backend php artisan migrate:fresh --seed --force

# Vào shell container
docker compose exec backend sh

# Reset toàn bộ
docker compose down -v
docker compose up -d --build
```

---

## 12. Checklist tổng hợp

| # | Feature | Status |
|---|---|---|
| 1 | Homepage (Hero, Featured, Destinations, WhyChooseUs, Testimonials) | |
| 2 | Search + filter | |
| 3 | Homestay detail + room types | |
| 4 | Booking flow (form → success) | |
| 5 | Auth (login, register, logout) | |
| 6 | Password toggle (show/hide) | |
| 7 | My Bookings (upcoming, past, profile) | |
| 8 | Cancel booking | |
| 9 | Review (after checkout) | |
| 10 | Notifications (bell + page) | |
| 11 | Admin Dashboard (stats + chart + recent) | |
| 12 | Admin Booking Management (full lifecycle) | |
| 13 | Admin Homestay CRUD | |
| 14 | Admin Room CRUD | |
| 15 | Admin Customer list | |
| 16 | Admin Payment management | |
| 17 | Admin Availability calendar + block dates | |
| 18 | Admin Price overrides | |
| 19 | Admin Reports (3 tabs) | |
| 20 | Responsive (mobile hamburger, admin sidebar) | |
| 21 | Role-based access control | |
| 22 | Vietnamese UI (co dau) | |
| 23 | StatusBadge pulse animation (pending) | |
| 24 | Image placeholders (gradient + initial) | |
| 25 | Hover effects (cards) | |
