<?php

use App\Services\BookingExpiryService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bookings:expire-pending', function (BookingExpiryService $bookingExpiry) {
    $count = $bookingExpiry->expirePendingBookings();
    $this->info("Processed {$count} expired bookings.");
})->purpose('Cancel timed-out bookings, release locked rooms, and notify users');

Schedule::command('bookings:expire-pending')->everyMinute();
