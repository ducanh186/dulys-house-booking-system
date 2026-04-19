<?php

namespace Database\Seeders;

use App\Models\Homestay;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class RoomTypeSeeder extends Seeder
{
    public function run(): void
    {
        // Room types đa dạng theo từng cơ sở Hà Nội, giá phù hợp khu vực nội thành
        $homestayRoomTypes = [
            // Đội Cấn - trung tâm Ba Đình
            "Duly's House Đội Cấn" => [
                ['name' => 'Standard', 'description' => 'Phòng tiêu chuẩn gọn gàng, phù hợp 1-2 khách. Có giường đôi 1m6, máy lạnh, wifi và bàn làm việc nhỏ.', 'hourly_rate' => 150000, 'nightly_rate' => 500000, 'max_guests' => 2],
                ['name' => 'Deluxe City View', 'description' => 'Phòng cao cấp có cửa sổ lớn nhìn khu Ba Đình. Giường King, khu ngồi thư giãn và phòng tắm riêng.', 'hourly_rate' => 250000, 'nightly_rate' => 900000, 'max_guests' => 2],
                ['name' => 'VIP Suite', 'description' => 'Phòng suite rộng 45m², có góc tiếp khách, minibar và bồn tắm. Phù hợp khách công tác dài ngày.', 'hourly_rate' => 450000, 'nightly_rate' => 1500000, 'max_guests' => 3],
                ['name' => 'Family Room', 'description' => 'Phòng gia đình 50m², 1 giường đôi và 2 giường đơn. Có bếp nhỏ, máy giặt và khu sinh hoạt chung.', 'hourly_rate' => 350000, 'nightly_rate' => 1100000, 'max_guests' => 4],
            ],
            // Âu Cơ - gần Hồ Tây
            "Duly's House Âu Cơ" => [
                ['name' => 'Standard', 'description' => 'Phòng tiêu chuẩn gần Hồ Tây, ánh sáng tự nhiên tốt. Giường đôi, quạt trần, máy lạnh và wifi.', 'hourly_rate' => 120000, 'nightly_rate' => 450000, 'max_guests' => 2],
                ['name' => 'Deluxe Garden', 'description' => 'Phòng có ban công nhỏ và mảng xanh thư giãn. Nội thất gỗ sáng, phòng tắm riêng và khu đọc sách.', 'hourly_rate' => 200000, 'nightly_rate' => 750000, 'max_guests' => 2],
                ['name' => 'Lake Breeze Suite', 'description' => 'Phòng suite yên tĩnh, phù hợp nghỉ cuối tuần quanh Hồ Tây. Có bồn tắm, sofa và không gian làm việc.', 'hourly_rate' => 380000, 'nightly_rate' => 1300000, 'max_guests' => 3],
                ['name' => 'Family Room', 'description' => 'Phòng gia đình rộng 55m², bố trí hai khu ngủ và bàn ăn nhỏ. Phù hợp nhóm 3-4 khách.', 'hourly_rate' => 300000, 'nightly_rate' => 950000, 'max_guests' => 4],
            ],
            // Nguyễn Chí Thanh - trục trung tâm
            "Duly's House Nguyễn Chí Thanh" => [
                ['name' => 'Standard', 'description' => 'Phòng tiêu chuẩn ấm cúng, phù hợp khách công tác hoặc cặp đôi. Có giường đôi, tủ đồ và bàn làm việc.', 'hourly_rate' => 100000, 'nightly_rate' => 400000, 'max_guests' => 2],
                ['name' => 'Deluxe Avenue View', 'description' => 'Phòng cao cấp nhìn ra trục Nguyễn Chí Thanh, có ban công nhỏ, bàn trà và phòng tắm riêng.', 'hourly_rate' => 180000, 'nightly_rate' => 650000, 'max_guests' => 2],
                ['name' => 'Penthouse', 'description' => 'Phòng tầng cao có khu bếp nhỏ, sofa và không gian sinh hoạt riêng. Phù hợp gia đình hoặc nhóm nhỏ.', 'hourly_rate' => 350000, 'nightly_rate' => 1200000, 'max_guests' => 4],
                ['name' => 'Dorm (4 giường)', 'description' => 'Phòng tập thể 4 giường tầng, phù hợp nhóm bạn lưu trú tiết kiệm. Có tủ locker riêng và phòng tắm chung.', 'hourly_rate' => 50000, 'nightly_rate' => 180000, 'max_guests' => 4],
            ],
            // Yên Hoa - Cầu Giấy
            "Duly's House Yên Hoa" => [
                ['name' => 'Studio Garden', 'description' => 'Studio riêng tư, có góc bếp nhỏ và bàn ăn. Phù hợp khách lưu trú ngắn ngày tại khu Cầu Giấy.', 'hourly_rate' => 250000, 'nightly_rate' => 800000, 'max_guests' => 2],
                ['name' => 'Studio Balcony', 'description' => 'Studio có ban công, ánh sáng tốt và khu làm việc riêng. Phù hợp khách cần không gian yên tĩnh.', 'hourly_rate' => 400000, 'nightly_rate' => 1400000, 'max_guests' => 2],
                ['name' => 'Two-Bedroom Suite', 'description' => 'Căn suite 2 phòng ngủ, phòng khách và bếp đầy đủ. Phù hợp nhóm bạn hoặc gia đình tối đa 4 khách.', 'hourly_rate' => 700000, 'nightly_rate' => 2500000, 'max_guests' => 4],
                ['name' => 'Family Studio', 'description' => 'Studio gia đình rộng 60m², 1 giường đôi và 2 giường đơn. Có khu bếp nhỏ và bàn ăn.', 'hourly_rate' => 350000, 'nightly_rate' => 1100000, 'max_guests' => 4],
            ],
            // Long Biên - không gian rộng hơn
            "Duly's House Long Biên" => [
                ['name' => 'Standard Green', 'description' => 'Phòng tiêu chuẩn yên tĩnh, phù hợp 1-2 khách. Nội thất sáng, giường đôi và khu để hành lý rộng.', 'hourly_rate' => 80000, 'nightly_rate' => 350000, 'max_guests' => 2],
                ['name' => 'Deluxe River View', 'description' => 'Phòng có cửa sổ lớn, không gian thoáng và khu làm việc riêng. Phù hợp nghỉ dài ngày tại Long Biên.', 'hourly_rate' => 150000, 'nightly_rate' => 600000, 'max_guests' => 2],
                ['name' => 'Private Studio', 'description' => 'Studio riêng có bếp nhỏ, sofa và bàn ăn. Phù hợp khách cần tự do sinh hoạt như ở nhà.', 'hourly_rate' => 60000, 'nightly_rate' => 250000, 'max_guests' => 3],
                ['name' => 'Family Loft', 'description' => 'Phòng gác mái rộng 40m², có 2 giường đôi, bếp chung và không gian sinh hoạt cho gia đình nhỏ.', 'hourly_rate' => 200000, 'nightly_rate' => 700000, 'max_guests' => 4],
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
