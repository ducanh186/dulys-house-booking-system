# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

Duly's House Booking System — a full-stack Homestay booking management platform. Vietnamese-language UI (có dấu) with English codebase.

**Stack**: Laravel 13 (PHP 8.3+) backend API + React 19 (Vite 8) frontend + MySQL + Tailwind CSS 4.

## Monorepo Structure

```text
backend/    — Laravel API (Sanctum auth, REST API, MySQL)
frontend/   — React SPA (Vite, Tailwind, react-router-dom)
```

The repository also includes additional local guidance files such as `CLAUDE.md` in key folders.

## Quick Start

```bash
# Backend
cd backend
composer install
cp .env.example .env   # then set DB_DATABASE=dulys_house
php artisan key:generate
php artisan migrate --seed
php artisan serve        # http://localhost:8000

# Frontend
cd frontend
npm install
npm run dev              # http://localhost:5173 (proxies /api → :8000)
```

## Docker

```bash
docker compose up -d --build   # starts mysql, backend, frontend (--build to rebuild images)
docker compose exec backend php artisan migrate --seed   # first run
```

## Architecture

- **API-first**: Backend is a pure JSON API (`/api/*`). No Blade views serve the frontend.
- **UUID primary keys** everywhere — all models use `HasUuids` trait.
- **Role-based access**: Users have `role` enum (guest, staff, owner, admin). Middleware `CheckRole` gates admin routes.
- **Booking lifecycle**: `pending → confirmed → checked_in → checked_out` (or `cancelled` from pending/confirmed).
- **Room assignment**: Guests book by room_type. Physical rooms are assigned at check-in by staff.
- **Services layer**: Business logic lives in `app/Services/`, controllers are thin. Key services: BookingService, AvailabilityService, PricingService.
- **ApiResponse trait**: All controllers use `App\Traits\ApiResponse` for consistent JSON format `{success, message, data}`.

## Frontend Architecture

- **Auth**: `AuthContext` + `useAuth()` hook + `ProtectedRoute` component. Token stored in `localStorage`.
- **API layer**: `src/api/` — `client.js` (Axios, auto Bearer token), `auth.js`, `homestays.js`, `bookings.js`, `profile.js`, `admin.js`, `reviews.js`, `notifications.js`.
- **Layouts**: `PublicLayout` (guest nav, auth-aware, responsive hamburger), `AdminLayout` (sidebar, role-gated, notification bell).
- **Pages**: `src/pages/public/` (9 pages), `src/pages/admin/` (8 pages). All fully implemented with API integration.
- **Common components**: `src/components/common/` — LoadingSpinner, Pagination, StatusBadge, PriceDisplay, ConfirmDialog.
- **Feature components**: `src/components/` — ReviewSection, ReviewFormModal, NotificationBell.
- **UI components**: `src/components/ui/` — Button, Card, Input, Badge (shadcn-style).
- **Contexts**: `AuthContext` (auth state), `ToastContext` (toast notifications).
- **Design**: MD3 theme tokens in `index.css`. Fonts: Be Vietnam Pro (body) + Space Grotesk (headlines).
- **Logo**: `public/logo.png` — used in PublicLayout header and AdminLayout sidebar.
- **Reference designs**: `frontend/_screens/` (gitignored) — homepage and homestaybooking reference apps.

### Frontend Routes

Public (PublicLayout): `/`, `/search`, `/homestays/:id`, `/booking` (auth), `/booking/success` (auth), `/login`, `/register`, `/my-bookings` (auth), `/notifications` (auth)
Admin (AdminLayout, role-gated): `/admin`, `/admin/bookings`, `/admin/homestays`, `/admin/rooms`, `/admin/customers`, `/admin/payments`, `/admin/availability`, `/admin/reports`

## Key Business Rules

- Availability: A room is unavailable if any non-cancelled booking overlaps the date range, or if the room type is blocked (BlockedDate).
- Pricing: Per-night calculation with date-specific overrides (PriceOverride). Falls back to `nightly_rate` if no override exists. Sum of each night's effective price × quantity.
- Booking code format: `BK` + 6 random uppercase chars.
- Walk-in customers can have `user_id = null` in customers table.
- Concurrent booking protection: Pessimistic locking (`lockForUpdate()`) in BookingService.
- Reviews: Guests can review after checkout (1 review per booking). Shows on homestay detail page.
- Notifications: Database-based (custom Notification model). Created at booking lifecycle events. Bell icon in layouts with unread count.
- Rate limiting: Auth 5/min, booking creation 10/min, search 30/min, admin 60/min.

## UI Language

- All UI text is in **Vietnamese with diacritics** (có dấu). Never use Vietnamese without dấu.
- Currency format: `500.000₫` — use `PriceDisplay` component.
- Status labels: Chờ xác nhận, Đã xác nhận, Đã nhận phòng, Đã trả phòng, Đã huỷ.

## Test Accounts (seeded)

| Email | Password | Role |
| --- | --- | --- |
| `admin@dulyshouse.vn` | password | admin |
| `owner@dulyshouse.vn` | password | owner |
| `staff@dulyshouse.vn` | password | staff |
| `guest@dulyshouse.vn` | password | guest |

## DB Schema Mapping

Original SQL uses Vietnamese names. Laravel uses English:

| Vietnamese (SQL) | Laravel Table | Model |
| --- | --- | --- |
| nguoi_dung | users | User |
| nhan_vien | staff | Staff |
| khach_hang | customers | Customer |
| co_so | homestays | Homestay |
| loai_phong | room_types | RoomType |
| phong | rooms | Room |
| dat_phong | bookings | Booking |
| chi_tiet_dat_phong | booking_details | BookingDetail |
| thanh_toan | payments | Payment |
| — | reviews | Review |
| — | blocked_dates | BlockedDate |
| — | price_overrides | PriceOverride |
| — | notifications | Notification |
