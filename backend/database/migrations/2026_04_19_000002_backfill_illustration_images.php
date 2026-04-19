<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const HOMESTAY_IMAGES = [
        'dulys-house-doi-can' => 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
        'dulys-house-au-co' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
        'dulys-house-nguyen-chi-thanh' => 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
        'dulys-house-yen-hoa' => 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'dulys-house-long-bien' => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
    ];

    private const STANDARD_IMAGES = [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80',
    ];

    private const DELUXE_IMAGES = [
        'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80',
    ];

    private const SUITE_IMAGES = [
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80',
    ];

    private const FAMILY_IMAGES = [
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=1200&q=80',
    ];

    private const STUDIO_IMAGES = [
        'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ];

    private const DORM_IMAGES = [
        'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    ];

    public function up(): void
    {
        foreach (self::HOMESTAY_IMAGES as $slug => $image) {
            DB::table('homestays')
                ->where('slug', $slug)
                ->update([
                    'thumbnail' => $image,
                    'updated_at' => now(),
                ]);
        }

        $rooms = DB::table('rooms')
            ->join('room_types', 'rooms.room_type_id', '=', 'room_types.id')
            ->select('rooms.id', 'rooms.room_code', 'room_types.name as room_type_name')
            ->orderBy('rooms.room_code')
            ->get();

        foreach ($rooms as $room) {
            DB::table('rooms')
                ->where('id', $room->id)
                ->update([
                    'main_image' => $this->imageForRoomType($room->room_type_name, $room->room_code),
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        DB::table('homestays')
            ->whereIn('slug', array_keys(self::HOMESTAY_IMAGES))
            ->update([
                'thumbnail' => null,
                'updated_at' => now(),
            ]);

        $images = array_values(self::HOMESTAY_IMAGES);
        $images = array_merge(
            $images,
            self::STANDARD_IMAGES,
            self::DELUXE_IMAGES,
            self::SUITE_IMAGES,
            self::FAMILY_IMAGES,
            self::STUDIO_IMAGES,
            self::DORM_IMAGES,
        );

        DB::table('rooms')
            ->whereIn('main_image', array_unique($images))
            ->update([
                'main_image' => null,
                'updated_at' => now(),
            ]);
    }

    private function imageForRoomType(string $roomTypeName, string $roomCode): string
    {
        $name = mb_strtolower($roomTypeName);
        $index = $this->roomImageIndex($roomCode);

        if (str_contains($name, 'family') || str_contains($name, 'loft')) {
            return $this->imageFrom(self::FAMILY_IMAGES, $index);
        }

        if (str_contains($name, 'suite') || str_contains($name, 'penthouse')) {
            return $this->imageFrom(self::SUITE_IMAGES, $index);
        }

        if (str_contains($name, 'deluxe')) {
            return $this->imageFrom(self::DELUXE_IMAGES, $index);
        }

        if (str_contains($name, 'studio')) {
            return $this->imageFrom(self::STUDIO_IMAGES, $index);
        }

        if (str_contains($name, 'dorm')) {
            return $this->imageFrom(self::DORM_IMAGES, $index);
        }

        return $this->imageFrom(self::STANDARD_IMAGES, $index);
    }

    private function imageFrom(array $images, int $index): string
    {
        return $images[$index % count($images)];
    }

    private function roomImageIndex(string $roomCode): int
    {
        if (preg_match('/(\d+)$/', $roomCode, $matches)) {
            return max(0, ((int) $matches[1]) - 1);
        }

        return 0;
    }
};
