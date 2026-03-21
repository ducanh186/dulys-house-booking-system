# Duly's House Booking System

Hệ thống quản lý đặt phòng Homestay.

**Stack**: Laravel 13 + React 19 + MySQL + Tailwind CSS 4

---

## Yêu cầu hệ thống

| Tool | Version |
|------|---------|
| PHP | >= 8.3 |
| Composer | >= 2.x |
| Node.js | >= 20.x |
| MySQL | >= 8.0 |
| npm | >= 10.x |

Hoặc chỉ cần **Docker Desktop** nếu chạy bằng Docker.

---

## Cách 1: Chạy local (không Docker)

### Bước 1 — Tạo database MySQL

```sql
CREATE DATABASE dulys_house CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Hoặc dùng command line:
```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS dulys_house CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Bước 2 — Setup Backend

```bash
cd backend

# Cài dependencies
composer install

# Tạo file .env từ template
cp .env.example .env

# Generate app key
php artisan key:generate
```

Mở file `backend/.env` và chỉnh DB nếu cần:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dulys_house
DB_USERNAME=root
DB_PASSWORD=          # điền password MySQL của bạn nếu có
```

Chạy migration và seed data mẫu:
```bash
php artisan migrate --seed
```

Khởi động server:
```bash
php artisan serve
# => http://localhost:8000
```

### Bước 3 — Setup Frontend

Mở terminal mới:
```bash
cd frontend

# Cài dependencies
npm install

# Khởi động dev server
npm run dev
# => http://localhost:5173
```

Frontend tự proxy `/api` sang `localhost:8000`, không cần cấu hình CORS.

### Bước 4 — Truy cập

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin panel**: http://localhost:5173/admin

---

## Cách 2: Chạy bằng Docker

### Windows (1 lệnh, đơn giản cho non-tech)

Chạy từ thư mục gốc project:

```powershell
.\start-docker.ps1
```

Script sẽ tự:

- kiểm tra Docker Desktop daemon (và tự mở Docker Desktop nếu cần)
- kiểm tra port 80 và 8000 trước khi chạy
- chạy `docker compose up -d`

Dừng hệ thống:

```powershell
.\stop-docker.ps1
```

### Cách chạy thủ công (nếu không dùng script)

```bash
# Khởi động tất cả services
docker compose up -d

# Chạy migration + seed (lần đầu)
docker compose exec backend php artisan migrate --seed

# Truy cập
# Frontend:  http://localhost
# API:       http://localhost:8000/api
```

MySQL **không mở cổng ra máy host** theo mặc định để tránh xung đột với MySQL local (ổn định hơn cho người non-tech).

`storage` của Laravel hiện dùng **Docker named volume** thay vì bind mount để chạy nhanh và ổn định hơn trên Windows/Docker Desktop. Nếu cần xóa sạch file lưu trữ cùng database, dùng `docker compose down -v`.

Nếu cần truy cập MySQL từ host (ví dụ DBeaver, TablePlus), dùng file override:

```bash
docker compose -f docker-compose.yml -f docker-compose.db-port.yml up -d
# MySQL host port: 3307
```

Dừng:

```bash
docker compose down

# Xóa cả data MySQL + storage Docker volume:
docker compose down -v
```

### Checklist xử lý nhanh sự cố (Docker)

- Docker Desktop không chạy:
  mở Docker Desktop và chờ trạng thái `Engine running`, sau đó chạy lại `.\start-docker.ps1`.
- Port 80 đang bận:
  dừng web server khác (IIS, nginx, Apache, app khác). Kiểm tra nhanh: `netstat -ano | findstr :80`.
- Port 8000 đang bận:
  dừng backend/app khác dùng port này. Kiểm tra nhanh: `netstat -ano | findstr :8000`.
- Cần mở cổng DB cho tool ngoài (DBeaver/TablePlus):
  chạy `docker compose -f docker-compose.yml -f docker-compose.db-port.yml up -d` (MySQL host port `3307`).
- Kiểm tra trạng thái/log nhanh:
  `docker compose ps`
  `docker compose logs -f --tail=100 backend frontend mysql`

---

## Tài khoản test (đã seed)

| Email | Password | Vai trò | Truy cập |
|-------|----------|---------|----------|
| admin@dulyshouse.vn | password | Admin | Full quyền |
| owner@dulyshouse.vn | password | Owner | Quản lý cơ sở |
| staff@dulyshouse.vn | password | Staff | Lễ tân, check-in/out |
| guest@dulyshouse.vn | password | Guest | Đặt phòng |

---

## Các lệnh thường dùng

### Backend

```bash
cd backend

