# Plan tổng thể cho website **quản lý đặt phòng Homestay**

**Stack**

* **Database**: MySQL
* **Backend**: PHP Laravel
* **Frontend**: React + Vite + Tailwind CSS

Tôi sẽ lên theo hướng **triển khai được thật**, tách rõ:

1. **Scope hệ thống**
2. **UI proposal**
3. **Backend modules**
4. **API proposal**
5. **Database direction**
6. **Plan FE / BE làm song song**
7. **Roadmap end-to-end**
8. **Trade-off để tự đánh giá**

---

# 1) Nhìn tổng thể: hệ thống này thực sự cần gì?

## Mục tiêu business

Hệ thống này không chỉ là “website đặt phòng”, mà là một **Booking Management System** cho Homestay, gồm 2 mặt:

### A. Public side

Dành cho khách:

* xem danh sách homestay/phòng
* tìm phòng theo ngày
* xem giá, tiện nghi, ảnh
* đặt phòng
* thanh toán
* nhận xác nhận booking
* quản lý booking của mình

### B. Management side

Dành cho chủ homestay / staff / admin:

* quản lý homestay
* quản lý phòng
* quản lý lịch trống
* quản lý booking
* quản lý check-in / check-out
* quản lý giá
* quản lý khách hàng
* theo dõi doanh thu / occupancy

---

# 2) Scope chức năng nên có

## 2.1. MVP scope

Đây là phần nên làm trước để có **end-to-end flow chạy hoàn chỉnh**.

### Public

* Đăng ký / đăng nhập
* Tìm kiếm homestay theo:

  * location
  * check-in date
  * check-out date
  * số khách
* Danh sách homestay/phòng còn trống
* Xem chi tiết homestay/phòng
* Tạo booking
* Thanh toán cơ bản
* Booking success page
* Xem lịch sử booking
* Hủy booking theo policy

### Admin / Owner

* Dashboard tổng quan
* CRUD homestay
* CRUD room type / room
* Upload ảnh
* Thiết lập giá cơ bản
* Xem danh sách booking
* Xác nhận / từ chối booking
* Check-in / check-out
* Quản lý trạng thái phòng:

  * available
  * occupied
  * cleaning
  * maintenance

---

## 2.2. V1 scope

Sau MVP, mở rộng thêm:

* coupon / discount
* review / rating
* multi-image gallery
* seasonal pricing
* room availability calendar
* refund flow
* email notification
* analytics / reports
* role-based access control đầy đủ
* audit log

---

# 3) Thuật ngữ mới quan trọng trong bài toán này

## Booking Lifecycle

Đây là vòng đời của một booking.

Một booking thường đi qua các trạng thái:

* `pending`
* `confirmed`
* `checked_in`
* `checked_out`
* `cancelled`
* `refunded`

## Availability

Là khả năng còn phòng để bán trong một khoảng ngày.

## Rate Plan

Là cách định giá:

* giá thường
* giá cuối tuần
* giá lễ
* giá theo mùa

## Inventory Calendar

Là lịch số lượng phòng còn bán theo từng ngày.

---

# 4) Cách hệ thống hoạt động (logic / data flow)

## 4.1. Flow khách đặt phòng

1. User chọn:

   * location
   * check-in
   * check-out
   * guests
2. FE gọi API search availability
3. BE kiểm tra:

   * phòng nào phù hợp sức chứa
   * còn trống trong date range không
   * giá từng ngày
4. FE hiển thị kết quả
5. User vào room detail
6. User bấm book
7. FE gửi booking request
8. BE:

   * validate dữ liệu
   * lock inventory logic
   * tính total price
   * tạo booking
   * tạo payment record
9. Thanh toán thành công
10. BE cập nhật booking thành `confirmed`
11. FE hiển thị booking success
12. User xem booking trong dashboard

---

## 4.2. Flow quản lý vận hành

1. Owner vào dashboard
2. Xem booking mới
3. Xác nhận booking
4. Đến ngày khách tới:

   * check-in
   * phòng chuyển `occupied`
5. Khi khách rời đi:

   * check-out
   * phòng chuyển `cleaning`
