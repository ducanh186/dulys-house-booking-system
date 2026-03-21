<?php

namespace Database\Seeders;

use App\Models\Homestay;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Room types đa dạng theo từng homestay, giá phù hợp vùng miền
        $homestayRoomTypes = [
            // Đà Nẵng - biển, giá trung bình khá
            "Duly's House Đà Nẵng" => [
                ['name' => 'Standard', 'description' => 'Phòng tiêu chuẩn, view thành phố, đầy đủ tiện nghi cơ bản. Giường đôi 1m6, máy lạnh, wifi.', 'hourly_rate' => 150000, 'nightly_rate' => 500000, 'max_guests' => 2],
                ['name' => 'Deluxe Sea View', 'description' => 'Phòng cao cấp view biển Mỹ Khê, ban công riêng. Giường King, bồn tắm đứng.', 'hourly_rate' => 250000, 'nightly_rate' => 900000, 'max_guests' => 2],
                ['name' => 'VIP Suite', 'description' => 'Phòng VIP rộng 45m², view biển panorama, bồn tắm nằm, minibar. Phòng khách riêng.', 'hourly_rate' => 450000, 'nightly_rate' => 1500000, 'max_guests' => 3],
                ['name' => 'Family Room', 'description' => 'Phòng gia đình 50m², 1 giường đôi + 2 giường đơn. Có bếp nhỏ, máy giặt.', 'hourly_rate' => 350000, 'nightly_rate' => 1100000, 'max_guests' => 5],
            ],
            // Hội An - phố cổ, giá trung bình
            "Duly's House Hội An" => [
                ['name' => 'Standard', 'description' => 'Phòng tiêu chuẩn kiểu Hội An, nội thất gỗ, đèn lồng trang trí. Giường đôi, quạt trần.', 'hourly_rate' => 120000, 'nightly_rate' => 450000, 'max_guests' => 2],
                ['name' => 'Deluxe Garden', 'description' => 'Phòng view sân vườn, ban công nhìn ra vườn hoa. Nội thất gỗ lim, bồn tắm đá.', 'hourly_rate' => 200000, 'nightly_rate' => 750000, 'max_guests' => 2],
                ['name' => 'Heritage Suite', 'description' => 'Phòng VIP phong cách di sản, nội thất cổ điển Hội An. Phòng tắm lộ thiên, bồn ngâm thảo dược.', 'hourly_rate' => 380000, 'nightly_rate' => 1300000, 'max_guests' => 3],
                ['name' => 'Family Room', 'description' => 'Phòng gia đình rộng rãi 55m², 2 tầng, tầng dưới phòng khách, tầng trên phòng ngủ.', 'hourly_rate' => 300000, 'nightly_rate' => 950000, 'max_guests' => 5],
            ],
            // Đà Lạt - lãng mạn, giá trung bình
            "Duly's House Đà Lạt" => [
                ['name' => 'Standard', 'description' => 'Phòng tiêu chuẩn ấm cúng, view đồi thông. Giường đôi, chăn dày, lò sưởi điện.', 'hourly_rate' => 100000, 'nightly_rate' => 400000, 'max_guests' => 2],
                ['name' => 'Deluxe Pine View', 'description' => 'Phòng cao cấp view rừng thông, ban công rộng có bàn trà. Bồn tắm nước nóng, lò sưởi.', 'hourly_rate' => 180000, 'nightly_rate' => 650000, 'max_guests' => 2],
                ['name' => 'Penthouse', 'description' => 'Phòng trên tầng thượng, view 360° thành phố sương mù. Jacuzzi riêng, bếp đầy đủ.', 'hourly_rate' => 350000, 'nightly_rate' => 1200000, 'max_guests' => 4],
                ['name' => 'Dorm (4 giường)', 'description' => 'Phòng tập thể 4 giường tầng, phù hợp nhóm bạn phượt. Tủ locker riêng, phòng tắm chung.', 'hourly_rate' => 50000, 'nightly_rate' => 180000, 'max_guests' => 4],
            ],
            // Phú Quốc - resort, giá cao
            "Duly's House Phú Quốc" => [
                ['name' => 'Bungalow Garden', 'description' => 'Bungalow riêng biệt giữa vườn nhiệt đới, mái lá, sàn gỗ. Giường King, minibar.', 'hourly_rate' => 250000, 'nightly_rate' => 800000, 'max_guests' => 2],
                ['name' => 'Bungalow Beach Front', 'description' => 'Bungalow sát biển, bước chân ra cát trắng. View hoàng hôn tuyệt đẹp, võng đôi.', 'hourly_rate' => 400000, 'nightly_rate' => 1400000, 'max_guests' => 2],
                ['name' => 'Pool Villa', 'description' => 'Villa riêng biệt với hồ bơi riêng 20m². 2 phòng ngủ, phòng khách, bếp đầy đủ.', 'hourly_rate' => 700000, 'nightly_rate' => 2500000, 'max_guests' => 6],
                ['name' => 'Family Bungalow', 'description' => 'Bungalow gia đình rộng 60m², 1 giường đôi + 2 giường đơn. Sân vườn riêng, xích đu.', 'hourly_rate' => 350000, 'nightly_rate' => 1100000, 'max_guests' => 5],
            ],
            // Sapa - trekking, giá thấp-trung bình
            "Duly's House Sapa" => [
                ['name' => 'Standard Mountain', 'description' => 'Phòng tiêu chuẩn view núi, nội thất gỗ thông, chăn thổ cẩm. Giường đôi, sưởi ấm.', 'hourly_rate' => 80000, 'nightly_rate' => 350000, 'max_guests' => 2],
                ['name' => 'Deluxe Valley View', 'description' => 'Phòng view thung lũng Mường Hoa, ban công rộng. Bồn tắm gỗ, lò sưởi than.', 'hourly_rate' => 150000, 'nightly_rate' => 600000, 'max_guests' => 2],
                ['name' => 'Homestay Truyền Thống', 'description' => 'Phòng kiểu nhà sàn dân tộc Hmong, trải nghiệm văn hóa bản địa. Sàn gỗ, chăn bông.', 'hourly_rate' => 60000, 'nightly_rate' => 250000, 'max_guests' => 3],
                ['name' => 'Family Loft', 'description' => 'Phòng gác mái rộng 40m², view ruộng bậc thang. 2 giường đôi, bếp chung, ban công.', 'hourly_rate' => 200000, 'nightly_rate' => 700000, 'max_guests' => 5],
            ],
        ];

        foreach ($homestayRoomTypes as $homestayName => $types) {
            $homestay = Homestay::where('name', $homestayName)->first();
            if (!$homestay) continue;

            foreach ($types as $type) {
                RoomType::create(array_merge($type, [
                    'homestay_id' => $homestay->id,
                    'is_active' => true,
                ]));
            }
        }
    }
}
