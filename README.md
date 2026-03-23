# Duly's House Booking System

Hệ thống quản lý đặt phòng Homestay — giao diện tiếng Việt, quản trị đa vai trò.

**Stack**: Laravel 13 (PHP 8.3) + React 19 (Vite 8) + MySQL 8.4 + Tailwind CSS 4

---

## Mục lục

1. [Cài đặt bằng Docker (khuyên dùng)](#1-cài-đặt-bằng-docker-khuyên-dùng)
2. [Cài đặt thủ công (không Docker)](#2-cài-đặt-thủ-công-không-docker)
3. [Tài khoản test](#3-tài-khoản-test)
4. [Cách dùng](#4-cách-dùng)
5. [Các lệnh thường dùng](#5-các-lệnh-thường-dùng)
6. [Cấu trúc project](#6-cấu-trúc-project)
7. [API tổng quan](#7-api-tổng-quan)
8. [Xử lý sự cố](#8-xử-lý-sự-cố)

---

## 1. Cài đặt bằng Docker (khuyên dùng)

Cách này chỉ cần cài Docker Desktop, không cần cài PHP, Node.js, MySQL.

### Bước 1: Cài Docker Desktop

Tải và cài từ https://docs.docker.com/desktop/install/windows-install/

Sau khi cài xong, mở Docker Desktop và chờ đến khi thấy trạng thái **"Engine running"** (icon Docker ở taskbar chuyển xanh).

### Bước 2: Clone project

```powershell
git clone <repo-url> dulys-house-booking-system
cd dulys-house-booking-system
```

### Bước 3: Khởi động

**Windows (PowerShell):**

```powershell
.\start-docker.ps1
```

Script sẽ tự động:
- Kiểm tra Docker Desktop đang chạy (tự mở nếu chưa)
- Kiểm tra port 80 và 8000 có trống không
- Khởi động MySQL, Backend, Frontend
- Lần đầu: tự chạy migration + seed dữ liệu mẫu

**Hoặc chạy thủ công:**

```bash
docker compose up -d --build
```

### Bước 4: Truy cập

| Dịch vụ | URL |
|---------|-----|
| Frontend (giao diện) | http://localhost |
| Backend API | http://localhost:8000/api |

Chờ khoảng 30 giây sau lần chạy đầu tiên để backend chạy xong migration và seed data.

### Dừng hệ thống

```powershell
.\stop-docker.ps1             # Dừng (giữ data)
.\stop-docker.ps1 -Destroy    # Dừng + xóa toàn bộ data
```

### Các tùy chọn hữu ích

```powershell
# Rebuild images (sau khi sửa code)
.\start-docker.ps1 -Build

# Reset toàn bộ (xóa DB, seed lại từ đầu)
.\start-docker.ps1 -Reset -Build

# Mở port MySQL cho công cụ ngoài (DBeaver, TablePlus...)
docker compose -f docker-compose.yml -f docker-compose.db-port.yml up -d
# MySQL host: localhost:3307 | user: root | pass: secret | db: dulys_house
```

---

## 2. Cài đặt thủ công (không Docker)

### Yêu cầu

| Tool | Version | Tải về |
|------|---------|--------|
| PHP | >= 8.3 | https://www.php.net/downloads |
| Composer | >= 2.x | https://getcomposer.org/download/ |
| Node.js | >= 20.x | https://nodejs.org/ |
| MySQL | >= 8.0 | https://dev.mysql.com/downloads/ |

### Bước 1: Tạo database

Mở MySQL client (terminal hoặc GUI) và chạy:

```sql
CREATE DATABASE dulys_house CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Bước 2: Cài backend

```bash
cd backend

# Cài dependencies
composer install

# Tạo file cấu hình
cp .env.example .env

# Mở file .env, sửa thông tin database:
#   DB_DATABASE=dulys_house
#   DB_USERNAME=root
#   DB_PASSWORD=          (mật khẩu MySQL của bạn)

# Tạo key
php artisan key:generate

# Tạo bảng + dữ liệu mẫu
php artisan migrate --seed

# Chạy server
php artisan serve
# => Backend chạy tại http://localhost:8000
```

### Bước 3: Cài frontend

Mở terminal mới (giữ backend đang chạy):

```bash
cd frontend

# Cài dependencies
npm install

# Chạy dev server
npm run dev
# => Frontend chạy tại http://localhost:5173
```

### Bước 4: Truy cập

Mở trình duyệt tại **http://localhost:5173**

Vite tự proxy `/api` sang `localhost:8000`, nên không cần cấu hình CORS.

---

## 3. Tài khoản test

Sau khi seed, hệ thống có sẵn các tài khoản:

| Email | Mật khẩu | Vai trò | Quyền |
|-------|----------|---------|-------|
| admin@dulyshouse.vn | password | Admin | Full quyền quản trị |
| owner@dulyshouse.vn | password | Owner | Quản lý cơ sở |
| staff@dulyshouse.vn | password | Staff | Lễ tân, check-in/out |
| guest@dulyshouse.vn | password | Guest | Đặt phòng, xem đơn |

---

## 4. Cách dùng

### Khách hàng (Guest)

1. Vào trang chủ, chọn homestay hoặc tìm phòng trống
2. Chọn ngày nhận/trả phòng, số khách
3. Đăng nhập (hoặc đăng ký) rồi xác nhận đặt phòng
4. Xem lịch sử đặt phòng ở "Đặt phòng của tôi"

### Quản trị (Admin/Staff)

1. Đăng nhập bằng tài khoản admin/staff
2. Truy cập `/admin` — Dashboard tổng quan, biểu đồ doanh thu
3. **Đặt phòng**: Duyệt đơn (Xác nhận → Nhận phòng → Trả phòng)
4. **Lịch phòng**: Xem lịch, chặn ngày, điều chỉnh giá
5. **Báo cáo**: Doanh thu, công suất, khách hàng

---

## 5. Các lệnh thường dùng

### Backend (Laravel)

```bash
cd backend

php artisan serve                      # Chạy server dev (:8000)
php artisan migrate                    # Chạy migration mới
php artisan migrate:fresh --seed       # Reset toàn bộ DB + seed lại
php artisan db:seed                    # Chỉ seed data
php artisan route:list                 # Danh sách tất cả API routes
php artisan test                       # Chạy tests
php artisan tinker                     # REPL để thử nhanh
vendor/bin/pint                        # Format code (Laravel Pint)
```

### Frontend (React)

```bash
cd frontend

npm run dev       # Dev server + HMR (:5173)
npm run build     # Build production → dist/
npm run preview   # Preview bản build
npm run lint      # Kiểm tra code style
```

### Docker

```bash
docker compose ps                          # Trạng thái services
docker compose logs -f backend             # Xem log backend (realtime)
docker compose logs -f --tail=50           # Log tất cả (50 dòng gần nhất)
docker compose exec backend php artisan tinker   # Tinker trong container
docker compose exec backend php artisan migrate:fresh --seed  # Reset DB
```

---

## 6. Cấu trúc project

```
dulys-house-booking-system/
├── backend/                          # Laravel 13 API
│   ├── app/
│   │   ├── Http/Controllers/Api/     # API controllers
│   │   │   └── Admin/                # Admin controllers (role-gated)
│   │   ├── Models/                   # 13 Eloquent models (UUID PKs)
│   │   ├── Services/                 # Business logic layer
│   │   │   ├── BookingService        #   Tạo/hủy/check-in/out
│   │   │   ├── AvailabilityService   #   Tìm phòng trống
│   │   │   ├── PricingService        #   Tính giá theo đêm
│   │   │   └── DashboardService      #   Thống kê, báo cáo
│   │   └── Traits/ApiResponse        # JSON response format
│   ├── database/
│   │   ├── migrations/               # Schema (UUID, Vietnamese mapping)
│   │   └── seeders/                  # 12 tháng dữ liệu mẫu
│   └── routes/api.php                # Tất cả API endpoints
│
├── frontend/                         # React 19 SPA
│   └── src/
│       ├── api/                      # Axios client + API modules
│       ├── layouts/                  # PublicLayout, AdminLayout
│       ├── pages/
│       │   ├── public/               # 9 trang khách (tìm phòng, đặt phòng...)
│       │   └── admin/                # 8 trang quản trị (dashboard, báo cáo...)
│       └── components/               # UI components (shadcn-style)
│
├── docker-compose.yml                # MySQL + Backend + Frontend
├── start-docker.ps1                  # Script khởi động (Windows)
└── stop-docker.ps1                   # Script dừng (Windows)
```

---

## 7. API tổng quan

### Public (không cần đăng nhập)

```
POST   /api/auth/register                 Đăng ký
POST   /api/auth/login                    Đăng nhập → trả token
GET    /api/homestays                     Danh sách homestay
GET    /api/homestays/{slug}              Chi tiết homestay
GET    /api/homestays/{slug}/reviews      Đánh giá
POST   /api/search/availability           Tìm phòng trống
```

### Authenticated (Bearer token)

```
GET    /api/auth/me                       Thông tin user
POST   /api/bookings                      Tạo đặt phòng
GET    /api/bookings                      Đặt phòng của tôi
PATCH  /api/bookings/{id}/cancel          Hủy đặt phòng
POST   /api/reviews                       Viết đánh giá
GET    /api/notifications                 Thông báo
```

### Admin (role: admin/owner/staff)

```
GET    /api/admin/dashboard/summary       Tổng quan hệ thống
GET    /api/admin/dashboard/revenue       Doanh thu theo kỳ
CRUD   /api/admin/homestays               Quản lý cơ sở
CRUD   /api/admin/room-types              Quản lý loại phòng
CRUD   /api/admin/rooms                   Quản lý phòng
GET    /api/admin/bookings                Danh sách đặt phòng
PATCH  /api/admin/bookings/{id}/confirm   Duyệt đơn
PATCH  /api/admin/bookings/{id}/check-in  Check-in
PATCH  /api/admin/bookings/{id}/check-out Check-out
PATCH  /api/admin/bookings/{id}/cancel    Hủy đơn
GET    /api/admin/customers               Danh sách khách
POST   /api/admin/payments                Ghi nhận thanh toán
GET    /api/admin/reports/*               Báo cáo (doanh thu, công suất, khách hàng)
```

### Test nhanh API (curl)

```bash
# Đăng nhập
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dulyshouse.vn","password":"password"}'

# Lấy token từ response, dùng cho các request tiếp theo:
curl -s http://localhost:8000/api/admin/dashboard/summary \
  -H "Authorization: Bearer <token>" \
  -H "Accept: application/json"
```

---

## 8. Xử lý sự cố

### Docker

| Lỗi | Cách sửa |
|-----|----------|
| Docker Desktop không chạy | Mở Docker Desktop, chờ "Engine running", chạy lại script |
| Port 80 bận | Tắt IIS/nginx/Apache hoặc app khác. Kiểm tra: `netstat -ano \| findstr :80` |
| Port 8000 bận | Tắt backend local hoặc app khác dùng port này |
| Backend báo lỗi DB | Chờ 30s để MySQL sẵn sàng, hoặc xem log: `docker compose logs backend` |
| Muốn reset toàn bộ | `.\start-docker.ps1 -Reset -Build` |

### Local development

| Lỗi | Cách sửa |
|-----|----------|
| `Unknown database 'dulys_house'` | Chưa tạo DB: `CREATE DATABASE dulys_house;` |
| `Data truncated for column 'tokenable_id'` | Migration Sanctum phải dùng `uuidMorphs('tokenable')` |
| Frontend không gọi được API | Backend phải chạy ở port 8000. Dùng `npm run dev` (không phải `npm run preview`) |
| `CSRF token mismatch` | Thêm header `Accept: application/json` vào request |
| Muốn reset DB | `cd backend && php artisan migrate:fresh --seed` |
