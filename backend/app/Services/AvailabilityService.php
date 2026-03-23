<?php

namespace App\Services;

use App\Models\BlockedDate;
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
            // Skip if fully blocked
            if ($this->isRoomTypeBlocked($roomType->id, $checkIn, $checkOut)) {
                return null;
            }

            $availableCount = $this->getAvailableRoomCount($roomType->id, $checkIn, $checkOut);

            return [
                'room_type' => $roomType,
                'available_count' => $availableCount,
            ];
        })->filter(fn ($item) => $item !== null && $item['available_count'] > 0)->values();
    }

    /**
     * Check if a room type is fully blocked for a date range.
     */
    public function isRoomTypeBlocked(string $roomTypeId, Carbon $checkIn, Carbon $checkOut): bool
    {
        return BlockedDate::where('room_type_id', $roomTypeId)
            ->whereDate('date_from', '<=', $checkIn->toDateString())
            ->whereDate('date_to', '>=', $checkOut->copy()->subDay()->toDateString())
            ->exists();
    }

    /**
     * Check if a room type has any available rooms in the date range.
     */
    public function isRoomTypeAvailable(string $roomTypeId, Carbon $checkIn, Carbon $checkOut): bool
    {
        if ($this->isRoomTypeBlocked($roomTypeId, $checkIn, $checkOut)) {
            return false;
        }
        return $this->getAvailableRoomCount($roomTypeId, $checkIn, $checkOut) > 0;
    }

    /**
     * Count available rooms of a type in the date range.
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
     * Get daily availability for a room type in a given month.
     */
    public function getMonthlyCalendar(string $roomTypeId, Carbon $month): array
    {
        $roomType = RoomType::findOrFail($roomTypeId);
        $start = $month->copy()->startOfMonth();
        $end = $month->copy()->endOfMonth();

        $totalRooms = Room::where('room_type_id', $roomTypeId)
            ->where('status', '!=', 'maintenance')
            ->count();

        $blockedDates = BlockedDate::where('room_type_id', $roomTypeId)
            ->whereDate('date_from', '<=', $end->toDateString())
            ->whereDate('date_to', '>=', $start->toDateString())
            ->get();

        $calendar = [];
        $current = $start->copy();

        while ($current->lte($end)) {
            $date = $current->toDateString();
            $nextDay = $current->copy()->addDay();

            $booked = BookingDetail::where('room_type_id', $roomTypeId)
                ->whereHas('booking', fn ($q) => $q
                    ->inventoryHeld()
                    ->overlapping($current, $nextDay))
                ->sum('quantity');

            $isBlocked = $blockedDates->contains(fn ($b) =>
                $date >= $b->date_from->toDateString() && $date <= $b->date_to->toDateString()
            );

            $blockReason = null;
            if ($isBlocked) {
                $block = $blockedDates->first(fn ($b) =>
                    $date >= $b->date_from->toDateString() && $date <= $b->date_to->toDateString()
                );
                $blockReason = $block?->reason;
            }

            $available = $isBlocked ? 0 : max(0, $totalRooms - (int) $booked);

            $calendar[] = [
                'date' => $date,
                'total_rooms' => $totalRooms,
                'booked_count' => (int) $booked,
                'available_count' => $available,
                'is_blocked' => $isBlocked,
                'block_reason' => $blockReason,
            ];

            $current->addDay();
        }

        return $calendar;
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
            ->where('status', '!=', 'maintenance')
            ->whereNotIn('id', $assignedRoomIds)
            ->orderBy('room_code')
            ->limit($quantity)
            ->get();
    }
}
