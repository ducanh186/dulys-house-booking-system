<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingDetail;
use App\Models\Room;
use Illuminate\Support\Collection;

class RoomReservationService
{
    public function reserveRoomsForBooking(Booking $booking): void
    {
        $booking->loadMissing('details.assignedRooms');

        foreach ($booking->details as $detail) {
            $reservedCount = $detail->assignedRooms->count();

            if ($reservedCount >= $detail->quantity) {
                continue;
            }

            $remainingQuantity = $detail->quantity - $reservedCount;
            $rooms = Room::query()
                ->where('room_type_id', $detail->room_type_id)
                ->whereIn('status', ['available', 'locked', 'booked', 'occupied'])
                ->where('cleanliness', 'clean')
                ->whereDoesntHave('assignedBookingDetails.booking', function ($query) use ($booking) {
                    $query
                        ->inventoryHeld()
                        ->overlapping($booking->check_in, $booking->check_out);
                })
                ->orderBy('room_code')
                ->limit($remainingQuantity)
                ->get();

            if ($rooms->count() < $remainingQuantity) {
                throw new \RuntimeException('Không thể khóa đủ số lượng phòng cho đơn đặt phòng này.');
            }

            $detail->assignedRooms()->syncWithoutDetaching($rooms->pluck('id')->all());
            $detail->update(['room_id' => $rooms->first()?->id]);

            Room::whereIn('id', $rooms->pluck('id'))
                ->where('status', 'available')
                ->update(['status' => 'locked', 'cleanliness' => 'clean']);
        }
    }

    public function markBookingRoomsBooked(Booking $booking): void
    {
        $this->transitionAssignedRooms($booking, 'booked', ['locked']);
    }

    public function markBookingRoomsOccupied(Booking $booking): void
    {
        $this->transitionAssignedRooms($booking, 'occupied', ['locked', 'booked']);
    }

    public function markBookingRoomsAvailable(Booking $booking, string $cleanliness = 'clean'): void
    {
        $this->transitionAssignedRooms($booking, 'available', ['locked', 'booked'], $cleanliness);
    }

    public function reservedRoomsForDetail(BookingDetail $detail): Collection
    {
        $detail->loadMissing('assignedRooms');

        return $detail->assignedRooms
            ->where('status', '!=', 'maintenance')
            ->values();
    }

    protected function transitionAssignedRooms(
        Booking $booking,
        string $status,
        array $fromStatuses,
        ?string $cleanliness = null,
    ): void {
        $booking->loadMissing('details.assignedRooms');

        $roomIds = $booking->details
            ->flatMap(fn (BookingDetail $detail) => $detail->assignedRooms)
            ->filter(fn (Room $room) => in_array($room->status, $fromStatuses, true))
            ->pluck('id')
            ->unique()
            ->values();

        if ($roomIds->isEmpty()) {
            return;
        }

        $payload = ['status' => $status];

        if ($cleanliness !== null) {
            $payload['cleanliness'] = $cleanliness;
        }

        Room::whereIn('id', $roomIds)->update($payload);
    }
}