6. Sau khi dọn xong:

   * phòng chuyển `available`

---

# 5) Đề xuất UI của dự án

Vì ở lượt này tôi chưa thấy lại các ảnh bạn nhắc, tôi sẽ đề xuất UI theo cấu trúc chuẩn cho **Homestay Booking Website + Management Dashboard**.

## 5.1. Public pages

### 1. Landing / Home page

**Sections**

* Hero banner + search bar lớn
* Featured homestays
* Popular destinations
* Benefits / amenities
* Testimonials
* Footer

**Main UI**

* Search bar:

  * Location
  * Check-in
  * Check-out
  * Guests
  * Search button

---

### 2. Search Result page

**Layout**

* Left: filter panel
* Right: homestay cards / room cards

**Filters**

* price range
* number of guests
* amenities
* room type
* rating
* availability

**Card**

* ảnh đại diện
* tên homestay
* địa chỉ ngắn
* rating
* amenities ngắn
* giá / đêm
* badge “Available”

---

### 3. Homestay Detail page

**Sections**

* image gallery
* overview
* amenities
* room list
* map / address
* policy
* reviews

**Sticky booking panel**

* date picker
* guests
* price summary
* book now

---

### 4. Checkout / Booking page

**Blocks**

* customer info
* guest info
* special request
* booking summary
* payment method
* confirm button

---

### 5. Booking Success page

* booking code
* status
* summary
* button xem booking
* button quay lại home

---

### 6. User Dashboard

**Tabs**

* My Bookings
* Profile
* Saved homestays
* Payment history

---

## 5.2. Management UI

### 1. Owner Dashboard

**Cards**

* total bookings
* revenue
* occupancy rate
* available rooms
* pending bookings

**Charts**

* bookings by day/week
* revenue by month

---

### 2. Booking Management page

**Table columns**

* booking code
* guest name
* homestay
* room
* check-in
* check-out
* total
* status
* actions

**Actions**

* confirm
* cancel
* check-in
* check-out
* view detail

---

### 3. Room Management page

**Views**

* table view
* calendar view

**Fields**

* room name / code
* type
* capacity
* price
* status
* action edit/delete

---

### 4. Homestay Management page

* general info
* address
* images
* amenities
* policies
* rooms attached

---

### 5. Pricing / Availability page

* calendar theo ngày
* set price theo ngày / range
* block room / unblock room
* special event price

---

### 6. Customer Management page

* guest list
* booking count
* total spent
* contact info

---

# 6) Đề xuất kiến trúc Backend Laravel

## 6.1. Module chính

Tách theo domain để dễ scale:

* **Auth Module**
* **User Module**
* **Homestay Module**
* **Room Module**
* **Availability Module**
* **Pricing Module**
* **Booking Module**
* **Payment Module**
* **Review Module**
* **Notification Module**
* **Report Module**
* **Admin Module**

---

## 6.2. Laravel structure nên theo

* Controllers: mỏng
* Services: business logic chính
* Repositories / Query layer: data access phức tạp
* Form Request: validation
* Policies / Gates: authorization
* Events / Listeners: notification, email, audit
* Jobs / Queues: gửi mail, xử lý async

---

## 6.3. Core services quan trọng

* `AvailabilityService`
* `PricingService`
* `BookingService`
* `PaymentService`
* `RoomStatusService`

Đây là phần quan trọng nhất vì booking system thường lỗi ở:

* tính available sai
* race condition khi 2 người đặt cùng lúc
* total price sai theo date range
* room status không sync với booking status

---

# 7) Đề xuất Database direction (MySQL)

Bạn chưa gửi DB schema thực tế trong lượt này, nên tôi đề xuất **logical schema** để plan bám theo.

## 7.1. Core tables

### User / Role

* `users`
* `roles`
* `user_roles`

### Homestay

* `homestays`
* `homestay_images`
* `amenities`
* `homestay_amenity`

### Room

* `room_types`
* `rooms`
* `room_images`
* `room_amenity`

### Availability / Pricing

* `room_calendars`
* `rate_plans`
* `seasonal_prices`
* `blocked_dates`

### Booking

