<?php

namespace App\Services;

use App\Models\BookingDetail;
use App\Models\Room;
use App\Models\RoomType;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AvailabilityService
{
    public function __construct(
        protected BookingExpiryService $bookingExpiry,
    ) {}

    /**
     * Search available room types for a homestay in a date range.
     */
    public function searchAvailable(?string $homestayId, Carbon $checkIn, Carbon $checkOut, int $guests): Collection
    {
        $this->bookingExpiry->expirePendingBookings();

        $query = RoomType::query()
            ->with('homestay')
            ->where('is_active', true)
            ->where('max_guests', '>=', $guests);

        if ($homestayId) {
            $query->where('homestay_id', $homestayId);
        }

        $query->whereHas('homestay', fn ($q) => $q->where('is_active', true));

        $roomTypes = $query->get();

        return $roomTypes->map(function (RoomType $roomType) use ($checkIn, $checkOut) {
            $availableCount = $this->getAvailableRoomCount($roomType->id, $checkIn, $checkOut);

            return [
                'room_type' => $roomType,
                'available_count' => $availableCount,
            ];
        })->filter(fn ($item) => $item['available_count'] > 0)->values();
    }

    /**
     * Check if a room type has any available rooms in the date range.
     */
    public function isRoomTypeAvailable(string $roomTypeId, Carbon $checkIn, Carbon $checkOut): bool
    {
        return $this->getAvailableRoomCount($roomTypeId, $checkIn, $checkOut) > 0;
    }

    /**
     * Count available rooms of a type in the date range.
     * A room is unavailable if it has a non-cancelled booking overlapping the range,
     * or if it's in maintenance status.
     */
    public function getAvailableRoomCount(string $roomTypeId, Carbon $checkIn, Carbon $checkOut): int
    {
        $this->bookingExpiry->expirePendingBookings();

        $totalRooms = Room::where('room_type_id', $roomTypeId)
            ->where('status', '!=', 'maintenance')
            ->count();

        $reservedQuantity = BookingDetail::query()
            ->where('room_type_id', $roomTypeId)
            ->whereHas('booking', fn ($query) => $query
                ->inventoryHeld()
                ->overlapping($checkIn, $checkOut))
            ->sum('quantity');

        return max(0, $totalRooms - (int) $reservedQuantity);
    }

    /**
     * Get IDs of rooms already assigned to overlapping bookings.
     */
    public function getAssignedRoomIds(string $roomTypeId, Carbon $checkIn, Carbon $checkOut): Collection
    {
        return Room::where('room_type_id', $roomTypeId)
            ->whereHas('assignedBookingDetails.booking', function ($query) use ($checkIn, $checkOut) {
                $query
                    ->whereIn('status', ['confirmed', 'checked_in'])
                    ->overlapping($checkIn, $checkOut);
            })
            ->pluck('rooms.id');
    }

    /**
     * Find available rooms of the given type for the date range.
     */
    public function findAvailableRooms(string $roomTypeId, Carbon $checkIn, Carbon $checkOut, int $quantity = 1): Collection
    {
        $this->bookingExpiry->expirePendingBookings();

        $assignedRoomIds = $this->getAssignedRoomIds($roomTypeId, $checkIn, $checkOut);

        return Room::where('room_type_id', $roomTypeId)
            ->where('status', 'available')
            ->whereNotIn('id', $assignedRoomIds)
            ->orderBy('room_code')
            ->limit($quantity)
            ->get();
    }
}
