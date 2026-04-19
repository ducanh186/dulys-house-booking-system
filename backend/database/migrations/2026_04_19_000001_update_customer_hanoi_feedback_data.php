<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const SAMPLE_ROOM_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80';

    public function up(): void
    {
        $locations = [
            [
                'old_name' => "Duly's House Đà Nẵng",
                'old_slug' => 'dulys-house-da-nang',
                'name' => "Duly's House Đội Cấn",
                'slug' => 'dulys-house-doi-can',
                'address' => 'Đội Cấn, Ba Đình, Hà Nội',
                'hotline' => '024 1234 567',
                'description' => 'Cơ sở Đội Cấn nằm gần khu Ba Đình, thuận tiện di chuyển đến Lăng Bác, Hồ Tây và các điểm ăn uống trung tâm. Phù hợp cho khách công tác, cặp đôi và nhóm nhỏ muốn ở khu yên tĩnh.',
            ],
            [
                'old_name' => "Duly's House Hội An",
                'old_slug' => 'dulys-house-hoi-an',
                'name' => "Duly's House Âu Cơ",
                'slug' => 'dulys-house-au-co',
                'address' => 'Âu Cơ, Tây Hồ, Hà Nội',
                'hotline' => '024 9876 543',
                'description' => 'Cơ sở Âu Cơ gần Hồ Tây, phù hợp cho khách thích không gian thoáng, nhiều quán cà phê và di chuyển nhanh đến khu phố cổ. Phòng được bố trí sáng, gọn và dễ nghỉ ngơi.',
            ],
            [
                'old_name' => "Duly's House Đà Lạt",
                'old_slug' => 'dulys-house-da-lat',
                'name' => "Duly's House Nguyễn Chí Thanh",
                'slug' => 'dulys-house-nguyen-chi-thanh',
                'address' => 'Nguyễn Chí Thanh, Đống Đa, Hà Nội',
                'hotline' => '024 8888 999',
                'description' => 'Cơ sở Nguyễn Chí Thanh nằm trên trục đường lớn, dễ kết nối Ba Đình, Đống Đa và Cầu Giấy. Không gian phù hợp cho khách công tác hoặc gia đình cần vị trí trung tâm.',
            ],
            [
                'old_name' => "Duly's House Phú Quốc",
                'old_slug' => 'dulys-house-phu-quoc',
                'name' => "Duly's House Yên Hoa",
                'slug' => 'dulys-house-yen-hoa',
                'address' => 'Yên Hoa, Cầu Giấy, Hà Nội',
                'hotline' => '024 3333 456',
                'description' => 'Cơ sở Yên Hoa gần khu Cầu Giấy và các tuyến đường chính, thuận tiện cho khách đi học, đi làm hoặc lưu trú ngắn ngày. Không gian ưu tiên sự riêng tư và thao tác đặt phòng nhanh.',
            ],
            [
                'old_name' => "Duly's House Sapa",
                'old_slug' => 'dulys-house-sapa',
                'name' => "Duly's House Long Biên",
                'slug' => 'dulys-house-long-bien',
                'address' => 'Long Biên, Hà Nội',
                'hotline' => '024 6666 789',
                'description' => 'Cơ sở Long Biên phù hợp cho khách cần không gian rộng, dễ đi sang phố cổ qua cầu Chương Dương hoặc cầu Long Biên. Đây là lựa chọn tốt cho nhóm bạn và gia đình nhỏ.',
            ],
        ];

        foreach ($locations as $location) {
            DB::table('homestays')
                ->where(function ($query) use ($location) {
                    $query
                        ->where('slug', $location['old_slug'])
                        ->orWhere('name', $location['old_name'])
                        ->orWhere('slug', $location['slug'])
                        ->orWhere('name', $location['name']);
                })
                ->update([
                    'name' => $location['name'],
                    'slug' => $location['slug'],
                    'address' => $location['address'],
                    'hotline' => $location['hotline'],
                    'description' => $location['description'],
                    'is_active' => true,
                    'deleted_at' => null,
                    'updated_at' => now(),
                ]);
        }

        $standardRoomTypeId = DB::table('room_types')
            ->join('homestays', 'room_types.homestay_id', '=', 'homestays.id')
            ->where('homestays.slug', 'dulys-house-doi-can')
            ->where('room_types.name', 'Standard')
            ->value('room_types.id');

        if ($standardRoomTypeId) {
            $roomId = DB::table('rooms')
                ->where('room_type_id', $standardRoomTypeId)
                ->orderBy('room_code')
                ->value('id');

            if ($roomId) {
                DB::table('rooms')
                    ->where('id', $roomId)
                    ->update([
                        'main_image' => self::SAMPLE_ROOM_IMAGE,
                        'updated_at' => now(),
                    ]);
            }
        }
    }

    public function down(): void
    {
        $locations = [
            [
                'name' => "Duly's House Đội Cấn",
                'slug' => 'dulys-house-doi-can',
                'old_name' => "Duly's House Đà Nẵng",
                'old_slug' => 'dulys-house-da-nang',
                'old_address' => '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
                'old_hotline' => '0236 1234 567',
                'old_description' => 'Homestay view biển Mỹ Khê, yên tĩnh, gần trung tâm thành phố Đà Nẵng. Phù hợp cho gia đình và nhóm bạn. Cách biển 200m, gần cầu Rồng và các nhà hàng hải sản nổi tiếng.',
                'old_is_active' => true,
            ],
            [
                'name' => "Duly's House Âu Cơ",
                'slug' => 'dulys-house-au-co',
                'old_name' => "Duly's House Hội An",
                'old_slug' => 'dulys-house-hoi-an',
                'old_address' => '45 Trần Phú, Minh An, Hội An, Quảng Nam',
                'old_hotline' => '0235 9876 543',
                'old_description' => 'Homestay phong cách cổ điển giữa lòng phố cổ Hội An. Gần chùa Cầu, chợ đêm. Kiến trúc truyền thống kết hợp hiện đại, sân vườn xanh mát.',
                'old_is_active' => true,
            ],
            [
                'name' => "Duly's House Nguyễn Chí Thanh",
                'slug' => 'dulys-house-nguyen-chi-thanh',
                'old_name' => "Duly's House Đà Lạt",
                'old_slug' => 'dulys-house-da-lat',
                'old_address' => '78 Phan Đình Phùng, Phường 2, Đà Lạt, Lâm Đồng',
                'old_hotline' => '0263 8888 999',
                'old_description' => 'Homestay giữa thành phố ngàn hoa, view đồi thông lãng mạn. Gần hồ Xuân Hương, chợ đêm Đà Lạt. Không gian ấm cúng với lò sưởi, phù hợp cho cặp đôi và nhóm bạn.',
                'old_is_active' => true,
            ],
            [
                'name' => "Duly's House Yên Hoa",
                'slug' => 'dulys-house-yen-hoa',
                'old_name' => "Duly's House Phú Quốc",
                'old_slug' => 'dulys-house-phu-quoc',
                'old_address' => '156 Trần Hưng Đạo, Dương Tơ, Phú Quốc, Kiên Giang',
                'old_hotline' => '0297 3333 456',
                'old_description' => 'Resort homestay view biển Phú Quốc, nằm trên bãi biển riêng. Hồ bơi vô cực, nhà hàng hải sản tươi sống. Lý tưởng cho kỳ nghỉ dưỡng và trăng mật.',
                'old_is_active' => true,
            ],
            [
                'name' => "Duly's House Long Biên",
                'slug' => 'dulys-house-long-bien',
                'old_name' => "Duly's House Sapa",
                'old_slug' => 'dulys-house-sapa',
                'old_address' => '12 Fansipan, TT. Sa Pa, Lào Cai',
                'old_hotline' => '0214 6666 789',
                'old_description' => 'Homestay view ruộng bậc thang Mường Hoa, không gian núi rừng Tây Bắc. Trải nghiệm văn hóa dân tộc, trekking Fansipan. Phòng có ban công nhìn ra thung lũng.',
                'old_is_active' => false,
            ],
        ];

        foreach ($locations as $location) {
            DB::table('homestays')
                ->where('slug', $location['slug'])
                ->orWhere('name', $location['name'])
                ->update([
                    'name' => $location['old_name'],
                    'slug' => $location['old_slug'],
                    'address' => $location['old_address'],
                    'hotline' => $location['old_hotline'],
                    'description' => $location['old_description'],
                    'is_active' => $location['old_is_active'],
                    'updated_at' => now(),
                ]);
        }

        DB::table('rooms')
            ->where('main_image', self::SAMPLE_ROOM_IMAGE)
            ->update([
                'main_image' => null,
                'updated_at' => now(),
            ]);
    }
};
