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
                'name' => "Duly's House Đội Cấn",
                'slug' => 'dulys-house-doi-can',
                'address' => 'Đội Cấn, Ba Đình, Hà Nội',
                'hotline' => '024 1234 567',
                'description' => 'Cơ sở Đội Cấn nằm gần khu Ba Đình, thuận tiện di chuyển đến Lăng Bác, Hồ Tây và các điểm ăn uống trung tâm. Phù hợp cho khách công tác, cặp đôi và nhóm nhỏ muốn ở khu yên tĩnh.',
                'thumbnail' => 'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Âu Cơ",
                'slug' => 'dulys-house-au-co',
                'address' => 'Âu Cơ, Tây Hồ, Hà Nội',
                'hotline' => '024 9876 543',
                'description' => 'Cơ sở Âu Cơ gần Hồ Tây, phù hợp cho khách thích không gian thoáng, nhiều quán cà phê và di chuyển nhanh đến khu phố cổ. Phòng được bố trí sáng, gọn và dễ nghỉ ngơi.',
                'thumbnail' => 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Nguyễn Chí Thanh",
                'slug' => 'dulys-house-nguyen-chi-thanh',
                'address' => 'Nguyễn Chí Thanh, Đống Đa, Hà Nội',
                'hotline' => '024 8888 999',
                'description' => 'Cơ sở Nguyễn Chí Thanh nằm trên trục đường lớn, dễ kết nối Ba Đình, Đống Đa và Cầu Giấy. Không gian phù hợp cho khách công tác hoặc gia đình cần vị trí trung tâm.',
                'thumbnail' => 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Yên Hoa",
                'slug' => 'dulys-house-yen-hoa',
                'address' => 'Yên Hoa, Cầu Giấy, Hà Nội',
                'hotline' => '024 3333 456',
                'description' => 'Cơ sở Yên Hoa gần khu Cầu Giấy và các tuyến đường chính, thuận tiện cho khách đi học, đi làm hoặc lưu trú ngắn ngày. Không gian ưu tiên sự riêng tư và thao tác đặt phòng nhanh.',
                'thumbnail' => 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
            ],
            [
                'name' => "Duly's House Long Biên",
                'slug' => 'dulys-house-long-bien',
                'address' => 'Long Biên, Hà Nội',
                'hotline' => '024 6666 789',
                'description' => 'Cơ sở Long Biên phù hợp cho khách cần không gian rộng, dễ đi sang phố cổ qua cầu Chương Dương hoặc cầu Long Biên. Đây là lựa chọn tốt cho nhóm bạn và gia đình nhỏ.',
                'thumbnail' => 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80',
                'is_active' => true,
            ],
        ];

        foreach ($homestays as $data) {
            Homestay::create($data);
        }
    }
}
