<?php

namespace Database\Seeders;

use App\Models\Homestay;
use Illuminate\Database\Seeder;

class HomestaySeeder extends Seeder
{
    public function run(): void
    {
        $homestays = [
            [
                'name' => "Duly's House Đà Nẵng",
                'slug' => 'dulys-house-da-nang',
                'address' => '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
                'hotline' => '0236 1234 567',
                'description' => 'Homestay view biển Mỹ Khê, yên tĩnh, gần trung tâm thành phố Đà Nẵng. Phù hợp cho gia đình và nhóm bạn. Cách biển 200m, gần cầu Rồng và các nhà hàng hải sản nổi tiếng.',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Hội An",
                'slug' => 'dulys-house-hoi-an',
                'address' => '45 Trần Phú, Minh An, Hội An, Quảng Nam',
                'hotline' => '0235 9876 543',
                'description' => 'Homestay phong cách cổ điển giữa lòng phố cổ Hội An. Gần chùa Cầu, chợ đêm. Kiến trúc truyền thống kết hợp hiện đại, sân vườn xanh mát.',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Đà Lạt",
                'slug' => 'dulys-house-da-lat',
                'address' => '78 Phan Đình Phùng, Phường 2, Đà Lạt, Lâm Đồng',
                'hotline' => '0263 8888 999',
                'description' => 'Homestay giữa thành phố ngàn hoa, view đồi thông lãng mạn. Gần hồ Xuân Hương, chợ đêm Đà Lạt. Không gian ấm cúng với lò sưởi, phù hợp cho cặp đôi và nhóm bạn.',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Phú Quốc",
                'slug' => 'dulys-house-phu-quoc',
                'address' => '156 Trần Hưng Đạo, Dương Tơ, Phú Quốc, Kiên Giang',
                'hotline' => '0297 3333 456',
                'description' => 'Resort homestay view biển Phú Quốc, nằm trên bãi biển riêng. Hồ bơi vô cực, nhà hàng hải sản tươi sống. Lý tưởng cho kỳ nghỉ dưỡng và trăng mật.',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Sapa",
                'slug' => 'dulys-house-sapa',
                'address' => '12 Fansipan, TT. Sa Pa, Lào Cai',
                'hotline' => '0214 6666 789',
                'description' => 'Homestay view ruộng bậc thang Mường Hoa, không gian núi rừng Tây Bắc. Trải nghiệm văn hóa dân tộc, trekking Fansipan. Phòng có ban công nhìn ra thung lũng.',
                'is_active' => false, // Sapa đang tạm đóng cửa mùa mưa - dùng test is_active filter
            ],
        ];

        foreach ($homestays as $data) {
            Homestay::create($data);
        }
    }
}
