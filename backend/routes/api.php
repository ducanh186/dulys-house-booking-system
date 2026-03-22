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

    // ─── Admin / Owner / Staff ──────────────────────────
    Route::middleware(['role:admin,owner,staff', 'throttle:60,1'])->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard/summary', [AdminDashboardController::class, 'summary']);
        Route::get('/dashboard/revenue', [AdminDashboardController::class, 'revenue']);

        // Homestays CRUD
        Route::apiResource('homestays', AdminHomestayController::class);

        // Room Types CRUD
        Route::apiResource('room-types', AdminRoomTypeController::class);

        // Rooms CRUD
        Route::apiResource('rooms', AdminRoomController::class);
        Route::patch('/rooms/{room}/status', [AdminRoomController::class, 'updateStatus']);

        // Booking management
        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::get('/bookings/{booking}', [AdminBookingController::class, 'show']);
        Route::patch('/bookings/{booking}/confirm', [AdminBookingController::class, 'confirm']);
        Route::patch('/bookings/{booking}/check-in', [AdminBookingController::class, 'checkIn']);
        Route::patch('/bookings/{booking}/check-out', [AdminBookingController::class, 'checkOut']);
        Route::patch('/bookings/{booking}/cancel', [AdminBookingController::class, 'cancel']);

        // Payments
        Route::get('/payments', [AdminPaymentController::class, 'index']);
        Route::post('/payments', [AdminPaymentController::class, 'store']);

        // Customers
        Route::get('/customers', [AdminCustomerController::class, 'index']);
        Route::get('/customers/{customer}', [AdminCustomerController::class, 'show']);

        // Availability Calendar
        Route::get('/room-types/{roomType}/calendar', [AdminAvailabilityController::class, 'calendar']);
        Route::post('/room-types/{roomType}/block-dates', [AdminAvailabilityController::class, 'blockDates']);
        Route::delete('/blocked-dates/{blockedDate}', [AdminAvailabilityController::class, 'unblock']);

        // Pricing Management
        Route::get('/room-types/{roomType}/pricing', [AdminPricingController::class, 'index']);
        Route::post('/room-types/{roomType}/price-overrides', [AdminPricingController::class, 'store']);
        Route::delete('/price-overrides/{priceOverride}', [AdminPricingController::class, 'destroy']);

        // Reports
        Route::get('/reports/occupancy', [AdminReportController::class, 'occupancy']);
        Route::get('/reports/cancellations', [AdminReportController::class, 'cancellations']);
        Route::get('/reports/revenue-by-homestay', [AdminReportController::class, 'revenueByHomestay']);
        Route::get('/reports/customers', [AdminReportController::class, 'customers']);
    });
});