* `bookings`
* `booking_items`
* `guests`
* `booking_guests`

### Payment

* `payments`
* `refunds`

### Review

* `reviews`

### Ops / Audit

* `notifications`
* `audit_logs`

---

## 7.2. Các field quan trọng

### `bookings`

* id
* booking_code
* user_id
* homestay_id
* check_in_date
* check_out_date
* guest_count
* subtotal
* tax
* discount
* total_amount
* payment_status
* booking_status
* special_request
* created_at

### `rooms`

* id
* homestay_id
* room_type_id
* room_code
* room_name
* max_guests
* base_price
* status

### `room_calendars`

* id
* room_id
* date
* is_available
* custom_price
* inventory_status

---

# 8) Đề xuất API cho Backend

Tôi đề xuất REST API theo nhóm rõ ràng.

## 8.1. Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/logout`
* `GET /api/auth/me`

---

## 8.2. Public search / listing

* `GET /api/homestays`
* `GET /api/homestays/{id}`
* `GET /api/homestays/{id}/rooms`
* `GET /api/rooms/{id}`
* `POST /api/search/availability`

### Example request

```json
{
  "location": "Da Nang",
  "check_in": "2026-04-10",
  "check_out": "2026-04-12",
  "guests": 2
}
```

---

## 8.3. Booking

* `POST /api/bookings`
* `GET /api/bookings`
* `GET /api/bookings/{id}`
* `PATCH /api/bookings/{id}/cancel`
* `PATCH /api/bookings/{id}/confirm`
* `PATCH /api/bookings/{id}/check-in`
* `PATCH /api/bookings/{id}/check-out`

---

## 8.4. Payment

* `POST /api/payments/create`
* `POST /api/payments/callback`
* `GET /api/payments/{bookingId}`

---

## 8.5. Review

* `POST /api/reviews`
* `GET /api/homestays/{id}/reviews`

---

## 8.6. User profile

* `GET /api/profile`
* `PATCH /api/profile`
* `GET /api/profile/bookings`

---

## 8.7. Admin / Owner: Homestay management

* `GET /api/admin/homestays`
* `POST /api/admin/homestays`
* `GET /api/admin/homestays/{id}`
* `PUT /api/admin/homestays/{id}`
* `DELETE /api/admin/homestays/{id}`

---

## 8.8. Admin / Owner: Room management

* `GET /api/admin/rooms`
* `POST /api/admin/rooms`
* `GET /api/admin/rooms/{id}`
* `PUT /api/admin/rooms/{id}`
* `DELETE /api/admin/rooms/{id}`

---

## 8.9. Admin / Owner: Calendar / pricing

* `GET /api/admin/rooms/{id}/calendar`
* `PUT /api/admin/rooms/{id}/calendar`
* `PUT /api/admin/rooms/{id}/pricing`
* `POST /api/admin/rooms/{id}/block-dates`

---

## 8.10. Admin / Owner: Booking management

* `GET /api/admin/bookings`
* `GET /api/admin/bookings/{id}`
* `PATCH /api/admin/bookings/{id}/status`
* `PATCH /api/admin/bookings/{id}/assign-room`

---

## 8.11. Reports

* `GET /api/admin/reports/dashboard`
* `GET /api/admin/reports/revenue`
* `GET /api/admin/reports/occupancy`

---

# 9) Split plan riêng cho FE và BE, làm song song

## Nguyên tắc làm song song

BE không nên chờ FE làm xong mới bắt đầu.
FE cũng không nên chờ API thật mới code.

Cách làm đúng:

* chốt **API contract**
* chốt **data model**
* FE dùng **mock data / mock API**
* BE build API song song
* cuối mỗi phase tích hợp

---

## Phase 0 — Foundation

### Backend

* setup Laravel project
* setup auth
* setup migration base
* setup role/permission
* setup folder/module structure
* setup API response format
* setup exception handler
* setup seed dữ liệu mẫu

### Frontend

* setup React + Vite + Tailwind
* setup router
* setup layout public/admin
* setup state management
* setup API client
* setup auth guard
* setup design system:

  * buttons
  * inputs
  * cards
  * modal
  * table
  * badge
  * toast

