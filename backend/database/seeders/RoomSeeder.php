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

        // Short prefix per homestay to ensure globally unique room codes
        $prefixMap = [];
        $prefixIdx = 0;
        $prefixes = ['DC', 'AC', 'NCT', 'YH', 'LB', 'HN', 'NT', 'QN'];

        foreach ($homestayGroups as $homestayId => $types) {
            $prefix = $prefixes[$prefixIdx] ?? ('H' . ($prefixIdx + 1));
            $prefixIdx++;
            $floor = 1;

            foreach ($types as $roomType) {
                $count = $this->roomCountFor($roomType->name);

                $statuses = ['available', 'available', 'available', 'occupied', 'maintenance'];
                $cleanStates = ['clean', 'clean', 'clean', 'dirty', 'cleaning'];

                for ($i = 1; $i <= $count; $i++) {
                    // Ensure at least one room per type is not maintenance
                    $statusIdx = ($floor + $i) % count($statuses);
                    if ($count === 1 && $statuses[$statusIdx] === 'maintenance') {
                        $statusIdx = 0; // available + clean
                    }

                    Room::create([
                        'room_type_id' => $roomType->id,
                        'room_code' => $prefix . '-' . $floor . str_pad($i, 2, '0', STR_PAD_LEFT),
                        'status' => $statuses[$statusIdx],
                        'cleanliness' => $cleanStates[$statusIdx],
                        'notes' => $this->randomNote($statusIdx),
                        'main_image' => $this->sampleImageFor($roomType, $i),
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

    private function sampleImageFor(RoomType $roomType, int $roomIndex): ?string
    {
        $name = mb_strtolower($roomType->name);

        if (str_contains($name, 'family') || str_contains($name, 'loft')) {
            return $this->imageFrom([
                'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1560448204-61dc36dc98c8?auto=format&fit=crop&w=1200&q=80',
            ], $roomIndex);
        }

        if (str_contains($name, 'suite') || str_contains($name, 'penthouse')) {
            return $this->imageFrom([
                'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80',
            ], $roomIndex);
        }

        if (str_contains($name, 'deluxe')) {
            return $this->imageFrom([
                'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80',
            ], $roomIndex);
        }

        if (str_contains($name, 'studio')) {
            return $this->imageFrom([
                'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
            ], $roomIndex);
        }

        if (str_contains($name, 'dorm')) {
            return $this->imageFrom([
                'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
            ], $roomIndex);
        }

        return $this->imageFrom([
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=1200&q=80',
        ], $roomIndex);
    }

    private function imageFrom(array $images, int $roomIndex): string
    {
        return $images[($roomIndex - 1) % count($images)];
    }
}
