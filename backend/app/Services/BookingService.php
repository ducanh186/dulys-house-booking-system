<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Payment;
use App\Models\Room;
use Carbon\Carbon;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BookingService
{
    public function __construct(
        protected AvailabilityService $availability,
        protected BookingExpiryService $bookingExpiry,
        protected PricingService $pricing,
        protected NotificationService $notifications,
        protected RoomReservationService $roomReservations,
    ) {}

    /**
     * Create a new booking.
     *
     * @param array $data [customer_id, check_in, check_out, guest_count, notes, rooms => [{room_type_id, quantity}]]
     */
    public function createBooking(array $data): Booking
    {
        $this->bookingExpiry->expirePendingBookings();

        return DB::transaction(function () use ($data) {
            $checkIn = Carbon::parse($data['check_in']);
            $checkOut = Carbon::parse($data['check_out']);
            $totalAmount = 0;
            $details = [];

            // Pessimistic lock: lock rooms for update to prevent concurrent bookings
            foreach ($data['rooms'] as $room) {
                Room::where('room_type_id', $room['room_type_id'])->lockForUpdate()->get();
            }

            // Validate availability and calculate prices for each room type
            foreach ($data['rooms'] as $room) {
                $roomTypeId = $room['room_type_id'];
                $quantity = $room['quantity'] ?? 1;

                $available = $this->availability->getAvailableRoomCount($roomTypeId, $checkIn, $checkOut);
                if ($available < $quantity) {
                    throw new \RuntimeException("Loại phòng không đủ phòng trống. Còn lại: {$available}");
                }

                $price = $this->pricing->calculateTotal($roomTypeId, $checkIn, $checkOut, $quantity);
                $totalAmount += $price['subtotal'];

                $details[] = [
                    'room_type_id' => $roomTypeId,
                    'unit_price' => $price['unit_price'],
                    'quantity' => $quantity,
                    'nights' => $price['nights'],
                ];
            }

            $isTransfer = ($data['payment_method'] ?? 'transfer') === 'transfer';

            // Create booking
            $booking = Booking::create([
                'booking_code' => $this->generateBookingCode(),
                'customer_id' => $data['customer_id'],
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'guest_count' => $data['guest_count'] ?? 1,
                'status' => $isTransfer ? 'pending_payment' : 'pending',
                'expires_at' => now()->addMinutes(Booking::PENDING_HOLD_MINUTES),
                'total_amount' => $totalAmount,
                'deposit' => $data['deposit'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            // Create booking details
            foreach ($details as $detail) {
                $booking->details()->create($detail);
            }

            // Create payment record
            $paymentData = [
                'booking_id' => $booking->id,
                'method' => $data['payment_method'] ?? 'transfer',
                'amount' => $totalAmount,
                'status' => 'pending',
            ];

            if ($isTransfer) {
                $paymentData['transfer_content'] = $booking->booking_code;
                $paymentData['qr_payload'] = $this->generateVietQrUrl($booking->booking_code, $totalAmount);
                $paymentData['expires_at'] = $booking->expires_at;
            }

            Payment::create($paymentData);
            $this->roomReservations->reserveRoomsForBooking($booking);

            $booking = $booking->load('details.roomType.homestay', 'payments', 'customer');

            try { $this->notifications->notifyBookingCreated($booking); } catch (\Throwable) {}

            return $booking;
        });
    }

    public function confirmBooking(Booking $booking): Booking
    {
        $this->bookingExpiry->expirePendingBookings();

        if (!in_array($booking->status, ['pending', 'payment_review'])) {
            throw new \RuntimeException('Chỉ có thể xác nhận đơn đặt phòng đang chờ duyệt hoặc chờ xác nhận thanh toán.');
        }

        $booking->update([
            'status' => 'confirmed',
            'expires_at' => null,
            'confirmed_at' => now(),
        ]);

        $this->roomReservations->markBookingRoomsBooked($booking);

        // Mark payment as success if confirming from payment_review
        if ($booking->payments()->where('status', 'proof_uploaded')->exists()) {
            $booking->payments()->where('status', 'proof_uploaded')->update([
                'status' => 'success',
                'paid_at' => now(),
                'verified_by' => auth()->id(),
                'verified_at' => now(),
            ]);
        }

        $booking = $booking->fresh('details.roomType.homestay', 'payments', 'customer');
        try { $this->notifications->notifyBookingConfirmed($booking); } catch (\Throwable) {}

        return $booking;
    }

    /**
     * Check in: assign physical rooms to booking details.
     *
     * @param array $roomAssignments [{detail_id => room_id}]
     */
    public function checkIn(Booking $booking, ?string $staffId = null, array $roomAssignments = []): Booking
    {
        $this->bookingExpiry->expirePendingBookings();

        if (!in_array($booking->status, ['confirmed'])) {
            throw new \RuntimeException('Chỉ có thể check-in đơn đã xác nhận.');
        }

        return DB::transaction(function () use ($booking, $staffId, $roomAssignments) {
            $booking->loadMissing('details.assignedRooms', 'details.roomType.homestay');

            foreach ($booking->details as $detail) {
                $rooms = empty($roomAssignments)
                    ? $this->roomReservations->reservedRoomsForDetail($detail)
                    : $this->resolveManuallyAssignedRooms($detail, $booking, $roomAssignments);

                if ($rooms->count() < $detail->quantity) {
                    throw new \RuntimeException('Không đủ phòng vật lý để check-in cho đơn đặt phòng này.');
                }

                $detail->assignedRooms()->syncWithoutDetaching($rooms->pluck('id')->all());
                $detail->update(['room_id' => $rooms->first()?->id]);

                Room::whereIn('id', $rooms->pluck('id'))
                    ->update(['status' => 'occupied', 'cleanliness' => 'clean']);
            }

            $booking->update([
                'status' => 'checked_in',
                'staff_id' => $staffId,
                'expires_at' => null,
            ]);

            $booking = $booking->fresh('details.room', 'details.assignedRooms', 'details.roomType.homestay', 'customer', 'payments');
            try { $this->notifications->notifyCheckIn($booking); } catch (\Throwable) {}

            return $booking;
        });
    }

    public function checkOut(Booking $booking): Booking
    {
        $this->bookingExpiry->expirePendingBookings();

        if ($booking->status !== 'checked_in') {
            throw new \RuntimeException('Chỉ có thể check-out đơn đã check-in.');
        }

        return DB::transaction(function () use ($booking) {
            $booking->loadMissing('details.assignedRooms');

            foreach ($booking->details as $detail) {
                $roomIds = $detail->assignedRooms->pluck('id');

                if ($roomIds->isNotEmpty()) {
                    Room::whereIn('id', $roomIds)->update([
                        'status' => 'available',
                        'cleanliness' => 'dirty',
                    ]);
                }
            }

            $booking->update([
                'status' => 'checked_out',
                'expires_at' => null,
            ]);

            // Auto-mark payment as success (mock)
            $booking->payments()->where('status', 'pending')->update([
                'status' => 'success',
                'paid_at' => now(),
            ]);

            $booking = $booking->fresh('details.roomType.homestay', 'details.room', 'details.assignedRooms', 'customer', 'payments');
            try { $this->notifications->notifyCheckOut($booking); } catch (\Throwable) {}

            return $booking;
        });
    }

    public function cancelBooking(Booking $booking, ?string $reason = null): Booking
    {
        $this->bookingExpiry->expirePendingBookings();

        if (!$booking->isCancellable()) {
            throw new \RuntimeException('Không thể hủy đơn đặt phòng này.');
        }

        $booking->update([
            'status' => 'cancelled',
            'expires_at' => null,
            'cancelled_at' => now(),
            'cancel_reason' => $reason,
        ]);

        // Cancel pending/proof_uploaded payments
        $booking->payments()->whereIn('status', ['pending', 'proof_uploaded'])->update(['status' => 'failed']);
        $this->roomReservations->markBookingRoomsAvailable($booking);

        $booking = $booking->fresh('details.roomType.homestay', 'payments', 'customer');
        try { $this->notifications->notifyBookingCancelled($booking); } catch (\Throwable) {}

        return $booking;
    }

    public function generateBookingCode(): string
    {
        do {
            $code = 'BK' . strtoupper(Str::random(6));
        } while (Booking::where('booking_code', $code)->exists());

        return $code;
    }

    protected function generateVietQrUrl(string $transferContent, float $amount): string
    {
        $bankId = '970422';
        $accountNo = '0379163557';
        $template = 'compact2';
        $amountInt = (int) $amount;

        return "https://img.vietqr.io/image/{$bankId}-{$accountNo}-{$template}.png?amount={$amountInt}&addInfo=" . urlencode($transferContent) . '&accountName=' . urlencode('DULY S HOUSE');
    }

    protected function resolveManuallyAssignedRooms(BookingDetail $detail, Booking $booking, array $roomAssignments): Collection
    {
        $assigned = Arr::wrap($roomAssignments[$detail->id] ?? []);

        if (count($assigned) !== $detail->quantity) {
            throw new \RuntimeException('Số lượng phòng gán tay không khớp với số lượng đã đặt.');
        }

        $availableIds = $this->availability
            ->findAvailableRooms($detail->room_type_id, $booking->check_in, $booking->check_out, 100)
            ->pluck('id');

        $rooms = Room::query()
            ->where('room_type_id', $detail->room_type_id)
            ->whereIn('id', $assigned)
            ->get();

        if ($rooms->count() !== count($assigned) || $rooms->pluck('id')->diff($availableIds)->isNotEmpty()) {
            throw new \RuntimeException('Danh sách phòng gán tay không hợp lệ hoặc không còn trống.');
        }

        return $rooms->sortBy(fn (Room $room) => array_search($room->id, $assigned, true))->values();
    }
}
