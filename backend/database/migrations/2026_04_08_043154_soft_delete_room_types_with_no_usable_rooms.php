<?php

use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Soft-delete room types where ALL physical rooms are in maintenance
     * (zero usable inventory → always shows 30 "Ngày lấp đầy").
     */
    public function up(): void
    {
        $roomTypeIds = RoomType::query()
            ->whereDoesntHave('rooms', fn ($q) => $q->where('status', '!=', 'maintenance'))
            ->pluck('id');

        if ($roomTypeIds->isEmpty()) {
            return;
        }

        // Soft-delete the rooms first, then the room types
        Room::whereIn('room_type_id', $roomTypeIds)->delete();
        RoomType::whereIn('id', $roomTypeIds)->delete();
    }

    /**
     * Restore the soft-deleted room types and rooms.
     */
    public function down(): void
    {
        RoomType::onlyTrashed()
            ->whereDoesntHave('rooms', fn ($q) => $q->withTrashed()->where('status', '!=', 'maintenance'))
            ->restore();

        Room::onlyTrashed()
            ->where('status', 'maintenance')
            ->whereHas('roomType')
            ->restore();
    }
};