php artisan serve                      # Chạy server dev
php artisan migrate                    # Chạy migration mới
php artisan migrate:fresh --seed       # Reset toàn bộ DB + seed lại
php artisan db:seed                    # Chỉ seed data
php artisan route:list                 # Xem danh sách API routes
php artisan test                       # Chạy test
php artisan test --filter=BookingTest  # Chạy 1 test cụ thể
php artisan tinker                     # REPL để test nhanh
vendor/bin/pint                        # Format code (Laravel Pint)
```

### Frontend

```bash
cd frontend

npm run dev       # Dev server (HMR)
npm run build     # Build production
npm run preview   # Preview bản build
npm run lint      # Kiểm tra code style
```

---

## Cấu trúc project

```
dulys-house-booking-system/
├── backend/                    # Laravel 13 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/       # Public API controllers
│   │   │   │   └── Admin/             # Admin API controllers
│   │   │   ├── Middleware/            # CheckRole middleware
│   │   │   └── Requests/             # Form validation
│   │   ├── Models/                    # Eloquent models (UUID)
│   │   ├── Services/                  # Business logic
│   │   │   ├── AvailabilityService    # Tìm phòng trống
│   │   │   ├── BookingService         # Tạo/hủy/check-in/out
│   │   │   ├── PricingService         # Tính giá
│   │   │   ├── PaymentService         # Thanh toán
│   │   │   ├── RoomStatusService      # Trạng thái phòng
│   │   │   └── DashboardService       # Báo cáo
│   │   └── Traits/                    # ApiResponse trait
│   ├── database/
│   │   ├── migrations/                # 12 migration files
│   │   └── seeders/                   # Data mẫu tiếng Việt
│   └── routes/api.php                 # 46 API endpoints
│
├── frontend/                   # React 19 + Vite + Tailwind
│   └── src/
│       ├── api/client.js              # Axios instance
│       ├── layouts/                   # PublicLayout, AdminLayout
│       ├── pages/public/              # 8 trang public
│       ├── pages/admin/               # 6 trang admin
│       └── components/                # Shared components
│
├── docker-compose.yml          # MySQL + Backend + Frontend
├── CLAUDE.md                   # Context cho AI assistant
└── Plan.md                     # Kế hoạch chi tiết dự án
```

---

## API Overview

### Public (không cần đăng nhập)
```
POST   /api/auth/register          Đăng ký
POST   /api/auth/login             Đăng nhập
GET    /api/homestays              Danh sách homestay
GET    /api/homestays/{id}         Chi tiết homestay
POST   /api/search/availability    Tìm phòng trống
```

### Authenticated (cần Bearer token)
```
GET    /api/auth/me                Thông tin user
POST   /api/bookings              Tạo đặt phòng
GET    /api/bookings              Đặt phòng của tôi
PATCH  /api/bookings/{id}/cancel  Hủy đặt phòng
```

### Admin (cần role: admin/owner/staff)
```
GET    /api/admin/dashboard/summary     Tổng quan
GET    /api/admin/bookings              Danh sách đặt phòng
PATCH  /api/admin/bookings/{id}/confirm Duyệt đơn
PATCH  /api/admin/bookings/{id}/check-in   Check-in
PATCH  /api/admin/bookings/{id}/check-out  Check-out
CRUD   /api/admin/homestays             Quản lý cơ sở
CRUD   /api/admin/room-types            Quản lý loại phòng
CRUD   /api/admin/rooms                 Quản lý phòng
GET    /api/admin/customers             Danh sách khách
POST   /api/admin/payments              Ghi nhận thanh toán
```

---

## Test nhanh API bằng curl

```bash
# Đăng nhập
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"guest@dulyshouse.vn","password":"password"}'

# Copy token từ response, sau đó:

# Tìm phòng
curl -s -X POST http://localhost:8000/api/search/availability \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"check_in":"2026-04-10","check_out":"2026-04-12","guests":2}'

# Xem homestay
curl -s http://localhost:8000/api/homestays \
  -H "Accept: application/json"
```

---

## Troubleshooting

**"SQLSTATE[HY000] [1049] Unknown database 'dulys_house'"**
→ Chưa tạo database. Chạy: `mysql -u root -e "CREATE DATABASE dulys_house;"`

**"Data truncated for column 'tokenable_id'"**
→ Sanctum migration dùng sai type. Kiểm tra file migration `create_personal_access_tokens` phải dùng `uuidMorphs('tokenable')` thay vì `morphs('tokenable')`.

**Frontend không gọi được API**
→ Đảm bảo backend đang chạy trên port 8000. Vite proxy chỉ hoạt động khi dùng `npm run dev`.

**"CSRF token mismatch"**
→ Thêm header `Accept: application/json` vào request. Laravel sẽ trả JSON thay vì redirect.
