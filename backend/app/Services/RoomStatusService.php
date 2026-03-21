<?php

namespace App\Services;

use App\Models\Room;

class RoomStatusService
{
    public function updateStatus(Room $room, string $status): Room
    {
        $allowed = ['available', 'occupied', 'maintenance'];

        if (!in_array($status, $allowed)) {
            throw new \InvalidArgumentException("Trạng thái không hợp lệ: {$status}");
        }

        $room->update(['status' => $status]);

        return $room->fresh();
    }

    public function updateCleanliness(Room $room, string $cleanliness): Room
    {
        $allowed = ['clean', 'dirty', 'cleaning'];

        if (!in_array($cleanliness, $allowed)) {
            throw new \InvalidArgumentException("Tình trạng vệ sinh không hợp lệ: {$cleanliness}");
        }

        $room->update(['cleanliness' => $cleanliness]);

        if ($cleanliness === 'clean' && $room->status === 'available') {
            // Room is ready
        }

        return $room->fresh();
    }

    public function markOccupied(Room $room): Room
    {
        return $this->updateStatus($room, 'occupied');
    }

    public function markAvailable(Room $room): Room
    {
        $room->update(['status' => 'available', 'cleanliness' => 'clean']);
        return $room->fresh();
    }

    public function markMaintenance(Room $room): Room
    {
        return $this->updateStatus($room, 'maintenance');
    }

    public function markCleaning(Room $room): Room
    {
        return $this->updateCleanliness($room, 'cleaning');
    }
}
