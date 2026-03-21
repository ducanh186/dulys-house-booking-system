<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class BookingExpiryService
{
    public function expirePendingBookings(): int
    {
        $expiredIds = Booking::expiredPending()->pluck('id');

        if ($expiredIds->isEmpty()) {
            return 0;
        }

        return DB::transaction(function () use ($expiredIds) {
            $bookings = Booking::with('payments')
                ->whereIn('id', $expiredIds)
                ->lockForUpdate()
                ->get();

            foreach ($bookings as $booking) {
                if (!$booking->isPendingExpired()) {
                    continue;
                }

                $booking->update([
                    'status' => 'cancelled',
                    'expires_at' => null,
                ]);

                $booking->payments()
                    ->where('status', 'pending')
                    ->update(['status' => 'failed']);
            }

            return $bookings->count();
        });
    }
}
