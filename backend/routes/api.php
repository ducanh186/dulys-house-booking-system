<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\HomestayController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\Admin\AdminBookingController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminHomestayController;
use App\Http\Controllers\Api\Admin\AdminPaymentController;
use App\Http\Controllers\Api\Admin\AdminRoomController;
use App\Http\Controllers\Api\Admin\AdminRoomTypeController;
use Illuminate\Support\Facades\Route;

// ─── Public ─────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

Route::get('/homestays', [HomestayController::class, 'index']);
Route::get('/homestays/{homestay:slug}', [HomestayController::class, 'show']);
Route::post('/search/availability', [SearchController::class, 'search']);

// ─── Authenticated ──────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::patch('/profile', [ProfileController::class, 'update']);

    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);

    // ─── Admin / Owner / Staff ──────────────────────────
    Route::middleware('role:admin,owner,staff')->prefix('admin')->group(function () {
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
    });
});
