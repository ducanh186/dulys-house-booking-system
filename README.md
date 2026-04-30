# Duly's House Booking System

Hệ thống quản lý đặt phòng Homestay — Full-stack web application.

**Stack**: Laravel 13 (PHP 8.3) + React 19 (Vite 8) + MySQL 8.4 + Tailwind CSS 4

## Quick Start (Docker)

Chỉ cần Docker, không cần cài PHP/Node/MySQL.

> Chọn một chế độ chạy duy nhất cho mỗi phiên làm việc: `Docker` hoặc `Local Development`.
> Nếu đang mở app bằng `docker compose`, hãy chạy toàn bộ lệnh Laravel qua `docker compose exec backend ...` thay vì `cd backend && php artisan ...`.

```bash
# 1. Clone & start
git clone <repo-url> && cd dulys-house-booking-system
docker compose up -d --build

# 2. Chạy migration + seed data (lần đầu)
docker compose exec backend php artisan migrate --seed

# 3. Truy cập
#    Frontend:  http://localhost
#    Backend:   http://localhost:8000/api
```

> **Không cần tạo file `.env`** — `docker-compose.yml` đã cấu hình sẵn toàn bộ (DB, APP_KEY, cache...).
>
> **Quan trọng:** khi chạy Docker, backend trong container dùng MySQL service `mysql` với cấu hình lấy từ `docker-compose.yml`.
> File `backend/.env` chỉ dành cho chế độ local. Nếu seed bằng lệnh host-side `php artisan` nhưng đang xem app từ Docker, dữ liệu có thể vào sai database và giao diện sẽ trông như “không có data”.

### Tài khoản mặc định (seeded)

| Email | Mật khẩu | Vai trò |
| --- | --- | --- |
| `admin@dulyshouse.vn` | password | Admin |
| `owner@dulyshouse.vn` | password | Owner |
| `staff@dulyshouse.vn` | password | Staff |
| `guest@dulyshouse.vn` | password | Guest |

### Docker commands

```bash
docker compose up -d --build     # Start (rebuild images)
docker compose down              # Stop
docker compose logs -f backend   # Xem log backend
docker compose exec backend php artisan migrate       # Chạy migration
docker compose exec backend php artisan db:seed       # Seed lại data
docker compose exec backend php artisan db:seed --class=ReviewSeeder  # Seed riêng dữ liệu review mẫu
docker compose exec backend php artisan migrate:fresh --seed  # Reset DB hoàn toàn
```

## Troubleshooting

### Seed xong nhưng giao diện vẫn không thấy data

Nguyên nhân thường gặp nhất là bạn đang trộn 2 môi trường:

- Chạy app bằng `docker compose up`
- Nhưng lại seed bằng `cd backend && php artisan ...`

Hai lệnh đó có thể đang trỏ tới 2 database khác nhau.

Khi chạy Docker, hãy dùng:

```bash
docker compose exec backend php artisan migrate --seed
docker compose exec backend php artisan db:seed --class=ReviewSeeder
```

Khi chạy local, hãy dùng:

```bash
cd backend
php artisan migrate --seed
php artisan db:seed --class=ReviewSeeder
```

Sau khi seed đúng môi trường, tải lại frontend hoặc gọi lại API báo cáo để lấy dữ liệu mới.

## Local Development (không Docker)

### Yêu cầu

- PHP 8.3+ (ext: pdo_mysql, mbstring, gd, zip, bcmath)
- Composer 2
- Node.js 22+
- MySQL 8.x

### Backend

`backend/.env` trong phần này chỉ áp dụng cho chế độ local, không áp dụng cho container Docker.

```bash
cd backend
composer install
cp .env.example .env
# Sửa .env: DB_DATABASE=dulys_house, DB_USERNAME=root, DB_PASSWORD=<your_password>
php artisan key:generate
php artisan migrate --seed
php artisan serve                # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev                      # http://localhost:5173 (proxy /api → :8000)
```

### Chạy tests

```bash
cd backend
php artisan test                       # Tất cả tests
php artisan test --filter=AuthTest     # Một test class
```

## Cấu trúc dự án

```text
├── backend/          Laravel API (Sanctum auth, REST API)
│   ├── app/
│   │   ├── Http/Controllers/Api/     Controllers (thin)
│   │   ├── Services/                 Business logic layer
│   │   ├── Models/                   Eloquent models (UUID PKs)
│   │   └── Traits/                   ApiResponse trait
│   ├── database/migrations/          21 migrations
│   ├── tests/Feature/                10 feature test files
│   └── routes/api.php               API routes
│
├── frontend/         React SPA (Vite, Tailwind)
│   ├── src/
│   │   ├── api/                      Axios client + service modules
│   │   ├── components/               UI + feature components
│   │   ├── contexts/                 AuthContext, ToastContext
│   │   ├── layouts/                  PublicLayout, AdminLayout
│   │   └── pages/                    public/ (21 pages) + admin/ (9 pages)
│   └── public/                       Static assets (logo, favicon)
│
└── docker-compose.yml               3 services: mysql, backend, frontend
```

## Tính năng chính

- **Tìm kiếm & đặt phòng** — Tìm phòng trống theo ngày, loại phòng. Đặt phòng online với mã booking.
- **Booking lifecycle** — Chờ xác nhận → Đã xác nhận → Đã nhận phòng → Đã trả phòng (hoặc Đã huỷ).
- **Admin dashboard** — Quản lý cơ sở, phòng, đặt phòng, thanh toán, khách hàng.
- **Lịch phòng & giá** — Chặn ngày, đặt giá riêng theo ngày (price override).
- **Báo cáo** — Doanh thu, công suất phòng, tỷ lệ huỷ, phân tích khách hàng.
- **Đánh giá** — Khách đánh giá sau khi checkout.
- **Thông báo** — Notification bell cho các sự kiện booking.
- **Quên mật khẩu** — OTP qua email với throttle 60s.
- **Bảo mật** — Rate limiting, pessimistic locking, role-based access control.

## Cấu hình Email (tuỳ chọn)

Mặc định email ghi vào log (`MAIL_MAILER=log`). Để gửi email thật:

### Local development

Sửa `backend/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=hello@dulyshouse.vn
```

### Docker

Tạo file `.env` ở root (cùng cấp `docker-compose.yml`):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
```

> Nếu dùng Gmail, cần tạo [App Password](https://myaccount.google.com/apppasswords) thay vì dùng mật khẩu thường.

Email được gửi tại các sự kiện: tạo booking, xác nhận, check-in, check-out, huỷ, quên mật khẩu.

## Architecture

- **API-first**: Backend là pure JSON API (`/api/*`). Frontend là React SPA.
- **UUID primary keys**: Tất cả models dùng UUID thay vì auto-increment.
- **Services layer**: Business logic tách riêng trong `app/Services/`, controllers chỉ delegate.
- **Consistent API format**: Mọi response đều có dạng `{success, message, data}`.

## License

Private — All rights reserved.
