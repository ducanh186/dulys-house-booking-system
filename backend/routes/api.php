<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\HomestayController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\Admin\AdminAvailabilityController;
use App\Http\Controllers\Api\Admin\AdminBookingController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminHomestayController;
use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\AdminPricingController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminRoomController;
use App\Http\Controllers\Api\Admin\AdminRoomTypeController;
use Illuminate\Support\Facades\Route;

// ─── Public ─────────────────────────────────────────────
Route::middleware('throttle:5,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
});

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/forgot-password/request', [AuthController::class, 'requestForgotPasswordOtp']);
    Route::post('/auth/forgot-password/resend', [AuthController::class, 'resendForgotPasswordOtp']);
});

Route::middleware('throttle:20,1')->group(function () {
    Route::post('/auth/forgot-password/verify', [AuthController::class, 'verifyForgotPasswordOtp']);
});

Route::middleware('throttle:30,1')->group(function () {
    Route::get('/homestays', [HomestayController::class, 'index']);
    Route::get('/homestays/{homestay:slug}', [HomestayController::class, 'show']);
    Route::get('/homestays/{homestay:slug}/reviews', [ReviewController::class, 'index']);
    Route::post('/search/availability', [SearchController::class, 'search']);
});

// ─── Authenticated ──────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
    });
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

    // ─── Admin / Owner / Staff (read-only for all) ─────
    Route::middleware(['role:admin,owner,staff', 'throttle:60,1'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/summary', [AdminDashboardController::class, 'summary']);
        Route::get('/dashboard/revenue', [AdminDashboardController::class, 'revenue']);

        // Read endpoints (all admin roles)
        Route::get('/homestays', [AdminHomestayController::class, 'index']);
        Route::get('/homestays/{homestay}', [AdminHomestayController::class, 'show'])->withTrashed();
        Route::get('/room-types', [AdminRoomTypeController::class, 'index']);
        Route::get('/room-types/{roomType}', [AdminRoomTypeController::class, 'show'])->withTrashed();
        Route::get('/rooms', [AdminRoomController::class, 'index']);
        Route::get('/rooms/{room}', [AdminRoomController::class, 'show'])->withTrashed();

        // Booking management (read + lifecycle actions for all)
        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::get('/bookings/{booking}', [AdminBookingController::class, 'show']);
        Route::patch('/bookings/{booking}/confirm', [AdminBookingController::class, 'confirm']);
        Route::patch('/bookings/{booking}/check-in', [AdminBookingController::class, 'checkIn']);
        Route::patch('/bookings/{booking}/check-out', [AdminBookingController::class, 'checkOut']);
        Route::patch('/bookings/{booking}/cancel', [AdminBookingController::class, 'cancel']);

        // Payments (read for all, create for all — operational)
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::post('/payments', [AdminPaymentController::class, 'store']);

        // Customers (read-only)
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{customer}', [AdminCustomerController::class, 'show']);

        // Availability Calendar (read)
        Route::get('/room-types/{roomType}/calendar', [AdminAvailabilityController::class, 'calendar']);

        // Pricing (read)
        Route::get('/room-types/{roomType}/pricing', [AdminPricingController::class, 'index']);

        // Reports
        Route::get('/reports/occupancy', [AdminReportController::class, 'occupancy']);
        Route::get('/reports/cancellations', [AdminReportController::class, 'cancellations']);
        Route::get('/reports/revenue-by-homestay', [AdminReportController::class, 'revenueByHomestay']);
        Route::get('/reports/customers', [AdminReportController::class, 'customers']);
    });

    // ─── Admin-only write operations ──────────────────────
    Route::middleware(['role:admin', 'throttle:60,1'])->prefix('admin')->group(function () {
        // Homestays CUD (create, update, delete)
        Route::post('/homestays', [AdminHomestayController::class, 'store']);
        Route::put('/homestays/{homestay}', [AdminHomestayController::class, 'update']);
        Route::delete('/homestays/{homestay}', [AdminHomestayController::class, 'destroy']);
        Route::patch('/homestays/{homestay}/restore', [AdminHomestayController::class, 'restore'])->withTrashed();

        // Room Types CUD
        Route::post('/room-types', [AdminRoomTypeController::class, 'store']);
        Route::put('/room-types/{roomType}', [AdminRoomTypeController::class, 'update']);
        Route::delete('/room-types/{roomType}', [AdminRoomTypeController::class, 'destroy']);
        Route::patch('/room-types/{roomType}/restore', [AdminRoomTypeController::class, 'restore'])->withTrashed();

        // Rooms CUD
        Route::post('/rooms', [AdminRoomController::class, 'store']);
        Route::put('/rooms/{room}', [AdminRoomController::class, 'update']);
        Route::delete('/rooms/{room}', [AdminRoomController::class, 'destroy']);
        Route::patch('/rooms/{room}/restore', [AdminRoomController::class, 'restore'])->withTrashed();
        Route::patch('/rooms/{room}/status', [AdminRoomController::class, 'updateStatus']);

        // Availability (write)
        Route::post('/room-types/{roomType}/block-dates', [AdminAvailabilityController::class, 'blockDates']);
        Route::delete('/blocked-dates/{blockedDate}', [AdminAvailabilityController::class, 'unblock']);

        // Pricing (write)
        Route::post('/room-types/{roomType}/price-overrides', [AdminPricingController::class, 'store']);
        Route::delete('/price-overrides/{priceOverride}', [AdminPricingController::class, 'destroy']);
    });
});
