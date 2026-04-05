<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\DB;

class BookingExpiryService
{
    public function __construct(
        protected NotificationService $notifications,
        protected RoomReservationService $roomReservations,
    ) {}

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
                    'cancelled_at' => now(),
                    'cancel_reason' => 'Quá thời gian thanh toán.',
                ]);

                $booking->payments()
                    ->whereIn('status', ['pending', 'proof_uploaded'])
                    ->update(['status' => 'expired']);

                $this->roomReservations->markBookingRoomsAvailable($booking);

                try {
                    $this->notifications->notifyBookingExpired($booking->fresh('customer.user', 'details.roomType.homestay'));
                } catch (\Throwable) {
                }
            }

            return $bookings->count();
        });
    }
}
