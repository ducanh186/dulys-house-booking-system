<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $roomTypes = RoomType::with('homestay')->get();

        // Nhóm theo homestay để đánh mã phòng logic theo tầng
        $homestayGroups = $roomTypes->groupBy(fn ($rt) => $rt->homestay_id);

        foreach ($homestayGroups as $homestayId => $types) {
            $floor = 1;

            foreach ($types as $roomType) {
                // Số phòng tùy loại: Standard nhiều nhất, VIP/Suite ít nhất
                $count = $this->roomCountFor($roomType->name);

                // Trạng thái đa dạng để test
                $statuses = ['available', 'available', 'available', 'occupied', 'maintenance'];
                $cleanStates = ['clean', 'clean', 'clean', 'dirty', 'cleaning'];

                for ($i = 1; $i <= $count; $i++) {
                    $statusIdx = ($floor + $i) % count($statuses);

                    Room::create([
                        'room_type_id' => $roomType->id,
                        'room_code' => 'P' . $floor . str_pad($i, 2, '0', STR_PAD_LEFT),
                        'status' => $statuses[$statusIdx],
                        'cleanliness' => $cleanStates[$statusIdx],
                        'notes' => $this->randomNote($statusIdx),
                    ]);
                }
                $floor++;
            }
        }
    }

    private function roomCountFor(string $typeName): int
    {
        // Dựa trên keyword trong tên loại phòng
        $name = mb_strtolower($typeName);

        if (str_contains($name, 'standard') || str_contains($name, 'mountain')) return 4;
        if (str_contains($name, 'deluxe') || str_contains($name, 'garden') || str_contains($name, 'valley')) return 3;
        if (str_contains($name, 'family') || str_contains($name, 'loft') || str_contains($name, 'dorm')) return 2;
        if (str_contains($name, 'vip') || str_contains($name, 'suite') || str_contains($name, 'penthouse') || str_contains($name, 'villa') || str_contains($name, 'truyền thống')) return 1;
        if (str_contains($name, 'bungalow')) return 3;

        return 2;
    }

    private function randomNote(int $idx): ?string
    {
        $notes = [
            null,
            null,
            null,
            'Khách đang ở, check-out ngày mai',
            'Đang sửa điều hòa, dự kiến xong cuối tuần',
        ];

        return $notes[$idx] ?? null;
    }
}