**Output**

* skeleton chạy được
* login flow mock
* API convention thống nhất

---

## Phase 1 — Public booking flow

### Backend

* homestay listing API
* homestay detail API
* room detail API
* availability search API
* booking create API
* booking list/detail API

### Frontend

* home page
* search bar
* result page
* homestay detail page
* room detail page
* booking form page
* booking summary component

**Dependency**

* API contract search + booking phải chốt sớm nhất

**Output**

* user tìm phòng và tạo booking được

---

## Phase 2 — Payment + booking lifecycle

### Backend

* payment create
* payment callback/webhook
* booking confirm logic
* cancel logic
* status transition rules

### Frontend

* checkout page
* payment result page
* booking success page
* my bookings page
* cancel booking action

**Output**

* end-to-end booking hoàn chỉnh

---

## Phase 3 — Owner management dashboard

### Backend

* admin auth/permission
* homestay CRUD
* room CRUD
* booking management APIs
* dashboard summary API

### Frontend

* admin dashboard
* homestay CRUD pages
* room CRUD pages
* booking management table
* detail drawer / modal

**Output**

* owner quản lý vận hành được

---

## Phase 4 — Availability + pricing management

### Backend

* room calendar API
* block date API
* price update API
* seasonal pricing logic

### Frontend

* room availability calendar
* set price UI
* block/unblock dates UI
* status legend

**Output**

* quản lý lịch bán phòng thực tế

---

## Phase 5 — Reports + quality

### Backend

* revenue report
* occupancy report
* audit log
* notification/email
* policy hardening
* validation hardening
* test coverage

### Frontend

* dashboard charts
* report filters
* loading/error/empty states
* responsive optimization
* role-based menu rendering

**Output**

* bản V1 đủ dùng thực tế

---

# 10) Roadmap end-to-end chi tiết

## Giai đoạn 1 — Analysis & contract

### Mục tiêu

Chốt logic trước khi code mạnh tay.

### Việc cần làm

* chốt actor:

  * guest
  * owner
  * admin
* chốt booking lifecycle
* chốt room status lifecycle
* chốt API contract
* chốt schema mapping
* chốt wireframe sơ bộ

---

## Giai đoạn 2 — Base system

### FE

* layout
* components
* routes
* auth UI

### BE

* migrations
* auth
* RBAC
* response format
* seeders

---

## Giai đoạn 3 — Search & booking

### FE

* search UI
* result list
* detail page
* booking page

### BE

* availability engine
* pricing engine
* booking engine

---

## Giai đoạn 4 — Payment & confirmation

### FE

* checkout
* payment return
* booking success

### BE

* payment records
* callback handling
* booking confirmation

---

## Giai đoạn 5 — Management dashboard

### FE

* admin dashboard
* booking table
* room forms
* homestay forms

### BE

* CRUD modules
* report summary
* status transition APIs

---

## Giai đoạn 6 — Calendar & pricing

### FE

* calendar UI
* set price modal
* block room modal

### BE

* date-based availability
* custom pricing
* block date logic

---

## Giai đoạn 7 — Hardening

### FE

* UX polishing
* validation message
* accessibility
* mobile responsive

### BE

* testing
* caching
* transaction handling
* concurrency handling
* logging
* audit

---

# 11) Mốc bàn giao hợp lý

## MVP bàn giao được khi có:

* user đăng ký / đăng nhập được
* tìm phòng theo ngày được
* xem chi tiết homestay/phòng được
* tạo booking được
* thanh toán được
* booking confirmed được
* owner xem booking được
* owner CRUD phòng được
* owner check-in/check-out được

## V1 bàn giao được khi có thêm:

* calendar availability
* seasonal pricing
* report dashboard
* review
* notification
* refund/cancel policy hoàn chỉnh

---

# 12) Trade-off quan trọng

## 1. Physical room vs Room type

### Hướng A: book theo **physical room**

* chính xác hơn
* check-in/check-out dễ
* logic phức tạp hơn

### Hướng B: book theo **room type**

* dễ triển khai hơn
* phù hợp MVP
* khi vận hành thật dễ thiếu linh hoạt

**Khuyến nghị**
MVP có thể vẫn lưu `rooms` thật, nhưng search và pricing tập trung theo `room type`.

---

## 2. Dynamic pricing

### Có ngay từ đầu

* thực tế hơn
* code pricing phức tạp

### Chỉ base price trước

* nhanh ra MVP
* sau này phải refactor

**Khuyến nghị**
MVP: `base_price + weekend override`
V1: seasonal pricing / special date pricing

---

## 3. Payment integration

### Tích hợp gateway thật sớm

* end-to-end thật
* phụ thuộc bên thứ ba

### Mock payment trước

* phát triển nhanh
* chưa phản ánh flow production

**Khuyến nghị**
Phase đầu dùng mock + payment status simulation, sau đó mới cắm gateway thật.

---

## 4. Realtime availability

### Realtime đầy đủ

* user experience tốt
* khó, tốn effort

### Refresh/polling

* đủ dùng cho MVP
* đơn giản hơn

**Khuyến nghị**
MVP dùng API fetch bình thường, chưa cần websocket.

---

# 13) Plan phân công FE / BE cực rõ để chạy song song

## Backend stream

### Stream 1 — Core platform

* auth
* RBAC
* common response
* logging
* seed

### Stream 2 — Booking domain

* homestay
* room
* availability
* pricing
* booking
* payment

### Stream 3 — Management

* admin dashboard
* reports
* room status
* audit

---

## Frontend stream

### Stream 1 — Public app

* home
* search
* detail
* checkout
* user dashboard

### Stream 2 — Admin app

* dashboard
* booking management
* room management
* homestay management
* pricing calendar

### Stream 3 — Shared UI system

* layout
* form controls
* table
* modal
* badge
* loading/empty/error states

---

# 14) Cách chốt API contract để FE không bị chờ BE

Tài liệu contract nên chốt theo từng màn:

## Ví dụ màn Search Result

### FE cần

* list item fields
* pagination
* filter options
* sort options

### BE phải trả

```json
{
  "data": [
    {
      "id": 1,
      "name": "Sea View Homestay",
      "thumbnail": "url",
      "location": "Da Nang",
      "min_price": 800000,
      "rating": 4.7,
      "available": true
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 120
  }
}
```

Nếu chốt kiểu này sớm, FE làm mock được ngay.

---

# 15) Kế hoạch thực thi thực tế đề xuất

## Sprint 1

* setup project
* auth
* public listing/search
* UI skeleton

## Sprint 2

* room detail
* booking create
* my bookings
* admin booking list

## Sprint 3

* payment
* booking lifecycle
* room CRUD
* homestay CRUD

## Sprint 4

* calendar
* pricing
* check-in/check-out
* dashboard summary

## Sprint 5

* reports
* reviews
* notifications
* hardening/test

---

# 16) Kết luận chốt

Nếu mục tiêu là **ra sản phẩm end-to-end dùng được**, thứ tự đúng là:

1. **Auth + roles**
2. **Homestay / room data model**
3. **Availability + pricing**
4. **Booking engine**
5. **Payment**
6. **Owner dashboard**
7. **Calendar / reports / hardening**

Điểm sống còn của hệ thống này không phải giao diện đẹp, mà là:

* tính đúng availability
* không double-booking
* booking lifecycle rõ ràng
* room status sync với vận hành

---

# 17) Bản chốt ngắn gọn để bắt đầu ngay

## FE làm trước

* layout public/admin
* home page
* search page
* detail page
* booking page
* admin dashboard skeleton
* booking table UI
* room CRUD UI bằng mock data

## BE làm trước

* auth
* roles
* homestays
* rooms
* search availability
* bookings
* payments mock
* booking status transitions

## Điểm tích hợp đầu tiên

* search API
* detail API
* create booking API
* my bookings API
* admin bookings API

---

Nếu bạn gửi tiếp **DB schema** hoặc upload lại **ảnh use case / class / sequence / UI sketch**, tôi sẽ map tiếp thành bản sau ở mức sâu hơn:

* **module-by-module**
* **table-by-table**
* **API request/response chi tiết**
* **task breakdown theo ngày cho FE và BE**
